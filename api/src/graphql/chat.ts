/**
 * GraphQL Resolvers for Chat Operations
 *
 * Maps GraphQL queries and mutations to Ollama service functions.
 * Reference: Report 05 (Ollama Integration Patterns)
 */

import {
  checkOllamaHealth,
  ollamaModels as getOllamaModels,
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
   * Returns empty array if Ollama is unavailable (graceful degradation)
   * CRITICAL: Must always return an array, never null or undefined
   * Uses the service function which normalizes modified_at to ensure it's always a string
   */
  ollamaModels: async (): Promise<OllamaModel[]> => {
    // Use the service function which has the normalization for modified_at
    const models = await getOllamaModels()

    // CRITICAL FIX: GraphQL expects field names to match the schema
    // Schema has `modifiedAt` (camelCase), but data has `modified_at` (snake_case)
    // Type resolver should map this, but GraphQL validates BEFORE calling resolvers
    // Solution: Transform data to match schema field names AND ensure values are non-null
    return models.map((model) => {
      // Get modified_at from snake_case field
      const modifiedAtValue = model.modified_at
      // Ensure it's always a non-null string
      const normalizedModifiedAt =
        modifiedAtValue === null || modifiedAtValue === undefined || modifiedAtValue === ''
          ? ''
          : String(modifiedAtValue)

      // Return object with BOTH snake_case (for type resolver) AND camelCase (for direct access)
      // This ensures GraphQL can find the field even if type resolver isn't called
      return {
        ...model,
        modified_at: normalizedModifiedAt, // Keep for type resolver
        modifiedAt: normalizedModifiedAt,  // Add camelCase for direct GraphQL access
      } as any // Type assertion needed because OllamaModel interface has modified_at, not modifiedAt
    })
  },

  /**
   * Check if Ollama service is available
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
    // DEBUG: Log what we're receiving
    console.log('🔍 OllamaModel.modifiedAt resolver called', {
      hasParent: !!parent,
      parentKeys: parent ? Object.keys(parent) : [],
      modified_at: parent?.modified_at,
      modified_atType: typeof parent?.modified_at,
    })

    // Handle null/undefined modified_at from Ollama API
    // Return empty string as fallback to satisfy non-nullable GraphQL schema
    // Also handle cases where parent might not have the property
    if (parent && typeof parent === 'object') {
      // Check for modified_at (snake_case from API)
      if ('modified_at' in parent) {
        const value = parent.modified_at
        if (value === null || value === undefined) {
          console.warn('⚠️ OllamaModel.modifiedAt: modified_at is null/undefined, returning empty string')
          return ''
        }
        return String(value)
      }
      // Check for modifiedAt (camelCase - in case it was already transformed)
      if ('modifiedAt' in parent) {
        const value = (parent as any).modifiedAt
        if (value === null || value === undefined) {
          console.warn('⚠️ OllamaModel.modifiedAt: modifiedAt is null/undefined, returning empty string')
          return ''
        }
        return String(value)
      }
    }
    // Fallback: return empty string if modified_at is missing
    console.error('❌ OllamaModel.modifiedAt: parent missing modified_at/modifiedAt property', {
      parent,
      parentType: typeof parent,
      parentKeys: parent ? Object.keys(parent) : [],
    })
    return ''
  },
}

