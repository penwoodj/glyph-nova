/**
 * FileTreeItem Component
 *
 * Recursive component for rendering individual file tree items.
 * Handles expand/collapse for directories and file selection.
 *
 * Reference: Report 07 (Recursive tree item component)
 */

import { memo, useCallback } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { FileTreeNode } from './types'
import { FileIcon } from './FileIcon'

interface FileTreeItemProps {
  node: FileTreeNode
  level: number
  expandedPaths: Set<string>
  selectedPath?: string
  onToggleExpand: (node: FileTreeNode) => void
  onFileClick?: (path: string) => void
  onFileRightClick?: (path: string, event: React.MouseEvent) => void
}

export const FileTreeItem = memo(({
  node,
  level,
  expandedPaths,
  selectedPath,
  onToggleExpand,
  onFileClick,
  onFileRightClick,
}: FileTreeItemProps) => {
  const isExpanded = expandedPaths.has(node.path)
  const isSelected = selectedPath === node.path
  const hasChildren = node.children && node.children.length > 0
  const showChildren = node.type === 'directory' && isExpanded && hasChildren

  const handleClick = useCallback(() => {
    if (node.type === 'directory') {
      onToggleExpand(node)
    } else {
      onFileClick?.(node.path)
    }
  }, [node.type, node.path, onToggleExpand, onFileClick])

  const handleRightClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      onFileRightClick?.(node.path, e)
    },
    [node.path, onFileRightClick]
  )

  const indentWidth = level * 16

  return (
    <>
      <div
        className={`flex items-center px-2 py-1 text-sm cursor-pointer hover:bg-vscode-hover-bg transition-colors ${
          isSelected ? 'bg-vscode-selection-bg' : ''
        }`}
        style={{ paddingLeft: `${8 + indentWidth}px` }}
        onClick={handleClick}
        onContextMenu={handleRightClick}
      >
        {node.type === 'directory' ? (
          <>
            <span className="mr-1 flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-vscode-fg-secondary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-vscode-fg-secondary" />
              )}
            </span>
            <FileIcon
              fileName={node.name}
              isDirectory={true}
              expanded={isExpanded}
            />
          </>
        ) : (
          <span className="ml-5">
            <FileIcon
              fileName={node.name}
              isDirectory={false}
              expanded={false}
            />
          </span>
        )}
        <span className="truncate text-vscode-fg">{node.name}</span>
      </div>
      {showChildren &&
        node.children?.map((child) => (
          <FileTreeItem
            key={child.path}
            node={child}
            level={level + 1}
            expandedPaths={expandedPaths}
            selectedPath={selectedPath}
            onToggleExpand={onToggleExpand}
            onFileClick={onFileClick}
            onFileRightClick={onFileRightClick}
          />
        ))}
    </>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if relevant props changed
  const prevExpanded = prevProps.expandedPaths.has(prevProps.node.path)
  const nextExpanded = nextProps.expandedPaths.has(nextProps.node.path)

  return (
    prevProps.node.path === nextProps.node.path &&
    prevProps.node.name === nextProps.node.name &&
    prevProps.level === nextProps.level &&
    prevProps.selectedPath === nextProps.selectedPath &&
    prevExpanded === nextExpanded &&
    prevProps.node.children?.length === nextProps.node.children?.length &&
    prevProps.onToggleExpand === nextProps.onToggleExpand &&
    prevProps.onFileClick === nextProps.onFileClick &&
    prevProps.onFileRightClick === nextProps.onFileRightClick
  )
})

FileTreeItem.displayName = 'FileTreeItem'

