/**
 * FileTreeView Component
 *
 * Full file tree view with expand/collapse functionality and lazy loading.
 * Displays directories and files in a tree structure.
 *
 * Reference: Report 07 (File tree implementation)
 */

import { useState, useCallback } from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import { FileTreeItem } from './FileTreeItem'
import { FileTreeNode } from './types'
import { ContextMenu } from './ContextMenu'
import { useAppStore } from 'src/state/store'

interface FileEntry {
  name: string
  path: string
  type: 'file' | 'directory'
  extension?: string
  size: number
  modified: Date | string
}

interface FileTreeViewProps {
  files: FileEntry[]
  folders: FileEntry[]
  rootPath: string
  onFileClick?: (path: string) => void
  onFileRightClick?: (path: string, event: React.MouseEvent) => void
  selectedPath?: string
}

const DIRECTORY_QUERY = gql`
  query GetDirectoryContents($path: String!) {
    directoryContents(path: $path) {
      files {
        name
        path
        type
        extension
        size
        modified
      }
      folders {
        name
        path
        type
        size
        modified
      }
    }
  }
`

export const FileTreeView = ({
  files: initialFiles,
  folders: initialFolders,
  rootPath,
  onFileClick,
  onFileRightClick,
  selectedPath: selectedPathProp,
}: FileTreeViewProps) => {
  // Get selected file from store
  const selectedFilePath = useAppStore((state) => state.selectedFilePath)
  const setSelectedFile = useAppStore((state) => state.setSelectedFile)

  // Use prop or store value for selected path
  const selectedPath = selectedPathProp ?? selectedFilePath

  const [tree, setTree] = useState<FileTreeNode[]>(() => {
    // Initialize tree with root level files and folders
    const nodes: FileTreeNode[] = [
      ...initialFolders.map((f) => ({
        ...f,
        type: 'directory' as const,
        children: undefined,
        loaded: false,
      })),
      ...initialFiles.map((f) => ({
        ...f,
        type: 'file' as const,
      })),
    ]
    return nodes
  })

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [loadDirectory] = useLazyQuery(DIRECTORY_QUERY)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    filePath: string
  } | null>(null)

  const updateNodeInTree = useCallback(
    (nodes: FileTreeNode[], targetPath: string, updates: Partial<FileTreeNode>): FileTreeNode[] => {
      return nodes.map((node) => {
        if (node.path === targetPath) {
          return { ...node, ...updates }
        }
        if (node.children) {
          return {
            ...node,
            children: updateNodeInTree(node.children, targetPath, updates),
          }
        }
        return node
      })
    },
    []
  )

  const loadNodeChildren = useCallback(
    async (node: FileTreeNode) => {
      if (node.type !== 'directory' || node.loaded) return

      try {
        const { data } = await loadDirectory({
          variables: { path: node.path },
        })

        if (data?.directoryContents) {
          const children: FileTreeNode[] = [
            ...(data.directoryContents.folders || []).map((f: FileEntry) => ({
              ...f,
              type: 'directory' as const,
              children: undefined,
              loaded: false,
            })),
            ...(data.directoryContents.files || []).map((f: FileEntry) => ({
              ...f,
              type: 'file' as const,
            })),
          ]

          setTree((prev) => updateNodeInTree(prev, node.path, { children, loaded: true }))
        }
      } catch (error) {
        console.error('Failed to load directory:', error)
      }
    },
    [loadDirectory, updateNodeInTree]
  )

  const toggleExpand = useCallback(
    async (node: FileTreeNode) => {
      if (node.type !== 'directory') return

      const isExpanded = expandedPaths.has(node.path)

      if (isExpanded) {
        setExpandedPaths((prev) => {
          const next = new Set(prev)
          next.delete(node.path)
          return next
        })
      } else {
        setExpandedPaths((prev) => new Set([...prev, node.path]))

        if (!node.loaded) {
          await loadNodeChildren(node)
        }
      }
    },
    [expandedPaths, loadNodeChildren]
  )

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set())
  }, [])

  const handleFileRightClick = useCallback(
    (path: string, event: React.MouseEvent) => {
      event.preventDefault()
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        filePath: path,
      })
      // Also call the original handler if provided
      onFileRightClick?.(path, event)
    },
    [onFileRightClick]
  )

  const handleCopyPath = useCallback((path: string) => {
    console.log('File path copied:', path)
  }, [])

  const handleCopyPathToChat = useCallback((path: string) => {
    console.log('File path copied to chat:', path)
    // Custom event will be dispatched by ContextMenu
  }, [])

  return (
    <div className="h-full flex flex-col bg-vscode-sidebar-bg">
      {/* Header with Collapse All button */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-vscode-border">
        <div className="text-xs font-semibold text-vscode-fg-secondary truncate flex-1">
          {rootPath}
        </div>
        <button
          onClick={collapseAll}
          className="px-2 py-1 text-xs text-vscode-fg-secondary hover:text-vscode-fg hover:bg-vscode-hover-bg rounded transition-colors"
          title="Collapse All"
        >
          Collapse All
        </button>
      </div>

      {/* Tree content */}
      <div className="flex-1 overflow-auto">
        {tree.length === 0 ? (
          <div className="text-center text-vscode-fg-secondary text-sm py-4">
            Empty directory
          </div>
        ) : (
          tree.map((node) => (
            <FileTreeItem
              key={node.path}
              node={node}
              level={0}
              expandedPaths={expandedPaths}
              selectedPath={selectedPath}
              onToggleExpand={toggleExpand}
              onFileClick={(path) => {
                // Update store with selected file
                setSelectedFile(path)
                // Call original handler if provided
                onFileClick?.(path)
              }}
              onFileRightClick={handleFileRightClick}
            />
          ))
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          filePath={contextMenu.filePath}
          onClose={() => setContextMenu(null)}
          onCopyPath={handleCopyPath}
          onCopyPathToChat={handleCopyPathToChat}
        />
      )}
    </div>
  )
}
