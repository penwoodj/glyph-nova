# Ollama CLI Command Reference and Output Parsing

## Overview

This document provides a comprehensive reference for Ollama CLI commands that can be executed from your RedwoodJS/Tauri application, along with strategies for parsing and handling their output.

## Document Navigation

**Related Documents:**
- **[Tauri Command Execution Fundamentals](./01-tauri-command-execution-fundamentals.md)** - How to execute commands from Tauri
- **[Rust Process Execution Patterns](./02-rust-process-execution-patterns.md)** - Rust patterns for executing and parsing Ollama commands
- **[GraphQL-Tauri Integration](./03-graphql-tauri-integration.md)** - How to execute these commands from GraphQL resolvers
- **[Security and Permissions](./05-security-permissions-command-execution.md)** - Security practices for executing Ollama commands
- **[Error Handling and Debugging](./06-error-handling-debugging.md)** - Handling Ollama-specific errors
- **[Practical Implementation Guide](./07-practical-implementation-guide.md)** - Complete implementation using these commands

## Core Ollama Commands

### 1. `ollama list`

**Purpose**: List all available models on the system.

**Command**: `ollama list`

**Output Format**:
```
NAME              ID              SIZE    MODIFIED
llama2:7b         abc123def456    3.8 GB  2 weeks ago
mistral:latest    def789ghi012    4.1 GB  3 days ago
codellama:13b     ghi345jkl678    7.2 GB  1 week ago
```

**Parsing Strategy**:
```typescript
interface OllamaModel {
  name: string;
  id: string;
  size: string;
  modified: string;
}

function parseOllamaList(output: string): OllamaModel[] {
  const lines = output.trim().split('\n');
  if (lines.length < 2) return []; // Header + at least one model

  const models: OllamaModel[] = [];
  // Skip header line (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split by whitespace, but handle model names with colons
    const parts = line.split(/\s+/);
    if (parts.length >= 4) {
      models.push({
        name: parts[0],
        id: parts[1],
        size: parts[2],
        modified: parts.slice(3).join(' ') // "2 weeks ago" may have spaces
      });
    }
  }
  return models;
}
```

**Rust Parsing Example**:
```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaModel {
    pub name: String,
    pub id: String,
    pub size: String,
    pub modified: String,
}

fn parse_ollama_list(output: &str) -> Vec<OllamaModel> {
    let lines: Vec<&str> = output.trim().lines().collect();
    if lines.len() < 2 {
        return Vec::new();
    }

    lines[1..]
        .iter()
        .filter_map(|line| {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 4 {
                Some(OllamaModel {
                    name: parts[0].to_string(),
                    id: parts[1].to_string(),
                    size: parts[2].to_string(),
                    modified: parts[3..].join(" "),
                })
            } else {
                None
            }
        })
        .collect()
}
```

### 2. `ollama show <model>`

**Purpose**: Show detailed information about a specific model.

**Command**: `ollama show llama2:7b`

**Output Format**:
```
Modelfile:
FROM llama2:7b

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40

TEMPLATE """{{ .System }}

{{ .Prompt }}"""

SYSTEM You are a helpful assistant.

Details:
  format            gguf
  family            llama
  parameter_size    7B
  quantization_level Q4_0
```

**Parsing Strategy**:
```typescript
interface ModelDetails {
  modelfile: string;
  details: {
    format?: string;
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
    [key: string]: string | undefined;
  };
}

function parseOllamaShow(output: string): ModelDetails {
  const sections = output.split('\n\n');
  const result: ModelDetails = {
    modelfile: '',
    details: {}
  };

  let currentSection = '';
  for (const section of sections) {
    if (section.startsWith('Modelfile:')) {
      result.modelfile = section.replace('Modelfile:', '').trim();
    } else if (section.startsWith('Details:')) {
      const lines = section.split('\n').slice(1); // Skip "Details:" header
      for (const line of lines) {
        const match = line.match(/^\s+(\w+)\s+(.+)$/);
        if (match) {
          result.details[match[1]] = match[2].trim();
        }
      }
    }
  }

  return result;
}
```

### 3. `ollama run <model> <prompt>`

**Purpose**: Run a model with a prompt (interactive mode, not ideal for programmatic use).

**Command**: `ollama run llama2:7b "What is AI?"`

**Output Format**: Direct model response (streaming text).

**Note**: For programmatic use, prefer the HTTP API (`/api/chat`) or use `ollama generate` for non-interactive generation.

### 4. `ollama generate <model> <prompt>`

**Purpose**: Generate a response from a model non-interactively.

**Command**: `ollama generate llama2:7b "Explain quantum computing"`

**Output Format**:
```
>>> Explain quantum computing

Quantum computing is a type of computation that uses quantum mechanical
phenomena, such as superposition and entanglement, to perform operations
on data. Unlike classical computers that use bits (0 or 1), quantum
computers use quantum bits or "qubits" that can exist in multiple states
simultaneously...

>>>
```

**Parsing Strategy**:
```typescript
function parseOllamaGenerate(output: string): string {
  // Remove the prompt line (starts with ">>>")
  const lines = output.split('\n');
  const responseLines: string[] = [];
  let inResponse = false;

  for (const line of lines) {
    if (line.startsWith('>>>')) {
      inResponse = true;
      continue;
    }
    if (inResponse && line.trim() !== '') {
      responseLines.push(line);
    }
  }

  return responseLines.join('\n').trim();
}
```

### 5. `ollama pull <model>`

**Purpose**: Download a model from the Ollama registry.

**Command**: `ollama pull llama2:7b`

**Output Format** (streaming):
```
pulling manifest
pulling 8b8b23c8aaf8... 100% ▕████████████████▏ 3.8 GB
pulling 8e98efc3f3e1... 100% ▕████████████████▏ 1.1 KB
pulling 7c23fb36d801... 100% ▕████████████████▏  12 KB
verifying sha256 digest
writing manifest
success
```

**Parsing Strategy**:
```typescript
interface PullProgress {
  stage: 'manifest' | 'pulling' | 'verifying' | 'writing' | 'success' | 'error';
  progress?: {
    layer: string;
    percentage: number;
    size: string;
  };
  error?: string;
}

function parseOllamaPullLine(line: string): PullProgress | null {
  if (line.includes('pulling manifest')) {
    return { stage: 'manifest' };
  }

  // Match: "pulling abc123... 100% ▕████████████████▏ 3.8 GB"
  const pullMatch = line.match(/pulling\s+([a-f0-9]+)\.\.\.\s+(\d+)%\s+.*?\s+([\d.]+\s*[KMGT]?B)/i);
  if (pullMatch) {
    return {
      stage: 'pulling',
      progress: {
        layer: pullMatch[1],
        percentage: parseInt(pullMatch[2], 10),
        size: pullMatch[3]
      }
    };
  }

  if (line.includes('verifying sha256')) {
    return { stage: 'verifying' };
  }

  if (line.includes('writing manifest')) {
    return { stage: 'writing' };
  }

  if (line.includes('success')) {
    return { stage: 'success' };
  }

  if (line.includes('error') || line.includes('failed')) {
    return { stage: 'error', error: line };
  }

  return null;
}
```

### 6. `ollama ps`

**Purpose**: Show running models/processes.

**Command**: `ollama ps`

**Output Format**:
```
NAME              ID      SIZE    PID
llama2:7b         abc123  3.8 GB  12345
mistral:latest    def789  4.1 GB  12346
```

**Parsing Strategy**: Similar to `ollama list`, but includes PID.

### 7. `ollama stop <model>`

**Purpose**: Stop a running model.

**Command**: `ollama stop llama2:7b`

**Output Format**: Usually empty on success, or error message on failure.

### 8. `ollama rm <model>`

**Purpose**: Remove a model from local storage.

**Command**: `ollama rm llama2:7b`

**Output Format**: Usually empty on success, or error message on failure.

## Error Output Patterns

### Common Error Formats

**Model Not Found**:
```
Error: model 'nonexistent:model' not found, try pulling it first
```

**Connection Error**:
```
Error: Get "http://localhost:11434/api/tags": dial tcp 127.0.0.1:11434: connect: connection refused
```

**Permission Error**:
```
Error: permission denied
```

**Invalid Command**:
```
Error: unknown command "invalid" for "ollama"
```

**Parsing Error Handler**:
```typescript
interface OllamaError {
  type: 'model_not_found' | 'connection_error' | 'permission_error' | 'invalid_command' | 'unknown';
  message: string;
  originalOutput: string;
}

function parseOllamaError(stderr: string): OllamaError {
  const error: OllamaError = {
    type: 'unknown',
    message: stderr.trim(),
    originalOutput: stderr
  };

  if (stderr.includes('not found')) {
    error.type = 'model_not_found';
    const match = stderr.match(/model '([^']+)' not found/);
    if (match) {
      error.message = `Model '${match[1]}' not found. Try pulling it first.`;
    }
  } else if (stderr.includes('connection refused') || stderr.includes('dial tcp')) {
    error.type = 'connection_error';
    error.message = 'Cannot connect to Ollama server. Is Ollama running?';
  } else if (stderr.includes('permission denied')) {
    error.type = 'permission_error';
    error.message = 'Permission denied. Check file permissions and user access.';
  } else if (stderr.includes('unknown command')) {
    error.type = 'invalid_command';
    const match = stderr.match(/unknown command "([^"]+)"/);
    if (match) {
      error.message = `Unknown command: ${match[1]}`;
    }
  }

  return error;
}
```

## JSON Output Mode

Some Ollama commands support `--json` flag for structured output:

**Example**: `ollama list --json` (if supported)

**Output**:
```json
[
  {
    "name": "llama2:7b",
    "id": "abc123def456",
    "size": 3800000000,
    "modified": "2025-01-01T12:00:00Z"
  }
]
```

**Usage**:
```typescript
async function getModelsJson(): Promise<OllamaModel[]> {
  const { stdout } = await exec('ollama list --json');
  try {
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(`Failed to parse JSON output: ${error}`);
  }
}
```

## Streaming Output Handling

### Real-Time Parsing

For commands that produce streaming output (like `ollama generate` or `ollama pull`):

```typescript
import { spawn } from 'child_process';

async function* streamOllamaGenerate(
  model: string,
  prompt: string
): AsyncGenerator<string, void, unknown> {
  const process = spawn('ollama', ['generate', model, prompt]);

  let buffer = '';

  process.stdout.on('data', (chunk: Buffer) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.trim() && !line.startsWith('>>>')) {
        yield line;
      }
    }
  });

  process.stderr.on('data', (chunk: Buffer) => {
    // Handle errors
    const error = chunk.toString();
    throw new Error(`Ollama error: ${error}`);
  });

  return new Promise<void>((resolve, reject) => {
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}
```

## Command Validation

### Pre-Execution Checks

```typescript
async function validateOllamaCommand(
  command: string,
  args: string[]
): Promise<{ valid: boolean; error?: string }> {
  // Check if ollama is installed
  try {
    await exec('which ollama');
  } catch {
    return { valid: false, error: 'Ollama is not installed or not in PATH' };
  }

  // Check if command is allowed
  const allowedCommands = ['list', 'show', 'generate', 'pull', 'ps', 'stop', 'rm'];
  if (!allowedCommands.includes(command)) {
    return { valid: false, error: `Command '${command}' is not allowed` };
  }

  // Validate model names (if applicable)
  if (['show', 'generate', 'pull', 'stop', 'rm'].includes(command) && args.length > 0) {
    const modelName = args[0];
    if (!/^[a-zA-Z0-9:_-]+$/.test(modelName)) {
      return { valid: false, error: `Invalid model name: ${modelName}` };
    }
  }

  return { valid: true };
}
```

## Complete Service Example

```typescript
// api/src/services/ollama/ollama-cli.ts

import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface OllamaModel {
  name: string;
  id: string;
  size: string;
  modified: string;
}

export interface OllamaCommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class OllamaCLIService {
  /**
   * Execute an Ollama command and return structured result
   */
  async executeCommand(
    command: string,
    args: string[] = []
  ): Promise<OllamaCommandResult> {
    try {
      const { stdout, stderr } = await execAsync(
        `ollama ${command} ${args.join(' ')}`,
        { timeout: 30000 } // 30 second timeout
      );

      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0
      };
    } catch (error: any) {
      return {
        success: false,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.code || 1
      };
    }
  }

  /**
   * List all available models
   */
  async listModels(): Promise<OllamaModel[]> {
    const result = await this.executeCommand('list');
    if (!result.success) {
      throw new Error(`Failed to list models: ${result.stderr}`);
    }
    return this.parseListOutput(result.stdout);
  }

  /**
   * Parse ollama list output
   */
  private parseListOutput(output: string): OllamaModel[] {
    const lines = output.trim().split('\n');
    if (lines.length < 2) return [];

    const models: OllamaModel[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(/\s+/);
      if (parts.length >= 4) {
        models.push({
          name: parts[0],
          id: parts[1],
          size: parts[2],
          modified: parts.slice(3).join(' ')
        });
      }
    }
    return models;
  }

  /**
   * Pull a model with progress tracking
   */
  async* pullModel(model: string): AsyncGenerator<string, void, unknown> {
    const process = spawn('ollama', ['pull', model]);

    process.stdout.on('data', (chunk: Buffer) => {
      yield chunk.toString();
    });

    process.stderr.on('data', (chunk: Buffer) => {
      throw new Error(`Ollama pull error: ${chunk.toString()}`);
    });

    return new Promise<void>((resolve, reject) => {
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Pull failed with exit code ${code}`));
        }
      });
    });
  }
}
```

## Best Practices

1. **Always validate command arguments** before execution to prevent injection attacks.
2. **Use structured parsing** rather than regex when possible for reliability.
3. **Handle streaming output** with proper buffering to avoid incomplete line parsing.
4. **Implement timeouts** for long-running commands (e.g., `ollama pull`).
5. **Cache model lists** to reduce CLI calls when possible.
6. **Prefer HTTP API** (`/api/chat`, `/api/tags`) for chat operations when available.
7. **Use CLI commands** for model management (`list`, `pull`, `rm`) and system operations.
8. **Log all command executions** for debugging and audit purposes.

## References

**External Resources:**
- [Ollama CLI Documentation](https://github.com/ollama/ollama/blob/main/docs/cli.md)
- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)

**Related Documents:**
- **[Rust Process Execution Patterns](./02-rust-process-execution-patterns.md)** - Rust examples for executing and parsing these commands
- **[GraphQL-Tauri Integration](./03-graphql-tauri-integration.md)** - How to execute these commands from GraphQL resolvers
- **[Security and Permissions](./05-security-permissions-command-execution.md)** - Security practices for command execution
- **[Error Handling and Debugging](./06-error-handling-debugging.md)** - Handling Ollama-specific errors and parsing failures
- **[Practical Implementation Guide](./07-practical-implementation-guide.md)** - Complete implementation guide using these commands
