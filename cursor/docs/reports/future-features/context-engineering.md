# Context Engineering

**Related:** [index](./index.md) | [transparency-observability](./transparency-observability.md) | [agentic-mode-system](./agentic-mode-system.md) | [multi-source-integration](./multi-source-integration.md) | [smart-chunking-memory](./smart-chunking-memory.md)

---

## Smart Chunking Engine

**Problem:** Large files/docs need intelligent splitting.

### Strategies

1. **Semantic chunking**: Split on logical boundaries (functions, classes, sections)
2. **Overlapping windows**: Maintain context between chunks through easy to change modes or settings
3. **Hierarchy preservation**: Keep structural relationships
4. **Adaptive sizing**: Adjust chunk size based on content density, and LLM context effective response results size metrics based on system and hardware, available memory, and model capabilities
5. **Nested summary creation**: Batch process agentic workflow on a cron job for creating and navigating summaries through context creation and navigation, similar to RAG with visualization in a hierarchical graph database in files with good visualization tools
6. **Semantic memory layer**: Visualization capabilities where there are ideas of what the file does in different sections based on line number. LLMs can read these summaries before looking at files, with smart modes determining which level of abstraction to read and when it needs to

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

Context relevance ranking is controlled by an agentic self-improving workflow system using n8n-like configuration agentic workflow files (specifics TBD). Decision logic for “what context to get when and where” is built as its own category of these workflow files. Each workflow format (agentic .md, chat .md, n8n-like config files) has its own visualizer with a markdown toggle and default file-type visualization. Self-improvement workflows use scoped summary workflows as part of the self-learning suite. Defaults are solid and fully editable/transparent, with workflows composing features.

**Note:** Configuration uses n8n-like config files with visualization modes (preferred) and markdown files with consistent format. Visualizers exist per file type (agentic .md workflows, chat .md, n8n-like configs, context memory navigation/foam-link visualizer for left panel). A future format may translate markdown into config dashboards while remaining human-readable.

**Quality over Speed:** Quality output is measurably more important than speed. Responses taking 2-10 minutes are acceptable if output quality is high and minimal back-and-forth is needed.

### Ranking Factors

- **Semantic similarity**: Vector embeddings (local BERT/sentence-transformers)
- **Recency**: Recently viewed/edited files score higher
- **Graph proximity**: Files close in dependency graph
- **Explicit references**: Direct mentions in user query
- **Historical success**: Patterns learned from past successful contexts (see [smart-chunking-memory](./smart-chunking-memory.md))

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

### Meta System Integration

The context budget management integrates with:
- **Customizable workflow .md documents**: Define context gathering strategies
- **Agentic system config files**: Configure behavior flows for context selection
- **Mode-based rules**: Each [agentic-mode-system](./agentic-mode-system.md) can define its own budget allocation
- **Self-improvement workflows**: Learn optimal budget allocations over time (see [self-improvement-system](./self-improvement-system.md))

---

**See also:** [multi-source-integration](./multi-source-integration.md) for MCP and RAG integration, [smart-chunking-memory](./smart-chunking-memory.md) for persistent context patterns
