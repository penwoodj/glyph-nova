import { Chunk } from '../indexing/storeInterface.js';
import { debugLog } from '../utils/debug.js';

/**
 * Reciprocal Rank Fusion (RRF) Algorithm
 *
 * Combines multiple ranked lists of chunks into a single ranked list.
 * Uses the RRF formula to score chunks based on their ranks across multiple lists.
 *
 * Formula: RRF_score(d) = Σ(1 / (k + rank_i(d)))
 * Where k is a constant (typically 60) and rank_i(d) is the rank of document d in list i.
 *
 * Reference: [[04-query-expansion-reranking]]
 */
export class ReciprocalRankFusion {
  private k: number;

  constructor(k: number = 60) {
    this.k = k;
  }

  /**
   * Fuse multiple ranked lists of chunks using RRF
   *
   * @param rankedLists Array of ranked chunk lists (each list is already sorted by relevance)
   * @param topK Number of top chunks to return after fusion
   * @returns Fused and deduplicated list of chunks, sorted by RRF score
   */
  fuse(rankedLists: Chunk[][], topK: number = 10): Chunk[] {
    // VERIFIED: RRF fusion entry - confirms fusion method called with multiple ranked lists
    // Expected Result: Log shows number of lists being fused and top-K value
    // Verification Level: DEBUG - Confirms RRF fusion process initiated with list count
    debugLog('RRF', `Fusing ${rankedLists.length} ranked lists, returning top-${topK}`);
    if (rankedLists.length === 0) {
      return [];
    }

    // VERIFIED: Single list handling - confirms direct return when only one list provided
    // If only one list, just return top-K
    if (rankedLists.length === 1) {
      return rankedLists[0].slice(0, topK);
    }

    // VERIFIED: RRF score calculation - confirms RRF algorithm applied: score = Σ(1 / (k + rank))
    // Expected Result: Log shows RRF parameter k (typically 60)
    // Verification Level: DEBUG - Confirms RRF algorithm parameters and score calculation
    debugLog('RRF', `Calculating RRF scores with k=${this.k}`);
    // Calculate RRF scores for each chunk
    const chunkScores = new Map<string, { chunk: Chunk; score: number }>();

    for (let listIndex = 0; listIndex < rankedLists.length; listIndex++) {
      const list = rankedLists[listIndex];

      for (let rank = 0; rank < list.length; rank++) {
        const chunk = list[rank];

        // Create unique key for chunk (using text + source file)
        const key = this.getChunkKey(chunk);

        // VERIFIED: RRF contribution calculation - confirms formula: 1 / (k + rank + 1) where k=60
        // Calculate RRF contribution: 1 / (k + rank)
        // rank is 0-indexed, so we add 1 to get 1-indexed rank
        const rrfContribution = 1 / (this.k + rank + 1);

        if (chunkScores.has(key)) {
          // VERIFIED: Score accumulation - confirms chunks appearing in multiple lists get higher scores
          // Add to existing score
          chunkScores.get(key)!.score += rrfContribution;
        } else {
          // Initialize score
          chunkScores.set(key, {
            chunk,
            score: rrfContribution,
          });
        }
      }
    }

    // VERIFIED: Final ranking - confirms chunks sorted by RRF score and top-K returned
    // Expected Result: Log shows number of unique chunks being ranked
    // Verification Level: DEBUG - Confirms final ranking step with unique chunk count
    debugLog('RRF', `Ranking ${chunkScores.size} unique chunks by RRF score`);
    // Convert to array, sort by score (descending), and return top-K
    const sorted = Array.from(chunkScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.chunk);

    return sorted;
  }

  /**
   * Get a unique key for a chunk
   * Uses text and source file to identify chunks
   */
  private getChunkKey(chunk: Chunk): string {
    const source = chunk.metadata.sourceFile || chunk.metadata.sourcePath || '';
    const start = chunk.metadata.startIndex || 0;
    // Use text + source + start index as key
    return `${source}:${start}:${chunk.text.substring(0, 50)}`;
  }

  /**
   * Fuse results with similarity scores
   *
   * Alternative method that also considers similarity scores from each list.
   * Combines RRF with weighted similarity scores.
   *
   * @param rankedResults Array of {chunk, similarity} objects, each list sorted by similarity
   * @param topK Number of top chunks to return
   * @returns Fused list of chunks
   */
  fuseWithSimilarities(
    rankedResults: Array<{ chunk: Chunk; similarity: number }>[],
    topK: number = 10
  ): Chunk[] {
    if (rankedResults.length === 0) {
      return [];
    }

    if (rankedResults.length === 1) {
      return rankedResults[0].slice(0, topK).map(r => r.chunk);
    }

    const chunkScores = new Map<string, { chunk: Chunk; score: number }>();

    for (let listIndex = 0; listIndex < rankedResults.length; listIndex++) {
      const list = rankedResults[listIndex];

      for (let rank = 0; rank < list.length; rank++) {
        const { chunk, similarity } = list[rank];
        const key = this.getChunkKey(chunk);

        // RRF contribution
        const rrfContribution = 1 / (this.k + rank + 1);

        // Optional: Also weight by similarity (normalized)
        // This gives a hybrid score: RRF + similarity
        const weightedScore = rrfContribution + (similarity * 0.1); // Small weight for similarity

        if (chunkScores.has(key)) {
          chunkScores.get(key)!.score += weightedScore;
        } else {
          chunkScores.set(key, {
            chunk,
            score: weightedScore,
          });
        }
      }
    }

    const sorted = Array.from(chunkScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.chunk);

    return sorted;
  }
}
