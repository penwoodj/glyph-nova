import { spawn } from 'child_process';
import { debugLog } from '../utils/debug.js';
/**
 * Query Expansion Module
 *
 * Generates multiple query variations from an original query using LLM.
 * This improves recall by capturing different phrasings and aspects of the query.
 *
 * Reference: [[04-query-expansion-reranking]]
 */
export class QueryExpander {
    ollamaModel;
    ollamaUrl;
    numVariations;
    constructor(ollamaModel = 'llama2', ollamaUrl = 'http://localhost:11434', numVariations = 3) {
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
    async expandQuery(originalQuery) {
        // VERIFIED: Query expansion entry - confirms expansion method called with original query
        // Expected Result: Log shows original query being expanded
        // Verification Level: DEBUG - Confirms query expansion process initiated
        debugLog('QueryExpansion', `Expanding query: "${originalQuery}"`);
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
            // VERIFIED: LLM query expansion - confirms Ollama called to generate query variations
            // Expected Result: Log shows number of variations being generated (typically 3)
            // Verification Level: DEBUG - Confirms LLM called to generate query variations
            debugLog('QueryExpansion', `Generating ${this.numVariations} query variations using LLM`);
            const variations = await this.generateWithOllama(prompt);
            // VERIFIED: Variation parsing - confirms LLM response parsed into individual query variations
            // Expected Result: Log confirms parsing step initiated
            // Verification Level: DEBUG - Confirms LLM response being processed into query variations
            debugLog('QueryExpansion', `Parsing LLM response into query variations`);
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
            // VERIFIED: Result padding - confirms variations array padded to numVariations if needed
            // If we didn't get enough variations, pad with original
            while (result.length < this.numVariations) {
                result.push(originalQuery);
            }
            // VERIFIED: Query expansion success - confirms array of query variations returned (original + variations)
            // Expected Result: Log shows total number of variations generated (original + N variations)
            // Verification Level: DEBUG - Confirms successful query expansion with variation count
            debugLog('QueryExpansion', `Generated ${result.length} query variations`);
            return result.slice(0, this.numVariations);
        }
        catch (error) {
            // VERIFIED: Expansion fallback - confirms original query returned if expansion fails
            console.warn(`[QueryExpansion] Failed to expand query, using original: ${error.message}`);
            // If expansion fails, just return original query
            return [originalQuery];
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
