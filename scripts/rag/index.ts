#!/usr/bin/env node

import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { DocumentChunker } from './indexing/chunker.js';
import { EmbeddingGenerator } from './indexing/embeddings.js';
import { createVectorStore } from './indexing/storeInterface.js';
import { FileCollector } from './indexing/fileCollector.js';
import { FileWatcher } from './indexing/fileWatcher.js';
import { RAGSystem } from './querying/rag.js';

/**
 * Enhanced RAG CLI
 *
 * Usage:
 *   rag index <path> [--json] [--watch]              - Index documents (--json for JSON encoding, --watch for file watching)
 *   rag query <query> [--json] [--expand-queries]    - Query indexed documents (--json if using JSON encoding, --expand-queries for multi-query retrieval)
 *
 * Examples:
 *   rag index ./document.txt                              # Single file (binary encoding, fast)
 *   rag index ./docs --json                               # Folder with JSON encoding (human-readable)
 *   rag index file1.txt file2.md --watch                 # Multiple files with auto-reindexing
 *   rag query "What is the main topic?"                  # Query (auto-detects encoding)
 *   rag query "What is the main topic?" --expand-queries  # Query with query expansion (improves recall)
 *
 * Encoding Options:
 *   --json    Use JSON encoding (slower, human-readable, easier to debug)
 *   (default) Use binary encoding (faster, more efficient, smaller files)
 *
 * File Watching:
 *   --watch   Monitor indexed files for changes and auto-reindex
 *
 * Query Options:
 *   --expand-queries   Use query expansion with multi-query generation and RRF fusion (improves recall for abstract queries)
 */

const COMMANDS = {
  INDEX: 'index',
  QUERY: 'query',
};

function printUsage() {
  console.log(`
Usage:
  rag index <path...> [--json] [--watch]              Index file(s), folder(s), or multiple paths
  rag query <query> [--json] [--expand-queries]       Query the indexed documents

Options:
  --json            Use JSON encoding (slower but human-readable)
            Default: Binary encoding (faster and more efficient)
  --watch           Watch indexed files for changes and auto-reindex (index command only)
  --expand-queries  Use query expansion with multi-query generation and RRF fusion (query command only)
                    Improves recall for abstract queries by generating multiple query variations
  --rerank          Use LLM-based reranking to improve precision (query command only)
                    Retrieves top-20 candidates, reranks to top-5 for better relevance

Examples:
  rag index ./document.txt                              # Index with binary encoding (fast)
  rag index ./docs --json                               # Index with JSON encoding
  rag index file1.txt file2.md --watch                  # Index with file watching
  rag query "What is the main topic?"                              # Query (auto-detects encoding)
  rag query "What is the main topic?" --expand-queries              # Query with expansion (better recall)
  rag query "What is the main topic?" --rerank                      # Query with reranking (better precision)
  rag query "What is the main topic?" --expand-queries --rerank     # Query with both (best results)

Supported file types: .txt, .md, .js, .ts, .json, .py, .java, .cpp, .c, .h
`);
}

/**
 * Index one or more files/folders
 *
 * This is the core indexing function that:
 * 1. Collects all files from the provided paths
 * 2. Chunks each file into smaller pieces
 * 3. Generates embeddings for each chunk
 * 4. Stores everything in the vector database
 *
 * Supports:
 * - Single files
 * - Folders (recursive)
 * - Multiple paths at once
 * - JSON or binary encoding (--json flag)
 * - File watching for auto-reindexing (--watch flag)
 */
async function indexDocuments(paths: string[], useJson: boolean = false, enableWatch: boolean = false) {
  console.log(`\n=== Indexing Documents ===\n`);
  console.log(`Paths: ${paths.join(', ')}\n`);

  // Resolve paths relative to project root (parent of scripts/rag)
  // This allows the yarn rag command to work from project root
  const projectRoot = resolve(process.cwd(), '..', '..');
  const resolvedPaths = paths.map(p => {
    // If path is relative and doesn't exist, try resolving from project root
    const resolved = resolve(p);
    if (!existsSync(resolved)) {
      const fromRoot = resolve(projectRoot, p);
      if (existsSync(fromRoot)) {
        return fromRoot;
      }
    }
    return resolved;
  });

  // Collect all files from the provided paths
  // FileCollector handles both files and folders, and can process
  // multiple paths in one go. It filters by file type and size.
  const fileCollector = new FileCollector();
  const files = fileCollector.collectFilesFromPaths(resolvedPaths);

  if (files.length === 0) {
    console.error(`Error: No supported files found in the provided paths.`);
    console.error(`Supported extensions: .txt, .md, .js, .ts, .json, .py, .java, .cpp, .c, .h`);
    process.exit(1);
  }

  console.log(`Found ${files.length} file(s) to index\n`);

  // Setup paths
  const storeDir = join(process.cwd(), '.rag-store');

  // Ensure store directory exists
  if (!existsSync(storeDir)) {
    mkdirSync(storeDir, { recursive: true });
  }

  // Get absolute paths for all files being indexed
  const absolutePaths = files.map(f => f.absolutePath);

  // Create vector store (JSON or binary based on flag)
  const vectorStore = createVectorStore(storeDir, useJson);
  const encodingType = useJson ? 'JSON' : 'Binary';
  const storePath = useJson
    ? join(storeDir, 'vector-store.json')
    : join(storeDir, 'vector-store.bin');

  // Check if already indexed
  if (vectorStore.existsForDocument(absolutePaths)) {
    console.log(`\nAll files already indexed (${encodingType} encoding). Use 'rag query' to search them.`);

    // If watching is enabled, start watching even if already indexed
    if (enableWatch) {
      await startFileWatcher(absolutePaths, useJson);
    }
    return;
  }

  // Process each file: chunk and generate embeddings
  // This is the core RAG indexing pipeline:
  // File → Chunks → Embeddings → Vector Store
  console.log(`[Step 1/3] Chunking documents...`);
  const chunker = new DocumentChunker(500, 50); // 500 char chunks with 50 char overlap
  const allChunks: Array<{ text: string; sourceFile?: string; sourcePath?: string; startIndex: number; endIndex: number; chunkIndex: number }> = [];

  for (const file of files) {
    const chunks = chunker.chunkFile(file.absolutePath);
    allChunks.push(...chunks);
    console.log(`  ✓ ${file.path}: ${chunks.length} chunks`);
  }

  console.log(`\nTotal chunks: ${allChunks.length}`);

  // Generate embeddings for all chunks
  // Embeddings convert text into numerical vectors that capture semantic meaning.
  // Similar texts will have similar embeddings, enabling semantic search.
  console.log(`\n[Step 2/3] Generating embeddings...`);
  // Try Ollama embeddings first (nomic-embed-text), fallback to simple if unavailable
  const embeddingGenerator = new EmbeddingGenerator('llama2', 'nomic-embed-text', 'http://localhost:11434', true);

  const texts = allChunks.map(chunk => chunk.text);
  const embeddings = await embeddingGenerator.generateEmbeddings(texts);

  // Combine chunks with embeddings and metadata
  // Each chunk now has:
  // - The original text
  // - Its embedding vector (for similarity search)
  // - Metadata (source file, position, etc.)
  const chunksWithEmbeddings = allChunks.map((chunk, i) => ({
    text: chunk.text,
    embedding: embeddings[i],
    metadata: {
      startIndex: chunk.startIndex,
      endIndex: chunk.endIndex,
      chunkIndex: chunk.chunkIndex,
      sourceFile: chunk.sourceFile,
      sourcePath: chunk.sourcePath,
    },
  }));

  // Save to vector store
  // The vector store is a JSON file containing all chunks with their embeddings.
  // This allows fast retrieval during querying without re-processing files.
  console.log(`\n[Step 3/3] Saving to vector store...`);
  vectorStore.save(chunksWithEmbeddings, absolutePaths);

  console.log(`\n✅ Documents indexed successfully!`);
  console.log(`   Files: ${files.length}`);
  console.log(`   Chunks: ${chunksWithEmbeddings.length}`);
  console.log(`   Encoding: ${encodingType}`);
  console.log(`   Store: ${storePath}`);

  if (enableWatch) {
    console.log(`\n👀 File watching enabled - monitoring for changes...`);
    await startFileWatcher(absolutePaths, useJson);
  } else {
    console.log(`\nYou can now query them with: rag query "your question"`);
  }
}

/**
 * Re-index a single file (used by file watcher)
 *
 * This is a simplified version that only re-indexes one file
 * without starting a new watcher or checking if already indexed.
 */
async function reindexSingleFile(filePath: string, useJson: boolean, storeDir: string): Promise<void> {
  const fileCollector = new FileCollector();
  const files = fileCollector.collectFiles(filePath);

  if (files.length === 0) {
    return; // File not supported or doesn't exist
  }

  const chunker = new DocumentChunker(500, 50);
  // Try Ollama embeddings first (nomic-embed-text), fallback to simple if unavailable
  const embeddingGenerator = new EmbeddingGenerator('llama2', 'nomic-embed-text', 'http://localhost:11434', true);
  const vectorStore = createVectorStore(storeDir, useJson);

  // Load existing store to get all file paths
  vectorStore.load();
  const existingPaths = vectorStore.getDocumentPath();
  const allPaths = Array.isArray(existingPaths)
    ? [...existingPaths.filter(p => p !== filePath), filePath]
    : [filePath];

  // Chunk the file
  const allChunks: Array<{ text: string; sourceFile?: string; sourcePath?: string; startIndex: number; endIndex: number; chunkIndex: number }> = [];
  for (const file of files) {
    const chunks = chunker.chunkFile(file.absolutePath);
    allChunks.push(...chunks);
  }

  // Generate embeddings
  const texts = allChunks.map(chunk => chunk.text);
  const embeddings = await embeddingGenerator.generateEmbeddings(texts);

  // Combine chunks with embeddings
  const chunksWithEmbeddings = allChunks.map((chunk, i) => ({
    text: chunk.text,
    embedding: embeddings[i],
    metadata: {
      startIndex: chunk.startIndex,
      endIndex: chunk.endIndex,
      chunkIndex: chunk.chunkIndex,
      sourceFile: chunk.sourceFile,
      sourcePath: chunk.sourcePath,
    },
  }));

  // Get all existing chunks and replace ones from this file
  const existingChunks = vectorStore.getChunks();
  const otherChunks = existingChunks.filter(
    chunk => chunk.metadata.sourceFile !== filePath && chunk.metadata.sourcePath !== filePath
  );

  // Combine: other chunks + new chunks from this file
  const updatedChunks = [...otherChunks, ...chunksWithEmbeddings];

  // Save updated store
  vectorStore.save(updatedChunks, allPaths);
}

/**
 * Start file watcher for auto-reindexing
 *
 * Monitors indexed files for changes and automatically re-indexes them.
 * This keeps the vector store up-to-date as you edit documents.
 */
async function startFileWatcher(filePaths: string[], useJson: boolean): Promise<void> {
  const storeDir = join(process.cwd(), '.rag-store');

  const watcher = new FileWatcher(async (changedPath: string) => {
    console.log(`\n📝 File changed: ${changedPath}`);
    console.log(`   Re-indexing...`);

    try {
      // Re-index just the changed file (without starting new watcher)
      await reindexSingleFile(changedPath, useJson, storeDir);
      console.log(`   ✅ Re-indexed successfully`);
    } catch (error: any) {
      console.error(`   ❌ Error re-indexing: ${error.message}`);
    }
  }, {
    debounceMs: 1000, // Wait 1 second after last change before re-indexing
  });

  // Watch all indexed files
  watcher.watchFiles(filePaths);

  console.log(`\nPress Ctrl+C to stop watching...`);

  // Keep process alive
  process.on('SIGINT', () => {
    console.log(`\n\nStopping file watcher...`);
    watcher.stop();
    process.exit(0);
  });

  // Keep process running
  return new Promise(() => {}); // Never resolves, keeps process alive
}

/**
 * Query the indexed documents
 *
 * This implements the retrieval-augmented generation (RAG) query process:
 * 1. Generate embedding for the query (or expand to multiple queries)
 * 2. Find most similar chunks using cosine similarity (or fuse multiple result sets with RRF)
 * 3. Retrieve top-K most relevant chunks
 * 4. Send chunks + query to LLM (Ollama) for response generation
 *
 * The LLM uses the retrieved context to generate accurate, grounded responses.
 *
 * Auto-detects encoding format (JSON or binary) based on which file exists.
 * Supports query expansion with multi-query generation and RRF fusion for improved recall.
 */
async function queryDocuments(query: string, useJson?: boolean, expandQueries: boolean = false, useReranking: boolean = false) {
  console.log(`\n=== Querying Documents ===\n`);
  console.log(`Query: "${query}"\n`);

  // Setup paths
  const storeDir = join(process.cwd(), '.rag-store');
  const jsonPath = join(storeDir, 'vector-store.json');
  const binaryPath = join(storeDir, 'vector-store.bin');

  // Auto-detect encoding if not specified
  let encodingType: 'json' | 'binary';
  if (useJson !== undefined) {
    encodingType = useJson ? 'json' : 'binary';
  } else {
    // Auto-detect: prefer binary if both exist, otherwise use what exists
    const jsonExists = existsSync(jsonPath);
    const binaryExists = existsSync(binaryPath);

    if (binaryExists && !jsonExists) {
      encodingType = 'binary';
    } else if (jsonExists && !binaryExists) {
      encodingType = 'json';
    } else if (binaryExists && jsonExists) {
      // Both exist - prefer binary (faster)
      encodingType = 'binary';
    } else {
      console.error(`Error: No indexed documents found. Run 'rag index <path>' first.`);
      process.exit(1);
      return; // TypeScript guard
    }
  }

  // Load vector store with detected/specified encoding
  const vectorStore = createVectorStore(storeDir, encodingType === 'json');
  if (!vectorStore.load()) {
    console.error(`Error: Could not load vector store. Run 'rag index <path>' first.`);
    process.exit(1);
  }

  console.log(`Using ${encodingType} encoding\n`);

  const documentPaths = vectorStore.getDocumentPath();
  if (documentPaths) {
    const paths = Array.isArray(documentPaths) ? documentPaths : [documentPaths];
    console.log(`Indexed ${paths.length} file(s):`);
    paths.forEach((path, i) => console.log(`  ${i + 1}. ${path}`));
    console.log();
  }

  // Initialize RAG system
  // RAGSystem handles the retrieval and generation:
  // - Embedding generation for queries
  // - Similarity search in vector store
  // - Context assembly
  // - LLM response generation via Ollama
  // - Optional query expansion with RRF fusion
  // - Optional reranking for improved precision
  const rag = new RAGSystem(vectorStore, 'llama2', expandQueries, 3, useReranking);

  if (expandQueries) {
    console.log(`Query expansion enabled: Will generate multiple query variations and fuse results\n`);
  }
  if (useReranking) {
    console.log(`Reranking enabled: Will rerank top-20 candidates to top-5 for improved precision\n`);
  }

  // Query
  try {
    // topK=3 means we retrieve the 3 most similar chunks
    // This balances context richness with prompt size limits
    const response = await rag.query(query, 3);

    console.log(`\n=== Response ===\n`);
    console.log(response);
    console.log(`\n`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const command = args[0];

  try {
    if (command === COMMANDS.INDEX) {
      if (args.length < 2) {
        console.error('Error: At least one path required');
        printUsage();
        process.exit(1);
      }

      // Parse flags
      const paths: string[] = [];
      let useJson = false;
      let enableWatch = false;

      for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--json') {
          useJson = true;
        } else if (arg === '--watch') {
          enableWatch = true;
        } else {
          paths.push(arg);
        }
      }

      if (paths.length === 0) {
        console.error('Error: At least one path required');
        printUsage();
        process.exit(1);
      }

      await indexDocuments(paths, useJson, enableWatch);
    } else if (command === COMMANDS.QUERY) {
      if (args.length < 2) {
        console.error('Error: Query required');
        printUsage();
        process.exit(1);
      }

      // Parse flags
      const queryParts: string[] = [];
      let useJson: boolean | undefined = undefined;
      let expandQueries = false;
      let useReranking = false;

      for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--json') {
          useJson = true;
        } else if (arg === '--expand-queries') {
          expandQueries = true;
        } else if (arg === '--rerank') {
          useReranking = true;
        } else {
          queryParts.push(arg);
        }
      }

      if (queryParts.length === 0) {
        console.error('Error: Query required');
        printUsage();
        process.exit(1);
      }

      const query = queryParts.join(' ');
      await queryDocuments(query, useJson, expandQueries, useReranking);
    } else {
      console.error(`Error: Unknown command "${command}"`);
      printUsage();
      process.exit(1);
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
