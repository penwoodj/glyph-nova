/**
 * Ollama CLI Service
 *
 * Service for executing Ollama CLI commands from Node.js.
 * Provides command validation, execution, and output parsing.
 *
 * Security: Uses execFile (not exec) to prevent shell injection attacks.
 * Reference: Report 05 (Security Practices), Report 07 (Implementation Guide)
 */

import { execFile, spawn, type ChildProcess } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

// Allowed commands whitelist - prevents arbitrary command execution
const ALLOWED_COMMANDS = ['list', 'show', 'run', 'generate', 'pull', 'ps', 'stop', 'rm'] as const
type AllowedCommand = typeof ALLOWED_COMMANDS[number]

// Types
export interface OllamaModel {
  name: string
  modified_at: string
  size: number
  digest: string
}

export interface OllamaCommandResult {
  success: boolean
  stdout: string
  stderr: string
  exitCode: number
}

export interface OllamaError {
  type: 'model_not_found' | 'connection_error' | 'invalid_command' |
        'pull_failed' | 'generation_error' | 'timeout' | 'not_installed' | 'unknown'
  message: string
  originalError: string
  model?: string
  suggestion?: string
}

/**
 * Ollama CLI Service Class
 *
 * Handles all Ollama CLI command execution with proper validation,
 * error handling, and security measures.
 */
export class OllamaCLIService {
  /**
   * Validate that a command is in the allowlist
   * skipValidation parameter allows bypassing argument validation for prompts
   */
  private validateCommand(command: string, args: string[], skipArgValidation: boolean = false): void {
    // Check command is allowed
    if (!ALLOWED_COMMANDS.includes(command as AllowedCommand)) {
      throw new Error(`Command '${command}' is not allowed. Allowed commands: ${ALLOWED_COMMANDS.join(', ')}`)
    }

    // Skip argument validation if requested (e.g., for prompts)
    if (skipArgValidation) {
      return
    }

    // Validate arguments don't contain dangerous characters
    for (const arg of args) {
      // Allow alphanumeric, colons, hyphens, underscores, periods, slashes
      if (!/^[a-zA-Z0-9:_.\/-]+$/.test(arg)) {
        throw new Error(`Invalid argument: '${arg}'. Arguments must be alphanumeric with colons, hyphens, underscores, periods, or slashes only.`)
      }
    }
  }

  /**
   * Validate model name format
   */
  private validateModelName(name: string): boolean {
    // Model names should be alphanumeric with optional colons, hyphens, underscores
    // Examples: llama2, llama2:7b, mistral:7b-instruct
    return /^[a-zA-Z0-9][a-zA-Z0-9:_-]*[a-zA-Z0-9]$/.test(name)
  }

  /**
   * Parse Ollama error output to provide user-friendly error messages
   */
  private parseError(stderr: string, command: string, args: string[]): OllamaError {
    const error: OllamaError = {
      type: 'unknown',
      message: stderr.trim() || 'Command execution failed',
      originalError: stderr,
    }

    const stderrLower = stderr.toLowerCase()

    // Check for specific error patterns
    if (stderrLower.includes('not found') || stderrLower.includes('model') && stderrLower.includes('not found')) {
      error.type = 'model_not_found'
      const match = stderr.match(/model ['"]?([^'"]+)['"]? not found/i)
      if (match) {
        error.model = match[1]
        error.message = `Model '${error.model}' not found. Try pulling it first.`
        error.suggestion = `Run: ollama pull ${error.model}`
      } else if (args[0]) {
        error.model = args[0]
        error.message = `Model '${error.model}' not found. Try pulling it first.`
        error.suggestion = `Run: ollama pull ${error.model}`
      }
    } else if (stderrLower.includes('connection refused') || stderrLower.includes('dial tcp')) {
      error.type = 'connection_error'
      error.message = 'Cannot connect to Ollama server. Is Ollama running?'
      error.suggestion = 'Start Ollama service: ollama serve'
    } else if (stderrLower.includes('unknown command')) {
      error.type = 'invalid_command'
      error.message = `Unknown command: ${command}`
    } else if (command === 'pull' && stderrLower.includes('error')) {
      error.type = 'pull_failed'
      error.message = `Failed to pull model: ${args[0] || 'unknown'}`
      error.model = args[0]
    } else if (stderrLower.includes('timeout')) {
      error.type = 'timeout'
      error.message = 'Command execution timed out'
    }

    return error
  }

  /**
   * Parse `ollama list` output to extract model information
   */
  private parseListOutput(output: string): OllamaModel[] {
    const lines = output.trim().split('\n')
    if (lines.length < 2) {
      // No models or invalid output
      return []
    }

    const models: OllamaModel[] = []

    // Skip header line (first line)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Parse whitespace-separated values
      // Format: NAME    ID      SIZE    MODIFIED
      const parts = line.split(/\s+/)
      if (parts.length >= 4) {
        // Extract name, ID (becomes digest), size, and modified date
        const name = parts[0]
        const id = parts[1]
        const sizeStr = parts[2]
        const sizeUnit = parts[3] // "GB", "MB", etc
        const modified = parts.slice(4).join(' ')

        // Parse size (e.g., "3.8" with unit "GB" -> bytes)
        let sizeBytes = 0
        const sizeValue = parseFloat(sizeStr)
        if (!isNaN(sizeValue) && sizeUnit) {
          const unit = sizeUnit.toUpperCase()
          const multipliers: Record<string, number> = {
            'B': 1,
            'KB': 1024,
            'MB': 1024 * 1024,
            'GB': 1024 * 1024 * 1024,
            'TB': 1024 * 1024 * 1024 * 1024,
          }
          sizeBytes = Math.floor(sizeValue * (multipliers[unit] || 1))
        }

        models.push({
          name,
          modified_at: modified || '',
          size: sizeBytes,
          digest: id,
        })
      }
    }

    return models
  }

  /**
   * Execute Ollama CLI command
   *
   * Security: Uses execFile (not exec) to prevent shell injection.
   * All commands and arguments are validated before execution.
   *
   * @param skipArgValidation - Set to true for commands like 'run' where the last arg is a user prompt
   */
  async executeCommand(
    command: string,
    args: string[] = [],
    timeoutMs: number = 30000,
    skipArgValidation: boolean = false
  ): Promise<OllamaCommandResult> {
    // Validate command and arguments
    this.validateCommand(command, args, skipArgValidation)

    try {
      const { stdout, stderr } = await execFileAsync(
        'ollama',
        [command, ...args],
        {
          timeout: timeoutMs,
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          env: {
            PATH: process.env.PATH || '',
            HOME: process.env.HOME || '',
            // Explicitly omit other environment variables for security
          }
        }
      )

      return {
        success: true,
        stdout: stdout.toString().trim(),
        stderr: stderr.toString().trim(),
        exitCode: 0
      }
    } catch (error: any) {
      // Handle specific error cases
      if (error.code === 'ENOENT') {
        const installError: OllamaError = {
          type: 'not_installed',
          message: 'Ollama is not installed or not in PATH',
          originalError: error.message,
          suggestion: 'Install Ollama from https://ollama.ai'
        }
        throw installError
      }

      if (error.killed || error.signal === 'SIGTERM') {
        const timeoutError: OllamaError = {
          type: 'timeout',
          message: `Command timed out after ${timeoutMs}ms`,
          originalError: error.message,
          suggestion: 'Try increasing the timeout or check if Ollama is responding'
        }
        throw timeoutError
      }

      // Return failure result with error information
      return {
        success: false,
        stdout: error.stdout?.toString() || '',
        stderr: error.stderr?.toString() || error.message,
        exitCode: error.code || 1
      }
    }
  }

  /**
   * List all available Ollama models via CLI
   */
  async listModelsCLI(): Promise<OllamaModel[]> {
    const result = await this.executeCommand('list', [], 10000)

    if (!result.success) {
      const parsedError = this.parseError(result.stderr, 'list', [])
      throw new Error(parsedError.message)
    }

    return this.parseListOutput(result.stdout)
  }

  /**
   * Show details about a specific model
   */
  async showModel(model: string): Promise<string> {
    if (!this.validateModelName(model)) {
      throw new Error(`Invalid model name: ${model}`)
    }

    const result = await this.executeCommand('show', [model], 10000)

    if (!result.success) {
      const parsedError = this.parseError(result.stderr, 'show', [model])
      throw new Error(parsedError.message)
    }

    return result.stdout
  }

  /**
   * Generate a response from a model with a prompt
   */
  async generateResponse(model: string, prompt: string, timeoutMs: number = 60000): Promise<string> {
    if (!this.validateModelName(model)) {
      throw new Error(`Invalid model name: ${model}`)
    }

    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty')
    }

    const result = await this.executeCommand('run', [model, prompt], timeoutMs)

    if (!result.success) {
      const parsedError = this.parseError(result.stderr, 'run', [model, prompt])
      throw new Error(parsedError.message)
    }

    return result.stdout
  }

  /**
   * Stream model generation output (for long-running commands)
   *
   * Uses spawn instead of execFile to get real-time output.
   */
  streamGenerate(
    model: string,
    prompt: string,
    onChunk: (chunk: string) => void,
    onError: (error: Error) => void,
    onComplete: (exitCode: number | null) => void
  ): ChildProcess {
    if (!this.validateModelName(model)) {
      onError(new Error(`Invalid model name: ${model}`))
      throw new Error(`Invalid model name: ${model}`)
    }

    const child = spawn('ollama', ['run', model, prompt], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        PATH: process.env.PATH || '',
        HOME: process.env.HOME || '',
      }
    })

    child.stdout?.on('data', (data: Buffer) => {
      const chunk = data.toString()
      onChunk(chunk)
    })

    child.stderr?.on('data', (data: Buffer) => {
      const chunk = data.toString()
      // Also stream stderr (might contain progress or error info)
      onChunk(chunk)
    })

    child.on('error', (error) => {
      if ((error as any).code === 'ENOENT') {
        onError(new Error('Ollama is not installed or not in PATH'))
      } else {
        onError(error)
      }
    })

    child.on('close', (code) => {
      onComplete(code)
    })

    return child
  }

  /**
   * Check if Ollama CLI is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.executeCommand('list', [], 5000)
      return true
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const ollamaCLI = new OllamaCLIService()
