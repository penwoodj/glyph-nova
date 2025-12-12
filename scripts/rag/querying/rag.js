import { spawn } from 'child_process';
import { EmbeddingGenerator, cosineSimilarity } from '../indexing/embeddings.js';
/**
 * RAG system that retrieves relevant chunks and generates responses using Ollama
 */
export class RAGSystem {
    embeddingGenerator;
    vectorStore;
    ollamaModel;
    constructor(vectorStore, ollamaModel = 'llama2') {
        this.embeddingGenerator = new EmbeddingGenerator();
        this.vectorStore = vectorStore;
        this.ollamaModel = ollamaModel;
    }
    /**
     * Find most relevant chunks for a query
     */
    async retrieveRelevantChunks(query, topK = 3) {
        // console.log(`[RAG] Retrieving relevant chunks for query: "${query}"`);
        // Generate query embedding
        const queryEmbedding = await this.embeddingGenerator.generateEmbedding(query);
        // console.log(`[RAG] Generated query embedding`);
        // Get all chunks from store
        const chunks = this.vectorStore.getChunks();
        // console.log(`[RAG] Comparing against ${chunks.length} chunks`);
        // Calculate similarities
        const similarities = chunks.map((chunk, index) => ({
            chunk,
            similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
            index,
        }));
        // Sort by similarity and get top K
        similarities.sort((a, b) => b.similarity - a.similarity);
        const topChunks = similarities.slice(0, topK);
        // console.log(`[RAG] Top ${topK} chunks found:`);
        // topChunks.forEach((item, i) => {
        //   console.log(`[RAG]   ${i + 1}. Similarity: ${item.similarity.toFixed(4)}, Chunk ${item.chunk.metadata.chunkIndex}`);
        // });
        return topChunks.map(item => item.chunk);
    }
    /**
     * Generate response using Ollama with retrieved context
     */
    async generateResponse(query, contextChunks) {
        // console.log(`[RAG] Generating response using Ollama model: ${this.ollamaModel}`);
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
        // Create prompt
        const prompt = `Based on the following context, answer the question. If the context doesn't contain enough information, say so.

Context:
${context}

Question: ${query}

Answer:`;
        // console.log(`[RAG] Sending prompt to Ollama (${prompt.length} chars)`);
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
        // console.log(`[RAG] Processing query: "${query}"`);
        // Retrieve relevant chunks
        const relevantChunks = await this.retrieveRelevantChunks(query, topK);
        if (relevantChunks.length === 0) {
            return 'No relevant context found in the indexed document.';
        }
        // Generate response
        const response = await this.generateResponse(query, relevantChunks);
        return response;
    }
}
