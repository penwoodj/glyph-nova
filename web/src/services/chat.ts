/**
 * Chat Streaming Service
 *
 * Frontend service for streaming chat responses from Ollama.
 * Handles real-time chunk processing and connection management.
 *
 * Reference: Report 08 (Chat Interface Patterns - Streaming service section)
 */

import type { FileContext } from 'src/state/store'

export interface StreamChatOptions {
  message: string
  model: string
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  fileContext?: FileContext[]
  onChunk: (chunk: string) => void
  onError?: (error: Error) => void
  onComplete?: () => void
}

/**
 * Stream chat response from backend
 *
 * Calls the backend streaming endpoint and processes chunks in real-time.
 * The backend handles Ollama communication and file context formatting.
 */
export const streamChatResponse = async ({
  message,
  model,
  messages,
  fileContext,
  onChunk,
  onError,
  onComplete,
}: StreamChatOptions): Promise<void> => {
  try {
    // Call backend streaming endpoint
    // Note: We'll need to create a streaming REST endpoint in the backend
    // For now, we'll use a GraphQL subscription or direct API call
    // Since GraphQL subscriptions are complex, we'll create a streaming REST endpoint

    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        fileContext,
      }),
    })

    if (!response.ok) {
      throw new Error(`Streaming request failed: ${response.statusText}`)
    }

    if (!response.body) {
      throw new Error('No response body for streaming')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          // Process any remaining buffer
          if (buffer.trim()) {
            try {
              const data = JSON.parse(buffer)
              if (data.content) {
                onChunk(data.content)
              }
            } catch (e) {
              // Ignore parse errors for final buffer
            }
          }
          break
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true })

        // Process complete lines (Ollama sends JSON lines)
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue

          try {
            const data = JSON.parse(line)

            // Extract content from Ollama response format
            // Ollama streaming format: { "message": { "content": "..." }, "done": false }
            if (data.message?.content) {
              onChunk(data.message.content)
            }

            // Check if stream is complete
            if (data.done === true) {
              onComplete?.()
              return
            }
          } catch (parseError) {
            // Skip invalid JSON lines (may be partial chunks)
            console.warn('Failed to parse streaming line:', line)
          }
        }
      }

      onComplete?.()
    } finally {
      reader.releaseLock()
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown streaming error'
    onError?.(new Error(errorMessage))
    throw error
  }
}

/**
 * Stream chat response directly from Ollama (bypassing backend)
 *
 * Alternative implementation that calls Ollama directly from frontend.
 * This is simpler but doesn't use backend context formatting.
 * Use this if backend streaming endpoint is not available.
 */
export const streamChatResponseDirect = async ({
  model,
  messages,
  fileContext,
  onChunk,
  onError,
  onComplete,
}: Omit<StreamChatOptions, 'message'>): Promise<void> => {
  try {
    // Format file context if provided
    let formattedMessages = [...messages]
    if (fileContext && fileContext.length > 0) {
      const contextStr = fileContext
        .map((file) => `File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\``)
        .join('\n\n')

      // Add context to the last user message
      const lastUserMsgIndex = formattedMessages
        .map((m, i) => (m.role === 'user' ? i : -1))
        .filter((i) => i !== -1)
        .pop()

      if (lastUserMsgIndex !== undefined) {
        formattedMessages[lastUserMsgIndex] = {
          ...formattedMessages[lastUserMsgIndex],
          content: formattedMessages[lastUserMsgIndex].content + '\n\nFile Context:\n' + contextStr,
        }
      }
    }

    const response = await fetch('http://localhost:11434/api/chat', {
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

    if (!response.body) {
      throw new Error('No response body for streaming')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          // Process any remaining buffer
          if (buffer.trim()) {
            try {
              const data = JSON.parse(buffer)
              if (data.message?.content) {
                onChunk(data.message.content)
              }
            } catch (e) {
              // Ignore parse errors for final buffer
            }
          }
          break
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true })

        // Process complete lines (Ollama sends JSON lines)
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue

          try {
            const data = JSON.parse(line)

            // Extract content from Ollama response format
            if (data.message?.content) {
              onChunk(data.message.content)
            }

            // Check if stream is complete
            if (data.done === true) {
              onComplete?.()
              return
            }
          } catch (parseError) {
            // Skip invalid JSON lines (may be partial chunks)
            console.warn('Failed to parse streaming line:', line)
          }
        }
      }

      onComplete?.()
    } finally {
      reader.releaseLock()
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown streaming error'
    onError?.(new Error(errorMessage))
    throw error
  }
}

