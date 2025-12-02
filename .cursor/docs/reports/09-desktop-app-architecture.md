# Desktop App Architecture Guide - LLM UI Application

**Purpose**: Complete architectural overview for building a desktop application with Redwood.js, Tauri/Electron, covering server lifecycle, state management, cross-panel communication, and integration patterns.

**Target**: Full-stack developers implementing desktop application architecture  
**Date**: January 2025  
**Status**: Research Phase - Architecture Foundation  
**Size**: ~10KB (context window compatible)

---

## Executive Summary

This guide provides a comprehensive architecture for a desktop application combining Redwood.js (full-stack web framework) with Tauri/Electron (desktop framework). The architecture runs Redwood.js as a local server, serves the web frontend from the API server, manages state across three panels (file tree, editor, chat), and handles desktop-specific features like file system access and window management. Key patterns include embedded server lifecycle, single-origin deployment, state synchronization, and desktop app integration points.

**Key Recommendations**:
- Run Redwood.js API as embedded Node.js server in desktop app
- Serve Web and API from same origin (localhost:8911) to avoid CORS
- Use Redwood.js services for all file system operations
- Implement panel state management with React Context or Zustand
- Handle server lifecycle (start/stop) from desktop app main process

---

## Overall Architecture

### High-Level Architecture

```
Desktop Application Process
│
├── Desktop Framework (Tauri/Electron) Main Process
│   ├── Window Management
│   ├── File System Permissions
│   ├── System Integration
│   └── Redwood.js Server Lifecycle Manager
│       │
│       └── Redwood.js API Server (Embedded)
│           ├── GraphQL API
│           ├── REST Endpoints
│           ├── File System Services
│           ├── Ollama Integration Services
│           └── Static Web File Server
│
└── Desktop Framework Renderer Process
    └── Redwood.js Web Frontend
        ├── File Tree Panel (Left)
        ├── Editor Panel (Center)
        └── Chat Panel (Right)
```

### Component Layers

1. **Desktop Framework Layer**: Window, permissions, system integration
2. **Redwood.js API Layer**: Business logic, file operations, Ollama integration
3. **Redwood.js Web Layer**: React UI components, state management
4. **Integration Layer**: Communication between desktop and web layers

---

## Redwood.js Server Lifecycle

### Starting Redwood.js Server

**Tauri Pattern**:

```rust
// src-tauri/src/main.rs
use std::process::{Command, Child};
use tauri::Manager;

struct RedwoodServer {
    process: Option<Child>,
}

impl RedwoodServer {
    fn start(&mut self) -> Result<(), String> {
        let api_path = std::env::current_exe()
            .map_err(|e| format!("Failed to get exe path: {}", e))?
            .parent()
            .ok_or("No parent directory")?
            .join(".redwood")
            .join("build")
            .join("api")
            .join("index.js");
        
        let child = Command::new("node")
            .arg(api_path)
            .env("PORT", "8911")
            .spawn()
            .map_err(|e| format!("Failed to start Redwood server: {}", e))?;
        
        self.process = Some(child);
        
        // Wait for server to be ready
        std::thread::sleep(std::time::Duration::from_secs(2));
        
        Ok(())
    }
    
    fn stop(&mut self) {
        if let Some(mut process) = self.process.take() {
            let _ = process.kill();
        }
    }
}

fn main() {
    let mut redwood_server = RedwoodServer { process: None };
    
    tauri::Builder::default()
        .setup(|app| {
            redwood_server.start()
                .map_err(|e| eprintln!("Failed to start Redwood server: {}", e))?;
            
            // Cleanup on app exit
            app.handle().plugin(tauri_plugin_shell::init())?;
            
            Ok(())
        })
        .on_window_event(|_event| {
            // Handle window events
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    
    redwood_server.stop();
}
```

**Electron Pattern**:

```javascript
// electron/main.js
const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

let apiProcess = null
let mainWindow = null

function startRedwoodServer() {
  const apiPath = path.join(__dirname, '.redwood', 'build', 'api', 'index.js')
  
  apiProcess = spawn('node', [apiPath], {
    env: { ...process.env, PORT: '8911' },
    cwd: __dirname,
  })
  
  apiProcess.stdout.on('data', (data) => {
    console.log(`[Redwood] ${data}`)
  })
  
  apiProcess.stderr.on('data', (data) => {
    console.error(`[Redwood Error] ${data}`)
  })
  
  apiProcess.on('error', (error) => {
    console.error('Failed to start Redwood server:', error)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })
  
  // Wait for server to start, then load
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:8911')
  }, 2000)
}

app.whenReady().then(() => {
  startRedwoodServer()
  createWindow()
})

app.on('before-quit', () => {
  if (apiProcess) {
    apiProcess.kill()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

---

## State Management Across Panels

### Application State Structure

```typescript
// web/src/state/appState.ts
interface AppState {
  // File Tree State
  fileTree: {
    rootPath: string | null
    selectedPath: string | null
    expandedPaths: Set<string>
  }
  
  // Editor State
  editor: {
    openFilePath: string | null
    content: string
    hasUnsavedChanges: boolean
    language: string
  }
  
  // Chat State
  chat: {
    conversationId: string | null
    messages: ChatMessage[]
    selectedModel: string
    isStreaming: boolean
    fileContexts: string[]
  }
  
  // UI State
  ui: {
    leftPanelWidth: number
    rightPanelWidth: number
    theme: 'light' | 'dark'
  }
}
```

### State Management with Zustand

```typescript
// web/src/state/store.ts
import create from 'zustand'
import { AppState } from './appState'

interface AppStore extends AppState {
  // File Tree Actions
  setRootPath: (path: string) => void
  setSelectedPath: (path: string) => void
  toggleExpandedPath: (path: string) => void
  
  // Editor Actions
  openFile: (filePath: string, content: string) => void
  updateEditorContent: (content: string) => void
  markEditorSaved: () => void
  
  // Chat Actions
  setConversation: (id: string) => void
  addMessage: (message: ChatMessage) => void
  updateStreamingMessage: (content: string) => void
  addFileContext: (filePath: string) => void
  
  // UI Actions
  setLeftPanelWidth: (width: number) => void
  setRightPanelWidth: (width: number) => void
}

export const useAppStore = create<AppStore>((set) => ({
  // Initial state
  fileTree: {
    rootPath: null,
    selectedPath: null,
    expandedPaths: new Set(),
  },
  editor: {
    openFilePath: null,
    content: '',
    hasUnsavedChanges: false,
    language: 'text',
  },
  chat: {
    conversationId: null,
    messages: [],
    selectedModel: '',
    isStreaming: false,
    fileContexts: [],
  },
  ui: {
    leftPanelWidth: 250,
    rightPanelWidth: 400,
    theme: 'dark',
  },
  
  // Actions
  setRootPath: (path) => set((state) => ({
    fileTree: { ...state.fileTree, rootPath: path },
  })),
  
  setSelectedPath: (path) => set((state) => ({
    fileTree: { ...state.fileTree, selectedPath: path },
    editor: {
      ...state.editor,
      openFilePath: path,
      // Load file content
    },
  })),
  
  openFile: async (filePath, content) => set((state) => ({
    editor: {
      openFilePath: filePath,
      content,
      hasUnsavedChanges: false,
      language: detectLanguage(filePath),
    },
  })),
  
  addFileContext: (filePath) => set((state) => ({
    chat: {
      ...state.chat,
      fileContexts: [...state.chat.fileContexts, filePath],
    },
  })),
  
  // ... more actions
}))
```

---

## Cross-Panel Communication

### Event-Based Communication

```typescript
// web/src/lib/events.ts
export const emitFileSelected = (filePath: string) => {
  window.dispatchEvent(new CustomEvent('file-selected', {
    detail: { path: filePath }
  }))
}

export const emitFilePathForChat = (filePath: string) => {
  window.dispatchEvent(new CustomEvent('file-path-selected', {
    detail: { path: filePath }
  }))
}

// In components
useEffect(() => {
  const handleFileSelected = (event: CustomEvent<{ path: string }>) => {
    // Open file in editor
    openFile(event.detail.path)
  }
  
  window.addEventListener('file-selected', handleFileSelected as EventListener)
  return () => window.removeEventListener('file-selected', handleFileSelected as EventListener)
}, [])
```

### State-Based Communication

```typescript
// File Tree component updates state
const handleFileClick = (filePath: string) => {
  useAppStore.getState().setSelectedPath(filePath)
  // Editor component reacts to state change
}

// Editor component reads state
const openFilePath = useAppStore(state => state.editor.openFilePath)
useEffect(() => {
  if (openFilePath) {
    loadFile(openFilePath)
  }
}, [openFilePath])
```

---

## Desktop App Configuration

### Single-Origin Setup

**Redwood.js Configuration** (`redwood.toml`):

```toml
[web]
  port = 8911
  apiUrl = "http://localhost:8911"

[api]
  port = 8911

[browser]
  open = false
```

**Serve Static Files from API**:

```typescript
// api/src/functions/graphql.ts (or create custom server)
import express from 'express'
import path from 'path'

const app = express()

// Serve static web files
app.use(express.static(path.join(__dirname, '../../web/dist')))

// API routes
app.use('/api', apiRouter)

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../web/dist/index.html'))
})
```

### CORS Configuration

```typescript
// api/src/lib/cors.ts
export const corsConfig = {
  origin: [
    'http://localhost:8911',
    'tauri://localhost',
    'http://localhost:5173', // Dev mode
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}
```

---

## File System Integration Architecture

### Service Layer Pattern

```typescript
// api/src/services/files.ts
// All file operations go through API services
export const getDirectoryContents = async ({ path }: { path: string }) => {
  // Desktop app main process handles permissions
  // API service validates and processes
  return directoryData
}

// Frontend calls API, never accesses files directly
// web/src/components/FileTree/FileTreeCell.tsx
export const QUERY = gql`
  query GetDirectoryContents($path: String!) {
    directoryContents(path: $path) {
      files { name, path, type }
      folders { name, path, type }
    }
  }
`
```

---

## Resource Management

### Memory Management

- Cache file contents with size limits
- Clear unused file tree nodes
- Limit message history in memory
- Implement pagination for large directories

### Server Resource Management

- Monitor Redwood.js server memory usage
- Implement graceful shutdown
- Handle server crashes and restarts
- Clean up resources on app exit

---

## Error Handling Architecture

### Global Error Boundaries

```typescript
// web/src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo)
    // Log to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
```

### Server Error Handling

```typescript
// api/src/lib/errors.ts
export const handleServerError = (error: Error, context: string) => {
  logger.error(`[${context}]`, { error: error.message, stack: error.stack })
  
  // Return user-friendly error
  return {
    error: {
      message: userFriendlyMessage(error),
      code: error.code,
      context,
    },
  }
}
```

---

## Security Architecture

### Permission Model

**Tauri**: Capability-based security
- Explicit permission allowlist
- File system scope restrictions
- API command permissions

**Electron**: Context isolation
- nodeIntegration: false
- contextIsolation: true
- Preload scripts for secure IPC

### File System Security

- Whitelist allowed directories
- Validate all file paths
- Sanitize file content
- Restrict file operations to allowed scopes

---

## External Documentation Links

### Architecture Patterns
- [Redwood.js Architecture](https://redwoodjs.com/docs/introduction) - Framework architecture
- [Tauri Architecture](https://tauri.app/v1/guides/architecture) - Tauri architecture
- [Electron Architecture](https://www.electronjs.org/docs/latest/tutorial/application-architecture) - Electron architecture

### State Management
- [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
- [React Context](https://react.dev/reference/react/useContext) - Built-in state sharing

---

## Implementation Checklist

- [ ] Set up Redwood.js server lifecycle management
- [ ] Configure single-origin deployment
- [ ] Implement state management store
- [ ] Set up cross-panel communication
- [ ] Configure CORS for desktop app
- [ ] Implement error boundaries
- [ ] Set up file system service layer
- [ ] Configure security permissions
- [ ] Implement resource cleanup
- [ ] Test server start/stop lifecycle

---

## Next Steps

1. **Review Linux Build Packaging Guide**: Understand distribution process
2. **Review Component Library Evaluation**: Choose UI component library
3. **Begin MVP Implementation**: Set up project structure with architecture patterns

---

**Report Status**: Complete  
**Context Window Compatibility**: ~10KB - Can be loaded with 2-3 other reports simultaneously

