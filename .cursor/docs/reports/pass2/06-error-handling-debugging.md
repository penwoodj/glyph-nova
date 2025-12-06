# Error Handling and Debugging Strategies

## Overview

This document provides comprehensive strategies for handling errors and debugging issues when executing Ollama commands from your RedwoodJS/Tauri application. It covers error types, debugging techniques, logging strategies, and troubleshooting workflows.

## Document Navigation

**Related Documents:**
- **[Tauri Command Execution Fundamentals](./01-tauri-command-execution-fundamentals.md)** - Basic error handling in Tauri commands
- **[Rust Process Execution Patterns](./02-rust-process-execution-patterns.md)** - Rust-specific error handling patterns
- **[GraphQL-Tauri Integration](./03-graphql-tauri-integration.md)** - Error handling in GraphQL resolvers
- **[Ollama CLI Command Reference](./04-ollama-cli-command-reference.md)** - Ollama-specific error patterns and parsing
- **[Security and Permissions](./05-security-permissions-command-execution.md)** - Security event logging
- **[Practical Implementation Guide](./07-practical-implementation-guide.md)** - Troubleshooting workflow and debugging practices

## Error Categories

### 1. Command Execution Errors

**Types**:
- Process spawn failures
- Command not found
- Permission denied
- Timeout errors
- Process killed/interrupted

**Rust Error Handling**:
```rust
use std::process::Command;
use std::io;

#[derive(Debug)]
pub enum CommandError {
    NotFound(String),
    PermissionDenied,
    ExecutionFailed(String),
    Timeout,
    InvalidOutput(String),
    Unknown(io::Error),
}

impl std::fmt::Display for CommandError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            CommandError::NotFound(cmd) => write!(f, "Command not found: {}", cmd),
            CommandError::PermissionDenied => write!(f, "Permission denied"),
            CommandError::ExecutionFailed(msg) => write!(f, "Execution failed: {}", msg),
            CommandError::Timeout => write!(f, "Command execution timed out"),
            CommandError::InvalidOutput(msg) => write!(f, "Invalid output: {}", msg),
            CommandError::Unknown(e) => write!(f, "Unknown error: {}", e),
        }
    }
}

impl std::error::Error for CommandError {}

fn execute_ollama_command(
    command: &str,
    args: &[String]
) -> Result<String, CommandError> {
    let output = Command::new("ollama")
        .arg(command)
        .args(args)
        .output()
        .map_err(|e| {
            match e.kind() {
                io::ErrorKind::NotFound => CommandError::NotFound("ollama".to_string()),
                io::ErrorKind::PermissionDenied => CommandError::PermissionDenied,
                _ => CommandError::Unknown(e),
            }
        })?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(CommandError::ExecutionFailed(stderr.to_string()));
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
```

**TypeScript Error Handling**:
```typescript
import { execFile, ExecException } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export class CommandExecutionError extends Error {
  constructor(
    message: string,
    public readonly exitCode: number | null,
    public readonly stdout: string,
    public readonly stderr: string,
    public readonly command: string,
    public readonly args: string[]
  ) {
    super(message);
    this.name = 'CommandExecutionError';
  }
}

export class CommandNotFoundError extends Error {
  constructor(public readonly command: string) {
    super(`Command not found: ${command}`);
    this.name = 'CommandNotFoundError';
  }
}

export class CommandTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`Command execution timed out after ${timeoutMs}ms`);
    this.name = 'CommandTimeoutError';
  }
}

async function executeOllamaCommand(
  command: string,
  args: string[] = [],
  timeoutMs: number = 30000
): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const { stdout, stderr } = await execFileAsync(
        'ollama',
        [command, ...args],
        {
          signal: controller.signal,
          timeout: timeoutMs,
          maxBuffer: 1024 * 1024, // 1MB
        }
      );

      clearTimeout(timeoutId);
      return stdout;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.code === 'ENOENT') {
        throw new CommandNotFoundError('ollama');
      }

      if (error.signal === 'SIGTERM' || error.name === 'AbortError') {
        throw new CommandTimeoutError(timeoutMs);
      }

      throw new CommandExecutionError(
        `Failed to execute ollama ${command}`,
        error.code || null,
        error.stdout || '',
        error.stderr || error.message,
        command,
        args
      );
    }
  } catch (error) {
    if (error instanceof CommandNotFoundError ||
        error instanceof CommandTimeoutError ||
        error instanceof CommandExecutionError) {
      throw error;
    }
    throw new Error(`Unexpected error: ${error}`);
  }
}
```

### 2. Ollama-Specific Errors

**Error Types**:
- Model not found
- Connection refused (Ollama server not running)
- Invalid model name
- Model pull failures
- Generation errors

**Error Parser**:
```typescript
export interface OllamaError {
  type: 'model_not_found' | 'connection_error' | 'invalid_command' |
        'pull_failed' | 'generation_error' | 'unknown';
  message: string;
  originalError: string;
  model?: string;
  suggestion?: string;
}

export function parseOllamaError(
  stderr: string,
  command: string,
  args: string[] = []
): OllamaError {
  const error: OllamaError = {
    type: 'unknown',
    message: stderr.trim(),
    originalError: stderr,
  };

  // Model not found
  if (stderr.includes('not found') || stderr.includes('model') && stderr.includes('not found')) {
    error.type = 'model_not_found';
    const modelMatch = stderr.match(/model ['"]([^'"]+)['"] not found/i);
    if (modelMatch) {
      error.model = modelMatch[1];
      error.message = `Model '${error.model}' not found. Try pulling it first with: ollama pull ${error.model}`;
      error.suggestion = `Run: ollama pull ${error.model}`;
    }
  }

  // Connection error
  else if (stderr.includes('connection refused') ||
           stderr.includes('dial tcp') ||
           stderr.includes('connect: connection refused')) {
    error.type = 'connection_error';
    error.message = 'Cannot connect to Ollama server. Is Ollama running?';
    error.suggestion = 'Start Ollama service: ollama serve (or check if it\'s running as a service)';
  }

  // Invalid command
  else if (stderr.includes('unknown command')) {
    error.type = 'invalid_command';
    const cmdMatch = stderr.match(/unknown command ['"]([^'"]+)['"]/i);
    if (cmdMatch) {
      error.message = `Unknown Ollama command: ${cmdMatch[1]}`;
    }
  }

  // Pull failed
  else if (command === 'pull' && stderr.includes('error') || stderr.includes('failed')) {
    error.type = 'pull_failed';
    error.message = `Failed to pull model: ${args[0] || 'unknown'}`;
    error.model = args[0];
    error.suggestion = 'Check your internet connection and try again';
  }

  // Generation error
  else if (command === 'generate' && stderr.includes('error')) {
    error.type = 'generation_error';
    error.message = `Failed to generate response: ${stderr}`;
    error.model = args[0];
  }

  return error;
}
```

### 3. Parsing and Output Errors

**Error Types**:
- Invalid JSON
- Malformed output
- Unexpected format
- Encoding issues

**Output Validation**:
```typescript
export class OutputParseError extends Error {
  constructor(
    message: string,
    public readonly output: string,
    public readonly expectedFormat: string
  ) {
    super(message);
    this.name = 'OutputParseError';
  }
}

function parseOllamaList(output: string): OllamaModel[] {
  if (!output || output.trim().length === 0) {
    return [];
  }

  const lines = output.trim().split('\n');
  if (lines.length < 2) {
    throw new OutputParseError(
      'Expected at least header and one model line',
      output,
      'HEADER\nMODEL_LINE...'
    );
  }

  const models: OllamaModel[] = [];
  const header = lines[0];

  // Validate header format
  if (!header.includes('NAME') || !header.includes('ID')) {
    throw new OutputParseError(
      'Invalid header format',
      output,
      'NAME ID SIZE MODIFIED'
    );
  }

  // Parse model lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(/\s+/);
    if (parts.length < 4) {
      console.warn(`Skipping malformed line: ${line}`);
      continue;
    }

    models.push({
      name: parts[0],
      id: parts[1],
      size: parts[2],
      modified: parts.slice(3).join(' ')
    });
  }

  return models;
}
```

## Debugging Strategies

### 1. Comprehensive Logging

**Structured Logging Setup**:
```typescript
interface LogContext {
  command: string;
  args: string[];
  timestamp: string;
  duration?: number;
  userId?: string;
  requestId?: string;
}

class CommandLogger {
  private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';

  setLogLevel(level: 'debug' | 'info' | 'warn' | 'error') {
    this.logLevel = level;
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  logCommandStart(context: LogContext) {
    if (this.shouldLog('debug')) {
      console.log('[COMMAND_START]', JSON.stringify({
        ...context,
        event: 'command_start'
      }));
    }
  }

  logCommandSuccess(context: LogContext & { stdout: string }) {
    if (this.shouldLog('info')) {
      console.log('[COMMAND_SUCCESS]', JSON.stringify({
        ...context,
        event: 'command_success',
        outputLength: context.stdout.length
      }));
    }
  }

  logCommandError(
    context: LogContext & {
      error: Error;
      stderr?: string;
      exitCode?: number;
    }
  ) {
    if (this.shouldLog('error')) {
      console.error('[COMMAND_ERROR]', JSON.stringify({
        ...context,
        event: 'command_error',
        errorType: context.error.constructor.name,
        errorMessage: context.error.message,
        stderr: context.stderr,
        exitCode: context.exitCode,
        stack: context.error.stack
      }));
    }
  }

  logDebug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      console.debug('[DEBUG]', message, data ? JSON.stringify(data) : '');
    }
  }
}
```

**Rust Logging**:
```rust
use log::{debug, info, warn, error};

fn execute_with_logging(command: &str, args: &[String]) -> Result<String, CommandError> {
    debug!("Executing command: ollama {} {:?}", command, args);

    let start = std::time::Instant::now();

    match execute_ollama_command(command, args) {
        Ok(output) => {
            let duration = start.elapsed();
            info!(
                "Command succeeded in {:?}: ollama {}",
                duration, command
            );
            debug!("Output length: {} bytes", output.len());
            Ok(output)
        }
        Err(e) => {
            let duration = start.elapsed();
            error!(
                "Command failed after {:?}: ollama {} - {}",
                duration, command, e
            );
            Err(e)
        }
    }
}
```

### 2. Debug Mode

**Enable Debug Mode**:
```typescript
export class OllamaCLIDebugger {
  private debugMode: boolean = false;
  private logger: CommandLogger;

  constructor(logger: CommandLogger) {
    this.logger = logger;
  }

  enableDebugMode() {
    this.debugMode = true;
    this.logger.setLogLevel('debug');
    console.log('[DEBUG MODE ENABLED]');
  }

  disableDebugMode() {
    this.debugMode = false;
    this.logger.setLogLevel('info');
  }

  async executeWithDebug(
    command: string,
    args: string[] = []
  ): Promise<{ result: string; debugInfo: DebugInfo }> {
    const debugInfo: DebugInfo = {
      command: `ollama ${command} ${args.join(' ')}`,
      args,
      startTime: new Date().toISOString(),
      environment: {
        PATH: process.env.PATH,
        OLLAMA_HOST: process.env.OLLAMA_HOST,
        OLLAMA_MODELS: process.env.OLLAMA_MODELS,
      },
      processInfo: {
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version,
      }
    };

    this.logger.logDebug('Command execution starting', debugInfo);

    try {
      const startTime = Date.now();
      const result = await executeOllamaCommand(command, args);
      const endTime = Date.now();

      debugInfo.endTime = new Date().toISOString();
      debugInfo.duration = endTime - startTime;
      debugInfo.success = true;
      debugInfo.outputLength = result.length;

      this.logger.logDebug('Command execution completed', debugInfo);

      return { result, debugInfo };
    } catch (error: any) {
      debugInfo.endTime = new Date().toISOString();
      debugInfo.success = false;
      debugInfo.error = {
        name: error.constructor.name,
        message: error.message,
        stack: error.stack,
      };

      if (error instanceof CommandExecutionError) {
        debugInfo.error.exitCode = error.exitCode;
        debugInfo.error.stdout = error.stdout;
        debugInfo.error.stderr = error.stderr;
      }

      this.logger.logDebug('Command execution failed', debugInfo);
      throw error;
    }
  }
}

interface DebugInfo {
  command: string;
  args: string[];
  startTime: string;
  endTime?: string;
  duration?: number;
  success?: boolean;
  outputLength?: number;
  environment: {
    PATH?: string;
    OLLAMA_HOST?: string;
    OLLAMA_MODELS?: string;
  };
  processInfo: {
    pid: number;
    platform: string;
    nodeVersion: string;
  };
  error?: {
    name: string;
    message: string;
    stack?: string;
    exitCode?: number | null;
    stdout?: string;
    stderr?: string;
  };
}
```

### 3. Health Checks and Diagnostics

**Diagnostic Function**:
```typescript
export interface DiagnosticResult {
  ollamaInstalled: boolean;
  ollamaPath?: string;
  ollamaVersion?: string;
  ollamaServerRunning: boolean;
  serverUrl?: string;
  availableModels: string[];
  errors: string[];
}

export async function runDiagnostics(): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    ollamaInstalled: false,
    ollamaServerRunning: false,
    availableModels: [],
    errors: [],
  };

  // Check if ollama is installed
  try {
    const { stdout } = await execFileAsync('which', ['ollama']);
    result.ollamaInstalled = true;
    result.ollamaPath = stdout.trim();
  } catch (error) {
    result.errors.push('Ollama is not installed or not in PATH');
    return result;
  }

  // Check ollama version
  try {
    const { stdout } = await execFileAsync('ollama', ['--version']);
    result.ollamaVersion = stdout.trim();
  } catch (error) {
    result.errors.push('Could not determine Ollama version');
  }

  // Check if Ollama server is running
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    result.ollamaServerRunning = response.ok;
    result.serverUrl = 'http://localhost:11434';
  } catch (error) {
    result.errors.push('Ollama server is not running or not accessible');
  }

  // List available models
  try {
    const models = await listModels();
    result.availableModels = models.map(m => m.name);
  } catch (error: any) {
    result.errors.push(`Could not list models: ${error.message}`);
  }

  return result;
}
```

## Error Recovery Strategies

### 1. Retry Logic

```typescript
interface RetryOptions {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  retryableErrors: (error: Error) => boolean;
}

async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    retryableErrors: (error) => {
      // Retry on connection errors and timeouts
      return error instanceof CommandTimeoutError ||
             (error instanceof CommandExecutionError &&
              error.message.includes('connection'));
    }
  }
): Promise<T> {
  let lastError: Error;
  let delay = options.retryDelay;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (attempt === options.maxRetries) {
        break;
      }

      if (!options.retryableErrors(error)) {
        throw error;
      }

      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));

      if (options.exponentialBackoff) {
        delay *= 2;
      }
    }
  }

  throw lastError!;
}
```

### 2. Fallback Strategies

```typescript
async function listModelsWithFallback(): Promise<OllamaModel[]> {
  // Try CLI first
  try {
    return await listModelsViaCLI();
  } catch (cliError) {
    console.warn('CLI method failed, trying HTTP API:', cliError);

    // Fallback to HTTP API
    try {
      return await listModelsViaHTTP();
    } catch (httpError) {
      console.error('Both CLI and HTTP methods failed');
      throw new Error(
        `Failed to list models: CLI error: ${cliError}, HTTP error: ${httpError}`
      );
    }
  }
}
```

## Troubleshooting Workflow

### Step-by-Step Debugging

```typescript
export async function troubleshootOllamaCommand(
  command: string,
  args: string[] = []
): Promise<TroubleshootingReport> {
  const report: TroubleshootingReport = {
    command: `ollama ${command} ${args.join(' ')}`,
    steps: [],
    resolution: null,
  };

  // Step 1: Check if ollama is installed
  report.steps.push({
    step: 'Check Ollama installation',
    status: 'checking',
  });

  try {
    await execFileAsync('which', ['ollama']);
    report.steps[0].status = 'passed';
    report.steps[0].details = 'Ollama is installed';
  } catch {
    report.steps[0].status = 'failed';
    report.steps[0].details = 'Ollama is not installed or not in PATH';
    report.resolution = 'Install Ollama: https://ollama.ai';
    return report;
  }

  // Step 2: Check Ollama server
  report.steps.push({
    step: 'Check Ollama server',
    status: 'checking',
  });

  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.ok) {
      report.steps[1].status = 'passed';
      report.steps[1].details = 'Ollama server is running';
    } else {
      report.steps[1].status = 'failed';
      report.steps[1].details = `Server returned status ${response.status}`;
    }
  } catch (error: any) {
    report.steps[1].status = 'failed';
    report.steps[1].details = `Cannot connect: ${error.message}`;
    report.resolution = 'Start Ollama server: ollama serve';
    return report;
  }

  // Step 3: Validate command
  report.steps.push({
    step: 'Validate command',
    status: 'checking',
  });

  const validation = validateOllamaCommand(command, args);
  if (!validation.valid) {
    report.steps[2].status = 'failed';
    report.steps[2].details = validation.error;
    report.resolution = validation.error;
    return report;
  }
  report.steps[2].status = 'passed';

  // Step 4: Execute command
  report.steps.push({
    step: 'Execute command',
    status: 'checking',
  });

  try {
    const result = await executeOllamaCommand(command, args);
    report.steps[3].status = 'passed';
    report.steps[3].details = `Command succeeded (output: ${result.length} bytes)`;
    report.resolution = 'Command executed successfully';
  } catch (error: any) {
    report.steps[3].status = 'failed';
    report.steps[3].details = error.message;
    report.resolution = parseOllamaError(
      error.stderr || error.message,
      command,
      args
    ).suggestion || 'Check error details above';
  }

  return report;
}

interface TroubleshootingReport {
  command: string;
  steps: Array<{
    step: string;
    status: 'checking' | 'passed' | 'failed';
    details?: string;
  }>;
  resolution: string | null;
}
```

## Best Practices

1. **Always catch and handle errors** - Never let unhandled promise rejections occur
2. **Provide meaningful error messages** - Include context about what failed and why
3. **Log comprehensively** - Include command, args, timing, and full error details
4. **Implement retry logic** - For transient errors like network issues
5. **Use structured error types** - Makes error handling and debugging easier
6. **Validate input early** - Catch errors before command execution
7. **Implement health checks** - Proactively detect issues
8. **Provide diagnostic tools** - Help users troubleshoot issues themselves
9. **Document error scenarios** - Help developers understand what can go wrong
10. **Test error paths** - Ensure error handling works correctly

## References

**External Resources:**
- [Node.js Error Handling Best Practices](https://nodejs.org/api/errors.html)
- [Rust Error Handling](https://doc.rust-lang.org/book/ch09-00-error-handling.html)
- [Tauri Error Handling](https://tauri.app/v1/guides/features/error-handling)

**Related Documents:**
- **[Tauri Command Execution Fundamentals](./01-tauri-command-execution-fundamentals.md)** - Basic error handling patterns in Tauri
- **[Rust Process Execution Patterns](./02-rust-process-execution-patterns.md)** - Rust error handling for process execution
- **[GraphQL-Tauri Integration](./03-graphql-tauri-integration.md)** - Error handling in GraphQL resolvers
- **[Ollama CLI Command Reference](./04-ollama-cli-command-reference.md)** - Ollama-specific error patterns and parsing
- **[Security and Permissions](./05-security-permissions-command-execution.md)** - Security event logging and error tracking
- **[Practical Implementation Guide](./07-practical-implementation-guide.md)** - Troubleshooting workflows and debugging practices
