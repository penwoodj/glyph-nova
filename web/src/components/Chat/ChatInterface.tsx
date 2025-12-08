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
import { EditConfirmationDialog } from './EditConfirmationDialog'
import { useAppStore } from 'src/state/store'
import { loadFileContexts, clearFileCache } from 'src/services/context'
import { streamChatResponseDirect } from 'src/services/chat'
import {
  detectEditRequests,
  parseEditRequest,
  applyEdit,
  type EditRequest,
} from 'src/services/editor'

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

const OLLAMA_MODELS_CLI_QUERY = gql`
  query OllamaModelsCLIQuery {
    ollamaModelsCLI {
      name
      modifiedAt
      size
      digest
    }
    ollamaHealthCLI
  }
`

export const ChatInterface = () => {
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [loadingContext, setLoadingContext] = useState(false)
  const [useCliForModels, setUseCliForModels] = useState(() => {
    // Load preference from localStorage
    const saved = localStorage.getItem('ollama-use-cli-models')
    return saved ? JSON.parse(saved) : false
  })
  const [pendingEdits, setPendingEdits] = useState<EditRequest[]>([])
  const [showEditConfirmation, setShowEditConfirmation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const apolloClient = useApolloClient()

  // Get state from store
  const chatMessages = useAppStore((state) => state.chatMessages)
  const addChatMessage = useAppStore((state) => state.addChatMessage)
  const currentModel = useAppStore((state) => state.currentModel)
  const setCurrentModel = useAppStore((state) => state.setCurrentModel)
  const setLastFileEdit = useAppStore((state) => state.setLastFileEdit)
  const selectedFilePath = useAppStore((state) => state.selectedFilePath)

  // Save CLI preference to localStorage
  useEffect(() => {
    localStorage.setItem('ollama-use-cli-models', JSON.stringify(useCliForModels))
  }, [useCliForModels])

  // Fetch available models - use CLI or HTTP API based on preference
  const { data: modelsData, loading: modelsLoading } = useQuery(
    useCliForModels ? OLLAMA_MODELS_CLI_QUERY : OLLAMA_MODELS_QUERY,
    {
      onCompleted: (data) => {
        // Set first model as default if none selected
        const models = useCliForModels ? data?.ollamaModelsCLI : data?.ollamaModels
        if (!currentModel && models?.length > 0) {
          setCurrentModel(models[0].name)
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
          const assistantMessage = currentMessages.find((msg) => msg.id === assistantMessageId)

          if (assistantMessage) {
            // Check if response contains edit requests
            if (detectEditRequests(assistantMessage.content)) {
              const editResult = parseEditRequest(assistantMessage.content)
              if (editResult.requests.length > 0) {
                // Show edit confirmation UI
                setPendingEdits(editResult.requests)
                setShowEditConfirmation(true)
              }
            }

            // Update message to mark streaming as complete
            const updatedMessages = currentMessages.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, isStreaming: false }
                : msg
            )
            useAppStore.setState({ chatMessages: updatedMessages })
          }
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
        <div className="flex items-center gap-4">
          {/* Model Selection */}
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
              ) : (() => {
                const models = useCliForModels
                  ? modelsData?.ollamaModelsCLI
                  : modelsData?.ollamaModels
                return models?.length > 0 ? (
                  models.map((model) => (
                    <option key={model.name} value={model.name}>
                      {model.name}
                    </option>
                  ))
                ) : (
                  <option>No models available</option>
                )
              })()}
            </select>
          </div>

          {/* CLI Toggle */}
          <div className="flex items-center gap-2 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-vscode-fg-secondary hover:text-vscode-fg">
              <input
                type="checkbox"
                checked={useCliForModels}
                onChange={(e) => setUseCliForModels(e.target.checked)}
                disabled={isStreaming}
                className="h-3 w-3"
              />
              <span>Use CLI</span>
            </label>
            <span className="text-vscode-fg-secondary opacity-50">
              ({useCliForModels ? 'CLI' : 'HTTP'})
            </span>
          </div>
        </div>

        {/* Health Status */}
        {(() => {
          const health = useCliForModels
            ? modelsData?.ollamaHealthCLI
            : modelsData?.ollamaHealth

          return !health ? (
            <div className="flex items-center gap-2 text-xs text-red-400">
              <span className="inline-block h-2 w-2 rounded-full bg-red-400"></span>
              <span>Ollama offline</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-green-400">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400"></span>
              <span>Ollama connected</span>
            </div>
          )
        })()}
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
            disabled={isStreaming || loadingContext || !(useCliForModels ? modelsData?.ollamaHealthCLI : modelsData?.ollamaHealth)}
            rows={3}
            className="flex-1 resize-none rounded border border-vscode-border bg-vscode-input-bg px-3 py-2 text-sm text-vscode-fg outline-none placeholder:text-vscode-fg-secondary placeholder:opacity-50 focus:border-vscode-focus-border disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={
              !inputValue.trim() ||
              isStreaming ||
              loadingContext ||
              !(useCliForModels ? modelsData?.ollamaHealthCLI : modelsData?.ollamaHealth) ||
              !currentModel
            }
            className="rounded bg-vscode-button-bg px-4 py-2 text-sm text-vscode-button-fg transition-colors hover:bg-vscode-button-hover-bg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingContext ? 'Loading...' : isStreaming ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      {/* Edit Confirmation Dialog */}
      {showEditConfirmation && (
        <EditConfirmationDialog
          edits={pendingEdits}
          onConfirm={async () => {
            // Apply each edit sequentially
            const results = []
            const editedFiles = new Set<string>()
            for (const edit of pendingEdits) {
              try {
                const result = await applyEdit(edit, apolloClient)
                results.push({ edit, result })
                if (result.success) {
                  editedFiles.add(edit.filePath)
                  // Notify store that file was edited (triggers editor refresh)
                  setLastFileEdit(edit.filePath)
                } else {
                  console.error('Failed to apply edit:', edit.filePath, result.error)
                  // Show error message to user
                  addChatMessage({
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: `Error applying edit to ${edit.filePath}: ${result.error}`,
                    timestamp: new Date(),
                  })
                }
              } catch (error) {
                console.error('Error applying edit:', error)
                addChatMessage({
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: `Error applying edit to ${edit.filePath}: ${error instanceof Error ? error.message : String(error)}`,
                  timestamp: new Date(),
                })
              }
            }

            // Close dialog and clear pending edits
            setShowEditConfirmation(false)
            setPendingEdits([])

            // Show success message if all edits succeeded
            const allSucceeded = results.every((r) => r.result.success)
            if (allSucceeded && results.length > 0) {
              addChatMessage({
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `✅ Successfully applied ${results.length} edit${results.length > 1 ? 's' : ''} to ${editedFiles.size} file${editedFiles.size > 1 ? 's' : ''}.`,
                timestamp: new Date(),
              })
            }
          }}
          onCancel={() => {
            setShowEditConfirmation(false)
            setPendingEdits([])
          }}
        />
      )}
    </div>
  )
}

export default ChatInterface

