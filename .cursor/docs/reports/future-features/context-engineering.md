# Context Engineering

**Related:** [[index]] | [[transparency-observability]] | [[agentic-mode-system]] | [[multi-source-integration]] | [[smart-chunking-memory]]

---

## Smart Chunking Engine

**Problem:** Large files/docs need intelligent splitting.

### Strategies

1. **Semantic chunking**: Split on logical boundaries (functions, classes, sections)
2. **Overlapping windows**: Maintain context between chunks through easy to change modes or settings
3. **Hierarchy preservation**: Keep structural relationships
4. **Adaptive sizing**: Adjust chunk size based on content density, and LLM context effective response results size metrics based on system and hardware, available memory, and model capabilities

<ADD_MORE_ITEMS>I want an item for nested summary creation and navigation through context creation and navigation on a batch process agentic workflow on a cron job probably like rag with visualization in a hierachical graph database in files with good visualization tools. and another item for a sematic memory layer with visualizaition capabilities where there are ideas of what the file does in different sections based on line number the llms can read before looking at files, with smart modes of which level of abstration to read and when it needs to. edit other relevant sections without removing any other tags or their corresponding prompts based on the changes made here

### Additional Chunking Features

- **Nested summary creation**: Batch process agentic workflow on a cron job, similar to RAG with visualization in a hierarchical graph database in files with good visualization tools
- **Semantic memory layer**: Visualization capabilities where there are ideas of what the file does in different sections based on line number. LLMs can read before looking at files, with smart modes of which level of abstraction to read and when it needs to

### Implementation

```typescript
interface ChunkingStrategy {
  name: string
  detect: (content: string, filetype: string) => boolean
  chunk: (content: string, maxTokens: number) => Chunk[]
}

interface Chunk {
  content: string
  tokens: number
  metadata: {
    startLine: number
    endLine: number
    type: 'function' | 'class' | 'paragraph' | 'section'
    parent?: string // For hierarchy
    importance: number // 0-1 relevance score
  }
}
```

### Chunking Strategies by File Type

```
Code Files:
  ├─ Functions/methods (preferred)
  ├─ Classes/modules
  ├─ Logical blocks
  └─ Fallback: Line-based with overlap

Markdown:
  ├─ Sections (##, ###)
  ├─ Paragraphs
  ├─ Lists
  └─ Code blocks (keep intact)

JSON/Config:
  ├─ Top-level keys
  ├─ Nested objects
  └─ Array preservation
```

---

## Context Relevance Ranking

**Goal:** Always include the most relevant context in the correct order in the prompt to maximize desired user outcome.

<ASK_ME_QUESTIONS> Ask me 5 questions about how we want this to work after all file edit prompts are complete and you've paused.  once I've answered and you've integrated the information you can remove this prompt. I think your on the right track but missing the customizablity I'm looking for.  I want these to be controlled by agentic self improving workflow system on top of something like this.  Like I want n8n like config file with visualization modes, or just a markdown file with a consistent format with sections with how to decide what context to get when and where through descirbed source and behavior flows.

**Note:** This system is controlled by agentic self-improving workflow system. Configuration can be done via n8n-like config files with visualization modes, or markdown files with a consistent format with sections describing how to decide what context to get when and where through described source and behavior flows.

### Ranking Factors

- **Semantic similarity**: Vector embeddings (local BERT/sentence-transformers)
- **Recency**: Recently viewed/edited files score higher
- **Graph proximity**: Files close in dependency graph
- **Explicit references**: Direct mentions in user query
- **Historical success**: Patterns learned from past successful contexts (see [[smart-chunking-memory]])

### Ranking Algorithm

```typescript
function rankContext(
  query: string,
  candidates: ContextCandidate[],
  history: SessionHistory
): RankedContext[] {
  return candidates
    .map(c => ({
      ...c,
      score:
        0.4 * semanticSimilarity(query, c.content) +
        0.2 * recencyScore(c.lastAccessed) +
        0.2 * graphProximity(c.path, history.recentFiles) +
        0.1 * explicitMention(query, c.path) +
        0.1 * historicalSuccess(c.path, history.successfulContexts)
    }))
    .sort((a, b) => b.score - a.score)
}
```

---

## Context Budget Management

**Goal:** Optimize token usage across context types.

### Budget Allocation

```
Fixed Allocations:
├─ System prompt: 200-500 tokens
├─ Mode instructions: 300-800 tokens
└─ Chat history: 500-1000 tokens (sliding window)

Dynamic Allocations (remaining budget):
├─ Primary context (50%): User-selected files
├─ Related context (25%): Dependency graph
├─ RAG results (15%): Searched documentation
└─ MCP data (10%): Live system queries
```

<ADD_DETAIL_SECTION>Add a details section here with bullets or other formatted markdown to fit in this section that details out the meta system integration like with the customizable workflow .md documents or the agentic system config files. edit other relevant sections without removing any other tags or their corresponding prompts based on the changes made here

### Meta System Integration

The context budget management integrates with:
- **Customizable workflow .md documents**: Define context gathering strategies
- **Agentic system config files**: Configure behavior flows for context selection
- **Mode-based rules**: Each [[agentic-mode-system]] can define its own budget allocation
- **Self-improvement workflows**: Learn optimal budget allocations over time (see [[self-improvement-system]])

---

**See also:** [[multi-source-integration]] for MCP and RAG integration, [[smart-chunking-memory]] for persistent context patterns
