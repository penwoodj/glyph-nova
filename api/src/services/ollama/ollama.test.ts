/**
 * Ollama Service Tests
 *
 * Unit tests for Ollama service functions.
 * Note: These tests require a running Ollama instance for integration tests.
 */

import {
  checkOllamaHealth,
  listOllamaModels,
  formatFileContext,
  invalidateModelCache,
  type FileContext,
} from './ollama'

describe('ollama service', () => {
  describe('formatFileContext', () => {
    it('returns empty string for empty context', () => {
      const result = formatFileContext([])
      expect(result).toBe('')
    })

    it('formats single file context correctly', () => {
      const context: FileContext[] = [
        {
          path: '/test/file.js',
          content: 'console.log("hello")',
        },
      ]

      const result = formatFileContext(context)
      expect(result).toContain('File: /test/file.js')
      expect(result).toContain('console.log("hello")')
      expect(result).toContain('```')
    })

    it('formats multiple file contexts correctly', () => {
      const context: FileContext[] = [
        {
          path: '/test/file1.js',
          content: 'const x = 1',
        },
        {
          path: '/test/file2.js',
          content: 'const y = 2',
        },
      ]

      const result = formatFileContext(context)
      expect(result).toContain('File: /test/file1.js')
      expect(result).toContain('File: /test/file2.js')
      expect(result).toContain('const x = 1')
      expect(result).toContain('const y = 2')
    })
  })

  describe('invalidateModelCache', () => {
    it('should not throw when called', () => {
      expect(() => invalidateModelCache()).not.toThrow()
    })
  })

  // Integration tests (require running Ollama instance)
  // Uncomment these when testing with a live Ollama service

  // describe('checkOllamaHealth (integration)', () => {
  //   it('returns true when Ollama is running', async () => {
  //     const isHealthy = await checkOllamaHealth()
  //     expect(typeof isHealthy).toBe('boolean')
  //   })
  // })

  // describe('listOllamaModels (integration)', () => {
  //   it('returns list of models when Ollama is running', async () => {
  //     const models = await listOllamaModels()
  //     expect(Array.isArray(models)).toBe(true)
  //   })
  // })
})

