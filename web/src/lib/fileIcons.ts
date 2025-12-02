/**
 * File Icon Mapping
 *
 * Maps file extensions and names to appropriate icons.
 * Uses lucide-react icons styled to match VSCode appearance.
 *
 * Reference: Report 07 (VSCode icons integration)
 */

import {
  File,
  FileText,
  Code,
  FileCode,
  FileJson,
  Image,
  FileImage,
  FileVideo,
  FileAudio,
  Archive,
  Database,
  Settings,
  Lock,
  FileType,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface FileIconInfo {
  Icon: LucideIcon
  className: string
}

/**
 * Get icon for a file based on its extension or name
 */
export const getFileIcon = (fileName: string, isDirectory: boolean): FileIconInfo => {
  if (isDirectory) {
    return {
      Icon: File,
      className: 'text-vscode-fg-secondary',
    }
  }

  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  const lowerName = fileName.toLowerCase()

  // Language/Code files
  if (['js', 'jsx', 'mjs', 'cjs'].includes(extension)) {
    return {
      Icon: Code,
      className: 'text-yellow-400',
    }
  }

  if (['ts', 'tsx'].includes(extension)) {
    return {
      Icon: Code,
      className: 'text-blue-400',
    }
  }

  if (['py', 'pyw', 'pyc', 'pyo', 'pyd'].includes(extension)) {
    return {
      Icon: FileCode,
      className: 'text-yellow-500',
    }
  }

  if (['java', 'class', 'jar'].includes(extension)) {
    return {
      Icon: FileCode,
      className: 'text-orange-400',
    }
  }

  if (['cpp', 'cxx', 'cc', 'c', 'h', 'hpp'].includes(extension)) {
    return {
      Icon: FileCode,
      className: 'text-blue-500',
    }
  }

  if (['go'].includes(extension)) {
    return {
      Icon: FileCode,
      className: 'text-cyan-400',
    }
  }

  if (['rs'].includes(extension)) {
    return {
      Icon: FileCode,
      className: 'text-orange-500',
    }
  }

  if (['php'].includes(extension)) {
    return {
      Icon: FileCode,
      className: 'text-indigo-400',
    }
  }

  if (['rb', 'rbw'].includes(extension)) {
    return {
      Icon: FileCode,
      className: 'text-red-400',
    }
  }

  // Data/Config files
  if (['json', 'jsonc', 'json5'].includes(extension)) {
    return {
      Icon: FileJson,
      className: 'text-yellow-400',
    }
  }

  if (['yaml', 'yml'].includes(extension)) {
    return {
      Icon: FileType,
      className: 'text-purple-400',
    }
  }

  if (['xml', 'xsd', 'xsl', 'xslt'].includes(extension)) {
    return {
      Icon: FileCode,
      className: 'text-orange-400',
    }
  }

  if (['toml', 'ini', 'cfg', 'conf'].includes(extension)) {
    return {
      Icon: Settings,
      className: 'text-vscode-fg-secondary',
    }
  }

  // Web files
  if (['html', 'htm', 'xhtml'].includes(extension)) {
    return {
      Icon: FileCode,
      className: 'text-orange-400',
    }
  }

  if (['css', 'scss', 'sass', 'less'].includes(extension)) {
    return {
      Icon: FileCode,
      className: 'text-blue-400',
    }
  }

  if (['md', 'markdown', 'mdown', 'mkd'].includes(extension)) {
    return {
      Icon: FileText,
      className: 'text-blue-400',
    }
  }

  // Media files
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'bmp'].includes(extension)) {
    return {
      Icon: FileImage,
      className: 'text-purple-400',
    }
  }

  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension)) {
    return {
      Icon: FileVideo,
      className: 'text-pink-400',
    }
  }

  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(extension)) {
    return {
      Icon: FileAudio,
      className: 'text-green-400',
    }
  }

  // Archives
  if (
    ['zip', 'tar', 'gz', 'bz2', 'xz', '7z', 'rar', 'tar.gz', 'tar.bz2'].includes(extension)
  ) {
    return {
      Icon: Archive,
      className: 'text-yellow-600',
    }
  }

  // Database
  if (['sql', 'db', 'sqlite', 'sqlite3'].includes(extension)) {
    return {
      Icon: Database,
      className: 'text-blue-500',
    }
  }

  // Security
  if (['key', 'pem', 'crt', 'cer', 'p12', 'pfx'].includes(extension)) {
    return {
      Icon: Lock,
      className: 'text-yellow-500',
    }
  }

  // Special files
  if (lowerName === 'dockerfile' || lowerName.startsWith('dockerfile.')) {
    return {
      Icon: FileCode,
      className: 'text-blue-400',
    }
  }

  if (lowerName === '.gitignore' || lowerName === '.gitattributes') {
    return {
      Icon: File,
      className: 'text-red-400',
    }
  }

  if (lowerName === 'readme' || lowerName === 'readme.md' || lowerName === 'readme.txt') {
    return {
      Icon: FileText,
      className: 'text-blue-400',
    }
  }

  if (lowerName === 'license' || lowerName.startsWith('license.')) {
    return {
      Icon: FileText,
      className: 'text-yellow-400',
    }
  }

  // Default file icon
  return {
    Icon: File,
    className: 'text-vscode-fg-secondary',
  }
}

/**
 * Get icon for a folder
 */
export const getFolderIcon = (isExpanded: boolean): FileIconInfo => {
  return {
    Icon: File,
    className: isExpanded ? 'text-vscode-active-border' : 'text-vscode-fg-secondary',
  }
}

