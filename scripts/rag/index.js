#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { DocumentChunker } from './indexing/chunker.js';
import { EmbeddingGenerator } from './indexing/embeddings.js';
import { createVectorStore } from './indexing/storeInterface.js';
import { FileCollector } from './indexing/fileCollector.js';
import { FileWatcher } from './indexing/fileWatcher.js';
import { RAGSystem } from './querying/rag.js';
import { MetadataExtractor } from './indexing/metadataExtractor.js';
import { HierarchicalChunker } from './indexing/hierarchicalChunker.js';
/**
 * Enhanced RAG CLI
 *
 * Usage:
 *   rag index <path> [--json] [--watch] [--semantic-chunking]  - Index documents
 *   rag query <query> [--json] [--expand-queries] [--rerank] [--expand-context]  - Query indexed documents
 *
 * Examples:
 *   rag index ./document.txt                              # Single file (binary encoding, fast)
 *   rag index ./docs --json                               # Folder with JSON encoding (human-readable)
 *   rag index file1.txt file2.md --watch                 # Multiple files with auto-reindexing
 *   rag index ./docs --semantic-chunking                  # Use semantic chunking (topic-aware)
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
 * Chunking Options:
 *   --semantic-chunking   Use semantic chunking (topic-aware, preserves coherence, 10-15% better retrieval)
 *   --hierarchical        Use hierarchical chunking (child chunks for precision, parent chunks for context)
 *
 * Metadata Options:
 *   --enrich-metadata      Extract rich metadata (type, section, abstraction level, keywords, topics)
 *
 * Query Options:
 *   --expand-queries   Use query expansion with multi-query generation and RRF fusion (improves recall for abstract queries)
 *   --rerank           Use LLM-based reranking to improve precision (better relevance)
 *   --expand-context   Use context expansion with sentence window (±2 sentences) to preserve context across boundaries
 *   --hierarchical     Use hierarchical chunking (retrieve child chunks, include parent chunks for context)
 *   --multi-pass       Use multi-pass retrieval (broad retrieval, extract concepts, focused retrieval per concept)
 *   --hybrid           Use hybrid retrieval (combine semantic search with keyword search BM25)
 */
const COMMANDS = {
    INDEX: 'index',
    QUERY: 'query',
    EVALUATE: 'evaluate',
};
function printUsage() {
    console.log(`
Usage:
  rag index <path...> [--json] [--watch]              Index file(s), folder(s), or multiple paths
  rag query <query> [--json] [--expand-queries]       Query the indexed documents
  rag evaluate [--dataset <file>]                     Evaluate RAG system quality

Options:
  --json              Use JSON encoding (slower but human-readable)
                      Default: Binary encoding (faster and more efficient)
  --watch             Watch indexed files for changes and auto-reindex (index command only)
  --semantic-chunking Use semantic chunking (topic-aware, preserves coherence) (index command only)
                      Improves retrieval quality by 10-15% by preserving topic boundaries
  --hierarchical     Use hierarchical chunking (child chunks for precision, parent for context) (index command only)
                      Balances precision and context by retrieving child chunks and including parent chunks
  --enrich-metadata   Extract rich metadata (type, section, abstraction level, keywords, topics) (index command only)
                      Enables metadata-based filtering for improved precision
  --expand-queries    Use query expansion with multi-query generation and RRF fusion (query command only)
                      Improves recall for abstract queries by generating multiple query variations
  --rerank            Use LLM-based reranking to improve precision (query command only)
                      Retrieves top-20 candidates, reranks to top-5 for better relevance
  --expand-context    Use context expansion with sentence window (±2 sentences) (query command only)
                      Preserves context across chunk boundaries, reduces fragmentation
  --hierarchical      Use hierarchical chunking (query command only)
                      Retrieves child chunks for precision, includes parent chunks for context
  --multi-pass        Use multi-pass retrieval (query command only)
                      Pass 1: Broad retrieval (top-20), Pass 2: Focused retrieval per concept (top-5 each)
  --hybrid            Use hybrid retrieval (query command only)
                      Combines semantic search (vector similarity) with keyword search (BM25) for better recall

Examples:
  rag index ./document.txt                              # Index with binary encoding (fast)
  rag index ./docs --json                               # Index with JSON encoding
  rag index file1.txt file2.md --watch                  # Index with file watching
  rag index ./docs --semantic-chunking                  # Index with semantic chunking (better quality)
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
 * - Semantic chunking (--semantic-chunking flag)
 */
async function indexDocuments(paths, useJson = false, enableWatch = false, useSemanticChunking = false, enrichMetadata = false, useHierarchicalChunking = false) {
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
            await startFileWatcher(absolutePaths, useJson, useSemanticChunking, enrichMetadata);
        }
        return;
    }
    // Generate embeddings for all chunks
    // Embeddings convert text into numerical vectors that capture semantic meaning.
    // Similar texts will have similar embeddings, enabling semantic search.
    // Try Ollama embeddings first (nomic-embed-text), fallback to simple if unavailable
    const embeddingGenerator = new EmbeddingGenerator('llama2', 'nomic-embed-text', 'http://localhost:11434', true);
    // Initialize metadata extractor if enrichment is enabled
    const metadataExtractor = enrichMetadata
        ? new MetadataExtractor('llama2', 'http://localhost:11434', true)
        : null;
    // Process each file: chunk and generate embeddings
    // This is the core RAG indexing pipeline:
    // File → Chunks → Embeddings → (Metadata Enrichment) → Vector Store
    console.log(`[Step 1/3] Chunking documents...`);
    if (useSemanticChunking) {
        console.log(`  Using semantic chunking (topic-aware, preserves coherence)`);
    }
    if (useHierarchicalChunking) {
        console.log(`  Using hierarchical chunking (child chunks for precision, parent chunks for context)`);
    }
    if (enrichMetadata) {
        console.log(`  Metadata enrichment enabled (extracting type, section, abstraction level, keywords, topics)`);
    }
    // VERIFIED: Chunker initialization - confirms chunker created with selected strategy
    const chunker = useHierarchicalChunking
        ? null // Will use HierarchicalChunker instead
        : new DocumentChunker(500, 50, useSemanticChunking, embeddingGenerator);
    const hierarchicalChunker = useHierarchicalChunking
        ? new HierarchicalChunker(250, 1200, 30, 100)
        : null;
    const allChunks = [];
    const fileContents = new Map(); // Store file contents for metadata extraction
    for (const file of files) {
        // VERIFIED: Chunking execution - confirms chunks created (hierarchical, semantic, or fixed-size based on flag)
        let chunks;
        if (useHierarchicalChunking && hierarchicalChunker) {
            const content = readFileSync(file.absolutePath, 'utf-8');
            const hierarchicalChunks = await hierarchicalChunker.chunkDocument(content, file.path, file.absolutePath);
            chunks = hierarchicalChunks.map((c) => ({
                text: c.text,
                startIndex: c.startIndex,
                endIndex: c.endIndex,
                chunkIndex: c.chunkIndex,
                sourceFile: c.sourceFile,
                sourcePath: c.sourcePath,
                parentId: c.parentId,
                childIds: c.childIds,
                isParent: c.isParent,
                isChild: c.isChild,
            }));
            fileContents.set(file.absolutePath, content);
        }
        else if (chunker) {
            chunks = await chunker.chunkFile(file.absolutePath);
        }
        else {
            throw new Error('No chunker available');
        }
        allChunks.push(...chunks);
        console.log(`  ✓ ${file.path}: ${chunks.length} chunks`);
        // Store file content for metadata extraction if enrichment is enabled
        if (enrichMetadata && !useHierarchicalChunking) {
            try {
                const content = readFileSync(file.absolutePath, 'utf-8');
                fileContents.set(file.absolutePath, content);
            }
            catch (error) {
                console.warn(`  Warning: Could not read file content for metadata extraction: ${error.message}`);
            }
        }
    }
    console.log(`\nTotal chunks: ${allChunks.length}`);
    // Generate embeddings for all chunks
    // Embeddings convert text into numerical vectors that capture semantic meaning.
    // Similar texts will have similar embeddings, enabling semantic search.
    console.log(`\n[Step 2/3] Generating embeddings...`);
    const texts = allChunks.map(chunk => chunk.text);
    const embeddings = await embeddingGenerator.generateEmbeddings(texts);
    // VERIFIED: Metadata enrichment - confirms metadata extracted if enrichment enabled
    // Enrich metadata if enabled
    let chunksWithEmbeddings;
    if (enrichMetadata && metadataExtractor) {
        console.log(`\n[Step 2.5/3] Enriching metadata...`);
        // Extract enriched metadata for each chunk
        const enrichedChunks = await Promise.all(allChunks.map(async (chunk, i) => {
            const documentContent = chunk.sourcePath ? fileContents.get(chunk.sourcePath) : undefined;
            const enrichedMetadata = await metadataExtractor.extractMetadata(chunk.text, chunk.sourcePath || '', chunk.startIndex, chunk.endIndex, chunk.chunkIndex, documentContent);
            return {
                text: chunk.text,
                embedding: embeddings[i],
                metadata: {
                    ...enrichedMetadata,
                    // Preserve hierarchical chunking metadata if present
                    ...(chunk.parentId && { parentId: chunk.parentId }),
                    ...(chunk.childIds && { childIds: chunk.childIds }),
                    ...(chunk.isParent !== undefined && { isParent: chunk.isParent }),
                    ...(chunk.isChild !== undefined && { isChild: chunk.isChild }),
                },
            };
        }));
        chunksWithEmbeddings = enrichedChunks;
    }
    else {
        // Combine chunks with embeddings and basic metadata
        // Each chunk now has:
        // - The original text
        // - Its embedding vector (for similarity search)
        // - Metadata (source file, position, etc.)
        chunksWithEmbeddings = allChunks.map((chunk, i) => ({
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
    }
    // Save to vector store
    // The vector store is a JSON file containing all chunks with their embeddings.
    // This allows fast retrieval during querying without re-processing files.
    console.log(`\n[Step ${enrichMetadata ? '3' : '3'}/3] Saving to vector store...`);
    vectorStore.save(chunksWithEmbeddings, absolutePaths);
    console.log(`\n✅ Documents indexed successfully!`);
    console.log(`   Files: ${files.length}`);
    console.log(`   Chunks: ${chunksWithEmbeddings.length}`);
    console.log(`   Encoding: ${encodingType}`);
    console.log(`   Store: ${storePath}`);
    if (enableWatch) {
        console.log(`\n👀 File watching enabled - monitoring for changes...`);
        await startFileWatcher(absolutePaths, useJson, useSemanticChunking, enrichMetadata, useHierarchicalChunking);
    }
    else {
        console.log(`\nYou can now query them with: rag query "your question"`);
    }
}
/**
 * Re-index a single file (used by file watcher)
 *
 * This is a simplified version that only re-indexes one file
 * without starting a new watcher or checking if already indexed.
 */
async function reindexSingleFile(filePath, useJson, storeDir, useSemanticChunking = false, enrichMetadata = false, useHierarchicalChunking = false) {
    const fileCollector = new FileCollector();
    const files = fileCollector.collectFiles(filePath);
    if (files.length === 0) {
        return; // File not supported or doesn't exist
    }
    // Try Ollama embeddings first (nomic-embed-text), fallback to simple if unavailable
    const embeddingGenerator = new EmbeddingGenerator('llama2', 'nomic-embed-text', 'http://localhost:11434', true);
    const metadataExtractor = enrichMetadata
        ? new MetadataExtractor('llama2', 'http://localhost:11434', true)
        : null;
    const chunker = useHierarchicalChunking
        ? null
        : new DocumentChunker(500, 50, useSemanticChunking, embeddingGenerator);
    const hierarchicalChunker = useHierarchicalChunking
        ? new HierarchicalChunker(250, 1200, 30, 100)
        : null;
    const vectorStore = createVectorStore(storeDir, useJson);
    // Load existing store to get all file paths
    vectorStore.load();
    const existingPaths = vectorStore.getDocumentPath();
    const allPaths = Array.isArray(existingPaths)
        ? [...existingPaths.filter(p => p !== filePath), filePath]
        : [filePath];
    // Chunk the file
    const allChunks = [];
    let fileContent;
    for (const file of files) {
        let chunks;
        if (useHierarchicalChunking && hierarchicalChunker) {
            const content = readFileSync(file.absolutePath, 'utf-8');
            const hierarchicalChunks = await hierarchicalChunker.chunkDocument(content, file.path, file.absolutePath);
            chunks = hierarchicalChunks.map((c) => ({
                text: c.text,
                startIndex: c.startIndex,
                endIndex: c.endIndex,
                chunkIndex: c.chunkIndex,
                sourceFile: c.sourceFile,
                sourcePath: c.sourcePath,
                parentId: c.parentId,
                childIds: c.childIds,
                isParent: c.isParent,
                isChild: c.isChild,
            }));
            fileContent = content;
        }
        else if (chunker) {
            chunks = await chunker.chunkFile(file.absolutePath);
            if (enrichMetadata) {
                try {
                    fileContent = readFileSync(file.absolutePath, 'utf-8');
                }
                catch (error) {
                    console.warn(`Warning: Could not read file content for metadata extraction: ${error.message}`);
                }
            }
        }
        else {
            throw new Error('No chunker available');
        }
        allChunks.push(...chunks);
    }
    // Generate embeddings
    const texts = allChunks.map(chunk => chunk.text);
    const embeddings = await embeddingGenerator.generateEmbeddings(texts);
    // Combine chunks with embeddings and metadata
    let chunksWithEmbeddings;
    if (enrichMetadata && metadataExtractor && fileContent) {
        const enrichedChunks = await Promise.all(allChunks.map(async (chunk, i) => {
            const enrichedMetadata = await metadataExtractor.extractMetadata(chunk.text, chunk.sourcePath || '', chunk.startIndex, chunk.endIndex, chunk.chunkIndex, fileContent);
            return {
                text: chunk.text,
                embedding: embeddings[i],
                metadata: {
                    ...enrichedMetadata,
                    // Preserve hierarchical chunking metadata if present
                    ...(chunk.parentId && { parentId: chunk.parentId }),
                    ...(chunk.childIds && { childIds: chunk.childIds }),
                    ...(chunk.isParent !== undefined && { isParent: chunk.isParent }),
                    ...(chunk.isChild !== undefined && { isChild: chunk.isChild }),
                },
            };
        }));
        chunksWithEmbeddings = enrichedChunks;
    }
    else {
        chunksWithEmbeddings = allChunks.map((chunk, i) => ({
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
    }
    // Get all existing chunks and replace ones from this file
    const existingChunks = vectorStore.getChunks();
    const otherChunks = existingChunks.filter(chunk => chunk.metadata.sourceFile !== filePath && chunk.metadata.sourcePath !== filePath);
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
async function startFileWatcher(filePaths, useJson, useSemanticChunking = false, enrichMetadata = false, useHierarchicalChunking = false) {
    const storeDir = join(process.cwd(), '.rag-store');
    const watcher = new FileWatcher(async (changedPath) => {
        console.log(`\n📝 File changed: ${changedPath}`);
        console.log(`   Re-indexing...`);
        try {
            // Re-index just the changed file (without starting new watcher)
            await reindexSingleFile(changedPath, useJson, storeDir, useSemanticChunking, enrichMetadata, useHierarchicalChunking);
            console.log(`   ✅ Re-indexed successfully`);
        }
        catch (error) {
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
    return new Promise(() => { }); // Never resolves, keeps process alive
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
 * Supports context expansion with sentence window to preserve context across boundaries.
 */
async function queryDocuments(query, useJson, expandQueries = false, useReranking = false, useContextExpansion = false, useHierarchical = false, useMultiPass = false, useHybrid = false) {
    console.log(`\n=== Querying Documents ===\n`);
    console.log(`Query: "${query}"\n`);
    // Setup paths
    const storeDir = join(process.cwd(), '.rag-store');
    const jsonPath = join(storeDir, 'vector-store.json');
    const binaryPath = join(storeDir, 'vector-store.bin');
    // Auto-detect encoding if not specified
    let encodingType;
    if (useJson !== undefined) {
        encodingType = useJson ? 'json' : 'binary';
    }
    else {
        // Auto-detect: prefer binary if both exist, otherwise use what exists
        const jsonExists = existsSync(jsonPath);
        const binaryExists = existsSync(binaryPath);
        if (binaryExists && !jsonExists) {
            encodingType = 'binary';
        }
        else if (jsonExists && !binaryExists) {
            encodingType = 'json';
        }
        else if (binaryExists && jsonExists) {
            // Both exist - prefer binary (faster)
            encodingType = 'binary';
        }
        else {
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
    // - Optional context expansion with sentence window
    // - Optional hierarchical chunking (retrieve child chunks, include parent chunks)
    // - Optional multi-pass retrieval (broad retrieval + focused retrieval per concept)
    // - Optional hybrid retrieval (semantic + keyword search)
    const rag = new RAGSystem(vectorStore, 'llama2', expandQueries, 3, useReranking, useContextExpansion, 2, useHierarchical, useMultiPass, useHybrid);
    if (expandQueries) {
        console.log(`Query expansion enabled: Will generate multiple query variations and fuse results\n`);
    }
    if (useReranking) {
        console.log(`Reranking enabled: Will rerank top-20 candidates to top-5 for improved precision\n`);
    }
    if (useContextExpansion) {
        console.log(`Context expansion enabled: Will expand chunks with ±2 surrounding sentences\n`);
    }
    if (useHierarchical) {
        console.log(`Hierarchical chunking enabled: Will retrieve child chunks and include parent chunks for context\n`);
    }
    if (useMultiPass) {
        console.log(`Multi-pass retrieval enabled: Will perform broad retrieval, extract concepts, then focused retrieval\n`);
    }
    if (useHybrid) {
        console.log(`Hybrid retrieval enabled: Will combine semantic search with keyword search (BM25)\n`);
    }
    // Query
    try {
        // topK=3 means we retrieve the 3 most similar chunks
        // This balances context richness with prompt size limits
        const response = await rag.query(query, 3);
        console.log(`\n=== Response ===\n`);
        console.log(response);
        console.log(`\n`);
    }
    catch (error) {
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
            const paths = [];
            let useJson = false;
            let enableWatch = false;
            let useSemanticChunking = false;
            let enrichMetadata = false;
            let useHierarchicalChunking = false;
            for (let i = 1; i < args.length; i++) {
                const arg = args[i];
                if (arg === '--json') {
                    useJson = true;
                }
                else if (arg === '--watch') {
                    enableWatch = true;
                }
                else if (arg === '--semantic-chunking') {
                    useSemanticChunking = true;
                }
                else if (arg === '--enrich-metadata') {
                    enrichMetadata = true;
                }
                else if (arg === '--hierarchical') {
                    useHierarchicalChunking = true;
                }
                else {
                    paths.push(arg);
                }
            }
            if (paths.length === 0) {
                console.error('Error: At least one path required');
                printUsage();
                process.exit(1);
            }
            await indexDocuments(paths, useJson, enableWatch, useSemanticChunking, enrichMetadata, useHierarchicalChunking);
        }
        else if (command === COMMANDS.QUERY) {
            if (args.length < 2) {
                console.error('Error: Query required');
                printUsage();
                process.exit(1);
            }
            // Parse flags
            const queryParts = [];
            let useJson = undefined;
            let expandQueries = false;
            let useReranking = false;
            let useContextExpansion = false;
            let useHierarchical = false;
            let useMultiPass = false;
            let useHybrid = false;
            for (let i = 1; i < args.length; i++) {
                const arg = args[i];
                if (arg === '--json') {
                    useJson = true;
                }
                else if (arg === '--expand-queries') {
                    expandQueries = true;
                }
                else if (arg === '--rerank') {
                    useReranking = true;
                }
                else if (arg === '--expand-context') {
                    useContextExpansion = true;
                }
                else if (arg === '--hierarchical') {
                    useHierarchical = true;
                }
                else if (arg === '--multi-pass') {
                    useMultiPass = true;
                }
                else if (arg === '--hybrid') {
                    useHybrid = true;
                }
                else {
                    queryParts.push(arg);
                }
            }
            if (queryParts.length === 0) {
                console.error('Error: Query required');
                printUsage();
                process.exit(1);
            }
            const query = queryParts.join(' ');
            await queryDocuments(query, useJson, expandQueries, useReranking, useContextExpansion, useHierarchical, useMultiPass, useHybrid);
        }
        else if (command === COMMANDS.EVALUATE) {
            // Evaluation command - for now, just a placeholder
            // Full evaluation framework would require evaluation dataset
            console.log(`\n=== RAG System Evaluation ===\n`);
            console.log(`Evaluation framework is implemented but requires an evaluation dataset.`);
            console.log(`To use evaluation:`);
            console.log(`  1. Create an evaluation dataset with queries and relevant chunk IDs`);
            console.log(`  2. Use the RAGEvaluator class programmatically`);
            console.log(`\nEvaluation metrics available:`);
            console.log(`  - Retrieval: Precision@K, Recall@K, MRR`);
            console.log(`  - Generation: Faithfulness, Answer Relevance (LLM-as-judge)`);
            console.log(`\nSee: scripts/rag/evaluation/ for implementation details.`);
        }
        else {
            console.error(`Error: Unknown command "${command}"`);
            printUsage();
            process.exit(1);
        }
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        if (error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}
main();
