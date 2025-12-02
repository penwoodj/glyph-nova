/**
 * VditorEditor Component
 *
 * Markdown editor component using Vditor for WYSIWYG editing with instant preview.
 * Supports markdown editing, syntax highlighting, and file operations.
 *
 * Reference: Report 06 (Basic Vditor component section)
 */

import { useEffect, useRef, useCallback } from 'react'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

interface VditorEditorProps {
  content: string
  onChange?: (content: string) => void
  onSave?: (content: string) => void
  mode?: 'instant' | 'wysiwyg' | 'sv' // instant, wysiwyg, split-view
  readonly?: boolean
  placeholder?: string
  height?: number | string
}

export const VditorEditor = ({
  content,
  onChange,
  onSave,
  mode = 'instant',
  readonly = false,
  placeholder = 'Start typing...',
  height = '100%',
}: VditorEditorProps) => {
  const vditorRef = useRef<Vditor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<string>(content)

  // Update content ref when prop changes
  useEffect(() => {
    contentRef.current = content
  }, [content])

  // Handle save shortcut (Ctrl/Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (onSave && vditorRef.current) {
          const currentContent = vditorRef.current.getValue()
          onSave(currentContent)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onSave])

  // Initialize Vditor
  useEffect(() => {
    if (!containerRef.current || vditorRef.current) return

    const vditor = new Vditor(containerRef.current, {
      height: typeof height === 'number' ? height : undefined,
      minHeight: typeof height === 'string' ? undefined : 300,
      mode,
      placeholder,
      readonly,
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
        'outdent',
        'indent',
        'code',
        'inline-code',
        'insert-after',
        'insert-before',
        'undo',
        'redo',
        'upload',
        'link',
        'table',
        '|',
        'record',
        'edit-mode',
        'both',
        'preview',
        'fullscreen',
        'outline',
        'code-theme',
        'content-theme',
      ],
      toolbarConfig: {
        pin: true,
      },
      value: content,
      cache: {
        enable: false, // Disable cache for file editing
      },
      input: (value: string) => {
        contentRef.current = value
        onChange?.(value)
      },
      blur: (value: string) => {
        // Optional: Auto-save on blur
        // onSave?.(value)
      },
      focus: () => {
        // Handle focus events if needed
      },
      esc: () => {
        // Handle escape key if needed
      },
      ctrlEnter: () => {
        // Handle Ctrl+Enter if needed
      },
      select: () => {
        // Handle text selection if needed
      },
      hint: {
        emojiPath: 'https://cdn.jsdelivr.net/npm/vditor@3/dist/images/emoji',
      },
      preview: {
        mode: 'dark',
        theme: {
          current: 'dark',
          list: {
            'ant-design': 'Ant Design',
            'dark': 'Dark',
            'light': 'Light',
            'wechat': 'WeChat',
          },
        },
        markdown: {
          autoSpace: true,
          chinesePunct: true,
          fixTermTypography: false,
          toc: true,
        },
        hljs: {
          enable: true,
          lineNumber: true,
          style: 'github',
        },
        speech: {
          enable: false,
        },
        math: {
          engine: 'KaTeX',
        },
      },
      upload: {
        accept: 'image/*',
        handler: async (files: File[]) => {
          // TODO: Implement file upload handler
          console.log('Upload files:', files)
          return {
            msg: 'Upload not implemented yet',
            code: -1,
            data: {
              errFiles: files.map((f) => f.name),
              succMap: {},
            },
          }
        },
      },
    })

    vditorRef.current = vditor

    return () => {
      if (vditorRef.current) {
        vditorRef.current.destroy()
        vditorRef.current = null
      }
    }
  }, [mode, placeholder, readonly, height, onChange])

  // Update content when prop changes externally
  useEffect(() => {
    if (vditorRef.current && content !== contentRef.current) {
      vditorRef.current.setValue(content)
      contentRef.current = content
    }
  }, [content])

  // Expose methods via ref (for parent components)
  const getValue = useCallback(() => {
    return vditorRef.current?.getValue() || ''
  }, [])

  const setValue = useCallback((value: string) => {
    if (vditorRef.current) {
      vditorRef.current.setValue(value)
      contentRef.current = value
    }
  }, [])

  const focus = useCallback(() => {
    vditorRef.current?.focus()
  }, [])

  const blur = useCallback(() => {
    vditorRef.current?.blur()
  }, [])

  return (
    <div className="h-full w-full bg-vscode-editor-bg">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}

export default VditorEditor

