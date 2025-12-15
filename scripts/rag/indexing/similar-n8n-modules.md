# Similar n8n Modules - Indexing Nodes

**Purpose:** Document indexing-related nodes and their n8n equivalents for reference and understanding

**Date:** 2025-01-15
**Version:** 1.0

---

## Overview

This document describes the indexing nodes in the RAG system and their similarities to n8n nodes. Indexing nodes handle document collection, chunking, embedding generation, and vector storage.

---

## File Collector Node

**RAG Node:** `FileCollectorNode`
**File:** `fileCollector.ts`

### Purpose
Collects files from specified paths (files, folders, or multiple paths) and filters them by file type and size.

### Similar n8n Nodes

**1. Read Binary File Node**
- **Similarity:** Both read files from filesystem
- **Differences:**
  - n8n reads single files, RAG collects multiple files recursively
  - RAG filters by extension and size
  - RAG supports multiple paths

**2. HTTP Request Node**
- **Similarity:** Both fetch data from sources
- **Differences:**
  - n8n fetches from URLs, RAG from local filesystem
  - RAG handles recursive directory traversal

**3. Read Files from Folder Node**
- **Similarity:** Both read multiple files from directories
- **Differences:**
  - RAG supports multiple folders and files
  - RAG has file type filtering built-in

### Usage Example

```typescript
// RAG File Collector
const collector = new FileCollector();
const files = collector.collectFilesFromPaths(['./docs', './src']);
// Returns: Array of file objects with path, absolutePath, size
```

### Parameters
- `paths`: Array of file/folder paths
- `extensions`: Allowed file extensions (default: .txt, .md, .js, .ts, etc.)
- `maxSize`: Maximum file size in bytes
- `recursive`: Whether to traverse subdirectories

### Output
- Array of file objects: `{ path, absolutePath, size, extension }`

---

## Chunker Node

**RAG Node:** `ChunkerNode`
**File:** `chunker.ts`

### Purpose
Splits documents into smaller chunks with overlap to preserve context at boundaries.

### Similar n8n Nodes

**1. Split in Batches Node**
- **Similarity:** Both split data into smaller pieces
- **Differences:**
  - n8n splits arrays/items, RAG splits text by character count
  - RAG preserves overlap between chunks
  - RAG tracks chunk metadata (position, source)

**2. Text Processing Node**
- **Similarity:** Both process text data
- **Differences:**
  - n8n does transformations, RAG does splitting
  - RAG maintains source file information

**3. Code Node (Custom JavaScript)**
- **Similarity:** Both can split text programmatically
- **Differences:**
  - RAG is specialized for document chunking
  - RAG handles overlap and metadata automatically

### Usage Example

```typescript
// RAG Chunker
const chunker = new DocumentChunker(500, 50); // 500 chars, 50 overlap
const chunks = chunker.chunkFile('./document.txt');
// Returns: Array of chunks with text, startIndex, endIndex, chunkIndex
```

### Parameters
- `chunkSize`: Maximum characters per chunk (default: 500)
- `overlap`: Character overlap between chunks (default: 50)
- `semanticChunking`: Use semantic chunking instead of fixed-size (optional)

### Output
- Array of chunk objects: `{ text, startIndex, endIndex, chunkIndex, sourceFile, sourcePath }`

---

## Embedding Generator Node

**RAG Node:** `EmbeddingGeneratorNode`
**File:** `embeddings.ts`

### Purpose
Generates vector embeddings for text chunks using Ollama embeddings API or simple text-based embeddings.

### Similar n8n Nodes

**1. AI Agent Node (with Embeddings)**
- **Similarity:** Both generate embeddings for text
- **Differences:**
  - n8n uses AI Agent for reasoning, RAG for vector generation
  - RAG supports multiple embedding models
  - RAG has fallback to simple embeddings

**2. HTTP Request Node (to Embedding API)**
- **Similarity:** Both call external APIs for embeddings
- **Differences:**
  - RAG wraps Ollama API calls
  - RAG has built-in fallback mechanism
  - RAG handles batch processing

**3. Vector Store Node (n8n)**
- **Similarity:** Both work with vector embeddings
- **Differences:**
  - n8n stores vectors, RAG generates them
  - RAG generates embeddings, n8n uses pre-generated

### Usage Example

```typescript
// RAG Embedding Generator
const generator = new EmbeddingGenerator('llama2', 'nomic-embed-text');
const embedding = await generator.generateEmbedding('text to embed');
// Returns: Array of numbers (embedding vector)
```

### Parameters
- `ollamaModel`: Ollama model name (default: 'llama2')
- `embeddingModel`: Embedding model name (default: 'nomic-embed-text')
- `ollamaUrl`: Ollama API URL (default: 'http://localhost:11434')
- `useOllama`: Whether to use Ollama (default: true, falls back to simple)

### Output
- Embedding vector: `number[]` (384 or 768 dimensions depending on model)

---

## Vector Store Node

**RAG Node:** `VectorStoreNode`
**File:** `vectorStore.ts`, `binaryStore.ts`, `storeInterface.ts`

### Purpose
Stores chunks with their embeddings in a vector database for fast similarity search.

### Similar n8n Nodes

**1. Vector Store Node (n8n)**
- **Similarity:** Both store vectors for similarity search
- **Differences:**
  - n8n uses external vector DBs, RAG has built-in storage
  - RAG supports JSON and binary formats
  - RAG stores chunk metadata with vectors

**2. Database Nodes (PostgreSQL, MySQL)**
- **Similarity:** Both store structured data
- **Differences:**
  - RAG optimized for vector similarity search
  - RAG stores embeddings, not relational data
  - RAG has binary encoding option

**3. File System Nodes**
- **Similarity:** Both store data to files
- **Differences:**
  - RAG stores in specialized vector format
  - RAG supports both JSON and binary encoding
  - RAG optimized for fast similarity search

### Usage Example

```typescript
// RAG Vector Store
const store = createVectorStore('.rag-store', false); // binary encoding
store.save(chunksWithEmbeddings, documentPaths);
// Stores chunks with embeddings for later retrieval
```

### Parameters
- `storeDir`: Directory for vector store
- `useJson`: Use JSON encoding (slower but human-readable) vs binary (faster)

### Output
- Store path and metadata
- Chunks can be retrieved via `store.getChunks()`

---

## Entity Extractor Node (Knowledge Graph)

**RAG Node:** `EntityExtractorNode`
**File:** `entityExtractor.ts` (from knowledge graph plan)

### Purpose
Extracts entities (functions, classes, concepts) from text chunks using LLM-based extraction.

### Similar n8n Nodes

**1. AI Agent Node**
- **Similarity:** Both use LLM for extraction
- **Differences:**
  - n8n for general reasoning, RAG for entity extraction
  - RAG specialized for code/document entities
  - RAG extracts structured entity data

**2. Text Processing Node**
- **Similarity:** Both process text to extract information
- **Differences:**
  - n8n does general text processing, RAG does entity extraction
  - RAG uses LLM for extraction, not pattern matching

**3. Named Entity Recognition (NLP)**
- **Similarity:** Both extract named entities
- **Differences:**
  - RAG uses LLM, not pre-trained NER models
  - RAG extracts code-specific entities (functions, classes)
  - RAG includes location information (file, line numbers)

### Usage Example

```typescript
// RAG Entity Extractor
const extractor = new EntityExtractor();
const entities = await extractor.extractEntities(chunk);
// Returns: Array of entities with name, type, description, location
```

### Parameters
- `chunk`: Text chunk to extract entities from
- `entityTypes`: Types of entities to extract (functions, classes, etc.)
- `confidenceThreshold`: Minimum confidence for extraction

### Output
- Array of entities: `{ name, type, description, sourceFile, lineNumbers, confidence }`

---

## Relationship Extractor Node (Knowledge Graph)

**RAG Node:** `RelationshipExtractorNode`
**File:** `relationshipExtractor.ts` (from knowledge graph plan)

### Purpose
Extracts relationships between entities (CALLS, IMPLEMENTS, USES, etc.) using LLM.

### Similar n8n Nodes

**1. AI Agent Node**
- **Similarity:** Both use LLM for relationship extraction
- **Differences:**
  - n8n for general reasoning, RAG for relationship extraction
  - RAG extracts structured relationship data
  - RAG handles code dependencies

**2. Code Node (Custom Logic)**
- **Similarity:** Both can extract relationships programmatically
- **Differences:**
  - RAG uses LLM for semantic relationships
  - RAG handles ambiguous relationships
  - RAG extracts relationship context

### Usage Example

```typescript
// RAG Relationship Extractor
const extractor = new RelationshipExtractor();
const relationships = await extractor.extractRelationships(entities, chunk);
// Returns: Array of relationships with type, source, target, context
```

### Parameters
- `entities`: Array of extracted entities
- `chunk`: Text chunk containing entities
- `relationshipTypes`: Types of relationships to extract

### Output
- Array of relationships: `{ type, source, target, confidence, context }`

---

## Graph Builder Node (Knowledge Graph)

**RAG Node:** `GraphBuilderNode`
**File:** `graphBuilder.ts` (from knowledge graph plan)

### Purpose
Builds knowledge graph structure from extracted entities and relationships.

### Similar n8n Nodes

**1. Set Node**
- **Similarity:** Both structure data
- **Differences:**
  - n8n sets fields, RAG builds graph structure
  - RAG creates entity-relationship graph
  - RAG handles graph deduplication

**2. Code Node (Graph Construction)**
- **Similarity:** Both can build graph structures programmatically
- **Differences:**
  - RAG specialized for knowledge graph construction
  - RAG handles entity linking and deduplication
  - RAG links entities to chunks

### Usage Example

```typescript
// RAG Graph Builder
const builder = new KnowledgeGraphBuilder();
builder.addEntity(entity, chunkId);
builder.addRelationship(relationship);
const graph = builder.buildGraph();
// Returns: Knowledge graph with entities, relationships, entity-chunk links
```

### Parameters
- `entities`: Array of entities to add
- `relationships`: Array of relationships to add
- `chunkLinks`: Entity-to-chunk mappings

### Output
- Knowledge graph: `{ entities: Map, relationships: Array, entityChunkLinks: Map }`

---

## Node Composition Patterns

### Indexing Workflow Pattern

```
FileCollector → Chunker → EmbeddingGenerator → VectorStore
                                    ↓
                            EntityExtractor (optional)
                                    ↓
                            RelationshipExtractor (optional)
                                    ↓
                            GraphBuilder (optional)
                                    ↓
                            GraphStore (optional)
```

### Similar n8n Workflow Pattern

```
Read Files → Split in Batches → AI Agent (Embeddings) → Vector Store
```

---

## Key Differences from n8n

1. **Specialization:** RAG nodes are specialized for document indexing and retrieval
2. **Integration:** Nodes work together in RAG pipeline
3. **Metadata:** RAG nodes preserve source file and position information
4. **Embeddings:** Built-in embedding generation with fallback
5. **Graph Support:** Optional knowledge graph construction

---

## References

- **n8n Documentation:** https://docs.n8n.io/
- **RAG System Plan:** `@cursor/docs/plans/rag-system-advanced-improvements.md`
- **Knowledge Graph Plan:** `@cursor/docs/plans/rag-knowledge-graph-integration-plan.md`
- **n8n Architecture:** `@cursor/docs/reports/n8n-agentic-behavior/`

---

**Last Updated:** 2025-01-15
**Version:** 1.0
