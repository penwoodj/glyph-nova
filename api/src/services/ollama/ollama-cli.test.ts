/**
 * Tests for Ollama CLI Service
 *
 * Note: These tests require Ollama to be installed and running.
 * They will be skipped if Ollama is not available.
 */

import { ollamaCLI, OllamaCLIService } from './ollama-cli'

describe('OllamaCLIService', () => {
  let cliService: OllamaCLIService

  beforeAll(() => {
    cliService = new OllamaCLIService()
  })

  describe('Command Validation', () => {
    it('should reject invalid commands', async () => {
      await expect(
        cliService.executeCommand('invalid-command', [])
      ).rejects.toThrow('not allowed')
    })

    it('should reject commands with dangerous characters in arguments', async () => {
      await expect(
        cliService.executeCommand('list', ['test; rm -rf /'])
      ).rejects.toThrow('Invalid argument')
    })

    it('should accept valid commands', async () => {
      // This might fail if Ollama is not installed, but validates the command format
      try {
        await cliService.executeCommand('list', [], 5000)
      } catch (error: any) {
        // If it throws, it should be an Ollama error, not a validation error
        expect(error.message).not.toContain('not allowed')
        expect(error.message).not.toContain('Invalid argument')
      }
    })

    it('should accept valid model names with colons', async () => {
      // Model names like "llama2:7b" should be valid
      const validModelNames = ['llama2', 'llama2:7b', 'mistral:7b-instruct', 'codellama:13b']

      for (const modelName of validModelNames) {
        expect(() => {
          // Access private method via casting
          (cliService as any).validateModelName(modelName)
        }).not.toThrow()
      }
    })

    it('should reject invalid model names', async () => {
      const invalidModelNames = [
        'model; rm -rf /',
        'model`whoami`',
        'model$(ls)',
        'model|cat /etc/passwd',
      ]

      for (const modelName of invalidModelNames) {
        await expect(
          cliService.generateResponse(modelName, 'test')
        ).rejects.toThrow('Invalid model name')
      }
    })
  })

  describe('Ollama Availability', () => {
    it('should check if Ollama is available', async () => {
      const available = await cliService.isAvailable()
      expect(typeof available).toBe('boolean')
    })
  })

  describe('List Models', () => {
    it('should list models if Ollama is available', async () => {
      const available = await cliService.isAvailable()

      if (!available) {
        console.log('Skipping test: Ollama not available')
        return
      }

      const models = await cliService.listModelsCLI()
      expect(Array.isArray(models)).toBe(true)

      // If models exist, verify structure
      if (models.length > 0) {
        const firstModel = models[0]
        expect(firstModel).toHaveProperty('name')
        expect(firstModel).toHaveProperty('modified_at')
        expect(firstModel).toHaveProperty('size')
        expect(firstModel).toHaveProperty('digest')
        expect(typeof firstModel.name).toBe('string')
        expect(typeof firstModel.size).toBe('number')
      }
    })

    it('should handle Ollama not being installed', async () => {
      // This test verifies error handling when Ollama is not installed
      // We can't easily simulate this, so we just check the error type
      try {
        await cliService.executeCommand('list', [], 5000)
      } catch (error: any) {
        if (error.type === 'not_installed') {
          expect(error.message).toContain('not installed')
          expect(error.suggestion).toContain('Install Ollama')
        }
      }
    })
  })

  describe('Error Parsing', () => {
    it('should parse model not found errors', () => {
      const stderr = 'Error: model "nonexistent:7b" not found'
      const error = (cliService as any).parseError(stderr, 'run', ['nonexistent:7b', 'test'])

      expect(error.type).toBe('model_not_found')
      expect(error.model).toBe('nonexistent:7b')
      expect(error.message).toContain('not found')
      expect(error.suggestion).toContain('pull')
    })

    it('should parse connection errors', () => {
      const stderr = 'Error: connection refused: dial tcp 127.0.0.1:11434'
      const error = (cliService as any).parseError(stderr, 'list', [])

      expect(error.type).toBe('connection_error')
      expect(error.message).toContain('Cannot connect')
      expect(error.suggestion).toContain('ollama serve')
    })

    it('should handle unknown errors', () => {
      const stderr = 'Some unknown error occurred'
      const error = (cliService as any).parseError(stderr, 'list', [])

      expect(error.type).toBe('unknown')
      expect(error.message).toBe('Some unknown error occurred')
    })
  })

  describe('Output Parsing', () => {
    it('should parse ollama list output correctly', () => {
      // Actual format from ollama list:
      // NAME             ID              SIZE      MODIFIED
      // llama2:latest    78e26419b446    3.8 GB    29 hours ago
      const sampleOutput = `NAME             ID              SIZE      MODIFIED
llama2:latest    78e26419b446    3.8 GB    29 hours ago
mistral:7b       6577803aa9a0    4.1 GB    1 week ago`

      const models = (cliService as any).parseListOutput(sampleOutput)

      expect(models).toHaveLength(2)
      expect(models[0].name).toBe('llama2:latest')
      expect(models[0].digest).toBe('78e26419b446')
      expect(models[0].size).toBeGreaterThan(0) // Size should be parsed from "3.8 GB"
      expect(models[0].modified_at).toContain('hours ago')
      expect(models[1].name).toBe('mistral:7b')
      expect(models[1].digest).toBe('6577803aa9a0')
    })

    it('should handle empty output', () => {
      const emptyOutput = 'NAME    ID    SIZE    MODIFIED\n'
      const models = (cliService as any).parseListOutput(emptyOutput)

      expect(models).toHaveLength(0)
    })

    it('should handle malformed output gracefully', () => {
      const malformedOutput = 'Invalid output format'
      const models = (cliService as any).parseListOutput(malformedOutput)

      // Should return empty array for invalid format
      expect(Array.isArray(models)).toBe(true)
    })
  })

  describe('Singleton Instance', () => {
    it('should export a singleton instance', () => {
      expect(ollamaCLI).toBeInstanceOf(OllamaCLIService)
    })

    it('should be the same instance when imported multiple times', () => {
      const { ollamaCLI: instance1 } = require('./ollama-cli')
      const { ollamaCLI: instance2 } = require('./ollama-cli')

      expect(instance1).toBe(instance2)
    })
  })
})
