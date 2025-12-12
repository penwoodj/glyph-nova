import { readFileSync, writeFileSync, existsSync } from 'fs';
export class SimpleVectorStore {
    storePath;
    store = null;
    constructor(storePath) {
        this.storePath = storePath;
    }
    /**
     * Load existing vector store from disk
     */
    load() {
        if (!existsSync(this.storePath)) {
            // console.log(`[VectorStore] No existing store found at ${this.storePath}`);
            return false;
        }
        try {
            const data = readFileSync(this.storePath, 'utf-8');
            this.store = JSON.parse(data);
            // console.log(`[VectorStore] Loaded ${this.store!.chunks.length} chunks from store`);
            return true;
        }
        catch (error) {
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
    save(chunks, documentPath) {
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
        }
        catch (error) {
            console.error(`[VectorStore] Error saving store: ${error}`);
            throw error;
        }
    }
    /**
     * Get all chunks from store
     */
    getChunks() {
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
    existsForDocument(documentPath) {
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
    getDocumentPath() {
        if (!this.store) {
            return null;
        }
        return this.store.documentPath;
    }
}
