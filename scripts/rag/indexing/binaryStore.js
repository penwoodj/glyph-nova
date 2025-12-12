import { readFileSync, writeFileSync, existsSync } from 'fs';
export class BinaryVectorStore {
    storePath;
    header = null;
    chunks = null;
    constructor(storePath) {
        this.storePath = storePath;
    }
    /**
     * Load binary store from disk
     * Much faster than JSON parsing for large datasets
     */
    load() {
        if (!existsSync(this.storePath)) {
            return false;
        }
        try {
            const buffer = readFileSync(this.storePath);
            const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
            // Read magic bytes
            const magic = String.fromCharCode(...Array.from(buffer.slice(0, 4)));
            if (magic !== 'RAGB') {
                throw new Error('Invalid binary store format');
            }
            let offset = 4;
            // Read version
            const version = view.getUint8(offset);
            offset += 1;
            // Read file count
            const fileCount = view.getUint16(offset, true); // little endian
            offset += 2;
            // Read file paths
            const filePaths = [];
            for (let i = 0; i < fileCount; i++) {
                const pathLength = view.getUint16(offset, true);
                offset += 2;
                const path = buffer.slice(offset, offset + pathLength).toString('utf-8');
                offset += pathLength;
                filePaths.push(path);
            }
            // Read chunk count
            const chunkCount = view.getUint32(offset, true);
            offset += 4;
            // Read indexed at timestamp
            const timestampLength = view.getUint16(offset, true);
            offset += 2;
            const indexedAt = buffer.slice(offset, offset + timestampLength).toString('utf-8');
            offset += timestampLength;
            this.header = {
                version,
                filePaths,
                chunkCount,
                indexedAt,
            };
            // Read chunks
            this.chunks = [];
            for (let i = 0; i < chunkCount; i++) {
                // Read text
                const textLength = view.getUint16(offset, true);
                offset += 2;
                const text = buffer.slice(offset, offset + textLength).toString('utf-8');
                offset += textLength;
                // Read embedding
                const embeddingDims = view.getUint16(offset, true);
                offset += 2;
                const embedding = [];
                for (let j = 0; j < embeddingDims; j++) {
                    embedding.push(view.getFloat32(offset, true));
                    offset += 4;
                }
                // Read metadata
                const startIndex = view.getUint32(offset, true);
                offset += 4;
                const endIndex = view.getUint32(offset, true);
                offset += 4;
                const chunkIndex = view.getUint32(offset, true);
                offset += 4;
                const sourceFileIndex = view.getUint16(offset, true);
                offset += 2;
                const sourceFile = sourceFileIndex < filePaths.length ? filePaths[sourceFileIndex] : undefined;
                this.chunks.push({
                    text,
                    embedding,
                    metadata: {
                        startIndex,
                        endIndex,
                        chunkIndex,
                        sourceFile,
                        sourcePath: sourceFile,
                    },
                });
            }
            return true;
        }
        catch (error) {
            console.error(`[BinaryStore] Error loading store: ${error}`);
            return false;
        }
    }
    /**
     * Save chunks to binary format
     * Much faster and more compact than JSON
     */
    save(chunks, documentPath) {
        const uniqueFiles = Array.isArray(documentPath) ? [...new Set(documentPath)] : [documentPath];
        // Build header
        this.header = {
            version: 1,
            filePaths: uniqueFiles,
            chunkCount: chunks.length,
            indexedAt: new Date().toISOString(),
        };
        // Calculate buffer size
        let bufferSize = 4; // magic
        bufferSize += 1; // version
        bufferSize += 2; // file count
        for (const file of uniqueFiles) {
            bufferSize += 2 + Buffer.byteLength(file, 'utf-8'); // length + path
        }
        bufferSize += 4; // chunk count
        bufferSize += 2 + Buffer.byteLength(this.header.indexedAt, 'utf-8'); // timestamp
        // Calculate chunk sizes
        for (const chunk of chunks) {
            bufferSize += 2 + Buffer.byteLength(chunk.text, 'utf-8'); // text
            bufferSize += 2 + chunk.embedding.length * 4; // embedding dims + data
            bufferSize += 4 + 4 + 4 + 2; // metadata (start, end, chunkIndex, sourceFileIndex)
        }
        // Allocate buffer
        const buffer = Buffer.allocUnsafe(bufferSize);
        const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        let offset = 0;
        // Write magic
        buffer.write('RAGB', offset, 'ascii');
        offset += 4;
        // Write version
        view.setUint8(offset, this.header.version);
        offset += 1;
        // Write file count
        view.setUint16(offset, uniqueFiles.length, true);
        offset += 2;
        // Write file paths
        for (const file of uniqueFiles) {
            const fileBytes = Buffer.from(file, 'utf-8');
            view.setUint16(offset, fileBytes.length, true);
            offset += 2;
            fileBytes.copy(buffer, offset);
            offset += fileBytes.length;
        }
        // Write chunk count
        view.setUint32(offset, chunks.length, true);
        offset += 4;
        // Write indexed at
        const timestampBytes = Buffer.from(this.header.indexedAt, 'utf-8');
        view.setUint16(offset, timestampBytes.length, true);
        offset += 2;
        timestampBytes.copy(buffer, offset);
        offset += timestampBytes.length;
        // Write chunks
        for (const chunk of chunks) {
            // Write text
            const textBytes = Buffer.from(chunk.text, 'utf-8');
            view.setUint16(offset, textBytes.length, true);
            offset += 2;
            textBytes.copy(buffer, offset);
            offset += textBytes.length;
            // Write embedding
            view.setUint16(offset, chunk.embedding.length, true);
            offset += 2;
            for (const val of chunk.embedding) {
                view.setFloat32(offset, val, true);
                offset += 4;
            }
            // Write metadata
            const sourceFileIndex = chunk.metadata.sourceFile
                ? uniqueFiles.indexOf(chunk.metadata.sourceFile)
                : 0xFFFF; // -1 as uint16
            view.setUint32(offset, chunk.metadata.startIndex, true);
            offset += 4;
            view.setUint32(offset, chunk.metadata.endIndex, true);
            offset += 4;
            view.setUint32(offset, chunk.metadata.chunkIndex, true);
            offset += 4;
            view.setUint16(offset, sourceFileIndex === -1 ? 0xFFFF : sourceFileIndex, true);
            offset += 2;
        }
        // Save to disk
        try {
            writeFileSync(this.storePath, buffer);
            // console.log(`[BinaryStore] Saved ${chunks.length} chunks from ${uniqueFiles.length} file(s) to ${this.storePath}`);
        }
        catch (error) {
            console.error(`[BinaryStore] Error saving store: ${error}`);
            throw error;
        }
        this.chunks = chunks;
    }
    /**
     * Get all chunks from store
     */
    getChunks() {
        if (!this.chunks) {
            throw new Error('Store not loaded. Call load() first.');
        }
        return this.chunks;
    }
    /**
     * Check if store exists and matches document(s)
     */
    existsForDocument(documentPath) {
        if (!existsSync(this.storePath)) {
            return false;
        }
        if (!this.header) {
            this.load();
        }
        if (!this.header) {
            return false;
        }
        const pathsToCheck = Array.isArray(documentPath) ? documentPath : [documentPath];
        const storedPaths = this.header.filePaths;
        return pathsToCheck.every(path => storedPaths.includes(path));
    }
    /**
     * Get document path(s) from store
     */
    getDocumentPath() {
        if (!this.header) {
            return null;
        }
        return this.header.filePaths.length === 1 ? this.header.filePaths[0] : this.header.filePaths;
    }
}
