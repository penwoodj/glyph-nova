# Chat Interface Patterns for LLM Desktop Application

**Purpose**: Comprehensive guide for building a Cursor-like chat interface with streaming responses, file context integration, message rendering, and desktop app-specific patterns.

**Target**: Frontend developers building chat UI components  
**Date**: January 2025  
**Status**: Research Phase - UI Component Patterns  
**Size**: ~10KB (context window compatible)

---

## Executive Summary

A well-designed chat interface is crucial for LLM applications. This guide covers building a Cursor-like chat experience with streaming message updates, file context display, message history management, keyboard shortcuts, and seamless integration with file system operations. Key patterns include real-time streaming updates, markdown rendering in messages, file path insertion, and context window management for desktop applications.

**Key Recommendations**:
- Use streaming for real-time response updates
- Render markdown in assistant messages
- Display file contexts clearly in chat
- Implement keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Auto-scroll to latest message during streaming
- Show typing indicators during streaming

---

## Chat Interface Architecture

### Component Structure

```typescript
// web/src/components/Chat/ChatInterface.tsx
interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  fileContexts?: string[]
  timestamp: Date
  isStreaming?: boolean
}

interface ChatInterfaceProps {
  onFileContextAdd?: (filePath: string) => void
  availableModels?: string[]
  defaultModel?: string
}
```

### Main Chat Component

```typescript
export const ChatInterface = ({
  onFileContextAdd,
  availableModels = [],
  defaultModel,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState(defaultModel || availableModels[0] || '')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Handle file path insertion
  useEffect(() => {
    const handleFilePathSelected = (event: CustomEvent<{ path: string }>) => {
      setInput(prev => prev + ' ' + event.detail.path)
      inputRef.current?.focus()
    }
    
    window.addEventListener('file-path-selected', handleFilePathSelected as EventListener)
    return () => window.removeEventListener('file-path-selected', handleFilePathSelected as EventListener)
  }, [])
  
  const handleSend = async () => {
    if (!input.trim() || isStreaming) return
    
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)
    
    // Add placeholder for streaming response
    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }
    setMessages(prev => [...prev, assistantMessage])
    
    // Stream response from Ollama
    try {
      await streamResponse(userMessage.content, selectedModel, (chunk: string) => {
        setMessages(prev => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage.role === 'assistant' && lastMessage.isStreaming) {
            lastMessage.content += chunk
          }
          return newMessages
        })
      })
      
      // Mark streaming as complete
      setMessages(prev => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage) {
          lastMessage.isStreaming = false
        }
        return newMessages
      })
    } catch (error) {
      // Handle error
      setMessages(prev => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage) {
          lastMessage.content = `Error: ${error.message}`
          lastMessage.isStreaming = false
        }
        return newMessages
      })
    } finally {
      setIsStreaming(false)
    }
  }
  
  return (
    <div className="chat-interface">
      {/* Model selector */}
      <ChatHeader 
        selectedModel={selectedModel}
        availableModels={availableModels}
        onModelChange={setSelectedModel}
      />
      
      {/* Messages */}
      <ChatMessages 
        messages={messages}
        messagesEndRef={messagesEndRef}
      />
      
      {/* Input */}
      <ChatInput
        ref={inputRef}
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={isStreaming}
      />
    </div>
  )
}
```

---

## Message Rendering

### Chat Message Component

```typescript
// web/src/components/Chat/ChatMessage.tsx
import { MarkdownRenderer } from '../Markdown/MarkdownRenderer'

interface ChatMessageProps {
  message: ChatMessage
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  
  return (
    <div className={`chat-message ${message.role} ${message.isStreaming ? 'streaming' : ''}`}>
      <div className="message-header">
        <span className="message-role">{isUser ? 'You' : 'Assistant'}</span>
        <span className="message-timestamp">
          {formatTime(message.timestamp)}
        </span>
      </div>
      
      {isSystem ? (
        <div className="system-message">
          <FileContextList files={message.fileContexts || []} />
        </div>
      ) : (
        <div className="message-content">
          {isUser ? (
            <div className="user-message-text">{message.content}</div>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
          
          {message.isStreaming && (
            <span className="streaming-indicator">▋</span>
          )}
        </div>
      )}
    </div>
  )
}
```

### Markdown Rendering in Messages

```typescript
// web/src/components/Markdown/MarkdownRenderer.tsx
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownRendererProps {
  content: string
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
```

---

## Streaming Response Handling

### Streaming Service Integration

```typescript
// web/src/services/chat.ts
export const streamResponse = async (
  message: string,
  model: string,
  onChunk: (chunk: string) => void
) => {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, model }),
  })
  
  if (!response.body) {
    throw new Error('No response body')
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
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (!line.trim()) continue
        
        try {
          const data = JSON.parse(line)
          if (data.content) {
            onChunk(data.content)
          }
          if (data.done) {
            return
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
```

### Real-time Updates

```typescript
// Optimistic updates during streaming
const handleStreamingChunk = (chunk: string) => {
  setMessages(prev => {
    const newMessages = [...prev]
    const lastMessage = newMessages[newMessages.length - 1]
    
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
      lastMessage.content += chunk
    }
    
    return newMessages
  })
  
  // Auto-scroll during streaming
  setTimeout(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, 0)
}
```

---

## File Context Integration

### File Context Display

```typescript
// web/src/components/Chat/FileContextList.tsx
interface FileContextListProps {
  files: string[]
}

export const FileContextList = ({ files }: FileContextListProps) => {
  if (!files || files.length === 0) return null
  
  return (
    <div className="file-context-list">
      <div className="file-context-header">
        <span>📁 File Context:</span>
      </div>
      {files.map((file, idx) => (
        <div key={idx} className="file-context-item">
          <code>{file}</code>
        </div>
      ))}
    </div>
  )
}
```

### File Path Insertion

```typescript
// Listen for file path selection events
useEffect(() => {
  const handleFilePathSelected = (event: CustomEvent<{ path: string }>) => {
    const filePath = event.detail.path
    setInput(prev => {
      const trimmed = prev.trim()
      return trimmed ? `${trimmed} ${filePath}` : filePath
    })
    inputRef.current?.focus()
    inputRef.current?.setSelectionRange(
      inputRef.current.value.length,
      inputRef.current.value.length
    )
  }
  
  window.addEventListener('file-path-selected', handleFilePathSelected as EventListener)
  return () => window.removeEventListener('file-path-selected', handleFilePathSelected as EventListener)
}, [])
```

---

## Keyboard Shortcuts

### Input Handling

```typescript
// web/src/components/Chat/ChatInput.tsx
interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ value, onChange, onSend, disabled }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (!disabled && value.trim()) {
          onSend()
        }
      }
      
      // Cmd/Ctrl + Enter to send
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!disabled && value.trim()) {
          onSend()
        }
      }
    }
    
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
        rows={1}
        style={{
          resize: 'none',
          minHeight: '40px',
          maxHeight: '200px',
        }}
      />
    )
  }
)
```

---

## Cursor-like UI Patterns

### Message Layout

```css
/* Cursor-like message styling */
.chat-message {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.chat-message.user {
  background: var(--user-message-bg);
}

.chat-message.assistant {
  background: var(--assistant-message-bg);
}

.message-content {
  margin-top: 0.5rem;
  line-height: 1.6;
}

.streaming-indicator {
  display: inline-block;
  animation: blink 1s infinite;
  color: var(--primary-color);
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

### Model Selector

```typescript
// web/src/components/Chat/ChatHeader.tsx
interface ChatHeaderProps {
  selectedModel: string
  availableModels: string[]
  onModelChange: (model: string) => void
}

export const ChatHeader = ({
  selectedModel,
  availableModels,
  onModelChange,
}: ChatHeaderProps) => {
  return (
    <div className="chat-header">
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="model-selector"
      >
        {availableModels.map(model => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  )
}
```

---

## Message History Management

### Conversation Persistence

```typescript
// Save messages to localStorage or database
const saveConversation = (messages: ChatMessage[]) => {
  localStorage.setItem('chat-history', JSON.stringify(messages))
}

const loadConversation = (): ChatMessage[] => {
  const saved = localStorage.getItem('chat-history')
  return saved ? JSON.parse(saved) : []
}

// Clear conversation
const clearConversation = () => {
  setMessages([])
  localStorage.removeItem('chat-history')
}
```

---

## External Documentation Links

### React Markdown
- [react-markdown](https://github.com/remarkjs/react-markdown) - Markdown renderer
- [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) - Syntax highlighting

### Streaming Patterns
- [MDN: ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) - Stream API

---

## Implementation Checklist

- [ ] Create ChatInterface component structure
- [ ] Implement message rendering with markdown support
- [ ] Add streaming response handling
- [ ] Integrate file context display
- [ ] Implement keyboard shortcuts (Enter, Shift+Enter)
- [ ] Add model selector dropdown
- [ ] Connect to file path insertion events
- [ ] Add auto-scroll during streaming
- [ ] Implement message history persistence
- [ ] Style to match Cursor-like appearance

---

**Report Status**: Complete  
**Context Window Compatibility**: ~10KB - Can be loaded with 2-3 other reports simultaneously

