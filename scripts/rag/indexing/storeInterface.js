import { SimpleVectorStore } from './vectorStore.js';
import { BinaryVectorStore } from './binaryStore.js';
/**
 * Create a vector store instance based on encoding preference
 *
 * @param storeDir Directory where the store will be saved
 * @param useJson If true, uses JSON encoding (slower but human-readable)
 *                If false, uses binary encoding (faster and more efficient)
 */
export function createVectorStore(storeDir, useJson = false) {
    if (useJson) {
        const storePath = `${storeDir}/vector-store.json`;
        return new SimpleVectorStore(storePath);
    }
    else {
        const storePath = `${storeDir}/vector-store.bin`;
        return new BinaryVectorStore(storePath);
    }
}
