import { spawn } from 'child_process';
/**
 * LLM-Based Reranker
 *
 * Uses Ollama LLM to score query-chunk pairs for relevance (0-1 scale).
 * More accurate than embedding similarity alone, especially for filtering false positives.
 *
 * Process:
 * 1. Score each chunk with LLM (query + chunk → relevance score 0-1)
 * 2. Sort chunks by relevance score
 * 3. Return top-K most relevant chunks
 */
export class LLMReranker {
    ollamaModel;
    ollamaUrl;
    constructor(ollamaModel = 'llama2', ollamaUrl = 'http://localhost:11434') {
        this.ollamaModel = ollamaModel;
        this.ollamaUrl = ollamaUrl;
    }
    /**
     * Rerank chunks by relevance to query using LLM scoring
     *
     * @param query User query
     * @param chunks Chunks to rerank (typically top-20 from initial retrieval)
     * @returns Reranked chunks sorted by relevance score (highest first)
     */
    async rerank(query, chunks) {
        // VERIFIED: Reranking entry - confirms reranking method called with query and chunks
        if (chunks.length === 0) {
            return [];
        }
        // If only one chunk, no need to rerank
        if (chunks.length === 1) {
            return chunks;
        }
        // VERIFIED: LLM scoring - confirms each chunk scored individually for relevance
        // Score each chunk with LLM
        const scoredChunks = await Promise.all(chunks.map(async (chunk) => {
            const score = await this.scoreRelevance(query, chunk);
            return { chunk, score };
        }));
        // VERIFIED: Relevance scoring - confirms chunks scored 0-1 based on query relevance
        // Sort by score (descending) and return chunks
        scoredChunks.sort((a, b) => b.score - a.score);
        // VERIFIED: Reranking result - confirms chunks returned sorted by relevance score
        return scoredChunks.map(item => item.chunk);
    }
    /**
     * Score relevance of a chunk to a query using LLM
     *
     * @param query User query
     * @param chunk Chunk to score
     * @returns Relevance score (0-1, where 1 is most relevant)
     */
    async scoreRelevance(query, chunk) {
        const prompt = `Rate the relevance of this chunk to the query on a scale of 0.0 to 1.0, where:
- 1.0 = Perfectly relevant, directly answers the query
- 0.7-0.9 = Highly relevant, contains important information
- 0.4-0.6 = Somewhat relevant, tangentially related
- 0.1-0.3 = Low relevance, minimal connection
- 0.0 = Not relevant at all

Query: "${query}"

Chunk:
${chunk.text}

Respond with ONLY a number between 0.0 and 1.0 (e.g., 0.85):`;
        try {
            // VERIFIED: LLM relevance scoring - confirms Ollama called to score query-chunk relevance
            const response = await this.generateWithOllama(prompt);
            // VERIFIED: Score parsing - confirms LLM response parsed to numeric score (0-1)
            // Parse score from response (extract first number)
            const scoreMatch = response.match(/(\d+\.?\d*)/);
            if (scoreMatch) {
                const score = parseFloat(scoreMatch[1]);
                // Clamp to 0-1 range
                return Math.max(0, Math.min(1, score));
            }
            // If parsing fails, return 0.5 (neutral score)
            console.warn(`[Reranker] Failed to parse score from response: "${response}", using 0.5`);
            return 0.5;
        }
        catch (error) {
            // VERIFIED: Scoring fallback - confirms neutral score (0.5) returned if scoring fails
            // If scoring fails, return neutral score
            console.warn(`[Reranker] Failed to score chunk, using neutral score: ${error.message}`);
            return 0.5;
        }
    }
    /**
     * Generate text using Ollama
     */
    async generateWithOllama(prompt) {
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
            echo.on('error', (error) => {
                reject(new Error(`Failed to spawn echo: ${error.message}`));
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
            echo.stdin.end();
        });
    }
}
