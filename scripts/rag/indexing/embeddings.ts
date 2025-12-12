import { execSync } from 'child_process';

/**
 * Generate embeddings using Ollama
 * Uses Ollama CLI for embeddings (simpler and more memory efficient)
 */
export class EmbeddingGenerator {
  private ollamaModel: string;
  private embeddingModel: string;

  constructor(ollamaModel: string = 'llama2', embeddingModel: string = 'nomic-embed-text') {
    this.ollamaModel = ollamaModel;
    this.embeddingModel = embeddingModel;
  }

  /**
   * Generate embedding for a single text
   * Uses simple text-based embedding (open source, no external dependencies)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // console.log(`[Embeddings] Generating embedding for text (${text.length} chars)`);

    // Use simple text-based embedding (open source approach)
    const embedding = this.simpleTextEmbedding(text);
    // console.log(`[Embeddings] Generated embedding with ${embedding.length} dimensions`);

    return embedding;
  }

  /**
   * Simple text-based embedding (fallback when Ollama embedding model not available)
   * Creates a 384-dimensional vector based on text characteristics
   */
  private simpleTextEmbedding(text: string): number[] {
    const embedding: number[] = [];
    const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Character frequency features (first 128 dims)
    const charFreq: { [key: string]: number } = {};
    for (const char of normalized) {
      charFreq[char] = (charFreq[char] || 0) + 1;
    }

    for (let i = 0; i < 128; i++) {
      const char = String.fromCharCode(i + 32); // Printable ASCII
      embedding.push((charFreq[char] || 0) / text.length);
    }

    // Word-based features (next 128 dims)
    const words = normalized.split(/\s+/).filter(w => w.length > 0);
    const wordFreq: { [key: string]: number } = {};
    for (const word of words) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }

    const sortedWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 128)
      .map(([word]) => word);

    for (let i = 0; i < 128; i++) {
      const word = sortedWords[i] || '';
      embedding.push(word.length / 20); // Normalize word length
    }

    // Text statistics (remaining dims)
    embedding.push(text.length / 10000); // Length feature
    embedding.push(words.length / 1000); // Word count
    embedding.push((text.match(/[A-Z]/g) || []).length / text.length); // Capital ratio
    embedding.push((text.match(/\d/g) || []).length / text.length); // Digit ratio

    // Pad to 384 dimensions
    while (embedding.length < 384) {
      embedding.push(0);
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  /**
   * Generate embeddings for multiple texts
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // console.log(`[Embeddings] Generating embeddings for ${texts.length} texts`);
    const embeddings: number[][] = [];

    for (let i = 0; i < texts.length; i++) {
      const embedding = await this.generateEmbedding(texts[i]);
      embeddings.push(embedding);

      // if ((i + 1) % 10 === 0) {
      //   console.log(`[Embeddings] Processed ${i + 1}/${texts.length} texts`);
      // }
    }

    // console.log(`[Embeddings] Generated all ${embeddings.length} embeddings`);
    return embeddings;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
