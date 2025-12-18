import { IVectorStore, Chunk } from '../indexing/storeInterface.js';
import { RAGSystem } from '../querying/rag.js';
import { RetrievalMetricsEvaluator, EvaluationDataset } from './retrievalMetrics.js';
import { GenerationMetricsEvaluator } from './generationMetrics.js';

/**
 * RAG Evaluation Framework
 *
 * Comprehensive evaluation framework for RAG systems:
 * - Retrieval metrics (Precision@K, Recall@K, MRR)
 * - Generation metrics (Faithfulness, Answer Relevance)
 * - Evaluation dataset support
 * - Quality monitoring
 *
 * Reference: [[07-rag-evaluation-metrics]]
 */

export interface EvaluationResult {
  query: string;
  retrievalMetrics: {
    precisionAtK: number;
    recallAtK: number;
    mrr: number;
  };
  generationMetrics: {
    faithfulness: number;
    answerRelevance: number;
  };
  response: string;
  retrievedChunks: Chunk[];
}

export interface EvaluationReport {
  results: EvaluationResult[];
  averageRetrievalMetrics: {
    precisionAtK: number;
    recallAtK: number;
    mrr: number;
  };
  averageGenerationMetrics: {
    faithfulness: number;
    answerRelevance: number;
  };
  totalQueries: number;
}

export class RAGEvaluator {
  private vectorStore: IVectorStore;
  private ragSystem: RAGSystem;
  private retrievalEvaluator: RetrievalMetricsEvaluator;
  private generationEvaluator: GenerationMetricsEvaluator;

  constructor(
    vectorStore: IVectorStore,
    ragSystem: RAGSystem,
    ollamaModel: string = 'llama2'
  ) {
    this.vectorStore = vectorStore;
    this.ragSystem = ragSystem;
    this.retrievalEvaluator = new RetrievalMetricsEvaluator();
    this.generationEvaluator = new GenerationMetricsEvaluator(ollamaModel);
  }

  /**
   * Evaluate RAG system on a dataset
   *
   * @param dataset Evaluation dataset with queries and relevant chunk IDs
   * @param topK Top-K for retrieval evaluation
   * @returns Evaluation report
   */
  async evaluate(dataset: EvaluationDataset, topK: number = 5): Promise<EvaluationReport> {
    // VERIFIED: Evaluation entry - confirms evaluation framework called with dataset
    const results: EvaluationResult[] = [];

    for (const item of dataset.queries) {
      // VERIFIED: Query processing - confirms each query processed through RAG system
      // Generate response using RAG
      const response = await this.ragSystem.query(item.query, topK);

      // Get retrieved chunks by calling RAGSystem's retrieval method
      // We'll use a workaround: call retrieveRelevantChunks if available, otherwise retrieve manually
      const allChunks = this.vectorStore.getChunks();
      let retrievedChunks: Chunk[];

      try {
        // Try to use RAGSystem's internal retrieval
        retrievedChunks = await (this.ragSystem as any).retrieveRelevantChunks(item.query, topK);
      } catch {
        // Fallback: manual retrieval for evaluation
        const { EmbeddingGenerator, cosineSimilarity } = await import('../indexing/embeddings.js');
        const embeddingGenerator = new EmbeddingGenerator();
        const queryEmbedding = await embeddingGenerator.generateEmbedding(item.query);

        const similarities = allChunks.map((chunk) => ({
          chunk,
          similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
        }));

        similarities.sort((a, b) => b.similarity - a.similarity);
        retrievedChunks = similarities.slice(0, topK).map(item => item.chunk);
      }

      // VERIFIED: Metrics calculation - confirms retrieval and generation metrics calculated
      // Evaluate retrieval metrics
      const retrievalMetrics = this.retrievalEvaluator.evaluate(
        retrievedChunks,
        item.relevantChunkIds,
        topK
      );

      // Evaluate generation metrics
      const generationMetrics = await this.generationEvaluator.evaluate(
        item.query,
        retrievedChunks,
        response
      );

      results.push({
        query: item.query,
        retrievalMetrics,
        generationMetrics,
        response,
        retrievedChunks,
      });
    }

    // VERIFIED: Report generation - confirms average metrics calculated across all queries
    // Calculate averages
    const averageRetrievalMetrics = this.retrievalEvaluator.evaluateMultiple(
      results.map(r => ({
        retrievedChunks: r.retrievedChunks,
        relevantChunkIds: dataset.queries.find(q => q.query === r.query)!.relevantChunkIds,
      })),
      topK
    );

    const averageGenerationMetrics = {
      faithfulness: results.reduce((sum, r) => sum + r.generationMetrics.faithfulness, 0) / results.length,
      answerRelevance: results.reduce((sum, r) => sum + r.generationMetrics.answerRelevance, 0) / results.length,
    };

    return {
      results,
      averageRetrievalMetrics,
      averageGenerationMetrics,
      totalQueries: results.length,
    };
  }

  /**
   * Evaluate a single query (for interactive evaluation)
   *
   * @param query User query
   * @param relevantChunkIds IDs of relevant chunks (optional, for retrieval metrics)
   * @param topK Top-K for retrieval
   * @returns Evaluation result
   */
  async evaluateSingle(
    query: string,
    relevantChunkIds?: string[],
    topK: number = 5
  ): Promise<EvaluationResult> {
    // VERIFIED: Single query evaluation - confirms single query evaluated through RAG system
    // Generate response
    const response = await this.ragSystem.query(query, topK);

      // Get retrieved chunks by calling RAGSystem's retrieval method
      const allChunks = this.vectorStore.getChunks();
      let retrievedChunks: Chunk[];

      try {
        // Try to use RAGSystem's internal retrieval
        retrievedChunks = await (this.ragSystem as any).retrieveRelevantChunks(query, topK);
      } catch {
        // Fallback: manual retrieval for evaluation
        const { EmbeddingGenerator, cosineSimilarity } = await import('../indexing/embeddings.js');
        const embeddingGenerator = new EmbeddingGenerator();
        const queryEmbedding = await embeddingGenerator.generateEmbedding(query);

        const similarities = allChunks.map((chunk) => ({
          chunk,
          similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
        }));

        similarities.sort((a, b) => b.similarity - a.similarity);
        retrievedChunks = similarities.slice(0, topK).map(item => item.chunk);
      }

    // Evaluate metrics
    const retrievalMetrics = relevantChunkIds
      ? this.retrievalEvaluator.evaluate(retrievedChunks, relevantChunkIds, topK)
      : { precisionAtK: 0, recallAtK: 0, mrr: 0 };

    const generationMetrics = await this.generationEvaluator.evaluate(query, retrievedChunks, response);

    return {
      query,
      retrievalMetrics,
      generationMetrics,
      response,
      retrievedChunks,
    };
  }
}
