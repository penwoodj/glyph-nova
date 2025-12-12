#!/usr/bin/env node

import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { DocumentChunker } from './indexing/chunker.js';
import { EmbeddingGenerator } from './indexing/embeddings.js';
import { SimpleVectorStore } from './indexing/vectorStore.js';
import { FileCollector } from './indexing/fileCollector.js';
import { RAGSystem } from './querying/rag.js';

/**
 * Enhanced RAG CLI
 *
 * Usage:
 *   rag index <path>              - Index a file, folder, or multiple paths
 *   rag query <query>             - Query the indexed documents
 *
 * Examples:
 *   rag index ./document.txt                    # Single file
 *   rag index ./docs                            # Entire folder
 *   rag index file1.txt file2.md folder/        # Multiple paths
 *   rag query "What is the main topic?"         # Query indexed content
 */

const COMMANDS = {
  INDEX: 'index',
  QUERY: 'query',
};

function printUsage() {
  console.log(`
Usage:
  rag index <path...>           Index file(s), folder(s), or multiple paths
  rag query <query>             Query the indexed documents

Examples:
  rag index ./document.txt                    # Index a single file
  rag index ./docs                            # Index an entire folder
  rag index file1.txt file2.md folder/        # Index multiple files/folders
  rag query "What is the main topic?"         # Query indexed content

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
 */
async function indexDocuments(paths: string[]) {
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
  const storePath = join(storeDir, 'vector-store.json');

  // Ensure store directory exists
  if (!existsSync(storeDir)) {
    mkdirSync(storeDir, { recursive: true });
  }

  // Get absolute paths for all files being indexed
  const absolutePaths = files.map(f => f.absolutePath);

  // Check if already indexed
  const vectorStore = new SimpleVectorStore(storePath);
  if (vectorStore.existsForDocument(absolutePaths)) {
    console.log(`\nAll files already indexed. Use 'rag query' to search them.`);
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
  const embeddingGenerator = new EmbeddingGenerator();

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
  console.log(`   Store: ${storePath}`);
  console.log(`\nYou can now query them with: rag query "your question"`);
}

/**
 * Query the indexed documents
 *
 * This implements the retrieval-augmented generation (RAG) query process:
 * 1. Generate embedding for the query
 * 2. Find most similar chunks using cosine similarity
 * 3. Retrieve top-K most relevant chunks
 * 4. Send chunks + query to LLM (Ollama) for response generation
 *
 * The LLM uses the retrieved context to generate accurate, grounded responses.
 */
async function queryDocuments(query: string) {
  console.log(`\n=== Querying Documents ===\n`);
  console.log(`Query: "${query}"\n`);

  // Setup paths
  const storeDir = join(process.cwd(), '.rag-store');
  const storePath = join(storeDir, 'vector-store.json');

  // Load vector store
  const vectorStore = new SimpleVectorStore(storePath);
  if (!vectorStore.load()) {
    console.error(`Error: No indexed documents found. Run 'rag index <path>' first.`);
    process.exit(1);
  }

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
  const rag = new RAGSystem(vectorStore, 'llama2');

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
      // Support multiple paths: rag index file1.txt file2.md folder/
      await indexDocuments(args.slice(1));
    } else if (command === COMMANDS.QUERY) {
      if (args.length < 2) {
        console.error('Error: Query required');
        printUsage();
        process.exit(1);
      }
      const query = args.slice(1).join(' ');
      await queryDocuments(query);
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
