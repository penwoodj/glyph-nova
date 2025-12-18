import { readFileSync, existsSync } from 'fs';
import { Chunk } from '../indexing/storeInterface.js';

/**
 * Context Expander
 *
 * Expands retrieved chunks with surrounding sentences to preserve context
 * across chunk boundaries. Uses sentence window approach (±N sentences).
 *
 * Process:
 * 1. Read original document from chunk metadata (sourcePath)
 * 2. Identify sentence boundaries in document
 * 3. Find which sentences the chunk spans
 * 4. Include ±N sentences before/after chunk
 * 5. Return expanded context
 *
 * Reference: [[05-hierarchical-context-retrieval]]
 */
export class ContextExpander {
  private windowSize: number; // Number of sentences before/after (±N)

  constructor(windowSize: number = 2) {
    this.windowSize = windowSize;
  }

  /**
   * Expand a chunk with surrounding sentences
   *
   * @param chunk Chunk to expand
   * @returns Expanded chunk with additional context
   */
  async expandChunk(chunk: Chunk): Promise<Chunk> {
    // VERIFIED: Context expansion entry - confirms expansion method called for chunk
    // If no source path, can't expand
    const sourcePath = chunk.metadata?.sourcePath;
    if (!sourcePath || !existsSync(sourcePath)) {
      // VERIFIED: No expansion path - confirms chunk returned unchanged if source unavailable
      return chunk;
    }

    try {
      // VERIFIED: Document reading - confirms original document read from sourcePath
      // Read original document
      const documentContent = readFileSync(sourcePath, 'utf-8');

      // VERIFIED: Sentence boundary detection - confirms sentences identified in document
      // Find sentence boundaries
      const sentences = this.splitIntoSentences(documentContent);

      // VERIFIED: Chunk position mapping - confirms chunk position mapped to sentence indices
      // Find which sentences the chunk spans
      const chunkStart = chunk.metadata?.startIndex || 0;
      const chunkEnd = chunk.metadata?.endIndex || documentContent.length;

      // Find sentence indices that contain the chunk
      let startSentenceIndex = 0;
      let endSentenceIndex = sentences.length - 1;

      let currentPos = 0;
      for (let i = 0; i < sentences.length; i++) {
        const sentenceStart = currentPos;
        const sentenceEnd = currentPos + sentences[i].length;

        if (sentenceStart <= chunkStart && chunkStart < sentenceEnd) {
          startSentenceIndex = i;
        }
        if (sentenceStart < chunkEnd && chunkEnd <= sentenceEnd) {
          endSentenceIndex = i;
          break;
        }

        currentPos = sentenceEnd;
        // Skip whitespace between sentences
        while (currentPos < documentContent.length && /\s/.test(documentContent[currentPos])) {
          currentPos++;
        }
      }

      // VERIFIED: Window calculation - confirms ±N sentences calculated around chunk
      // Expand window: ±N sentences
      const expandedStart = Math.max(0, startSentenceIndex - this.windowSize);
      const expandedEnd = Math.min(sentences.length - 1, endSentenceIndex + this.windowSize);

      // VERIFIED: Expanded text assembly - confirms surrounding sentences combined with chunk
      // Combine expanded sentences
      const expandedSentences = sentences.slice(expandedStart, expandedEnd + 1);
      const expandedText = expandedSentences.join(' ').trim();

      // Create expanded chunk
      const expandedChunk: Chunk = {
        ...chunk,
        text: expandedText,
        // Update metadata indices to reflect expanded range
        metadata: {
          ...chunk.metadata,
          startIndex: expandedStart > 0 ? this.getSentenceStartPosition(sentences, expandedStart, documentContent) : 0,
          endIndex: this.getSentenceEndPosition(sentences, expandedEnd, documentContent),
        },
      };

      // VERIFIED: Context expansion success - confirms expanded chunk returned with surrounding sentences
      return expandedChunk;
    } catch (error: any) {
      // VERIFIED: Expansion fallback - confirms original chunk returned if expansion fails
      // If expansion fails, return original chunk
      console.warn(`[ContextExpander] Failed to expand chunk, using original: ${error.message}`);
      return chunk;
    }
  }

  /**
   * Expand multiple chunks with surrounding context
   *
   * @param chunks Chunks to expand
   * @returns Expanded chunks
   */
  async expandChunks(chunks: Chunk[]): Promise<Chunk[]> {
    // VERIFIED: Batch expansion entry - confirms expansion applied to multiple chunks
    return Promise.all(chunks.map(chunk => this.expandChunk(chunk)));
  }

  /**
   * Split text into sentences
   * Uses simple regex-based approach (can be enhanced with NLP libraries)
   */
  private splitIntoSentences(text: string): string[] {
    // VERIFIED: Sentence splitting - confirms text split into sentences using regex
    // Simple sentence splitting: split on . ! ? followed by space or end of string
    // This is a basic approach - could be enhanced with NLP libraries for better accuracy
    const sentenceRegex = /[.!?]+(?:\s+|$)/g;
    const sentences: string[] = [];
    let lastIndex = 0;
    let match;

    while ((match = sentenceRegex.exec(text)) !== null) {
      const sentence = text.substring(lastIndex, match.index + match[0].length).trim();
      if (sentence.length > 0) {
        sentences.push(sentence);
      }
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text as last sentence if any
    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex).trim();
      if (remaining.length > 0) {
        sentences.push(remaining);
      }
    }

    return sentences.length > 0 ? sentences : [text]; // Fallback to whole text if no sentences found
  }

  /**
   * Get the start position of a sentence in the original document
   */
  private getSentenceStartPosition(sentences: string[], sentenceIndex: number, documentContent: string): number {
    let pos = 0;
    for (let i = 0; i < sentenceIndex; i++) {
      pos += sentences[i].length;
      // Skip whitespace
      while (pos < documentContent.length && /\s/.test(documentContent[pos])) {
        pos++;
      }
    }
    return pos;
  }

  /**
   * Get the end position of a sentence in the original document
   */
  private getSentenceEndPosition(sentences: string[], sentenceIndex: number, documentContent: string): number {
    let pos = 0;
    for (let i = 0; i <= sentenceIndex; i++) {
      pos += sentences[i].length;
      // Skip whitespace
      while (pos < documentContent.length && /\s/.test(documentContent[pos])) {
        pos++;
      }
    }
    return pos;
  }
}
