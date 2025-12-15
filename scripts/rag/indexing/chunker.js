import { readFileSync } from 'fs';
import { SemanticChunker } from './semanticChunker.js';
export class DocumentChunker {
    chunkSize;
    overlap;
    useSemanticChunking;
    semanticChunker;
    constructor(chunkSize = 500, overlap = 50, useSemanticChunking = false, embeddingGenerator) {
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
    readDocument(filePath) {
        // console.log(`[Chunker] Reading document from ${filePath}`);
        const content = readFileSync(filePath, 'utf-8');
        // console.log(`[Chunker] Document length: ${content.length} characters`);
        return content;
    }
    /**
     * Split document into chunks
     */
    chunkDocument(content) {
        // console.log(`[Chunker] Splitting document into chunks (size: ${this.chunkSize}, overlap: ${this.overlap})`);
        const chunks = [];
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
            }
            else {
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
    async chunkFile(filePath) {
        const content = this.readDocument(filePath);
        let chunks;
        // VERIFIED: Chunking strategy selection - confirms semantic or fixed-size chunking selected
        if (this.useSemanticChunking && this.semanticChunker) {
            // Use semantic chunking
            // VERIFIED: Semantic chunking execution - confirms semantic chunker used for topic-aware splitting
            chunks = await this.semanticChunker.chunkDocument(content, filePath, filePath);
        }
        else {
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
