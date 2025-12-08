# Multi-Source Integration

**Related:** [[index]] | [[context-engineering]] | [[agentic-mode-system]] | [[smart-chunking-memory]]

---

## MCP (Model Context Protocol)

**Goal:** Query live systems for real-time context.

### Supported MCP Servers

```
Core Servers:
├─ filesystem: File operations, search, watch
├─ git: Repository data, history, blame
├─ postgres: Database schema, queries
├─ github: Issues, PRs, discussions
└─ docker: Container status, logs

Future Servers:
├─ kubernetes: Cluster state
├─ web-search: DuckDuckGo, Brave
├─ linear: Project management
└─ custom: User-defined servers
```

### MCP Query Language

```yaml
# In mode document
mcp_queries:
  - server: git
    operation: recent_commits
    params:
      file: $current_file
      limit: 10

  - server: postgres
    operation: schema
    params:
      table: $mentioned_table

  - server: github
    operation: related_issues
    params:
      labels: ["bug", "urgent"]
      state: open
```

---

## RAG (Retrieval Augmented Generation)

**Goal:** Search indexed documentation and code.

### RAG Indices

```
Documentation Indices:
├─ typescript-docs: Official TS documentation
├─ redwood-docs: Framework documentation
├─ codebase-index: This project's code
└─ custom-docs: User-added documentation

Update Strategy:
├─ Real-time: Codebase changes indexed immediately
├─ Daily: External docs updated nightly
└─ On-demand: Manual reindex command
```

### RAG Query Process

```
1. User query → Embedding generation (local BERT)
2. Vector similarity search (cosine distance)
3. Retrieve top-k chunks (k=10-20)
4. Re-rank by relevance to specific query
5. Include top 3-5 in context with source citations
```

### RAG Configuration

```typescript
interface RAGConfig {
  index: string
  embeddingModel: 'local-bert' | 'openai-ada' | 'custom'
  chunkSize: number
  chunkOverlap: number
  topK: number
  minRelevance: number // 0-1 threshold
  citeSources: boolean
}
```

---

## Context Source Orchestration

**Goal:** Intelligently combine multiple context sources.

```typescript
async function gatherContext(
  query: string,
  mode: Mode,
  budget: TokenBudget
): Promise<AggregatedContext> {
  // Parallel queries
  const [files, mcpData, ragResults] = await Promise.all([
    gatherFileContext(query, mode.fileRules, budget.files),
    queryMCPServers(mode.mcpQueries, budget.mcp),
    searchRAG(query, mode.ragIndices, budget.rag)
  ])

  // Combine and rank
  return rankAndMerge({
    files,
    mcpData,
    ragResults,
    budget,
    strategy: mode.contextStrategy
  })
}
```

---

**See also:** [[context-engineering]] for how context is ranked, [[agentic-mode-system]] for how modes use MCP and RAG, [[smart-chunking-memory]] for learned context patterns
