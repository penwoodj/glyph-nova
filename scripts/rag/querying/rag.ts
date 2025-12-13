import { spawn } from 'child_process';
import { EmbeddingGenerator, cosineSimilarity } from '../indexing/embeddings.js';
import { IVectorStore, Chunk } from '../indexing/storeInterface.js';
import { QueryExpander } from './queryExpansion.js';
import { ReciprocalRankFusion } from './resultFusion.js';

/**
 * RAG system that retrieves relevant chunks and generates responses using Ollama
 *
 * Supports query expansion with multi-query generation and RRF fusion for improved recall.
 * Reference: [[04-query-expansion-reranking]]
 */
export class RAGSystem {
  private embeddingGenerator: EmbeddingGenerator;
  private vectorStore: IVectorStore;
  private ollamaModel: string;
  private queryExpander: QueryExpander | null;
  private rrf: ReciprocalRankFusion;
  private useQueryExpansion: boolean;

  constructor(
    vectorStore: IVectorStore,
    ollamaModel: string = 'llama2',
    useQueryExpansion: boolean = false,
    numQueryVariations: number = 3
  ) {
    this.embeddingGenerator = new EmbeddingGenerator();
    this.vectorStore = vectorStore;
    this.ollamaModel = ollamaModel;
    this.useQueryExpansion = useQueryExpansion;
    this.queryExpander = useQueryExpansion
      ? new QueryExpander(ollamaModel, 'http://localhost:11434', numQueryVariations)
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
  async retrieveRelevantChunks(query: string, topK: number = 3): Promise<Chunk[]> {
    // console.log(`[RAG] Retrieving relevant chunks for query: "${query}"`);

    if (this.useQueryExpansion && this.queryExpander) {
      // Multi-query retrieval with RRF fusion
      return await this.retrieveWithQueryExpansion(query, topK);
    } else {
      // Single-query retrieval (original behavior)
      return await this.retrieveSingleQuery(query, topK);
    }
  }

  /**
   * Single-query retrieval (original behavior)
   */
  private async retrieveSingleQuery(query: string, topK: number): Promise<Chunk[]> {
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
   * Multi-query retrieval with RRF fusion
   */
  private async retrieveWithQueryExpansion(query: string, topK: number): Promise<Chunk[]> {
    if (!this.queryExpander) {
      return this.retrieveSingleQuery(query, topK);
    }

    // console.log(`[RAG] Expanding query into multiple variations...`);

    // Expand query into variations
    const queryVariations = await this.queryExpander.expandQuery(query);
    // console.log(`[RAG] Generated ${queryVariations.length} query variations`);

    // Retrieve chunks for each query variation
    const rankedLists: Chunk[][] = [];
    const chunks = this.vectorStore.getChunks();

    for (const variation of queryVariations) {
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

    // Fuse results using RRF
    // console.log(`[RAG] Fusing ${rankedLists.length} result sets using RRF...`);
    const fusedChunks = this.rrf.fuse(rankedLists, topK);

    // console.log(`[RAG] Fused to ${fusedChunks.length} top chunks`);
    return fusedChunks;
  }

  /**
   * Generate response using Ollama with retrieved context
   */
  async generateResponse(query: string, contextChunks: Chunk[]): Promise<string> {
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

      return new Promise<string>((resolve, reject) => {
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
          } else {
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
    } catch (error: any) {
      console.error(`[RAG] Error generating response: ${error.message}`);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Query the RAG system
   */
  async query(query: string, topK: number = 3): Promise<string> {
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
