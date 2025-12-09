/**
 * FileIcon Component
 *
 * Displays appropriate icons for files and directories based on extension.
 * Uses lucide-react icons styled to match VSCode appearance.
 *
 * Reference: Report 07 (VSCode icons integration)
 */

import { memo } from 'react'
import { Folder, FolderOpen } from 'lucide-react'
import { getFileIcon } from 'src/lib/fileIcons'

interface FileIconProps {
  fileName: string
  isDirectory: boolean
  expanded?: boolean
}

export const FileIcon = memo(({ fileName, isDirectory, expanded = false }: FileIconProps) => {
  if (isDirectory) {
    const FolderIcon = expanded ? FolderOpen : Folder
    return (
      <FolderIcon
        className={`h-4 w-4 mr-2 flex-shrink-0 ${
          expanded ? 'text-vscode-active-border' : 'text-vscode-fg-secondary'
        }`}
      />
    )
  }

  const { Icon, className } = getFileIcon(fileName, false)

  return <Icon className={`h-4 w-4 mr-2 flex-shrink-0 ${className}`} />
})

FileIcon.displayName = 'FileIcon'

