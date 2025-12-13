# Query Expansion & Reranking

**Purpose:** Techniques for improving retrieval precision and recall through query expansion and reranking

**Target:** Developers optimizing RAG retrieval quality

**Date:** 2025-01-15
**Status:** In Progress
**Part of:** [[README]] - RAG Database Best Practices Report Suite

---

## Executive Summary

Query expansion generates multiple query variations to improve recall, while reranking improves precision by filtering and reordering initial retrieval results. This report covers query expansion techniques, multi-query generation, Reciprocal Rank Fusion (RRF) algorithm, reranking strategies (cross-encoder and LLM-based), precision vs. recall optimization, and post-processing patterns.

**Key Insights:**
- Query expansion with RRF improves recall by 20-30% for abstract queries
- Reranking improves precision by 15-25% by filtering false positives
- Multi-query generation handles ambiguous abstract queries better
- Post-processing enables abstraction expansion and contraction

---

## Table of Contents

1. [Query Expansion Techniques](#query-expansion-techniques)
2. [Multi-Query Generation](#multi-query-generation)
3. [Reciprocal Rank Fusion (RRF)](#reciprocal-rank-fusion-rrf)
4. [Reranking Strategies](#reranking-strategies)
5. [Precision vs. Recall Optimization](#precision-vs-recall-optimization)
6. [Post-Processing Patterns](#post-processing-patterns)

---

## Query Expansion Techniques

### Concept

**Definition:** Generate multiple query variations from the original query to improve retrieval coverage.

### Techniques

**Synonym Expansion:**
- Replace words with synonyms
- Handles vocabulary variations

**Paraphrasing:**
- Generate paraphrased versions
- Captures different phrasings

**Concept Expansion:**
- Add related concepts
- Broadens query scope

**LLM-Based Expansion:**
- Use LLM to generate variations
- Most flexible and context-aware

**See Also:** [[08-abstraction-aware-rag-patterns]] for abstraction handling

---

## Multi-Query Generation

### Process

**Steps:**
1. Original query provided
2. LLM generates 3-5 query variations
3. Each variation retrieves chunks
4. Results combined using RRF
5. Final ranked list produced

### Benefits

**Advantages:**
- Handles ambiguous queries
- Improves recall significantly
- Better for abstract queries
- Captures multiple query aspects

**Example:**
```
Original: "file tree component"
Variations:
  - "directory structure UI"
  - "folder navigation interface"
  - "file browser component"
  - "hierarchical file display"
```

---

## Reciprocal Rank Fusion (RRF)

### Algorithm

**Formula:**
```
RRF_score(d) = Σ(1 / (k + rank_i(d)))
```

Where:
- `d` = document/chunk
- `n` = number of ranked lists
- `rank_i(d)` = rank of document in list i
- `k` = constant (typically 60)

### Implementation

**Steps:**
1. Retrieve chunks for each query variation
2. Calculate RRF score for each chunk
3. Sort by RRF score
4. Deduplicate results
5. Return top-K chunks

### Benefits

**Advantages:**
- Combines multiple result sets effectively
- Emphasizes documents appearing in multiple lists
- No dependency on original scores
- Works well with different retrieval methods

---

## Reranking Strategies

### Purpose

**Why Rerank:**
- Initial retrieval may have false positives
- Cosine similarity isn't perfect
- Precision can be improved significantly

### Cross-Encoder Reranking

**Approach:**
- Use cross-encoder model (e.g., ms-marco-MiniLM-L-6-v2)
- Score query-chunk pairs directly
- More accurate than embedding similarity

**Limitations:**
- Requires specialized model
- Slower than embedding search
- May not be available locally

### LLM-Based Reranking

**Approach:**
- Use LLM (via Ollama) to score relevance
- Prompt: "Rate relevance 0-1: query + chunk"
- Sort by relevance score

**Advantages:**
- Uses existing LLM infrastructure
- Context-aware scoring
- Flexible and adaptable

**Process:**
1. Retrieve top-20 candidates
2. Score each with LLM
3. Sort by score
4. Return top-5

**See Also:** [[07-rag-evaluation-metrics]] for measuring improvements

---

## Precision vs. Recall Optimization

### Trade-offs

**High Recall:**
- Query expansion
- Larger top-K
- Multiple retrieval passes
- Risk: More false positives

**High Precision:**
- Reranking
- Smaller top-K
- Metadata filtering
- Risk: Missing relevant chunks

### Balanced Approach

**Strategy:**
1. Broad retrieval (topK=20) for recall
2. Rerank to top-5 for precision
3. Use query expansion for abstract queries
4. Use reranking for precision-critical queries

---

## Post-Processing Patterns

### Context Expansion

**After Retrieval:**
- Expand chunks with surrounding sentences
- Include parent chunks (hierarchical)
- Add related chunks

**See Also:** [[05-hierarchical-context-retrieval]] for context expansion

### Deduplication

**Remove Duplicates:**
- Same chunk retrieved multiple times
- Overlapping chunks
- Similar content

### Aggregation

**Combine Related Chunks:**
- Group by source document
- Merge overlapping content
- Create comprehensive context

### Abstraction Expansion/Contraction

**Dynamic Adjustment:**
- Expand: Add more context for abstract queries
- Contract: Focus on specific chunks for concrete queries
- Balance based on query type

**See Also:** [[08-abstraction-aware-rag-patterns]] for abstraction patterns

---

## Key Takeaways

1. **Query expansion improves recall** by 20-30% for abstract queries
2. **RRF effectively combines** multiple result sets
3. **Reranking improves precision** by 15-25% by filtering false positives
4. **Multi-query generation** handles ambiguous queries better
5. **Post-processing enables** abstraction expansion and contraction

---

## References

- **Previous Report:** [[01-rag-fundamentals-vector-databases]] - RAG fundamentals
- **Next Report:** [[05-hierarchical-context-retrieval]] - Hierarchical retrieval
- **Evaluation:** [[07-rag-evaluation-metrics]] - Measuring improvements
- **Abstraction:** [[08-abstraction-aware-rag-patterns]] - Abstraction patterns
- **Implementation Plan:** `/home/jon/code/glyph-nova/cursor/docs/plans/rag-system-advanced-improvements.md`

---

**Last Updated:** 2025-01-15
**Version:** 1.0
**Status:** In Progress
