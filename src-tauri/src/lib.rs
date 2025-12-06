mod redwood_server;

use redwood_server::RedwoodServer;
use std::sync::Mutex;
use tauri::Listener;

// Global server instance to manage lifecycle
static REDWOOD_SERVER: Mutex<Option<RedwoodServer>> = Mutex::new(None);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // Initialize logging
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Start Redwood server
      let mut server = RedwoodServer::new();
      if let Err(e) = server.start() {
        log::error!("Failed to start Redwood server: {}", e);
        // Don't fail app startup, but log the error
        // In production, you might want to show an error dialog
      } else {
        *REDWOOD_SERVER.lock().unwrap() = Some(server);
      }

      // Cleanup on app exit
      let app_handle = app.handle().clone();
      app_handle.listen("tauri://close-requested", move |_event| {
        if let Ok(mut server_guard) = REDWOOD_SERVER.lock() {
          if let Some(mut server) = server_guard.take() {
            server.stop();
          }
        }
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");

  // Ensure server is stopped on app exit
  if let Ok(mut server_guard) = REDWOOD_SERVER.lock() {
    if let Some(mut server) = server_guard.take() {
      server.stop();
    }
  }
}
