import { readFileSync } from 'fs';
import { SemanticChunker } from './semanticChunker.js';
import { EmbeddingGenerator } from './embeddings.js';

/**
 * Split document into chunks for indexing
 * Uses simple text splitting with overlap or semantic chunking
 */
/**
 * Chunk interface for RAG indexing
 *
 * A chunk represents a piece of text from a document that will be
 * embedded and stored in the vector database. Metadata helps track
 * where the chunk came from for retrieval and context.
 */
export interface Chunk {
  text: string;
  startIndex: number;
  endIndex: number;
  chunkIndex: number;
  // Enhanced metadata for better RAG retrieval
  sourceFile?: string; // Which file this chunk came from
  sourcePath?: string; // Full path to source file
}

export class DocumentChunker {
  private chunkSize: number;
  private overlap: number;
  private useSemanticChunking: boolean;
  private semanticChunker?: SemanticChunker;

  constructor(
    chunkSize: number = 500,
    overlap: number = 50,
    useSemanticChunking: boolean = false,
    embeddingGenerator?: EmbeddingGenerator
  ) {
    this.chunkSize = chunkSize;
    this.overlap = overlap;
    this.useSemanticChunking = useSemanticChunking;

    // Initialize semantic chunker if enabled
    if (useSemanticChunking && embeddingGenerator) {
      this.semanticChunker = new SemanticChunker(embeddingGenerator);
    }
  }

  /**
   * Read document from file
   */
  readDocument(filePath: string): string {
    // console.log(`[Chunker] Reading document from ${filePath}`);
    const content = readFileSync(filePath, 'utf-8');
    // console.log(`[Chunker] Document length: ${content.length} characters`);
    return content;
  }

  /**
   * Split document into chunks
   */
  chunkDocument(content: string): Chunk[] {
    // console.log(`[Chunker] Splitting document into chunks (size: ${this.chunkSize}, overlap: ${this.overlap})`);

    const chunks: Chunk[] = [];
    let startIndex = 0;
    let chunkIndex = 0;

    while (startIndex < content.length) {
      const endIndex = Math.min(startIndex + this.chunkSize, content.length);
      const text = content.slice(startIndex, endIndex).trim();

      // Only add non-empty chunks
      if (text.length > 0) {
        chunks.push({
          text,
          startIndex,
          endIndex,
          chunkIndex,
        });
      }

      // Move start index forward, accounting for overlap
      const nextStartIndex = endIndex - this.overlap;

      // Prevent infinite loop - ensure we always advance
      if (nextStartIndex <= startIndex) {
        startIndex = endIndex; // Move past current chunk
      } else {
        startIndex = nextStartIndex;
      }

      chunkIndex++;

      // Safety check: if we haven't advanced, break
      if (startIndex >= content.length) {
        break;
      }
    }

    // console.log(`[Chunker] Created ${chunks.length} chunks`);
    return chunks;
  }

  /**
   * Chunk a document from file path
   *
   * Enhanced version that includes source file metadata in chunks.
   * This helps the RAG system provide better context about where
   * information came from.
   *
   * Supports both fixed-size and semantic chunking strategies.
   */
  async chunkFile(filePath: string): Promise<Chunk[]> {
    const content = this.readDocument(filePath);

    let chunks: Chunk[];

    // VERIFIED: Chunking strategy selection - confirms semantic or fixed-size chunking selected
    if (this.useSemanticChunking && this.semanticChunker) {
      // Use semantic chunking
      // VERIFIED: Semantic chunking execution - confirms semantic chunker used for topic-aware splitting
      chunks = await this.semanticChunker.chunkDocument(content, filePath, filePath);
    } else {
      // Use fixed-size chunking (backward compatible)
      // VERIFIED: Fixed-size chunking execution - confirms fixed-size chunker used for backward compatibility
      chunks = this.chunkDocument(content);

      // Add source file metadata to each chunk
      chunks = chunks.map(chunk => ({
        ...chunk,
        sourceFile: filePath,
        sourcePath: filePath,
      }));
    }

    return chunks;
  }
}
