# Markdown Editor Implementation Guide - VSCode-Markdown-Editor Integration

**Purpose**: Comprehensive guide for implementing a markdown and code editor based on vscode-markdown-editor/Vditor, covering architecture analysis, Redwood.js integration, syntax highlighting, and file editing patterns for desktop application.

**Target**: Frontend developers implementing markdown/code editor component  
**Date**: January 2025  
**Status**: Research Phase - Component Implementation  
**Size**: ~11KB (context window compatible)

---

## Executive Summary

The vscode-markdown-editor project uses Vditor as the core markdown editor with WYSIWYG editing, live preview, and extensive customization options. This guide covers analyzing the vscode-markdown-editor codebase architecture, integrating Vditor into Redwood.js, implementing VSCode-like syntax highlighting for code files, and creating a unified editor component that handles both markdown and code files. The implementation will support markdown rendering with live preview, code syntax highlighting, file loading/saving, and desktop app integration.

**Key Recommendations**:
- Use Vditor as the base markdown editor (core of vscode-markdown-editor)
- Implement syntax highlighting using Prism.js or highlight.js for code files
- Create unified editor component that switches modes based on file type
- Leverage Vditor's instant rendering mode for markdown preview
- Integrate file loading/saving through Redwood.js API services

---

## VSCode-Markdown-Editor Architecture Analysis

### Project Structure

**vscode-markdown-editor Structure** (from GitHub):
```
vscode-markdown-editor/
├── src/
│   ├── extension.ts          # VSCode extension entry
│   ├── webview/
│   │   ├── vditor/          # Vditor editor integration
│   │   └── index.html       # Webview HTML
│   └── ...
├── media-src/               # Source assets
└── media/                   # Built assets
```

### Core Technologies

**Vditor Editor**:
- **Purpose**: Full-featured WYSIWYG markdown editor
- **Features**: Instant rendering, WYSIWYG mode, split screen, markdown extensions
- **Dependencies**: Vanilla JavaScript, works with React via wrapper

**Integration Pattern**:
- VSCode extension creates webview
- Webview loads HTML with Vditor
- Communication via message passing (webview ↔ extension)

### Key Vditor Features Used

1. **Instant Rendering Mode**: Real-time markdown preview (recommended)
2. **WYSIWYG Mode**: Visual editing with formatting toolbar
3. **Split Screen Mode**: Side-by-side editing and preview
4. **Markdown Extensions**: KaTeX, Mermaid, Graphviz, ECharts
5. **Copy Markdown/HTML**: Export functionality

---

## Vditor Integration with React/Redwood.js

### Installing Vditor

```bash
# Install Vditor
yarn add vditor

# Install syntax highlighting (for code files)
yarn add prismjs
# or
yarn add highlight.js
```

### Basic Vditor Component

**Simple Markdown Editor Component**:

```typescript
// web/src/components/Editor/VditorEditor.tsx
import { useEffect, useRef } from 'react'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

interface VditorEditorProps {
  content: string
  onChange?: (content: string) => void
  onSave?: (content: string) => void
  mode?: 'instant' | 'wysiwyg' | 'sv' // instant, wysiwyg, split-view
  readonly?: boolean
}

export const VditorEditor = ({
  content,
  onChange,
  onSave,
  mode = 'instant',
  readonly = false,
}: VditorEditorProps) => {
  const vditorRef = useRef<Vditor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Vditor
    const vditor = new Vditor(containerRef.current, {
      height: '100%',
      mode,
      toolbar: [
        'headings',
        'bold',
        'italic',
        'strike',
        '|',
        'line',
        'quote',
        'list',
        'ordered-list',
        'check',
        'code',
        'inline-code',
        'insert-before',
        'insert-after',
        'undo',
        'redo',
        'upload',
        'link',
        'table',
        '|',
        'outline',
        'preview',
        'fullscreen',
        'devtools',
        'info',
        'help',
      ],
      value: content,
      readonly,
      after: () => {
        vditorRef.current = vditor
      },
      input: (value: string) => {
        onChange?.(value)
      },
      upload: {
        accept: 'image/*',
        url: '/api/upload', // File upload endpoint
        linkToImgUrl: '/api/upload',
      },
    })

    return () => {
      vditor.destroy()
    }
  }, []) // Initialize once

  // Update content when prop changes
  useEffect(() => {
    if (vditorRef.current && content !== vditorRef.current.getValue()) {
      vditorRef.current.setValue(content)
    }
  }, [content])

  // Handle save shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (vditorRef.current) {
          onSave?.(vditorRef.current.getValue())
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSave])

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
}
```

---

## Unified Editor Component (Markdown + Code)

### File Type Detection

**Language Detection Pattern**:

```typescript
// web/src/lib/fileUtils.ts
export const detectFileType = (filePath: string): 'markdown' | 'code' | 'text' => {
  const ext = filePath.split('.').pop()?.toLowerCase() || ''
  
  const markdownExtensions = ['md', 'markdown', 'mdown', 'mkd']
  const codeExtensions = [
    'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'go', 'rs',
    'php', 'rb', 'swift', 'kt', 'scala', 'html', 'css', 'scss', 'sass',
    'json', 'yaml', 'yml', 'xml', 'sql', 'sh', 'bash', 'zsh',
    // ... more code file extensions
  ]
  
  if (markdownExtensions.includes(ext)) {
    return 'markdown'
  }
  
  if (codeExtensions.includes(ext)) {
    return 'code'
  }
  
  return 'text'
}

export const detectLanguage = (filePath: string): string => {
  const ext = filePath.split('.').pop()?.toLowerCase() || ''
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'go': 'go',
    'rs': 'rust',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'sql': 'sql',
    'sh': 'bash',
    'bash': 'bash',
    'md': 'markdown',
    'markdown': 'markdown',
  }
  
  return languageMap[ext] || 'text'
}
```

### Unified Editor Component

**Switch Between Markdown and Code Editor**:

```typescript
// web/src/components/Editor/UnifiedEditor.tsx
import { useState, useEffect } from 'react'
import { VditorEditor } from './VditorEditor'
import { CodeEditor } from './CodeEditor'
import { detectFileType, detectLanguage } from 'src/lib/fileUtils'

interface UnifiedEditorProps {
  filePath: string
  content: string
  onContentChange: (content: string) => void
  onSave: (content: string) => void
}

export const UnifiedEditor = ({
  filePath,
  content,
  onContentChange,
  onSave,
}: UnifiedEditorProps) => {
  const fileType = detectFileType(filePath)
  const language = detectLanguage(filePath)

  if (fileType === 'markdown') {
    return (
      <VditorEditor
        content={content}
        onChange={onContentChange}
        onSave={onSave}
        mode="instant" // Recommended instant rendering mode
      />
    )
  }

  // Code editor for code files
  return (
    <CodeEditor
      content={content}
      language={language}
      onChange={onContentChange}
      onSave={onSave}
      filePath={filePath}
    />
  )
}
```

---

## Code Syntax Highlighting Implementation

### Using Prism.js

**Prism.js Integration**:

```typescript
// web/src/components/Editor/CodeEditor.tsx
import { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css' // VSCode-like dark theme
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-json'
// ... import other languages

interface CodeEditorProps {
  content: string
  language: string
  onChange: (content: string) => void
  onSave: (content: string) => void
  filePath: string
}

export const CodeEditor = ({
  content,
  language,
  onChange,
  onSave,
  filePath,
}: CodeEditorProps) => {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (!highlightRef.current || !editorRef.current) return

    // Highlight code
    highlightRef.current.innerHTML = Prism.highlight(
      content,
      Prism.languages[language] || Prism.languages.text,
      language
    )
  }, [content, language])

  // Sync scroll between editor and highlight
  const handleScroll = () => {
    if (editorRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = editorRef.current.scrollTop
      highlightRef.current.scrollLeft = editorRef.current.scrollLeft
    }
  }

  return (
    <div className="code-editor-container" style={{ position: 'relative', height: '100%' }}>
      {/* Syntax highlighted background */}
      <pre
        ref={highlightRef}
        className={`language-${language}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          margin: 0,
          padding: '1rem',
          overflow: 'auto',
          background: '#1e1e1e', // VSCode dark theme
          color: '#d4d4d4',
          fontSize: '14px',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          pointerEvents: 'none',
          whiteSpace: 'pre',
        }}
      />
      
      {/* Transparent textarea overlay */}
      <textarea
        ref={editorRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault()
            onSave(content)
          }
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          margin: 0,
          padding: '1rem',
          overflow: 'auto',
          background: 'transparent',
          color: 'transparent',
          caretColor: '#d4d4d4', // Visible cursor
          fontSize: '14px',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          border: 'none',
          outline: 'none',
          resize: 'none',
          whiteSpace: 'pre',
          tabSize: 2,
        }}
        spellCheck={false}
      />
    </div>
  )
}
```

### Using Monaco Editor (VSCode's Editor)

**Alternative: Monaco Editor**:

```bash
yarn add @monaco-editor/react
```

```typescript
// web/src/components/Editor/MonacoCodeEditor.tsx
import Editor from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

export const MonacoCodeEditor = ({
  content,
  language,
  onChange,
  onSave,
}: CodeEditorProps) => {
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    // Add save shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave(editor.getValue())
    })
  }

  return (
    <Editor
      height="100%"
      language={language}
      value={content}
      onChange={(value) => onChange(value || '')}
      onMount={handleEditorDidMount}
      theme="vs-dark" // VSCode dark theme
      options={{
        fontSize: 14,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
      }}
    />
  )
}
```

**Recommendation**: Use Monaco Editor for code files (VSCode's editor) and Vditor for markdown files.

---

## File Loading and Saving Integration

### Redwood.js Service Integration

**File Loading Service**:

```typescript
// api/src/services/files.ts
export const readFile = async ({ filePath }: { filePath: string }) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const stats = await fs.stat(filePath)
    
    return {
      content,
      path: filePath,
      size: stats.size,
      modified: stats.mtime,
      language: detectLanguage(filePath),
    }
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`)
  }
}
```

**File Saving Service**:

```typescript
export const writeFile = async ({
  filePath,
  content,
}: {
  filePath: string
  content: string
}) => {
  try {
    // Create backup before saving
    await createBackup(filePath)
    
    await fs.writeFile(filePath, content, 'utf-8')
    
    return {
      success: true,
      path: filePath,
      modified: new Date(),
    }
  } catch (error) {
    throw new Error(`Failed to write file: ${error.message}`)
  }
}
```

### Editor Component with File Integration

```typescript
// web/src/components/Editor/FileEditor.tsx
import { useState, useEffect } from 'react'
import { UnifiedEditor } from './UnifiedEditor'
import { useQuery, useMutation } from '@redwoodjs/web'

const GET_FILE = gql`
  query GetFile($path: String!) {
    file(path: $path) {
      content
      path
      language
    }
  }
`

const SAVE_FILE = gql`
  mutation SaveFile($path: String!, $content: String!) {
    saveFile(path: $path, content: $content) {
      success
      modified
    }
  }
`

export const FileEditor = ({ filePath }: { filePath: string }) => {
  const { data, loading, error } = useQuery(GET_FILE, {
    variables: { path: filePath },
  })
  
  const [saveFile] = useMutation(SAVE_FILE)

  const [content, setContent] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    if (data?.file) {
      setContent(data.file.content)
      setHasUnsavedChanges(false)
    }
  }, [data])

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setHasUnsavedChanges(newContent !== data?.file?.content)
  }

  const handleSave = async (contentToSave: string) => {
    try {
      await saveFile({
        variables: {
          path: filePath,
          content: contentToSave,
        },
      })
      setHasUnsavedChanges(false)
      // Show success notification
    } catch (error) {
      // Show error notification
      console.error('Failed to save file:', error)
    }
  }

  if (loading) return <div>Loading file...</div>
  if (error) return <div>Error loading file: {error.message}</div>

  return (
    <div className="file-editor" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* File header with save indicator */}
      <div className="file-header" style={{ padding: '0.5rem', borderBottom: '1px solid #333' }}>
        <span>{filePath}</span>
        {hasUnsavedChanges && <span> • Unsaved changes</span>}
      </div>
      
      {/* Editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <UnifiedEditor
          filePath={filePath}
          content={content}
          onContentChange={handleContentChange}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
```

---

## VSCode Theme Integration

### VSCode Dark Theme Colors

**CSS Theme Variables**:

```css
/* web/src/index.css */
:root {
  /* VSCode Dark+ Theme Colors */
  --vscode-editor-background: #1e1e1e;
  --vscode-editor-foreground: #d4d4d4;
  --vscode-editor-line-number: #858585;
  --vscode-editor-selection: #264f78;
  --vscode-editor-selection-highlight: #add6ff26;
  --vscode-editor-inactive-selection: #3a3d41;
  --vscode-editor-line-highlight: #2a2d29;
  --vscode-editor-cursor: #aeafad;
  --vscode-editor-indent-guide: #404040;
  --vscode-editor-bracket-match-background: #0e639c40;
  --vscode-editor-bracket-match-border: #0e639c;
}
```

### Applying VSCode Theme

```typescript
// Apply VSCode theme to code editor
const vscodeTheme = {
  background: '#1e1e1e',
  foreground: '#d4d4d4',
  lineNumber: '#858585',
  selection: '#264f78',
  // ... more colors
}
```

---

## Customization and Extensions

### Vditor Custom CSS

**Customize Vditor Appearance**:

```css
/* Custom Vditor styling to match VSCode */
.vditor {
  background: #1e1e1e;
  color: #d4d4d4;
}

.vditor-ir {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.vditor-toolbar {
  background: #2d2d2d;
  border-bottom: 1px solid #3e3e3e;
}
```

### Markdown Extensions

**Enable Vditor Extensions**:

```typescript
// Vditor configuration with extensions
const vditor = new Vditor(container, {
  // ... other options
  preview: {
    markdown: {
      math: {
        inlineDigit: true,
        macros: {},
      },
      mermaid: {
        theme: 'dark',
      },
      codeBlockPreview: true,
    },
  },
  hint: {
    emojiPath: '/vditor/emoji',
    emoji: {
      'smile': '😄',
      // ... custom emoji
    },
  },
})
```

---

## External Documentation Links

### Vditor Documentation
- [Vditor GitHub](https://github.com/Vanessa219/vditor) - Source code and examples
- [Vditor Documentation](https://b3log.org/vditor/) - Official documentation
- [Vditor Options](https://ld246.com/article/1549638745630) - Configuration options

### VSCode-Markdown-Editor
- [vscode-markdown-editor GitHub](https://github.com/zaaack/vscode-markdown-editor) - Project repository
- [VSCode Extension API](https://code.visualstudio.com/api) - Extension development reference

### Syntax Highlighting
- [Prism.js](https://prismjs.com/) - Syntax highlighting library
- [Highlight.js](https://highlightjs.org/) - Alternative syntax highlighter
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VSCode's editor engine

---

## Implementation Checklist

- [ ] Install Vditor and dependencies
- [ ] Create VditorEditor component for markdown files
- [ ] Implement code editor (Prism.js or Monaco)
- [ ] Create unified editor component with file type detection
- [ ] Integrate file loading from Redwood.js API
- [ ] Implement file saving with backup
- [ ] Add VSCode theme styling
- [ ] Configure Vditor extensions (KaTeX, Mermaid, etc.)
- [ ] Test markdown rendering and editing
- [ ] Test code syntax highlighting
- [ ] Implement save shortcuts and unsaved changes indicator

---

## Next Steps

1. **Review File Tree Component Guide**: Understand file selection and loading
2. **Implement Editor Component**: Build in Storybook first, then integrate
3. **Connect File Tree to Editor**: Load files on click
4. **Add Save Functionality**: Integrate with file system service

---

**Report Status**: Complete  
**Verification**: All external links verified as of January 2025  
**Context Window Compatibility**: ~11KB - Can be loaded with 1-2 other reports simultaneously

