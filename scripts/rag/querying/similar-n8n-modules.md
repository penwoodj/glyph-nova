# Similar n8n Modules - Querying Nodes

**Purpose:** Document querying-related nodes and their n8n equivalents for reference and understanding

**Date:** 2025-01-15
**Version:** 1.0

---

## Overview

This document describes the querying nodes in the RAG system and their similarities to n8n nodes. Querying nodes handle query expansion, vector search, result fusion, reranking, and LLM generation.

---

## Query Expansion Node

**RAG Node:** `QueryExpansionNode`
**File:** `queryExpansion.ts`

### Purpose
Generates multiple query variations from an original query using LLM to improve retrieval recall.

### Similar n8n Nodes

**1. AI Agent Node**
- **Similarity:** Both use LLM to generate text variations
- **Differences:**
  - n8n for general reasoning, RAG for query expansion
  - RAG generates query variations specifically
  - RAG focuses on improving retrieval recall

**2. Text Processing Node**
- **Similarity:** Both process and transform text
- **Differences:**
  - n8n does general transformations, RAG expands queries semantically
  - RAG uses LLM for semantic expansion

**3. Code Node (Query Generation)**
- **Similarity:** Both can generate query variations programmatically
- **Differences:**
  - RAG uses LLM for semantic understanding
  - RAG generates variations that improve retrieval

### Usage Example

```typescript
// RAG Query Expander
const expander = new QueryExpander('llama2', 'http://localhost:11434', 3);
const variations = await expander.expandQuery('authentication system');
// Returns: ['authentication system', 'login mechanism', 'user verification', ...]
```

### Parameters
- `ollamaModel`: Ollama model for expansion (default: 'llama2')
- `ollamaUrl`: Ollama API URL
- `numVariations`: Number of query variations (2-5, default: 3)

### Output
- Array of query strings: `string[]` (includes original as first element)

---

## Vector Search Node

**RAG Node:** `VectorSearchNode`
**File:** `rag.ts` (retrieveRelevantChunks method)

### Purpose
Performs similarity search in vector store to find most relevant chunks for a query.

### Similar n8n Nodes

**1. Vector Store Node (n8n)**
- **Similarity:** Both perform vector similarity search
- **Differences:**
  - n8n uses external vector DBs, RAG uses built-in store
  - RAG optimized for document chunk retrieval
  - RAG returns chunks with metadata

**2. Database Query Nodes**
- **Similarity:** Both query stored data
- **Differences:**
  - RAG uses cosine similarity, not SQL
  - RAG returns semantically similar chunks
  - RAG optimized for text similarity

**3. Search Nodes (Elasticsearch, etc.)**
- **Similarity:** Both search through indexed data
- **Differences:**
  - RAG uses vector similarity, not keyword search
  - RAG returns chunks ranked by similarity
  - RAG optimized for semantic search

### Usage Example

```typescript
// RAG Vector Search
const rag = new RAGSystem(vectorStore, 'llama2');
const chunks = await rag.retrieveRelevantChunks('authentication', 5);
// Returns: Top 5 most similar chunks
```

### Parameters
- `query`: User query string
- `topK`: Number of top chunks to retrieve (default: 3)
- `vectorStore`: Vector store to search

### Output
- Array of chunks: `Chunk[]` sorted by similarity score

---

## RRF Fusion Node

**RAG Node:** `RRFFusionNode`
**File:** `resultFusion.ts`

### Purpose
Combines multiple ranked lists of chunks using Reciprocal Rank Fusion (RRF) algorithm.

### Similar n8n Nodes

**1. Merge Node**
- **Similarity:** Both combine multiple data streams
- **Differences:**
  - n8n merges by key, RAG merges by rank using RRF
  - RAG uses RRF algorithm for fusion
  - RAG handles deduplication automatically

**2. Aggregate Node**
- **Similarity:** Both aggregate multiple inputs
- **Differences:**
  - n8n aggregates by function, RAG by rank fusion
  - RAG uses RRF scoring algorithm
  - RAG preserves ranking information

**3. Code Node (Custom Fusion Logic)**
- **Similarity:** Both can implement custom fusion logic
- **Differences:**
  - RAG implements RRF algorithm specifically
  - RAG handles ranked lists, not general data
  - RAG optimized for retrieval result fusion

### Usage Example

```typescript
// RAG RRF Fusion
const rrf = new ReciprocalRankFusion(60);
const fused = rrf.fuse([list1, list2, list3], 10);
// Returns: Top 10 chunks after RRF fusion
```

### Parameters
- `rankedLists`: Array of ranked chunk lists
- `topK`: Number of top chunks after fusion
- `k`: RRF constant (default: 60)

### Output
- Fused ranked list: `Chunk[]` sorted by RRF score

---

## Reranker Node

**RAG Node:** `RerankerNode`
**File:** `reranker.ts` (from RAG improvements plan)

### Purpose
Reranks retrieved chunks using LLM-based relevance scoring to improve precision.

### Similar n8n Nodes

**1. AI Agent Node**
- **Similarity:** Both use LLM for scoring/ranking
- **Differences:**
  - n8n for general reasoning, RAG for relevance scoring
  - RAG scores query-chunk pairs
  - RAG focuses on retrieval precision

**2. Sort Node**
- **Similarity:** Both sort data by criteria
- **Differences:**
  - n8n sorts by field, RAG by LLM relevance score
  - RAG uses semantic understanding for ranking
  - RAG scores each chunk individually

**3. Filter Node**
- **Similarity:** Both filter data based on criteria
- **Differences:**
  - n8n filters by condition, RAG by relevance score
  - RAG uses LLM to determine relevance
  - RAG improves precision, not just filtering

### Usage Example

```typescript
// RAG Reranker
const reranker = new LLMReranker('llama2');
const reranked = await reranker.rerank('authentication', chunks);
// Returns: Chunks sorted by relevance score (0-1)
```

### Parameters
- `query`: User query
- `chunks`: Chunks to rerank
- `model`: LLM model for reranking

### Output
- Reranked chunks: `Chunk[]` sorted by relevance score

---

## LLM Generator Node

**RAG Node:** `LLMGeneratorNode`
**File:** `rag.ts` (generateResponse method)

### Purpose
Generates responses using LLM (Ollama) with retrieved context chunks.

### Similar n8n Nodes

**1. AI Agent Node**
- **Similarity:** Both use LLM to generate responses
- **Differences:**
  - n8n for general agent behavior, RAG for context-aware generation
  - RAG uses retrieved chunks as context
  - RAG focuses on grounded responses

**2. OpenAI Node / Anthropic Node**
- **Similarity:** Both call LLM APIs
- **Differences:**
  - RAG uses Ollama (local), not cloud APIs
  - RAG includes retrieved context in prompt
  - RAG optimized for RAG workflow

**3. HTTP Request Node (to LLM API)**
- **Similarity:** Both make HTTP requests to LLM
- **Differences:**
  - RAG wraps Ollama CLI/API
  - RAG handles context assembly automatically
  - RAG includes source attribution

### Usage Example

```typescript
// RAG LLM Generator
const rag = new RAGSystem(vectorStore, 'llama2');
const response = await rag.generateResponse('What is authentication?', chunks);
// Returns: Generated response with context from chunks
```

### Parameters
- `query`: User query
- `contextChunks`: Retrieved chunks for context
- `model`: Ollama model name (default: 'llama2')

### Output
- Generated response: `string` with context-aware answer

---

## Graph Traversal Node (Knowledge Graph)

**RAG Node:** `GraphTraversalNode`
**File:** `graphTraversal.ts` (from knowledge graph plan)

### Purpose
Traverses knowledge graph to find related entities via relationships.

### Similar n8n Nodes

**1. Code Node (Graph Traversal)**
- **Similarity:** Both can traverse graph structures
- **Differences:**
  - RAG specialized for knowledge graph traversal
  - RAG handles entity relationships
  - RAG supports multi-hop traversal

**2. Loop Node**
- **Similarity:** Both iterate through data
- **Differences:**
  - n8n loops through items, RAG traverses graph edges
  - RAG follows relationships, not arrays
  - RAG handles graph-specific traversal

### Usage Example

```typescript
// RAG Graph Traversal
const traverser = new GraphTraverser(graphStore);
const related = traverser.getNeighbors('AuthService', 2);
// Returns: Entities within 2 hops of AuthService
```

### Parameters
- `entityId`: Starting entity ID
- `maxHops`: Maximum traversal depth (default: 1)
- `relationshipTypes`: Filter by relationship types (optional)

### Output
- Array of related entities: `Entity[]`

---

## Graph Retrieval Node (Knowledge Graph)

**RAG Node:** `GraphRetrievalNode`
**File:** `graphRetrieval.ts` (from knowledge graph plan)

### Purpose
Retrieves chunks via knowledge graph entities and relationships.

### Similar n8n Nodes

**1. Database Query Nodes**
- **Similarity:** Both query structured data
- **Differences:**
  - RAG queries graph structure, not relational DB
  - RAG follows entity relationships
  - RAG returns chunks via entity links

**2. Code Node (Graph Query)**
- **Similarity:** Both can query graph structures
- **Differences:**
  - RAG specialized for entity-based retrieval
  - RAG links entities to chunks
  - RAG optimized for retrieval workflow

### Usage Example

```typescript
// RAG Graph Retrieval
const retriever = new GraphRetriever(graphStore);
const chunks = await retriever.retrieveByEntities(entities, 1);
// Returns: Chunks linked to entities and their neighbors
```

### Parameters
- `entities`: Entities to retrieve chunks for
- `maxHops`: Traversal depth for related entities
- `relationshipTypes`: Filter by relationship types

### Output
- Array of chunks: `Chunk[]` retrieved via graph

---

## Hybrid Graph Retrieval Node (Knowledge Graph)

**RAG Node:** `HybridGraphRetrievalNode`
**File:** `hybridGraphRetrieval.ts` (from knowledge graph plan)

### Purpose
Combines vector similarity search with graph-based retrieval using RRF fusion.

### Similar n8n Nodes

**1. Merge Node**
- **Similarity:** Both combine multiple data sources
- **Differences:**
  - RAG combines vector + graph results
  - RAG uses RRF for fusion
  - RAG optimized for hybrid retrieval

**2. Aggregate Node**
- **Similarity:** Both aggregate from multiple sources
- **Differences:**
  - RAG aggregates vector + graph results
  - RAG uses RRF scoring
  - RAG handles ranked lists

### Usage Example

```typescript
// RAG Hybrid Retrieval
const hybrid = new HybridGraphRetriever(vectorStore, graphStore);
const chunks = await hybrid.retrieve('authentication', 5, true);
// Returns: Top 5 chunks from vector + graph fusion
```

### Parameters
- `query`: User query
- `topK`: Number of chunks to retrieve
- `useGraph`: Whether to use graph retrieval (default: true)

### Output
- Array of chunks: `Chunk[]` from hybrid retrieval

---

## Node Composition Patterns

### Querying Workflow Pattern

```
Query → QueryExpansion → VectorSearch → RRF Fusion → Reranker → LLM Generator
         ↓                    ↓
    (optional)        GraphTraversal (optional)
                            ↓
                    GraphRetrieval (optional)
                            ↓
                    Hybrid Fusion
```

### Similar n8n Workflow Pattern

```
User Input → AI Agent (Query) → Vector Store → AI Agent (Response)
```

---

## Key Differences from n8n

1. **RAG Specialization:** Nodes optimized for retrieval-augmented generation
2. **Context Assembly:** Automatic context assembly from retrieved chunks
3. **Hybrid Retrieval:** Combines vector similarity with graph traversal
4. **Source Attribution:** Includes source file information in responses
5. **Query Expansion:** Built-in query expansion for better recall

---

## References

- **n8n Documentation:** https://docs.n8n.io/
- **RAG System Plan:** `@cursor/docs/plans/rag-system-advanced-improvements.md`
- **Knowledge Graph Plan:** `@cursor/docs/plans/rag-knowledge-graph-integration-plan.md`
- **n8n Architecture:** `@cursor/docs/reports/n8n-agentic-behavior/`

---

**Last Updated:** 2025-01-15
**Version:** 1.0
