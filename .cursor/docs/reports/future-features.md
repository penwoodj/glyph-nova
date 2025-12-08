# Glyph Nova - Future Features & Implementation Details

**Status:** Planning Document | **Version:** 0.1.0 | **Last Updated:** 2025-12-07

> 📋 **Purpose:** Comprehensive specification of planned features, technical approaches, and implementation strategies.

**Related:** [[project-vision]] provides the high-level vision and philosophy.

---

## Table of Contents

1. [Transparency & Observability](#transparency--observability)
2. [Context Engineering](#context-engineering)
3. [Agentic Mode System](#agentic-mode-system)
4. [Smart Chunking & Memory](#smart-chunking--memory)
5. [Multi-Source Integration](#multi-source-integration)
6. [Self-Improvement System](#self-improvement-system)
7. [Multi-Machine Swarm](#multi-machine-swarm)
8. [Editor Experience](#editor-experience)
9. [Image Capabilities](#image-capabilities)
10. [VSCode Integration](#vscode-integration)

---

## Transparency & Observability

### Full Prompt Visibility

**Goal:** Every AI interaction shows exactly what was sent and why.

#### Features

- **Live prompt inspector**: See the exact prompt before sending
- **Context breakdown panel**:
  ```
  [System Prompt: 234 tokens]
  [Mode Instructions: 156 tokens]
  [File Context: 1,243 tokens]
  [Chat History: 567 tokens]
  [RAG Results: 892 tokens]
  Total: 3,092 tokens / 8,192 available
  ```
- **Token budget visualization**: Real-time bar chart of context allocation
- **Editable prompts**: Override any part of the prompt before sending

#### Technical Approach

```typescript
interface PromptBreakdown {
  system: { content: string; tokens: number; source: 'mode' | 'default' }
  context: Array<{
    type: 'file' | 'mcp' | 'rag' | 'history'
    content: string
    tokens: number
    relevance: number
    reason: string // Why this was included
  }>
  totalTokens: number
  budget: number
  truncated: boolean
}
```

### Decision Logging

**Goal:** Every AI decision is logged and analyzable.

#### Logged Information

- **Context selection**: Why each piece of context was chosen
- **Chunking decisions**: How documents were split
- **Mode activations**: Which mode fired and why
- **Quality scores**: Self-evaluation of responses
- **User feedback**: Explicit approval/rejection of outputs

<ADD_SECTION>Chats are just parse formatted files.md files you can easily toggle between for different levels/views of editing, the chat box can move around and has modes like stick to the bottom mode or in line, or move around through dragging and dropping, but by default is just stuck to the bottom like in a normal chat, or like dropdowns for detail sections or split out views for different types of data in the chat or tree like or graph like structure views, or just a literal markdown file to edit and view. edit other relevant sections without removing any other tags or their corresponding prompts based on the changes made here

#### Log Schema

```typescript
interface DecisionLog {
  timestamp: string
  sessionId: string
  mode: string
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

### Transparency UI

**Visual Components:**

```
┌───────────────────────────────────────────────┐
│  [Main Editor/Chat]                           │
│                                               │
│  ┌──────────────────────────────────┐         │
│  │ 💬 AI Response                   │         │
│  │ ┌─ Show Context ▼                │         │
│  │ │ Sources: files.ts, mode.md     │         │
│  │ │ Tokens: 3,092 / 8,192          │         │
│  │ │ Quality: 8.2/10                │         │
│  │ │ [View Full Prompt]             │         │
│  │ └───────────────────────────     │         │
│  └──────────────────────────────────┘         │
└───────────────────────────────────────────────┘
```

---

## Context Engineering

### Smart Chunking Engine

**Problem:** Large files/docs need intelligent splitting.

#### Strategies

1. **Semantic chunking**: Split on logical boundaries (functions, classes, sections)
2. **Overlapping windows**: Maintain context between chunks through easy to change modes or settings
3. **Hierarchy preservation**: Keep structural relationships
4. **Adaptive sizing**: Adjust chunk size based on content density, and llm context effective response results size metrics based on system and hardware, available memory, and model capabilities

<ADD_MORE_ITEMS>I want an item for nested summary creation and navigation through context creation and navigation on a batch process agentic workflow on a cron job probably like rag with visualization in a hierachical graph database in files with good visualization tools. and another item for a sematic memory layer with visualizaition capabilities where there are ideas of what the file does in different sections based on line number the llms can read before looking at files, with smart modes of which level of abstration to read and when it needs to. edit other relevant sections without removing any other tags or their corresponding prompts based on the changes made here

#### Implementation

```typescript
interface ChunkingStrategy {
  name: string
  detect: (content: string, filetype: string) => boolean
  chunk: (content: string, maxTokens: number) => Chunk[]
}

interface Chunk {
  content: string
  tokens: number
  metadata: {
    startLine: number
    endLine: number
    type: 'function' | 'class' | 'paragraph' | 'section'
    parent?: string // For hierarchy
    importance: number // 0-1 relevance score
  }
}
```

#### Chunking Strategies by File Type

```
Code Files:
  ├─ Functions/methods (preferred)
  ├─ Classes/modules
  ├─ Logical blocks
  └─ Fallback: Line-based with overlap

Markdown:
  ├─ Sections (##, ###)
  ├─ Paragraphs
  ├─ Lists
  └─ Code blocks (keep intact)

JSON/Config:
  ├─ Top-level keys
  ├─ Nested objects
  └─ Array preservation
```

### Context Relevance Ranking

**Goal:** Always include the most relevant context in the correct order in the prompt to maximize desired user outcome.

<ASK_ME_QUESTIONS> Ask me 5 questions about how we want this to work after all file edit prompts are complete and you've paused.  once I've answered and you've integrated the information you can remove this prompt. I think your on the right track but missing the customizablity I'm looking for.  I want these to be controlled by agentic self improving workflow system on top of something like this.  Like I want n8n like config file with visualization modes, or just a markdown file with a consistent format with sections with how to decide what context to get when and where through descirbed source and behavior flows.

#### Ranking Factors

- **Semantic similarity**: Vector embeddings (local BERT/sentence-transformers)
- **Recency**: Recently viewed/edited files score higher
- **Graph proximity**: Files close in dependency graph
- **Explicit references**: Direct mentions in user query
- **Historical success**: Patterns learned from past successful contexts

#### Ranking Algorithm

```typescript
function rankContext(
  query: string,
  candidates: ContextCandidate[],
  history: SessionHistory
): RankedContext[] {
  return candidates
    .map(c => ({
      ...c,
      score:
        0.4 * semanticSimilarity(query, c.content) +
        0.2 * recencyScore(c.lastAccessed) +
        0.2 * graphProximity(c.path, history.recentFiles) +
        0.1 * explicitMention(query, c.path) +
        0.1 * historicalSuccess(c.path, history.successfulContexts)
    }))
    .sort((a, b) => b.score - a.score)
}
```

### Context Budget Management

**Goal:** Optimize token usage across context types.

#### Budget Allocation

```
Fixed Allocations:
├─ System prompt: 200-500 tokens
├─ Mode instructions: 300-800 tokens
└─ Chat history: 500-1000 tokens (sliding window)

Dynamic Allocations (remaining budget):
├─ Primary context (50%): User-selected files
├─ Related context (25%): Dependency graph
├─ RAG results (15%): Searched documentation
└─ MCP data (10%): Live system queries
```

<ADD_DETAIL_SECTION>Add a details section here with bullets or other formatted markdown to fit in this section that details out the meta system integration like with the customizable workflow .md documents or the agentic system config files. edit other relevant sections without removing any other tags or their corresponding prompts based on the changes made here

---

## Agentic Mode System

### Mode Structure

**Modes are markdown documents** with special sections.

<REFACTOR_BELOW_SECTIONS> From `#### Mode Document Template` to `#### Mode Composition` refactor this with a bit less details on the implementation details and with this in mind: There will be 2 kinds of files for customizable agentic behavior; workflow .md documents or the agentic system config files with n8n type functionality. The agentic behavior workflow files will have this format so you can leave a template example for one of these files per file type and what it might look like but it is mainly for exampling out all the possible sections and reasonable examples with templated out details with brief descriptions about the type of stuff that will go in these files and why, but the descriptions shouldn't contain details of each config property as that is what the individual example files by type are for, and give a disclaimer that the real files might be shorter or need to be shorter, and the recommended section lenght will be detected from the system and models running capabilities but these recommendations will display in the app when editing these files depending on the file visualization mode. edit other relevant sections without removing any other tags or their corresponding prompts based on the changes made here

#### Mode Document Template

```markdown
# [Mode Name]

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

#### Built-In Modes

**Code Review Mode** (`modes/code-review.md`)

```markdown
# Code Review Mode

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

**Research Mode** (`modes/research.md`)

```markdown
# Research Mode

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

**Refactor Mode** (`modes/refactor.md`)

```markdown
# Refactor Mode

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

### Mode Selection

**Automatic Mode Triggers:**

```typescript
interface ModeTrigger {
  mode: string
  conditions: Array<{
    type: 'keyword' | 'context' | 'file-type' | 'pattern'
    value: string | RegExp
    weight: number
  }>
}

// Example triggers
const triggers: ModeTrigger[] = [
  {
    mode: 'code-review',
    conditions: [
      { type: 'keyword', value: 'review', weight: 0.8 },
      { type: 'keyword', value: 'issues', weight: 0.6 },
      { type: 'context', value: 'git-diff-present', weight: 0.9 }
    ]
  },
  {
    mode: 'refactor',
    conditions: [
      { type: 'keyword', value: 'refactor', weight: 1.0 },
      { type: 'keyword', value: 'improve', weight: 0.5 },
      { type: 'pattern', value: /simplify|clean.*up/i, weight: 0.7 }
    ]
  }
]
```

### Mode Composition

**Modes can inherit and combine:**

```markdown
# Full Stack Mode

## Extends
- [[code-review]]
- [[testing]]
- [[api-design]]

## Additional Context
- Files: Frontend + Backend files
- MCP: `docker` (container status)

## Combined Instructions
1. Review frontend changes (Code Review Mode)
2. Check API contracts (API Design Mode)
3. Verify tests (Testing Mode)
4. Check deployment impact (Docker MCP)
```

---

## Smart Chunking & Memory

### Persistent Memory

**Goal:** Remember successful patterns and contexts across sessions.

#### Memory Types

```
Session Memory (in-memory):
├─ Current context
├─ Recent decisions
└─ Active mode state

Short-term Memory (SQLite):
├─ Last 7 days of logs
├─ Recent context patterns
└─ Quick lookup cache

Long-term Memory (Vector DB):
├─ All historical sessions
├─ Successful context patterns
└─ Quality-approved responses
```

### Context Patterns

**Learn what context works:**

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

// Pattern matching for future queries
function findSimilarPatterns(
  query: string,
  patterns: ContextPattern[]
): ContextPattern[] {
  return patterns
    .filter(p => cosineSimilarity(query, p.query) > 0.7)
    .sort((a, b) => b.frequency - a.frequency)
}
```

### Automatic Context Optimization

**Goal:** Learn optimal chunk sizes and context mixes.

```typescript
interface ContextOptimization {
  fileType: string
  taskType: 'chat' | 'refactor' | 'research'
  optimalChunkSize: number // Learned from successful sessions
  optimalContextMix: {
    files: number // Percentage of token budget
    rag: number
    mcp: number
    history: number
  }
  confidence: number // 0-1, increases with more data
}
```

---

## Multi-Source Integration

### MCP (Model Context Protocol)

**Goal:** Query live systems for real-time context.

#### Supported MCP Servers

```
Core Servers:
├─ filesystem: File operations, search, watch
├─ git: Repository data, history, blame
├─ postgres: Database schema, queries
├─ github: Issues, PRs, discussions
└─ docker: Container status, logs

Future Servers:
├─ kubernetes: Cluster state
├─ web-search: DuckDuckGo, Brave
├─ linear: Project management
└─ custom: User-defined servers
```

#### MCP Query Language

```yaml
# In mode document
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

### RAG (Retrieval Augmented Generation)

**Goal:** Search indexed documentation and code.

#### RAG Indices

```
Documentation Indices:
├─ typescript-docs: Official TS documentation
├─ redwood-docs: Framework documentation
├─ codebase-index: This project's code
└─ custom-docs: User-added documentation

Update Strategy:
├─ Real-time: Codebase changes indexed immediately
├─ Daily: External docs updated nightly
└─ On-demand: Manual reindex command
```

#### RAG Query Process

```
1. User query → Embedding generation (local BERT)
2. Vector similarity search (cosine distance)
3. Retrieve top-k chunks (k=10-20)
4. Re-rank by relevance to specific query
5. Include top 3-5 in context with source citations
```

#### RAG Configuration

```typescript
interface RAGConfig {
  index: string
  embeddingModel: 'local-bert' | 'openai-ada' | 'custom'
  chunkSize: number
  chunkOverlap: number
  topK: number
  minRelevance: number // 0-1 threshold
  citeSources: boolean
}
```

### Context Source Orchestration

**Goal:** Intelligently combine multiple context sources.

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

---

## Self-Improvement System

### Log Analysis Pipeline

**Goal:** Automatically learn from usage patterns.

```
User Interaction → [Log] → [Analysis Queue] → [Pattern Detection]
                                 ↓
                           [Quality Scoring] → [Pattern Storage]
                                 ↓
                           [Mode Updates] ← [User Approval]
```

#### Analysis Triggers

- **Immediate**: User explicitly approves/rejects output
- **Batch (nightly)**: Analyze day's logs for patterns
- **Weekly**: Deep analysis of quality trends
- **On-demand**: Manual "Learn from this session" command

### Pattern Detection

**What to learn:**

```typescript
interface LearnedPattern {
  type: 'context-selection' | 'chunking' | 'mode-trigger' | 'quality'

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

  // Mode trigger patterns
  modeTrigger?: {
    keywords: string[]
    contextSignals: string[]
    mode: string
    accuracy: number
  }

  // Quality patterns
  qualityPattern?: {
    mode: string
    contextMix: Record<string, number>
    averageQuality: number
    sampleSize: number
  }
}
```

### Automatic Mode Improvement

**Goal:** Modes self-evolve based on usage.

#### Improvement Process

```
1. Detect pattern (e.g., "Research mode often needs more RAG results")
2. Generate proposed change to mode document
3. Show diff to user: "Research mode could be improved"
4. User approves → Update mode
5. Track success of new mode version
6. Rollback if quality decreases
```

#### Example Improvement

```diff
# Research Mode

## Context Sources
- Files: Related code examples
- RAG: All indexed documentation
- - MCP: `web-search` (for latest info)
+ + MCP: `web-search`, `github` (for latest info + related issues)

## Instructions
### Process
1. Query RAG indices for existing knowledge
+ 2. Check GitHub issues for recent discussions
- 2. Search web if no local docs found
+ 3. Search web if no local docs or issues found
```

**Approval UI:**

```
┌─────────────────────────────────────────────┐
│ 🎓 Mode Improvement Detected                │
│                                             │
│ Research Mode could be improved:            │
│ • Add GitHub MCP for issue search          │
│ • Check issues before web search           │
│                                             │
│ Based on 15 sessions with 8.4/10 quality   │
│ when GitHub context was manually added.     │
│                                             │
│ [View Diff] [Approve] [Reject] [Remind Me] │
└─────────────────────────────────────────────┘
```

---

## Multi-Machine Swarm

### Architecture

**Goal:** Distribute AI work across multiple machines.

```
┌──────────────────────────────────────────────────┐
│  Developer Machine (Primary)                     │
│  ├─ Editor UI                                    │
│  ├─ Fast agents (chat, autocomplete)            │
│  └─ Swarm orchestrator                           │
└──────────────────────────────────────────────────┘
          ↓ (gRPC / WebSocket)
┌──────────────────────────────────────────────────┐
│  Server 1: Code Analysis                         │
│  ├─ Slow LLM (70B+ models)                       │
│  ├─ Background refactoring                       │
│  └─ Deep code analysis                           │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│  Server 2: Research & RAG                        │
│  ├─ Vector database (Qdrant/Chroma)             │
│  ├─ Document indexing                            │
│  └─ Research agent                               │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│  Server 3: Testing & Validation                  │
│  ├─ Test runner                                  │
│  ├─ Build verification                           │
│  └─ Quality analysis                             │
└──────────────────────────────────────────────────┘
```

### Task Distribution

**Routing Rules:**

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

### Communication Protocol

**WebSocket + gRPC hybrid:**

```protobuf
service SwarmCoordinator {
  rpc SubmitTask(Task) returns (TaskReceipt);
  rpc GetTaskStatus(TaskId) returns (TaskStatus);
  rpc StreamResults(TaskId) returns (stream TaskResult);
  rpc CancelTask(TaskId) returns (Empty);
}

message Task {
  string id = 1;
  string type = 2; // chat, refactor, research, test
  string priority = 3;
  bytes context = 4; // Compressed context
  map<string, string> metadata = 5;
}
```

### Failover & Load Balancing

**Resilience:**

```
Primary strategy: Route to least-loaded machine
Fallback 1: Use slower local model if remote unavailable
Fallback 2: Queue task for later if all servers busy
Fallback 3: Notify user and ask to wait or use fast model
```

---

## Editor Experience

### Rich Markdown Editing

**Goal:** Notion/Obsidian-style WYSIWYG with plaintext fallback.

#### Features

- **Inline formatting**: Bold, italic, code without syntax
- **Block types**: Headers, lists, tables, code blocks
- **Embeds**: Images, videos, iframes
- **Live preview**: See rendering while typing
- **Vim mode**: For power users
- **Collaborative cursors**: (Future) Multi-user editing

#### Toggle Modes

```
WYSIWYG Mode (default):
  ├─ Visual block editing
  ├─ Inline toolbar
  └─ Hidden markdown syntax

Source Mode (toggle):
  ├─ Raw markdown
  ├─ Syntax highlighting
  └─ Vim bindings

Split Mode:
  ├─ Edit source (left)
  └─ Live preview (right)
```

### Code Editing

**Goal:** VSCode-level editing experience.

#### Features

- **Syntax highlighting**: 80+ languages
- **IntelliSense**: Local LSP servers
- **Multi-cursor**: VSCode-style editing
- **Git integration**: Inline diff, blame
- **Bracket matching**: Rainbow brackets
- **Minimap**: Code overview

#### AI Assistance

```
Inline AI:
├─ Autocomplete (fast model, < 100ms)
├─ Code suggestions (fast model)
├─ Refactoring hints (background, slow model)
└─ Documentation generation (on-demand)
```

### File Tree Intelligence

**Goal:** Smart file navigation with AI insights.

#### Features

- **Fuzzy search**: Instant file finding
- **Recent files**: MRU with keyboard shortcuts
- **Dependency graph**: Visual file relationships
- **AI annotations**:
  ```
  📁 src/
    📁 components/
      📄 Chat.tsx ⚡ Modified 2m ago
      📄 Editor.tsx 🔍 Related to current task
      📄 FileTree.tsx
  ```
- **Smart bookmarks**: AI-suggested important files

---

## Image Capabilities

### Local Image Generation

**Goal:** Generate images without cloud APIs.

#### Supported Models

```
Stable Diffusion:
├─ SD 1.5 (fast, lower quality)
├─ SDXL (slower, high quality)
└─ SD Turbo (real-time, preview)

Flux:
├─ Flux Dev (research, open)
└─ Flux Schnell (fast inference)

ControlNet:
├─ Canny edge detection
├─ Depth map
└─ Pose estimation
```

#### Integration Points

```markdown
In markdown:
![Generate: A modern UI mockup for a chat interface](generate)

In chat:
User: Create a logo for Glyph Nova
AI: [Generates multiple options, shows inline]

In code comments:
// @generate-icon: A file tree icon, minimalist, 24x24
```

### Image Editing

**Goal:** Edit images inline with AI assistance.

#### Features

- **InstructPix2Pix**: Edit with text instructions
  ```
  Original: photo.jpg
  Instruction: "Make the background darker"
  Result: photo-edited.jpg
  ```
- **Inpainting**: Select area to regenerate
- **Upscaling**: Local Real-ESRGAN
- **Style transfer**: Apply artistic styles

### Context-Aware Generation

**Goal:** Use codebase context for relevant images.

```typescript
// AI reads component code to generate mockup
function generateMockupFromComponent(componentPath: string) {
  const code = readFile(componentPath)
  const uiStructure = parseJSXStructure(code)
  const prompt = `
    Generate a UI mockup for:
    ${uiStructure.description}

    Layout:
    ${uiStructure.layout}

    Style: Modern, clean, dark theme
  `
  return generateImage(prompt, { model: 'sdxl' })
}
```

---

## VSCode Integration

### Configuration Import

**Goal:** Use existing VSCode configs seamlessly.

#### Supported Configs

```
settings.json:
├─ Editor preferences
├─ Keybindings
├─ Theme settings
└─ Language configs

keybindings.json:
├─ Import all custom bindings
└─ Map to Glyph Nova actions

extensions (future):
├─ Load VSCode extension API
├─ Run compatible extensions
└─ Auto-convert incompatible ones
```

### Theme Compatibility

**Goal:** Use VSCode themes natively.

```typescript
interface VSCodeTheme {
  name: string
  type: 'dark' | 'light'
  colors: Record<string, string> // UI colors
  tokenColors: TokenColor[] // Syntax highlighting
}

// Auto-convert to Glyph Nova theme
function convertVSCodeTheme(theme: VSCodeTheme): GlyphNovaTheme {
  return {
    editor: mapEditorColors(theme.colors),
    syntax: mapTokenColors(theme.tokenColors),
    ui: mapUIColors(theme.colors)
  }
}
```

### Extension API (Long-Term)

**Goal:** Run VSCode extensions with compatibility layer.

#### Priority Extensions

1. **Language servers**: TypeScript, Python, Rust, Go
2. **Linters**: ESLint, Pylint, cargo-clippy
3. **Git**: GitLens, Git Graph
4. **Productivity**: Vim, Prettier, TODO Highlight

#### Compatibility Strategy

```
Phase 1: Pure language servers (LSP standard)
Phase 2: Read-only extensions (linters, viewers)
Phase 3: Editor extensions (formatters, refactorings)
Phase 4: Full VSCode Extension API compatibility
```

---

## Implementation Roadmap

### Phase 1: Transparency & Context (3-6 months)

- [ ] Full prompt visibility UI
- [ ] Decision logging system
- [ ] Smart chunking engine
- [ ] Context relevance ranking
- [ ] Basic MCP integration (git, filesystem)

### Phase 2: Modes & Self-Improvement (6-9 months)

- [ ] Mode system implementation
- [ ] Default mode library (5-10 modes)
- [ ] Log analysis pipeline
- [ ] Pattern detection algorithms
- [ ] Auto-improvement UI

### Phase 3: RAG & Multi-Source (9-12 months)

- [ ] RAG indexing system
- [ ] Vector database integration
- [ ] MCP server ecosystem
- [ ] Context orchestration
- [ ] Advanced ranking algorithms

### Phase 4: Swarm & Scale (12-18 months)

- [ ] Multi-machine protocol
- [ ] Task distribution system
- [ ] Load balancing
- [ ] Failover mechanisms
- [ ] Performance monitoring

### Phase 5: Polish & Extensions (18-24 months)

- [ ] Image generation integration
- [ ] VSCode config import
- [ ] Extension compatibility layer
- [ ] Advanced editor features
- [ ] Community mode sharing

---

## Technical Architecture

### Technology Stack

**Frontend:**

```
Editor:
├─ Monaco Editor (VSCode engine)
├─ ProseMirror (Rich markdown)
└─ Custom rendering layer

UI Framework:
├─ React 18+ (concurrent features)
├─ Tailwind CSS (styling)
└─ Radix UI (accessible components)

State Management:
├─ Zustand (global state)
├─ TanStack Query (server state)
└─ Jotai (atomic state)
```

**Backend:**

```
API Layer:
├─ GraphQL (Redwood.js)
├─ gRPC (swarm communication)
└─ WebSocket (real-time updates)

AI Integration:
├─ Ollama (local LLM runtime)
├─ llama.cpp (C++ inference)
└─ Custom agents (Python/TypeScript)

Data Layer:
├─ SQLite (session data, logs)
├─ Vector DB (Qdrant/Chroma for RAG)
└─ File system (modes, configs)
```

**Infrastructure:**

```
Desktop App:
├─ Tauri (Rust + Web)
└─ Native file system access

Swarm:
├─ gRPC (inter-machine RPC)
├─ Redis (task queue, pub/sub)
└─ Docker (containerized agents)
```

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
                                    Mode Selection → Prompt Building
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

---

## Open Questions & Considerations

### Questions to Clarify Vision

1. **Multi-Machine Priority**

   - Q: How important is swarm deployment in early phases?
   - Q: Should we support cloud-hosted swarm nodes, or strictly local/self-hosted?
   - Q: What's the network topology? (star, mesh, hierarchical?)
2. **Mode System Details**

   - Q: Should modes be Turing-complete (can they run code), or just declarative configs?
   - Q: How should mode inheritance work? (extends, mixins, composition?)
   - Q: Should there be a "mode marketplace" for sharing?
3. **Context Engineering Trade-offs**

   - Q: What's more important: accuracy of context or speed of gathering?
   - Q: Should RAG be mandatory or optional for each mode?
   - Q: How much control should users have over chunking strategies?
4. **Self-Improvement Boundaries**

   - Q: Should AI be able to modify modes without approval?
   - Q: What's the approval threshold? (single user, multiple sessions, confidence score?)
   - Q: How to handle conflicting learned patterns?
5. **Editor Philosophy**

   - Q: Primary audience: developers, researchers, or both?
   - Q: Should it support non-code use cases (writing, note-taking)?
   - Q: How much VSCode compatibility is required vs. nice-to-have?

---

## Related Documentation

- **[[project-vision]]** - High-level vision and principles
- **[Implementation Status](./implementation-status.md)** - Current progress
- **[Desktop Architecture](./pass2/09-desktop-app-architecture.md)** - Technical details

---

**This is a living document. As features are implemented or priorities shift, this document will be updated to reflect the current plan.**
