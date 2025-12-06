# GraphQL to Tauri Command Integration

## Overview

This document explains how to bridge RedwoodJS GraphQL resolvers with Tauri command execution, enabling your GraphQL API to run Ollama CLI commands on the desktop.

## Document Navigation

**Related Documents:**
- **[Tauri Command Execution Fundamentals](./01-tauri-command-execution-fundamentals.md)** - Understanding Tauri command architecture
- **[Rust Process Execution Patterns](./02-rust-process-execution-patterns.md)** - Rust patterns (alternative to direct Node.js execution)
- **[Ollama CLI Command Reference](./04-ollama-cli-command-reference.md)** - Complete Ollama command reference with parsing examples
- **[Security and Permissions](./05-security-permissions-command-execution.md)** - Security practices for Node.js command execution
- **[Error Handling and Debugging](./06-error-handling-debugging.md)** - Error handling for GraphQL resolvers
- **[Practical Implementation Guide](./07-practical-implementation-guide.md)** - Step-by-step implementation using this approach

## Table of Contents

1. [The Integration Challenge](#the-integration-challenge)
2. [Solution Architectures](#solution-architectures)
3. [Direct Process Execution (Recommended)](#direct-process-execution-recommended)
4. [Tauri IPC Bridge Pattern](#tauri-ipc-bridge-pattern)
5. [HTTP Bridge Pattern](#http-bridge-pattern)
6. [Implementation Examples](#implementation-examples)
7. [Error Handling and Debugging](#error-handling-and-debugging)

---

## The Integration Challenge

### Problem Statement

- **GraphQL Resolvers**: Execute in Node.js context (Redwood API server)
- **Tauri Commands**: Invokable from browser context via `@tauri-apps/api`
- **Goal**: Execute system commands (Ollama CLI) from GraphQL resolvers

### Why Direct Tauri Invoke Doesn't Work

```typescript
// ❌ This won't work in GraphQL resolvers
import { invoke } from '@tauri-apps/api/core';

export const Query = {
  ollamaList: async () => {
    // ERROR: invoke() only works in browser context, not Node.js
    const result = await invoke('execute_ollama_command', { ... });
  }
};
```

**Reason**: Redwood API runs in Node.js, not in the browser where Tauri's IPC is available.

---

## Solution Architectures

### Architecture Comparison

| Solution | Pros | Cons | Complexity |
|----------|------|------|------------|
| **Direct Process Execution** | Simple, no bridge needed | Requires Node.js on target machine | Low |
| **Tauri IPC Bridge** | Native Tauri integration | Complex setup, WebSocket needed | High |
| **HTTP Bridge** | Flexible, works across contexts | Additional HTTP server | Medium |

### Recommended: Direct Process Execution

Since Redwood API runs on the same machine as the Tauri app, execute commands directly from Node.js.

---

## Direct Process Execution (Recommended)

### Implementation Pattern

```typescript
// api/src/services/ollama/ollama-cli.ts
import { exec, execFile, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

export interface OllamaCommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

/**
 * Execute Ollama CLI command directly from Node.js
 *
 * Since Redwood API runs on the same machine as Tauri app,
 * we can execute commands directly without Tauri IPC bridge.
 */
export const executeOllamaCommand = async (
  subcommand: string,
  args: string[] = [],
  options: {
    timeout?: number;
    maxBuffer?: number;
    cwd?: string;
  } = {}
): Promise<OllamaCommandResult> => {
  const {
    timeout = 30000, // 30 seconds default
    maxBuffer = 10 * 1024 * 1024, // 10MB default
    cwd,
  } = options;

  const command = `ollama ${subcommand} ${args.join(' ')}`;

  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout,
      maxBuffer,
      cwd,
      // Ensure UTF-8 encoding
      encoding: 'utf8',
    });

    return {
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
    };
  } catch (error: any) {
    // execAsync rejects on non-zero exit code
    return {
      success: false,
      stdout: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || error.message || '',
      exitCode: error.code || null,
    };
  }
};

/**
 * Execute Ollama command with streaming output
 */
export const executeOllamaCommandStream = (
  subcommand: string,
  args: string[] = [],
  onChunk: (chunk: string) => void,
  onError: (error: Error) => void,
  onComplete: (exitCode: number | null) => void
): void => {
  const command = 'ollama';
  const fullArgs = [subcommand, ...args];

  const child = spawn(command, fullArgs, {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });

  let stdout = '';
  let stderr = '';

  child.stdout?.on('data', (data: Buffer) => {
    const chunk = data.toString();
    stdout += chunk;
    onChunk(chunk);
  });

  child.stderr?.on('data', (data: Buffer) => {
    const chunk = data.toString();
    stderr += chunk;
    onChunk(chunk); // Also stream stderr
  });

  child.on('error', (error) => {
    onError(error);
  });

  child.on('close', (code) => {
    onComplete(code);
  });
};
```

### GraphQL Integration

```typescript
// api/src/graphql/ollama-cli.ts
import { executeOllamaCommand } from 'src/services/ollama/ollama-cli';

export const Query = {
  /**
   * List available Ollama models via CLI
   */
  ollamaListCLI: async () => {
    const result = await executeOllamaCommand('list', []);

    if (!result.success) {
      throw new Error(`Failed to list Ollama models: ${result.stderr}`);
    }

    // Parse ollama list output
    // Format: NAME\tMODIFIED\tSIZE\tDIGEST
    const lines = result.stdout.split('\n').slice(1); // Skip header

    return lines
      .filter(line => line.trim())
      .map(line => {
        const [name, modifiedAt, size, digest] = line.split('\t');
        return {
          name: name || '',
          modifiedAt: modifiedAt || '',
          size: parseInt(size || '0', 10),
          digest: digest || '',
        };
      });
  },

  /**
   * Check if Ollama is available via CLI
   */
  ollamaHealthCLI: async (): Promise<boolean> => {
    const result = await executeOllamaCommand('list', []);
    return result.success;
  },
};

export const Mutation = {
  /**
   * Run Ollama model via CLI
   */
  runOllamaModel: async (
    _: unknown,
    { input }: { input: { model: string; prompt: string } }
  ) => {
    const result = await executeOllamaCommand('run', [input.model, input.prompt], {
      timeout: 60000, // 60 seconds for model execution
    });

    if (!result.success) {
      throw new Error(`Ollama command failed: ${result.stderr}`);
    }

    return {
      output: result.stdout,
      model: input.model,
    };
  },

  /**
   * Pull Ollama model via CLI
   */
  pullOllamaModel: async (
    _: unknown,
    { input }: { input: { model: string } }
  ) => {
    // For long-running commands, use streaming
    return new Promise((resolve, reject) => {
      const chunks: string[] = [];

      executeOllamaCommandStream(
        'pull',
        [input.model],
        (chunk) => {
          chunks.push(chunk);
        },
        (error) => {
          reject(error);
        },
        (exitCode) => {
          if (exitCode === 0) {
            resolve({
              success: true,
              output: chunks.join(''),
              model: input.model,
            });
          } else {
            reject(new Error(`Pull failed with exit code ${exitCode}`));
          }
        }
      );
    });
  },
};
```

### GraphQL Schema

```typescript
// api/src/graphql/ollama-cli.sdl.ts
export const schema = gql`
  type OllamaModelCLI {
    name: String!
    modifiedAt: String!
    size: Int!
    digest: String!
  }

  type OllamaRunResult {
    output: String!
    model: String!
  }

  type OllamaPullResult {
    success: Boolean!
    output: String!
    model: String!
  }

  type Query {
    ollamaListCLI: [OllamaModelCLI!]!
    ollamaHealthCLI: Boolean!
  }

  type Mutation {
    runOllamaModel(input: RunOllamaModelInput!): OllamaRunResult!
    pullOllamaModel(input: PullOllamaModelInput!): OllamaPullResult!
  }

  input RunOllamaModelInput {
    model: String!
    prompt: String!
  }

  input PullOllamaModelInput {
    model: String!
  }
`;
```

---

## Tauri IPC Bridge Pattern

### When to Use

Use this pattern if you need:
- Tauri-specific features (window management, system info)
- Unified command execution interface
- Cross-platform process management

### Implementation

#### Step 1: Create Tauri Command

```rust
// src-tauri/src/commands.rs
use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandRequest {
    pub command: String,
    pub args: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandResponse {
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
}

#[command]
pub async fn execute_system_command(
    request: CommandRequest,
) -> Result<CommandResponse, String> {
    use tokio::process::Command;

    let output = Command::new(&request.command)
        .args(&request.args)
        .output()
        .await
        .map_err(|e| format!("Failed to execute: {}", e))?;

    Ok(CommandResponse {
        success: output.status.success(),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code(),
    })
}
```

#### Step 2: Create HTTP Bridge Server

```rust
// src-tauri/src/bridge.rs
use std::net::TcpListener;
use std::io::{Read, Write};
use serde_json;

pub fn start_bridge_server(port: u16) -> Result<(), String> {
    let listener = TcpListener::bind(format!("127.0.0.1:{}", port))
        .map_err(|e| format!("Failed to bind: {}", e))?;

    println!("Bridge server listening on port {}", port);

    for stream in listener.incoming() {
        match stream {
            Ok(mut stream) => {
                // Handle HTTP request
                let mut buffer = [0; 1024];
                stream.read(&mut buffer).unwrap();

                // Parse request and execute command
                // Send response
            }
            Err(e) => {
                eprintln!("Connection error: {}", e);
            }
        }
    }

    Ok(())
}
```

#### Step 3: Call from GraphQL

```typescript
// api/src/services/ollama/tauri-bridge.ts
import fetch from 'node-fetch';

const BRIDGE_PORT = 8765;

export const executeViaTauriBridge = async (
  command: string,
  args: string[]
): Promise<{ success: boolean; stdout: string; stderr: string }> => {
  const response = await fetch(`http://localhost:${BRIDGE_PORT}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, args }),
  });

  return response.json();
};
```

---

## HTTP Bridge Pattern

### Simple HTTP Server in Tauri

```rust
// src-tauri/src/http_bridge.rs
use std::net::TcpListener;
use std::io::{Read, Write};
use serde_json::{json, Value};

pub fn handle_request(request: &str) -> String {
    // Parse HTTP request
    // Extract command and args
    // Execute command
    // Return JSON response

    let response = json!({
        "success": true,
        "stdout": "output",
        "stderr": "",
    });

    format!(
        "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{}",
        serde_json::to_string(&response).unwrap()
    )
}
```

---

## Implementation Examples

### Complete Service Implementation

```typescript
// api/src/services/ollama/ollama-cli-service.ts
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { EventEmitter } from 'events';

const execAsync = promisify(exec);

export class OllamaCLIService extends EventEmitter {
  /**
   * Execute ollama list command
   */
  async listModels(): Promise<Array<{
    name: string;
    modifiedAt: string;
    size: number;
    digest: string;
  }>> {
    const result = await this.executeCommand('list', []);

    if (!result.success) {
      throw new Error(`Failed to list models: ${result.stderr}`);
    }

    return this.parseListOutput(result.stdout);
  }

  /**
   * Execute ollama run command
   */
  async runModel(model: string, prompt: string): Promise<string> {
    const result = await this.executeCommand('run', [model, prompt], {
      timeout: 60000,
    });

    if (!result.success) {
      throw new Error(`Failed to run model: ${result.stderr}`);
    }

    return result.stdout;
  }

  /**
   * Stream ollama run command output
   */
  streamModel(
    model: string,
    prompt: string,
    onChunk: (chunk: string) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): void {
    const child = spawn('ollama', ['run', model, prompt], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout?.on('data', (data: Buffer) => {
      onChunk(data.toString());
    });

    child.stderr?.on('data', (data: Buffer) => {
      onChunk(data.toString());
    });

    child.on('error', onError);
    child.on('close', () => onComplete());
  }

  /**
   * Execute generic ollama command
   */
  private async executeCommand(
    subcommand: string,
    args: string[] = [],
    options: { timeout?: number } = {}
  ): Promise<{ success: boolean; stdout: string; stderr: string }> {
    const command = `ollama ${subcommand} ${args.join(' ')}`;

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: options.timeout || 30000,
        maxBuffer: 10 * 1024 * 1024,
        encoding: 'utf8',
      });

      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      };
    } catch (error: any) {
      return {
        success: false,
        stdout: error.stdout?.toString() || '',
        stderr: error.stderr?.toString() || error.message || '',
      };
    }
  }

  /**
   * Parse ollama list output
   */
  private parseListOutput(output: string): Array<{
    name: string;
    modifiedAt: string;
    size: number;
    digest: string;
  }> {
    const lines = output.split('\n').slice(1); // Skip header

    return lines
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split('\t');
        return {
          name: parts[0] || '',
          modifiedAt: parts[1] || '',
          size: parseInt(parts[2] || '0', 10),
          digest: parts[3] || '',
        };
      });
  }
}

// Singleton instance
export const ollamaCLIService = new OllamaCLIService();
```

### GraphQL Resolver Usage

```typescript
// api/src/graphql/ollama-cli.ts
import { ollamaCLIService } from 'src/services/ollama/ollama-cli-service';

export const Query = {
  ollamaListCLI: async () => {
    return await ollamaCLIService.listModels();
  },
};

export const Mutation = {
  runOllamaModel: async (
    _: unknown,
    { input }: { input: { model: string; prompt: string } }
  ) => {
    const output = await ollamaCLIService.runModel(input.model, input.prompt);
    return { output, model: input.model };
  },
};
```

---

## Error Handling and Debugging

### Comprehensive Error Handling

```typescript
export interface CommandError {
  type: 'NOT_FOUND' | 'TIMEOUT' | 'EXECUTION_FAILED' | 'PERMISSION_DENIED';
  message: string;
  stderr?: string;
  exitCode?: number;
}

export const executeOllamaCommandSafe = async (
  subcommand: string,
  args: string[] = []
): Promise<{ success: true; stdout: string } | { success: false; error: CommandError }> => {
  try {
    const result = await executeOllamaCommand(subcommand, args);

    if (result.success) {
      return { success: true, stdout: result.stdout };
    }

    // Determine error type
    let errorType: CommandError['type'] = 'EXECUTION_FAILED';
    if (result.stderr.includes('not found') || result.stderr.includes('command not found')) {
      errorType = 'NOT_FOUND';
    } else if (result.stderr.includes('Permission denied')) {
      errorType = 'PERMISSION_DENIED';
    }

    return {
      success: false,
      error: {
        type: errorType,
        message: result.stderr || 'Command execution failed',
        stderr: result.stderr,
        exitCode: result.exitCode,
      },
    };
  } catch (error: any) {
    if (error.code === 'ETIMEDOUT') {
      return {
        success: false,
        error: {
          type: 'TIMEOUT',
          message: 'Command execution timed out',
        },
      };
    }

    return {
      success: false,
      error: {
        type: 'EXECUTION_FAILED',
        message: error.message || 'Unknown error',
      },
    };
  }
};
```

### Debugging Tips

1. **Log Command Execution**:
```typescript
console.log('Executing:', `ollama ${subcommand} ${args.join(' ')}`);
```

2. **Capture Full Error Context**:
```typescript
catch (error) {
  console.error('Command failed:', {
    command: `ollama ${subcommand}`,
    args,
    error: error.message,
    stack: error.stack,
  });
  throw error;
}
```

3. **Test Command Manually**:
```bash
# Test in terminal first
ollama list
ollama run llama3 "Hello"
```

---

## References

- [Node.js Child Process](https://nodejs.org/api/child_process.html)
- [RedwoodJS GraphQL Resolvers](https://redwoodjs.com/docs/graphql)
- [Tauri Commands](https://tauri.app/v1/guides/features/command)

---

## Related Documents

This document focuses on GraphQL integration. For complete implementation:

1. **[Tauri Command Execution Fundamentals](./01-tauri-command-execution-fundamentals.md)** - Understanding Tauri command architecture (if using Tauri IPC approach)
2. **[Rust Process Execution Patterns](./02-rust-process-execution-patterns.md)** - Rust patterns for process execution (alternative approach)
3. **[Ollama CLI Command Reference](./04-ollama-cli-command-reference.md)** - Complete reference for Ollama commands you'll execute
4. **[Security and Permissions](./05-security-permissions-command-execution.md)** - Critical security practices for Node.js command execution
5. **[Error Handling and Debugging](./06-error-handling-debugging.md)** - Comprehensive error handling for GraphQL resolvers
6. **[Practical Implementation Guide](./07-practical-implementation-guide.md)** - Complete step-by-step guide using the direct Node.js approach
