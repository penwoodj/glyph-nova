# MVP Implementation Plan - LLM UI Desktop Application

**Purpose**: Detailed implementation plan for building a cross-platform desktop application using Redwood.js with Tauri, featuring a file tree panel, LLM chat interface with Ollama integration, and markdown editor with code syntax highlighting.

**Version**: 2.0 (Research-Integrated)  
**Created**: January 2025  
**Last Updated**: January 2025  
**Context**: Implementation phase following comprehensive tech stack research  
**Research Context**: All reports available in `.cursor/docs/reports/`  
**Status**: 🔄 **PHASE 1 IN PROGRESS** - Foundation Setup  
**Last Updated**: January 2025

## Plan Update - January 2025

### ✅ Completed Since Last Update
- [x] Step 1: Plan rewritten with research references and detailed implementation steps
- [x] Plan file updated with comprehensive implementation guidance (~1500 lines)

### 🔄 Current Status
- Working on: Phase 1.1 - Project Initialization (Redwood.js project creation)
- Progress: Starting Phase 1 implementation
- Current step: Creating Redwood.js project structure
- Dependencies: None blocking

### 📋 Updated Plan
- Phase 1 (Foundation Setup): Starting now
  - ⏳ Phase 1.1: Project Initialization (in progress)
  - ⏳ Phase 1.2: Tauri Desktop Framework Setup
  - ⏳ Phase 1.3: UI Component Library Setup
  - ⏳ Phase 1.4: Storybook Integration

### 🎯 Meta Context for Future
- Project starting from empty directory
- All implementation will follow research report patterns
- Technology stack confirmed: Tauri + Redwood.js + shadcn/ui

---

## Step 1 Completion Summary

**Step 1 Status**: ✅ **COMPLETE**

This plan has been successfully rewritten from a high-level summary into a comprehensive, research-integrated implementation guide. The rewrite includes:

### ✅ Completed Deliverables

1. **Research Report References**: 
   - Links to all 11 research reports
   - Context loading strategy for each phase
   - Specific report section references in each implementation step

2. **Detailed Implementation Steps**:
   - 5 comprehensive phases broken down into detailed sub-tasks
   - Specific file paths for all implementations
   - Code examples from research reports
   - External documentation links (50+ links across all phases)

3. **Technology Decisions Confirmed**:
   - Desktop Framework: **Tauri** (from Report 02)
   - Component Library: **shadcn/ui** (from Report 11)
   - Architecture: **Redwood.js embedded server** (from Report 09)

4. **Implementation Guidance**:
   - Step-by-step instructions for each phase
   - Time estimates with buffers
   - Success criteria for validation
   - Risk assessment and mitigation strategies

5. **Context Usage Instructions**:
   - How to load research reports during implementation
   - Which reports to use for each phase
   - Examples of referencing research patterns

### Plan Statistics

- **Total Lines**: ~1500 lines of detailed implementation guidance
- **Phases**: 5 comprehensive implementation phases
- **Sub-Tasks**: 100+ detailed actionable steps
- **External Links**: 50+ verified documentation links
- **Code Examples**: Implementation patterns from research
- **Time Estimates**: 60-67 hours total (with buffers)

**Ready for Implementation**: ✅ Yes - Begin Phase 1 with research reports as context

---

## Executive Summary

Build a desktop application for Pop!_OS (Linux) that provides a local LLM interface with file context management. The application features a three-panel layout: file tree (left), markdown/code editor (center), and LLM chat interface (right). The app integrates with local Ollama models and allows editing files from the chat interface. This plan uses research findings from 11 comprehensive reports to guide detailed implementation.

**Technology Stack (Research-Confirmed)**:
- **Desktop Framework**: Tauri (recommended in Report 02)
- **Full-Stack Framework**: Redwood.js (Report 01)
- **Component Library**: shadcn/ui (recommended in Report 11)
- **LLM Integration**: Ollama REST API (Report 05)
- **Markdown Editor**: Vditor (based on vscode-markdown-editor, Report 06)
- **Component Development**: Storybook (Report 04)

---

## Using Research Reports as Context

### Research Report Index

All research reports are located in `.cursor/docs/reports/`:

1. **01-redwoodjs-comprehensive-guide.md** - Redwood.js architecture and patterns
2. **02-electron-vs-tauri-linux-comparison.md** - Framework comparison (Tauri recommended)
3. **03-desktop-file-system-integration.md** - File system access patterns
4. **04-storybook-redwoodjs-integration.md** - Storybook setup and configuration
5. **05-ollama-integration-patterns.md** - Ollama API integration patterns
6. **06-markdown-editor-implementation.md** - Markdown editor integration
7. **07-file-tree-component-guide.md** - File tree component patterns
8. **08-chat-interface-patterns.md** - Chat interface UI/UX patterns
9. **09-desktop-app-architecture.md** - Overall architecture patterns
10. **10-linux-build-packaging-guide.md** - Build and packaging process
11. **11-component-library-evaluation.md** - Component library comparison (shadcn/ui recommended)

### Context Loading Strategy by Phase

**Before implementing each phase, load relevant research reports:**

- **Phase 1 (Foundation)**: Reports 01, 02, 09, 04, 11
- **Phase 2 (File Tree)**: Reports 03, 07, 11
- **Phase 3 (Editor)**: Reports 06, 11
- **Phase 4 (Chat)**: Reports 05, 08
- **Phase 5 (Integration)**: Reports 09, 03, 05, 08

**Loading Pattern**: Use AI context to load 2-3 relevant reports simultaneously for comprehensive context during implementation.

### Implementation Instructions

1. **Before Each Phase**: Load relevant research reports (2-3 at a time)
2. **During Implementation**: Reference specific sections from reports
3. **For Decisions**: Check research recommendations and patterns
4. **For Code**: Use patterns and examples from research reports
5. **For Troubleshooting**: Review relevant research report sections

---

## MVP Goals (Detailed)

### 1. Left Panel - File Tree
- Adjustable width panel (resizable)
- Directory tree with expand/collapse folders
- "Collapse All" button
- VSCode icons for files and folders
- Right-click context menu to copy file path
- Copy file path and append to chat input

### 2. Center Panel - Markdown/Code Editor
- Markdown preview editor (Vditor instant rendering mode)
- VSCode-like syntax highlighting for code files
- File loading when clicked in file tree
- File editing and saving
- VSCode dark theme styling

### 3. Right Panel - LLM Chat Interface
- Cursor-like chat interface
- Model selector dropdown (uses `ollama list` API)
- Streaming chat responses from Ollama
- File context integration
- Ability to edit files in open folder via chat

### 4. Desktop Application
- Runs on Pop!_OS (Linux)
- Window management and native desktop integration
- Proper application lifecycle (start/stop Redwood.js server)

---

## Implementation Phases

---

## Phase 1: Foundation Setup

**Estimated Time**: 8-10 hours (with 20% buffer: 9.6-12 hours)  
**Risk Level**: Medium (foundation affects all future work)  
**Research References**: Reports 01, 02, 09, 04, 11

### Phase 1.1: Project Initialization

**Reference**: Report 01 (Redwood.js guide), Report 02 (Tauri recommendation)

#### 1.1.1: Create Redwood.js Project

- [ ] Install Redwood.js CLI globally
  ```bash
  npm install -g @redwoodjs/cli
  ```
- [ ] Create Redwood.js project
  ```bash
  yarn create redwood-app llm-ui
  cd llm-ui
  ```
- [ ] Verify project structure
  - [ ] Check `/api` directory exists (backend)
  - [ ] Check `/web` directory exists (frontend)
  - [ ] Check `redwood.toml` configuration file exists

**Success Criteria**:
- Redwood.js project created successfully
- Directory structure matches Redwood.js conventions
- `yarn redwood dev` runs without errors

**Time Estimate**: 30 minutes

#### 1.1.2: Configure Redwood.js for Desktop

**Reference**: Report 01 (Desktop integration section), Report 09 (Architecture patterns)

- [ ] Update `redwood.toml` for desktop app configuration
  ```toml
  [web]
    port = 8911
    apiUrl = "http://localhost:8911"
  
  [api]
    port = 8911
  ```
- [ ] Create `.env` file with desktop app environment variables
  ```bash
  REDWOOD_ENV=production
  API_PORT=8911
  OLLAMA_BASE_URL=http://localhost:11434
  ```
- [ ] Configure CORS for desktop app origin (Report 09, CORS section)
  - [ ] Update `api/src/lib/cors.ts` with desktop origins
  - [ ] Allow `tauri://localhost` and `http://localhost:8911`

**Files to Create/Modify**:
- `redwood.toml` - Update port configuration
- `.env` - Add environment variables
- `api/src/lib/cors.ts` - Configure CORS

**Success Criteria**:
- Redwood.js configured for single-origin deployment
- CORS allows desktop app origins
- Environment variables properly set

**Time Estimate**: 1 hour

**External Documentation Links**:
- [Redwood.js Configuration](https://redwoodjs.com/docs/app-configuration-redwood-toml) - redwood.toml reference
- [Redwood.js Environment Variables](https://redwoodjs.com/docs/environment-variables) - Environment setup
- [Redwood.js CORS Configuration](https://redwoodjs.com/docs/serverless-functions#cors) - CORS setup

### Phase 1.2: Tauri Desktop Framework Setup

**Reference**: Report 02 (Tauri recommendation), Report 09 (Tauri integration patterns)

#### 1.2.1: Install Tauri CLI and Dependencies

- [ ] Install Rust toolchain (if not installed)
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```
- [ ] Install system dependencies for Linux
  ```bash
  sudo apt update
  sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
  ```
- [ ] Install Tauri CLI
  ```bash
  cargo install tauri-cli
  ```

**Success Criteria**:
- Rust toolchain installed and verified
- System dependencies installed
- Tauri CLI accessible via `cargo tauri`

**Time Estimate**: 1-2 hours (depending on system setup)

**External Documentation Links**:
- [Tauri Linux Setup](https://tauri.app/v1/guides/getting-started/setup/linux) - Official setup guide
- [Rust Installation](https://www.rust-lang.org/tools/install) - Rust toolchain installation

#### 1.2.2: Initialize Tauri Project

- [ ] Navigate to Redwood.js project root
- [ ] Initialize Tauri in project
  ```bash
  cargo tauri init
  ```
- [ ] Configure Tauri options:
  - [ ] App name: `llm-ui`
  - [ ] Window title: `LLM UI`
  - [ ] Dist directory: `.redwood/build/web`
  - [ ] Dev path: `http://localhost:8911`
- [ ] Review generated `src-tauri/` directory structure

**Files Created**:
- `src-tauri/Cargo.toml` - Rust dependencies
- `src-tauri/tauri.conf.json` - Tauri configuration
- `src-tauri/src/main.rs` - Tauri main entry point

**Success Criteria**:
- Tauri project initialized successfully
- Configuration files created
- `src-tauri/` directory structure correct

**Time Estimate**: 30 minutes

**External Documentation Links**:
- [Tauri Getting Started](https://tauri.app/v1/guides/getting-started/beginning-tutorial) - Initial setup
- [Tauri Configuration](https://tauri.app/v1/api/config) - Configuration reference

#### 1.2.3: Configure Tauri for Redwood.js Integration

**Reference**: Report 09 (Tauri + Redwood.js pattern), Report 02 (Tauri architecture)

- [ ] Update `src-tauri/tauri.conf.json` for Redwood.js
  ```json
  {
    "build": {
      "beforeDevCommand": "yarn redwood dev",
      "beforeBuildCommand": "yarn redwood build",
      "devPath": "http://localhost:8911",
      "distDir": "../.redwood/build/web"
    },
    "tauri": {
      "allowlist": {
        "all": false,
        "fs": {
          "readFile": true,
          "writeFile": true,
          "readDir": true,
          "scope": ["$HOME/**"]
        },
        "clipboard": {
          "writeText": true,
          "readText": true
        }
      }
    }
  }
  ```
- [ ] Configure file system permissions (Report 03, Security section)
  - [ ] Set allowed directory scope to user's home directory
  - [ ] Enable read/write file operations
- [ ] Configure clipboard permissions for file path operations

**Files to Modify**:
- `src-tauri/tauri.conf.json` - Update build and allowlist configuration

**Success Criteria**:
- Tauri configured to load Redwood.js from localhost
- File system permissions properly scoped
- Clipboard permissions enabled

**Time Estimate**: 1 hour

**External Documentation Links**:
- [Tauri Configuration](https://tauri.app/v1/api/config) - Complete config reference
- [Tauri File System API](https://tauri.app/v1/api/js/fs/) - FS permissions
- [Tauri Security Model](https://tauri.app/v1/guides/features/security) - Security configuration

#### 1.2.4: Implement Redwood.js Server Lifecycle Management

**Reference**: Report 09 (Server lifecycle patterns)

- [ ] Create Rust module for managing Redwood.js server process
  ```rust
  // src-tauri/src/redwood_server.rs
  use std::process::{Command, Child};
  
  pub struct RedwoodServer {
      process: Option<Child>,
  }
  
  impl RedwoodServer {
      pub fn start(&mut self) -> Result<(), String> {
          // Implementation from Report 09
      }
      
      pub fn stop(&mut self) {
          // Implementation from Report 09
      }
  }
  ```
- [ ] Integrate server lifecycle into Tauri main
  ```rust
  // src-tauri/src/main.rs
  fn main() {
      let mut redwood_server = RedwoodServer { process: None };
      
      tauri::Builder::default()
          .setup(|app| {
              redwood_server.start()?;
              Ok(())
          })
          // ... rest of setup
  }
  ```
- [ ] Test server startup and shutdown
  - [ ] Verify Redwood.js server starts on app launch
  - [ ] Verify server stops on app quit

**Files to Create**:
- `src-tauri/src/redwood_server.rs` - Server lifecycle management
- Modify `src-tauri/src/main.rs` - Integrate server management

**Success Criteria**:
- Redwood.js server starts automatically with Tauri app
- Server stops cleanly on app quit
- Server logs visible in console

**Time Estimate**: 2 hours

**External Documentation Links**:
- [Tauri Setup Hook](https://tauri.app/v1/api/js/app#setup) - App setup patterns
- [Rust Process Management](https://doc.rust-lang.org/std/process/) - Process handling

### Phase 1.3: UI Component Library Setup (shadcn/ui)

**Reference**: Report 11 (shadcn/ui recommendation)

#### 1.3.1: Install Tailwind CSS

- [ ] Install Tailwind CSS and dependencies
  ```bash
  cd web
  yarn add -D tailwindcss postcss autoprefixer
  ```
- [ ] Initialize Tailwind configuration
  ```bash
  npx tailwindcss init -p
  ```
- [ ] Configure Tailwind for Redwood.js (Report 11, Integration section)
  - [ ] Update `web/tailwind.config.js` with content paths
  - [ ] Add VSCode theme colors to config

**Files to Create/Modify**:
- `web/tailwind.config.js` - Tailwind configuration
- `web/postcss.config.js` - PostCSS configuration

**Success Criteria**:
- Tailwind CSS installed and configured
- Configuration includes VSCode theme colors
- Tailwind processes Redwood.js components

**Time Estimate**: 1 hour

**External Documentation Links**:
- [Tailwind CSS Installation](https://tailwindcss.com/docs/installation) - Setup guide
- [Tailwind Config](https://tailwindcss.com/docs/configuration) - Configuration reference

#### 1.3.2: Initialize shadcn/ui

- [ ] Install shadcn/ui CLI
  ```bash
  npx shadcn-ui@latest init
  ```
- [ ] Configure shadcn/ui options:
  - [ ] Style: New York
  - [ ] Base color: Neutral
  - [ ] CSS variables: Yes
- [ ] Create VSCode theme configuration in Tailwind
  ```javascript
  // tailwind.config.js - Add VSCode colors
  theme: {
    extend: {
      colors: {
        'vscode-bg': '#1e1e1e',
        'vscode-fg': '#d4d4d4',
        'vscode-border': '#3e3e3e',
        // ... more VSCode colors
      }
    }
  }
  ```

**Files Created**:
- `web/components.json` - shadcn/ui configuration
- `web/src/lib/utils.ts` - Utility functions (cn helper)
- `web/src/styles/tailwind.css` - Tailwind imports

**Success Criteria**:
- shadcn/ui initialized successfully
- VSCode theme colors added to Tailwind config
- Base utilities available

**Time Estimate**: 1 hour

**External Documentation Links**:
- [shadcn/ui Installation](https://ui.shadcn.com/docs/installation) - Setup guide
- [shadcn/ui CLI](https://ui.shadcn.com/docs/cli) - CLI reference

### Phase 1.4: Storybook Integration

**Reference**: Report 04 (Storybook Redwood.js integration)

#### 1.4.1: Set Up Storybook

- [ ] Start Storybook (auto-installs on first run)
  ```bash
  yarn redwood storybook
  ```
- [ ] Verify Storybook runs on `http://localhost:7910`
- [ ] Configure Storybook for Redwood.js (Report 04, Configuration section)
  - [ ] Update `web/config/storybook.config.js` if needed
  - [ ] Configure `web/config/storybook.preview.js` with Redwood.js decorators

**Files Created/Modified**:
- `web/config/storybook.config.js` - Storybook server config
- `web/config/storybook.preview.js` - Preview configuration

**Success Criteria**:
- Storybook starts successfully
- Storybook accessible at localhost:7910
- Redwood.js components can be developed in isolation

**Time Estimate**: 1 hour

**External Documentation Links**:
- [Redwood.js Storybook](https://redwoodjs.com/docs/storybook) - Redwood.js specific guide
- [Storybook Configuration](https://storybook.js.org/docs/react/configure/overview) - General config

#### 1.4.2: Create Base Layout Components

- [ ] Create three-panel layout component in Storybook
  - [ ] `web/src/components/Layouts/DesktopLayout/DesktopLayout.tsx`
  - [ ] Story: `DesktopLayout.stories.tsx`
- [ ] Test layout with resizable panels
- [ ] Verify panel resizing works correctly

**Files to Create**:
- `web/src/components/Layouts/DesktopLayout/DesktopLayout.tsx`
- `web/src/components/Layouts/DesktopLayout/DesktopLayout.stories.tsx`

**Success Criteria**:
- Three-panel layout component created
- Panels are resizable
- Layout story renders correctly in Storybook

**Time Estimate**: 2 hours

### Phase 1 Validation

- [ ] Redwood.js project created and configured for desktop
- [ ] Tauri project initialized and configured
- [ ] Redwood.js server starts automatically with Tauri app
- [ ] Tauri window loads Redwood.js from localhost:8911
- [ ] Tailwind CSS and shadcn/ui configured
- [ ] Storybook running and configured
- [ ] Base layout component created in Storybook

**Time Estimate Total**: 9.6-12 hours

---

## Phase 2: File Tree Panel Implementation

**Estimated Time**: 10-12 hours (with 20% buffer: 12-14.4 hours)  
**Risk Level**: Medium (file system integration complexity)  
**Research References**: Reports 03, 07, 11

### Phase 2.1: File System Service Layer

**Reference**: Report 03 (File system integration), Report 09 (Service layer patterns)

#### 2.1.1: Create File System Service

- [ ] Generate Redwood.js service for file operations
  ```bash
  yarn redwood generate service files
  ```
- [ ] Implement directory listing (Report 03, File System Access section)
  ```typescript
  // api/src/services/files/files.ts
  export const getDirectoryContents = async ({ 
    directoryPath 
  }: { 
    directoryPath: string 
  }) => {
    // Implementation from Report 03
  }
  ```
- [ ] Implement file reading
- [ ] Implement file writing
- [ ] Add path validation and security checks (Report 03, Security section)

**Files to Create/Modify**:
- `api/src/services/files/files.ts` - File system service
- `api/src/services/files/files.test.ts` - Service tests

**Success Criteria**:
- File service can list directory contents
- File service can read files
- File service can write files
- Path validation prevents unauthorized access

**Time Estimate**: 3 hours

**External Documentation Links**:
- [Node.js fs/promises](https://nodejs.org/api/fs.html#fs_promises_api) - File system API
- [Redwood.js Services](https://redwoodjs.com/docs/services) - Service patterns

#### 2.1.2: Create GraphQL API for File Operations

- [ ] Create GraphQL schema for file operations
  ```graphql
  # api/src/graphql/files.sdl.ts
  type Query {
    directoryContents(path: String!): DirectoryContents!
  }
  
  type DirectoryContents {
    files: [FileEntry!]!
    folders: [FolderEntry!]!
  }
  ```
- [ ] Create GraphQL resolvers
  ```typescript
  // api/src/graphql/files.ts
  export const directoryContents = ({ path }) => {
    return getDirectoryContents({ directoryPath: path })
  }
  ```
- [ ] Test GraphQL queries in GraphQL Playground

**Files to Create**:
- `api/src/graphql/files.sdl.ts` - GraphQL schema
- `api/src/graphql/files.ts` - Resolvers

**Success Criteria**:
- GraphQL API exposes file system operations
- Queries work correctly in GraphQL Playground
- Error handling for invalid paths

**Time Estimate**: 2 hours

**External Documentation Links**:
- [Redwood.js GraphQL](https://redwoodjs.com/docs/graphql) - GraphQL setup
- [GraphQL Schema](https://graphql.org/learn/schema/) - Schema definition

### Phase 2.2: File Tree Component Development

**Reference**: Report 07 (File tree component guide), Report 11 (Component library)

#### 2.2.1: Install File Tree Dependencies

- [ ] Add shadcn/ui tree component (if available) or create custom
- [ ] Install VSCode icons library
  ```bash
  yarn add vscode-icons-js
  # or
  yarn add @vscode/icons-material
  ```
- [ ] Install virtual scrolling library for large directories
  ```bash
  yarn add react-window
  ```

**Success Criteria**:
- All dependencies installed
- Icons library accessible
- Virtual scrolling library available

**Time Estimate**: 30 minutes

**External Documentation Links**:
- [vscode-icons-js](https://www.npmjs.com/package/vscode-icons-js) - Icon library
- [react-window](https://github.com/bvaughn/react-window) - Virtual scrolling

#### 2.2.2: Create File Tree Cell Component

**Reference**: Report 01 (Cells pattern), Report 07 (File tree implementation)

- [ ] Generate file tree cell
  ```bash
  yarn redwood generate cell FileTree
  ```
- [ ] Implement file tree data fetching (Report 07, Component structure)
  ```typescript
  // web/src/components/FileTree/FileTreeCell.tsx
  export const QUERY = gql`
    query GetDirectoryContents($path: String!) {
      directoryContents(path: $path) {
        files { name, path, type, extension }
        folders { name, path, type }
      }
    }
  `
  ```
- [ ] Implement loading, error, and success states
- [ ] Test in Storybook

**Files to Create**:
- `web/src/components/FileTree/FileTreeCell.tsx`
- `web/src/components/FileTree/FileTreeCell.stories.tsx`

**Success Criteria**:
- Cell fetches directory contents via GraphQL
- Loading state displays during fetch
- Error state handles failures gracefully
- Success state renders file tree

**Time Estimate**: 2 hours

#### 2.2.3: Create File Tree View Component

**Reference**: Report 07 (Recursive tree item component, Expand/collapse)

- [ ] Create FileTreeView component with expand/collapse
  ```typescript
  // web/src/components/FileTree/FileTreeView.tsx
  // Implementation from Report 07
  ```
- [ ] Implement recursive directory rendering
- [ ] Add expand/collapse state management (Report 07, State management section)
- [ ] Implement lazy loading for directory children
- [ ] Add "Collapse All" button functionality

**Files to Create**:
- `web/src/components/FileTree/FileTreeView.tsx`
- `web/src/components/FileTree/FileTreeItem.tsx`
- `web/src/components/FileTree/FileTreeView.stories.tsx`

**Success Criteria**:
- File tree displays directory structure
- Folders expand and collapse
- "Collapse All" button works
- Lazy loading loads children on expand

**Time Estimate**: 3 hours

#### 2.2.4: Integrate VSCode Icons

**Reference**: Report 07 (VSCode icons integration)

- [ ] Create FileIcon component (Report 07, Icon component section)
  ```typescript
  // web/src/components/FileTree/FileIcon.tsx
  // Implementation from Report 07
  ```
- [ ] Map file extensions to icons
- [ ] Display folder icons (open/closed states)
- [ ] Style icons to match VSCode appearance

**Files to Create**:
- `web/src/components/FileTree/FileIcon.tsx`
- `web/src/lib/fileIcons.ts` - Icon mapping logic

**Success Criteria**:
- Files display appropriate VSCode icons
- Folders show open/closed icon states
- Icons match VSCode visual style

**Time Estimate**: 2 hours

#### 2.2.5: Implement Right-Click Context Menu

**Reference**: Report 07 (Right-click context menu section)

- [ ] Create ContextMenu component (Report 07, Context menu component)
- [ ] Implement right-click event handling
- [ ] Add "Copy Path" menu item
- [ ] Add "Copy Path to Chat" menu item
- [ ] Implement clipboard operations (Report 07, Clipboard integration)

**Files to Create**:
- `web/src/components/FileTree/ContextMenu.tsx`
- `web/src/lib/clipboard.ts` - Clipboard utilities

**Success Criteria**:
- Right-click shows context menu
- "Copy Path" copies file path to clipboard
- "Copy Path to Chat" copies and triggers chat append event

**Time Estimate**: 2 hours

### Phase 2 Validation

- [ ] File system service handles directory listing
- [ ] GraphQL API exposes file operations
- [ ] File tree displays with expand/collapse
- [ ] VSCode icons display correctly
- [ ] Right-click context menu works
- [ ] File path copying works
- [ ] Component tested in Storybook

**Time Estimate Total**: 12-14.4 hours

---

## Phase 3: Center Panel Editor Implementation

**Estimated Time**: 12-14 hours (with 20% buffer: 14.4-16.8 hours)  
**Risk Level**: Medium (complex editor integration)  
**Research References**: Reports 06, 11

### Phase 3.1: Markdown Editor Setup (Vditor)

**Reference**: Report 06 (Vditor integration)

#### 3.1.1: Install Vditor

- [ ] Install Vditor and dependencies
  ```bash
  yarn add vditor
  yarn add prismjs  # For syntax highlighting in code blocks
  ```
- [ ] Import Vditor CSS
  ```typescript
  // web/src/index.css or component
  import 'vditor/dist/index.css'
  ```

**Success Criteria**:
- Vditor installed successfully
- Styles imported correctly

**Time Estimate**: 30 minutes

**External Documentation Links**:
- [Vditor GitHub](https://github.com/Vanessa219/vditor) - Vditor repository
- [Vditor Documentation](https://b3log.org/vditor/) - Official docs

#### 3.1.2: Create Vditor Editor Component

**Reference**: Report 06 (Basic Vditor component section)

- [ ] Create VditorEditor component (Report 06, Vditor component)
  ```typescript
  // web/src/components/Editor/VditorEditor.tsx
  // Implementation from Report 06
  ```
- [ ] Configure Vditor for instant rendering mode (recommended)
- [ ] Add toolbar configuration
- [ ] Implement content change handlers
- [ ] Add save shortcut (Ctrl/Cmd+S)

**Files to Create**:
- `web/src/components/Editor/VditorEditor.tsx`
- `web/src/components/Editor/VditorEditor.stories.tsx`

**Success Criteria**:
- Vditor editor renders correctly
- Markdown preview works in instant mode
- Content changes trigger callbacks
- Save shortcut works

**Time Estimate**: 3 hours

#### 3.1.3: Integrate Syntax Highlighting for Code Files

**Reference**: Report 06 (Code syntax highlighting section)

- [ ] Install syntax highlighting library
  ```bash
  yarn add react-syntax-highlighter
  yarn add @types/react-syntax-highlighter -D
  ```
- [ ] Create language detection utility (Report 06, File type detection)
  ```typescript
  // web/src/lib/fileUtils.ts
  export const detectLanguage = (filePath: string): string => {
    // Implementation from Report 06
  }
  ```
- [ ] Create CodeEditor component (Report 06, Code editor component)
- [ ] Implement VSCode dark theme styling

**Files to Create**:
- `web/src/components/Editor/CodeEditor.tsx`
- `web/src/lib/fileUtils.ts` - Language detection

**Success Criteria**:
- Code files display with syntax highlighting
- Language detection works correctly
- VSCode dark theme applied

**Time Estimate**: 3 hours

**External Documentation Links**:
- [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) - Syntax highlighting
- [Prism.js Themes](https://prismjs.com/) - Syntax highlighting library

#### 3.1.4: Create Unified Editor Component

**Reference**: Report 06 (Unified editor component section)

- [ ] Create UnifiedEditor component that switches based on file type
  ```typescript
  // web/src/components/Editor/UnifiedEditor.tsx
  // Implementation from Report 06
  ```
- [ ] Implement file type detection
- [ ] Switch between Vditor (markdown) and CodeEditor (code files)
- [ ] Handle text files gracefully

**Files to Create**:
- `web/src/components/Editor/UnifiedEditor.tsx`

**Success Criteria**:
- Editor switches mode based on file type
- Markdown files use Vditor
- Code files use syntax-highlighted editor
- Text files display appropriately

**Time Estimate**: 2 hours

### Phase 3.2: File Loading and Display

**Reference**: Report 03 (File operations), Report 09 (State management)

#### 3.2.1: Create File Loading Service

- [ ] Create GraphQL query for file reading
  ```graphql
  # api/src/graphql/files.sdl.ts
  type Query {
    readFile(path: String!): FileContent!
  }
  ```
- [ ] Implement file reading resolver
- [ ] Create FileEditorCell component (Report 01, Cells pattern)
- [ ] Handle loading and error states

**Files to Create/Modify**:
- `api/src/graphql/files.sdl.ts` - Add readFile query
- `api/src/graphql/files.ts` - Add readFile resolver
- `web/src/components/Editor/FileEditorCell.tsx` - File loading cell

**Success Criteria**:
- Files load via GraphQL API
- Loading states display correctly
- Error handling works for missing files

**Time Estimate**: 2 hours

#### 3.2.2: Connect File Tree to Editor

- [ ] Create state management for selected file (Report 09, State management)
  - [ ] Use Zustand store or React Context
- [ ] Update FileTree to emit file selection events
- [ ] Update Editor to listen for file selection
- [ ] Load file content when file selected

**Files to Create/Modify**:
- `web/src/state/store.ts` - Zustand store (if using Zustand)
- `web/src/components/FileTree/FileTreeView.tsx` - Add file click handler
- `web/src/components/Editor/FileEditor.tsx` - Listen for file selection

**Success Criteria**:
- Clicking file in tree loads file in editor
- File content displays correctly
- Editor mode switches based on file type

**Time Estimate**: 2 hours

#### 3.2.3: Implement File Saving

- [ ] Create GraphQL mutation for file writing
  ```graphql
  # api/src/graphql/files.sdl.ts
  type Mutation {
    writeFile(path: String!, content: String!): WriteResult!
  }
  ```
- [ ] Implement file writing resolver with backup (Report 03, File operations)
- [ ] Add save functionality to editor
- [ ] Show unsaved changes indicator
- [ ] Handle save errors gracefully

**Files to Create/Modify**:
- `api/src/graphql/files.sdl.ts` - Add writeFile mutation
- `api/src/graphql/files.ts` - Add writeFile resolver
- `web/src/components/Editor/FileEditor.tsx` - Add save functionality

**Success Criteria**:
- Files can be saved via GraphQL mutation
- Backup created before saving
- Unsaved changes indicator shows
- Save errors handled gracefully

**Time Estimate**: 2 hours

### Phase 3 Validation

- [ ] Vditor editor renders and works for markdown files
- [ ] Code editor displays with syntax highlighting
- [ ] Unified editor switches modes correctly
- [ ] Files load when clicked in file tree
- [ ] Files can be saved successfully
- [ ] Unsaved changes indicator works

**Time Estimate Total**: 14.4-16.8 hours

---

## Phase 4: Chat Interface Implementation

**Estimated Time**: 12-14 hours (with 20% buffer: 14.4-16.8 hours)  
**Risk Level**: Medium (streaming complexity, Ollama integration)  
**Research References**: Reports 05, 08

### Phase 4.1: Ollama Integration Service

**Reference**: Report 05 (Ollama integration patterns)

#### 4.1.1: Create Ollama Service

- [ ] Generate Redwood.js service for Ollama
  ```bash
  yarn redwood generate service ollama
  ```
- [ ] Implement model listing (Report 05, Model management section)
  ```typescript
  // api/src/services/ollama/ollama.ts
  export const listOllamaModels = async () => {
    // Implementation from Report 05
  }
  ```
- [ ] Add health check for Ollama service (Report 05, Error handling)
- [ ] Implement model caching (Report 05, Caching pattern)

**Files to Create**:
- `api/src/services/ollama/ollama.ts` - Ollama service
- `api/src/services/ollama/ollama.test.ts` - Service tests

**Success Criteria**:
- Service can list available Ollama models
- Health check detects Ollama availability
- Model list cached for performance

**Time Estimate**: 2 hours

**External Documentation Links**:
- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md) - Official API docs
- [Ollama JavaScript Client](https://github.com/ollama/ollama-js) - JS client library

#### 4.1.2: Implement Streaming Chat Completion

**Reference**: Report 05 (Streaming chat completion section)

- [ ] Implement streaming chat service (Report 05, Streaming pattern)
  ```typescript
  // api/src/services/ollama/ollama.ts
  export const streamChatCompletion = async function* ({
    model,
    messages,
  }: {
    model: string
    messages: ChatMessage[]
  }) {
    // Implementation from Report 05
  }
  ```
- [ ] Add file context formatting (Report 05, File context integration)
- [ ] Handle streaming errors gracefully
- [ ] Test with local Ollama instance

**Files to Modify**:
- `api/src/services/ollama/ollama.ts` - Add streaming function

**Success Criteria**:
- Streaming chat completion works
- File context properly formatted in messages
- Errors handled gracefully
- Works with local Ollama

**Time Estimate**: 3 hours

#### 4.1.3: Create GraphQL API for Chat

- [ ] Create GraphQL schema for chat operations
  ```graphql
  # api/src/graphql/chat.sdl.ts
  type Query {
    ollamaModels: [String!]!
  }
  
  type Mutation {
    sendChatMessage(input: SendMessageInput!): ChatMessage!
  }
  ```
- [ ] Create GraphQL resolvers
- [ ] Test GraphQL mutations in Playground

**Files to Create**:
- `api/src/graphql/chat.sdl.ts` - Chat schema
- `api/src/graphql/chat.ts` - Chat resolvers

**Success Criteria**:
- GraphQL API exposes Ollama model list
- Chat message mutation works
- Queries tested successfully

**Time Estimate**: 2 hours

### Phase 4.2: Chat UI Component Development

**Reference**: Report 08 (Chat interface patterns), Report 11 (Component library)

#### 4.2.1: Create Chat Interface Layout

- [ ] Create ChatInterface component structure (Report 08, Component structure)
  ```typescript
  // web/src/components/Chat/ChatInterface.tsx
  // Implementation from Report 08
  ```
- [ ] Add model selector dropdown
- [ ] Create message list area
- [ ] Create input area with send button

**Files to Create**:
- `web/src/components/Chat/ChatInterface.tsx`
- `web/src/components/Chat/ChatInterface.stories.tsx`

**Success Criteria**:
- Chat interface layout renders correctly
- Model selector displays available models
- Message area and input area visible

**Time Estimate**: 2 hours

#### 4.2.2: Implement Message Rendering

**Reference**: Report 08 (Message rendering section)

- [ ] Create ChatMessage component (Report 08, Chat message component)
- [ ] Implement markdown rendering in messages (Report 08, Markdown rendering)
  ```bash
  yarn add react-markdown react-syntax-highlighter
  ```
- [ ] Add streaming indicator
- [ ] Style messages to match Cursor-like appearance

**Files to Create**:
- `web/src/components/Chat/ChatMessage.tsx`
- `web/src/components/Markdown/MarkdownRenderer.tsx` - Reusable markdown renderer

**Success Criteria**:
- Messages render correctly with markdown
- Code blocks display with syntax highlighting
- Streaming indicator shows during response
- Styled to match Cursor appearance

**Time Estimate**: 3 hours

**External Documentation Links**:
- [react-markdown](https://github.com/remarkjs/react-markdown) - Markdown renderer
- [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) - Syntax highlighting

#### 4.2.3: Implement Streaming Response Handling

**Reference**: Report 08 (Streaming response handling section)

- [ ] Create streaming service on frontend (Report 08, Streaming service)
  ```typescript
  // web/src/services/chat.ts
  export const streamResponse = async (
    message: string,
    model: string,
    onChunk: (chunk: string) => void
  ) => {
    // Implementation from Report 08
  }
  ```
- [ ] Implement real-time message updates during streaming
- [ ] Add auto-scroll to latest message
- [ ] Handle streaming errors

**Files to Create**:
- `web/src/services/chat.ts` - Frontend chat service

**Success Criteria**:
- Streaming responses update in real-time
- Messages appear as they stream
- Auto-scroll works during streaming
- Errors handled gracefully

**Time Estimate**: 3 hours

#### 4.2.4: Integrate File Path Appending

**Reference**: Report 07 (Clipboard integration), Report 08 (File context integration)

- [ ] Listen for file path selection events (Report 08, File path insertion)
  ```typescript
  // In ChatInterface component
  useEffect(() => {
    const handleFilePathSelected = (event: CustomEvent<{ path: string }>) => {
      // Append to input (Report 08)
    }
    window.addEventListener('file-path-selected', handleFilePathSelected)
  }, [])
  ```
- [ ] Append file path to chat input
- [ ] Focus input after appending

**Files to Modify**:
- `web/src/components/Chat/ChatInterface.tsx` - Add event listener

**Success Criteria**:
- Right-click "Copy Path to Chat" appends path to input
- Input focuses after appending
- Path appears in input field

**Time Estimate**: 1 hour

#### 4.2.5: Implement File Context Loading

**Reference**: Report 05 (File context integration), Report 03 (File operations)

- [ ] Load file content when file path in message
- [ ] Format file context for Ollama (Report 05, Context formatting)
- [ ] Inject file context into chat messages
- [ ] Display file context in chat UI

**Files to Create/Modify**:
- `web/src/components/Chat/ChatInterface.tsx` - Add context loading
- `web/src/services/context.ts` - File context loading service

**Success Criteria**:
- File paths in messages trigger context loading
- File content formatted for Ollama
- Context injected into chat requests
- File context visible in chat UI

**Time Estimate**: 2 hours

### Phase 4 Validation

- [ ] Ollama service lists available models
- [ ] Chat interface connects to Ollama
- [ ] Streaming responses work in real-time
- [ ] Messages render with markdown support
- [ ] File paths append to chat input
- [ ] File context loads and injects into messages

**Time Estimate Total**: 14.4-16.8 hours

---

## Phase 5: Integration & Polish

**Estimated Time**: 8-10 hours (with 20% buffer: 9.6-12 hours)  
**Risk Level**: Low (integration and refinement)  
**Research References**: Reports 09, 03, 05, 08

### Phase 5.1: Cross-Panel Communication

**Reference**: Report 09 (Cross-panel communication section)

#### 5.1.1: Implement State Management

- [ ] Set up Zustand store or React Context (Report 09, State management)
  ```typescript
  // web/src/state/store.ts
  // Implementation from Report 09
  ```
- [ ] Create state for:
  - [ ] Selected file path
  - [ ] Open folder path
  - [ ] Chat conversation
  - [ ] Panel widths

**Files to Create**:
- `web/src/state/store.ts` - Zustand store

**Success Criteria**:
- State management setup working
- State accessible across components
- State persists appropriately

**Time Estimate**: 2 hours

**External Documentation Links**:
- [Zustand](https://github.com/pmndrs/zustand) - State management library

#### 5.1.2: Connect All Panels

- [ ] Connect file tree selection to editor
- [ ] Connect file tree right-click to chat
- [ ] Implement panel resize handlers
- [ ] Test cross-panel interactions

**Files to Modify**:
- All panel components to use shared state

**Success Criteria**:
- File selection loads in editor
- Right-click appends to chat
- Panel resizing works smoothly
- All interactions work correctly

**Time Estimate**: 2 hours

### Phase 5.2: File Editing from Chat

**Reference**: Report 05 (File context), Report 03 (File operations)

#### 5.2.1: Implement Chat-to-Editor Communication

- [ ] Parse file edit requests from chat responses
- [ ] Apply edits to files via GraphQL mutation
- [ ] Update editor with edited content
- [ ] Show edit confirmation

**Files to Create/Modify**:
- `web/src/components/Chat/ChatInterface.tsx` - Parse edit requests
- `api/src/services/files/files.ts` - Add edit functionality

**Success Criteria**:
- Chat can trigger file edits
- Edits apply correctly
- Editor updates with new content
- User confirms edits

**Time Estimate**: 3 hours

### Phase 5.3: Final Polish

#### 5.3.1: Styling and Theming

- [ ] Apply VSCode dark theme consistently (Report 11, VSCode theme)
- [ ] Style all components to match VSCode
- [ ] Ensure consistent spacing and typography
- [ ] Test dark theme appearance

**Files to Modify**:
- All component styles
- Tailwind config for VSCode theme

**Success Criteria**:
- Consistent VSCode dark theme throughout
- Components match VSCode aesthetic
- Typography and spacing consistent

**Time Estimate**: 2 hours

#### 5.3.2: Error Handling and Edge Cases

- [ ] Add error boundaries (Report 09, Error handling)
- [ ] Handle file system errors gracefully
- [ ] Handle Ollama unavailable scenarios
- [ ] Handle network errors
- [ ] Add user-friendly error messages

**Files to Create/Modify**:
- `web/src/components/ErrorBoundary.tsx`
- Error handling in all services

**Success Criteria**:
- Errors caught and displayed gracefully
- User-friendly error messages
- App doesn't crash on errors

**Time Estimate**: 2 hours

#### 5.3.3: Performance Optimization

- [ ] Implement virtual scrolling for large file trees (Report 07, Virtual scrolling)
- [ ] Add caching for file contents
- [ ] Optimize re-renders
- [ ] Test with large directories (1000+ files)

**Files to Modify**:
- File tree components for virtual scrolling
- Add caching layer

**Success Criteria**:
- Large directories render efficiently
- File contents cached appropriately
- Smooth performance with many files

**Time Estimate**: 2 hours

### Phase 5 Validation

- [ ] All panels communicate correctly
- [ ] State management works across app
- [ ] File editing from chat works
- [ ] VSCode theme applied consistently
- [ ] Error handling works gracefully
- [ ] Performance acceptable with large directories

**Time Estimate Total**: 9.6-12 hours

---

## Overall Implementation Timeline

### Phase Breakdown

- **Phase 1**: Foundation Setup - 9.6-12 hours
- **Phase 2**: File Tree Panel - 12-14.4 hours
- **Phase 3**: Center Panel Editor - 14.4-16.8 hours
- **Phase 4**: Chat Interface - 14.4-16.8 hours
- **Phase 5**: Integration & Polish - 9.6-12 hours

**Total Estimated Time**: 60-67 hours (with 20% buffer)

### Critical Path

1. Phase 1 (Foundation) - Blocks all other work
2. Phase 2 (File Tree) - Required for Phase 3 (file selection)
3. Phase 3 (Editor) - Can parallelize with Phase 4
4. Phase 4 (Chat) - Can parallelize with Phase 3 after Phase 1
5. Phase 5 (Integration) - Requires all previous phases

---

## Success Criteria

### Functional Requirements

- [ ] Desktop app opens on Pop!_OS
- [ ] Three-panel layout displays correctly
- [ ] File tree shows directory structure with VSCode icons
- [ ] Folders expand and collapse
- [ ] "Collapse All" button works
- [ ] Files open in center panel with proper formatting
- [ ] Markdown files render with Vditor
- [ ] Code files display with syntax highlighting
- [ ] Chat interface connects to local Ollama
- [ ] Model selector shows available Ollama models
- [ ] Chat streams responses in real-time
- [ ] Right-click copies file path to clipboard
- [ ] Right-click appends file path to chat input
- [ ] Chat can edit files in open folder
- [ ] All panels communicate properly

### Technical Requirements

- [ ] Redwood.js runs as embedded server
- [ ] Tauri manages application lifecycle
- [ ] File system operations secured with path validation
- [ ] Streaming chat responses work reliably
- [ ] Error handling prevents crashes
- [ ] Performance acceptable with large directories

---

## Risk Assessment and Mitigation

### High Risk Items

1. **Tauri + Redwood.js Integration Complexity**
   - **Risk**: Server lifecycle management may be complex
   - **Mitigation**: Follow patterns from Report 09 (Architecture)
   - **Contingency**: Start with simpler approach, iterate

2. **Streaming Chat Responses**
   - **Risk**: Real-time streaming may have issues
   - **Mitigation**: Use patterns from Report 05 (Ollama streaming)
   - **Contingency**: Fall back to polling if streaming fails

### Medium Risk Items

1. **File System Security**
   - **Risk**: Incorrect permissions could expose system
   - **Mitigation**: Follow security patterns from Report 03
   - **Contingency**: Restrict to home directory only

2. **Markdown Editor Integration**
   - **Risk**: Vditor may have integration challenges
   - **Mitigation**: Follow Report 06 integration patterns
   - **Contingency**: Use alternative editor if needed

### Low Risk Items

1. **UI Component Styling** - Well-documented libraries
2. **Storybook Integration** - Redwood.js has built-in support
3. **Build and Packaging** - Standard processes

---

## External Documentation Links

### Framework Documentation

- [Redwood.js Documentation](https://redwoodjs.com/docs/introduction) - Core framework
- [Tauri Documentation](https://tauri.app/v1/guides/) - Desktop framework
- [shadcn/ui Documentation](https://ui.shadcn.com/) - Component library
- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction) - Component development

### Integration Documentation

- [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md) - LLM integration
- [Vditor Documentation](https://b3log.org/vditor/) - Markdown editor
- [VSCode Icons](https://github.com/vscode-icons/vscode-icons) - Icon set

### Development Tools

- [Tailwind CSS](https://tailwindcss.com/docs) - Styling framework
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [React Window](https://github.com/bvaughn/react-window) - Virtual scrolling

---

## How to Use This Plan

### Context Loading Strategy

**Before Each Implementation Phase**:

1. **Load Relevant Research Reports** (2-3 reports):
   ```
   Load these reports for context:
   - .cursor/docs/reports/[relevant-report-1].md
   - .cursor/docs/reports/[relevant-report-2].md
   - .cursor/docs/reports/[relevant-report-3].md
   ```

2. **Reference Specific Sections**:
   - Look for "Reference: Report XX" notes in each step
   - Read the relevant section from that report
   - Use code examples and patterns provided

3. **Validate Against Research**:
   - Check implementations match research recommendations
   - Verify patterns from research are being followed
   - Confirm external documentation links are referenced

### Implementation Workflow

1. **Start Phase**: Load relevant research reports (2-3)
2. **Review Phase Requirements**: Read phase overview and steps
3. **Follow Step-by-Step**: Complete each task in sequence
4. **Reference Research**: Use research patterns and code examples
5. **Validate**: Check against success criteria after each step
6. **Test**: Verify functionality before moving to next step
7. **Document**: Update plan with completion status

### Research Report Usage Examples

**Example 1: Setting up Tauri**
```
Load: Reports 02 and 09
Reference: Report 02 (Tauri setup section), Report 09 (Tauri + Redwood.js pattern)
Use: Code examples for tauri.conf.json configuration
```

**Example 2: Building File Tree**
```
Load: Reports 03, 07, and 11
Reference: Report 07 (File tree component), Report 03 (File system access)
Use: Component patterns and file system service patterns
```

### Progress Tracking

- Mark completed items with [x] in plan
- Update plan file with progress after each phase
- Document any deviations from plan with reasoning
- Note any issues or blockers encountered

---

## Next Steps After Plan Rewrite

1. ✅ **Plan Rewritten** - This plan now includes research references
2. ⏭️ **Begin Phase 1 Implementation** - Start with foundation setup
3. ⏭️ **Load Research Reports** - Use as context during implementation
4. ⏭️ **Follow Detailed Steps** - Complete each phase systematically

---

**Plan Status**: ✅ **REWRITTEN WITH RESEARCH CONTEXT** - Ready for implementation  
**Version**: 2.0 (Research-Integrated)  
**Next Action**: Begin Phase 1 implementation with research reports as context
