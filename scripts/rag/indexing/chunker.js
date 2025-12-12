import { readFileSync } from 'fs';
export class DocumentChunker {
    chunkSize;
    overlap;
    constructor(chunkSize = 500, overlap = 50) {
        this.chunkSize = chunkSize;
        this.overlap = overlap;
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
     */
    chunkFile(filePath) {
        const content = this.readDocument(filePath);
        const chunks = this.chunkDocument(content);
        // Add source file metadata to each chunk
        // This is important for RAG - when retrieving chunks, we know
        // which file they came from, improving context and traceability
        return chunks.map(chunk => ({
            ...chunk,
            sourceFile: filePath,
            sourcePath: filePath,
        }));
    }
}
