/**
 * GraphQL Resolvers for Chat Operations
 *
 * Maps GraphQL queries and mutations to Ollama service functions.
 * Reference: Report 05 (Ollama Integration Patterns)
 */

import {
  checkOllamaHealth,
  listOllamaModels,
  streamChatCompletion,
  type OllamaModel,
  type ChatMessage,
  type FileContext,
} from 'src/services/ollama/ollama'

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
   * Get list of available Ollama models
   */
  ollamaModels: async (): Promise<OllamaModel[]> => {
    return await listOllamaModels()
  },

  /**
   * Check if Ollama service is available
   */
  ollamaHealth: async (): Promise<boolean> => {
    return await checkOllamaHealth()
  },
}

export const Mutation = {
  /**
   * Send a chat message and get the complete response
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
}

// Type resolver for OllamaModel to map API response to GraphQL schema
export const OllamaModel = {
  modifiedAt: (parent: OllamaModel) => {
    return parent.modified_at
  },
}

