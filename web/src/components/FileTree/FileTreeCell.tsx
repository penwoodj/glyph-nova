/**
 * FileTreeCell Component
 *
 * Redwood.js Cell component for fetching and displaying directory contents.
 * Handles loading, error, and success states for file tree data fetching.
 *
 * Reference: Report 01 (Redwood.js Cells pattern), Report 07 (File tree implementation)
 */

import { gql } from '@apollo/client'

import { FileTreeView } from './FileTreeView'

export const QUERY = gql`
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

export const Loading = () => (
  <div className="flex items-center justify-center h-full p-4 text-vscode-fg-secondary">
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-vscode-active-border"></div>
      <span>Loading directory...</span>
    </div>
  </div>
)

export const Empty = () => (
  <div className="flex items-center justify-center h-full p-4 text-vscode-fg-secondary">
    <span>No files or folders found</span>
  </div>
)

export const Failure = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center h-full p-4">
    <div className="text-red-400 text-sm">
      <p className="font-semibold">Error loading directory</p>
      <p className="mt-1">{error.message}</p>
    </div>
  </div>
)

export const Success = ({
  directoryContents,
  rootPath,
  onFileClick,
  onFileRightClick,
  selectedPath,
}: {
  directoryContents?: {
    files?: Array<{
      name: string
      path: string
      type: string
      extension?: string
      size: number
      modified: string
    }>
    folders?: Array<{
      name: string
      path: string
      type: string
      size: number
      modified: string
    }>
  }
  rootPath: string
  onFileClick?: (path: string) => void
  onFileRightClick?: (path: string, event: React.MouseEvent) => void
  selectedPath?: string
}) => {
  if (!directoryContents) {
    return <Empty />
  }

  return (
    <FileTreeView
      files={(directoryContents.files || []).map((f) => ({
        ...f,
        type: f.type as 'file' | 'directory',
      }))}
      folders={(directoryContents.folders || []).map((f) => ({
        ...f,
        type: f.type as 'file' | 'directory',
      }))}
      rootPath={rootPath}
      onFileClick={onFileClick}
      onFileRightClick={onFileRightClick}
      selectedPath={selectedPath}
    />
  )
}

