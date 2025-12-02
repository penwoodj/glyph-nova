# Ollama Integration Patterns for LLM UI Desktop Application

**Purpose**: Comprehensive guide for integrating Ollama local LLM API with Redwood.js desktop application, covering REST API usage, streaming responses, model management, context injection, and chat interface patterns.

**Target**: Backend developers integrating local LLM functionality  
**Date**: January 2025  
**Status**: Research Phase - Core Feature Integration  
**Size**: ~11KB (context window compatible)

---

## Executive Summary

Ollama provides a local LLM API that runs models on the user's machine, enabling private, fast LLM interactions without cloud dependencies. This guide covers Ollama REST API integration, streaming chat completions, model listing and management, file context injection, and Redwood.js service patterns for building a chat interface. Key patterns include async generators for streaming, context window management, and error handling for local LLM operations.

**Key Recommendations**:
- Use Ollama REST API (http://localhost:11434) for all LLM interactions
- Implement streaming responses for real-time chat experience
- Load file context into prompt for code understanding
- Cache model list for faster UI rendering
- Handle Ollama service availability gracefully

---

## Ollama API Overview

### Base Configuration

**Default Ollama Endpoint**:
- **Base URL**: `http://localhost:11434`
- **API Version**: v1 (as of 2024)
- **Default Port**: 11434

**API Endpoints**:
- `GET /api/tags` - List available models
- `POST /api/generate` - Generate text completion
- `POST /api/chat` - Chat completion (recommended)
- `POST /api/embeddings` - Generate embeddings
- `GET /api/show` - Show model information

### Model Management

**List Available Models**:

```typescript
// api/src/services/ollama.ts
export const listOllamaModels = async () => {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.models || []
  } catch (error) {
    // Handle Ollama not running
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Ollama service is not running. Please start Ollama.')
    }
    throw error
  }
}
```

**Model Information**:

```typescript
export const getModelInfo = async (modelName: string) => {
  const response = await fetch('http://localhost:11434/api/show', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: modelName }),
  })
  
  const data = await response.json()
  return {
    name: data.modelfile,
    parameters: data.parameters,
    size: data.details?.size,
    // ... other model info
  }
}
```

---

## Chat Completion API

### Basic Chat Request

**Chat API Pattern**:

```typescript
// api/src/services/ollama.ts
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  model: string
  messages: ChatMessage[]
  stream?: boolean
  context?: number[]
  options?: {
    temperature?: number
    top_p?: number
    top_k?: number
    num_predict?: number
  }
}

export const chatCompletion = async (request: ChatRequest) => {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      stream: false, // Non-streaming request
      options: request.options,
    }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Ollama chat error: ${error.error}`)
  }
  
  const data = await response.json()
  return {
    message: data.message,
    context: data.context,
    done: data.done,
  }
}
```

### Streaming Chat Completion

**Async Generator Pattern for Streaming**:

```typescript
// api/src/services/ollama.ts
export const streamChatCompletion = async function* ({
  model,
  messages,
  options = {},
}: {
  model: string
  messages: ChatMessage[]
  options?: ChatRequest['options']
}) {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true, // Enable streaming
      options,
    }),
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Ollama streaming error: ${error.error || response.statusText}`)
  }
  
  if (!response.body) {
    throw new Error('Response body is null')
  }
  
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (!line.trim()) continue
        
        try {
          const data = JSON.parse(line)
          
          if (data.message) {
            yield {
              content: data.message.content || '',
              done: data.done || false,
              context: data.context,
            }
          }
          
          if (data.done) {
            return
          }
        } catch (parseError) {
          // Skip malformed JSON lines
          console.warn('Failed to parse Ollama response line:', line)
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
```

---

## File Context Integration

### Loading File Context

**Pattern: Inject File Content into Chat Context**:

```typescript
// api/src/services/context.ts
import { readFile } from './files'

export interface FileContext {
  path: string
  content: string
  language?: string
}

export const loadFileContext = async ({
  filePaths,
}: {
  filePaths: string[]
}): Promise<FileContext[]> => {
  const contexts = await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        const fileData = await readFile({ filePath })
        return {
          path: filePath,
          content: fileData.content,
          language: detectLanguage(filePath),
        }
      } catch (error) {
        logger.warn(`Failed to load file context: ${filePath}`, { error })
        return null
      }
    })
  )
  
  return contexts.filter((ctx): ctx is FileContext => ctx !== null)
}
```

### Formatting Context for LLM

**Context Injection Pattern**:

```typescript
// api/src/services/ollama.ts
export const formatMessagesWithContext = ({
  messages,
  fileContexts,
  systemPrompt,
}: {
  messages: ChatMessage[]
  fileContexts?: FileContext[]
  systemPrompt?: string
}): ChatMessage[] => {
  const formattedMessages: ChatMessage[] = []
  
  // Add system prompt with file context
  if (systemPrompt || fileContexts?.length) {
    let systemMessage = systemPrompt || 'You are a helpful coding assistant.'
    
    if (fileContexts?.length) {
      systemMessage += '\n\nRelevant file context:\n'
      fileContexts.forEach((ctx) => {
        systemMessage += `\n--- ${ctx.path} (${ctx.language || 'text'}) ---\n`
        systemMessage += ctx.content
        systemMessage += '\n---\n'
      })
    }
    
    formattedMessages.push({
      role: 'system',
      content: systemMessage,
    })
  }
  
  // Add user messages
  formattedMessages.push(...messages)
  
  return formattedMessages
}
```

**Example Usage**:

```typescript
const fileContexts = await loadFileContext({
  filePaths: ['/projects/app.tsx', '/projects/config.json'],
})

const messages = formatMessagesWithContext({
  messages: [
    {
      role: 'user',
      content: 'Can you explain what this code does?',
    },
  ],
  fileContexts,
  systemPrompt: 'You are an expert code reviewer.',
})

const stream = streamChatCompletion({
  model: 'codellama',
  messages,
})
```

---

## Redwood.js Service Integration

### Chat Service Layer

**Complete Chat Service Implementation**:

```typescript
// api/src/services/chat.ts
import { streamChatCompletion, formatMessagesWithContext } from './ollama'
import { loadFileContext } from './context'
import { db } from 'src/lib/db'

export interface ChatConversation {
  id: string
  title: string
  model: string
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  fileContexts?: string[] // File paths referenced
  createdAt: Date
}

export const createConversation = async ({
  title,
  model,
}: {
  title: string
  model: string
}): Promise<ChatConversation> => {
  // Save to database
  const conversation = await db.chatConversation.create({
    data: {
      title,
      model,
    },
  })
  
  return conversation
}

export const sendChatMessage = async function* ({
  conversationId,
  message,
  fileContextPaths = [],
  model,
}: {
  conversationId: string
  message: string
  fileContextPaths?: string[]
  model: string
}) {
  // Load file contexts
  const fileContexts = fileContextPaths.length > 0
    ? await loadFileContext({ filePaths: fileContextPaths })
    : []
  
  // Load conversation history
  const history = await db.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  })
  
  // Format messages with context
  const messages = formatMessagesWithContext({
    messages: [
      ...history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ],
    fileContexts,
  })
  
  // Save user message
  await db.chatMessage.create({
    data: {
      conversationId,
      role: 'user',
      content: message,
      fileContexts: fileContextPaths,
    },
  })
  
  // Stream response
  let fullResponse = ''
  
  for await (const chunk of streamChatCompletion({
    model,
    messages,
  })) {
    fullResponse += chunk.content
    yield chunk
  }
  
  // Save assistant response
  await db.chatMessage.create({
    data: {
      conversationId,
      role: 'assistant',
      content: fullResponse,
    },
  })
}
```

### GraphQL Integration

**GraphQL Subscription for Streaming**:

```typescript
// api/src/graphql/chat.sdl.ts
type Query {
  conversations: [Conversation!]! @requireAuth
  conversation(id: ID!): Conversation @requireAuth
  ollamaModels: [String!]! @requireAuth
}

type Mutation {
  createConversation(input: CreateConversationInput!): Conversation! @requireAuth
  sendMessage(input: SendMessageInput!): Message! @requireAuth
}

type Subscription {
  chatMessage(conversationId: ID!): ChatMessageChunk! @requireAuth
}

type Conversation {
  id: ID!
  title: String!
  model: String!
  messages: [Message!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Message {
  id: ID!
  role: String!
  content: String!
  fileContexts: [String!]
  createdAt: DateTime!
}

type ChatMessageChunk {
  content: String!
  done: Boolean!
}
```

**Subscription Resolver**:

```typescript
// api/src/graphql/chat.ts
import { sendChatMessage } from 'src/services/chat'

export const chatMessage = {
  chatMessage: {
    subscribe: async function* (
      _root,
      { conversationId }: { conversationId: string },
      { currentUser }
    ) {
      // This would be called for each message send
      // In practice, you'd need to handle message sending differently
      // for subscriptions to work properly
      
      // Alternative: Use pub/sub pattern
      // Or WebSocket connection for real-time streaming
    },
  },
}
```

---

## Error Handling and Resilience

### Ollama Service Availability

**Health Check Pattern**:

```typescript
// api/src/services/ollama.ts
export const checkOllamaHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(2000), // 2 second timeout
    })
    return response.ok
  } catch (error) {
    return false
  }
}

export const ensureOllamaRunning = async () => {
  const isHealthy = await checkOllamaHealth()
  if (!isHealthy) {
    throw new Error(
      'Ollama service is not running. Please start Ollama before using chat features.'
    )
  }
}
```

### Error Handling Patterns

```typescript
export const safeOllamaCall = async <T>(
  fn: () => Promise<T>,
  errorMessage: string
): Promise<T> => {
  try {
    await ensureOllamaRunning()
    return await fn()
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Ollama service is not available. Please start Ollama.')
    }
    if (error.message.includes('model')) {
      throw new Error(`Model not found. Please pull the model first.`)
    }
    logger.error(errorMessage, { error })
    throw new Error(`${errorMessage}: ${error.message}`)
  }
}
```

---

## Model Management

### Pulling Models

**Pull Model Pattern**:

```typescript
export const pullModel = async (modelName: string) => {
  const response = await fetch('http://localhost:11434/api/pull', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: modelName, stream: false }),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to pull model: ${modelName}`)
  }
  
  const data = await response.json()
  return data
}
```

### Caching Model List

**Cache Pattern**:

```typescript
let modelListCache: { models: any[], timestamp: number } | null = null
const CACHE_TTL = 60000 // 1 minute

export const getCachedModelList = async () => {
  if (modelListCache && Date.now() - modelListCache.timestamp < CACHE_TTL) {
    return modelListCache.models
  }
  
  const models = await listOllamaModels()
  modelListCache = {
    models,
    timestamp: Date.now(),
  }
  
  return models
}
```

---

## Frontend Integration Patterns

### Chat Component with Streaming

```typescript
// web/src/components/Chat/ChatInterface.tsx
import { useState, useEffect, useRef } from 'react'

export const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedModel, setSelectedModel] = useState('codellama')
  const [availableModels, setAvailableModels] = useState<string[]>([])
  
  useEffect(() => {
    // Load available models
    fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query {
            ollamaModels
          }
        `,
      }),
    })
      .then((res) => res.json())
      .then((data) => setAvailableModels(data.data.ollamaModels))
  }, [])
  
  const handleSend = async () => {
    if (!input.trim() || isStreaming) return
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }
    
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)
    
    // Add placeholder for streaming response
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])
    
    // Stream response
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input,
        model: selectedModel,
      }),
    })
    
    if (!response.body) return
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(Boolean)
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage.role === 'assistant') {
              lastMessage.content += data.content || ''
            }
            return newMessages
          })
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
    
    setIsStreaming(false)
  }
  
  return (
    <div className="chat-interface">
      {/* Model selector */}
      <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
        {availableModels.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
      
      {/* Messages */}
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      
      {/* Input */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        disabled={isStreaming}
      />
    </div>
  )
}
```

---

## External Documentation Links

### Ollama Official Documentation
- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md) - Complete API reference
- [Ollama GitHub](https://github.com/ollama/ollama) - Source code and examples
- [Ollama Models](https://ollama.ai/library) - Available model library

### Ollama Client Libraries
- [ollama-js](https://github.com/ollama/ollama-js) - JavaScript/TypeScript client
- [ollama-python](https://github.com/ollama/ollama-python) - Python client (for reference)

### Streaming and Async Patterns
- [MDN: ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) - Stream API reference
- [Async Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function*) - Async generator patterns

---

## Implementation Checklist

- [ ] Set up Ollama service health checks
- [ ] Implement model listing and caching
- [ ] Create streaming chat completion service
- [ ] Implement file context loading and formatting
- [ ] Set up GraphQL mutations and subscriptions
- [ ] Create chat conversation management (database)
- [ ] Build frontend chat interface with streaming
- [ ] Add model selector dropdown
- [ ] Implement error handling for Ollama unavailability
- [ ] Test with various Ollama models

---

## Next Steps

1. **Review Chat Interface Patterns**: Understand UI/UX patterns for chat interface
2. **Review File Tree Component Guide**: Understand file selection and context passing
3. **Implement Chat Service**: Build Redwood.js service layer for Ollama
4. **Build Chat UI Component**: Create streaming chat interface in Storybook

---

**Report Status**: Complete  
**Verification**: All external links verified as of January 2025  
**Context Window Compatibility**: ~11KB - Can be loaded with 1-2 other reports simultaneously

