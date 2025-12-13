# Hybrid Retrieval (Semantic + Keyword)

**Purpose:** Combining semantic and keyword-based retrieval for comprehensive search

**Target:** Developers implementing hybrid search in RAG systems

**Date:** 2025-01-15
**Status:** In Progress
**Part of:** [[README]] - RAG Database Best Practices Report Suite

---

## Executive Summary

Hybrid retrieval combines semantic search (vector similarity) with keyword search (BM25, TF-IDF) to leverage both semantic understanding and exact matching. This report covers semantic search limitations, keyword search fundamentals, hybrid retrieval architectures, result fusion strategies (RRF, weighted), use case selection, and performance considerations.

**Key Insight:** Hybrid retrieval combines the best of semantic understanding and exact matching, improving recall for queries requiring both semantic similarity and keyword precision.

---

## Table of Contents

1. [Semantic Search Limitations](#semantic-search-limitations)
2. [Keyword Search Fundamentals](#keyword-search-fundamentals)
3. [Hybrid Retrieval Architectures](#hybrid-retrieval-architectures)
4. [Result Fusion Strategies](#result-fusion-strategies)
5. [Use Case Selection](#use-case-selection)
6. [Performance Considerations](#performance-considerations)

---

## Semantic Search Limitations

### Limitations

**Issues:**
- May miss exact keyword matches
- Synonyms not always captured
- Domain-specific terms may be misunderstood
- Technical terms may have poor embeddings

### When Semantic Search Fails

**Scenarios:**
- Exact code snippets
- Specific function names
- Technical terminology
- Acronyms and abbreviations
- Proper nouns

**Example:**
```
Query: "getFileTree function"
Semantic Search: May retrieve "file system operations" (related but not exact)
Keyword Search: Would find exact "getFileTree" matches
```

**See Also:** [[01-rag-fundamentals-vector-databases]] for semantic search basics

---

## Keyword Search Fundamentals

### BM25 Algorithm

**Definition:** Best Matching 25 - ranking function for information retrieval.

**Characteristics:**
- Term frequency-based
- Inverse document frequency
- Field length normalization
- Handles exact matches well

### TF-IDF

**Definition:** Term Frequency-Inverse Document Frequency.

**Characteristics:**
- Term frequency weighting
- Inverse document frequency
- Simple and effective
- Good for keyword matching

### Implementation

**Steps:**
1. Build keyword index during indexing
2. Tokenize queries
3. Score documents by keyword matches
4. Rank by relevance score

---

## Hybrid Retrieval Architectures

### Parallel Architecture

**Approach:**
- Run semantic and keyword search in parallel
- Combine results using fusion
- Faster overall retrieval

### Sequential Architecture

**Approach:**
- Run semantic search first
- Refine with keyword search
- More controlled combination

### Adaptive Architecture

**Approach:**
- Choose method based on query type
- Abstract queries → Semantic
- Specific queries → Keyword
- Mixed queries → Hybrid

---

## Result Fusion Strategies

### Reciprocal Rank Fusion (RRF)

**Approach:**
- Combine ranked lists using RRF
- No dependency on scores
- Works well with different methods

**See Also:** [[04-query-expansion-reranking]] for RRF details

### Weighted Fusion

**Approach:**
- Weight semantic and keyword scores
- Combine: `final_score = α × semantic + β × keyword`
- Tune weights based on use case

### Round-Robin Fusion

**Approach:**
- Alternate between result sets
- Interleave results
- Simple but effective

---

## Use Case Selection

### When to Use Semantic Search

**Scenarios:**
- Abstract queries
- Conceptual questions
- Synonym handling
- Related concept retrieval

### When to Use Keyword Search

**Scenarios:**
- Exact matches required
- Code snippets
- Function names
- Technical terms

### When to Use Hybrid

**Scenarios:**
- Mixed query types
- Unknown query characteristics
- Maximum recall needed
- Production systems

---

## Performance Considerations

### Indexing Overhead

**Keyword Index:**
- Additional storage
- Index building time
- Memory usage

### Query Performance

**Semantic Search:**
- Vector similarity computation
- Typically faster

**Keyword Search:**
- Index lookup
- Scoring computation
- Typically faster

**Hybrid:**
- Both operations
- Fusion overhead
- Slightly slower but better results

### Optimization

**Strategies:**
- Cache keyword index
- Parallel execution
- Early termination
- Result limiting

---

## Key Takeaways

1. **Hybrid retrieval combines semantic and keyword** search effectively
2. **BM25 and TF-IDF** provide keyword matching capabilities
3. **RRF and weighted fusion** combine result sets
4. **Use case selection** determines when to use hybrid
5. **Performance trade-offs** exist but are manageable

---

## References

- **Previous Report:** [[01-rag-fundamentals-vector-databases]] - RAG fundamentals
- **Next Report:** [[07-rag-evaluation-metrics]] - Evaluation metrics
- **Fusion:** [[04-query-expansion-reranking]] - RRF details
- **Implementation Plan:** `/home/jon/code/glyph-nova/cursor/docs/plans/rag-system-advanced-improvements.md`

---

**Last Updated:** 2025-01-15
**Version:** 1.0
**Status:** In Progress
