# Transparency & Observability

**Related:** [index](./index.md) | [context-engineering](./context-engineering.md) | [agentic-mode-system](./agentic-mode-system.md) | [self-improvement-system](./self-improvement-system.md)

---

## Full Prompt Visibility

**Goal:** Every AI interaction shows exactly what was sent and why.

### Features

- **Live prompt inspector**: See the exact prompt before sending
- **Context breakdown panel**:
  ```
  [System Prompt: 234 tokens]
  [Mode Instructions: 156 tokens]
  [File Context: 1,243 tokens]
  [Chat History: 567 tokens]
  [RAG Results: 892 tokens]
  Total: 3,092 tokens / 8,192 available
  ```
- **Token budget visualization**: Real-time bar chart of context allocation
- **Editable prompts**: Override any part of the prompt before sending

### Technical Approach

```typescript
interface PromptBreakdown {
  system: { content: string; tokens: number; source: 'mode' | 'default' }
  context: Array<{
    type: 'file' | 'mcp' | 'rag' | 'history'
    content: string
    tokens: number
    relevance: number
    reason: string // Why this was included
  }>
  totalTokens: number
  budget: number
  truncated: boolean
}
```

---

## Decision Logging

**Goal:** Every AI decision is logged and analyzable.

### Logged Information

- **Context selection**: Why each piece of context was chosen
- **Chunking decisions**: How documents were split (see [context-engineering](./context-engineering.md))
- **Mode activations**: Which mode fired and why (see [agentic-mode-system](./agentic-mode-system.md))
- **Quality scores**: Self-evaluation of responses
- **User feedback**: Explicit approval/rejection of outputs

### Chat Interface Flexibility

Chats are just parsed formatted `.md` files you can easily toggle between for different levels/views of editing. The chat box can move around and has modes like:
- **Stick to bottom mode** (default): Normal chat behavior
- **Inline mode**: Embedded in document flow
- **Draggable mode**: Move around through dragging and dropping
- **Dropdown mode**: Collapsible detail sections
- **Split views**: Different types of data in the chat
- **Tree/graph views**: Hierarchical or graph-like structure views
- **Markdown editor mode**: Literal markdown file to edit and view

### Log Schema

```typescript
interface DecisionLog {
  timestamp: string
  sessionId: string
  mode: string
  task: 'chat' | 'refactor' | 'research' | 'test'
  contextSources: ContextSource[]
  promptTokens: number
  responseTokens: number
  latency: number
  qualityScore?: number
  userFeedback?: 'approved' | 'rejected' | 'modified'
  modifications?: string
}
```

---

## Transparency UI

**Visual Components:**

```
┌───────────────────────────────────────────────┐
│  [Main Editor/Chat]                           │
│                                               │
│  ┌──────────────────────────────────┐         │
│  │ 💬 AI Response                   │         │
│  │ ┌─ Show Context ▼                │         │
│  │ │ Sources: files.ts, mode.md     │         │
│  │ │ Tokens: 3,092 / 8,192          │         │
│  │ │ Quality: 8.2/10                │         │
│  │ │ [View Full Prompt]             │         │
│  │ └───────────────────────────     │         │
│  └──────────────────────────────────┘         │
└───────────────────────────────────────────────┘
```

---

**See also:** [context-engineering](./context-engineering.md) for how context is gathered, [agentic-mode-system](./agentic-mode-system.md) for mode-based behavior, [self-improvement-system](./self-improvement-system.md) for how logs are analyzed
