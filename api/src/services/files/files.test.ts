/**
 * File System Service Tests
 *
 * Tests for file system operations including directory listing,
 * file reading, writing, and security checks.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import {
  getDirectoryContents,
  readFile,
  writeFile,
  pathExists,
  getFileStats,
} from './files'

describe('File System Service', () => {
  let testDir: string
  let testFilePath: string

  beforeAll(async () => {
    // Create a test directory in temp folder
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-service-test-'))
    testFilePath = path.join(testDir, 'test.txt')

    // Create test files and directories
    await fs.writeFile(testFilePath, 'test content', 'utf-8')
    await fs.mkdir(path.join(testDir, 'subdir'), { recursive: true })
    await fs.writeFile(
      path.join(testDir, 'subdir', 'nested.txt'),
      'nested content',
      'utf-8'
    )
  })

  afterAll(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  describe('getDirectoryContents', () => {
    it('should list directory contents', async () => {
      const result = await getDirectoryContents({ directoryPath: testDir })

      expect(result).toHaveProperty('files')
      expect(result).toHaveProperty('folders')
      expect(Array.isArray(result.files)).toBe(true)
      expect(Array.isArray(result.folders)).toBe(true)
    })

    it('should separate files and folders', async () => {
      const result = await getDirectoryContents({ directoryPath: testDir })

      const hasTestFile = result.files.some((file) => file.name === 'test.txt')
      const hasSubdir = result.folders.some((folder) => folder.name === 'subdir')

      expect(hasTestFile).toBe(true)
      expect(hasSubdir).toBe(true)
    })

    it('should include file metadata', async () => {
      const result = await getDirectoryContents({ directoryPath: testDir })
      const testFile = result.files.find((file) => file.name === 'test.txt')

      expect(testFile).toBeDefined()
      expect(testFile?.type).toBe('file')
      expect(testFile?.path).toBe(testFilePath)
      expect(testFile?.size).toBeGreaterThan(0)
      expect(testFile?.modified).toBeInstanceOf(Date)
    })

    it('should reject paths outside allowed directories', async () => {
      await expect(
        getDirectoryContents({ directoryPath: '/etc/passwd' })
      ).rejects.toThrow('Path not allowed')
    })
  })

  describe('readFile', () => {
    it('should read file contents', async () => {
      const content = await readFile({ filePath: testFilePath })
      expect(content).toBe('test content')
    })

    it('should reject paths outside allowed directories', async () => {
      await expect(readFile({ filePath: '/etc/passwd' })).rejects.toThrow(
        'Path not allowed'
      )
    })
  })

  describe('writeFile', () => {
    it('should write file contents', async () => {
      const writePath = path.join(testDir, 'write-test.txt')
      const content = 'new content'

      await writeFile({ filePath: writePath, content })
      const readBack = await readFile({ filePath: writePath })

      expect(readBack).toBe(content)
    })

    it('should create parent directories if needed', async () => {
      const nestedPath = path.join(testDir, 'new', 'nested', 'file.txt')
      const content = 'nested content'

      await writeFile({ filePath: nestedPath, content })
      const readBack = await readFile({ filePath: nestedPath })

      expect(readBack).toBe(content)
    })
  })

  describe('pathExists', () => {
    it('should return true for existing files', async () => {
      const exists = await pathExists({ filePath: testFilePath })
      expect(exists).toBe(true)
    })

    it('should return false for non-existent files', async () => {
      const exists = await pathExists({
        filePath: path.join(testDir, 'nonexistent.txt'),
      })
      expect(exists).toBe(false)
    })
  })

  describe('getFileStats', () => {
    it('should return file stats', async () => {
      const stats = await getFileStats({ filePath: testFilePath })
      expect(stats).toBeDefined()
      expect(stats.isFile()).toBe(true)
      expect(stats.size).toBeGreaterThan(0)
    })
  })
})

