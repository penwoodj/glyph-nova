# Glyph Nova - Desktop Chat Application

A desktop application for chatting with local LLMs (via Ollama) with integrated file editing and automatic file context loading.

## Features

- 📁 **File Tree** - Browse and manage project files with VSCode-like interface
- ✏️ **Editor** - Edit markdown and code files (80+ languages) with syntax highlighting
- 💬 **Chat** - Interact with local LLMs via Ollama
- 🔗 **File Context** - Automatically load file contents into chat context
- 💾 **Auto-save** - Ctrl/Cmd+S to save files
- 🎨 **VSCode Theme** - Dark theme matching VSCode's appearance

## Prerequisites

1. **Node.js 18+** and **Yarn**
2. **Ollama** - Local LLM runtime

### Install Ollama

```bash
# Linux
curl -fsSL https://ollama.com/install.sh | sh

# macOS
brew install ollama

# Windows
# Download from https://ollama.com/download
```

### Pull a Model

```bash
# Choose one or more models
ollama pull llama2
ollama pull mistral
ollama pull codellama
```

## Installation

```bash
# Install dependencies
yarn install

# Build the project (optional, for production)
yarn rw build
```

## Running the Application

### Development Mode

```bash
# Start both API and web servers
yarn rw dev
```

The application will open at **http://localhost:8912**

### Production Mode

```bash
# Build first
yarn rw build

# Then serve
yarn rw serve
```

## Usage

### File Tree (Left Panel)

- Click folders to expand/collapse
- Click files to open in editor
- Right-click for context menu:
  - **Copy Path** - Copy file path to clipboard
  - **Copy Path to Chat** - Append file path to chat input

### Editor (Center Panel)

- **Markdown files** (.md) - Opens in Vditor with instant preview
- **Code files** - Opens with syntax highlighting
- **Ctrl/Cmd+S** - Save current file
- Unsaved changes tracked automatically

### Chat (Right Panel)

- **Model selector** - Choose Ollama model (top of panel)
- **Health indicator** - Shows Ollama connection status
- **File context** - Mention file paths in messages to include file content:
  - `/path/to/file.js help me fix this function`
  - Right-click file → "Copy Path to Chat"
- **Enter** - Send message
- **Shift+Enter** - New line

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Ollama API URL (default: http://localhost:11434)
OLLAMA_BASE_URL=http://localhost:11434

# Default folder to open (default: $HOME)
DEFAULT_FOLDER_PATH=/path/to/your/projects
```

### Ports

Default ports (configured in `redwood.toml`):
- Web: **8912**
- API: **8911**

## Development

### Storybook (Component Development)

Storybook configuration is included but requires additional setup for Redwood.js projects.

### Project Structure

```
glyph-nova/
├── api/                      # Backend (GraphQL API)
│   ├── src/
│   │   ├── graphql/         # GraphQL schemas and resolvers
│   │   │   ├── files.sdl.ts   # File operations API
│   │   │   └── chat.sdl.ts    # Chat operations API
│   │   └── services/        # Business logic
│   │       ├── files/         # File system operations
│   │       └── ollama/        # Ollama integration
├── web/                      # Frontend (React)
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Chat/          # Chat interface
│   │   │   ├── Editor/        # File editor
│   │   │   ├── FileTree/      # File tree
│   │   │   └── Layouts/       # Layout components
│   │   ├── pages/           # Page components
│   │   │   └── HomePage/      # Main application page
│   │   ├── services/        # Frontend services
│   │   │   └── context.ts     # File context loading
│   │   └── state/           # State management
│   │       └── store.ts       # Zustand store
└── src-tauri/               # Desktop app (Tauri - optional)
```

## Technologies Used

### Frontend
- **Redwood.js** - Full-stack React framework
- **React** - UI library
- **Zustand** - State management
- **Vditor** - Markdown editor
- **react-syntax-highlighter** - Code highlighting
- **react-markdown** - Markdown rendering
- **Tailwind CSS** - Styling

### Backend
- **GraphQL** - API layer
- **Node.js** - Runtime
- **Ollama** - LLM integration

### Desktop (Optional)
- **Tauri** - Desktop app framework

## Troubleshooting

### Ollama Not Connecting

1. Verify Ollama is running:
   ```bash
   ollama list  # Should show installed models
   ```

2. Check Ollama is accessible:
   ```bash
   curl http://localhost:11434/api/tags
   ```

3. Restart Ollama:
   ```bash
   # Linux/macOS
   ollama serve
   ```

### Port Already in Use

If ports 8911 or 8912 are in use, edit `redwood.toml` to change the ports.

### Build Errors

```bash
# Clean and reinstall dependencies
rm -rf node_modules
yarn install
yarn rw build
```

## License

MIT

## Support

For issues and questions, please create an issue in the repository.

---

**Built with Redwood.js and Ollama** 🚀
