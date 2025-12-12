import { SimpleVectorStore, Chunk as JSONChunk } from './vectorStore.js';
import { BinaryVectorStore, Chunk as BinaryChunk } from './binaryStore.js';

/**
 * Unified Store Interface
 *
 * Provides a common interface for both JSON and binary vector stores.
 * This allows the RAG system to work with either encoding format seamlessly.
 */

export type Chunk = JSONChunk | BinaryChunk;

export interface IVectorStore {
  load(): boolean;
  save(chunks: Chunk[], documentPath: string | string[]): void;
  getChunks(): Chunk[];
  existsForDocument(documentPath: string | string[]): boolean;
  getDocumentPath(): string | string[] | null;
}

/**
 * Create a vector store instance based on encoding preference
 *
 * @param storeDir Directory where the store will be saved
 * @param useJson If true, uses JSON encoding (slower but human-readable)
 *                If false, uses binary encoding (faster and more efficient)
 */
export function createVectorStore(storeDir: string, useJson: boolean = false): IVectorStore {
  if (useJson) {
    const storePath = `${storeDir}/vector-store.json`;
    return new SimpleVectorStore(storePath);
  } else {
    const storePath = `${storeDir}/vector-store.bin`;
    return new BinaryVectorStore(storePath);
  }
}
