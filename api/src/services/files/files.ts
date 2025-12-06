/**
 * File System Service
 *
 * Provides secure file system operations for desktop application.
 * All file operations go through this service layer for security and consistency.
 *
 * Reference: Report 03 (Desktop File System Integration) - File System Access Patterns
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { logger } from 'src/lib/logger'

export interface FileEntry {
  name: string
  path: string
  type: 'file' | 'directory'
  extension?: string
  size: number
  modified: Date
}

export interface DirectoryContents {
  files: FileEntry[]
  folders: FileEntry[]
}

/**
 * Get contents of a directory
 */
export const getDirectoryContents = async ({
  directoryPath,
}: {
  directoryPath: string
}): Promise<DirectoryContents> => {
  try {
    // Validate path (security check)
    if (!isAllowedPath(directoryPath)) {
      logger.warn('Path not allowed', { directoryPath })
      throw new Error('Path not allowed')
    }

    const entries = await fs.readdir(directoryPath, { withFileTypes: true })

    const files: FileEntry[] = []
    const folders: FileEntry[] = []

    for (const entry of entries) {
      const fullPath = path.join(directoryPath, entry.name)

      try {
        const stats = await fs.stat(fullPath)

        if (entry.isDirectory()) {
          folders.push({
            name: entry.name,
            path: fullPath,
            type: 'directory',
            size: stats.size,
            modified: stats.mtime,
          })
        } else {
          files.push({
            name: entry.name,
            path: fullPath,
            type: 'file',
            extension: path.extname(entry.name).toLowerCase(),
            size: stats.size,
            modified: stats.mtime,
          })
        }
      } catch (statError) {
        // Skip entries we can't stat (permissions, symlinks, etc.)
        logger.warn('Failed to stat entry', {
          path: fullPath,
          error: statError,
        })
      }
    }

    // Sort: folders first, then files, both alphabetically
    folders.sort((a, b) => a.name.localeCompare(b.name))
    files.sort((a, b) => a.name.localeCompare(b.name))

    return { files, folders }
  } catch (error) {
    logger.error('Failed to read directory', { directoryPath, error })
    throw new Error(
      `Failed to read directory: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * GraphQL resolver wrapper - RedwoodJS maps directoryContents query to this function
 * This is a wrapper that matches the GraphQL query name
 */
export const directoryContents = async ({
  path,
}: {
  path: string
}): Promise<DirectoryContents> => {
  return await getDirectoryContents({ directoryPath: path })
}

/**
 * Read file contents (internal function - used by tests and other code)
 */
export const readFileInternal = async ({
  filePath,
  encoding = 'utf-8',
}: {
  filePath: string
  encoding?: BufferEncoding
}): Promise<string> => {
  try {
    if (!isAllowedPath(filePath)) {
      logger.warn('Path not allowed', { filePath })
      throw new Error('Path not allowed')
    }

    const content = await fs.readFile(filePath, encoding)
    return content
  } catch (error) {
    logger.error('Failed to read file', { filePath, error })
    throw new Error(
      `Failed to read file: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * GraphQL resolver wrapper - RedwoodJS maps readFile query to this function
 * Returns an object matching the GraphQL FileContent type
 */
export const readFile = async ({
  path,
  encoding = 'utf-8',
}: {
  path: string
  encoding?: BufferEncoding
}): Promise<{ path: string; content: string; encoding: string }> => {
  const content = await readFileInternal({ filePath: path, encoding })
  return {
    path,
    content,
    encoding: encoding || 'utf-8',
  }
}

/**
 * Write file contents (internal function)
 */
const writeFileInternal = async ({
  filePath,
  content,
  encoding = 'utf-8',
}: {
  filePath: string
  content: string
  encoding?: BufferEncoding
}): Promise<void> => {
  try {
    if (!isAllowedPath(filePath)) {
      logger.warn('Path not allowed', { filePath })
      throw new Error('Path not allowed')
    }

    // Ensure directory exists
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })

    await fs.writeFile(filePath, content, encoding)
    logger.info('File written successfully', { filePath })
  } catch (error) {
    logger.error('Failed to write file', { filePath, error })
    throw new Error(
      `Failed to write file: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * GraphQL resolver wrapper - RedwoodJS maps writeFile mutation to this function
 * Returns WriteFileResult to match GraphQL schema
 */
export const writeFile = async ({
  path,
  content,
  encoding = 'utf-8',
}: {
  path: string
  content: string
  encoding?: BufferEncoding
}): Promise<{ success: boolean; path: string; message?: string }> => {
  try {
    await writeFileInternal({ filePath: path, content, encoding })
    return {
      success: true,
      path,
      message: 'File written successfully',
    }
  } catch (error) {
    return {
      success: false,
      path,
      message: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Check if file or directory exists
 */
export const pathExists = async ({
  filePath,
}: {
  filePath: string
}): Promise<boolean> => {
  try {
    if (!isAllowedPath(filePath)) {
      return false
    }
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Get file stats
 */
export const getFileStats = async ({
  filePath,
}: {
  filePath: string
}): Promise<import('fs').Stats> => {
  try {
    if (!isAllowedPath(filePath)) {
      throw new Error('Path not allowed')
    }
    return await fs.stat(filePath)
  } catch (error) {
    logger.error('Failed to get file stats', { filePath, error })
    throw new Error(
      `Failed to get file stats: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

// Security: Whitelist allowed directories
// For desktop app, allow user's home directory by default
const getAllowedBaseDirectories = (): string[] => {
  const allowed: string[] = []

  // Allow home directory (with fallback to os.homedir())
  const homeDir = process.env.HOME || os.homedir()
  if (homeDir) {
    allowed.push(homeDir)
    logger.info('File system access: allowing home directory', { homeDir })
  }

  // Allow custom ALLOWED_DIRECTORIES from environment (comma-separated)
  if (process.env.ALLOWED_DIRECTORIES) {
    const customDirs = process.env.ALLOWED_DIRECTORIES.split(',').map((dir) =>
      dir.trim()
    )
    allowed.push(...customDirs)
    logger.info('File system access: allowing custom directories', { customDirs })
  }

  if (allowed.length === 0) {
    logger.warn('No allowed directories configured for file system access')
  }

  return allowed.filter((dir) => dir.length > 0)
}

const ALLOWED_BASE_DIRECTORIES = getAllowedBaseDirectories()

/**
 * Validate that a path is within allowed directories
 * Reference: Report 03 - Security section
 */
function isAllowedPath(filePath: string): boolean {
  if (ALLOWED_BASE_DIRECTORIES.length === 0) {
    // If no allowed directories configured, deny all access
    logger.warn('No allowed directories configured')
    return false
  }

  const normalized = path.normalize(filePath)

  // Check if path starts with any allowed base directory
  return ALLOWED_BASE_DIRECTORIES.some((base) => {
    const normalizedBase = path.normalize(base)
    return normalized.startsWith(normalizedBase) || normalized === normalizedBase
  })
}

