/**
 * CodeEditor Component
 *
 * Syntax-highlighted code editor component using react-syntax-highlighter.
 * Supports editing code files with syntax highlighting and VSCode dark theme.
 *
 * Reference: Report 06 (Code syntax highlighting section)
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { detectLanguage } from 'src/lib/fileUtils'

interface CodeEditorProps {
  content: string
  filePath?: string
  language?: string
  onChange?: (content: string) => void
  onSave?: (content: string) => void
  readonly?: boolean
  placeholder?: string
  height?: number | string
}

export const CodeEditor = ({
  content,
  filePath,
  language: propLanguage,
  onChange,
  onSave,
  readonly = false,
  placeholder = 'Start typing...',
  height = '100%',
}: CodeEditorProps) => {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // Local state for edited content - initialized from prop, updated when user types
  const [editedContent, setEditedContent] = useState(content)
  const contentRef = useRef<string>(content)

  // Detect language from file path or use provided language
  const language = propLanguage || (filePath ? detectLanguage(filePath) : 'text')

  // Update local state when content prop changes (e.g., new file loaded)
  useEffect(() => {
    if (content !== contentRef.current) {
      contentRef.current = content
      setEditedContent(content)
    }
  }, [content])

  // Handle save shortcut (Ctrl/Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (onSave) {
          onSave(editedContent)
        }
      }
    }

    if (!readonly) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onSave, readonly, editedContent])

  // Handle content change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value
      setEditedContent(newContent)
      contentRef.current = newContent
      onChange?.(newContent)
    },
    [onChange]
  )

  // Custom style for VSCode dark theme
  // Uses CSS variables from index.css for theme consistency
  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: 'var(--vscode-bg)', // VSCode dark theme background
      color: 'var(--vscode-fg)',
      margin: 0,
      padding: '1rem',
      fontSize: '14px',
      fontFamily:
        'Consolas, Monaco, "Courier New", monospace, "Fira Code", "Droid Sans Mono"',
      lineHeight: '1.6',
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      background: 'transparent',
      color: 'var(--vscode-fg)',
      fontSize: '14px',
      fontFamily:
        'Consolas, Monaco, "Courier New", monospace, "Fira Code", "Droid Sans Mono"',
      lineHeight: '1.6',
    },
  }

  // Read-only mode: Display with syntax highlighting
  if (readonly) {
    return (
      <div
        ref={containerRef}
        className="h-full w-full overflow-auto bg-vscode-editor-bg"
        style={{ height }}
      >
        <SyntaxHighlighter
          language={language}
          style={customStyle}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'var(--vscode-bg)',
          }}
        >
          {editedContent || placeholder}
        </SyntaxHighlighter>
      </div>
    )
  }

  // Editable mode: Textarea with VSCode styling
  // (Syntax highlighting displayed on save/read-only view)
  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden bg-vscode-editor-bg"
      style={{ height }}
    >
      <textarea
        ref={editorRef}
        value={editedContent}
        onChange={handleChange}
        placeholder={placeholder}
        spellCheck={false}
        className="h-full w-full resize-none border-none bg-vscode-editor-bg p-4 font-mono text-vscode-fg outline-none"
        style={{
          fontSize: '14px',
          fontFamily:
            'Consolas, Monaco, "Courier New", monospace, "Fira Code", "Droid Sans Mono"',
          lineHeight: '1.6',
          tabSize: 2,
          whiteSpace: 'pre',
          overflow: 'auto',
          caretColor: 'var(--vscode-fg)',
        }}
      />
    </div>
  )
}

export default CodeEditor

