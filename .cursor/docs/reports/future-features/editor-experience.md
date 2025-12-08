# Editor Experience

**Related:** [index](./index.md) | [image-capabilities](./image-capabilities.md) | [vscode-integration](./vscode-integration.md)

---

## Rich Markdown Editing

**Goal:** Notion/Obsidian-style WYSIWYG with plaintext fallback.

**Primary Audience:** Context engineers trying to get quality output from local LLMs through easy-to-edit fully transparent simple local agentic workflows. This whole project is a PKM and tool builder for managing life notes to direct research and activity to building ideas.

### Features

- **Inline formatting**: Bold, italic, code without syntax
- **Block types**: Headers, lists, tables, code blocks
- **Embeds**: Images, videos, iframes
- **Live preview**: See rendering while typing
- **Vim mode**: For power users

### Toggle Modes

```
WYSIWYG Mode (default):
  ├─ Visual block editing
  ├─ Inline toolbar
  └─ Hidden markdown syntax

Source Mode (toggle):
  ├─ Raw markdown
  ├─ Syntax highlighting
  └─ Vim bindings

Split Mode:
  ├─ Edit source (left)
  └─ Live preview (right)
```

---

## Code Editing

**Goal:** VSCode-level editing experience.

### Features

- **Syntax highlighting**: 80+ languages
- **IntelliSense**: Local LSP servers
- **Multi-cursor**: VSCode-style editing
- **Git integration**: Inline diff, blame
- **Bracket matching**: Rainbow brackets
- **Minimap**: Code overview

### AI Assistance

```
Inline AI:
├─ Autocomplete (fast model, < 100ms)
├─ Code suggestions (fast model)
├─ Refactoring hints (background, slow model)
└─ Documentation generation (on-demand)
```

---

## File Tree Intelligence

**Goal:** Smart file navigation with AI insights.

### Features

- **Fuzzy search**: Instant file finding
- **Recent files**: MRU with keyboard shortcuts
- **Dependency graph**: Visual file relationships
- **AI annotations**:
  ```
  📁 src/
    📁 components/
      📄 Chat.tsx ⚡ Modified 2m ago
      📄 Editor.tsx 🔍 Related to current task
      📄 FileTree.tsx
  ```
- **Smart bookmarks**: AI-suggested important files

---

**See also:** [image-capabilities](./image-capabilities.md) for image integration, [vscode-integration](./vscode-integration.md) for compatibility features
