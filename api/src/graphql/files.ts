/**
 * GraphQL Resolvers for File Operations
 *
 * Maps GraphQL queries and mutations to file system service functions.
 * Reference: Report 03 (Desktop File System Integration)
 */

import {
  getDirectoryContents,
  readFile as readFileService,
  writeFile as writeFileService,
  pathExists,
  getFileStats,
  DirectoryContents,
} from 'src/services/files/files'
import type { FileEntry } from 'src/services/files/files'
import { logger } from 'src/lib/logger'

interface FileContent {
  path: string
  content: string
  encoding?: string
}

interface FileStats {
  path: string
  size: number
  isFile: boolean
  isDirectory: boolean
  modified: Date
  created?: Date
}

interface WriteFileResult {
  success: boolean
  path: string
  message?: string
}

export const Query = {
  directoryContents: async (
    _: unknown,
    { path }: { path: string }
  ): Promise<DirectoryContents> => {
    // TEMPORARY: Return hardcoded data to test if resolver is called
    console.log('🔍🔍🔍 directoryContents resolver CALLED - RETURNING HARDCODED DATA', { path, contextKeys: Object.keys(context || {}) })
    logger.info('🔍 directoryContents resolver CALLED - RETURNING HARDCODED DATA', { path })

    // Also log to stderr to ensure it's visible
    process.stderr.write(`🔍🔍🔍 directoryContents resolver CALLED with path: ${path}\n`)

    return {
      files: [
        { name: 'test.txt', path: '/home/jon/code/llm-ui/test.txt', type: 'file' as const, extension: '.txt', size: 100, modified: new Date() }
      ],
      folders: [
        { name: 'api', path: '/home/jon/code/llm-ui/api', type: 'directory' as const, size: 0, modified: new Date() }
      ]
    }

    // Original code commented out for testing
    /*
    try {
      logger.info('🔍 Calling getDirectoryContents service', { path })
      const result = await getDirectoryContents({ directoryPath: path })
      logger.info('✅ directoryContents success', {
        path,
        fileCount: result.files.length,
        folderCount: result.folders.length,
        firstFile: result.files[0]?.name,
        firstFolder: result.folders[0]?.name
      })
      console.log('✅✅✅ directoryContents SUCCESS', { fileCount: result.files.length, folderCount: result.folders.length })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      console.error('❌❌❌ directoryContents ERROR', { path, error: errorMessage, stack: errorStack })
      logger.error('❌ directoryContents error', {
        path,
        error: errorMessage,
        stack: errorStack
      })
      throw error
    }
    */
  },

  readFile: async (
    _: unknown,
    { path }: { path: string }
  ): Promise<FileContent> => {
    const content = await readFileService({ filePath: path })
    return {
      path,
      content,
      encoding: 'utf-8',
    }
  },

  fileStats: async (
    _: unknown,
    { path }: { path: string }
  ): Promise<FileStats> => {
    const stats = await getFileStats({ filePath: path })
    return {
      path,
      size: stats.size,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      modified: stats.mtime,
      created: stats.birthtime,
    }
  },

  pathExists: async (_: unknown, { path }: { path: string }): Promise<boolean> => {
    return await pathExists({ filePath: path })
  },
}

export const Mutation = {
  writeFile: async (
    _: unknown,
    { path, content }: { path: string; content: string }
  ): Promise<WriteFileResult> => {
    // Service function now returns WriteFileResult directly
    return await writeFileService({ path, content })
  },
}

// Type resolvers for Date serialization
export const FileEntryResolver = {
  modified: (parent: FileEntry) => {
    return parent.modified instanceof Date
      ? parent.modified.toISOString()
      : new Date(parent.modified).toISOString()
  },
}

export const FileStatsResolver = {
  modified: (parent: FileStats) => {
    return parent.modified instanceof Date
      ? parent.modified.toISOString()
      : new Date(parent.modified).toISOString()
  },
  created: (parent: FileStats) => {
    if (!parent.created) return null
    return parent.created instanceof Date
      ? parent.created.toISOString()
      : new Date(parent.created).toISOString()
  },
}

// DateTime scalar resolver
export const DateTime = {
  serialize: (value: Date) => value.toISOString(),
  parseValue: (value: string) => new Date(value),
  parseLiteral: (ast: any) => new Date(ast.value),
}

