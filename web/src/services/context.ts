/**
 * File Context Service
 *
 * Service for loading and managing file context for chat messages.
 * Detects file paths, loads content, and caches for performance.
 *
 * Reference: Report 05 (Ollama Integration Patterns - File context integration section)
 */

import { gql } from '@apollo/client'
import type { FileContext } from 'src/state/store'

export const READ_FILE_QUERY = gql`
  query ReadFileForContextQuery($path: String!) {
    readFile(path: $path) {
      path
      content
      encoding
    }
  }
`

export const DIRECTORY_CONTENTS_QUERY = gql`
  query DirectoryContentsForContextQuery($path: String!) {
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

// Cache for loaded file content
// Using Map with size limit to prevent memory issues
const fileContentCache = new Map<string, string>()

// Maximum cache size (number of files)
const MAX_CACHE_SIZE = 100

/**
 * Evict oldest entries if cache exceeds size limit
 */
const evictCacheIfNeeded = () => {
  if (fileContentCache.size > MAX_CACHE_SIZE) {
    // Remove oldest entries (first in Map)
    const entriesToRemove = fileContentCache.size - MAX_CACHE_SIZE
    const keysToRemove = Array.from(fileContentCache.keys()).slice(0, entriesToRemove)
    keysToRemove.forEach((key) => fileContentCache.delete(key))
  }
}

/**
 * Detect file paths in a message
 * Looks for absolute paths (starting with /) or paths that look like file paths
 * Also detects directory paths (without file extensions)
 */
export const detectFilePaths = (message: string): string[] => {
  const paths: string[] = []

  // Pattern 1: Absolute paths (files and directories)
  // Matches paths starting with / that contain at least one character after /
  // This will match both files (/path/to/file.js) and directories (/path/to/directory)
  // Updated regex to be more permissive and match paths that might be at end of line or followed by punctuation
  const absolutePathRegex = /\/(?:[^\s,;'"<>|?*\n]+\/)*[^\s,;'"<>|?*\n]+/g
  const absolutePaths = message.match(absolutePathRegex) || []
  paths.push(...absolutePaths)
  console.log('[context] detectFilePaths - Pattern 1 matches:', absolutePaths)

  // Pattern 2: Paths added by "Copy Path to Chat" (may have backticks)
  const backtickPathRegex = /`([^`]+)`/g
  let match
  while ((match = backtickPathRegex.exec(message)) !== null) {
    const path = match[1]
    if (path.includes('/') && path.startsWith('/')) {
      paths.push(path)
    }
  }
  console.log('[context] detectFilePaths - Pattern 2 matches:', paths.filter(p => !absolutePaths.includes(p)))

  // Remove duplicates and normalize paths (remove trailing slashes for directories)
  const normalizedPaths = [...new Set(paths)].map(path => path.trim().replace(/\/$/, ''))
  console.log('[context] detectFilePaths - Final normalized paths:', normalizedPaths)
  return normalizedPaths
}

/**
 * Load directory tree structure recursively
 * Returns a formatted tree string showing all files and folders
 */
const loadDirectoryTree = async (
  dirPath: string,
  apolloClient: any,
  maxDepth: number = 5,
  currentDepth: number = 0,
  prefix: string = ''
): Promise<string> => {
  if (currentDepth >= maxDepth) {
    return `${prefix}... (max depth reached)\n`
  }

  try {
    console.log(`[context] Loading directory tree for: ${dirPath} (depth: ${currentDepth})`)
    const { data } = await apolloClient.query({
      query: DIRECTORY_CONTENTS_QUERY,
      variables: { path: dirPath },
      fetchPolicy: 'network-only',
    })

    if (!data?.directoryContents) {
      console.warn(`[context] No directory contents for: ${dirPath}`)
      return ''
    }

    const { files = [], folders = [] } = data.directoryContents
    console.log(`[context] Found ${files.length} files and ${folders.length} folders in ${dirPath}`)
    let tree = ''

    // Add folders first
    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i]
      const isLast = i === folders.length - 1 && files.length === 0
      const currentPrefix = isLast ? '└── ' : '├── '
      const nextPrefix = isLast ? '    ' : '│   '

      tree += `${prefix}${currentPrefix}${folder.name}/\n`

      // Recursively load subdirectories
      const subTree = await loadDirectoryTree(
        folder.path,
        apolloClient,
        maxDepth,
        currentDepth + 1,
        prefix + nextPrefix
      )
      tree += subTree
    }

    // Add files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const isLast = i === files.length - 1
      const currentPrefix = isLast ? '└── ' : '├── '

      tree += `${prefix}${currentPrefix}${file.name}\n`
    }

    console.log(`[context] Generated tree for ${dirPath}, length: ${tree.length}`)
    return tree
  } catch (error) {
    console.error(`[context] Failed to load directory tree for ${dirPath}:`, error)
    return `${prefix}└── [Error loading directory: ${error instanceof Error ? error.message : String(error)}]\n`
  }
}

/**
 * Load file content from cache or GraphQL
 * If path is a directory, loads directory tree structure instead of README.md/index.md
 */
export const loadFileContent = async (
  path: string,
  apolloClient: any
): Promise<string | null> => {
  console.log(`[context] loadFileContent called for path: ${path}`)

  // Check cache first
  if (fileContentCache.has(path)) {
    console.log(`[context] Returning cached content for: ${path}`)
    return fileContentCache.get(path)!
  }

  // If path doesn't have an extension, try loading as directory first
  // This is more efficient than trying to read as file first
  const hasExtension = /\.\w+$/.test(path)
  if (!hasExtension) {
    console.log(`[context] Path has no extension, trying directory tree first for: ${path}`)
    try {
      const treeStructure = await loadDirectoryTree(path, apolloClient)
      if (treeStructure && treeStructure.trim()) {
        const content = `Directory structure for ${path}:\n\n${treeStructure}`
        console.log(`[context] Directory tree loaded (no extension path), content length: ${content.length}`)
        fileContentCache.set(path, content)
        evictCacheIfNeeded()
        return content
      } else {
        console.warn(`[context] Directory tree is empty for: ${path}`)
      }
    } catch (error) {
      console.error(`[context] Failed to load directory tree for ${path}:`, error)
      // Continue to try as file below
    }
  }

  // Try to load the path as-is (might be a file)
  try {
    console.log(`[context] Trying to load as file: ${path}`)
    const { data } = await apolloClient.query({
      query: READ_FILE_QUERY,
      variables: { path },
      fetchPolicy: 'network-only', // Always fetch fresh content
    })

    if (data?.readFile?.content) {
      const content = data.readFile.content
      console.log(`[context] File loaded successfully, content length: ${content.length}`)
      // Cache the content
      fileContentCache.set(path, content)
      // Evict old entries if cache is too large
      evictCacheIfNeeded()
      return content
    }
  } catch (error: any) {
    // If error indicates it's a directory, load tree structure
    // Check for various directory error message formats
    const errorMessage = error?.message || ''
    const isDirectoryError =
      errorMessage.includes('directory') ||
      errorMessage.includes('is a directory') ||
      errorMessage.includes('Cannot read file') ||
      errorMessage.includes('Invalid operation')

    if (isDirectoryError) {
      // Directory detected - load tree structure
      console.log(`[context] Directory detected from error, loading tree structure for: ${path}`)
      try {
        const treeStructure = await loadDirectoryTree(path, apolloClient)
        if (treeStructure && treeStructure.trim()) {
          const content = `Directory structure for ${path}:\n\n${treeStructure}`
          console.log(`[context] Directory tree loaded, content length: ${content.length}`)
          // Cache the tree structure
          fileContentCache.set(path, content)
          evictCacheIfNeeded()
          return content
        } else {
          console.warn(`[context] Directory tree is empty for: ${path}`)
        }
      } catch (treeError) {
        console.error(`[context] Error loading directory tree for ${path}:`, treeError)
      }
    } else {
      // Not a directory error, just return null
      console.warn(`[context] Failed to load ${path} (not a directory error):`, errorMessage)
      return null
    }
  }

  console.warn(`[context] No content loaded for: ${path}`)
  return null
}

/**
 * Load multiple file contexts from detected paths
 */
export const loadFileContexts = async (
  message: string,
  apolloClient: any
): Promise<FileContext[]> => {
  const paths = detectFilePaths(message)
  console.log('[context] Detected paths:', paths)

  if (paths.length === 0) {
    return []
  }

  const contexts: FileContext[] = []

  // Load all files in parallel
  const results = await Promise.allSettled(
    paths.map((path) => loadFileContent(path, apolloClient))
  )

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      console.log(`[context] Loaded content for ${paths[index]}, length: ${result.value.length}`)
      contexts.push({
        path: paths[index],
        content: result.value,
      })
    } else if (result.status === 'rejected') {
      console.error(`[context] Failed to load ${paths[index]}:`, result.reason)
    } else {
      console.warn(`[context] No content loaded for ${paths[index]}`)
    }
  })

  console.log(`[context] Returning ${contexts.length} file contexts`)
  return contexts
}

/**
 * Clear the file content cache
 * Call this when files are modified to ensure fresh content
 */
export const clearFileCache = (path?: string): void => {
  if (path) {
    fileContentCache.delete(path)
  } else {
    fileContentCache.clear()
  }
}

/**
 * Get cache statistics (for debugging)
 */
export const getCacheStats = () => {
  return {
    size: fileContentCache.size,
    maxSize: MAX_CACHE_SIZE,
    paths: Array.from(fileContentCache.keys()),
  }
}

/**
 * Update cache with new content (useful when file is written)
 * This ensures cache stays in sync with file system
 */
export const updateFileCache = (path: string, content: string): void => {
  fileContentCache.set(path, content)
  evictCacheIfNeeded()
}

