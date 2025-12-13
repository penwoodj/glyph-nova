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
  mode?: 'ir' | 'wysiwyg' | 'sv' // ir (instant render), wysiwyg, sv (split-view)
  readonly?: boolean
  placeholder?: string
  height?: number | string
}

export const VditorEditor = ({
  content,
  onChange,
  onSave,
  mode = 'ir',
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

  // Initialize Vditor (only once, don't re-initialize on content changes)
  useEffect(() => {
    if (!containerRef.current || vditorRef.current) return

    // Use content prop or empty string, ensure it's not undefined
    const initialContent = content || ''

    console.log('[VditorEditor] Initializing Vditor with content length:', initialContent.length)
    console.log('[VditorEditor] Content preview:', initialContent.substring(0, 100))

    // Ensure container has dimensions before initializing
    if (!containerRef.current.offsetHeight || !containerRef.current.offsetWidth) {
      console.warn('[VditorEditor] Container has no dimensions, waiting...')
      // Try again after a short delay
      const timer = setTimeout(() => {
        if (containerRef.current && !vditorRef.current) {
          // Retry initialization
        }
      }, 100)
      return () => clearTimeout(timer)
    }

    const vditor = new Vditor(containerRef.current, {
      height: typeof height === 'number' ? height : undefined,
      minHeight: typeof height === 'string' ? undefined : 300,
      mode: mode || 'ir', // Vditor uses 'ir' for instant render mode
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
      value: initialContent,
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
      after: () => {
        // Callback after Vditor is fully initialized
        // Wait a bit to ensure Vditor is completely ready
        setTimeout(() => {
          console.log('[VditorEditor] Vditor initialized, setting content')
          if (vditorRef.current && initialContent) {
            try {
              // Use setValue - this is the correct method for setting initial content
              vditorRef.current.setValue(initialContent)
              contentRef.current = initialContent
              console.log('[VditorEditor] Content set successfully, length:', initialContent.length)
            } catch (error) {
              console.error('[VditorEditor] Failed to set initial Vditor value:', error)
            }
          } else {
            console.warn('[VditorEditor] Vditor ref or content missing:', {
              hasRef: !!vditorRef.current,
              hasContent: !!initialContent
            })
          }
        }, 100)
      },
    })

    vditorRef.current = vditor
    contentRef.current = initialContent

    return () => {
      if (vditorRef.current) {
        vditorRef.current.destroy()
        vditorRef.current = null
      }
    }
    // Only re-initialize if mode, placeholder, readonly, or height changes
    // Do NOT include content or onChange in dependencies - use separate effect for content updates
  }, [mode, placeholder, readonly, height])

  // Update content when prop changes externally
  useEffect(() => {
    if (vditorRef.current && content !== contentRef.current) {
      const newContent = content || ''
      try {
        vditorRef.current.setValue(newContent)
        contentRef.current = newContent
      } catch (error) {
        console.error('Failed to set Vditor value:', error)
      }
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
    <div className="h-full w-full bg-vscode-editor-bg overflow-hidden">
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{
          height: '100%',
          width: '100%',
          overflow: 'hidden'
        }}
      />
    </div>
  )
}

export default VditorEditor

