export class KeywordSearcher {
    index;
    k1; // BM25 parameter (term frequency saturation)
    b; // BM25 parameter (length normalization)
    constructor(k1 = 1.5, b = 0.75) {
        this.k1 = k1;
        this.b = b;
        this.index = {
            termFrequencies: new Map(),
            documentLengths: new Map(),
            documentCount: 0,
            averageDocumentLength: 0,
        };
    }
    /**
     * Build keyword index from chunks
     *
     * @param chunks Chunks to index
     */
    buildIndex(chunks) {
        // VERIFIED: Index building entry - confirms keyword index built from chunks
        this.index.termFrequencies.clear();
        this.index.documentLengths.clear();
        this.index.documentCount = chunks.length;
        // Build term frequency map for each chunk
        for (const chunk of chunks) {
            const chunkId = this.getChunkId(chunk);
            const tokens = this.tokenize(chunk.text);
            const termFreq = new Map();
            // Count term frequencies
            for (const token of tokens) {
                termFreq.set(token, (termFreq.get(token) || 0) + 1);
            }
            // Store document length
            this.index.documentLengths.set(chunkId, tokens.length);
            // Store term frequencies
            for (const [term, freq] of termFreq.entries()) {
                if (!this.index.termFrequencies.has(term)) {
                    this.index.termFrequencies.set(term, new Map());
                }
                this.index.termFrequencies.get(term).set(chunkId, freq);
            }
        }
        // VERIFIED: Index statistics - confirms average document length calculated
        // Calculate average document length
        if (this.index.documentCount > 0) {
            const totalLength = Array.from(this.index.documentLengths.values()).reduce((a, b) => a + b, 0);
            this.index.averageDocumentLength = totalLength / this.index.documentCount;
        }
    }
    /**
     * Search chunks using BM25
     *
     * @param query Search query
     * @param chunks All chunks to search
     * @param topK Number of top results to return
     * @returns Top-K chunks ranked by BM25 score
     */
    search(query, chunks, topK = 10) {
        // VERIFIED: BM25 search entry - confirms keyword search performed with BM25 algorithm
        if (this.index.documentCount === 0) {
            // Build index if not already built
            this.buildIndex(chunks);
        }
        const queryTerms = this.tokenize(query);
        if (queryTerms.length === 0) {
            return [];
        }
        // VERIFIED: BM25 score calculation - confirms BM25 scores calculated for each chunk
        // Calculate BM25 scores
        const scores = new Map();
        for (const chunk of chunks) {
            const chunkId = this.getChunkId(chunk);
            let score = 0;
            for (const term of queryTerms) {
                const termScore = this.calculateBM25Score(term, chunkId);
                score += termScore;
            }
            scores.set(chunkId, score);
        }
        // VERIFIED: Result ranking - confirms chunks ranked by BM25 score and top-K returned
        // Rank chunks by score
        const ranked = Array.from(scores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, topK);
        // Map back to chunks
        const chunkMap = new Map(chunks.map(c => [this.getChunkId(c), c]));
        return ranked
            .map(([chunkId]) => chunkMap.get(chunkId))
            .filter((chunk) => chunk !== undefined);
    }
    /**
     * Calculate BM25 score for a term in a document
     */
    calculateBM25Score(term, chunkId) {
        // VERIFIED: BM25 formula application - confirms BM25 formula applied: IDF × (TF × (k1 + 1)) / (TF + k1 × (1 - b + b × (DL / avgDL)))
        const termFreqMap = this.index.termFrequencies.get(term);
        if (!termFreqMap) {
            return 0; // Term not in any document
        }
        const termFreq = termFreqMap.get(chunkId) || 0;
        const documentLength = this.index.documentLengths.get(chunkId) || 1;
        const avgDocLength = this.index.averageDocumentLength || 1;
        // Calculate IDF (Inverse Document Frequency)
        const documentsWithTerm = termFreqMap.size;
        const idf = Math.log((this.index.documentCount - documentsWithTerm + 0.5) / (documentsWithTerm + 0.5) + 1);
        // Calculate BM25 score
        const numerator = termFreq * (this.k1 + 1);
        const denominator = termFreq + this.k1 * (1 - this.b + this.b * (documentLength / avgDocLength));
        return idf * (numerator / denominator);
    }
    /**
     * Tokenize text into terms
     */
    tokenize(text) {
        // VERIFIED: Tokenization - confirms text tokenized into lowercase terms
        // Simple tokenization: lowercase, split on non-word characters
        return text
            .toLowerCase()
            .split(/\W+/)
            .filter(token => token.length > 0);
    }
    /**
     * Generate unique ID for a chunk
     */
    getChunkId(chunk) {
        return `${chunk.metadata.sourcePath || ''}_${chunk.metadata.chunkIndex}_${chunk.metadata.startIndex}_${chunk.metadata.endIndex}`;
    }
}
