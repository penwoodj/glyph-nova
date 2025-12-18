---
name: Agentic Workflow Framework Implementation Plan
overview: Implement agentic workflow framework supporting .md workflow files and n8n-like config workflow files, with workflow parsing, execution engine, and integration with chat and n8n
todos: []
---

# Agentic Workflow Framework Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Implement an agentic workflow framework that supports two types of workflow files: (1) Markdown workflow documents (`.md`) that define human-friendly agentic behavior specifications, and (2) n8n-like configuration workflow files that define executable workflow graphs. The framework should parse workflows, execute them, and integrate with chat and n8n systems.

---

## Overview

This plan implements an agentic workflow framework that:
- Supports markdown workflow files (`.md`) with structured sections
- Supports n8n-like config workflow files (JSON)
- Parses and validates workflow files
- Executes workflows based on context and triggers
- Integrates workflows with chat system
- Provides workflow management and organization
- Enables workflow composition and inheritance
- Stores workflows in `.glyphnova/workflows/` directory

**Target**: Complete agentic workflow framework for executable agentic behaviors
**Priority**: High (foundational for agentic features)
**Estimated Time**: 12-16 hours (with 20% buffer: 14.4-19.2 hours)
**Risk Level**: High (complex framework, many integration points)

---

## Current State Analysis

### Existing Implementation
- **No Workflow Framework**: No workflow system exists
- **No .md Workflow Support**: No markdown workflow parsing
- **No Config Workflow Support**: No n8n-like config workflow support
- **No Workflow Execution**: No workflow execution engine
- **No Workflow Integration**: No integration with chat or n8n

### Gaps Identified
- No workflow file structure
- No workflow parser
- No workflow execution engine
- No workflow management
- No workflow-chat integration

---

## External Documentation Links

### Workflow Patterns
1. **n8n Workflow Structure**
   - Link: https://docs.n8n.io/workflows/
   - Description: n8n workflow JSON structure
   - Rating: High - Official n8n documentation

2. **Markdown Parsing**
   - Link: https://github.com/remarkjs/remark
   - Description: Markdown parsing library
   - Rating: High - Popular markdown parser

3. **Workflow Engine Patterns**
   - Link: https://github.com/temporalio/temporal
   - Description: Workflow engine patterns (reference)
   - Rating: Medium - Workflow engine reference

### Markdown Processing
4. **remark-gfm**
   - Link: https://github.com/remarkjs/remark-gfm
   - Description: GitHub Flavored Markdown support
   - Rating: High - GFM markdown support

5. **Markdown AST**
   - Link: https://github.com/syntax-tree/mdast
   - Description: Markdown Abstract Syntax Tree
   - Rating: Medium - Markdown AST reference

### JSON Schema Validation
6. **JSON Schema**
   - Link: https://json-schema.org/
   - Description: JSON schema validation
   - Rating: High - JSON schema standard

7. **ajv JSON Schema Validator**
   - Link: https://ajv.js.org/
   - Description: JSON schema validator
   - Rating: High - Popular validator

### Workflow Execution
8. **Workflow Execution Patterns**
   - Link: https://docs.n8n.io/workflows/executions/
   - Description: n8n workflow execution patterns
   - Rating: High - n8n execution reference

9. **Async Workflow Execution**
   - Link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
   - Description: Async/await patterns
   - Rating: High - MDN documentation

---

## Implementation Phases

### Phase 1: Workflow File Structure & Parsing (3-4 hours)

**Goal**: Define workflow file structures and create parsers.

#### 1.1 Markdown Workflow Parser
- [ ] Create `web/src/services/workflowParser.ts`:
  - [ ] `parseMarkdownWorkflow(content: string): MarkdownWorkflow`
  - [ ] Parse workflow sections (Context Sources, Instructions, etc.)
  - [ ] Extract workflow metadata
  - [ ] Validate workflow structure
- [ ] Markdown workflow structure:
  ```typescript
  interface MarkdownWorkflow {
    name: string
    contextSources?: {
      files?: string[]
      mcp?: string[]
      rag?: string[]
    }
    instructions?: {
      role?: string
      goals?: string[]
      process?: string[]
    }
    contextRules?: {
      fileSelection?: {
        include?: string[]
        exclude?: string[]
        priority?: string
      }
      chunkingStrategy?: {
        maxChunkSize?: number
        strategy?: string
        overlap?: number
      }
    }
    outputFormat?: string
    qualityMetrics?: string[]
    examples?: WorkflowExample[]
  }
  ```

#### 1.2 Config Workflow Parser
- [ ] Create config workflow parser:
  - [ ] `parseConfigWorkflow(content: string): ConfigWorkflow`
  - [ ] Parse n8n-like JSON structure
  - [ ] Validate workflow nodes and connections
  - [ ] Extract workflow metadata
- [ ] Config workflow structure:
  ```typescript
  interface ConfigWorkflow {
    name: string
    nodes: WorkflowNode[]
    connections: WorkflowConnection[]
    settings?: WorkflowSettings
    staticData?: any
  }
  ```

#### 1.3 Workflow Validation
- [ ] Implement validation:
  - [ ] Validate markdown workflow structure
  - [ ] Validate config workflow JSON schema
  - [ ] Check required fields
  - [ ] Validate node connections
- [ ] Validation logic:
  - [ ] Schema validation for config workflows
  - [ ] Structure validation for markdown workflows
  - [ ] Error reporting

**Success Criteria**:
- [ ] Markdown workflows parse correctly
- [ ] Config workflows parse correctly
- [ ] Validation works
- [ ] Error handling works

---

### Phase 2: Workflow Execution Engine (4-5 hours)

**Goal**: Create workflow execution engine.

#### 2.1 Execution Engine Core
- [ ] Create `web/src/services/workflowEngine.ts`:
  - [ ] `executeWorkflow(workflow: Workflow, context: WorkflowContext): Promise<WorkflowResult>`
  - [ ] Workflow context management
  - [ ] Step-by-step execution
  - [ ] Error handling and recovery
- [ ] Execution engine structure:
  ```typescript
  interface WorkflowContext {
    input: any
    files?: FileContext[]
    mcpResults?: any[]
    ragResults?: any[]
    variables?: Record<string, any>
  }

  interface WorkflowResult {
    success: boolean
    output: any
    steps: WorkflowStep[]
    errors?: WorkflowError[]
  }
  ```

#### 2.2 Markdown Workflow Execution
- [ ] Implement markdown workflow execution:
  - [ ] Parse workflow instructions
  - [ ] Gather context based on context sources
  - [ ] Execute process steps
  - [ ] Format output according to output format
- [ ] Execution flow:
  - [ ] Load context sources
  - [ ] Apply context rules
  - [ ] Execute instructions
  - [ ] Format results

#### 2.3 Config Workflow Execution
- [ ] Implement config workflow execution:
  - [ ] Execute nodes in order
  - [ ] Pass data between nodes
  - [ ] Handle node types (code, HTTP, etc.)
  - [ ] Handle errors and retries
- [ ] Node execution:
  - [ ] Execute each node
  - [ ] Pass output to connected nodes
  - [ ] Handle conditional branches
  - [ ] Track execution state

**Success Criteria**:
- [ ] Execution engine works
- [ ] Markdown workflows execute
- [ ] Config workflows execute
- [ ] Error handling works

---

### Phase 3: Workflow Management (2-2.5 hours)

**Goal**: Create workflow file management system.

#### 3.1 Workflow File Service
- [ ] Create `web/src/services/workflowFiles.ts`:
  - [ ] `listWorkflows(folderPath: string): Promise<WorkflowFile[]>`
  - [ ] `loadWorkflow(filePath: string): Promise<Workflow>`
  - [ ] `saveWorkflow(filePath: string, workflow: Workflow): Promise<void>`
  - [ ] `deleteWorkflow(filePath: string): Promise<void>`
- [ ] File operations:
  - [ ] Workflows stored in `.glyphnova/workflows/`
  - [ ] Support both .md and .json workflows
  - [ ] Handle file I/O via GraphQL

#### 3.2 Workflow Organization
- [ ] Organize workflows:
  - [ ] Categorize by type (markdown vs config)
  - [ ] Support workflow folders
  - [ ] Workflow metadata (name, description, tags)
  - [ ] Workflow search/filter
- [ ] Organization structure:
  - [ ] `.glyphnova/workflows/` root
  - [ ] Subfolders for categories (optional)
  - [ ] Workflow files with metadata

#### 3.3 Workflow Discovery
- [ ] Implement workflow discovery:
  - [ ] Scan workflows directory
  - [ ] Parse workflow metadata
  - [ ] Index workflows
  - [ ] Provide workflow list API

**Success Criteria**:
- [ ] Workflow files managed correctly
- [ ] Workflows organized properly
- [ ] Workflow discovery works
- [ ] File operations work

---

### Phase 4: Chat Integration (2-2.5 hours)

**Goal**: Integrate workflows with chat system.

#### 4.1 Workflow Selection
- [ ] Implement workflow selection:
  - [ ] Detect workflow triggers in chat
  - [ ] Select appropriate workflow
  - [ ] Load workflow context
- [ ] Selection logic:
  - [ ] Match chat input to workflow
  - [ ] Use workflow metadata/tags
  - [ ] Support explicit workflow selection

#### 4.2 Workflow Execution from Chat
- [ ] Execute workflows from chat:
  - [ ] Trigger workflow on chat message
  - [ ] Pass chat context to workflow
  - [ ] Execute workflow steps
  - [ ] Return results to chat
- [ ] Integration points:
  - [ ] Chat message analysis
  - [ ] Workflow selection
  - [ ] Workflow execution
  - [ ] Result formatting

#### 4.3 Workflow Results in Chat
- [ ] Display workflow results:
  - [ ] Format results as chat message
  - [ ] Show execution steps (optional)
  - [ ] Display errors if any
- [ ] Result formatting:
  - [ ] Markdown formatting
  - [ ] Structured output
  - [ ] Clear status messages

**Success Criteria**:
- [ ] Workflows trigger from chat
- [ ] Workflow execution works
- [ ] Results display in chat
- [ ] Integration seamless

---

### Phase 5: n8n Integration & Workflow Composition (2-3 hours)

**Goal**: Integrate with n8n and support workflow composition.

#### 5.1 n8n Workflow Integration
- [ ] Integrate with n8n:
  - [ ] Convert markdown workflows to n8n workflows (optional)
  - [ ] Execute config workflows via n8n
  - [ ] Use n8n for complex workflows
- [ ] Integration points:
  - [ ] Use n8n client (from n8n integration plan)
  - [ ] Execute workflows via n8n API
  - [ ] Monitor n8n executions

#### 5.2 Workflow Composition
- [ ] Implement workflow composition:
  - [ ] Workflows can reference other workflows
  - [ ] Workflow inheritance
  - [ ] Workflow combination
- [ ] Composition features:
  - [ ] Import workflows
  - [ ] Extend workflows
  - [ ] Combine workflows
  - [ ] Workflow dependencies

#### 5.3 Workflow Preprocessing
- [ ] Implement preprocessing:
  - [ ] Preprocess markdown workflows
  - [ ] Generate config workflows from markdown
  - [ ] Update existing config workflows
- [ ] Preprocessing logic:
  - [ ] Parse markdown workflow
  - [ ] Generate n8n-like config
  - [ ] Create workflow nodes
  - [ ] Set up connections

**Success Criteria**:
- [ ] n8n integration works
- [ ] Workflow composition works
- [ ] Preprocessing works
- [ ] Integration complete

---

## Dependencies

### Internal Dependencies
- **n8n Integration**: n8n API client (from n8n integration plan)
- **Chat System**: Existing chat interface
- **File System**: GraphQL file operations
- **File Explorer**: .glyphnova tab (from file explorer tabs plan)

### External Dependencies
- **Markdown Parser**: remark or similar (optional)
- **JSON Schema Validator**: ajv or similar (optional)

---

## Risk Assessment

### High Risk
- **Framework Complexity**: Complex workflow framework with many components
  - **Mitigation**: Phased implementation, thorough testing, clear architecture
- **Workflow Execution**: Complex execution logic might have edge cases
  - **Mitigation**: Comprehensive testing, error handling, step-by-step execution

### Medium Risk
- **Markdown Parsing**: Complex markdown structure parsing
  - **Mitigation**: Use proven markdown parser, test with various formats
- **n8n Integration**: Complex integration with n8n
  - **Mitigation**: Use n8n API client, handle errors gracefully

### Low Risk
- **File Management**: Standard file I/O operations
- **Workflow Storage**: Standard file storage

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Feature flag**: Disable workflow framework, keep basic functionality
- **Component removal**: Remove workflow components, keep structure

### Phase-Specific Rollback
- **Phase 1**: Remove parsers, keep basic structure
- **Phase 2**: Remove execution engine, keep parsers
- **Phase 3**: Remove file management, keep execution
- **Phase 4**: Remove chat integration, keep execution
- **Phase 5**: Remove n8n integration, keep basic execution

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore previous state
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (Parsing)
- [ ] Markdown workflows parse
- [ ] Config workflows parse
- [ ] Validation works
- [ ] Error handling works

### After Phase 2 (Execution)
- [ ] Execution engine works
- [ ] Markdown workflows execute
- [ ] Config workflows execute
- [ ] Error handling works

### After Phase 3 (Management)
- [ ] Workflow files managed
- [ ] Workflows organized
- [ ] Discovery works
- [ ] File operations work

### After Phase 4 (Chat Integration)
- [ ] Workflows trigger from chat
- [ ] Execution works
- [ ] Results display correctly
- [ ] Integration seamless

### After Phase 5 (n8n & Composition)
- [ ] n8n integration works
- [ ] Composition works
- [ ] Preprocessing works
- [ ] Integration complete

---

## Success Criteria

1. **Markdown Workflow Support**: .md workflows parse and execute
2. **Config Workflow Support**: n8n-like config workflows parse and execute
3. **Workflow Execution**: Workflows execute correctly
4. **Workflow Management**: Workflows can be created, loaded, saved, deleted
5. **Chat Integration**: Workflows trigger from chat
6. **n8n Integration**: Workflows integrate with n8n
7. **Workflow Composition**: Workflows can reference and combine
8. **Workflow Organization**: Workflows organized in .glyphnova/workflows/
9. **Error Handling**: Workflow errors handled gracefully
10. **Performance**: Workflow execution performant
11. **Documentation**: Workflow framework documented
12. **User Experience**: Workflow management intuitive
13. **Extensibility**: Framework easy to extend
14. **Integration**: Works seamlessly with existing features
15. **Validation**: Workflows validated before execution

---

## Code Examples

### Example: Markdown Workflow Parser
```typescript
// web/src/services/workflowParser.ts
import { remark } from 'remark'
import { visit } from 'unist-util-visit'

interface MarkdownWorkflow {
  name: string
  contextSources?: {
    files?: string[]
    mcp?: string[]
    rag?: string[]
  }
  instructions?: {
    role?: string
    goals?: string[]
    process?: string[]
  }
  contextRules?: {
    fileSelection?: {
      include?: string[]
      exclude?: string[]
      priority?: string
    }
    chunkingStrategy?: {
      maxChunkSize?: number
      strategy?: string
      overlap?: number
    }
  }
  outputFormat?: string
  qualityMetrics?: string[]
  examples?: Array<{
    input: string
    context: string
    output: string
  }>
}

export async function parseMarkdownWorkflow(
  content: string
): Promise<MarkdownWorkflow> {
  const workflow: MarkdownWorkflow = {
    name: '',
  }

  // Parse markdown using remark
  const tree = await remark().parse(content)

  // Extract workflow name from first heading
  visit(tree, 'heading', (node: any) => {
    if (node.depth === 1 && !workflow.name) {
      workflow.name = node.children[0].value
    }
  })

  // Parse sections
  let currentSection = ''
  visit(tree, (node: any) => {
    if (node.type === 'heading') {
      currentSection = node.children[0].value.toLowerCase()
    }

    if (node.type === 'list' && currentSection.includes('context sources')) {
      // Parse context sources
      workflow.contextSources = parseContextSources(node)
    }

    if (node.type === 'list' && currentSection.includes('instructions')) {
      // Parse instructions
      workflow.instructions = parseInstructions(node)
    }

    // ... parse other sections
  })

  return workflow
}

function parseContextSources(node: any): MarkdownWorkflow['contextSources'] {
  const sources: MarkdownWorkflow['contextSources'] = {}

  node.children.forEach((item: any) => {
    const text = extractText(item)
    if (text.startsWith('Files:')) {
      sources.files = extractList(text)
    } else if (text.startsWith('MCP:')) {
      sources.mcp = extractList(text)
    } else if (text.startsWith('RAG:')) {
      sources.rag = extractList(text)
    }
  })

  return sources
}
```

### Example: Workflow Execution Engine
```typescript
// web/src/services/workflowEngine.ts
import type { MarkdownWorkflow, ConfigWorkflow } from './workflowParser'

interface WorkflowContext {
  input: any
  files?: FileContext[]
  mcpResults?: any[]
  ragResults?: any[]
  variables?: Record<string, any>
}

interface WorkflowResult {
  success: boolean
  output: any
  steps: WorkflowStep[]
  errors?: WorkflowError[]
}

export class WorkflowEngine {
  async executeMarkdownWorkflow(
    workflow: MarkdownWorkflow,
    context: WorkflowContext
  ): Promise<WorkflowResult> {
    const steps: WorkflowStep[] = []
    const errors: WorkflowError[] = []

    try {
      // Step 1: Gather context
      if (workflow.contextSources) {
        const gatheredContext = await this.gatherContext(
          workflow.contextSources,
          workflow.contextRules,
          context
        )
        steps.push({ name: 'Gather Context', result: gatheredContext })
      }

      // Step 2: Execute instructions
      if (workflow.instructions) {
        const result = await this.executeInstructions(
          workflow.instructions,
          context
        )
        steps.push({ name: 'Execute Instructions', result })
      }

      // Step 3: Format output
      const output = this.formatOutput(
        workflow.outputFormat,
        context,
        steps
      )

      return {
        success: true,
        output,
        steps,
      }
    } catch (error) {
      errors.push({
        step: steps.length,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      return {
        success: false,
        output: null,
        steps,
        errors,
      }
    }
  }

  async executeConfigWorkflow(
    workflow: ConfigWorkflow,
    context: WorkflowContext
  ): Promise<WorkflowResult> {
    // Execute nodes in order based on connections
    const executedNodes = new Set<string>()
    const nodeResults = new Map<string, any>()

    // Find start nodes (nodes with no incoming connections)
    const startNodes = workflow.nodes.filter(
      node => !this.hasIncomingConnections(node.id, workflow.connections)
    )

    // Execute nodes
    for (const node of startNodes) {
      await this.executeNode(node, context, nodeResults, executedNodes)
    }

    // Collect final output
    const outputNodes = workflow.nodes.filter(
      node => !this.hasOutgoingConnections(node.id, workflow.connections)
    )

    return {
      success: true,
      output: outputNodes.map(node => nodeResults.get(node.id)),
      steps: Array.from(executedNodes).map(id => ({
        name: workflow.nodes.find(n => n.id === id)?.name || id,
        result: nodeResults.get(id),
      })),
    }
  }

  private async gatherContext(
    sources: MarkdownWorkflow['contextSources'],
    rules: MarkdownWorkflow['contextRules'],
    context: WorkflowContext
  ): Promise<any> {
    const gathered: any = {}

    // Gather files
    if (sources?.files) {
      gathered.files = await this.gatherFiles(sources.files, rules?.fileSelection)
    }

    // Gather MCP results
    if (sources?.mcp) {
      gathered.mcp = await this.gatherMCP(sources.mcp)
    }

    // Gather RAG results
    if (sources?.rag) {
      gathered.rag = await this.gatherRAG(sources.rag)
    }

    return gathered
  }
}
```

### Example: Workflow File Service
```typescript
// web/src/services/workflowFiles.ts
import { gql } from '@apollo/client'
import { apolloClient } from '@apollo/client'
import { parseMarkdownWorkflow, parseConfigWorkflow } from './workflowParser'

const DIRECTORY_CONTENTS_QUERY = gql`
  query ListWorkflows($path: String!) {
    directoryContents(path: $path) {
      files {
        name
        path
        type
      }
    }
  }
`

const READ_FILE_QUERY = gql`
  query ReadWorkflow($path: String!) {
    readFile(path: $path)
  }
`

export interface WorkflowFile {
  name: string
  path: string
  type: 'markdown' | 'config'
}

export async function listWorkflows(
  folderPath: string
): Promise<WorkflowFile[]> {
  const workflowsDir = `${folderPath}/.glyphnova/workflows`

  try {
    const { data } = await apolloClient.query({
      query: DIRECTORY_CONTENTS_QUERY,
      variables: { path: workflowsDir },
    })

    if (!data.directoryContents) {
      return []
    }

    return data.directoryContents.files
      .filter((file: any) =>
        file.name.endsWith('.md') || file.name.endsWith('.json')
      )
      .map((file: any) => ({
        name: file.name,
        path: file.path,
        type: file.name.endsWith('.md') ? 'markdown' : 'config',
      }))
  } catch {
    return []
  }
}

export async function loadWorkflow(
  filePath: string
): Promise<MarkdownWorkflow | ConfigWorkflow> {
  const { data } = await apolloClient.query({
    query: READ_FILE_QUERY,
    variables: { path: filePath },
  })

  if (!data.readFile) {
    throw new Error('Workflow file not found')
  }

  if (filePath.endsWith('.md')) {
    return parseMarkdownWorkflow(data.readFile)
  } else {
    return parseConfigWorkflow(data.readFile)
  }
}
```

### Example: Chat Integration
```tsx
// web/src/components/Chat/ChatInterface.tsx (workflow integration)
import { WorkflowEngine } from 'src/services/workflowEngine'
import { loadWorkflow, listWorkflows } from 'src/services/workflowFiles'

// In handleSend function
const handleSend = async () => {
  // ... existing code ...

  // Check for workflow trigger
  if (userMessage.startsWith('@workflow ')) {
    const workflowName = userMessage.replace('@workflow ', '').trim()
    await executeWorkflowFromChat(workflowName, userMessage)
    return
  }

  // Auto-detect workflow based on message
  const matchingWorkflow = await findMatchingWorkflow(userMessage)
  if (matchingWorkflow) {
    await executeWorkflowFromChat(matchingWorkflow.name, userMessage)
    return
  }

  // ... rest of send logic ...
}

const executeWorkflowFromChat = async (
  workflowName: string,
  message: string
) => {
  const openFolderPath = useAppStore.getState().openFolderPath
  if (!openFolderPath) return

  try {
    const workflows = await listWorkflows(openFolderPath)
    const workflowFile = workflows.find(w =>
      w.name.toLowerCase().includes(workflowName.toLowerCase())
    )

    if (!workflowFile) {
      addChatMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Workflow "${workflowName}" not found`,
        timestamp: new Date(),
      })
      return
    }

    const workflow = await loadWorkflow(workflowFile.path)
    const engine = new WorkflowEngine()

    const context = {
      input: message,
      files: await loadFileContexts(message, apolloClient),
    }

    const result = await engine.executeWorkflow(workflow, context)

    addChatMessage({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: result.success
        ? result.output
        : `Workflow error: ${result.errors?.map(e => e.message).join(', ')}`,
      timestamp: new Date(),
    })
  } catch (error) {
    addChatMessage({
      id: Date.now().toString(),
      role: 'assistant',
      content: `Error executing workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date(),
    })
  }
}
```

---

## Notes

- Workflow framework is foundational for agentic features
- Support both markdown and config workflows for flexibility
- Workflows should be composable and extensible
- Integration with chat enables workflow automation
- n8n integration provides visual workflow composition
- Workflow execution should be robust and handle errors
- Workflow files should be version-controlled (via git)
- Consider workflow caching for performance
- Workflow validation is critical for reliability
- Support workflow templates and examples

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
