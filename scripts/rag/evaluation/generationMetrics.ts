import { spawn } from 'child_process';
import { Chunk } from '../indexing/storeInterface.js';

/**
 * Generation Metrics
 *
 * Implements generation quality evaluation metrics using LLM-as-judge:
 * - Faithfulness: Whether generated response is grounded in retrieved context
 * - Answer Relevance: Whether generated response answers the query
 *
 * Reference: [[07-rag-evaluation-metrics]]
 */

export interface GenerationMetrics {
  faithfulness: number; // 0-1 score
  answerRelevance: number; // 0-1 score
}

export class GenerationMetricsEvaluator {
  private ollamaModel: string;
  private ollamaUrl: string;

  constructor(ollamaModel: string = 'llama2', ollamaUrl: string = 'http://localhost:11434') {
    this.ollamaModel = ollamaModel;
    this.ollamaUrl = ollamaUrl;
  }

  /**
   * Evaluate faithfulness (is response grounded in context?)
   *
   * @param query User query
   * @param context Retrieved context chunks
   * @param response Generated response
   * @returns Faithfulness score (0-1)
   */
  async evaluateFaithfulness(query: string, context: Chunk[], response: string): Promise<number> {
    // VERIFIED: Faithfulness evaluation entry - confirms LLM-as-judge called to evaluate faithfulness
    const contextText = context.map((chunk, i) => `[Context ${i + 1}]\n${chunk.text}`).join('\n\n');

    const prompt = `Evaluate whether the following response is grounded in the provided context.

Query: "${query}"

Context:
${contextText}

Response: "${response}"

Is the response fully supported by the context? Answer with only "yes" or "no".`;

    try {
      const answer = await this.generateWithOllama(prompt);
      const normalized = answer.trim().toLowerCase();

      // VERIFIED: Faithfulness score parsing - confirms LLM response parsed to faithfulness score (0-1)
      if (normalized.includes('yes')) {
        return 1.0;
      } else if (normalized.includes('no')) {
        return 0.0;
      } else {
        // If unclear, return 0.5 (neutral)
        return 0.5;
      }
    } catch (error: any) {
      // VERIFIED: Evaluation fallback - confirms neutral score (0.5) returned if evaluation fails
      console.warn(`[GenerationMetrics] Failed to evaluate faithfulness: ${error.message}`);
      return 0.5; // Neutral score on failure
    }
  }

  /**
   * Evaluate answer relevance (does response answer the query?)
   *
   * @param query User query
   * @param response Generated response
   * @returns Answer relevance score (0-1)
   */
  async evaluateAnswerRelevance(query: string, response: string): Promise<number> {
    // VERIFIED: Relevance evaluation entry - confirms LLM-as-judge called to evaluate answer relevance
    const prompt = `Evaluate whether the following response answers the query.

Query: "${query}"

Response: "${response}"

Does the response answer the query? Answer with only "yes" or "no".`;

    try {
      const answer = await this.generateWithOllama(prompt);
      const normalized = answer.trim().toLowerCase();

      // VERIFIED: Relevance score parsing - confirms LLM response parsed to relevance score (0-1)
      if (normalized.includes('yes')) {
        return 1.0;
      } else if (normalized.includes('no')) {
        return 0.0;
      } else {
        // If unclear, return 0.5 (neutral)
        return 0.5;
      }
    } catch (error: any) {
      // VERIFIED: Evaluation fallback - confirms neutral score (0.5) returned if evaluation fails
      console.warn(`[GenerationMetrics] Failed to evaluate answer relevance: ${error.message}`);
      return 0.5; // Neutral score on failure
    }
  }

  /**
   * Evaluate all generation metrics
   *
   * @param query User query
   * @param context Retrieved context chunks
   * @param response Generated response
   * @returns Generation metrics
   */
  async evaluate(query: string, context: Chunk[], response: string): Promise<GenerationMetrics> {
    // VERIFIED: Generation metrics evaluation - confirms all generation metrics calculated
    const [faithfulness, answerRelevance] = await Promise.all([
      this.evaluateFaithfulness(query, context, response),
      this.evaluateAnswerRelevance(query, response),
    ]);

    return {
      faithfulness,
      answerRelevance,
    };
  }

  /**
   * Generate text using Ollama
   */
  private async generateWithOllama(prompt: string): Promise<string> {
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
        } else {
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
