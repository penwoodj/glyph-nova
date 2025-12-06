/**
 * Redwood Server Lifecycle Management
 *
 * Manages the embedded Redwood.js server process lifecycle for the desktop app.
 * Starts the server when the app launches and stops it when the app exits.
 *
 * Reference: Report 09 (Server lifecycle patterns)
 */

use std::process::{Command, Child};
use std::env;

pub struct RedwoodServer {
    process: Option<Child>,
}

impl RedwoodServer {
    pub fn new() -> Self {
        Self { process: None }
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

        // Production: Start the built API server
        let current_dir = env::current_dir()
            .map_err(|e| format!("Failed to get current directory: {}", e))?;

        let api_path = current_dir
            .join(".redwood")
            .join("build")
            .join("api")
            .join("index.js");

        if !api_path.exists() {
            return Err(format!(
                "Redwood API build not found at: {}. Please run 'yarn redwood build' first.",
                api_path.display()
            ));
        }

        let child = Command::new("node")
            .arg(&api_path)
            .env("PORT", "8911")
            .env("NODE_ENV", "production")
            .current_dir(&current_dir)
            .spawn()
            .map_err(|e| format!("Failed to start Redwood server: {}", e))?;

        self.process = Some(child);

        // Wait a moment for server to start
        std::thread::sleep(std::time::Duration::from_secs(2));

        log::info!("Redwood server started successfully");
        Ok(())
    }

    pub fn stop(&mut self) {
        if let Some(mut process) = self.process.take() {
            log::info!("Stopping Redwood server...");
            let _ = process.kill();
            let _ = process.wait();
            log::info!("Redwood server stopped");
        }
    }
}

impl Drop for RedwoodServer {
    fn drop(&mut self) {
        self.stop();
    }
}

