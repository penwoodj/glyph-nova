# Workflows System

**Related:** [project-vision](../project-vision.md) | [agentic-mode-system](./agentic-mode-system.md) | [context-engineering](./context-engineering.md) | [self-improvement-system](./self-improvement-system.md) | [multi-source-integration](./multi-source-integration.md)

---

## Overview

The Glyph Nova system uses **two types of agentic workflow files** that work together in a pipeline:

1. **Markdown workflow descriptions (`.md`)**: Human-friendly agentic workflow specs.
2. **n8n-like configuration workflows**: Executable workflow graphs with visualization modes.

Markdown workflows are the descriptive layer and are **preprocessed by n8n-like workflows** into executable workflows (either updating existing graphs or creating new ones). Every feature mode (including chat box modes like “ask/plan”) is a combination of one or both file types. Everything is configurable and composable.

---

## Workflow Types

### 1. Workflow Markdown Documents

Workflow markdown documents are structured markdown files that define agentic behavior through sections and are the inputs to preprocessing workflows.

#### Structure

```markdown
# [Workflow Name]

## Context Sources
- Files: `**/*.ts`, `package.json`
- MCP: `github`, `filesystem`, `postgres`
- RAG: `typescript-docs`, `codebase-index`

## Instructions
### Role
You are a [role description]

### Goals
1. [Primary goal]
2. [Secondary goal]

### Process
1. [Step 1 with context usage]
2. [Step 2 with decision criteria]

## Context Rules
### File Selection
- Include: [patterns]
- Exclude: [patterns]
- Priority: [ranking strategy]

### Chunking Strategy
- Max chunk size: 500 tokens
- Strategy: semantic-functions
- Overlap: 50 tokens

## Output Format
[How to structure responses]

## Quality Metrics
- Metric 1: [how to measure]
- Metric 2: [how to measure]

## Examples
### Example 1
Input: [example input]
Context: [what context to gather]
Output: [expected output]
```

**Note:** Real workflow files might be shorter. Recommended section length will be detected from system and model capabilities, and these recommendations will display in the app when editing these files depending on the file visualization mode.

#### Example Workflows

**Code Review Workflow** (`workflows/code-review.md`)

```markdown
# Code Review Workflow

## Context Sources
- Files: Current file + dependencies
- MCP: `git` (recent commits, blame)
- MCP: `testing` (test results)
- RAG: `code-standards`

## Instructions
### Process
1. Read linted errors from current file
2. Check git history for related changes
3. Run relevant tests
4. Compare against code standards
5. Provide ranked list of issues

## Output Format
- Critical issues (blocking)
- Warnings (should fix)
- Suggestions (nice to have)
- Positive observations
```

**Research Workflow** (`workflows/research.md`)

```markdown
# Research Workflow

## Context Sources
- RAG: All indexed documentation
- MCP: `web-search` (for latest info)
- Files: Related code examples

## Instructions
### Process
1. Query RAG indices for existing knowledge
2. Search web if no local docs found
3. Synthesize findings with examples
4. Cite all sources

## Output Format
- Summary (2-3 sentences)
- Key findings (bullet points)
- Code examples (if applicable)
- Sources (linked)
```

**Refactor Workflow** (`workflows/refactor.md`)

```markdown
# Refactor Workflow

## Context Sources
- Files: Target file + all usage sites
- MCP: `typescript` (AST analysis)
- RAG: `design-patterns`

## Instructions
### Process
1. Parse AST to understand structure
2. Find all references across codebase
3. Suggest pattern improvements
4. Generate refactoring steps

## Quality Metrics
- Complexity reduction (cyclomatic)
- Type safety improvement
- Test coverage impact
```

### 2. Agentic System Config Files (n8n-like)

Config file workflows provide n8n-like functionality with visualization modes. These are accessible and configurable at every level and can:
- Preprocess `.md` workflow specs into updated/derived n8n-like workflows
- Execute tasks (file edits, meta-workflows, quality workflows)
- Chain other workflows or tool workflows

#### Mode Selection Workflow

Mode selection is a config file workflow that can be configured to:
- Analyze user input for keywords and intent
- Check current context (open files, git state, etc.)
- Match against workflow definitions
- Select and activate appropriate workflow
- Allow manual override at any time

**Key Features:**
- **Automatic detection**: Based on keywords, context, file types, and patterns
- **Configurable triggers**: Define custom workflow selection logic
- **Workflow-based**: Uses markdown or n8n-style config files
- **Composable**: Workflows can reference and combine with other workflows

#### Auto Mode Selection

Similar to Cursor's auto mode, but implemented as a workflow that uses/links to other workflows. The default starting built-in workflows will encompass the modes.

---

## Workflow Roles & Composition

Workflows can inherit and combine, and feature modes can mix `.md` + n8n-like workflows:

```markdown
# Full Stack Workflow

## Extends
- [[code-review]]
- [[testing]]
- [[api-design]]

## Additional Context
- Files: Frontend + Backend files
- MCP: `docker` (container status)

## Combined Instructions
1. Review frontend changes (Code Review Workflow)
2. Check API contracts (API Design Workflow)
3. Verify tests (Testing Workflow)
4. Check deployment impact (Docker MCP)
```

---

## Context Engineering Workflows

### Context Gathering Workflows

Context gathering workflows can be `.md` specs or n8n-like graphs and may include:
- Chunking workflows
- Summary workflows
- Semantic abstraction / file-level navigation (choose abstraction level per task)
- Prompt context reordering sub-workflows
- RAG queries and usage-pattern-driven selection
- Mode-based budget rules and self-improving allocation

### Context Source Orchestration

Workflows can intelligently combine multiple context sources:

```typescript
async function gatherContext(
  query: string,
  mode: Mode,
  budget: TokenBudget
): Promise<AggregatedContext> {
  // Parallel queries
  const [files, mcpData, ragResults] = await Promise.all([
    gatherFileContext(query, mode.fileRules, budget.files),
    queryMCPServers(mode.mcpQueries, budget.mcp),
    searchRAG(query, mode.ragIndices, budget.rag)
  ])

  // Combine and rank
  return rankAndMerge({
    files,
    mcpData,
    ragResults,
    budget,
    strategy: mode.contextStrategy
  })
}
```

### MCP Query Language in Workflows

Workflows can define MCP queries:

```yaml
# In workflow document
mcp_queries:
  - server: git
    operation: recent_commits
    params:
      file: $current_file
      limit: 10

  - server: postgres
    operation: schema
    params:
      table: $mentioned_table

  - server: github
    operation: related_issues
    params:
      labels: ["bug", "urgent"]
      state: open
```

---

## Self-Improvement Workflows

The Self-Improvement System uses **scoped summary workflows** of both types (workflow .md documents and agentic system config files) to improve behavior over time. This is a combination of interlinked files that work together.

### Core Concept

The system makes types of summaries from logs based on specific scopes. Each scope serves a particular goal, and with those summaries, workflows create and improve workflows of both types and context docs to serve the goal.

### Self-Improvement Workflow Examples

#### 1. Minimal Back-and-Forth Workflow

**Goal:** Make responses match user desired behavior with minimal back and forth.

**Scope:** Find interactions that took more than one prompting or multiple corrections.

**Process:**
1. Analyze logs for multi-turn corrections
2. Generate summary of patterns causing re-prompting
3. Create/update workflows and context docs to address issues
4. Edit debug workflows and nested referenced workflows to have correct behavior

#### 2. Context Feeding Order Optimization

**Goal:** Optimize the order and combination of context in prompts.

**Scope:** Test different combinations of context in the same prompt, then analyze behavior differences.

**Process:**
1. Run background experiments with different context orderings
2. Generate logs of behavior differences in responses
3. Summarize logs for another workflow to use
4. Integrate learnings into improving existing user context feeding backend reordering
5. Improve prompt fixing, interaction, and automatic workflows

#### 3. Mode Selection Accuracy

**Goal:** Improve automatic mode selection accuracy.

**Scope:** Analyze mode selection decisions and their outcomes.

**Process:**
1. Track mode selections vs. user overrides
2. Identify patterns where wrong modes were selected
3. Update mode selection workflows with better triggers
4. Test improved selection logic

### Log Analysis Pipeline

**Goal:** Automatically learn from usage patterns.

```
User Interaction → [Log] → [Analysis Queue] → [Pattern Detection]
                                 ↓
                           [Quality Scoring] → [Pattern Storage]
                                 ↓
                           [Mode Updates] ← [User Approval]
```

### Analysis Triggers

- **Immediate**: User explicitly approves/rejects output
- **Batch (nightly)**: Analyze day's logs for patterns
- **Weekly**: Deep analysis of quality trends
- **On-demand**: Manual "Learn from this session" command

### Automatic Workflow Improvement

**Goal:** Workflows self-evolve based on usage.

#### Improvement Process

```
1. Detect pattern (e.g., "Research workflow often needs more RAG results")
2. Generate proposed change to workflow document
3. Show diff to user: "Research workflow could be improved"
4. User approves → Update workflow
5. Track success of new workflow version
6. Rollback if quality decreases
```

### Background Experimentation

The system can run background experiments using workflows to:
- Test different context combinations
- Try alternative workflow selection strategies
- Experiment with chunking approaches
- Validate improvements before deployment

All experimentation is done through workflows (both .md and config file types), not hardcoded logic.

---

## Multi-Machine Swarm Workflows

### Task Distribution

Workflows can route tasks across multiple machines:

```typescript
interface TaskRoute {
  taskType: 'chat' | 'refactor' | 'research' | 'test'
  priority: 'immediate' | 'background' | 'batch'
  complexity: 'simple' | 'moderate' | 'complex'
  route: {
    machine: string
    modelSize: '7B' | '13B' | '70B' | '180B'
    timeout: number
  }
}

const routingTable: TaskRoute[] = [
  {
    taskType: 'chat',
    priority: 'immediate',
    complexity: 'simple',
    route: { machine: 'local', modelSize: '7B', timeout: 1000 }
  },
  {
    taskType: 'refactor',
    priority: 'background',
    complexity: 'complex',
    route: { machine: 'server-1', modelSize: '70B', timeout: 60000 }
  }
]
```

### Routing Rules

Workflows define how tasks are distributed:
- Primary strategy: Route to least-loaded machine
- Fallback 1: Use slower local model if remote unavailable
- Fallback 2: Queue task for later if all servers busy
- Fallback 3: Notify user and ask to wait or use fast model

---

## Smart Chunking Workflows

### Nested Summary Creation

Batch process agentic workflow on a cron job, similar to RAG with visualization in a hierarchical graph database in files with good visualization tools.

### Semantic Memory Layer

Visualization capabilities where there are ideas of what the file does in different sections based on line number. LLMs can read before looking at files, with smart modes of which level of abstraction to read and when it needs to.

---

## Feature Workflow Categories

Feature workflows can be classified by:
- **Target feature**: chat, file editing, planning docs, context maps, etc.
- **Trigger type**: manual, auto, infinite, infinite-until, chat-driven
- **Mode composition**: `.md` only, n8n-like only, or combined
- **Purpose**: preprocessing `.md` specs, executing tasks, meta-quality workflows, prompt context gathering/reordering, self-learning

Modes (e.g., chat box ask/plan) are just specific combinations of these workflows.

---

## Chat Interface Workflows

Chats are just parsed formatted `.md` files you can easily toggle between for different levels/views of editing. The chat box can move around and has modes like:

- **Stick to bottom mode** (default): Normal chat behavior
- **Inline mode**: Embedded in document flow
- **Draggable mode**: Move around through dragging and dropping
- **Dropdown mode**: Collapsible detail sections
- **Split views**: Different types of data in the chat
- **Tree/graph views**: Hierarchical or graph-like structure views
- **Markdown editor mode**: Literal markdown file to edit and view

---

## Workflow Configuration

### Context Budget Management

Workflows define how token budgets are allocated:

```
Fixed Allocations:
├─ System prompt: 200-500 tokens
├─ Workflow instructions: 300-800 tokens
└─ Chat history: 500-1000 tokens (sliding window)

Dynamic Allocations (remaining budget):
├─ Primary context (50%): User-selected files
├─ Related context (25%): Dependency graph
├─ RAG results (15%): Searched documentation
└─ MCP data (10%): Live system queries
```

### Context Relevance Ranking

Workflows control how context is ranked and selected:

**Ranking Factors:**
- **Semantic similarity**: Vector embeddings (local BERT/sentence-transformers)
- **Recency**: Recently viewed/edited files score higher
- **Graph proximity**: Files close in dependency graph
- **Explicit references**: Direct mentions in user query
- **Historical success**: Patterns learned from past successful contexts

**Note:** This system is controlled by agentic self-improving workflow system. Configuration can be done via n8n-like config files with visualization modes, or markdown files with a consistent format with sections describing how to decide what context to get when and where through described source and behavior flows.

### Tool Workflows

Agentic workflows can call tool-specific workflows (usable directly in chat or invoked by other workflows):
- File editing tool workflows
- RAG database tool workflows
- Vector database tool workflows
- Web search tool workflows
- MCP tool workflows

---

## Workflow Execution

### Data Flow

```
User Input → Editor → State Management → API Layer
                                          ↓
                                    Context Gathering:
                                    ├─ File System
                                    ├─ MCP Servers
                                    ├─ RAG Search
                                    └─ Git Data
                                          ↓
                                    Smart Chunking → Ranking
                                          ↓
                                    Workflow Selection → Prompt Building
                                          ↓
                            ┌─────────────┴─────────────┐
                            ↓                           ↓
                      Fast Agent (local)      Slow Agent (remote)
                            ↓                           ↓
                      Response Streaming ←─────────────┘
                            ↓
                      Rendering → User
                            ↓
                      Logging → Analysis → Improvement
```

### Decision Logging

Every workflow decision is logged:

```typescript
interface DecisionLog {
  timestamp: string
  sessionId: string
  workflow: string
  task: 'chat' | 'refactor' | 'research' | 'test'
  contextSources: ContextSource[]
  promptTokens: number
  responseTokens: number
  latency: number
  qualityScore?: number
  userFeedback?: 'approved' | 'rejected' | 'modified'
  modifications?: string
}
```

**Logged Information:**
- **Context selection**: Why each piece of context was chosen
- **Chunking decisions**: How documents were split
- **Workflow activations**: Which workflow fired and why
- **Quality scores**: Self-evaluation of responses
- **User feedback**: Explicit approval/rejection of outputs

---

## Workflow Patterns

### Pattern Detection

Workflows learn patterns from usage:

```typescript
interface LearnedPattern {
  type: 'context-selection' | 'chunking' | 'workflow-trigger' | 'quality'

  // Context selection patterns
  contextPattern?: {
    query: string
    successfulFiles: string[]
    successfulMCP: MCPQuery[]
    successfulRAG: string[]
    approvalRate: number
  }

  // Chunking patterns
  chunkingPattern?: {
    fileType: string
    optimalSize: number
    strategy: 'semantic' | 'fixed' | 'adaptive'
    successRate: number
  }

  // Workflow trigger patterns
  workflowTrigger?: {
    keywords: string[]
    contextSignals: string[]
    workflow: string
    accuracy: number
  }

  // Quality patterns
  qualityPattern?: {
    workflow: string
    contextMix: Record<string, number>
    averageQuality: number
    sampleSize: number
  }
}
```

### Context Patterns

Workflows learn what context works:

```typescript
interface ContextPattern {
  query: string // Original user query
  successfulContext: {
    files: string[]
    mcpQueries: MCPQuery[]
    ragResults: string[]
  }
  outcome: {
    userApproved: boolean
    qualityScore: number
    modifications: string[]
  }
  frequency: number // How often this pattern succeeds
}
```

---

## Summary

The workflow system in Glyph Nova provides:

1. **Two workflow file types**: Markdown documents and n8n-like config files
2. **Composable workflows**: Workflows can inherit and combine
3. **Self-improving workflows**: Learn from usage and improve over time
4. **Context-aware workflows**: Intelligent context gathering and ranking
5. **Multi-machine workflows**: Distribute tasks across swarm
6. **Transparent workflows**: Full visibility into workflow decisions
7. **Flexible execution**: Background experiments and validation

All workflows are configurable, composable, and designed to improve automatically based on user interactions and outcomes.

---

**See also:** [agentic-mode-system](./agentic-mode-system.md) for mode structure, [context-engineering](./context-engineering.md) for context gathering, [self-improvement-system](./self-improvement-system.md) for learning mechanisms, [multi-source-integration](./multi-source-integration.md) for MCP and RAG integration
