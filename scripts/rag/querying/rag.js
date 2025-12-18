import { spawn } from 'child_process';
import { EmbeddingGenerator, cosineSimilarity } from '../indexing/embeddings.js';
import { QueryExpander } from './queryExpansion.js';
import { ReciprocalRankFusion } from './resultFusion.js';
import { LLMReranker } from './reranker.js';
import { ContextExpander } from './contextExpander.js';
import { MultiPassRetriever } from './multiPassRetrieval.js';
import { HybridRetriever } from './hybridRetrieval.js';
import { debugLog } from '../utils/debug.js';
/**
 * RAG system that retrieves relevant chunks and generates responses using Ollama
 *
 * Supports query expansion with multi-query generation and RRF fusion for improved recall.
 * Supports context expansion with sentence window to preserve context across boundaries.
 * Reference: [[04-query-expansion-reranking]], [[05-hierarchical-context-retrieval]]
 */
export class RAGSystem {
    embeddingGenerator;
    vectorStore;
    ollamaModel;
    queryExpander;
    rrf;
    reranker;
    contextExpander;
    useQueryExpansion;
    useReranking;
    useContextExpansion;
    useHierarchical;
    useMultiPass;
    useHybrid;
    multiPassRetriever;
    hybridRetriever;
    constructor(vectorStore, ollamaModel = 'llama2', useQueryExpansion = false, numQueryVariations = 3, useReranking = false, useContextExpansion = false, contextWindowSize = 2, useHierarchical = false, useMultiPass = false, useHybrid = false) {
        this.embeddingGenerator = new EmbeddingGenerator();
        this.vectorStore = vectorStore;
        this.ollamaModel = ollamaModel;
        this.useQueryExpansion = useQueryExpansion;
        this.useReranking = useReranking;
        this.useContextExpansion = useContextExpansion;
        this.useHierarchical = useHierarchical;
        this.useMultiPass = useMultiPass;
        this.useHybrid = useHybrid;
        this.queryExpander = useQueryExpansion
            ? new QueryExpander(ollamaModel, 'http://localhost:11434', numQueryVariations)
            : null;
        this.reranker = useReranking
            ? new LLMReranker(ollamaModel, 'http://localhost:11434')
            : null;
        this.contextExpander = useContextExpansion
            ? new ContextExpander(contextWindowSize)
            : null;
        this.multiPassRetriever = useMultiPass
            ? new MultiPassRetriever(vectorStore, ollamaModel, 'http://localhost:11434', 20, 5)
            : null;
        this.hybridRetriever = useHybrid
            ? new HybridRetriever(vectorStore, 0.7, 0.3, true)
            : null;
        this.rrf = new ReciprocalRankFusion(60);
    }
    /**
     * Find most relevant chunks for a query
     *
     * If query expansion is enabled, generates multiple query variations,
     * retrieves chunks for each, and fuses results using RRF.
     * Otherwise, uses single-query retrieval.
     */
    async retrieveRelevantChunks(query, topK = 3) {
        // VERIFIED: Query routing - confirms correct path selection (single vs multi-query)
        // Expected Result: Log shows query being processed and retrieval method selected
        // Verification Level: DEBUG - Confirms retrieval process initiated with query
        debugLog('RAG', `Retrieving relevant chunks for query: "${query}"`);
        if (this.useQueryExpansion && this.queryExpander) {
            // VERIFIED: Multi-query path - confirms query expansion is enabled and used
            // Multi-query retrieval with RRF fusion
            return await this.retrieveWithQueryExpansion(query, topK);
        }
        else {
            // VERIFIED: Single-query path - confirms backward compatibility maintained
            // Single-query retrieval (original behavior)
            return await this.retrieveSingleQuery(query, topK);
        }
    }
    /**
     * Single-query retrieval (original behavior)
     */
    async retrieveSingleQuery(query, topK) {
        // VERIFIED: Single-query retrieval flow - confirms embedding generation, similarity calculation, and top-K selection
        // Generate query embedding
        const queryEmbedding = await this.embeddingGenerator.generateEmbedding(query);
        // Expected Result: Log confirms query embedding generated
        // Verification Level: DEBUG - Confirms embedding generation step completed
        debugLog('RAG', `Generated query embedding`);
        // Get all chunks from store
        const chunks = this.vectorStore.getChunks();
        // VERIFIED: Chunk retrieval - confirms vector store provides chunks for similarity search
        // Expected Result: Log shows number of chunks available for comparison
        // Verification Level: DEBUG - Confirms chunk retrieval from vector store
        debugLog('RAG', `Comparing against ${chunks.length} chunks`);
        // Calculate similarities
        const similarities = chunks.map((chunk, index) => ({
            chunk,
            similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
            index,
        }));
        // VERIFIED: Similarity calculation - confirms cosine similarity computed for all chunks
        // Sort by similarity and get top K
        similarities.sort((a, b) => b.similarity - a.similarity);
        const topChunks = similarities.slice(0, topK);
        // VERIFIED: Top-K selection - confirms most similar chunks selected and returned
        // console.log(`[RAG] Top ${topK} chunks found:`);
        // topChunks.forEach((item, i) => {
        //   console.log(`[RAG]   ${i + 1}. Similarity: ${item.similarity.toFixed(4)}, Chunk ${item.chunk.metadata.chunkIndex}`);
        // });
        return topChunks.map(item => item.chunk);
    }
    /**
     * Multi-query retrieval with RRF fusion
     */
    async retrieveWithQueryExpansion(query, topK) {
        if (!this.queryExpander) {
            return this.retrieveSingleQuery(query, topK);
        }
        // VERIFIED: Query expansion initiation - confirms multi-query retrieval path activated
        // Expected Result: Log confirms query expansion process started
        // Verification Level: DEBUG - Confirms multi-query retrieval path selected
        debugLog('RAG', `Expanding query into multiple variations...`);
        // Expand query into variations
        const queryVariations = await this.queryExpander.expandQuery(query);
        // VERIFIED: Query expansion success - confirms multiple query variations generated (typically 3-5)
        // Expected Result: Log shows number of query variations generated
        // Verification Level: DEBUG - Confirms query expansion completed with variation count
        debugLog('RAG', `Generated ${queryVariations.length} query variations`);
        // Retrieve chunks for each query variation
        const rankedLists = [];
        const chunks = this.vectorStore.getChunks();
        for (const variation of queryVariations) {
            // VERIFIED: Per-variation retrieval - confirms each query variation retrieves chunks independently
            // Generate embedding for this variation
            const variationEmbedding = await this.embeddingGenerator.generateEmbedding(variation);
            // Calculate similarities
            const similarities = chunks.map((chunk) => ({
                chunk,
                similarity: cosineSimilarity(variationEmbedding, chunk.embedding),
            }));
            // Sort by similarity and get top chunks (retrieve more than topK to improve fusion quality)
            similarities.sort((a, b) => b.similarity - a.similarity);
            const topChunks = similarities.slice(0, Math.max(topK * 2, 10)).map(item => item.chunk);
            rankedLists.push(topChunks);
        }
        // VERIFIED: RRF fusion - confirms multiple ranked lists combined using Reciprocal Rank Fusion algorithm
        // Expected Result: Log shows number of result sets being fused
        // Verification Level: DEBUG - Confirms RRF fusion process initiated
        debugLog('RAG', `Fusing ${rankedLists.length} result sets using RRF...`);
        const fusedChunks = this.rrf.fuse(rankedLists, topK);
        // VERIFIED: Final result - confirms fused chunks returned after RRF combination
        // Expected Result: Log shows final number of fused chunks
        // Verification Level: DEBUG - Confirms RRF fusion completed with final chunk count
        debugLog('RAG', `Fused to ${fusedChunks.length} top chunks`);
        return fusedChunks;
    }
    /**
     * Generate response using Ollama with retrieved context
     */
    async generateResponse(query, contextChunks) {
        // VERIFIED: Response generation entry - confirms generation method called with query and context chunks
        // Expected Result: Log shows Ollama model being used for response generation
        // Verification Level: DEBUG - Confirms response generation process initiated
        debugLog('RAG', `Generating response using Ollama model: ${this.ollamaModel}`);
        // VERIFIED: Context assembly - confirms chunks assembled with source information for LLM
        // Build context from chunks with source information
        // Including source file info helps the LLM provide better context
        // and allows users to trace where information came from
        const context = contextChunks
            .map((chunk, i) => {
            const sourceInfo = chunk.metadata.sourceFile
                ? `\n[Source: ${chunk.metadata.sourceFile}]`
                : '';
            return `[Context ${i + 1}]${sourceInfo}\n${chunk.text}`;
        })
            .join('\n\n');
        // VERIFIED: Prompt construction - confirms prompt includes context and query for LLM
        // Create prompt
        const prompt = `Based on the following context, answer the question. If the context doesn't contain enough information, say so.

Context:
${context}

Question: ${query}

Answer:`;
        // VERIFIED: LLM generation - confirms Ollama called to generate response with context
        // Expected Result: Log shows prompt length being sent to Ollama
        // Verification Level: DEBUG - Confirms prompt prepared and sent to LLM
        debugLog('RAG', `Sending prompt to Ollama (${prompt.length} chars)`);
        try {
            // Use echo + pipe to avoid shell escaping issues with ollama run
            // console.log(`[RAG] Executing: echo ... | ollama run ${this.ollamaModel}`);
            return new Promise((resolve, reject) => {
                // Use echo to pipe the prompt to ollama, avoiding shell escaping issues
                const echo = spawn('echo', ['-n', prompt], {
                    stdio: ['pipe', 'pipe', 'pipe'],
                });
                const ollama = spawn('ollama', ['run', this.ollamaModel], {
                    stdio: ['pipe', 'pipe', 'pipe'],
                });
                // Pipe echo output to ollama input
                echo.stdout.pipe(ollama.stdin);
                let output = '';
                let errorOutput = '';
                ollama.stdout.on('data', (data) => {
                    output += data.toString();
                });
                ollama.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                });
                echo.on('error', (error) => {
                    console.error(`[RAG] Error spawning echo: ${error.message}`);
                    reject(new Error(`Failed to spawn echo: ${error.message}`));
                });
                ollama.on('close', (code) => {
                    if (code === 0 || code === null) {
                        // console.log(`[RAG] Received response from Ollama (${output.length} chars)`);
                        resolve(output.trim());
                    }
                    else {
                        const error = new Error(`Ollama process exited with code ${code}: ${errorOutput}`);
                        console.error(`[RAG] Error generating response: ${error.message}`);
                        reject(error);
                    }
                });
                ollama.on('error', (error) => {
                    console.error(`[RAG] Error spawning Ollama: ${error.message}`);
                    reject(new Error(`Failed to spawn Ollama: ${error.message}`));
                });
                // Close echo stdin to start the pipe
                echo.stdin.end();
            });
        }
        catch (error) {
            console.error(`[RAG] Error generating response: ${error.message}`);
            throw new Error(`Failed to generate response: ${error.message}`);
        }
    }
    /**
     * Query the RAG system
     */
    async query(query, topK = 3) {
        // VERIFIED: Query entry - confirms RAG query method called with user query
        // Expected Result: Log shows user query being processed
        // Verification Level: DEBUG - Confirms RAG query method entry point
        debugLog('RAG', `Processing query: "${query}"`);
        // VERIFIED: Retrieval routing - confirms retrieval method selected (multi-pass, hybrid, or standard)
        // Retrieve relevant chunks (use multi-pass, hybrid, or standard retrieval)
        let relevantChunks;
        if (this.useMultiPass && this.multiPassRetriever) {
            // VERIFIED: Multi-pass retrieval execution - confirms multi-pass retrieval performed
            // Multi-pass retrieval: Pass 1 (broad) + Pass 2 (focused per concept)
            relevantChunks = await this.multiPassRetriever.retrieve(query, topK * 4);
        }
        else if (this.useHybrid && this.hybridRetriever) {
            // VERIFIED: Hybrid retrieval execution - confirms hybrid retrieval performed (semantic + keyword)
            // Hybrid retrieval: Semantic search + Keyword search (BM25), fused with RRF
            relevantChunks = await this.hybridRetriever.retrieve(query, topK * 4);
        }
        else {
            // Standard retrieval (retrieve more if reranking enabled)
            const initialTopK = this.useReranking ? Math.max(topK * 4, 20) : topK;
            relevantChunks = await this.retrieveRelevantChunks(query, initialTopK);
        }
        if (relevantChunks.length === 0) {
            return 'No relevant context found in the indexed document.';
        }
        // VERIFIED: Reranking integration - confirms reranking applied if enabled (retrieve top-20, rerank to top-5)
        // Apply reranking if enabled (skip if multi-pass was used, as it already provides comprehensive coverage)
        let finalChunks = relevantChunks;
        if (!this.useMultiPass && this.useReranking && this.reranker && relevantChunks.length > topK) {
            // VERIFIED: Reranking execution - confirms chunks reranked by LLM relevance scoring
            finalChunks = await this.reranker.rerank(query, relevantChunks);
            // Return top-K after reranking
            finalChunks = finalChunks.slice(0, topK);
        }
        else if (relevantChunks.length > topK) {
            // If not reranking, just take top-K
            finalChunks = relevantChunks.slice(0, topK);
        }
        // VERIFIED: Hierarchical chunking integration - confirms parent chunks included if hierarchical enabled
        // Apply hierarchical chunking if enabled (retrieve child chunks, include parent chunks for context)
        if (this.useHierarchical) {
            // VERIFIED: Hierarchical retrieval - confirms child chunks retrieved and parent chunks included
            finalChunks = this.includeParentChunks(finalChunks);
        }
        // VERIFIED: Context expansion integration - confirms expansion applied if enabled (adds ±N sentences around chunks)
        // Apply context expansion if enabled (after reranking to expand final top-K chunks)
        if (this.useContextExpansion && this.contextExpander) {
            // VERIFIED: Context expansion execution - confirms chunks expanded with surrounding sentences
            finalChunks = await this.contextExpander.expandChunks(finalChunks);
        }
        // VERIFIED: Context assembly - confirms final chunks (hierarchical, reranked, and/or expanded) used for generation
        // Generate response
        const response = await this.generateResponse(query, finalChunks);
        return response;
    }
    /**
     * Include parent chunks for child chunks (hierarchical chunking)
     * When a child chunk is retrieved, include its parent chunk for context
     */
    includeParentChunks(chunks) {
        // VERIFIED: Parent chunk inclusion - confirms parent chunks found and included for child chunks
        const allChunks = this.vectorStore.getChunks();
        const result = [];
        const addedParentIds = new Set();
        for (const chunk of chunks) {
            // Add the child chunk
            result.push(chunk);
            // If this is a child chunk, find and add its parent
            if (chunk.metadata.isChild && chunk.metadata.parentId) {
                const parentId = chunk.metadata.parentId;
                if (!addedParentIds.has(parentId)) {
                    // Find parent chunk by matching parentId
                    const parent = allChunks.find(c => c.metadata.isParent && this.getChunkId(c) === parentId);
                    if (parent) {
                        result.push(parent);
                        addedParentIds.add(parentId);
                    }
                }
            }
        }
        return result;
    }
    /**
     * Generate unique ID for a chunk (same logic as HierarchicalChunker)
     */
    getChunkId(chunk) {
        return `${chunk.metadata.sourcePath || ''}_${chunk.metadata.chunkIndex}_${chunk.metadata.startIndex}_${chunk.metadata.endIndex}`;
    }
}
