/**
 * ContextMenu Component
 *
 * Right-click context menu for file tree items.
 * Provides "Copy Path" and "Copy Path to Chat" options.
 *
 * Reference: Report 07 (Right-click context menu section)
 */

import { useEffect, useRef } from 'react'
import { Copy, MessageSquare } from 'lucide-react'
import { copyFilePath } from 'src/lib/clipboard'

interface ContextMenuProps {
  x: number
  y: number
  filePath: string
  onClose: () => void
  onCopyPath?: (path: string) => void
  onCopyPathToChat?: (path: string) => void
}

export const ContextMenu = ({
  x,
  y,
  filePath,
  onClose,
  onCopyPath,
  onCopyPathToChat,
}: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Add event listeners with a small delay to avoid immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const handleCopyPath = async () => {
    const success = await copyFilePath(filePath)
    if (success) {
      onCopyPath?.(filePath)
    }
    onClose()
  }

  const handleCopyPathToChat = async () => {
    const success = await copyFilePath(filePath)
    if (success) {
      onCopyPathToChat?.(filePath)

      // Dispatch custom event for chat integration
      window.dispatchEvent(
        new CustomEvent('file-path-to-chat', {
          detail: { path: filePath },
        })
      )
    }
    onClose()
  }

  // Adjust position if menu would go off-screen
  const menuWidth = 200
  const menuHeight = 100
  const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x
  const adjustedY = y + menuHeight > window.innerHeight ? y - menuHeight : y

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] border border-vscode-border rounded shadow-lg py-1"
      style={{
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
        backgroundColor: 'var(--vscode-editor-bg)',
      }}
    >
      <button
        onClick={handleCopyPath}
        className="w-full px-4 py-2 text-left text-sm text-vscode-fg hover:bg-vscode-hover-bg flex items-center space-x-2 transition-colors"
      >
        <Copy className="h-4 w-4" />
        <span>Copy Path</span>
      </button>
      <button
        onClick={handleCopyPathToChat}
        className="w-full px-4 py-2 text-left text-sm text-vscode-fg hover:bg-vscode-hover-bg flex items-center space-x-2 transition-colors border-t border-vscode-border"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Copy Path to Chat</span>
      </button>
    </div>
  )
}

