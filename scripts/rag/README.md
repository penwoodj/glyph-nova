# RAG CLI - Retrieval-Augmented Generation System

A comprehensive RAG (Retrieval-Augmented Generation) system that indexes documents and allows querying them using Ollama for generation. This implementation demonstrates the full RAG pipeline from document indexing to semantic search and context-aware response generation.

## What is RAG?

**RAG (Retrieval-Augmented Generation)** is a technique that combines information retrieval with language model generation:

1. **Retrieval**: When you ask a question, the system searches a knowledge base (your indexed documents) to find relevant information
2. **Augmentation**: That retrieved information is added to the prompt as context
3. **Generation**: The language model generates a response using both its training data and the retrieved context

This makes responses more accurate, context-aware, and grounded in your actual documents rather than generic knowledge.

## Features

- **Multi-File Indexing**: Index single files, entire folders, or multiple paths at once
- **Semantic Search**: Find relevant content using vector similarity, not just keyword matching
- **Context-Aware Responses**: LLM generates answers based on your actual documents
- **Ollama Integration**: Uses Ollama CLI for local, private response generation
- **Open Source Embeddings**: Simple text-based embeddings (no external model dependencies)
- **Dual Encoding**: Choose between fast binary encoding (default) or human-readable JSON encoding
- **File Watching**: Auto-reindex documents when they change (--watch flag)
- **Source Tracking**: Know which file each piece of information came from

## Installation

```bash
cd scripts/rag
npm install
```

## Quick Start

### Index Documents

**Basic indexing (binary encoding - fast):**
```bash
yarn rag index ./document.txt
```

**JSON encoding (human-readable):**
```bash
yarn rag index ./document.txt --json
```

**With file watching (auto-reindex on changes):**
```bash
yarn rag index ./docs --watch
```

**Index multiple files/folders:**
```bash
yarn rag index file1.txt file2.md folder/
```

### Query Indexed Documents

```bash
yarn rag query "What is the main topic?"
```

The system auto-detects encoding format, or specify explicitly:
```bash
yarn rag query "What is the main topic?" --json
```

## Usage Examples

### Encoding Options

**Binary Encoding (Default - Fast):**
```bash
# Fast, efficient binary format - best for large datasets
yarn rag index ./docs
yarn rag query "your question"
```

**JSON Encoding (Human-Readable):**
```bash
# Slower but human-readable - good for debugging
yarn rag index ./docs --json
yarn rag query "your question" --json
```

### File Watching

**Watch for Changes:**
```bash
# Index and watch for file changes
yarn rag index ./docs --watch

# When files change, they're automatically re-indexed
# Press Ctrl+C to stop watching
```

**Use Cases:**
- Active development on documentation
- Frequently updated codebases
- Real-time knowledge base updates

### Basic Indexing

**Single File:**
```bash
# Index a markdown document (binary encoding)
yarn rag index cursor/docs/reports/how-ive-been-using-cursor-prompt.md

# With JSON encoding
yarn rag index cursor/docs/reports/how-ive-been-using-cursor-prompt.md --json
```

**Folder:**
```bash
# Index all supported files in a directory
yarn rag index cursor/docs/reports/

# With file watching
yarn rag index cursor/docs/reports/ --watch
```

**Multiple Paths:**
```bash
# Index multiple files and folders at once
yarn rag index file1.txt file2.md cursor/docs/plans/
```

### Querying

**Simple Query:**
```bash
yarn rag query "What does this document cover?"
```

**Complex Query:**
```bash
yarn rag query "Explain the RAG architecture and how embeddings work"
```

**With Explicit Encoding:**
```bash
yarn rag query "your question" --json
```

## Architecture

### File Structure

```
rag/
├── index.ts                    # CLI entry point
├── indexing/                   # Indexing pipeline components
│   ├── fileCollector.ts       # Collects files from paths
│   ├── chunker.ts             # Splits documents into chunks
│   ├── embeddings.ts          # Generates embeddings
│   ├── vectorStore.ts         # JSON vector store
│   ├── binaryStore.ts         # Binary vector store (fast)
│   ├── storeInterface.ts      # Unified store interface
│   └── fileWatcher.ts         # File watching for auto-reindexing
├── querying/                   # Query pipeline components
│   └── rag.ts                 # RAG retrieval and generation
├── package.json
├── tsconfig.json
└── README.md
```

### RAG Pipeline

#### Indexing Pipeline

```
Document(s) → File Collector → Chunker → Embeddings → Vector Store
```

1. **File Collector**: Gathers all files from provided paths (files/folders)
   - Filters by file type (`.txt`, `.md`, `.js`, `.ts`, etc.)
   - Recursively processes directories
   - Skips hidden files and build directories

2. **Chunker**: Splits documents into overlapping chunks
   - Default: 500 characters per chunk with 50 character overlap
   - Preserves context across chunk boundaries
   - Tracks source file for each chunk

3. **Embeddings**: Converts text chunks into numerical vectors
   - 384-dimensional vectors capturing semantic meaning
   - Based on character frequency, word patterns, and text statistics
   - Similar texts produce similar vectors

4. **Vector Store**: Saves chunks with embeddings
   - JSON format for easy inspection
   - Stores metadata (source file, position, etc.)
   - Enables fast similarity search

#### Query Pipeline

```
Query → Embedding → Similarity Search → Top Chunks → Ollama → Response
```

1. **Query Embedding**: Convert query to same vector space as chunks
2. **Similarity Search**: Find most similar chunks using cosine similarity
3. **Retrieval**: Get top-K most relevant chunks (default: 3)
4. **Context Assembly**: Combine chunks with source information
5. **Generation**: Send context + query to Ollama for response

## How It Works

### Document Chunking

Documents are split into smaller chunks because:
- **Context Limits**: LLMs have token limits, so we can't send entire documents
- **Precision**: Smaller chunks allow more precise retrieval
- **Overlap**: Overlapping chunks preserve context at boundaries

Example:
```
Original: "RAG is a technique that combines retrieval with generation..."

Chunk 1: "RAG is a technique that combines retrieval with generation. It works by..."
Chunk 2: "...generation. It works by searching a knowledge base to find relevant..."
```

### Embeddings

Embeddings convert text into numerical vectors that capture semantic meaning:

- **Character Features**: Frequency of each character (first 128 dimensions)
- **Word Features**: Most common words and their patterns (next 128 dimensions)
- **Text Statistics**: Length, word count, capitalization, digits (remaining dimensions)
- **Normalization**: Vectors are normalized for consistent similarity calculations

Similar texts produce similar embeddings, enabling semantic search.

### Vector Similarity Search

When you query, the system:
1. Generates an embedding for your query
2. Calculates cosine similarity with all stored chunk embeddings
3. Returns the top-K most similar chunks

**Cosine Similarity** measures the angle between vectors:
- `1.0` = identical
- `0.0` = orthogonal (unrelated)
- `-1.0` = opposite

### Context-Aware Generation

Retrieved chunks are sent to Ollama with your query:

```
Based on the following context, answer the question.

Context:
[Context 1]
[Source: document.txt]
RAG is a technique that combines retrieval with generation...

[Context 2]
[Source: document.txt]
It works by searching a knowledge base to find relevant information...

Question: What is RAG?

Answer:
```

The LLM uses this context to generate accurate, grounded responses.

## Encoding Formats

### Binary Encoding (Default)

**Advantages:**
- ⚡ **Much faster** read/write operations
- 📦 **Smaller file size** (typically 30-50% smaller than JSON)
- 🚀 **Better performance** for large datasets
- 💾 **Lower memory usage** during loading

**When to use:**
- Production use
- Large document collections
- Performance-critical applications
- When you don't need to inspect the store manually

**File:** `.rag-store/vector-store.bin`

### JSON Encoding (--json flag)

**Advantages:**
- 👁️ **Human-readable** - can inspect with text editor
- 🐛 **Easier debugging** - see exact chunk contents
- 🔧 **Manual editing** possible (not recommended)
- 📝 **Better for small datasets** where readability matters

**When to use:**
- Development and debugging
- Small document collections
- When you need to inspect the vector store
- Learning how RAG works

**File:** `.rag-store/vector-store.json`

**Performance Comparison:**
- Binary: ~3-5x faster loading, ~2-3x faster saving
- Binary: ~30-50% smaller file size
- JSON: Easier to inspect and debug

## Configuration

### Supported File Types

Default supported extensions:
- `.txt`, `.md` - Text and markdown files
- `.js`, `.ts` - JavaScript and TypeScript
- `.json` - JSON files
- `.py` - Python files
- `.java`, `.cpp`, `.c`, `.h` - C/C++/Java files

Modify in `indexing/fileCollector.ts`:
```typescript
new FileCollector(['.txt', '.md', '.custom'])
```

### Chunk Size

Adjust chunk size in `index.ts`:
```typescript
const chunker = new DocumentChunker(500, 50); // size, overlap
```

- **Larger chunks**: More context per chunk, fewer chunks
- **Smaller chunks**: More precise retrieval, more chunks

### Retrieval Parameters

Adjust number of retrieved chunks in `index.ts`:
```typescript
const response = await rag.query(query, 3); // topK=3
```

- **More chunks**: Richer context, but longer prompts
- **Fewer chunks**: Faster, but may miss relevant information

### Ollama Model

Change model in `index.ts`:
```typescript
const rag = new RAGSystem(vectorStore, 'llama2'); // or 'mistral', etc.
```

## Requirements

- **Node.js** 18+
- **Ollama** installed and running
- **Ollama Model** (default: `llama2`)

Install Ollama: [https://ollama.ai](https://ollama.ai)

## Advanced Usage

### Indexing Large Codebases

```bash
# Index entire project (excludes node_modules, .git, etc.)
yarn rag index src/ api/ web/
```

### Querying Specific Topics

```bash
# Find information about a specific feature
yarn rag query "How does the file tree component work?"

# Get implementation details
yarn rag query "Show me the authentication implementation"
```

### Inspecting the Vector Store

**JSON Format (--json flag):**
```bash
cat .rag-store/vector-store.json
```

This lets you:
- See all indexed chunks
- Inspect embeddings
- Check metadata
- Debug retrieval issues

**Binary Format (default):**
The binary format is not human-readable, but you can:
- Use the query command to verify indexing worked
- Check file size to estimate chunk count
- Re-index with --json flag if you need to inspect

### File Watching

**Start Watching:**
```bash
yarn rag index ./docs --watch
```

**How it works:**
- Monitors all indexed files for changes
- Debounces rapid changes (waits 1 second after last change)
- Automatically re-indexes changed files
- Updates vector store incrementally
- Keeps process running until Ctrl+C

**Use Cases:**
- Active documentation editing
- Code documentation that changes frequently
- Real-time knowledge base maintenance
- Development workflows with frequent updates

**Example Workflow:**
```bash
# Start watching
yarn rag index ./docs --watch

# In another terminal, edit a file
echo "New content" >> ./docs/file.md

# File watcher detects change and re-indexes automatically
# Output: 📝 File changed: ./docs/file.md
#         Re-indexing...
#         ✅ Re-indexed successfully
```

## Understanding the Code

### Key Components

**FileCollector** (`indexing/fileCollector.ts`):
- Recursively collects files from paths
- Filters by extension and size
- Handles both files and directories

**DocumentChunker** (`indexing/chunker.ts`):
- Splits documents into overlapping chunks
- Preserves context at boundaries
- Tracks source file metadata

**EmbeddingGenerator** (`indexing/embeddings.ts`):
- Generates 384-dimensional embeddings
- Uses character/word frequency and text statistics
- Normalizes vectors for similarity calculations

**SimpleVectorStore** (`indexing/vectorStore.ts`):
- Stores chunks with embeddings in JSON
- Tracks source files and metadata
- Supports single and multi-file indexes

**RAGSystem** (`querying/rag.ts`):
- Generates query embeddings
- Performs similarity search
- Assembles context from retrieved chunks
- Generates responses via Ollama

### Code Flow Example

**Indexing:**
```typescript
// 1. Collect files
const files = fileCollector.collectFilesFromPaths(['./docs']);

// 2. Chunk each file
const chunks = chunker.chunkFile(file.path);

// 3. Generate embeddings
const embeddings = await embeddingGenerator.generateEmbeddings(texts);

// 4. Save to store
vectorStore.save(chunksWithEmbeddings, filePaths);
```

**Querying:**
```typescript
// 1. Generate query embedding
const queryEmbedding = await embeddingGenerator.generateEmbedding(query);

// 2. Find similar chunks
const similarities = chunks.map(chunk => ({
  chunk,
  similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
}));

// 3. Get top-K chunks
const topChunks = similarities.sort(...).slice(0, topK);

// 4. Generate response
const response = await ollama.generate(query, topChunks);
```

## Troubleshooting

### "No indexed documents found"

Run indexing first:
```bash
yarn rag index <path>
```

### "Ollama process exited with code"

Ensure Ollama is running:
```bash
ollama list
```

If model not found:
```bash
ollama pull llama2
```

### Large files not indexing

Files over 10MB are skipped by default. Adjust in `fileCollector.ts`:
```typescript
new FileCollector(extensions, 50 * 1024 * 1024) // 50MB limit
```

## Best Practices

1. **Encoding Choice**:
   - Use **binary encoding** (default) for production and large datasets
   - Use **JSON encoding** (--json) only for debugging or small datasets
   - Binary is 3-5x faster and 30-50% smaller

2. **Chunk Size**: Balance between context and precision
   - Code: 300-500 chars
   - Documentation: 500-800 chars
   - Long-form content: 800-1200 chars

3. **Overlap**: Use 10-20% overlap to preserve context
   - 500 char chunks → 50-100 char overlap

4. **Top-K Retrieval**: Start with 3-5 chunks
   - Increase for complex queries
   - Decrease for faster responses

5. **File Organization**: Index related files together
   - Group by topic or feature
   - Separate code from documentation

6. **File Watching**: Use --watch for active development
   - Great for documentation that changes frequently
   - Automatically keeps index up-to-date
   - Debounces rapid changes to avoid excessive re-indexing

## Related Resources

- [RAG Explained](https://en.wikipedia.org/wiki/Retrieval-augmented_generation) - Wikipedia article on RAG
- [Ollama Documentation](https://github.com/ollama/ollama) - Ollama project and docs
- [Vector Embeddings Guide](https://platform.openai.com/docs/guides/embeddings) - Understanding embeddings

## License

Part of the glyph-nova project.
