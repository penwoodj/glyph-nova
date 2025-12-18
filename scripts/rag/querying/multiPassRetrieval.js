import { spawn } from 'child_process';
import { EmbeddingGenerator, cosineSimilarity } from '../indexing/embeddings.js';
/**
 * Multi-Pass Retriever
 *
 * Implements two-pass retrieval strategy for complex abstract queries:
 * - Pass 1: Broad retrieval (topK=20) to identify key concepts
 * - Pass 2: Focused retrieval (topK=5 per concept) for comprehensive coverage
 *
 * Process:
 * 1. Pass 1: Retrieve top-20 chunks for the query
 * 2. Extract key concepts from Pass 1 results using LLM
 * 3. Pass 2: For each key concept, retrieve top-5 chunks
 * 4. Aggregate and deduplicate results
 *
 * Benefits:
 * - Handles complex abstract queries with multiple aspects
 * - Provides comprehensive coverage of different concepts
 * - Better context assembly for multi-faceted questions
 *
 * Reference: [[08-abstraction-aware-rag-patterns]]
 */
export class MultiPassRetriever {
    embeddingGenerator;
    vectorStore;
    ollamaModel;
    ollamaUrl;
    pass1TopK; // Top-K for broad retrieval
    pass2TopK; // Top-K per concept for focused retrieval
    constructor(vectorStore, ollamaModel = 'llama2', ollamaUrl = 'http://localhost:11434', pass1TopK = 20, pass2TopK = 5) {
        this.embeddingGenerator = new EmbeddingGenerator();
        this.vectorStore = vectorStore;
        this.ollamaModel = ollamaModel;
        this.ollamaUrl = ollamaUrl;
        this.pass1TopK = pass1TopK;
        this.pass2TopK = pass2TopK;
    }
    /**
     * Perform multi-pass retrieval
     *
     * @param query User query
     * @param finalTopK Final number of chunks to return
     * @returns Retrieved chunks from multi-pass retrieval
     */
    async retrieve(query, finalTopK = 10) {
        // VERIFIED: Multi-pass retrieval entry - confirms multi-pass retrieval method called
        // Pass 1: Broad retrieval
        const pass1Chunks = await this.pass1BroadRetrieval(query);
        if (pass1Chunks.length === 0) {
            return [];
        }
        // VERIFIED: Concept extraction - confirms key concepts extracted from Pass 1 results
        // Extract key concepts from Pass 1 results
        const keyConcepts = await this.extractKeyConcepts(query, pass1Chunks);
        if (keyConcepts.length === 0) {
            // If no concepts extracted, return Pass 1 results
            return pass1Chunks.slice(0, finalTopK);
        }
        // VERIFIED: Focused retrieval - confirms Pass 2 retrieval performed for each key concept
        // Pass 2: Focused retrieval for each key concept
        const pass2Chunks = await this.pass2FocusedRetrieval(keyConcepts);
        // VERIFIED: Result aggregation - confirms Pass 1 and Pass 2 results aggregated and deduplicated
        // Aggregate and deduplicate results
        const aggregatedChunks = this.aggregateResults(pass1Chunks, pass2Chunks, finalTopK);
        return aggregatedChunks;
    }
    /**
     * Pass 1: Broad retrieval (topK=20)
     */
    async pass1BroadRetrieval(query) {
        // VERIFIED: Pass 1 retrieval - confirms broad retrieval performed (topK=20)
        const queryEmbedding = await this.embeddingGenerator.generateEmbedding(query);
        const chunks = this.vectorStore.getChunks();
        // Calculate similarities
        const similarities = chunks.map((chunk) => ({
            chunk,
            similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
        }));
        // Sort by similarity and get top-K
        similarities.sort((a, b) => b.similarity - a.similarity);
        const topChunks = similarities.slice(0, this.pass1TopK).map(item => item.chunk);
        return topChunks;
    }
    /**
     * Extract key concepts from Pass 1 results using LLM
     */
    async extractKeyConcepts(query, chunks) {
        // VERIFIED: LLM concept extraction - confirms Ollama called to extract key concepts
        // Build context from Pass 1 chunks
        const context = chunks
            .slice(0, 10) // Use top 10 for concept extraction
            .map((chunk, i) => `[Chunk ${i + 1}]\n${chunk.text}`)
            .join('\n\n');
        const prompt = `Given this query and the retrieved context, identify 3-5 key concepts or topics that should be explored further.

Query: "${query}"

Context:
${context}

Identify 3-5 key concepts (one per line, without numbering or bullets) that would help answer this query comprehensively:`;
        try {
            const response = await this.generateWithOllama(prompt);
            // VERIFIED: Concept parsing - confirms LLM response parsed into individual concepts
            // Parse concepts (one per line)
            const concepts = response
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0 && !line.match(/^\d+[\.\)]/)) // Remove numbering
                .slice(0, 5); // Limit to 5 concepts
            return concepts.length > 0 ? concepts : [query]; // Fallback to original query if no concepts extracted
        }
        catch (error) {
            // VERIFIED: Extraction fallback - confirms original query used if concept extraction fails
            console.warn(`[MultiPassRetriever] Failed to extract concepts, using original query: ${error.message}`);
            return [query]; // Fallback to original query
        }
    }
    /**
     * Pass 2: Focused retrieval for each key concept (topK=5 per concept)
     */
    async pass2FocusedRetrieval(keyConcepts) {
        // VERIFIED: Pass 2 retrieval - confirms focused retrieval performed for each concept
        const allChunks = this.vectorStore.getChunks();
        const retrievedChunks = [];
        const seenChunkIds = new Set();
        for (const concept of keyConcepts) {
            // Generate embedding for concept
            const conceptEmbedding = await this.embeddingGenerator.generateEmbedding(concept);
            // Calculate similarities
            const similarities = allChunks.map((chunk) => ({
                chunk,
                similarity: cosineSimilarity(conceptEmbedding, chunk.embedding),
            }));
            // Sort by similarity and get top-K for this concept
            similarities.sort((a, b) => b.similarity - a.similarity);
            const topChunks = similarities.slice(0, this.pass2TopK).map(item => item.chunk);
            // Add chunks (deduplicate)
            for (const chunk of topChunks) {
                const chunkId = this.getChunkId(chunk);
                if (!seenChunkIds.has(chunkId)) {
                    retrievedChunks.push(chunk);
                    seenChunkIds.add(chunkId);
                }
            }
        }
        return retrievedChunks;
    }
    /**
     * Aggregate Pass 1 and Pass 2 results, deduplicate, and return top-K
     */
    aggregateResults(pass1Chunks, pass2Chunks, finalTopK) {
        // VERIFIED: Result aggregation - confirms Pass 1 and Pass 2 results combined and deduplicated
        const seenChunkIds = new Set();
        const aggregated = [];
        // Add Pass 1 chunks first (they're already ranked by relevance to original query)
        for (const chunk of pass1Chunks) {
            const chunkId = this.getChunkId(chunk);
            if (!seenChunkIds.has(chunkId)) {
                aggregated.push(chunk);
                seenChunkIds.add(chunkId);
            }
        }
        // Add Pass 2 chunks (they provide focused coverage of key concepts)
        for (const chunk of pass2Chunks) {
            const chunkId = this.getChunkId(chunk);
            if (!seenChunkIds.has(chunkId)) {
                aggregated.push(chunk);
                seenChunkIds.add(chunkId);
            }
        }
        // Return top-K
        return aggregated.slice(0, finalTopK);
    }
    /**
     * Generate unique ID for a chunk
     */
    getChunkId(chunk) {
        return `${chunk.metadata.sourcePath || ''}_${chunk.metadata.chunkIndex}_${chunk.metadata.startIndex}_${chunk.metadata.endIndex}`;
    }
    /**
     * Generate text using Ollama
     */
    async generateWithOllama(prompt) {
        // VERIFIED: LLM generation - confirms Ollama called to generate text
        return new Promise((resolve, reject) => {
            const echo = spawn('echo', ['-n', prompt], {
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            const ollama = spawn('ollama', ['run', this.ollamaModel], {
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            echo.stdout.pipe(ollama.stdin);
            let output = '';
            let errorOutput = '';
            ollama.stdout.on('data', (data) => {
                output += data.toString();
            });
            ollama.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            ollama.on('close', (code) => {
                if (code === 0 || code === null) {
                    resolve(output.trim());
                }
                else {
                    reject(new Error(`Ollama process exited with code ${code}: ${errorOutput}`));
                }
            });
            ollama.on('error', (error) => {
                reject(new Error(`Failed to spawn Ollama: ${error.message}`));
            });
            echo.on('error', (error) => {
                reject(new Error(`Failed to spawn echo: ${error.message}`));
            });
            echo.stdin.end();
        });
    }
}
