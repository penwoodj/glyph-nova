/**
 * Semantic Chunker
 *
 * Splits text based on semantic coherence by:
 * 1. Splitting text into sentences
 * 2. Generating embeddings for each sentence
 * 3. Calculating similarity between adjacent sentences
 * 4. Detecting topic boundaries (low similarity)
 * 5. Creating chunks at topic boundaries
 *
 * This preserves topic coherence better than fixed-size chunking,
 * leading to 10-15% improvement in retrieval quality.
 *
 * Reference: [[03-advanced-chunking-strategies]]
 */
export class SemanticChunker {
    embeddingGenerator;
    minChunkSize;
    maxChunkSize;
    similarityThreshold;
    constructor(embeddingGenerator, minChunkSize = 200, maxChunkSize = 1000, similarityThreshold = 0.7 // Lower = more chunks (stricter boundaries)
    ) {
        this.embeddingGenerator = embeddingGenerator;
        this.minChunkSize = minChunkSize;
        this.maxChunkSize = maxChunkSize;
        this.similarityThreshold = similarityThreshold;
    }
    /**
     * Split text into sentences
     * Simple approach: split on sentence-ending punctuation
     */
    splitIntoSentences(text) {
        // Split on sentence-ending punctuation followed by space or newline
        const sentences = text
            .split(/([.!?]\s+|[.!?]\n+)/)
            .filter(s => s.trim().length > 0)
            .map(s => s.trim());
        return sentences;
    }
    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have same length');
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        if (denominator === 0) {
            return 0;
        }
        return dotProduct / denominator;
    }
    /**
     * Chunk document using semantic boundaries
     *
     * Process:
     * 1. Split into sentences
     * 2. Generate embeddings for sentences
     * 3. Calculate similarity between adjacent sentences
     * 4. Detect boundaries (similarity < threshold)
     * 5. Create chunks respecting min/max size constraints
     */
    async chunkDocument(content, sourceFile, sourcePath) {
        // VERIFIED: Semantic chunking entry - confirms semantic chunking method called
        // console.log(`[SemanticChunker] Starting semantic chunking (min: ${this.minChunkSize}, max: ${this.maxChunkSize})`);
        // Step 1: Split into sentences
        // VERIFIED: Sentence splitting - confirms text split into individual sentences
        const sentences = this.splitIntoSentences(content);
        // console.log(`[SemanticChunker] Split into ${sentences.length} sentences`);
        if (sentences.length === 0) {
            return [];
        }
        // Step 2: Generate embeddings for each sentence
        // VERIFIED: Sentence embedding generation - confirms embeddings generated for each sentence
        // console.log(`[SemanticChunker] Generating embeddings for ${sentences.length} sentences...`);
        const sentenceEmbeddings = [];
        for (const sentence of sentences) {
            try {
                const embedding = await this.embeddingGenerator.generateEmbedding(sentence);
                sentenceEmbeddings.push(embedding);
            }
            catch (error) {
                // If embedding fails, use a zero vector (will create boundary)
                console.warn(`[SemanticChunker] Failed to generate embedding for sentence, using zero vector: ${error.message}`);
                const dim = this.embeddingGenerator.getEmbeddingDimension();
                sentenceEmbeddings.push(new Array(dim).fill(0));
            }
        }
        // Step 3: Calculate similarity between adjacent sentences
        // VERIFIED: Similarity calculation - confirms cosine similarity computed between adjacent sentences
        const similarities = [];
        for (let i = 0; i < sentenceEmbeddings.length - 1; i++) {
            const similarity = this.cosineSimilarity(sentenceEmbeddings[i], sentenceEmbeddings[i + 1]);
            similarities.push(similarity);
        }
        // Step 4: Detect topic boundaries (low similarity)
        // VERIFIED: Boundary detection - confirms topic boundaries detected where similarity < threshold
        const boundaries = [0]; // Always start with first sentence
        for (let i = 0; i < similarities.length; i++) {
            if (similarities[i] < this.similarityThreshold) {
                boundaries.push(i + 1); // Boundary is after sentence i
            }
        }
        boundaries.push(sentences.length); // Always end with last sentence
        // Step 5: Create chunks at boundaries, respecting min/max size
        // VERIFIED: Chunk creation - confirms chunks created at semantic boundaries with size constraints
        const chunks = [];
        let chunkIndex = 0;
        let currentChunkStart = 0;
        let currentChunkText = '';
        for (let i = 0; i < boundaries.length - 1; i++) {
            const boundaryStart = boundaries[i];
            const boundaryEnd = boundaries[i + 1];
            // Collect sentences for this potential chunk
            const chunkSentences = sentences.slice(boundaryStart, boundaryEnd);
            const chunkText = chunkSentences.join(' ');
            // If adding this chunk would exceed max size, finalize current chunk
            if (currentChunkText.length + chunkText.length > this.maxChunkSize && currentChunkText.length > 0) {
                // Finalize current chunk
                const startIndex = content.indexOf(currentChunkText, currentChunkStart);
                chunks.push({
                    text: currentChunkText.trim(),
                    startIndex: startIndex >= 0 ? startIndex : currentChunkStart,
                    endIndex: startIndex >= 0 ? startIndex + currentChunkText.length : currentChunkStart + currentChunkText.length,
                    chunkIndex: chunkIndex++,
                    sourceFile,
                    sourcePath,
                });
                // Start new chunk
                currentChunkStart = startIndex >= 0 ? startIndex + currentChunkText.length : currentChunkStart + currentChunkText.length;
                currentChunkText = chunkText;
            }
            else {
                // Add to current chunk
                if (currentChunkText.length > 0) {
                    currentChunkText += ' ' + chunkText;
                }
                else {
                    currentChunkText = chunkText;
                }
            }
            // If current chunk meets min size, finalize it
            if (currentChunkText.length >= this.minChunkSize) {
                const startIndex = content.indexOf(currentChunkText, currentChunkStart);
                chunks.push({
                    text: currentChunkText.trim(),
                    startIndex: startIndex >= 0 ? startIndex : currentChunkStart,
                    endIndex: startIndex >= 0 ? startIndex + currentChunkText.length : currentChunkStart + currentChunkText.length,
                    chunkIndex: chunkIndex++,
                    sourceFile,
                    sourcePath,
                });
                // Reset for next chunk
                currentChunkStart = startIndex >= 0 ? startIndex + currentChunkText.length : currentChunkStart + currentChunkText.length;
                currentChunkText = '';
            }
        }
        // Add any remaining text as final chunk
        if (currentChunkText.trim().length > 0) {
            const startIndex = content.indexOf(currentChunkText, currentChunkStart);
            chunks.push({
                text: currentChunkText.trim(),
                startIndex: startIndex >= 0 ? startIndex : currentChunkStart,
                endIndex: startIndex >= 0 ? startIndex + currentChunkText.length : currentChunkStart + currentChunkText.length,
                chunkIndex: chunkIndex++,
                sourceFile,
                sourcePath,
            });
        }
        // VERIFIED: Semantic chunking completion - confirms chunks created with semantic boundaries preserved
        // console.log(`[SemanticChunker] Created ${chunks.length} semantic chunks`);
        return chunks;
    }
}
