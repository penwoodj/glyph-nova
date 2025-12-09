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
 */
export const detectFilePaths = (message: string): string[] => {
  const paths: string[] = []

  // Pattern 1: Absolute paths (e.g., /home/user/file.js, /path/to/file.txt)
  const absolutePathRegex = /\/[^\s,;'"<>|?*\n]+\.\w+/g
  const absolutePaths = message.match(absolutePathRegex) || []
  paths.push(...absolutePaths)

  // Pattern 2: Paths added by "Copy Path to Chat" (may have backticks)
  const backtickPathRegex = /`([^`]+\.\w+)`/g
  let match
  while ((match = backtickPathRegex.exec(message)) !== null) {
    if (match[1].includes('/')) {
      paths.push(match[1])
    }
  }

  // Remove duplicates
  return [...new Set(paths)]
}

/**
 * Load file content from cache or GraphQL
 */
export const loadFileContent = async (
  path: string,
  apolloClient: any
): Promise<string | null> => {
  // Check cache first
  if (fileContentCache.has(path)) {
    return fileContentCache.get(path)!
  }

  try {
    const { data } = await apolloClient.query({
      query: READ_FILE_QUERY,
      variables: { path },
      fetchPolicy: 'network-only', // Always fetch fresh content
    })

    if (data?.readFile?.content) {
      const content = data.readFile.content
      // Cache the content
      fileContentCache.set(path, content)
      // Evict old entries if cache is too large
      evictCacheIfNeeded()
      return content
    }

    return null
  } catch (error) {
    console.error(`Failed to load file content for ${path}:`, error)
    return null
  }
}

/**
 * Load multiple file contexts from detected paths
 */
export const loadFileContexts = async (
  message: string,
  apolloClient: any
): Promise<FileContext[]> => {
  const paths = detectFilePaths(message)

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
      contexts.push({
        path: paths[index],
        content: result.value,
      })
    }
  })

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

