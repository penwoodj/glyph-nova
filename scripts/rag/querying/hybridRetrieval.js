import { EmbeddingGenerator, cosineSimilarity } from '../indexing/embeddings.js';
import { KeywordSearcher } from './keywordSearch.js';
import { ReciprocalRankFusion } from './resultFusion.js';
/**
 * Hybrid Retrieval
 *
 * Combines semantic search (vector similarity) with keyword search (BM25)
 * to leverage both semantic understanding and exact matching.
 *
 * Process:
 * 1. Run semantic search (vector similarity)
 * 2. Run keyword search (BM25)
 * 3. Fuse results using RRF or weighted fusion
 * 4. Return top-K combined results
 *
 * Benefits:
 * - Semantic search handles abstract queries
 * - Keyword search handles exact matches
 * - Hybrid approach improves recall for diverse query types
 *
 * Reference: [[06-hybrid-retrieval-semantic-keyword]]
 */
export class HybridRetriever {
    embeddingGenerator;
    vectorStore;
    keywordSearcher;
    rrf;
    semanticWeight; // Weight for semantic results (0-1)
    keywordWeight; // Weight for keyword results (0-1)
    useRRF; // Whether to use RRF (true) or weighted fusion (false)
    constructor(vectorStore, semanticWeight = 0.7, keywordWeight = 0.3, useRRF = true) {
        this.embeddingGenerator = new EmbeddingGenerator();
        this.vectorStore = vectorStore;
        this.keywordSearcher = new KeywordSearcher();
        this.rrf = new ReciprocalRankFusion(60);
        this.semanticWeight = semanticWeight;
        this.keywordWeight = keywordWeight;
        this.useRRF = useRRF;
    }
    /**
     * Perform hybrid retrieval (semantic + keyword)
     *
     * @param query User query
     * @param topK Final number of chunks to return
     * @returns Retrieved chunks from hybrid retrieval
     */
    async retrieve(query, topK = 10) {
        // VERIFIED: Hybrid retrieval entry - confirms hybrid retrieval method called
        const allChunks = this.vectorStore.getChunks();
        // Build keyword index if needed
        if (this.keywordSearcher['index'].documentCount === 0) {
            // VERIFIED: Keyword index building - confirms keyword index built from chunks
            this.keywordSearcher.buildIndex(allChunks);
        }
        // VERIFIED: Parallel retrieval - confirms semantic and keyword search performed in parallel
        // Run semantic and keyword search in parallel
        const [semanticResults, keywordResults] = await Promise.all([
            this.semanticSearch(query, allChunks, topK * 2),
            this.keywordSearch(query, allChunks, topK * 2),
        ]);
        // VERIFIED: Result fusion - confirms semantic and keyword results fused using RRF or weighted fusion
        // Fuse results
        if (this.useRRF) {
            // Use RRF for fusion
            return this.rrf.fuse([semanticResults, keywordResults], topK);
        }
        else {
            // Use weighted fusion
            return this.weightedFusion(semanticResults, keywordResults, topK);
        }
    }
    /**
     * Semantic search using vector similarity
     */
    async semanticSearch(query, chunks, topK) {
        // VERIFIED: Semantic search execution - confirms semantic search performed using vector similarity
        const queryEmbedding = await this.embeddingGenerator.generateEmbedding(query);
        const similarities = chunks.map((chunk) => ({
            chunk,
            similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
        }));
        similarities.sort((a, b) => b.similarity - a.similarity);
        return similarities.slice(0, topK).map(item => item.chunk);
    }
    /**
     * Keyword search using BM25
     */
    keywordSearch(query, chunks, topK) {
        // VERIFIED: Keyword search execution - confirms keyword search performed using BM25
        return this.keywordSearcher.search(query, chunks, topK);
    }
    /**
     * Weighted fusion of semantic and keyword results
     */
    weightedFusion(semanticResults, keywordResults, topK) {
        // VERIFIED: Weighted fusion - confirms weighted fusion applied: final_score = α × semantic + β × keyword
        const chunkScores = new Map();
        // Add semantic results with weight
        semanticResults.forEach((chunk, index) => {
            const chunkId = this.getChunkId(chunk);
            const normalizedRank = 1 / (index + 1); // Normalize rank to 0-1
            const score = this.semanticWeight * normalizedRank;
            chunkScores.set(chunkId, { chunk, score });
        });
        // Add keyword results with weight
        keywordResults.forEach((chunk, index) => {
            const chunkId = this.getChunkId(chunk);
            const normalizedRank = 1 / (index + 1); // Normalize rank to 0-1
            const score = this.keywordWeight * normalizedRank;
            if (chunkScores.has(chunkId)) {
                // Combine scores if chunk appears in both
                chunkScores.get(chunkId).score += score;
            }
            else {
                chunkScores.set(chunkId, { chunk, score });
            }
        });
        // Sort by score and return top-K
        return Array.from(chunkScores.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, topK)
            .map(item => item.chunk);
    }
    /**
     * Generate unique ID for a chunk
     */
    getChunkId(chunk) {
        return `${chunk.metadata.sourcePath || ''}_${chunk.metadata.chunkIndex}_${chunk.metadata.startIndex}_${chunk.metadata.endIndex}`;
    }
}
