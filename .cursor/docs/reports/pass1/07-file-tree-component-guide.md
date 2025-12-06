# File Tree Component Guide for Desktop Application

**Purpose**: Complete guide for implementing a VSCode-like file tree component with expand/collapse, VSCode icons, right-click context menu, and clipboard integration for desktop application.

**Target**: Frontend developers building file tree navigation  
**Date**: January 2025  
**Status**: Research Phase - Component Implementation  
**Size**: ~9KB (context window compatible)

---

## Executive Summary

A file tree component is essential for desktop applications that manage file systems. This guide covers implementing a VSCode-like file tree with lazy loading, expand/collapse functionality, VSCode icon integration, right-click context menus, and clipboard operations. The component uses React with efficient state management and virtual scrolling for large directories. Key patterns include recursive directory rendering, icon mapping, context menu handling, and file path operations.

**Key Recommendations**:
- Use custom React component for full control and customization
- Integrate VSCode icons via `vscode-icons` or `@vscode/icons` package
- Implement lazy loading for performance with large directories
- Use virtual scrolling for directories with 1000+ files
- Handle right-click events for context menu and clipboard operations

---

## Component Architecture

### File Tree Data Structure

```typescript
// web/src/components/FileTree/types.ts
export interface FileTreeNode {
  name: string
  path: string
  type: 'file' | 'directory'
  extension?: string
  children?: FileTreeNode[]
  loaded?: boolean
  expanded?: boolean
}

export interface FileTreeProps {
  rootPath: string
  onFileClick?: (node: FileTreeNode) => void
  onFileRightClick?: (node: FileTreeNode, event: React.MouseEvent) => void
  selectedPath?: string
}
```

### Component Structure

```typescript
// web/src/components/FileTree/FileTree.tsx
import { useState, useEffect } from 'react'
import { FileTreeNode } from './types'
import { FileTreeItem } from './FileTreeItem'
import { getDirectoryContents } from 'src/services/files'

export const FileTree = ({ 
  rootPath, 
  onFileClick, 
  onFileRightClick,
  selectedPath 
}: FileTreeProps) => {
  const [tree, setTree] = useState<FileTreeNode[]>([])
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    loadRootDirectory()
  }, [rootPath])
  
  const loadRootDirectory = async () => {
    const contents = await getDirectoryContents({ directoryPath: rootPath })
    const nodes = [
      ...contents.folders.map(f => ({ ...f, type: 'directory' as const })),
      ...contents.files.map(f => ({ ...f, type: 'file' as const }))
    ]
    setTree(nodes)
  }
  
  const toggleExpand = async (node: FileTreeNode) => {
    if (node.type !== 'directory') return
    
    const isExpanded = expandedPaths.has(node.path)
    
    if (isExpanded) {
      setExpandedPaths(prev => {
        const next = new Set(prev)
        next.delete(node.path)
        return next
      })
    } else {
      setExpandedPaths(prev => new Set([...prev, node.path]))
      
      if (!node.loaded) {
        await loadNodeChildren(node)
      }
    }
  }
  
  const loadNodeChildren = async (node: FileTreeNode) => {
    const contents = await getDirectoryContents({ directoryPath: node.path })
    const children = [
      ...contents.folders.map(f => ({ ...f, type: 'directory' as const })),
      ...contents.files.map(f => ({ ...f, type: 'file' as const }))
    ]
    
    setTree(prev => updateNodeInTree(prev, node.path, { 
      children, 
      loaded: true 
    }))
  }
  
  const collapseAll = () => {
    setExpandedPaths(new Set())
  }
  
  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <button onClick={collapseAll}>Collapse All</button>
      </div>
      <div className="file-tree-content">
        {tree.map(node => (
          <FileTreeItem
            key={node.path}
            node={node}
            level={0}
            expandedPaths={expandedPaths}
            selectedPath={selectedPath}
            onToggleExpand={toggleExpand}
            onFileClick={onFileClick}
            onFileRightClick={onFileRightClick}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## VSCode Icons Integration

### Installing VSCode Icons

```bash
# Option 1: vscode-icons package
yarn add vscode-icons

# Option 2: @vscode/icons-material (official)
yarn add @vscode/icons-material

# Option 3: Use icon fonts
# Download VSCode icon font or use CDN
```

### Icon Mapping

```typescript
// web/src/lib/fileIcons.ts
import { getIconForFile, getIconForFolder } from 'vscode-icons-js'

export const getFileIcon = (fileName: string, isDirectory: boolean): string => {
  if (isDirectory) {
    return getIconForFolder(fileName) || 'folder'
  }
  return getIconForFile(fileName) || 'file'
}

// Alternative: Custom icon mapping
export const getFileIconClass = (fileName: string, isDirectory: boolean): string => {
  if (isDirectory) return 'folder-icon'
  
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const iconMap: Record<string, string> = {
    'js': 'javascript-icon',
    'ts': 'typescript-icon',
    'jsx': 'react-icon',
    'tsx': 'react-icon',
    'py': 'python-icon',
    'json': 'json-icon',
    'md': 'markdown-icon',
    'html': 'html-icon',
    'css': 'css-icon',
    // ... more mappings
  }
  
  return iconMap[ext] || 'file-icon'
}
```

### Icon Component

```typescript
// web/src/components/FileTree/FileIcon.tsx
import { getFileIcon } from 'src/lib/fileIcons'

interface FileIconProps {
  fileName: string
  isDirectory: boolean
  expanded?: boolean
}

export const FileIcon = ({ fileName, isDirectory, expanded }: FileIconProps) => {
  const iconName = getFileIcon(fileName, isDirectory)
  
  if (isDirectory) {
    return (
      <span className={`file-icon folder-icon ${expanded ? 'expanded' : ''}`}>
        {expanded ? '📂' : '📁'} {/* Or use SVG icons */}
      </span>
    )
  }
  
  return (
    <span className={`file-icon ${iconName}`}>
      {/* Icon SVG or emoji */}
    </span>
  )
}
```

---

## Recursive Tree Item Component

### FileTreeItem Implementation

```typescript
// web/src/components/FileTree/FileTreeItem.tsx
import { FileIcon } from './FileIcon'
import { FileTreeNode } from './types'

interface FileTreeItemProps {
  node: FileTreeNode
  level: number
  expandedPaths: Set<string>
  selectedPath?: string
  onToggleExpand: (node: FileTreeNode) => void
  onFileClick?: (node: FileTreeNode) => void
  onFileRightClick?: (node: FileTreeNode, event: React.MouseEvent) => void
}

export const FileTreeItem = ({
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
  
  const handleClick = () => {
    if (node.type === 'directory') {
      onToggleExpand(node)
    } else {
      onFileClick?.(node)
    }
  }
  
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onFileRightClick?.(node, e)
  }
  
  return (
    <>
      <div
        className={`file-tree-item ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={handleClick}
        onContextMenu={handleRightClick}
      >
        <FileIcon 
          fileName={node.name} 
          isDirectory={node.type === 'directory'}
          expanded={isExpanded}
        />
        <span className="file-name">{node.name}</span>
      </div>
      {showChildren && node.children?.map(child => (
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
}
```

---

## Right-Click Context Menu

### Context Menu Component

```typescript
// web/src/components/FileTree/ContextMenu.tsx
import { useEffect, useRef } from 'react'

interface ContextMenuProps {
  x: number
  y: number
  filePath: string
  onClose: () => void
  onCopyPath: (path: string) => void
  onCopyPathToChat: (path: string) => void
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
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])
  
  const handleCopyPath = () => {
    navigator.clipboard.writeText(filePath)
    onCopyPath(filePath)
    onClose()
  }
  
  const handleCopyPathToChat = () => {
    navigator.clipboard.writeText(filePath)
    onCopyPathToChat(filePath)
    onClose()
  }
  
  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 1000,
      }}
    >
      <button onClick={handleCopyPath}>Copy Path</button>
      <button onClick={handleCopyPathToChat}>Copy Path to Chat</button>
    </div>
  )
}
```

### Context Menu Integration

```typescript
// In FileTree component
const [contextMenu, setContextMenu] = useState<{
  x: number
  y: number
  filePath: string
} | null>(null)

const handleFileRightClick = (node: FileTreeNode, event: React.MouseEvent) => {
  setContextMenu({
    x: event.clientX,
    y: event.clientY,
    filePath: node.path,
  })
}

const handleCopyPathToChat = (filePath: string) => {
  // Dispatch event to chat component
  window.dispatchEvent(new CustomEvent('file-path-selected', {
    detail: { path: filePath }
  }))
  
  // Or use state management / context
  chatInputRef.current?.append(` ${filePath}`)
}
```

---

## Clipboard Integration

### Copy File Path

```typescript
// web/src/lib/clipboard.ts
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

// Fallback for older browsers
export const copyToClipboardFallback = (text: string): boolean => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  
  try {
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return true
  } catch (error) {
    document.body.removeChild(textarea)
    return false
  }
}
```

### Append to Chat Input

```typescript
// In chat component
useEffect(() => {
  const handleFilePathSelected = (event: CustomEvent<{ path: string }>) => {
    const currentValue = inputRef.current?.value || ''
    const newValue = currentValue + ' ' + event.detail.path
    inputRef.current.value = newValue
    inputRef.current.focus()
  }
  
  window.addEventListener('file-path-selected', handleFilePathSelected as EventListener)
  return () => {
    window.removeEventListener('file-path-selected', handleFilePathSelected as EventListener)
  }
}, [])
```

---

## Performance Optimization

### Virtual Scrolling

```typescript
// For large directories
import { FixedSizeList } from 'react-window'

export const VirtualizedFileTree = ({ items }: { items: FileTreeNode[] }) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={28}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <FileTreeItem node={items[index]} />
        </div>
      )}
    </FixedSizeList>
  )
}
```

### Lazy Loading Strategy

- Load root directory on mount
- Load directory children only on expand
- Cache loaded directories
- Debounce directory reading during search

---

## External Documentation Links

### File Tree Libraries
- [react-window](https://github.com/bvaughn/react-window) - Virtual scrolling
- [react-treeview](https://github.com/reactjs/react-treeview) - Tree component (deprecated, for reference)

### VSCode Icons
- [vscode-icons GitHub](https://github.com/vscode-icons/vscode-icons) - Icon set
- [vscode-icons-js](https://www.npmjs.com/package/vscode-icons-js) - JavaScript library

### Clipboard API
- [MDN: Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) - Modern clipboard API

---

## Implementation Checklist

- [ ] Create FileTree component structure
- [ ] Implement recursive FileTreeItem component
- [ ] Integrate VSCode icons
- [ ] Add expand/collapse functionality
- [ ] Implement right-click context menu
- [ ] Add clipboard copy functionality
- [ ] Connect file path to chat input
- [ ] Add "Collapse All" button
- [ ] Implement lazy loading for directories
- [ ] Add virtual scrolling for large directories
- [ ] Style to match VSCode appearance

---

**Report Status**: Complete  
**Context Window Compatibility**: ~9KB - Can be loaded with 2-3 other reports simultaneously

