# Embedding Models & Ollama Integration

**Purpose:** Embedding model comparison and Ollama integration patterns for RAG systems

**Target:** Developers implementing embedding generation in RAG systems

**Date:** 2025-01-15
**Status:** In Progress
**Part of:** [[README]] - RAG Database Best Practices Report Suite

---

## Executive Summary

Embeddings are numerical representations of text that capture semantic meaning. This report compares simple text-based embeddings with semantic embeddings, details Ollama's embedding API integration, covers the `nomic-embed-text` model specifications, provides Node.js integration patterns, discusses performance considerations, and outlines migration strategies from simple embeddings.

**Key Insights:**
- Semantic embeddings provide 3-5x better retrieval accuracy than simple embeddings
- Ollama's `/api/embed` endpoint enables local embedding generation
- `nomic-embed-text` provides 768-dimensional embeddings optimized for semantic search
- Migration requires handling dimension changes and backward compatibility

---

## Table of Contents

1. [Embedding Model Comparison](#embedding-model-comparison)
2. [Ollama Embeddings API](#ollama-embeddings-api)
3. [nomic-embed-text Model Specifications](#nomic-embed-text-model-specifications)
4. [Node.js Integration Patterns](#nodejs-integration-patterns)
5. [Performance Considerations](#performance-considerations)
6. [Migration from Simple Embeddings](#migration-from-simple-embeddings)

---

## Embedding Model Comparison

### Simple Text-Based Embeddings

**Characteristics:**
- Character/word frequency-based
- Statistical feature extraction
- Fast generation
- Limited semantic understanding
- Good for exact match scenarios

**Limitations:**
- Poor handling of synonyms
- Limited abstract query understanding
- Context-insensitive
- Lower retrieval accuracy

### Semantic Embeddings

**Characteristics:**
- Neural network-based
- Capture semantic relationships
- Better for abstract queries
- Context-aware
- Higher retrieval accuracy

**Advantages:**
- 3-5x better retrieval accuracy
- Handles synonyms and related concepts
- Understands abstract queries
- Better semantic similarity matching

**See Also:** [[01-rag-fundamentals-vector-databases]] for embedding fundamentals

---

## Ollama Embeddings API

### API Endpoint

**Endpoint:** `POST http://localhost:11434/api/embed`

**Request Format:**
```json
{
  "model": "nomic-embed-text",
  "input": "text to embed"
}
```

**Response Format:**
```json
{
  "embedding": [0.123, -0.456, ...]
}
```

### Integration Requirements

**Prerequisites:**
- Ollama service running on localhost:11434
- `nomic-embed-text` model downloaded: `ollama pull nomic-embed-text`
- Node.js HTTP client (axios or fetch)

**See Also:** Implementation plan for detailed integration steps

---

## nomic-embed-text Model Specifications

### Model Details

**Dimensions:** 768
**Type:** Text embedding model
**Optimized For:** Semantic search and retrieval
**Context Length:** Up to 8192 tokens

### Performance Characteristics

**Speed:** ~50-100ms per embedding (depends on hardware)
**Accuracy:** High semantic similarity matching
**Memory:** Moderate (model size ~274MB)

---

## Node.js Integration Patterns

### Basic Integration

```typescript
async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('http://localhost:11434/api/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'nomic-embed-text',
      input: text
    })
  });
  
  const data = await response.json();
  return data.embedding;
}
```

### Error Handling

- Handle Ollama service unavailable
- Implement fallback to simple embeddings
- Add retry logic for transient failures
- Log errors for debugging

### Performance Optimization

- Batch embedding requests when possible
- Cache embeddings for repeated text
- Use connection pooling
- Implement rate limiting

**See Also:** Implementation plan for complete integration code

---

## Performance Considerations

### Speed Comparison

**Simple Embeddings:**
- Generation: <1ms
- No network overhead
- CPU-bound

**Ollama Embeddings:**
- Generation: 50-100ms
- Network overhead: 5-10ms
- GPU-accelerated (if available)

### Trade-offs

**When to Use Simple Embeddings:**
- Very large datasets requiring fast indexing
- Exact match scenarios
- Offline operation required
- Limited computational resources

**When to Use Ollama Embeddings:**
- Abstract query handling required
- Quality over speed priority
- Semantic similarity important
- GPU resources available

---

## Migration from Simple Embeddings

### Dimension Handling

**Challenge:** Simple embeddings may have different dimensions than semantic embeddings

**Solution:**
- Store dimension metadata in vector stores
- Support multiple dimension formats
- Migration scripts for existing stores
- Backward compatibility mode

### Migration Strategy

1. **Add Dimension Metadata:** Update vector stores to track dimensions
2. **Dual Support:** Support both embedding types during transition
3. **Gradual Migration:** Re-index documents with new embeddings
4. **Validation:** Verify retrieval quality improvement

**See Also:** Implementation plan for migration steps

---

## Key Takeaways

1. **Semantic embeddings provide 3-5x better accuracy** than simple embeddings
2. **Ollama API enables local embedding generation** without external services
3. **nomic-embed-text provides 768-dimensional embeddings** optimized for semantic search
4. **Migration requires dimension handling** and backward compatibility
5. **Performance trade-offs** exist between speed and accuracy

---

## References

- **Previous Report:** [[01-rag-fundamentals-vector-databases]] - RAG fundamentals
- **Next Report:** [[03-advanced-chunking-strategies]] - Chunking strategies
- **Evaluation:** [[07-rag-evaluation-metrics]] - Performance measurement
- **Implementation Plan:** `/home/jon/code/glyph-nova/cursor/docs/plans/rag-system-advanced-improvements.md`

---

**Last Updated:** 2025-01-15
**Version:** 1.0
**Status:** In Progress
