/**
 * GraphQL Resolvers for Chat Operations
 *
 * Maps GraphQL queries and mutations to Ollama service functions.
 * Supports both HTTP API and CLI execution modes.
 * Reference: Report 05 (Ollama Integration Patterns)
 */

import {
  checkOllamaHealth,
  streamChatCompletion,
  formatFileContext,
  type ChatMessage,
  type FileContext,
} from 'src/services/ollama/ollama'

import { ollamaCLI } from 'src/services/ollama/ollama-cli'

interface SendMessageInput {
  model: string
  messages: ChatMessage[]
  fileContext?: FileContext[]
}

interface ChatResponse {
  content: string
  model: string
  done: boolean
}

export const Query = {
  /**
   * Check if Ollama service is available (HTTP API)
   * Returns false if Ollama is unavailable (graceful degradation)
   */
  ollamaHealth: async (): Promise<boolean> => {
    try {
      return await checkOllamaHealth()
    } catch (error) {
      // Ollama is unavailable - return false instead of throwing
      console.warn('Ollama health check failed, returning false:', error)
      return false
    }
  },

  /**
   * List available Ollama models via CLI
   * Returns empty array if CLI is unavailable (graceful degradation)
   */
  ollamaModelsCLI: async (): Promise<any[]> => {
    try {
      const models = await ollamaCLI.listModelsCLI()
      // Ensure camelCase field names for GraphQL schema
      return models.map((model) => ({
        ...model,
        modifiedAt: model.modified_at || '',
      }))
    } catch (error) {
      console.warn('CLI model listing failed, returning empty array:', error)
      return []
    }
  },

  /**
   * Check if Ollama CLI is available
   * Returns false if CLI is not installed or not responding
   */
  ollamaHealthCLI: async (): Promise<boolean> => {
    try {
      return await ollamaCLI.isAvailable()
    } catch (error) {
      console.warn('Ollama CLI health check failed:', error)
      return false
    }
  },
}

export const Mutation = {
  /**
   * Send a chat message and get the complete response (HTTP API)
   *
   * Note: This collects the entire streaming response before returning.
   * For real-time streaming, use WebSocket subscriptions or direct API calls from frontend.
   */
  sendChatMessage: async (
    _: unknown,
    { input }: { input: SendMessageInput }
  ): Promise<ChatResponse> => {
    try {
      const chunks: string[] = []

      // Collect all chunks from the stream
      for await (const chunk of streamChatCompletion({
        model: input.model,
        messages: input.messages,
        context: input.fileContext,
      })) {
        chunks.push(chunk)
      }

      const fullContent = chunks.join('')

      return {
        content: fullContent,
        model: input.model,
        done: true,
      }
    } catch (error) {
      console.error('Chat message error:', error)
      throw new Error(
        `Failed to send chat message: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  },

  /**
   * Send a chat message via CLI and get the response
   *
   * Executes `ollama run <model> <prompt>` command.
   * Supports file context by appending it to the prompt.
   */
  sendChatMessageCLI: async (
    _: unknown,
    { input }: { input: SendMessageInput }
  ): Promise<ChatResponse> => {
    try {
      // Extract the last user message as the prompt
      const lastUserMessage = input.messages
        .filter((m) => m.role === 'user')
        .pop()

      if (!lastUserMessage) {
        throw new Error('No user message found in input')
      }

      // Format prompt with file context if provided
      let prompt = lastUserMessage.content
      if (input.fileContext && input.fileContext.length > 0) {
        const contextStr = formatFileContext(input.fileContext)
        prompt = prompt + contextStr
      }

      // Execute CLI command to generate response
      const response = await ollamaCLI.generateResponse(
        input.model,
        prompt,
        120000 // 2 minute timeout for generation
      )

      return {
        content: response,
        model: input.model,
        done: true,
      }
    } catch (error) {
      console.error('CLI chat message error:', error)
      throw new Error(
        `Failed to send chat message via CLI: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  },
}

// Type resolver for OllamaModel to map API response field names to GraphQL schema
// RedwoodJS calls the service function directly, so the service returns objects with both
// modified_at (snake_case from API) and modifiedAt (camelCase for GraphQL schema)
// This type resolver ensures GraphQL can find the modifiedAt field
export const OllamaModel = {
  modifiedAt: (parent: any) => {
    // Service function adds both modified_at and modifiedAt fields
    // Return the camelCase version if present, otherwise fall back to snake_case
    if (parent && typeof parent === 'object') {
      if ('modifiedAt' in parent) {
        return parent.modifiedAt || ''
      }
      if ('modified_at' in parent) {
        return parent.modified_at || ''
      }
    }
    // Final fallback to satisfy non-nullable schema requirement
    return ''
  },
}


