# Rust Process Execution Patterns

## Overview

This document provides detailed patterns for executing system processes in Rust, specifically for running Ollama CLI commands and capturing their output in a Tauri application.

## Document Navigation

**Related Documents:**
- **[Tauri Command Execution Fundamentals](./01-tauri-command-execution-fundamentals.md)** - Core Tauri command patterns and architecture
- **[GraphQL-Tauri Integration](./03-graphql-tauri-integration.md)** - Integrating Rust commands with GraphQL resolvers
- **[Ollama CLI Command Reference](./04-ollama-cli-command-reference.md)** - Ollama command reference with Rust parsing examples
- **[Security and Permissions](./05-security-permissions-command-execution.md)** - Security practices for Rust command execution
- **[Error Handling and Debugging](./06-error-handling-debugging.md)** - Rust error handling patterns and debugging
- **[Practical Implementation Guide](./07-practical-implementation-guide.md)** - Complete implementation workflow

## Table of Contents

1. [Standard Library Process Execution](#standard-library-process-execution)
2. [Async Process Execution with Tokio](#async-process-execution-with-tokio)
3. [Streaming Process Output](#streaming-process-output)
4. [Error Handling and Timeouts](#error-handling-and-timeouts)
5. [Environment and Working Directory](#environment-and-working-directory)
6. [Process Management](#process-management)

---

## Standard Library Process Execution

### Basic Command Execution

```rust
use std::process::Command;

pub fn run_ollama_list() -> Result<String, String> {
    let output = Command::new("ollama")
        .arg("list")
        .output()
        .map_err(|e| format!("Failed to execute: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
```

### Capturing Both stdout and stderr

```rust
use std::process::{Command, Stdio};

pub fn run_with_separate_streams(cmd: &str, args: &[&str]) -> Result<(String, String), String> {
    let output = Command::new(cmd)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| format!("Failed to execute: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    Ok((stdout, stderr))
}
```

### Real-time Output (Line by Line)

```rust
use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader};

pub fn run_with_line_reader(cmd: &str, args: &[&str]) -> Result<Vec<String>, String> {
    let mut child = Command::new(cmd)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn: {}", e))?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let reader = BufReader::new(stdout);

    let mut lines = Vec::new();
    for line in reader.lines() {
        let line = line.map_err(|e| format!("Failed to read line: {}", e))?;
        lines.push(line);
    }

    let status = child.wait().map_err(|e| format!("Failed to wait: {}", e))?;

    if status.success() {
        Ok(lines)
    } else {
        Err("Command failed".to_string())
    }
}
```

---

## Async Process Execution with Tokio

### Basic Async Execution

```rust
use tokio::process::Command;

pub async fn run_ollama_async(subcommand: &str, args: &[&str]) -> Result<String, String> {
    let output = Command::new("ollama")
        .arg(subcommand)
        .args(args)
        .output()
        .await
        .map_err(|e| format!("Failed to execute: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
```

### Async with Timeout

```rust
use tokio::process::Command;
use tokio::time::{timeout, Duration};

pub async fn run_with_timeout(
    cmd: &str,
    args: &[&str],
    timeout_secs: u64,
) -> Result<String, String> {
    let mut command = Command::new(cmd);
    command.args(args);
    command.stdout(std::process::Stdio::piped());
    command.stderr(std::process::Stdio::piped());

    match timeout(Duration::from_secs(timeout_secs), command.output()).await {
        Ok(Ok(output)) => {
            if output.status.success() {
                Ok(String::from_utf8_lossy(&output.stdout).to_string())
            } else {
                Err(String::from_utf8_lossy(&output.stderr).to_string())
            }
        }
        Ok(Err(e)) => Err(format!("Command execution failed: {}", e)),
        Err(_) => Err(format!("Command timed out after {} seconds", timeout_secs)),
    }
}
```

### Async Streaming Output

```rust
use tokio::process::{Command, Stdio};
use tokio::io::{AsyncBufReadExt, BufReader};

pub async fn stream_ollama_output(
    subcommand: &str,
    args: &[&str],
    on_line: impl Fn(String) -> Result<(), String>,
) -> Result<i32, String> {
    let mut child = Command::new("ollama")
        .arg(subcommand)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn: {}", e))?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let mut reader = BufReader::new(stdout).lines();

    while let Some(line) = reader.next_line().await
        .map_err(|e| format!("Failed to read line: {}", e))? {
        on_line(line)?;
    }

    let status = child.wait().await
        .map_err(|e| format!("Failed to wait: {}", e))?;

    Ok(status.code().unwrap_or(-1))
}
```

---

## Streaming Process Output

### Real-time Output with Callbacks

```rust
use tokio::process::{Command, Stdio};
use tokio::io::{AsyncBufReadExt, BufReader};

pub struct ProcessStream {
    stdout_lines: tokio::task::JoinHandle<Result<Vec<String>, String>>>,
    stderr_lines: tokio::task::JoinHandle<Result<Vec<String>, String>>>,
    child: tokio::process::Child,
}

impl ProcessStream {
    pub async fn new(cmd: &str, args: &[&str]) -> Result<Self, String> {
        let mut child = Command::new(cmd)
            .args(args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to spawn: {}", e))?;

        let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
        let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

        let stdout_handle = tokio::spawn(async move {
            let mut reader = BufReader::new(stdout).lines();
            let mut lines = Vec::new();
            while let Some(line) = reader.next_line().await
                .map_err(|e| format!("Read error: {}", e))? {
                lines.push(line);
            }
            Ok(lines)
        });

        let stderr_handle = tokio::spawn(async move {
            let mut reader = BufReader::new(stderr).lines();
            let mut lines = Vec::new();
            while let Some(line) = reader.next_line().await
                .map_err(|e| format!("Read error: {}", e))? {
                lines.push(line);
            }
            Ok(lines)
        });

        Ok(Self {
            stdout_lines: stdout_handle,
            stderr_lines: stderr_handle,
            child,
        })
    }

    pub async fn wait(self) -> Result<(Vec<String>, Vec<String>, i32), String> {
        let status = self.child.wait().await
            .map_err(|e| format!("Wait failed: {}", e))?;

        let exit_code = status.code().unwrap_or(-1);

        let stdout = self.stdout_lines.await
            .map_err(|e| format!("Stdout join failed: {}", e))?
            .map_err(|e| format!("Stdout read failed: {}", e))?;

        let stderr = self.stderr_lines.await
            .map_err(|e| format!("Stderr join failed: {}", e))?
            .map_err(|e| format!("Stderr read failed: {}", e))?;

        Ok((stdout, stderr, exit_code))
    }
}
```

### Event-Driven Streaming

```rust
use tokio::process::{Command, Stdio};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::sync::mpsc;

pub async fn stream_to_channel(
    cmd: &str,
    args: &[&str],
) -> Result<mpsc::Receiver<String>, String> {
    let (tx, rx) = mpsc::channel(100);

    let mut child = Command::new(cmd)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn: {}", e))?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let tx_clone = tx.clone();

    tokio::spawn(async move {
        let mut reader = BufReader::new(stdout).lines();
        while let Some(line) = reader.next_line().await.ok().flatten() {
            if tx_clone.send(line).await.is_err() {
                break; // Receiver dropped
            }
        }
    });

    Ok(rx)
}
```

---

## Error Handling and Timeouts

### Comprehensive Error Types

```rust
#[derive(Debug)]
pub enum ProcessError {
    NotFound(String),
    PermissionDenied,
    ExecutionFailed(String),
    Timeout,
    InvalidOutput(String),
    Unknown(String),
}

impl std::fmt::Display for ProcessError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            ProcessError::NotFound(cmd) => write!(f, "Command '{}' not found", cmd),
            ProcessError::PermissionDenied => write!(f, "Permission denied"),
            ProcessError::ExecutionFailed(msg) => write!(f, "Execution failed: {}", msg),
            ProcessError::Timeout => write!(f, "Command timed out"),
            ProcessError::InvalidOutput(msg) => write!(f, "Invalid output: {}", msg),
            ProcessError::Unknown(msg) => write!(f, "Unknown error: {}", msg),
        }
    }
}

pub async fn execute_with_error_handling(
    cmd: &str,
    args: &[&str],
) -> Result<String, ProcessError> {
    let output = tokio::process::Command::new(cmd)
        .args(args)
        .output()
        .await
        .map_err(|e| {
            match e.kind() {
                std::io::ErrorKind::NotFound => ProcessError::NotFound(cmd.to_string()),
                std::io::ErrorKind::PermissionDenied => ProcessError::PermissionDenied,
                _ => ProcessError::ExecutionFailed(e.to_string()),
            }
        })?;

    if output.status.success() {
        String::from_utf8(output.stdout)
            .map_err(|e| ProcessError::InvalidOutput(e.to_string()))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(ProcessError::ExecutionFailed(stderr.to_string()))
    }
}
```

### Timeout with Graceful Cancellation

```rust
use tokio::process::Command;
use tokio::time::{timeout, Duration, Instant};

pub async fn execute_with_cancellation(
    cmd: &str,
    args: &[&str],
    timeout_secs: u64,
) -> Result<String, String> {
    let start = Instant::now();

    let mut child = Command::new(cmd)
        .args(args)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn: {}", e))?;

    let output_future = child.wait_with_output();

    match timeout(Duration::from_secs(timeout_secs), output_future).await {
        Ok(Ok(output)) => {
            if output.status.success() {
                Ok(String::from_utf8_lossy(&output.stdout).to_string())
            } else {
                Err(String::from_utf8_lossy(&output.stderr).to_string())
            }
        }
        Ok(Err(e)) => Err(format!("Command failed: {}", e)),
        Err(_) => {
            // Timeout occurred - kill the process
            let _ = child.kill().await;
            Err(format!("Command timed out after {} seconds", timeout_secs))
        }
    }
}
```

---

## Environment and Working Directory

### Setting Environment Variables

```rust
use std::collections::HashMap;
use std::process::Command;

pub fn run_with_env(
    cmd: &str,
    args: &[&str],
    env_vars: HashMap<String, String>,
) -> Result<String, String> {
    let mut command = Command::new(cmd);
    command.args(args);

    // Set environment variables
    for (key, value) in env_vars {
        command.env(key, value);
    }

    let output = command.output()
        .map_err(|e| format!("Failed to execute: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
```

### Setting Working Directory

```rust
use std::path::Path;
use std::process::Command;

pub fn run_in_directory(
    cmd: &str,
    args: &[&str],
    working_dir: &Path,
) -> Result<String, String> {
    let output = Command::new(cmd)
        .args(args)
        .current_dir(working_dir)
        .output()
        .map_err(|e| format!("Failed to execute: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
```

### Inheriting vs Clearing Environment

```rust
use std::process::Command;

// Inherit all environment variables (default)
pub fn run_with_inherited_env(cmd: &str, args: &[&str]) -> Result<String, String> {
    // Environment is inherited by default
    Command::new(cmd).args(args).output()
        .map_err(|e| format!("Failed: {}", e))
        .and_then(|output| {
            if output.status.success() {
                Ok(String::from_utf8_lossy(&output.stdout).to_string())
            } else {
                Err(String::from_utf8_lossy(&output.stderr).to_string())
            }
        })
}

// Clear environment and set only specific variables
pub fn run_with_clean_env(
    cmd: &str,
    args: &[&str],
    env_vars: &[(&str, &str)],
) -> Result<String, String> {
    let mut command = Command::new(cmd);
    command.args(args);
    command.env_clear(); // Clear all environment variables

    for (key, value) in env_vars {
        command.env(key, value);
    }

    let output = command.output()
        .map_err(|e| format!("Failed: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
```

---

## Process Management

### Process Groups and Cleanup

```rust
use std::process::{Command, Stdio};
use nix::unistd::{setpgid, Pid};
use nix::sys::signal::{kill, Signal};

pub fn run_with_process_group(
    cmd: &str,
    args: &[&str],
) -> Result<String, String> {
    let mut child = Command::new(cmd)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn: {}", e))?;

    // Create new process group (Unix only)
    #[cfg(unix)]
    {
        if let Err(e) = setpgid(Pid::from_raw(child.id() as i32), Pid::from_raw(0)) {
            eprintln!("Warning: Failed to set process group: {}", e);
        }
    }

    let output = child.wait_with_output()
        .map_err(|e| format!("Failed to wait: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

// Kill process group on cleanup
pub fn kill_process_group(pid: u32) -> Result<(), String> {
    #[cfg(unix)]
    {
        kill(Pid::from_raw(pid as i32), Signal::SIGTERM)
            .map_err(|e| format!("Failed to kill process group: {}", e))?;
    }
    #[cfg(not(unix))]
    {
        // Windows doesn't have process groups in the same way
        std::process::Command::new("taskkill")
            .args(&["/F", "/T", "/PID", &pid.to_string()])
            .output()
            .map_err(|e| format!("Failed to kill process: {}", e))?;
    }
    Ok(())
}
```

### Process Status Monitoring

```rust
use tokio::process::Command;
use tokio::time::{interval, Duration};

pub async fn monitor_process(
    cmd: &str,
    args: &[&str],
    on_status: impl Fn(bool) -> Result<(), String>,
) -> Result<i32, String> {
    let mut child = Command::new(cmd)
        .args(args)
        .spawn()
        .map_err(|e| format!("Failed to spawn: {}", e))?;

    let mut interval = interval(Duration::from_secs(1));

    loop {
        tokio::select! {
            status = child.wait() => {
                let exit_code = status
                    .map_err(|e| format!("Wait failed: {}", e))?
                    .code()
                    .unwrap_or(-1);
                return Ok(exit_code);
            }
            _ = interval.tick() => {
                // Check if process is still running
                if let Ok(Some(status)) = child.try_wait() {
                    on_status(status.success())?;
                }
            }
        }
    }
}
```

---

## Ollama-Specific Patterns

### Running Ollama Commands

```rust
use tokio::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaModel {
    pub name: String,
    pub modified_at: String,
    pub size: u64,
    pub digest: String,
}

pub async fn list_ollama_models() -> Result<Vec<OllamaModel>, String> {
    let output = Command::new("ollama")
        .arg("list")
        .output()
        .await
        .map_err(|e| format!("Failed to execute ollama list: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);

    // Parse ollama list output (format: NAME\tMODIFIED\tSIZE\tDIGEST)
    let models: Vec<OllamaModel> = stdout
        .lines()
        .skip(1) // Skip header
        .filter_map(|line| {
            let parts: Vec<&str> = line.split('\t').collect();
            if parts.len() >= 4 {
                Some(OllamaModel {
                    name: parts[0].to_string(),
                    modified_at: parts[1].to_string(),
                    size: parts[2].parse().ok()?,
                    digest: parts[3].to_string(),
                })
            } else {
                None
            }
        })
        .collect();

    Ok(models)
}

pub async fn run_ollama_model(
    model: &str,
    prompt: &str,
) -> Result<String, String> {
    let output = Command::new("ollama")
        .arg("run")
        .arg(model)
        .arg(prompt)
        .output()
        .await
        .map_err(|e| format!("Failed to execute ollama run: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
```

---

## References

- [Rust std::process Documentation](https://doc.rust-lang.org/std/process/index.html)
- [Tokio Process Documentation](https://docs.rs/tokio/latest/tokio/process/index.html)
- [Nix Process Management](https://docs.rs/nix/latest/nix/unistd/index.html)

---

## Related Documents

This document focuses on Rust implementation details. For broader context:

1. **[Tauri Command Execution Fundamentals](./01-tauri-command-execution-fundamentals.md)** - How to expose Rust functions as Tauri commands
2. **[GraphQL-Tauri Integration](./03-graphql-tauri-integration.md)** - Integrating these Rust patterns with GraphQL (though direct Node.js execution is recommended)
3. **[Ollama CLI Command Reference](./04-ollama-cli-command-reference.md)** - Specific Ollama command parsing examples in Rust
4. **[Security and Permissions](./05-security-permissions-command-execution.md)** - Security considerations for Rust command execution
5. **[Error Handling and Debugging](./06-error-handling-debugging.md)** - Comprehensive Rust error handling patterns
6. **[Practical Implementation Guide](./07-practical-implementation-guide.md)** - Complete implementation guide using these patterns
