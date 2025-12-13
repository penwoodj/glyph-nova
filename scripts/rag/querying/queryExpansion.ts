import { spawn } from 'child_process';

/**
 * Query Expansion Module
 *
 * Generates multiple query variations from an original query using LLM.
 * This improves recall by capturing different phrasings and aspects of the query.
 *
 * Reference: [[04-query-expansion-reranking]]
 */
export class QueryExpander {
  private ollamaModel: string;
  private ollamaUrl: string;
  private numVariations: number;

  constructor(
    ollamaModel: string = 'llama2',
    ollamaUrl: string = 'http://localhost:11434',
    numVariations: number = 3
  ) {
    this.ollamaModel = ollamaModel;
    this.ollamaUrl = ollamaUrl;
    this.numVariations = Math.max(2, Math.min(5, numVariations)); // Clamp between 2-5
  }

  /**
   * Expand a query into multiple variations using LLM
   *
   * Uses Ollama to generate 3-5 query variations that capture different
   * phrasings, synonyms, and aspects of the original query.
   *
   * @param originalQuery The original query to expand
   * @returns Array of query variations (includes original as first element)
   */
  async expandQuery(originalQuery: string): Promise<string[]> {
    // If only 1 variation requested, just return original
    if (this.numVariations === 1) {
      return [originalQuery];
    }

    const prompt = `Generate ${this.numVariations} different variations of this query. Each variation should:
- Capture different phrasings or synonyms
- Focus on different aspects if the query is complex
- Be concise (1-2 sentences max)
- Be semantically similar but use different wording

Original query: "${originalQuery}"

Generate ${this.numVariations} variations, one per line, without numbering or bullets:`;

    try {
      const variations = await this.generateWithOllama(prompt);

      // Parse variations (one per line)
      const lines = variations
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.match(/^(variation|query|1|2|3|4|5)[:.)]/i));

      // Include original as first, then add variations (up to numVariations)
      const result = [originalQuery];
      for (let i = 0; i < Math.min(lines.length, this.numVariations - 1); i++) {
        if (lines[i] && lines[i].length > 0) {
          result.push(lines[i]);
        }
      }

      // If we didn't get enough variations, pad with original
      while (result.length < this.numVariations) {
        result.push(originalQuery);
      }

      return result.slice(0, this.numVariations);
    } catch (error: any) {
      // If expansion fails, just return original query
      console.warn(`[QueryExpansion] Failed to expand query, using original: ${error.message}`);
      return [originalQuery];
    }
  }

  /**
   * Generate text using Ollama
   */
  private async generateWithOllama(prompt: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
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

      echo.on('error', (error) => {
        reject(new Error(`Failed to spawn echo: ${error.message}`));
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

      echo.stdin.end();
    });
  }
}
