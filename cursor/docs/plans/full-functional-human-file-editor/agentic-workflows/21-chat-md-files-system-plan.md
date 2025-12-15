---
name: Chat .md Files System Implementation Plan
overview: Implement system to save chats as .md files in .glyphnova/chats directory, with automatic saving, chat file management, and markdown formatting
todos: []
---

# Chat .md Files System Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Implement a system that saves chat conversations as markdown files in `.glyphnova/chats/` directory. Chats should be automatically saved, formatted as markdown, and manageable through the file explorer. This enables chat persistence, version control, and integration with the agentic workflow framework.

---

## Overview

This plan implements a chat-to-markdown file system that:
- Automatically saves chat conversations as `.md` files
- Stores chats in `.glyphnova/chats/` directory
- Formats chats as readable markdown
- Provides chat file management (create, load, delete)
- Integrates with file explorer (view chats in .glyphnova tab)
- Supports chat naming and organization
- Enables chat version control (via git)

**Target**: Chat persistence system with markdown file storage
**Priority**: Medium (improves chat persistence and workflow integration)
**Estimated Time**: 6-8 hours (with 20% buffer: 7.2-9.6 hours)
**Risk Level**: Medium (file I/O, markdown formatting, integration complexity)

---

## Current State Analysis

### Existing Implementation
- **In-Memory Storage**: Chat messages stored in Zustand store (not persisted)
- **No File Persistence**: Chats not saved to files
- **No Chat Management**: No way to save/load/delete chats
- **No .glyphnova/chats**: No chats directory structure
- **Chat Messages**: Messages have id, role, content, timestamp, fileContext

### Gaps Identified
- No automatic chat saving
- No markdown file generation
- No chat file management
- No chat loading from files
- No integration with file explorer

---

## External Documentation Links

### Markdown Formatting
1. **Markdown Specification**
   - Link: https://daringfireball.net/projects/markdown/syntax
   - Description: Markdown syntax reference
   - Rating: High - Official markdown documentation

2. **CommonMark Specification**
   - Link: https://commonmark.org/
   - Description: Standardized markdown specification
   - Rating: High - Markdown standard

### File I/O & Persistence
3. **Node.js File System API**
   - Link: https://nodejs.org/api/fs.html
   - Description: File system operations
   - Rating: High - Node.js documentation

4. **GraphQL File Operations**
   - Link: Existing `writeFile` and `readFile` mutations/queries
   - Description: Use existing file operations
   - Rating: High - Existing API

### Date/Time Formatting
5. **Date Formatting**
   - Link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
   - Description: JavaScript Date API
   - Rating: High - MDN documentation

6. **ISO 8601 Date Format**
   - Link: https://en.wikipedia.org/wiki/ISO_8601
   - Description: ISO date format standard
   - Rating: Medium - Date format reference

---

## Implementation Phases

### Phase 1: Chat Markdown Formatting (1.5-2 hours)

**Goal**: Create service to format chat messages as markdown.

#### 1.1 Markdown Formatter Service
- [ ] Create `web/src/services/chatMarkdown.ts`:
  - [ ] `formatChatAsMarkdown(messages: ChatMessage[]): string`
  - [ ] Format user messages
  - [ ] Format assistant messages
  - [ ] Include timestamps
  - [ ] Include file context (if present)
- [ ] Markdown format:
  ```markdown
  # Chat: [Chat Name]

  Created: 2025-01-15T10:30:00Z

  ---

  ## User - 2025-01-15T10:30:00Z

  [User message content]

  ## Assistant - 2025-01-15T10:31:00Z

  [Assistant message content]

  ---
  ```

#### 1.2 Message Formatting
- [ ] Format individual messages:
  - [ ] User messages: Clear heading with timestamp
  - [ ] Assistant messages: Clear heading with timestamp
  - [ ] Code blocks: Preserve markdown code blocks
  - [ ] File context: Display file context sections
- [ ] Formatting logic:
  - [ ] Escape markdown in content (if needed)
  - [ ] Preserve code blocks
  - [ ] Format timestamps consistently
  - [ ] Handle streaming messages

#### 1.3 File Context Formatting
- [ ] Format file context in markdown:
  - [ ] Show file paths
  - [ ] Display file content in code blocks
  - [ ] Organize context clearly
- [ ] Context format:
  ```markdown
  ### File Context

  **File:** /path/to/file.js

  ```javascript
  [file content]
  ```
  ```

**Success Criteria**:
- [ ] Chat messages format as markdown
- [ ] Markdown is readable and well-formatted
- [ ] File context included correctly
- [ ] Timestamps formatted consistently

---

### Phase 2: Chat File Management (2-2.5 hours)

**Goal**: Create system to save, load, and manage chat files.

#### 2.1 Chat File Service
- [ ] Create `web/src/services/chatFiles.ts`:
  - [ ] `saveChatToFile(chatName: string, messages: ChatMessage[]): Promise<string>`
  - [ ] `loadChatFromFile(filePath: string): Promise<ChatMessage[]>`
  - [ ] `listChatFiles(folderPath: string): Promise<ChatFile[]>`
  - [ ] `deleteChatFile(filePath: string): Promise<void>`
- [ ] File operations:
  - [ ] Use GraphQL `writeFile` mutation
  - [ ] Use GraphQL `readFile` query
  - [ ] Use GraphQL `directoryContents` query
  - [ ] Handle .glyphnova/chats directory

#### 2.2 Chat File Naming
- [ ] Implement chat file naming:
  - [ ] Auto-generate names: `chat-YYYY-MM-DD-HH-MM-SS.md`
  - [ ] Or user-provided names: `chat-[name].md`
  - [ ] Ensure unique filenames
  - [ ] Sanitize filenames
- [ ] Naming logic:
  - [ ] Default: timestamp-based
  - [ ] Optional: user-provided name
  - [ ] Handle name conflicts
  - [ ] Validate filename characters

#### 2.3 Automatic Saving
- [ ] Implement automatic saving:
  - [ ] Save on message sent (debounced)
  - [ ] Save on chat completion
  - [ ] Save periodically (optional)
  - [ ] Handle save errors gracefully
- [ ] Save triggers:
  - [ ] After assistant message completes
  - [ ] Or after user sends message
  - [ ] Debounce to avoid excessive saves
  - [ ] Show save status (optional)

**Success Criteria**:
- [ ] Chats save to .md files
- [ ] Chats load from .md files
- [ ] Chat files listed correctly
- [ ] Automatic saving works

---

### Phase 3: Chat File Parsing (1.5-2 hours)

**Goal**: Parse markdown chat files back into chat messages.

#### 3.1 Markdown Parser
- [ ] Create markdown parser:
  - [ ] Parse markdown structure
  - [ ] Extract user messages
  - [ ] Extract assistant messages
  - [ ] Extract timestamps
  - [ ] Extract file context
- [ ] Parsing logic:
  - [ ] Use regex or markdown parser
  - [ ] Identify message sections
  - [ ] Extract message content
  - [ ] Parse timestamps

#### 3.2 Message Reconstruction
- [ ] Reconstruct ChatMessage objects:
  - [ ] Create message objects from parsed data
  - [ ] Set message IDs
  - [ ] Set timestamps
  - [ ] Set roles (user/assistant)
  - [ ] Reconstruct file context
- [ ] Message structure:
  ```typescript
  const messages: ChatMessage[] = parsedMessages.map(msg => ({
    id: generateId(),
    role: msg.role,
    content: msg.content,
    timestamp: parseTimestamp(msg.timestamp),
    fileContext: msg.fileContext,
  }))
  ```

#### 3.3 Error Handling
- [ ] Handle parsing errors:
  - [ ] Invalid markdown format
  - [ ] Missing timestamps
  - [ ] Corrupted files
  - [ ] Provide fallback/defaults

**Success Criteria**:
- [ ] Markdown files parse correctly
- [ ] Messages reconstructed correctly
- [ ] File context parsed correctly
- [ ] Error handling works

---

### Phase 4: Chat Management UI (1.5-2 hours)

**Goal**: Add UI for managing chat files.

#### 4.1 Chat List Component
- [ ] Create `ChatList.tsx` component:
  - [ ] List all chat files
  - [ ] Show chat names and dates
  - [ ] Allow selecting chat to load
  - [ ] Allow deleting chats
- [ ] Chat list features:
  - [ ] Display in .glyphnova tab (from file explorer tabs plan)
  - [ ] Or separate chat management UI
  - [ ] Sort by date (newest first)
  - [ ] Search/filter chats

#### 4.2 Chat Loading
- [ ] Implement chat loading:
  - [ ] Load chat from file
  - [ ] Replace current chat messages
  - [ ] Update chat interface
  - [ ] Show loading state
- [ ] Loading logic:
  - [ ] Parse markdown file
  - [ ] Reconstruct messages
  - [ ] Update Zustand store
  - [ ] Update UI

#### 4.3 Chat Creation
- [ ] Add chat creation:
  - [ ] "New Chat" button
  - [ ] "Save Chat" button
  - [ ] Chat naming dialog (optional)
  - [ ] Auto-save current chat before new
- [ ] Creation flow:
  - [ ] Save current chat (if has messages)
  - [ ] Clear current chat
  - [ ] Start new chat
  - [ ] Auto-save new chat

**Success Criteria**:
- [ ] Chat list displays correctly
- [ ] Chats can be loaded
- [ ] Chats can be created
- [ ] UI intuitive and functional

---

### Phase 5: Integration & Auto-Save (1-1.5 hours)

**Goal**: Complete integration and implement auto-save.

#### 5.1 Auto-Save Integration
- [ ] Integrate auto-save with ChatInterface:
  - [ ] Save after each message (debounced)
  - [ ] Save on chat completion
  - [ ] Handle save errors
  - [ ] Show save status
- [ ] Auto-save logic:
  - [ ] Debounce saves (e.g., 2 seconds)
  - [ ] Save to `.glyphnova/chats/chat-[timestamp].md`
  - [ ] Update file if chat already saved
  - [ ] Create new file for new chats

#### 5.2 File Explorer Integration
- [ ] Integrate with file explorer:
  - [ ] Show chats in .glyphnova tab
  - [ ] Allow opening chats from file explorer
  - [ ] Show chat files with chat icon
  - [ ] Double-click to load chat
- [ ] Integration points:
  - [ ] Use GlyphNovaFilesView (from file explorer tabs plan)
  - [ ] Filter for .md files in chats folder
  - [ ] Handle chat file clicks

#### 5.3 Chat State Management
- [ ] Update Zustand store:
  - [ ] Add `currentChatFile: string | null`
  - [ ] Add `saveChat()` action
  - [ ] Add `loadChat(filePath)` action
  - [ ] Track unsaved changes
- [ ] State updates:
  - [ ] Update currentChatFile when saving
  - [ ] Clear currentChatFile when new chat
  - [ ] Track if chat has unsaved changes

**Success Criteria**:
- [ ] Auto-save works correctly
- [ ] File explorer integration works
- [ ] Chat state managed correctly
- [ ] Integration complete

---

## Dependencies

### Internal Dependencies
- **File Explorer Tabs**: .glyphnova tab for viewing chats (from file explorer tabs plan)
- **GraphQL API**: Existing file read/write operations
- **Chat Interface**: Existing `ChatInterface.tsx` component
- **State Store**: Existing Zustand store

### External Dependencies
- **Optional**: Markdown parser library (if using library instead of custom parser)

---

## Risk Assessment

### High Risk
- **Markdown Parsing**: Complex markdown parsing might have edge cases
  - **Mitigation**: Use proven markdown parser, test with various message formats, handle edge cases

### Medium Risk
- **File I/O Performance**: Many auto-saves might impact performance
  - **Mitigation**: Debounce saves, batch operations, optimize file writes
- **Chat File Format**: Markdown format changes might break parsing
  - **Mitigation**: Version markdown format, migration logic, backward compatibility

### Low Risk
- **File Operations**: Standard file I/O operations
- **Markdown Formatting**: Straightforward string formatting

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Feature flag**: Disable auto-save, keep manual save only
- **Component removal**: Remove chat file management, keep in-memory only

### Phase-Specific Rollback
- **Phase 1**: Remove markdown formatting, keep basic saving
- **Phase 2**: Remove file management, keep basic save/load
- **Phase 3**: Simplify parsing, keep basic message extraction
- **Phase 4**: Remove chat management UI, keep file-based saving
- **Phase 5**: Remove auto-save, keep manual save only

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore in-memory only
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (Formatting)
- [ ] Chat messages format as markdown
- [ ] Markdown readable and well-formatted
- [ ] File context included
- [ ] Timestamps formatted correctly

### After Phase 2 (File Management)
- [ ] Chats save to files
- [ ] Chats load from files
- [ ] Chat files listed
- [ ] File operations work

### After Phase 3 (Parsing)
- [ ] Markdown files parse correctly
- [ ] Messages reconstructed
- [ ] File context parsed
- [ ] Error handling works

### After Phase 4 (UI)
- [ ] Chat list displays
- [ ] Chats can be loaded
- [ ] Chats can be created
- [ ] UI functional

### After Phase 5 (Integration)
- [ ] Auto-save works
- [ ] File explorer integration works
- [ ] Chat state managed
- [ ] Integration complete

---

## Success Criteria

1. **Markdown Formatting**: Chats format as readable markdown
2. **File Saving**: Chats save to `.glyphnova/chats/*.md` files
3. **File Loading**: Chats load from markdown files
4. **Auto-Save**: Chats automatically saved
5. **Chat Management**: Chats can be created, loaded, deleted
6. **File Explorer Integration**: Chats visible in .glyphnova tab
7. **Markdown Parsing**: Markdown files parse back to messages
8. **File Context**: File context preserved in markdown
9. **Timestamps**: Timestamps included and parsed correctly
10. **Error Handling**: File I/O errors handled gracefully
11. **Performance**: Auto-save doesn't impact performance
12. **User Experience**: Chat management intuitive
13. **Integration**: Works seamlessly with existing chat
14. **No Regressions**: Existing chat functionality unchanged
15. **Documentation**: Code documented for future maintenance

---

## Code Examples

### Example: Markdown Formatter
```typescript
// web/src/services/chatMarkdown.ts
import type { ChatMessage } from 'src/state/store'

export function formatChatAsMarkdown(
  messages: ChatMessage[],
  chatName?: string
): string {
  const name = chatName || `Chat ${new Date().toISOString().split('T')[0]}`
  const createdAt = messages[0]?.timestamp || new Date()

  let markdown = `# ${name}\n\n`
  markdown += `Created: ${createdAt.toISOString()}\n\n`
  markdown += `---\n\n`

  for (const message of messages) {
    const timestamp = message.timestamp.toISOString()
    const role = message.role === 'user' ? 'User' : 'Assistant'

    markdown += `## ${role} - ${timestamp}\n\n`

    // Include file context if present
    if (message.fileContext && message.fileContext.length > 0) {
      markdown += `### File Context\n\n`
      for (const file of message.fileContext) {
        markdown += `**File:** ${file.path}\n\n`
        markdown += `\`\`\`\n`
        markdown += `${file.content}\n`
        markdown += `\`\`\`\n\n`
      }
    }

    // Format message content
    markdown += `${message.content}\n\n`
    markdown += `---\n\n`
  }

  return markdown
}
```

### Example: Chat File Service
```typescript
// web/src/services/chatFiles.ts
import { gql } from '@apollo/client'
import { apolloClient } from '@apollo/client'
import { formatChatAsMarkdown, parseChatFromMarkdown } from './chatMarkdown'
import type { ChatMessage } from 'src/state/store'

const WRITE_FILE_MUTATION = gql`
  mutation WriteChatFile($path: String!, $content: String!) {
    writeFile(path: $path, content: $content)
  }
`

const READ_FILE_QUERY = gql`
  query ReadChatFile($path: String!) {
    readFile(path: $path)
  }
`

const DIRECTORY_CONTENTS_QUERY = gql`
  query ListChatFiles($path: String!) {
    directoryContents(path: $path) {
      files {
        name
        path
        modified
      }
    }
  }
`

export interface ChatFile {
  name: string
  path: string
  modified: Date
}

export async function saveChatToFile(
  folderPath: string,
  messages: ChatMessage[],
  chatName?: string
): Promise<string> {
  const chatsDir = `${folderPath}/.glyphnova/chats`
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = chatName
    ? `chat-${sanitizeFilename(chatName)}.md`
    : `chat-${timestamp}.md`
  const filePath = `${chatsDir}/${filename}`

  const markdown = formatChatAsMarkdown(messages, chatName)

  await apolloClient.mutate({
    mutation: WRITE_FILE_MUTATION,
    variables: { path: filePath, content: markdown },
  })

  return filePath
}

export async function loadChatFromFile(
  filePath: string
): Promise<ChatMessage[]> {
  const { data } = await apolloClient.query({
    query: READ_FILE_QUERY,
    variables: { path: filePath },
  })

  if (!data.readFile) {
    throw new Error('Chat file not found')
  }

  return parseChatFromMarkdown(data.readFile)
}

export async function listChatFiles(
  folderPath: string
): Promise<ChatFile[]> {
  const chatsDir = `${folderPath}/.glyphnova/chats`

  try {
    const { data } = await apolloClient.query({
      query: DIRECTORY_CONTENTS_QUERY,
      variables: { path: chatsDir },
    })

    if (!data.directoryContents) {
      return []
    }

    return data.directoryContents.files
      .filter((file: any) => file.name.endsWith('.md'))
      .map((file: any) => ({
        name: file.name,
        path: file.path,
        modified: new Date(file.modified),
      }))
      .sort((a: ChatFile, b: ChatFile) =>
        b.modified.getTime() - a.modified.getTime()
      )
  } catch {
    return []
  }
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}
```

### Example: Markdown Parser
```typescript
// web/src/services/chatMarkdown.ts (parsing function)
export function parseChatFromMarkdown(markdown: string): ChatMessage[] {
  const messages: ChatMessage[] = []

  // Split by message separators (## User/Assistant headers)
  const messageSections = markdown.split(/^##\s+(User|Assistant)\s+-/m)

  // Skip first section (header/metadata)
  for (let i = 1; i < messageSections.length; i += 2) {
    const role = messageSections[i].trim().toLowerCase() as 'user' | 'assistant'
    const contentSection = messageSections[i + 1] || ''

    // Extract timestamp
    const timestampMatch = contentSection.match(/^(.+?)\n\n/)
    const timestamp = timestampMatch
      ? new Date(timestampMatch[1])
      : new Date()

    // Extract file context (if present)
    const fileContextMatch = contentSection.match(/### File Context\n\n([\s\S]*?)(?=\n\n\*\*File:|\n\n---|$)/)
    const fileContext = fileContextMatch
      ? parseFileContext(fileContextMatch[1])
      : undefined

    // Extract message content (after file context and before ---)
    const contentMatch = contentSection.match(/(?:### File Context\n\n[\s\S]*?\n\n)?([\s\S]*?)(?=\n\n---|$)/)
    const content = contentMatch ? contentMatch[1].trim() : ''

    messages.push({
      id: generateId(),
      role,
      content,
      timestamp,
      fileContext,
    })
  }

  return messages
}

function parseFileContext(contextSection: string): FileContext[] {
  const contexts: FileContext[] = []
  const fileMatches = contextSection.matchAll(/\*\*File:\*\*\s+(.+?)\n\n```[\s\S]*?\n([\s\S]*?)\n```/g)

  for (const match of fileMatches) {
    contexts.push({
      path: match[1].trim(),
      content: match[2].trim(),
    })
  }

  return contexts
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}
```

### Example: Auto-Save Integration
```tsx
// web/src/components/Chat/ChatInterface.tsx
import { saveChatToFile } from 'src/services/chatFiles'
import { useAppStore } from 'src/state/store'
import { useDebounce } from 'src/lib/hooks' // Or implement debounce

export const ChatInterface = () => {
  const chatMessages = useAppStore((state) => state.chatMessages)
  const openFolderPath = useAppStore((state) => state.openFolderPath)
  const currentChatFile = useAppStore((state) => state.currentChatFile)
  const setCurrentChatFile = useAppStore((state) => state.setCurrentChatFile)

  // Auto-save chat (debounced)
  const debouncedSave = useDebounce(async () => {
    if (!openFolderPath || chatMessages.length === 0) return

    try {
      const filePath = await saveChatToFile(
        openFolderPath,
        chatMessages,
        currentChatFile ? undefined : undefined // Use existing name or generate
      )
      setCurrentChatFile(filePath)
    } catch (error) {
      console.error('Failed to save chat:', error)
    }
  }, 2000) // 2 second debounce

  // Auto-save when messages change
  useEffect(() => {
    if (chatMessages.length > 0) {
      debouncedSave()
    }
  }, [chatMessages, debouncedSave])

  // ... rest of component
}
```

### Example: Chat List Component
```tsx
// web/src/components/Chat/ChatList.tsx
import { useState, useEffect } from 'react'
import { listChatFiles, loadChatFromFile } from 'src/services/chatFiles'
import { useAppStore } from 'src/state/store'

export const ChatList = () => {
  const [chats, setChats] = useState<ChatFile[]>([])
  const [loading, setLoading] = useState(true)
  const openFolderPath = useAppStore((state) => state.openFolderPath)
  const setChatMessages = useAppStore((state) => state.setChatMessages)
  const clearChatMessages = useAppStore((state) => state.clearChatMessages)

  useEffect(() => {
    const loadChats = async () => {
      if (!openFolderPath) {
        setChats([])
        setLoading(false)
        return
      }

      setLoading(true)
      const chatFiles = await listChatFiles(openFolderPath)
      setChats(chatFiles)
      setLoading(false)
    }

    loadChats()
  }, [openFolderPath])

  const handleLoadChat = async (filePath: string) => {
    try {
      const messages = await loadChatFromFile(filePath)
      clearChatMessages()
      messages.forEach(msg => setChatMessages(msg))
    } catch (error) {
      console.error('Failed to load chat:', error)
    }
  }

  if (loading) {
    return <div className="p-4 text-sm text-vscode-fg-secondary">Loading chats...</div>
  }

  return (
    <div className="chat-list">
      <h3 className="px-4 py-2 text-sm font-semibold text-vscode-fg">Chats</h3>
      <div className="space-y-1">
        {chats.map(chat => (
          <button
            key={chat.path}
            onClick={() => handleLoadChat(chat.path)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-vscode-hover-bg"
          >
            <div className="font-medium text-vscode-fg">{chat.name}</div>
            <div className="text-xs text-vscode-fg-secondary">
              {chat.modified.toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

## Notes

- Chats should be saved automatically to enable persistence
- Markdown format should be readable and parseable
- File naming should be consistent and unique
- Auto-save should be debounced to avoid performance issues
- Chat files should be in `.glyphnova/chats/` for organization
- Integration with file explorer allows viewing chats as files
- Chat parsing should handle various markdown formats
- File context should be preserved in markdown
- Consider adding chat metadata (model used, etc.) in markdown
- Chat files enable version control via git

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
