/**
 * Redwood Server Lifecycle Management
 *
 * Manages the embedded Redwood.js server process lifecycle for the desktop app.
 * Starts the server when the app launches and stops it when the app exits.
 *
 * Reference: Report 09 (Server lifecycle patterns)
 */

use std::process::{Command, Child, Stdio};
use std::env;

#[cfg(unix)]
use std::os::unix::process::CommandExt;

pub struct RedwoodServer {
    api_process: Option<Child>,
    web_process: Option<Child>,
}

impl RedwoodServer {
    pub fn new() -> Self {
        Self {
            api_process: None,
            web_process: None,
        }
    }

    pub fn start(&mut self) -> Result<(), String> {
        // For development, we'll use the Redwood dev server
        // For production, we'll need the built API server

        let is_dev = env::var("TAURI_ENV").unwrap_or_else(|_| "production".to_string()) == "dev";

        if is_dev {
            // In development, Redwood dev server should be started manually
            // or we can start it here if needed
            log::info!("Redwood dev server should be running on http://localhost:8911");
            return Ok(());
        }

        // Production: Start the built API server using yarn rw serve api
        let current_dir = env::current_dir()
            .map_err(|e| format!("Failed to get current directory: {}", e))?;

        // Check if api/dist exists (confirms build was run)
        let api_dist = current_dir.join("api").join("dist");
        if !api_dist.exists() {
            return Err(format!(
                "Redwood API build not found at: {}. Please run 'yarn redwood build' first.",
                api_dist.display()
            ));
        }

        // Start the API server using yarn rw serve api
        // This is the correct way to start Redwood API in production
        log::info!("Starting Redwood API server from: {}", current_dir.display());
        log::info!("Command: yarn rw serve api --port 8911 --host 0.0.0.0");

        // Create command with process group (Unix) for proper cleanup
        let mut cmd = Command::new("yarn");
        cmd.arg("rw")
            .arg("serve")
            .arg("api")
            .arg("--port")
            .arg("8911")
            .arg("--host")
            .arg("0.0.0.0")
            .env("NODE_ENV", "production")
            .current_dir(&current_dir)
            .stdout(Stdio::inherit())  // Show server output in console
            .stderr(Stdio::inherit());  // Show server errors in console

        // On Unix, create a new process group so we can kill all children
        #[cfg(unix)]
        {
            unsafe {
                cmd.pre_exec(|| {
                    // Create new process group with same ID as PID
                    libc::setpgid(0, 0);
                    Ok(())
                });
            }
        }

        let child = cmd.spawn()
            .map_err(|e| format!("Failed to start Redwood API server: {}. Make sure yarn is in PATH.", e))?;

        self.api_process = Some(child);

        // Wait for API server to start
        log::info!("Waiting for Redwood API server to start on http://localhost:8911...");
        std::thread::sleep(std::time::Duration::from_secs(3));

        log::info!("Redwood API server should now be running on http://localhost:8911");
        log::info!("GraphQL endpoint: http://localhost:8911/graphql");

        // Start the web server on port 8912
        log::info!("Starting Redwood Web server...");
        log::info!("Command: yarn rw serve web --port 8912 --host 0.0.0.0");

        let mut web_cmd = Command::new("yarn");
        web_cmd.arg("rw")
            .arg("serve")
            .arg("web")
            .arg("--port")
            .arg("8912")
            .arg("--host")
            .arg("0.0.0.0")
            .current_dir(&current_dir)
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit());

        // Create process group for web server too
        #[cfg(unix)]
        {
            unsafe {
                web_cmd.pre_exec(|| {
                    libc::setpgid(0, 0);
                    Ok(())
                });
            }
        }

        let web_child = web_cmd.spawn()
            .map_err(|e| format!("Failed to start Redwood Web server: {}. Make sure yarn is in PATH.", e))?;

        self.web_process = Some(web_child);

        // Wait for web server to start
        log::info!("Waiting for Redwood Web server to start on http://localhost:8912...");
        std::thread::sleep(std::time::Duration::from_secs(3));

        log::info!("Redwood Web server should now be running on http://localhost:8912");
        Ok(())
    }

    pub fn stop(&mut self) {
        // Stop web server first
        if let Some(mut process) = self.web_process.take() {
            log::info!("Stopping Redwood Web server...");

            let pid = process.id();

            #[cfg(unix)]
            {
                log::info!("Killing web server process group for PID: {}", pid);
                unsafe {
                    libc::kill(-(pid as i32), libc::SIGTERM);
                }
                std::thread::sleep(std::time::Duration::from_millis(500));
                unsafe {
                    libc::kill(-(pid as i32), libc::SIGKILL);
                }
            }

            #[cfg(not(unix))]
            {
                let _ = process.kill();
            }

            let _ = process.wait();
            log::info!("Redwood Web server stopped");
        }

        // Stop API server
        if let Some(mut process) = self.api_process.take() {
            log::info!("Stopping Redwood API server...");

            let pid = process.id();

            #[cfg(unix)]
            {
                log::info!("Killing API server process group for PID: {}", pid);
                unsafe {
                    libc::kill(-(pid as i32), libc::SIGTERM);
                }
                std::thread::sleep(std::time::Duration::from_millis(500));
                unsafe {
                    libc::kill(-(pid as i32), libc::SIGKILL);
                }
            }

            #[cfg(not(unix))]
            {
                let _ = process.kill();
            }

            let _ = process.wait();
            log::info!("Redwood API server stopped");
        }
    }
}

impl Drop for RedwoodServer {
    fn drop(&mut self) {
        self.stop();
    }
}

