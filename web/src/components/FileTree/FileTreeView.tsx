/**
 * FileTreeView Component
 *
 * Full file tree view with expand/collapse functionality and lazy loading.
 * Displays directories and files in a tree structure.
 *
 * Reference: Report 07 (File tree implementation)
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import { List } from 'react-window'
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

  // Container ref for measuring height
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(600) // Default height

  // Measure container height on mount and resize
  useEffect(() => {
    const measureHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight
        setContainerHeight(height)
      }
    }

    measureHeight()

    // Use ResizeObserver for better performance than window resize
    const resizeObserver = new ResizeObserver(measureHeight)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

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
    // Debug: File path copied (disabled in production)
    // console.log('File path copied:', path)
  }, [])

  const handleCopyPathToChat = useCallback((path: string) => {
    // Debug: File path copied to chat (disabled in production)
    // console.log('File path copied to chat:', path)
    // Custom event will be dispatched by ContextMenu
  }, [])

  // Flatten tree into linear list for virtual scrolling
  // Only includes visible nodes (respects expanded/collapsed state)
  const flattenedTree = useMemo(() => {
    const flatten = (nodes: FileTreeNode[], level: number = 0): Array<{ node: FileTreeNode; level: number; index: number }> => {
      const result: Array<{ node: FileTreeNode; level: number; index: number }> = []
      let index = 0

      for (const node of nodes) {
        result.push({ node, level, index })
        index++

        // If directory is expanded and has children, include children
        if (node.type === 'directory' && expandedPaths.has(node.path) && node.children) {
          const children = flatten(node.children, level + 1)
          result.push(...children)
          index += children.length
        }
      }

      return result
    }

    return flatten(tree)
  }, [tree, expandedPaths])

  // Row component for virtual scrolling (react-window v2 API)
  const RowComponent = useCallback(
    ({
      index,
      style,
      ariaAttributes,
    }: {
      index: number
      style: React.CSSProperties
      ariaAttributes: {
        'aria-posinset': number
        'aria-setsize': number
        role: 'listitem'
      }
    }) => {
      const item = flattenedTree[index]
      if (!item) return null

      return (
        <div style={style} {...ariaAttributes}>
          <FileTreeItem
            node={item.node}
            level={item.level}
            expandedPaths={expandedPaths}
            selectedPath={selectedPath}
            onToggleExpand={toggleExpand}
            onFileClick={(path) => {
              setSelectedFile(path)
              onFileClick?.(path)
            }}
            onFileRightClick={handleFileRightClick}
          />
        </div>
      )
    },
    [flattenedTree, expandedPaths, selectedPath, toggleExpand, setSelectedFile, onFileClick, handleFileRightClick]
  )

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

      {/* Tree content with virtual scrolling */}
      <div ref={containerRef} className="flex-1 overflow-hidden">
        {flattenedTree.length === 0 ? (
          <div className="text-center text-vscode-fg-secondary text-sm py-4">
            Empty directory
          </div>
        ) : (
          <List
            height={containerHeight}
            rowCount={flattenedTree.length}
            rowHeight={28} // Height of each tree item (px-2 py-1 = ~28px)
            className="scrollbar-thin w-full"
            rowComponent={RowComponent}
            rowProps={{}}
          />
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
