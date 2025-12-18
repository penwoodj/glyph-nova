# GPU Performance Issue Investigation and Resolution Plan

**Purpose:** Investigate and resolve GPU-related performance issues causing application failures when GPU usage reaches 100%

**Date:** 2025-01-15
**Version:** 1.0
**Status:** In Progress
**Priority:** High
**Estimated Time:** 8-12 hours

---

## Executive Summary

**Problem:** Application breaks/hangs when GPU usage reaches 100% during RAG operations.

**Root Cause Identified:**
- Model (`llama2:latest`) is already quantized (Q4_0), so model size is NOT the issue
- **Primary Issue:** Concurrent LLM operations using `Promise.all()` causing GPU saturation
  - Reranking scores multiple chunks concurrently (`reranker.ts` line 63)
  - Generation metrics evaluates faithfulness + relevance concurrently (`generationMetrics.ts` line 120)

**Solution Strategy:**
1. **Immediate Fix:** Change concurrent operations to sequential execution
2. **Monitoring:** Add GPU usage monitoring (process-level for AMD GPU)
3. **Resource Management:** Implement operation queuing/throttling
4. **Validation:** Comprehensive testing with GPU monitoring

**Critical Fixes Required:**
1. **CRITICAL:** Fix reranking sequential execution (most likely cause)
2. **HIGH:** Fix generation metrics sequential execution
3. **MEDIUM:** Add GPU monitoring and resource management

**Validation Criteria:**
- GPU usage < 80% during normal operations
- No application failures during GPU-intensive operations
- Sequential execution confirmed in debug logs
- Response quality maintained

---

## Problem Statement

### Observed Symptoms
- Application appears to break/hang when GPU usage reaches 100%
- GPU spikes to 100% during RAG query operations
- System becomes unresponsive during high GPU usage periods
- Terminal shows repeated GPU spikes (95-100%) during RAG operations
- No clear error messages, but application behavior becomes erratic

### Hypothesis
1. **Concurrent Operations:** Multiple simultaneous LLM calls causing GPU saturation (MOST LIKELY)
   - Query expansion generates 3+ concurrent LLM calls
   - Reranking scores multiple chunks concurrently
   - No operation queuing/throttling
2. **Memory Management:** GPU memory not being released between operations
3. **Process-Level Issues:** Ollama processes accumulating GPU memory
4. **Model Already Quantized:** `llama2:latest` uses Q4_0 (4-bit) quantization, so model size is not the issue
5. **Resource Management:** Lack of GPU operation queuing/throttling
6. **GPU Monitoring Gap:** No visibility into actual GPU usage during operations

### Impact
- **Severity:** High - Application becomes unusable during peak operations
- **Frequency:** Occurs consistently when GPU reaches 100%
- **User Experience:** Complete application failure during normal usage

---

## Investigation Phase

### Step 1: Baseline Measurement and Monitoring

**Time:** 2-3 hours
**Status:** Pending

#### 1.1: Create GPU/CPU Monitoring Script
**File:** `scripts/rag/utils/gpuMonitor.ts` (new)

**Tasks:**
- [ ] Create GPU monitoring utility using `nvidia-smi` or `rocm-smi`
- [ ] Monitor GPU usage, VRAM usage, temperature
- [ ] Monitor CPU usage and RAM usage
- [ ] Log metrics at regular intervals (1 second)
- [ ] Export metrics to CSV/JSON for analysis
- [ ] Integrate with debug logging system

**Expected Output:**
- Real-time GPU/CPU metrics during RAG operations
- Historical data for analysis
- Correlation between GPU spikes and failures

#### 1.2: Instrument RAG Operations with Monitoring
**Files:** `scripts/rag/querying/rag.ts`, `scripts/rag/indexing/embeddings.ts`

**Tasks:**
- [ ] Add GPU monitoring at key operation points:
  - Before/after embedding generation
  - Before/after LLM query expansion
  - Before/after reranking
  - Before/after response generation
- [ ] Log GPU metrics with VERIFIED debug comments
- [ ] Capture GPU state at failure points

**Expected Output:**
- Detailed GPU usage patterns for each operation
- Identification of operations causing GPU spikes

#### 1.3: Run Comprehensive Test Suite with Monitoring
**Script:** `scripts/rag/test-gpu-performance.sh` (new)

**Tasks:**
- [ ] Run all query types with GPU monitoring:
  - Basic query
  - Query with expansion
  - Query with reranking
  - Query with all enhancements
  - Multi-pass retrieval
  - Hybrid retrieval
- [ ] Run indexing operations with monitoring
- [ ] Capture metrics for each operation type
- [ ] Document failure points and GPU states

**Expected Output:**
- Complete performance profile
- Correlation data between operations and GPU usage
- Failure point identification

---

### Step 2: Error Detection and Logging

**Time:** 1-2 hours
**Status:** Pending

#### 2.1: Enhanced Error Handling
**Files:** `scripts/rag/querying/rag.ts`, `scripts/rag/indexing/embeddings.ts`

**Tasks:**
- [ ] Add GPU memory error detection
- [ ] Catch OOM (Out of Memory) errors from Ollama
- [ ] Log GPU state when errors occur
- [ ] Add timeout handling for GPU operations
- [ ] Capture error context (operation type, GPU usage, VRAM)

**Expected Output:**
- Clear error messages when GPU issues occur
- Context for debugging GPU-related failures

#### 2.2: Debug Mode with GPU Metrics
**File:** `scripts/rag/utils/debug.ts` (modify)

**Tasks:**
- [ ] Add GPU metrics to debug logging
- [ ] Include GPU usage in all debug logs
- [ ] Add GPU memory warnings when usage > 80%
- [ ] Add GPU memory errors when usage > 95%

**Expected Output:**
- Real-time GPU visibility in debug output
- Early warning system for GPU issues

---

### Step 3: Root Cause Analysis

**Time:** 2-3 hours
**Status:** Pending

#### 3.1: Analyze GPU Usage Patterns
**Tasks:**
- [ ] Review collected GPU metrics
- [ ] Identify operations causing 100% GPU usage
- [ ] Determine if issue is:
  - Model size (VRAM exhaustion)
  - Concurrent operations (multiple model instances)
  - Inefficient memory management
  - Model quantization level

#### 3.2: Test Model Memory Requirements
**Tasks:**
- [ ] Measure VRAM usage for current model (`llama2`)
- [ ] Test with different model sizes
- [ ] Identify minimum VRAM requirements
- [ ] Document VRAM usage per operation

#### 3.3: Identify Failure Points
**Tasks:**
- [ ] Correlate GPU spikes with application failures
- [ ] Identify exact failure conditions
- [ ] Document failure patterns
- [ ] Create reproducible test cases

**Expected Output:**
- Root cause identification
- Failure pattern documentation
- Test cases for validation

---

## Resolution Phase

### Step 4: Model Optimization Strategy

**Time:** 3-4 hours
**Status:** Pending

#### 4.1: Research Quantized Model Options
**Tasks:**
- [ ] Research Ollama quantized models:
  - `llama2:7b-q4_0` (4-bit quantization, ~4GB VRAM)
  - `llama2:7b-q8_0` (8-bit quantization, ~7GB VRAM)
  - `llama3:8b-q4_0` (if available)
  - `mistral:7b-q4_0` (alternative model)
- [ ] Compare model quality vs. size
- [ ] Test model availability in Ollama
- [ ] Document VRAM requirements for each

**Expected Output:**
- List of viable quantized models
- VRAM requirements for each
- Quality comparison

#### 4.2: Implement Model Selection Logic
**File:** `scripts/rag/utils/modelSelector.ts` (new)

**Tasks:**
- [ ] Create model selector utility
- [ ] Detect available GPU VRAM
- [ ] Select appropriate model based on VRAM:
  - < 4GB: Use smallest quantized model
  - 4-6GB: Use 4-bit quantized model
  - 6-8GB: Use 8-bit quantized model
  - > 8GB: Use full precision model
- [ ] Fallback to CPU if GPU insufficient
- [ ] Add configuration override option

**Expected Output:**
- Automatic model selection based on hardware
- Graceful degradation path
- Configuration flexibility

#### 4.3: Update RAG System to Use Model Selector
**Files:** `scripts/rag/index.ts`, `scripts/rag/querying/rag.ts`

**Tasks:**
- [ ] Integrate model selector into RAG system
- [ ] Update all Ollama model references
- [ ] Add model selection logging
- [ ] Update CLI to show selected model

**Expected Output:**
- RAG system using appropriate model for hardware
- Clear logging of model selection

---

### Step 5: Resource Management Improvements

**Time:** 2-3 hours
**Status:** Pending

#### 5.1: Implement GPU Memory Limits
**File:** `scripts/rag/utils/gpuManager.ts` (new)

**Tasks:**
- [ ] Add GPU memory monitoring
- [ ] Implement memory limits (e.g., max 80% VRAM)
- [ ] Queue operations when GPU near limit
- [ ] Add memory cleanup between operations
- [ ] Implement operation throttling

**Expected Output:**
- GPU memory management
- Prevention of VRAM exhaustion
- Stable operation under load

#### 5.2: Sequential Operation Enforcement (CRITICAL FIX)
**Files:** `scripts/rag/querying/reranker.ts`, `scripts/rag/evaluation/generationMetrics.ts`

**Current Problems Identified:**

1. **Reranking (`scripts/rag/querying/reranker.ts` line 63):**
   - Uses `Promise.all()` for concurrent LLM scoring
   - Scores 4-20 chunks simultaneously
   - **CRITICAL FIX REQUIRED**

2. **Generation Metrics (`scripts/rag/evaluation/generationMetrics.ts` line 120):**
   - Uses `Promise.all()` for parallel LLM evaluation
   - Two concurrent LLM calls
   - **FIX REQUIRED**

**Tasks:**
- [ ] **CRITICAL:** Fix reranking concurrent operations
  - Current: `await Promise.all(chunks.map(async (chunk) => { ... }))`
  - Fix: Change to sequential execution:
    ```typescript
    const scoredChunks = [];
    for (const chunk of chunks) {
      const score = await this.scoreRelevance(query, chunk);
      scoredChunks.push({ chunk, score });
      // Add small delay to allow GPU to process
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    scoredChunks.sort((a, b) => b.score - a.score);
    ```
  - Add debug logging: `debugLog('Reranker', `Scored chunk ${i+1}/${chunks.length}`)`

- [ ] **HIGH:** Fix generation metrics concurrent operations
  - Current: `await Promise.all([faithfulness, answerRelevance])`
  - Fix: Sequential execution:
    ```typescript
    const faithfulness = await this.evaluateFaithfulness(query, context, response);
    const answerRelevance = await this.evaluateAnswerRelevance(query, response);
    ```

- [ ] Add operation queue for GPU-intensive tasks
- [ ] Implement request throttling (delay between operations)
- [ ] Add GPU availability checks before operations
- [ ] Add GPU usage monitoring before each LLM call
- [ ] Queue operations if GPU usage > 80%
- [ ] Add delays between operations to allow GPU to cool down
- [ ] Verify no other `Promise.all()` calls for LLM operations exist (context expander is OK - file I/O only)

**Expected Output:**
- No concurrent GPU operations
- Controlled resource usage
- Predictable performance

#### 5.3: Fallback Mechanisms
**Files:** `scripts/rag/querying/rag.ts`

**Tasks:**
- [ ] Add CPU fallback when GPU unavailable
- [ ] Implement model size reduction on GPU errors
- [ ] Add graceful degradation paths
- [ ] Log fallback activations

**Expected Output:**
- Application continues working even with GPU issues
- Clear fallback logging
- User-friendly error messages

---

## Validation Phase

### Step 6: Testing and Validation

**Time:** 2-3 hours
**Status:** Pending

#### 6.1: Create Validation Test Suite
**File:** `scripts/rag/test-gpu-validation.sh` (new)

**Test Scenarios:**
1. **Basic Query Test**
   - Run basic query with GPU monitoring
   - Verify GPU stays < 80%
   - Verify no failures

2. **Query Expansion Test**
   - Run query with expansion
   - Monitor GPU during multiple LLM calls
   - Verify sequential execution
   - Verify no VRAM exhaustion

3. **Reranking Test**
   - Run query with reranking
   - Monitor GPU during scoring operations
   - Verify memory cleanup between chunks
   - Verify no failures

4. **Full Feature Test**
   - Run query with all enhancements
   - Monitor GPU throughout operation
   - Verify GPU never exceeds 80%
   - Verify successful completion

5. **Stress Test**
   - Run multiple queries in sequence
   - Monitor GPU over extended period
   - Verify no memory leaks
   - Verify stable operation

**Success Criteria:**
- ✅ GPU usage never exceeds 80% during normal operations
- ✅ No application failures during GPU-intensive operations
- ✅ All operations complete successfully
- ✅ Response quality maintained with quantized models
- ✅ Fallback mechanisms work correctly

#### 6.2: Model Quality Validation
**Tasks:**
- [ ] Compare response quality:
  - Full precision model vs. quantized models
  - Different quantization levels
- [ ] Run evaluation metrics on quantized models
- [ ] Document quality differences
- [ ] Ensure quality acceptable for use case

**Success Criteria:**
- ✅ Quantized models provide acceptable quality
- ✅ Quality difference < 10% from full precision
- ✅ Responses remain coherent and accurate

#### 6.3: Performance Benchmarking
**Tasks:**
- [ ] Measure operation times:
  - With full precision model
  - With quantized models
  - With CPU fallback
- [ ] Compare GPU usage patterns
- [ ] Document performance characteristics
- [ ] Identify optimal configuration

**Success Criteria:**
- ✅ Quantized models provide acceptable performance
- ✅ GPU usage within safe limits
- ✅ No performance degradation > 20%

---

## Implementation Details

### Model Configuration

**Current Configuration:**
- Model: `llama2:latest` (Q4_0 quantization, 7B parameters, ~3.8 GB on disk)
- Available models: `llama2:latest`, `mistral:7b` (4.4 GB)
- **CRITICAL FINDING:** Model is already quantized (Q4_0), so model size is NOT the issue
- No operation queuing/throttling (concurrent LLM calls likely causing GPU saturation)
- No VRAM management
- No GPU monitoring
- AMD GPU present (amdgpu kernel module detected)

**Observed Issue:**
- GPU spikes to 100% during operations
- Application failures correlate with GPU spikes
- System has 8GB VRAM available
- Models appear to be quantized already (3.8GB, 4.4GB sizes suggest quantization)

**Proposed Configuration:**
- **PRIMARY FIX:** Implement operation queuing/throttling to prevent concurrent GPU operations
  - Sequential LLM calls instead of concurrent
  - Queue operations when GPU usage > 80%
  - Add delays between operations if needed
- **SECONDARY FIX:** Implement GPU memory cleanup between operations
  - Force Ollama to release GPU memory
  - Add explicit memory cleanup calls
- **MONITORING:** Add GPU usage monitoring (AMD GPU specific)
  - Use process-level monitoring (Ollama process GPU usage)
  - Monitor via `/proc` or system calls
  - Add GPU usage warnings/throttling
- **FALLBACK:** Add CPU mode option for when GPU unavailable
- **OPTIONAL:** Test smaller models if queuing doesn't resolve issue
  - `llama2:7b-q2_K` (2-bit, if available)
  - `mistral:7b` (if better quantized)

### GPU Monitoring Integration

**Monitoring Points:**
1. Before embedding generation
2. After embedding generation
3. Before LLM operations (query expansion, reranking, generation)
4. After LLM operations
5. On errors/failures

**Metrics Collected:**
- GPU usage percentage
- VRAM usage (MB/GB)
- GPU temperature
- CPU usage percentage
- RAM usage
- Operation timestamps

### Error Handling Strategy

**GPU Error Detection:**
- OOM errors from Ollama
- GPU timeout errors
- VRAM exhaustion warnings
- GPU unavailable errors

**Response Strategy:**
1. Log error with full context
2. Attempt model size reduction
3. Fallback to CPU mode
4. Queue operation for retry
5. Report user-friendly error

---

## Validation Criteria

### Primary Success Criteria

1. **GPU Usage Control**
   - ✅ GPU usage never exceeds 80% during normal operations
   - ✅ No VRAM exhaustion errors
   - ✅ Stable operation under load

2. **Application Stability**
   - ✅ No application failures during GPU-intensive operations
   - ✅ All operations complete successfully
   - ✅ No hangs or freezes

3. **Model Quality**
   - ✅ Quantized models provide acceptable quality
   - ✅ Response quality maintained (>90% of full precision)
   - ✅ No significant degradation in accuracy

4. **Performance**
   - ✅ Operations complete in reasonable time
   - ✅ No significant performance degradation (<20%)
   - ✅ Acceptable user experience

### Secondary Success Criteria

1. **Monitoring and Debugging**
   - ✅ GPU metrics available in debug mode
   - ✅ Clear error messages for GPU issues
   - ✅ Historical metrics for analysis

2. **Resource Management**
   - ✅ Automatic model selection works
   - ✅ Fallback mechanisms function correctly
   - ✅ Memory cleanup prevents leaks

3. **Documentation**
   - ✅ GPU requirements documented
   - ✅ Model selection logic documented
   - ✅ Troubleshooting guide created

---

## Test Plan

### Test 1: GPU Monitoring Baseline
**Command:** `RAG_DEBUG=true npm run rag:query:debug -- "What is RAG?"`
**Expected:** GPU metrics logged, no failures
**Metrics to Capture:**
- GPU usage percentage (every 1 second)
- VRAM usage (MB/GB)
- CPU usage percentage
- RAM usage
- Operation timestamps
- Correlation with LLM operations
- Number of concurrent Ollama processes

### Test 2: Reranking GPU Usage (CRITICAL TEST)
**Command:** `RAG_DEBUG=true npm run rag:query:rerank -- "What are the benefits of RAG?"`
**Expected:**
- GPU usage stays < 80% during reranking
- Sequential chunk scoring visible in logs
- No concurrent Ollama processes
- No application failures

### Test 3: Sequential Execution Validation
**Command:** `RAG_DEBUG=true npm run rag:query:advanced -- "How does RAG work?"`
**Expected:**
- All LLM operations execute sequentially
- GPU usage stable throughout operation
- Debug logs show sequential execution
- No GPU spikes to 100%

### Test 2: Model Selection
**Command:** `npm run rag:query -- "What is RAG?"`
**Expected:** Appropriate model selected, logged

### Test 3: Quantized Model Quality
**Command:** `npm run rag:query:advanced -- "How does RAG work?"`
**Expected:** High-quality response, GPU < 80%

### Test 4: Stress Test
**Command:** Run 10 queries sequentially
**Expected:** All complete, GPU stable, no failures

### Test 5: Fallback Test
**Command:** Disable GPU, run query
**Expected:** CPU fallback works, operation completes

---

## Risk Assessment

### Risks

1. **Model Quality Degradation**
   - **Risk:** Quantized models may reduce quality
   - **Mitigation:** Test quality, use best quantization level
   - **Impact:** Medium

2. **Performance Impact**
   - **Risk:** Quantized models may be slower
   - **Mitigation:** Benchmark performance, optimize
   - **Impact:** Low

3. **Compatibility Issues**
   - **Risk:** Quantized models may not be available
   - **Mitigation:** Multiple fallback options
   - **Impact:** Low

4. **Complexity Increase**
   - **Risk:** Model selection adds complexity
   - **Mitigation:** Clear documentation, simple API
   - **Impact:** Low

---

## Timeline

- **Week 1:**
  - Day 1-2: Investigation (Steps 1-3)
  - Day 3-4: Resolution (Steps 4-5)
  - Day 5: Validation (Step 6)

**Total Estimated Time:** 8-12 hours

---

## Dependencies

- ✅ Ollama with models available (confirmed: `llama2:latest` Q4_0, `mistral:7b`)
- ⚠️ GPU monitoring tools:
  - `nvidia-smi` (NVIDIA GPUs) - not available
  - `rocm-smi` (AMD GPUs) - not available
  - Need alternative: Process-level monitoring, system calls
- ✅ Test environment with GPU access (8GB VRAM available, AMD GPU detected)
- ✅ Debug logging system (already implemented)
- ✅ Node.js process monitoring capabilities

---

## Success Metrics

- **GPU Usage:** < 80% during normal operations
- **Failure Rate:** 0% during GPU-intensive operations
- **Model Quality:** > 90% of full precision quality
- **Performance:** < 20% degradation from full precision
- **User Experience:** No visible impact on functionality

---

## Next Steps

1. **Immediate (Step 1.1):** Create GPU monitoring utility with cross-platform support
   - Detect available GPU monitoring tools
   - Implement fallback to CPU/RAM monitoring
   - Integrate with debug logging

2. **Immediate (Step 1.3):** Run baseline measurements with current setup
   - Monitor GPU during existing operations
   - Identify exact failure points
   - Document GPU usage patterns

3. **Short-term (Step 3.1):** Analyze GPU usage patterns
   - Correlate GPU spikes with operations
   - Identify root cause (model size vs. concurrent operations)
   - Document failure conditions

4. **Medium-term (Step 4.1-4.3):** Implement model optimization
   - Research quantized model options
   - Implement model selector
   - Update RAG system to use optimized models

5. **Medium-term (Step 5.1-5.3):** Implement resource management
   - Add GPU memory limits
   - Enforce sequential operations
   - Add fallback mechanisms

6. **Long-term (Step 6):** Validate and optimize
   - Run comprehensive test suite
   - Validate model quality
   - Benchmark performance

## Immediate Action Items

**Before Starting Investigation:**
1. ✅ Check Ollama model details: `ollama show llama2:latest` - **COMPLETE**
   - Model: `llama2:latest` uses Q4_0 quantization (4-bit)
   - Parameters: 7B
   - Already quantized, so model size is NOT the issue
2. ✅ Check available GPU monitoring tools: `which rocm-smi radeontop` - **COMPLETE**
   - AMD GPU monitoring tools not available
   - Need alternative monitoring approach (process-level)
3. ⏸️ Check Ollama process GPU usage during operation - **PENDING**
   - Monitor Ollama process during RAG operations
   - Track GPU usage correlation
4. ⏸️ Document current GPU state before operations - **PENDING**

**Key Finding:**
- Model is already quantized (Q4_0), so the issue is likely **concurrent operations** causing GPU saturation
- Need to implement sequential operation enforcement as primary fix

**First Investigation Run:**
```bash
# Run with debug and monitor GPU
RAG_DEBUG=true npm run rag:query:debug -- "What is RAG?" &
# Monitor Ollama process in separate terminal
watch -n 1 'ps aux | grep ollama | grep -v grep'

# Monitor system GPU activity (AMD GPU)
watch -n 1 'cat /sys/class/drm/card*/device/gpu_busy_percent 2>/dev/null || echo "GPU monitoring not available"'

# Monitor process resource usage
watch -n 1 'ps -p $(pgrep -f ollama) -o pid,pcpu,pmem,rss,vsz,etime 2>/dev/null || echo "No Ollama process"'
```

**Expected Findings:**
- Multiple Ollama processes running concurrently during query expansion
- GPU usage spikes when multiple LLM calls happen simultaneously
- Process memory accumulation over time

---

**Last Updated:** 2025-01-15
**Status:** Ready for Implementation
**Owner:** Development Team

---

## Plan Overlap Analysis

### Existing Plans Reviewed:
- **rag-system-advanced-improvements.md**: Covers RAG feature implementation, but does not address GPU performance issues
- **rag-n8n-workflow-integration-plan.md**: Covers n8n integration, unrelated to GPU issues
- **rag-knowledge-graph-integration-plan.md**: Covers knowledge graph features, unrelated to GPU issues

### Identified Overlaps:
- None - This is a new investigation area not covered in existing plans

### Unique Value Proposition:
This plan adds unique value by:
- Addressing GPU performance issues causing application failures
- Implementing GPU monitoring and resource management
- Optimizing model usage and operation sequencing
- Providing comprehensive debugging and validation framework

### Critical Finding:
**Model is already quantized (Q4_0), so the primary issue is likely concurrent operations causing GPU saturation, not model size. The fix should focus on sequential operation enforcement rather than model quantization.**

**Specific Code Issues Identified:**

1. **Reranking (`scripts/rag/querying/reranker.ts` line 63) - HIGH PRIORITY:**
   - Uses `Promise.all()` for concurrent LLM scoring of multiple chunks
   - Causes multiple Ollama processes to run simultaneously
   - **Impact:** High - Reranking typically scores 4-20 chunks concurrently
   - **Fix:** Change to sequential execution with delays between chunks

2. **Generation Metrics (`scripts/rag/evaluation/generationMetrics.ts` line 120) - MEDIUM PRIORITY:**
   - Uses `Promise.all()` for parallel faithfulness + relevance evaluation
   - Two concurrent LLM calls
   - **Impact:** Medium - Only affects evaluation, not normal queries
   - **Fix:** Change to sequential execution

3. **Hybrid Retrieval (`scripts/rag/querying/hybridRetrieval.ts` line 68) - LOW PRIORITY:**
   - Uses `Promise.all()` for parallel semantic + keyword search
   - Semantic search uses embeddings (may use GPU), keyword search is CPU-only
   - **Impact:** Low - Only one GPU operation (semantic), keyword is CPU
   - **Fix:** Verify GPU usage, may be acceptable

4. **Context Expander (`scripts/rag/querying/contextExpander.ts` line 119) - NO ISSUE:**
   - Uses `Promise.all()` for concurrent chunk expansion
   - **Impact:** None - File I/O operations, no GPU usage
   - **Fix:** No change needed

**Primary Fix Priority:**
1. **CRITICAL:** Fix reranking concurrent operations (most likely cause of GPU saturation)
2. **HIGH:** Fix generation metrics concurrent operations (affects evaluation)
3. **MEDIUM:** Verify hybrid retrieval GPU usage (may be acceptable)
4. **LOW:** Context expander is fine (no GPU usage)

**Validation Criteria for Fix:**
1. ✅ No `Promise.all()` calls for LLM operations remain
2. ✅ GPU usage stays < 80% during reranking operations
3. ✅ Sequential execution confirmed in debug logs
4. ✅ No application failures during GPU-intensive operations
5. ✅ Response quality maintained with sequential execution
