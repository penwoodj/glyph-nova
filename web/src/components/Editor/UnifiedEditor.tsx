/**
 * UnifiedEditor Component
 *
 * Unified editor component that automatically switches between VditorEditor and CodeEditor
 * based on file type. Provides a single interface for editing all file types.
 *
 * Reference: Report 06 (Unified editor component section)
 */

import { VditorEditor } from './VditorEditor'
import { CodeEditor } from './CodeEditor'
import { detectFileType } from 'src/lib/fileUtils'

interface UnifiedEditorProps {
  content: string
  filePath?: string
  onChange?: (content: string) => void
  onSave?: (content: string) => void
  readonly?: boolean
  placeholder?: string
  height?: number | string
}

export const UnifiedEditor = ({
  content,
  filePath,
  onChange,
  onSave,
  readonly = false,
  placeholder = 'Select a file to view or edit...',
  height = '100%',
}: UnifiedEditorProps) => {
  console.log('[UnifiedEditor] Rendering:', JSON.stringify({
    filePath,
    contentLength: content?.length || 0,
    hasContent: !!content,
    contentPreview: content?.substring(0, 50) || 'empty'
  }))

  // If no file path provided, show placeholder
  if (!filePath) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-vscode-editor-bg text-vscode-fg"
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-lg text-vscode-fg opacity-60">{placeholder}</p>
          <p className="mt-2 text-sm text-vscode-fg opacity-40">
            Click a file in the file tree to open it
          </p>
        </div>
      </div>
    )
  }

  // Detect file type from file path
  const fileType = detectFileType(filePath)
  console.log('[UnifiedEditor] File type detected:', fileType)

  // Render appropriate editor based on file type
  switch (fileType) {
    case 'markdown':
      // Use Vditor for markdown files
      return (
        <VditorEditor
          content={content}
          onChange={onChange}
          onSave={onSave}
          readonly={readonly}
          placeholder={placeholder}
          height={height}
          mode="ir" // Instant render mode for markdown (Vditor uses 'ir' not 'instant')
        />
      )

    case 'code':
      // Use CodeEditor for code files (with syntax highlighting)
      return (
        <CodeEditor
          content={content}
          filePath={filePath}
          onChange={onChange}
          onSave={onSave}
          readonly={readonly}
          placeholder={placeholder}
          height={height}
        />
      )

    case 'text':
    default:
      // Use CodeEditor for plain text files (no syntax highlighting)
      return (
        <CodeEditor
          content={content}
          filePath={filePath}
          language="text"
          onChange={onChange}
          onSave={onSave}
          readonly={readonly}
          placeholder={placeholder}
          height={height}
        />
      )
  }
}

export default UnifiedEditor

