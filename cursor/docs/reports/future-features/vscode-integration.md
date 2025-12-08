# VSCode Integration

**Related:** [index](./index.md) | [editor-experience](./editor-experience.md) | [technical-architecture](./technical-architecture.md)

---

## Configuration Import

**Goal:** Use existing VSCode configs seamlessly.

### Supported Configs

```
settings.json:
├─ Editor preferences
├─ Keybindings
├─ Theme settings
└─ Language configs

keybindings.json:
├─ Import all custom bindings
└─ Map to Glyph Nova actions

extensions (future):
├─ Load VSCode extension API
├─ Run compatible extensions
└─ Auto-convert incompatible ones
```

---

## Theme Compatibility

**Goal:** Use VSCode themes natively.

```typescript
interface VSCodeTheme {
  name: string
  type: 'dark' | 'light'
  colors: Record<string, string> // UI colors
  tokenColors: TokenColor[] // Syntax highlighting
}

// Auto-convert to Glyph Nova theme
function convertVSCodeTheme(theme: VSCodeTheme): GlyphNovaTheme {
  return {
    editor: mapEditorColors(theme.colors),
    syntax: mapTokenColors(theme.tokenColors),
    ui: mapUIColors(theme.colors)
  }
}
```

---

## Extension API (Long-Term)

**Goal:** Run VSCode extensions with compatibility layer.

### Priority Extensions

1. **Language servers**: TypeScript, Python, Rust, Go
2. **Linters**: ESLint, Pylint, cargo-clippy
3. **Git**: GitLens, Git Graph
4. **Productivity**: Vim, Prettier, TODO Highlight

### Compatibility Strategy

```
Phase 1: Pure language servers (LSP standard)
Phase 2: Read-only extensions (linters, viewers)
Phase 3: Editor extensions (formatters, refactorings)
Phase 4: Full VSCode Extension API compatibility
```

---

**See also:** [editor-experience](./editor-experience.md) for editor features, [technical-architecture](./technical-architecture.md) for implementation details
