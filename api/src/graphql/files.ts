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
  FileEntry,
  DirectoryContents,
} from 'src/services/files/files'

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
    return await getDirectoryContents({ directoryPath: path })
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
    try {
      await writeFileService({ filePath: path, content })
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
  },
}

// Type resolvers for Date serialization
export const FileEntry = {
  modified: (parent: FileEntry) => {
    return parent.modified instanceof Date
      ? parent.modified.toISOString()
      : new Date(parent.modified).toISOString()
  },
}

export const FileStats = {
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

