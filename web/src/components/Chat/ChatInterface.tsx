/**
 * ChatInterface Component
 *
 * Main chat interface component with model selector, message list, and input area.
 * Integrates with Ollama for LLM chat functionality.
 *
 * Reference: Report 08 (Chat Interface Patterns - Component structure section)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@redwoodjs/web'
import { gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client'
import { ChatMessage } from './ChatMessage'
import { useAppStore } from 'src/state/store'
import { loadFileContexts, clearFileCache } from 'src/services/context'
import { streamChatResponseDirect } from 'src/services/chat'

const OLLAMA_MODELS_QUERY = gql`
  query OllamaModelsQuery {
    ollamaModels {
      name
      modifiedAt
      size
      digest
    }
    ollamaHealth
  }
`

export const ChatInterface = () => {
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [loadingContext, setLoadingContext] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const apolloClient = useApolloClient()

  // Get state from store
  const chatMessages = useAppStore((state) => state.chatMessages)
  const addChatMessage = useAppStore((state) => state.addChatMessage)
  const currentModel = useAppStore((state) => state.currentModel)
  const setCurrentModel = useAppStore((state) => state.setCurrentModel)
  const selectedFilePath = useAppStore((state) => state.selectedFilePath)

  // Fetch available models
  const { data: modelsData, loading: modelsLoading } = useQuery(
    OLLAMA_MODELS_QUERY,
    {
      onCompleted: (data) => {
        // Set first model as default if none selected
        if (!currentModel && data?.ollamaModels?.length > 0) {
          setCurrentModel(data.ollamaModels[0].name)
        }
      },
    }
  )


  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Listen for file path selection events from file tree
  useEffect(() => {
    const handleFilePathSelected = (event: CustomEvent<{ path: string }>) => {
      const path = event.detail.path
      setInputValue((prev) => {
        const separator = prev && !prev.endsWith(' ') ? ' ' : ''
        return `${prev}${separator}${path}`
      })
    }

    window.addEventListener(
      'file-path-to-chat',
      handleFilePathSelected as EventListener
    )
    return () => {
      window.removeEventListener(
        'file-path-to-chat',
        handleFilePathSelected as EventListener
      )
    }
  }, [])

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !currentModel || isStreaming || loadingContext) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setLoadingContext(true)

    try {
      // Load file contexts from detected file paths
      const fileContexts = await loadFileContexts(userMessage, apolloClient)

      setLoadingContext(false)
      setIsStreaming(true)

      // Add user message to chat with file context
      addChatMessage({
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
        fileContext: fileContexts.length > 0 ? fileContexts : undefined,
      })

      // Prepare messages for API (only user and assistant messages)
      const apiMessages = chatMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }))

      // Add current user message
      apiMessages.push({
        role: 'user',
        content: userMessage,
      })

      // Create placeholder for streaming assistant message
      const assistantMessageId = (Date.now() + 1).toString()
      addChatMessage({
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      })

      // Stream response from Ollama
      let accumulatedContent = ''
      await streamChatResponseDirect({
        model: currentModel,
        messages: apiMessages,
        fileContext: fileContexts.length > 0 ? fileContexts : undefined,
        onChunk: (chunk: string) => {
          accumulatedContent += chunk
          // Update the assistant message with accumulated content
          const currentMessages = useAppStore.getState().chatMessages
          const updatedMessages = currentMessages.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: accumulatedContent, isStreaming: true }
              : msg
          )
          // Update store with streaming content
          useAppStore.setState({ chatMessages: updatedMessages })
          // Auto-scroll during streaming
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 0)
        },
        onError: (error: Error) => {
          console.error('Streaming error:', error)
          // Update message with error
          const currentMessages = useAppStore.getState().chatMessages
          const updatedMessages = currentMessages.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: `Error: ${error.message}`,
                  isStreaming: false,
                }
              : msg
          )
          useAppStore.setState({ chatMessages: updatedMessages })
        },
        onComplete: () => {
          // Mark streaming as complete
          const currentMessages = useAppStore.getState().chatMessages
          const updatedMessages = currentMessages.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, isStreaming: false }
              : msg
          )
          useAppStore.setState({ chatMessages: updatedMessages })
        },
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      // Add error message to chat
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        timestamp: new Date(),
      })
      setLoadingContext(false)
      setIsStreaming(false)
    } finally {
      setIsStreaming(false)
    }
  }, [
    inputValue,
    currentModel,
    isStreaming,
    loadingContext,
    chatMessages,
    addChatMessage,
    apolloClient,
  ])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div className="flex h-full flex-col bg-vscode-editor-bg">
      {/* Header with Model Selector */}
      <div className="flex items-center justify-between border-b border-vscode-border px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-vscode-fg-secondary">Model:</span>
          <select
            value={currentModel || ''}
            onChange={(e) => setCurrentModel(e.target.value)}
            disabled={modelsLoading || isStreaming}
            className="rounded border border-vscode-border bg-vscode-input-bg px-2 py-1 text-sm text-vscode-fg outline-none focus:border-vscode-focus-border"
          >
            {modelsLoading ? (
              <option>Loading models...</option>
            ) : modelsData?.ollamaModels?.length > 0 ? (
              modelsData.ollamaModels.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.name}
                </option>
              ))
            ) : (
              <option>No models available</option>
            )}
          </select>
        </div>

        {!modelsData?.ollamaHealth && (
          <div className="flex items-center gap-2 text-xs text-red-400">
            <span className="inline-block h-2 w-2 rounded-full bg-red-400"></span>
            <span>Ollama offline</span>
          </div>
        )}

        {modelsData?.ollamaHealth && (
          <div className="flex items-center gap-2 text-xs text-green-400">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400"></span>
            <span>Ollama connected</span>
          </div>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4">
        {chatMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-vscode-fg opacity-60">
                Start a conversation
              </p>
              <p className="mt-2 text-sm text-vscode-fg-secondary opacity-40">
                Type a message below or right-click a file to add context
              </p>
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {loadingContext && (
              <div className="mb-4 flex items-center gap-2 text-sm text-vscode-fg-secondary">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
                <span>Loading file context...</span>
              </div>
            )}
            {isStreaming && (
              <div className="mb-4 flex items-center gap-2 text-sm text-vscode-fg-secondary">
                <div className="h-2 w-2 animate-pulse rounded-full bg-vscode-fg-secondary"></div>
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-vscode-border p-4">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message or file path... (Shift+Enter for new line)"
            disabled={isStreaming || loadingContext || !modelsData?.ollamaHealth}
            rows={3}
            className="flex-1 resize-none rounded border border-vscode-border bg-vscode-input-bg px-3 py-2 text-sm text-vscode-fg outline-none placeholder:text-vscode-fg-secondary placeholder:opacity-50 focus:border-vscode-focus-border disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={
              !inputValue.trim() ||
              isStreaming ||
              loadingContext ||
              !modelsData?.ollamaHealth ||
              !currentModel
            }
            className="rounded bg-vscode-button-bg px-4 py-2 text-sm text-vscode-button-fg transition-colors hover:bg-vscode-button-hover-bg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingContext ? 'Loading...' : isStreaming ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface

