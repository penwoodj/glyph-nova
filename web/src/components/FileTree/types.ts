/**
 * FileTree Type Definitions
 *
 * Type definitions for file tree components.
 */

export interface FileEntry {
  name: string
  path: string
  type: 'file' | 'directory'
  extension?: string
  size: number
  modified: Date | string
}

export interface FileTreeNode extends FileEntry {
  children?: FileTreeNode[]
  loaded?: boolean
  expanded?: boolean
}

export interface FileTreeProps {
  rootPath: string
  onFileClick?: (path: string) => void
  onFileRightClick?: (path: string, event: React.MouseEvent) => void
  selectedPath?: string
}

