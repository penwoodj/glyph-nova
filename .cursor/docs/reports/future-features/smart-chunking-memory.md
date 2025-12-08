# Smart Chunking & Memory

**Related:** [[index]] | [[context-engineering]] | [[self-improvement-system]] | [[transparency-observability]]

---

## Persistent Memory

**Goal:** Remember successful patterns and contexts across sessions.

### Memory Types

```
Session Memory (in-memory):
├─ Current context
├─ Recent decisions
└─ Active mode state

Short-term Memory (SQLite):
├─ Last 7 days of logs
├─ Recent context patterns
└─ Quick lookup cache

Long-term Memory (Vector DB):
├─ All historical sessions
├─ Successful context patterns
└─ Quality-approved responses
```

---

## Context Patterns

**Learn what context works:**

```typescript
interface ContextPattern {
  query: string // Original user query
  successfulContext: {
    files: string[]
    mcpQueries: MCPQuery[]
    ragResults: string[]
  }
  outcome: {
    userApproved: boolean
    qualityScore: number
    modifications: string[]
  }
  frequency: number // How often this pattern succeeds
}

// Pattern matching for future queries
function findSimilarPatterns(
  query: string,
  patterns: ContextPattern[]
): ContextPattern[] {
  return patterns
    .filter(p => cosineSimilarity(query, p.query) > 0.7)
    .sort((a, b) => b.frequency - a.frequency)
}
```

---

## Automatic Context Optimization

**Goal:** Learn optimal chunk sizes and context mixes.

```typescript
interface ContextOptimization {
  fileType: string
  taskType: 'chat' | 'refactor' | 'research'
  optimalChunkSize: number // Learned from successful sessions
  optimalContextMix: {
    files: number // Percentage of token budget
    rag: number
    mcp: number
    history: number
  }
  confidence: number // 0-1, increases with more data
}
```

---

**See also:** [[context-engineering]] for chunking strategies, [[self-improvement-system]] for how patterns are learned, [[transparency-observability]] for decision logging
