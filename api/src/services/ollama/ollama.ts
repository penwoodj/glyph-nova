/**
 * Ollama Service
 *
 * Service for interacting with local Ollama instance.
 * Provides model management, health checking, and chat completion functionality.
 *
 * Reference: Report 05 (Ollama Integration Patterns)
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'

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
  if (modelListCache && now - modelListCacheTime < MODEL_CACHE_TTL) {
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
      throw new Error(`Failed to fetch models: ${response.statusText}`)
    }

    const data: OllamaModelListResponse = await response.json()

    // Update cache
    modelListCache = data.models
    modelListCacheTime = now

    return data.models
  } catch (error) {
    console.error('Failed to list Ollama models:', error)
    throw new Error(
      `Ollama service unavailable. Please ensure Ollama is running. Error: ${error instanceof Error ? error.message : String(error)}`
    )
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
      throw new Error(`Ollama API error: ${response.statusText}`)
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
    throw new Error(
      `Failed to stream chat completion: ${error instanceof Error ? error.message : String(error)}`
    )
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

