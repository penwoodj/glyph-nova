# RAG System n8n-Like Modules Organization Plan

**Purpose:** Reorganize RAG system code into n8n-like modular nodes, enabling visual workflow composition, better code organization, and easier extension

**Date:** 2025-01-15
**Version:** 1.0
**Status:** Ready for Implementation
**Estimated Total Time:** 40-50 hours (with buffer)
**Prerequisites:** Complete `rag-system-advanced-improvements.md` and `rag-knowledge-graph-integration-plan.md` plans first

**Related Plans:**
- **Prerequisite:** `rag-system-advanced-improvements.md` - Complete RAG improvements
- **Prerequisite:** `rag-knowledge-graph-integration-plan.md` - Complete knowledge graph integration
- **Reference:** `@cursor/docs/reports/n8n-agentic-behavior/` - n8n architecture patterns

---

## Executive Summary

This plan reorganizes the RAG system codebase at `/home/jon/code/glyph-nova/scripts/rag` into n8n-like modular nodes, where each node represents a discrete function or capability that can be composed visually. The reorganization enables better code organization, easier extension, visual workflow composition, and follows n8n's philosophy of "nodes as functions, connections as data flow."

**Key Deliverables:**
- Node-based architecture with clear interfaces
- Node registry system for discovery and composition
- Visual workflow configuration format (JSON)
- Node execution engine
- Data flow between nodes
- Node validation and error handling
- CLI integration with node workflows
- Documentation for each node type

**Success Criteria:**
1. ✅ All RAG functionality organized into discrete nodes
2. ✅ Nodes can be composed into workflows
3. ✅ Visual workflow configuration format implemented
4. ✅ Node execution engine handles data flow
5. ✅ Backward compatibility maintained (existing CLI works)
6. ✅ Each node folder has `similar-n8n-modules.md` documentation
7. ✅ Node registry enables discovery and composition
8. ✅ Workflow execution matches existing RAG behavior
9. ✅ Performance overhead <10% vs. direct execution
10. ✅ Documentation complete with examples

---

## Phase 0: Design Node Architecture

**Purpose:** Design the node-based architecture, interfaces, and workflow format

**Time Estimate:** 8-10 hours
**Priority:** CRITICAL - Must complete before implementation
**Dependencies:** None

### Step 0.1: Analyze n8n Node Patterns

**Time:** 3-4 hours

- [ ] Study n8n node structure and interfaces
- [ ] Analyze node input/output patterns
- [ ] Review node execution model
- [ ] Study workflow composition patterns
- [ ] Document n8n patterns for RAG adaptation

**Reference:** `@cursor/docs/reports/n8n-agentic-behavior/` - n8n architecture reports

### Step 0.2: Design Node Interface

**Time:** 2-3 hours

**Node Interface Design:**
```typescript
interface NodeInput {
  data: any; // Input data from previous nodes
  parameters: Record<string, any>; // Node configuration
  context?: NodeContext; // Execution context
}

interface NodeOutput {
  data: any; // Output data for next nodes
  error?: NodeError; // Error if execution failed
  metadata?: NodeMetadata; // Execution metadata
}

interface NodeDefinition {
  name: string;
  displayName: string;
  description: string;
  version: string;
  category: NodeCategory;
  inputs: NodeInputDefinition[];
  outputs: NodeOutputDefinition[];
  parameters: NodeParameterDefinition[];
  execute: (input: NodeInput) => Promise<NodeOutput>;
}

enum NodeCategory {
  INDEXING = 'indexing',
  QUERYING = 'querying',
  PROCESSING = 'processing',
  STORAGE = 'storage',
  UTILITY = 'utility'
}
```

### Step 0.3: Design Workflow Format

**Time:** 2-3 hours

**Workflow JSON Format:**
```json
{
  "name": "RAG Indexing Workflow",
  "version": "1.0",
  "nodes": [
    {
      "id": "file-collector-1",
      "type": "FileCollector",
      "position": { "x": 100, "y": 100 },
      "parameters": {
        "paths": ["./docs"],
        "extensions": [".txt", ".md"]
      }
    },
    {
      "id": "chunker-1",
      "type": "Chunker",
      "position": { "x": 300, "y": 100 },
      "parameters": {
        "chunkSize": 500,
        "overlap": 50
      },
      "connections": {
        "input": ["file-collector-1"]
      }
    }
  ],
  "connections": [
    {
      "from": "file-collector-1",
      "to": "chunker-1",
      "type": "data"
    }
  ]
}
```

### Step 0.4: Design Node Registry

**Time:** 1-1 hours

- [ ] Design node registration system
- [ ] Plan node discovery mechanism
- [ ] Design node metadata storage
- [ ] Plan node validation system

---

## Phase 1: Create Node Structure

**Purpose:** Reorganize existing code into node modules with clear interfaces

**Time Estimate:** 15-18 hours
**Priority:** HIGH
**Dependencies:** Phase 0 complete

### Improvement 1: Indexing Nodes

**Time:** 6-7 hours
**Risk:** Low (refactoring existing code)

#### Step 1.1: File Collector Node

**Time:** 1-1 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/indexing/FileCollectorNode.ts` (new)

- [ ] Create `FileCollectorNode` class implementing `NodeDefinition`
- [ ] Wrap existing `FileCollector` functionality
- [ ] Define node inputs (paths, extensions, filters)
- [ ] Define node outputs (file list)
- [ ] Add node metadata and documentation

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/indexing/similar-n8n-modules.md` (new)

- [ ] Document node purpose and functionality
- [ ] List similar n8n nodes (HTTP Request, Read Binary File)
- [ ] Provide usage examples
- [ ] Document parameters and outputs

#### Step 1.2: Chunker Node

**Time:** 1-1 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/indexing/ChunkerNode.ts` (new)

- [ ] Create `ChunkerNode` class
- [ ] Wrap existing `DocumentChunker` functionality
- [ ] Define inputs (files, chunk size, overlap)
- [ ] Define outputs (chunks array)
- [ ] Add semantic chunking option

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/indexing/similar-n8n-modules.md` (update)

- [ ] Add ChunkerNode documentation

#### Step 1.3: Embedding Generator Node

**Time:** 1-2 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/indexing/EmbeddingGeneratorNode.ts` (new)

- [ ] Create `EmbeddingGeneratorNode` class
- [ ] Wrap existing `EmbeddingGenerator` functionality
- [ ] Define inputs (texts, model selection)
- [ ] Define outputs (embeddings array)
- [ ] Support Ollama and simple embeddings

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/indexing/similar-n8n-modules.md` (update)

- [ ] Add EmbeddingGeneratorNode documentation

#### Step 1.4: Vector Store Node

**Time:** 1-2 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/indexing/VectorStoreNode.ts` (new)

- [ ] Create `VectorStoreNode` class
- [ ] Wrap existing vector store functionality
- [ ] Define inputs (chunks with embeddings)
- [ ] Define outputs (store path, metadata)
- [ ] Support JSON and binary encoding

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/indexing/similar-n8n-modules.md` (update)

- [ ] Add VectorStoreNode documentation

#### Step 1.5: Entity Extractor Node (if KG plan complete)

**Time:** 1-1 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/indexing/EntityExtractorNode.ts` (new)

- [ ] Create `EntityExtractorNode` class
- [ ] Wrap entity extraction functionality
- [ ] Define inputs (chunks)
- [ ] Define outputs (entities array)

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/indexing/similar-n8n-modules.md` (update)

- [ ] Add EntityExtractorNode documentation

### Improvement 2: Querying Nodes

**Time:** 5-6 hours
**Risk:** Low

#### Step 2.1: Query Expansion Node

**Time:** 1-1 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/querying/QueryExpansionNode.ts` (new)

- [ ] Create `QueryExpansionNode` class
- [ ] Wrap existing `QueryExpander` functionality
- [ ] Define inputs (query, numVariations)
- [ ] Define outputs (expanded queries array)

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/querying/similar-n8n-modules.md` (new)

- [ ] Document QueryExpansionNode
- [ ] List similar n8n nodes (AI Agent, Text Processing)

#### Step 2.2: Vector Search Node

**Time:** 1-1 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/querying/VectorSearchNode.ts` (new)

- [ ] Create `VectorSearchNode` class
- [ ] Wrap vector similarity search
- [ ] Define inputs (query embedding, vector store)
- [ ] Define outputs (top-K chunks)

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/querying/similar-n8n-modules.md` (update)

- [ ] Add VectorSearchNode documentation

#### Step 2.3: RRF Fusion Node

**Time:** 1-1 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/querying/RRFFusionNode.ts` (new)

- [ ] Create `RRFFusionNode` class
- [ ] Wrap existing `ReciprocalRankFusion` functionality
- [ ] Define inputs (multiple ranked lists)
- [ ] Define outputs (fused ranked list)

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/querying/similar-n8n-modules.md` (update)

- [ ] Add RRFFusionNode documentation

#### Step 2.4: Reranker Node

**Time:** 1-2 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/querying/RerankerNode.ts` (new)

- [ ] Create `RerankerNode` class
- [ ] Wrap reranking functionality
- [ ] Define inputs (query, chunks)
- [ ] Define outputs (reranked chunks)

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/querying/similar-n8n-modules.md` (update)

- [ ] Add RerankerNode documentation

#### Step 2.5: LLM Generator Node

**Time:** 1-1 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/querying/LLMGeneratorNode.ts` (new)

- [ ] Create `LLMGeneratorNode` class
- [ ] Wrap Ollama generation functionality
- [ ] Define inputs (query, context chunks)
- [ ] Define outputs (generated response)

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/querying/similar-n8n-modules.md` (update)

- [ ] Add LLMGeneratorNode documentation

### Improvement 3: Utility Nodes

**Time:** 4-5 hours
**Risk:** Low

#### Step 3.1: Node Registry

**Time:** 2-3 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/NodeRegistry.ts` (new)

- [ ] Create `NodeRegistry` class
- [ ] Implement node registration
- [ ] Implement node discovery
- [ ] Add node validation
- [ ] Support node metadata queries

#### Step 3.2: Workflow Executor

**Time:** 2-2 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/nodes/WorkflowExecutor.ts` (new)

- [ ] Create `WorkflowExecutor` class
- [ ] Implement workflow parsing
- [ ] Implement node execution order
- [ ] Handle data flow between nodes
- [ ] Implement error handling

---

## Phase 2: Workflow System

**Purpose:** Implement workflow definition, execution, and CLI integration

**Time Estimate:** 12-15 hours
**Priority:** HIGH
**Dependencies:** Phase 1 complete

### Improvement 4: Workflow Definition System

**Time:** 4-5 hours
**Risk:** Medium (workflow complexity)

#### Step 4.1: Workflow Parser

**Time:** 2-3 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/workflows/WorkflowParser.ts` (new)

- [ ] Create `WorkflowParser` class
- [ ] Parse workflow JSON format
- [ ] Validate workflow structure
- [ ] Resolve node connections
- [ ] Build execution graph

#### Step 4.2: Workflow Validator

**Time:** 2-2 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/workflows/WorkflowValidator.ts` (new)

- [ ] Create `WorkflowValidator` class
- [ ] Validate node connections
- [ ] Check parameter types
- [ ] Verify data flow compatibility
- [ ] Detect circular dependencies

### Improvement 5: Workflow Execution Engine

**Time:** 6-8 hours
**Risk:** Medium (execution complexity)

#### Step 5.1: Execution Engine

**Time:** 3-4 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/workflows/ExecutionEngine.ts` (new)

- [ ] Create `ExecutionEngine` class
- [ ] Implement topological sort for execution order
- [ ] Execute nodes in correct sequence
- [ ] Handle data passing between nodes
- [ ] Implement error propagation
- [ ] Add execution logging

#### Step 5.2: Data Flow Manager

**Time:** 2-3 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/workflows/DataFlowManager.ts` (new)

- [ ] Create `DataFlowManager` class
- [ ] Manage data between nodes
- [ ] Handle data transformation
- [ ] Implement data validation
- [ ] Support parallel node execution

#### Step 5.3: Error Handling

**Time:** 1-1 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/workflows/ErrorHandler.ts` (new)

- [ ] Create `ErrorHandler` class
- [ ] Handle node execution errors
- [ ] Implement retry logic
- [ ] Support error recovery
- [ ] Add error reporting

### Improvement 6: CLI Integration

**Time:** 2-2 hours
**Risk:** Low

#### Step 6.1: Workflow CLI Commands

**Time:** 1-1 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/index.ts` (update)

- [ ] Add `workflow` command
- [ ] Support workflow file execution
- [ ] Add workflow validation command
- [ ] Maintain backward compatibility

#### Step 6.2: Default Workflows

**Time:** 1-1 hours

**File:** `/home/jon/code/glyph-nova/scripts/rag/workflows/defaults/indexing.json` (new)
**File:** `/home/jon/code/glyph-nova/scripts/rag/workflows/defaults/querying.json` (new)

- [ ] Create default indexing workflow
- [ ] Create default querying workflow
- [ ] Match existing RAG behavior

---

## Phase 3: Documentation and Examples

**Purpose:** Create comprehensive documentation and example workflows

**Time Estimate:** 5-7 hours
**Priority:** MEDIUM
**Dependencies:** Phase 2 complete

### Improvement 7: Node Documentation

**Time:** 3-4 hours
**Risk:** Low

#### Step 7.1: Create similar-n8n-modules.md Files

**Time:** 2-3 hours

For each node folder:
- [ ] `/home/jon/code/glyph-nova/scripts/rag/nodes/indexing/similar-n8n-modules.md`
- [ ] `/home/jon/code/glyph-nova/scripts/rag/nodes/querying/similar-n8n-modules.md`
- [ ] `/home/jon/code/glyph-nova/scripts/rag/nodes/processing/similar-n8n-modules.md` (if exists)
- [ ] `/home/jon/code/glyph-nova/scripts/rag/nodes/storage/similar-n8n-modules.md` (if exists)
- [ ] `/home/jon/code/glyph-nova/scripts/rag/nodes/utility/similar-n8n-modules.md` (if exists)

Each file should include:
- Node purpose and functionality
- Similar n8n nodes (for reference)
- Usage examples
- Parameter documentation
- Input/output specifications

#### Step 7.2: Workflow Examples

**Time:** 1-1 hours

- [ ] Create example workflows directory
- [ ] Add basic indexing workflow example
- [ ] Add querying workflow example
- [ ] Add advanced workflow examples
- [ ] Document workflow patterns

### Improvement 8: API Documentation

**Time:** 2-3 hours
**Risk:** Low

#### Step 8.1: Node API Documentation

**Time:** 1-2 hours

- [ ] Document node interface
- [ ] Document node execution model
- [ ] Create node development guide
- [ ] Add code examples

#### Step 8.2: Workflow API Documentation

**Time:** 1-1 hours

- [ ] Document workflow format
- [ ] Document execution API
- [ ] Create workflow development guide
- [ ] Add examples

---

## External Documentation Links

### Official Documentation
1. **n8n Documentation**
   - https://docs.n8n.io/
   - n8n node architecture and workflow patterns

2. **n8n Node Development**
   - https://docs.n8n.io/integrations/creating-nodes/
   - How to create custom n8n nodes

### Reference Documentation
3. **n8n Agentic Behavior Reports**
   - `/home/jon/code/glyph-nova/cursor/docs/reports/n8n-agentic-behavior/`
   - Comprehensive n8n architecture analysis

4. **Workflow Automation Patterns**
   - Industry best practices for workflow systems

---

## Risk Assessment

### High Risk (Blocking)

**1. Workflow Execution Complexity**
- **Risk:** Execution engine too complex or buggy
- **Impact:** High - Core functionality broken
- **Mitigation:** Start simple, incremental complexity, comprehensive testing
- **Contingency:** Fallback to direct node execution

### Medium Risk (Impacting)

**2. Performance Overhead**
- **Risk:** Node system adds significant overhead
- **Impact:** Medium - Degrades user experience
- **Mitigation:** Optimize execution engine, minimize abstraction overhead
- **Contingency:** Direct execution path for performance-critical workflows

**3. Backward Compatibility**
- **Risk:** Breaking existing CLI functionality
- **Impact:** Medium - Users affected
- **Mitigation:** Maintain existing CLI, add workflow as optional feature
- **Contingency:** Feature flags, gradual migration

### Low Risk (Manageable)

**4. Documentation Completeness**
- **Risk:** Incomplete node documentation
- **Impact:** Low - Can be improved iteratively
- **Mitigation:** Template-based documentation, review process
- **Contingency:** Iterative documentation improvements

---

## Time Estimates with Buffer

### Phase 0: Design Node Architecture
- **Base Estimate:** 8 hours
- **Buffer (20%):** 1.6 hours
- **Total:** 9.6 hours (~10 hours)

### Phase 1: Create Node Structure
- **Base Estimate:** 15 hours
- **Buffer (20%):** 3 hours
- **Total:** 18 hours

### Phase 2: Workflow System
- **Base Estimate:** 12 hours
- **Buffer (20%):** 2.4 hours
- **Total:** 14.4 hours (~15 hours)

### Phase 3: Documentation and Examples
- **Base Estimate:** 5 hours
- **Buffer (20%):** 1 hour
- **Total:** 6 hours

### **Grand Total:**
- **Base Estimate:** 40 hours
- **Buffer (20%):** 8 hours
- **Total:** 48 hours (~50 hours)

---

## Success Criteria

### Phase 1 Success Criteria
1. ✅ All RAG functionality organized into nodes
2. ✅ Node interfaces defined and implemented
3. ✅ Each node folder has similar-n8n-modules.md

### Phase 2 Success Criteria
1. ✅ Workflow system executes correctly
2. ✅ Data flow between nodes works
3. ✅ CLI integration maintains backward compatibility

### Phase 3 Success Criteria
1. ✅ All nodes documented
2. ✅ Example workflows provided
3. ✅ API documentation complete

### Overall Success Criteria
1. ✅ All functionality accessible via nodes
2. ✅ Workflows can be composed visually
3. ✅ Performance overhead <10%
4. ✅ Backward compatibility maintained
5. ✅ Documentation complete

---

## Dependencies

### External Dependencies
- **n8n Patterns:** Reference n8n architecture (documentation only)
- **Node.js:** Version 18+ required
- **TypeScript:** For type safety

### Internal Dependencies
- **RAG Improvements:** Complete `rag-system-advanced-improvements.md`
- **Knowledge Graph:** Complete `rag-knowledge-graph-integration-plan.md` (optional, for entity nodes)
- **Existing RAG System:** Current implementation

### Phase Dependencies
- **Phase 1** depends on **Phase 0** (architecture design)
- **Phase 2** depends on **Phase 1** (node structure)
- **Phase 3** depends on **Phase 2** (working system)

---

## Integration with Existing System

### Maintains Compatibility
- Existing CLI commands still work
- Direct function calls still supported
- Nodes wrap existing functionality
- No breaking changes to existing code

### Adds New Capabilities
- Visual workflow composition
- Node-based architecture
- Workflow execution engine
- Better code organization

---

## Next Steps

1. **Complete Prerequisites:** Finish RAG improvements and knowledge graph plans
2. **Start Phase 0:** Design node architecture and interfaces
3. **Review Plan:** Validate approach and adjust as needed
4. **Begin Implementation:** Start with Phase 0, then proceed sequentially

---

**Last Updated:** 2025-01-15
**Version:** 1.0
**Status:** Ready for Implementation (after prerequisites complete)

**See Also:**
- **Prerequisite Plans:**
  - `rag-system-advanced-improvements.md` - Complete RAG improvements
  - `rag-knowledge-graph-integration-plan.md` - Complete knowledge graph integration
- **Reference:** `@cursor/docs/reports/n8n-agentic-behavior/` - n8n architecture patterns

---
