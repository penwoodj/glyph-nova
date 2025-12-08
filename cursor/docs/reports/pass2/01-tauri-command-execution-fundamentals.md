# Tauri Command Execution Fundamentals

## Overview

This document covers the core patterns for executing system commands from a Tauri application, enabling your Redwood GraphQL API to run Ollama CLI commands and capture their output.

## Document Navigation

**Related Documents:**
- **[Rust Process Execution Patterns](./02-rust-process-execution-patterns.md)** - Detailed Rust patterns for process execution
- **[GraphQL-Tauri Integration](./03-graphql-tauri-integration.md)** - How to integrate command execution with GraphQL resolvers
- **[Ollama CLI Command Reference](./04-ollama-cli-command-reference.md)** - Complete reference for Ollama CLI commands
- **[Security and Permissions](./05-security-permissions-command-execution.md)** - Security best practices for command execution
- **[Error Handling and Debugging](./06-error-handling-debugging.md)** - Comprehensive error handling strategies
- **[Practical Implementation Guide](./07-practical-implementation-guide.md)** - Step-by-step implementation guide

## Table of Contents

1. [Tauri Command Architecture](#tauri-command-architecture)
2. [Defining Rust Commands](#defining-rust-commands)
3. [Calling Commands from Frontend](#calling-commands-from-frontend)
4. [Command Invocation Patterns](#command-invocation-patterns)
5. [Permissions and Security](#permissions-and-security)
6. [Error Handling](#error-handling)

---

## Tauri Command Architecture

### Command Flow

```
Frontend/GraphQL → Tauri Invoke → Rust Command → System Process → Output → Response
```

### Key Components

1. **Rust Command Functions**: Defined in `src-tauri/src/lib.rs` or separate modules
2. **Tauri Invoke System**: Bridges frontend JavaScript/TypeScript to Rust
3. **Process Execution**: Uses Rust's `std::process::Command` or `tokio::process::Command`
4. **Response Serialization**: Uses `serde` for JSON serialization

---

## Defining Rust Commands

### Basic Command Structure

```rust
use tauri::command;

#[command]
pub fn execute_ollama_command(cmd: String, args: Vec<String>) -> Result<String, String> {
    // Command implementation
    Ok("output".to_string())
}
```

### Command Registration

In `src-tauri/src/lib.rs`:

```rust
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        execute_ollama_command,
        // ... other commands
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
```

### Command Attributes

- `#[command]`: Marks function as invokable from frontend
- Return type: `Result<T, E>` where `T` implements `Serialize`
- Parameters: Must implement `Deserialize`

---

## Calling Commands from Frontend

### JavaScript/TypeScript Invocation

```typescript
import { invoke } from '@tauri-apps/api/core';

// Basic invocation
const result = await invoke<string>('execute_ollama_command', {
  cmd: 'ollama',
  args: ['list']
});

// With error handling
try {
  const output = await invoke<string>('execute_ollama_command', {
    cmd: 'ollama',
    args: ['run', 'llama3']
  });
  console.log('Output:', output);
} catch (error) {
  console.error('Command failed:', error);
}
```

### From Redwood GraphQL Resolver

```typescript
// api/src/graphql/ollama.ts
import { invoke } from '@tauri-apps/api/core';

export const Query = {
  ollamaList: async () => {
    try {
      const output = await invoke<string>('execute_ollama_command', {
        cmd: 'ollama',
        args: ['list']
      });

      // Parse output and return
      return JSON.parse(output);
    } catch (error) {
      throw new Error(`Failed to list Ollama models: ${error}`);
    }
  }
};
```

**Important**: GraphQL resolvers run in Node.js context, not browser. You'll need to use Tauri's IPC differently or create a bridge. See [GraphQL-Tauri Integration](./03-graphql-tauri-integration.md) for detailed solutions.

---

## Command Invocation Patterns

### Pattern 1: Synchronous Execution (Blocking)

```rust
use std::process::Command;

#[command]
pub fn run_command_sync(cmd: String, args: Vec<String>) -> Result<String, String> {
    let output = Command::new(&cmd)
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
```

**Use When**:
- Quick commands (< 1 second)
- Need immediate result
- Blocking is acceptable

### Pattern 2: Asynchronous Execution (Non-blocking)

```rust
use tokio::process::Command;

#[command]
pub async fn run_command_async(cmd: String, args: Vec<String>) -> Result<String, String> {
    let output = Command::new(&cmd)
        .args(&args)
        .output()
        .await
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
```

**Use When**:
- Long-running commands
- Need non-blocking execution
- Multiple concurrent commands

### Pattern 3: Streaming Output

```rust
use tokio::process::Command;
use tokio::io::{AsyncBufReadExt, BufReader};

#[command]
pub async fn run_command_stream(
    cmd: String,
    args: Vec<String>,
    window: tauri::Window,
) -> Result<(), String> {
    let mut child = Command::new(&cmd)
        .args(&args)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn command: {}", e))?;

    let stdout = child.stdout.take().unwrap();
    let mut reader = BufReader::new(stdout).lines();

    while let Some(line) = reader.next_line().await.unwrap_or(None) {
        window.emit("command-output", line)
            .map_err(|e| format!("Failed to emit event: {}", e))?;
    }

    Ok(())
}
```

**Use When**:
- Real-time output needed
- Long-running processes
- Progress updates required

---

## Permissions and Security

### Required Tauri Permissions

In `src-tauri/capabilities/default.json`:

```json
{
  "permissions": [
    "core:default",
    "shell:allow-execute",
    "shell:allow-open"
  ]
}
```

### Security Considerations

1. **Command Whitelisting**: Only allow specific commands
2. **Argument Validation**: Sanitize and validate arguments
3. **Path Restrictions**: Limit executable paths
4. **User Permissions**: Run with minimal required privileges

### Secure Command Execution Example

```rust
use std::path::Path;

#[command]
pub fn execute_ollama_safe(
    subcommand: String,
    args: Vec<String>,
) -> Result<String, String> {
    // Whitelist allowed commands
    let allowed_commands = ["list", "run", "show", "ps", "pull"];

    if !allowed_commands.contains(&subcommand.as_str()) {
        return Err(format!("Command '{}' not allowed", subcommand));
    }

    // Validate ollama path (optional, for extra security)
    let ollama_path = which::which("ollama")
        .map_err(|_| "Ollama not found in PATH")?;

    // Execute with validated command
    let output = std::process::Command::new(ollama_path)
        .arg(&subcommand)
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to execute: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
```

---

## Error Handling

### Error Types

1. **Command Not Found**: Executable doesn't exist
2. **Execution Failure**: Process exits with non-zero code
3. **Permission Denied**: Insufficient permissions
4. **Timeout**: Command takes too long
5. **Output Parsing**: Invalid output format

### Comprehensive Error Handling

```rust
use std::time::Duration;
use std::process::Command;

#[command]
pub fn execute_with_timeout(
    cmd: String,
    args: Vec<String>,
    timeout_secs: Option<u64>,
) -> Result<String, String> {
    let mut command = Command::new(&cmd);
    command.args(&args);

    // Set timeout if provided
    if let Some(timeout) = timeout_secs {
        // Note: std::process::Command doesn't have built-in timeout
        // Use tokio::process::Command with timeout instead
    }

    match command.output() {
        Ok(output) => {
            if output.status.success() {
                Ok(String::from_utf8_lossy(&output.stdout).to_string())
            } else {
                let stderr = String::from_utf8_lossy(&output.stderr);
                Err(format!(
                    "Command failed with exit code {}: {}",
                    output.status.code().unwrap_or(-1),
                    stderr
                ))
            }
        }
        Err(e) => {
            match e.kind() {
                std::io::ErrorKind::NotFound => {
                    Err(format!("Command '{}' not found in PATH", cmd))
                }
                std::io::ErrorKind::PermissionDenied => {
                    Err("Permission denied".to_string())
                }
                _ => Err(format!("Failed to execute command: {}", e))
            }
        }
    }
}
```

### Error Response Format

```rust
#[derive(serde::Serialize)]
pub struct CommandResult {
    success: bool,
    stdout: Option<String>,
    stderr: Option<String>,
    exit_code: Option<i32>,
    error: Option<String>,
}

#[command]
pub fn execute_with_detailed_result(
    cmd: String,
    args: Vec<String>,
) -> Result<CommandResult, String> {
    match std::process::Command::new(&cmd).args(&args).output() {
        Ok(output) => Ok(CommandResult {
            success: output.status.success(),
            stdout: Some(String::from_utf8_lossy(&output.stdout).to_string()),
            stderr: Some(String::from_utf8_lossy(&output.stderr).to_string()),
            exit_code: output.status.code(),
            error: if output.status.success() {
                None
            } else {
                Some(format!("Command exited with code {}",
                    output.status.code().unwrap_or(-1)))
            },
        }),
        Err(e) => Ok(CommandResult {
            success: false,
            stdout: None,
            stderr: None,
            exit_code: None,
            error: Some(format!("Failed to execute: {}", e)),
        }),
    }
}
```

---

## Integration with Redwood GraphQL

### Challenge: GraphQL Runs in Node.js, Not Browser

**Problem**: GraphQL resolvers execute in Node.js context (Redwood API server), not in the browser where Tauri's `invoke` is available.

### Solution Options

#### Option 1: HTTP Bridge (Recommended)

Create a Tauri command that exposes an HTTP endpoint:

```rust
// In Tauri Rust code
use std::net::TcpListener;

#[command]
pub fn start_command_bridge(port: u16) -> Result<String, String> {
    // Start HTTP server that accepts command requests
    // Redwood API can call this HTTP endpoint
}
```

#### Option 2: Direct Process Execution from Redwood API

Since Redwood API runs on the same machine, execute commands directly:

```typescript
// api/src/services/ollama/ollama-cli.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const executeOllamaCommand = async (
  subcommand: string,
  args: string[] = []
): Promise<string> => {
  const command = `ollama ${subcommand} ${args.join(' ')}`;

  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 second timeout
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    if (stderr && !stdout) {
      throw new Error(stderr);
    }

    return stdout;
  } catch (error) {
    throw new Error(`Ollama command failed: ${error.message}`);
  }
};
```

#### Option 3: Tauri IPC via WebSocket

Create a WebSocket bridge between Redwood API and Tauri:

```rust
// Tauri side: Expose WebSocket server
// Redwood side: Connect via WebSocket client
```

---

## Best Practices

1. **Always Validate Input**: Sanitize command and arguments
2. **Use Timeouts**: Prevent hanging processes
3. **Limit Buffer Sizes**: Prevent memory exhaustion
4. **Log Command Execution**: For debugging and security
5. **Handle Encoding**: UTF-8 vs system encoding
6. **Clean Up Processes**: Ensure child processes are terminated

### Example: Production-Ready Command Execution

```rust
use std::process::{Command, Stdio};
use std::time::Duration;

#[command]
pub fn execute_ollama_safe(
    subcommand: String,
    args: Vec<String>,
) -> Result<CommandResult, String> {
    // 1. Validate subcommand
    let allowed = ["list", "run", "show", "ps", "pull", "stop"];
    if !allowed.contains(&subcommand.as_str()) {
        return Err(format!("Subcommand '{}' not allowed", subcommand));
    }

    // 2. Find ollama executable
    let ollama_path = which::which("ollama")
        .map_err(|_| "Ollama not found. Please install Ollama first.")?;

    // 3. Build command
    let mut cmd = Command::new(ollama_path);
    cmd.arg(&subcommand);
    cmd.args(&args);
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    // 4. Execute with timeout (requires tokio)
    // For std::process, use external timeout wrapper

    // 5. Capture output
    let output = cmd.output()
        .map_err(|e| format!("Failed to execute ollama: {}", e))?;

    // 6. Return structured result
    Ok(CommandResult {
        success: output.status.success(),
        stdout: Some(String::from_utf8_lossy(&output.stdout).to_string()),
        stderr: Some(String::from_utf8_lossy(&output.stderr).to_string()),
        exit_code: output.status.code(),
        error: None,
    })
}
```

---

## References

- [Tauri Command Documentation](https://tauri.app/v1/guides/features/command)
- [Rust std::process::Command](https://doc.rust-lang.org/std/process/struct.Command.html)
- [Tokio Process](https://docs.rs/tokio/latest/tokio/process/index.html)
- [Tauri Shell Plugin](https://tauri.app/v1/api/js/shell/)

---

## Related Documents

This document is part of a comprehensive guide series. Continue reading:

1. **[Rust Process Execution Patterns](./02-rust-process-execution-patterns.md)** - Detailed patterns for executing processes in Rust, including async operations, streaming, and error handling
2. **[GraphQL-Tauri Integration](./03-graphql-tauri-integration.md)** - Complete guide on integrating command execution with RedwoodJS GraphQL resolvers
3. **[Ollama CLI Command Reference](./04-ollama-cli-command-reference.md)** - Comprehensive reference for all Ollama CLI commands with parsing examples
4. **[Security and Permissions](./05-security-permissions-command-execution.md)** - Security best practices, input validation, and permission configuration
5. **[Error Handling and Debugging](./06-error-handling-debugging.md)** - Comprehensive error handling strategies and debugging techniques
6. **[Practical Implementation Guide](./07-practical-implementation-guide.md)** - Step-by-step implementation guide that synthesizes all concepts
