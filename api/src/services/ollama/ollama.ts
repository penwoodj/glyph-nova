/**
 * Ollama Service
 *
 * Service for interacting with local Ollama instance.
 * Provides model management, health checking, and chat completion functionality.
 *
 * Reference: Report 05 (Ollama Integration Patterns)
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'

/**
 * Get user-friendly error message for Ollama/network errors
 * Handles common error types: connection refused, timeout, network errors
 */
function getOllamaErrorMessage(error: unknown, operation: string): string {
  if (error && typeof error === 'object') {
    // Check for AbortError (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      return `Request timeout: The ${operation} request timed out. Ollama may be slow to respond or unavailable. Please try again.`
    }

    // Check for network error codes (Node.js fetch errors)
    if ('code' in error) {
      const code = (error as { code: string }).code

      switch (code) {
        case 'ECONNREFUSED':
          return `Connection refused: Cannot ${operation}. Ollama is not running or not accessible at ${OLLAMA_BASE_URL}. Please ensure Ollama is installed and running.`
        case 'ETIMEDOUT':
          return `Connection timeout: The ${operation} request timed out. Ollama may be slow to respond or the network connection is unstable.`
        case 'ENOTFOUND':
          return `Host not found: Cannot ${operation}. The Ollama server address could not be resolved. Please check your network connection and Ollama configuration.`
        case 'ECONNRESET':
          return `Connection reset: The ${operation} connection was reset by Ollama. The service may be restarting or overloaded.`
        default:
          // Fall through to generic error message
          break
      }
    }

    // Check for fetch API errors (TypeError for network failures)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return `Network error: Cannot ${operation}. Failed to connect to Ollama at ${OLLAMA_BASE_URL}. Please ensure Ollama is running and accessible.`
    }
  }

  // Generic error message
  const errorMessage = error instanceof Error ? error.message : String(error)
  return `Failed to ${operation}: ${errorMessage}. Please ensure Ollama is running and accessible at ${OLLAMA_BASE_URL}.`
}

// Types
export interface OllamaModel {
  name: string
  modified_at: string
  size: number
  digest: string
}

export interface OllamaModelListResponse {
  models: OllamaModel[]
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface FileContext {
  path: string
  content: string
}

export interface StreamChatCompletionParams {
  model: string
  messages: ChatMessage[]
  context?: FileContext[]
}

// Cache for model list
let modelListCache: OllamaModel[] | null = null
let modelListCacheTime: number = 0
const MODEL_CACHE_TTL = 60000 // 1 minute

/**
 * Check if Ollama service is available
 *
 * Reference: Report 05 (Error handling section)
 */
export const checkOllamaHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    return response.ok
  } catch (error) {
    console.error('Ollama health check failed:', error)
    return false
  }
}

/**
 * List available Ollama models
 *
 * Reference: Report 05 (Model management section)
 */
export const listOllamaModels = async (): Promise<OllamaModel[]> => {
  // Check cache first
  const now = Date.now()
  if (modelListCache && Array.isArray(modelListCache) && now - modelListCacheTime < MODEL_CACHE_TTL) {
    return modelListCache
  }

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      const statusText = response.statusText || 'Unknown error'
      const status = response.status
      let errorMessage = `Failed to fetch models (${status}): ${statusText}`

      if (status === 500) {
        errorMessage = `Ollama server error: The Ollama service encountered an internal error while fetching models. Please check Ollama logs.`
      } else if (status === 503) {
        errorMessage = `Ollama service unavailable: The Ollama service is temporarily unavailable. Please ensure Ollama is running.`
      }

      throw new Error(errorMessage)
    }

    const data: OllamaModelListResponse = await response.json()

    // Ensure we have a valid models array
    const rawModels = data.models || []

    // Normalize each model: ensure modified_at is always a non-null string
    const models = rawModels.map((model) => ({
      ...model,
      modified_at: model.modified_at || '',
    }))

    // Update cache
    modelListCache = models
    modelListCacheTime = now

    return models
  } catch (error) {
    console.error('Failed to list Ollama models:', error)
    const errorMessage = getOllamaErrorMessage(error, 'list Ollama models')
    throw new Error(errorMessage)
  }
}

/**
 * Format file context for inclusion in chat messages
 *
 * Reference: Report 05 (File context integration section)
 */
export const formatFileContext = (context: FileContext[]): string => {
  if (!context || context.length === 0) return ''

  const formattedFiles = context.map((file) => {
    return `File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\``
  })

  return `\n\nFile Context:\n${formattedFiles.join('\n\n')}`
}

/**
 * Stream chat completion from Ollama
 *
 * Generator function that yields response chunks as they arrive.
 *
 * Reference: Report 05 (Streaming pattern section)
 */
export async function* streamChatCompletion({
  model,
  messages,
  context,
}: StreamChatCompletionParams): AsyncGenerator<string, void, unknown> {
  try {
    // Format messages with file context if provided
    const formattedMessages = [...messages]
    if (context && context.length > 0) {
      const contextStr = formatFileContext(context)
      // Add context to the last user message
      const lastUserMsgIndex = formattedMessages
        .map((m, i) => (m.role === 'user' ? i : -1))
        .filter((i) => i !== -1)
        .pop()

      if (lastUserMsgIndex !== undefined) {
        formattedMessages[lastUserMsgIndex] = {
          ...formattedMessages[lastUserMsgIndex],
          content: formattedMessages[lastUserMsgIndex].content + contextStr,
        }
      }
    }

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const statusText = response.statusText || 'Unknown error'
      const status = response.status
      let errorMessage = `Ollama API error (${status}): ${statusText}`

      // Provide more specific error messages for common HTTP status codes
      if (status === 404) {
        errorMessage = `Model not found: The requested model may not be available. Please check that the model name is correct and that Ollama has the model installed.`
      } else if (status === 500) {
        errorMessage = `Ollama server error: The Ollama service encountered an internal error. Please try again or check Ollama logs.`
      } else if (status === 503) {
        errorMessage = `Ollama service unavailable: The Ollama service is temporarily unavailable. Please ensure Ollama is running and try again.`
      }

      throw new Error(errorMessage)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Failed to get response reader')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true })

        // Process complete lines in the buffer
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim() === '') continue

          try {
            const data = JSON.parse(line)

            // Yield the message content if present
            if (data.message?.content) {
              yield data.message.content
            }

            // Check if stream is done
            if (data.done === true) {
              return
            }
          } catch (parseError) {
            console.error('Failed to parse streaming response line:', line)
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  } catch (error) {
    console.error('Streaming chat completion error:', error)
    const errorMessage = getOllamaErrorMessage(error, 'stream chat completion')
    throw new Error(errorMessage)
  }
}

/**
 * Invalidate model list cache
 * Call this when you want to force a refresh of the model list
 */
export const invalidateModelCache = (): void => {
  modelListCache = null
  modelListCacheTime = 0
}

/**
 * GraphQL resolver wrapper - RedwoodJS maps ollamaModels query to this function
 * This matches the GraphQL query name and ensures we always return an array
 */
export const ollamaModels = async (): Promise<any[]> => {
  try {
    const models = await listOllamaModels()
    // Ensure all models have required fields for GraphQL schema
    // GraphQL schema expects `modifiedAt` (camelCase), but API returns `modified_at` (snake_case)
    // Transform to match GraphQL schema field names
    return models.map((model) => ({
      ...model,
      // Ensure modified_at is always a string (never null/undefined)
      modified_at: model.modified_at || '',
      // Add camelCase version for GraphQL schema
      modifiedAt: model.modified_at || '',
    }))
  } catch (error) {
    // Ollama is unavailable - return empty array instead of throwing
    console.warn('Ollama models unavailable in service, returning empty array:', error)
    return []
  }
}

/**
 * GraphQL resolver wrapper for CLI-based model listing
 * RedwoodJS maps ollamaModelsCLI query to this function
 */
export const ollamaModelsCLI = async (): Promise<any[]> => {
  try {
    // Import ollamaCLI directly (not dynamically) to ensure it's bundled correctly
    const { ollamaCLI } = require('./ollama-cli')
    const models = await ollamaCLI.listModelsCLI()

    // Ensure all models have required fields for GraphQL schema
    return models.map((model) => ({
      ...model,
      // Ensure modified_at is always a string (never null/undefined)
      modified_at: model.modified_at || '',
      // Add camelCase version for GraphQL schema
      modifiedAt: model.modified_at || '',
    }))
  } catch (error) {
    // CLI is unavailable - return empty array instead of throwing
    console.warn('Ollama CLI models unavailable in service, returning empty array:', error)
    return []
  }
}

/**
 * GraphQL resolver wrapper - RedwoodJS maps ollamaHealth query to this function
 * This matches the GraphQL query name and ensures we always return a boolean
 */
export const ollamaHealth = async (): Promise<boolean> => {
  try {
    return await checkOllamaHealth()
  } catch (error) {
    // Ollama is unavailable - return false instead of throwing
    console.warn('Ollama health check failed in service, returning false:', error)
    return false
  }
}

/**
 * GraphQL resolver wrapper for CLI-based health check
 * RedwoodJS maps ollamaHealthCLI query to this function
 */
export const ollamaHealthCLI = async (): Promise<boolean> => {
  try {
    // Import ollamaCLI directly (not dynamically) to ensure it's bundled correctly
    const { ollamaCLI } = require('./ollama-cli')
    return await ollamaCLI.isAvailable()
  } catch (error) {
    // CLI is unavailable - return false instead of throwing
    console.warn('Ollama CLI health check failed in service, returning false:', error)
    return false
  }
}

/**
 * Send chat message via CLI
 * RedwoodJS maps sendChatMessageCLI mutation to this function
 */
interface SendMessageInput {
  model: string
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  fileContext?: Array<{ path: string; content: string }>
}

export const sendChatMessageCLI = async ({ input }: { input: SendMessageInput }): Promise<any> => {
  try {
    const { ollamaCLI } = require('./ollama-cli')

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
    // Note: Using 'run' command which combines model loading and generation
    // Skip argument validation for the prompt (last argument)
    const result = await ollamaCLI.executeCommand(
      'run',
      [input.model, prompt],
      120000, // 2 minute timeout
      true // Skip validation for prompt argument
    )

    if (!result.success) {
      throw new Error(result.stderr || 'Failed to generate response')
    }

    return {
      content: result.stdout,
      model: input.model,
      done: true,
    }
  } catch (error) {
    console.error('CLI chat message error:', error)
    // Better error message formatting
    if (error && typeof error === 'object') {
      if ('type' in error) {
        // This is an OllamaError
        throw new Error(`Failed to send chat message via CLI: ${error.message || JSON.stringify(error)}`)
      }
    }
    throw new Error(
      `Failed to send chat message via CLI: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

