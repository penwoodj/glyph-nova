import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Simple file-based vector store
 * Stores embeddings and metadata for document chunks
 */
/**
 * Enhanced Chunk interface for vector store
 *
 * This extends the basic chunk with embedding and richer metadata.
 * The metadata helps with:
 * - Retrieval: Knowing which file a chunk came from
 * - Context: Providing source information in responses
 * - Debugging: Tracing where retrieved information originated
 */
export interface Chunk {
  text: string;
  embedding: number[];
  metadata: {
    startIndex: number;
    endIndex: number;
    chunkIndex: number;
    sourceFile?: string; // File path for this chunk
    sourcePath?: string; // Full absolute path
    // Enriched metadata (optional, added by MetadataExtractor)
    documentType?: string; // e.g., 'markdown', 'typescript', 'python'
    section?: string; // Markdown header or section name
    abstractionLevel?: 'high' | 'medium' | 'low'; // Classification of abstraction level
    keywords?: string[]; // Extracted keywords
    topics?: string[]; // Extracted topics
    timestamp?: string; // Document modification time
    author?: string; // Document author (if available)
    version?: string; // Document version (if available)
    // Hierarchical chunking metadata (optional)
    parentId?: string; // ID of parent chunk (if this is a child)
    childIds?: string[]; // IDs of child chunks (if this is a parent)
    isParent?: boolean; // Whether this is a parent chunk
    isChild?: boolean; // Whether this is a child chunk
  };
}

/**
 * Vector Store structure
 *
 * Stores all indexed chunks with their embeddings and metadata.
 * Can store chunks from multiple files (multi-file indexing).
 */
export interface VectorStore {
  chunks: Chunk[];
  documentPath: string | string[]; // Can be single file or array of files
  indexedAt: string;
  fileCount?: number; // Number of files indexed
  totalChunks?: number; // Total number of chunks
}

export class SimpleVectorStore {
  private storePath: string;
  private store: VectorStore | null = null;

  constructor(storePath: string) {
    this.storePath = storePath;
  }

  /**
   * Load existing vector store from disk
   */
  load(): boolean {
    if (!existsSync(this.storePath)) {
      // console.log(`[VectorStore] No existing store found at ${this.storePath}`);
      return false;
    }

    try {
      const data = readFileSync(this.storePath, 'utf-8');
      this.store = JSON.parse(data);
      // console.log(`[VectorStore] Loaded ${this.store!.chunks.length} chunks from store`);
      return true;
    } catch (error) {
      console.error(`[VectorStore] Error loading store: ${error}`);
      return false;
    }
  }

  /**
   * Save vector store to disk
   *
   * Enhanced to support multiple files and additional metadata.
   * This allows the store to track which files were indexed,
   * making it easier to manage and update the index.
   */
  save(chunks: Chunk[], documentPath: string | string[]): void {
    const uniqueFiles = Array.isArray(documentPath)
      ? [...new Set(documentPath)]
      : [documentPath];

    this.store = {
      chunks,
      documentPath: uniqueFiles.length === 1 ? uniqueFiles[0] : uniqueFiles,
      indexedAt: new Date().toISOString(),
      fileCount: uniqueFiles.length,
      totalChunks: chunks.length,
    };

    try {
      writeFileSync(this.storePath, JSON.stringify(this.store, null, 2), 'utf-8');
      // console.log(`[VectorStore] Saved ${chunks.length} chunks from ${uniqueFiles.length} file(s) to ${this.storePath}`);
    } catch (error) {
      console.error(`[VectorStore] Error saving store: ${error}`);
      throw error;
    }
  }

  /**
   * Get all chunks from store
   */
  getChunks(): Chunk[] {
    if (!this.store) {
      throw new Error('Store not loaded. Call load() first.');
    }
    return this.store.chunks;
  }

  /**
   * Check if store exists and matches document(s)
   *
   * Enhanced to handle both single files and multiple files.
   * For multiple files, checks if all files are already indexed.
   */
  existsForDocument(documentPath: string | string[]): boolean {
    if (!existsSync(this.storePath)) {
      return false;
    }

    if (!this.store) {
      this.load();
    }

    if (!this.store) {
      return false;
    }

    const pathsToCheck = Array.isArray(documentPath) ? documentPath : [documentPath];
    const storedPaths = Array.isArray(this.store.documentPath)
      ? this.store.documentPath
      : [this.store.documentPath];

    // Check if all paths to index are already in the store
    return pathsToCheck.every(path => storedPaths.includes(path));
  }

  /**
   * Get document path(s) from store
   *
   * Returns the path(s) that were indexed. Can be a single string
   * or an array of strings for multi-file indexes.
   */
  getDocumentPath(): string | string[] | null {
    if (!this.store) {
      return null;
    }
    return this.store.documentPath;
  }
}
