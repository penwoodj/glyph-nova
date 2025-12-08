# Self-Improvement System

**Related:** [index](./index.md) | [agentic-mode-system](./agentic-mode-system.md) | [smart-chunking-memory](./smart-chunking-memory.md) | [transparency-observability](./transparency-observability.md) | [context-engineering](./context-engineering.md)

---

## Overview

The Self-Improvement System uses **scoped summary workflows** of both types (workflow .md documents and agentic system config files) to improve behavior over time. This is a combination of interlinked files that work together - everything is workflow-based, not hardcoded logic.

### Core Concept

The system creates summaries from logs based on specific scopes. Each scope serves a particular goal. For example:
- **Goal**: Minimize back-and-forth in chats
- **Scope**: Find interactions requiring multiple corrections
- **Action**: With those summaries, workflows create and improve workflows and context docs to address the issues

This scoped summary approach allows the system to target specific improvement areas without requiring manual intervention. The summaries drive workflow creation and editing, which in turn improve behavior to better align with user aims over time.

### How Scoped Summary Workflows Work

1. **Define Scope**: Each self-improvement workflow defines a specific scope (e.g., multi-turn corrections, context ordering experiments)
2. **Analyze Logs**: Workflows analyze logs based on that scope to find patterns
3. **Generate Summaries**: Summaries capture key insights and patterns
4. **Create/Update Workflows**: Based on summaries, workflows create or edit other workflows and context documents
5. **Improve Behavior**: The improved workflows lead to better behavior alignment

All of this happens through workflows (both .md files and n8n-style config files), not through hardcoded code. Background experiments can be run using workflows to test different approaches and refine strategies.

---

## Self-Improvement Workflow Examples

### 1. Minimal Back-and-Forth Workflow

**Goal:** Make responses match user desired behavior with minimal back and forth.

**Scope:** Find interactions that took more than one prompting or multiple corrections.

**Process:**
1. Analyze logs for multi-turn corrections
2. Generate summary of patterns causing re-prompting
3. Create/update workflows and context docs to address issues
4. Edit debug workflows and nested referenced workflows to have correct behavior

### 2. Context Feeding Order Optimization

**Goal:** Optimize the order and combination of context in prompts.

**Scope:** Test different combinations of context in the same prompt, then analyze behavior differences.

**Process:**
1. Run background experiments with different context orderings
2. Generate logs of behavior differences in responses
3. Summarize logs for another workflow to use
4. Integrate learnings into improving existing user context feeding backend reordering
5. Improve prompt fixing, interaction, and automatic workflows

### 3. Mode Selection Accuracy

**Goal:** Improve automatic mode selection accuracy.

**Scope:** Analyze mode selection decisions and their outcomes.

**Process:**
1. Track mode selections vs. user overrides
2. Identify patterns where wrong modes were selected
3. Update mode selection workflows with better triggers
4. Test improved selection logic

### 4. Quality Metric Optimization

**Goal:** Optimize quality metrics to better match user satisfaction.

**Scope:** Analyze quality scores vs. user feedback patterns to identify metric misalignment.

**Process:**
1. Compare self-reported quality scores with user approval/rejection patterns
2. Identify cases where high scores didn't match user satisfaction
3. Generate summaries of metric misalignment patterns
4. Create workflows to adjust quality metric calculations
5. Test improved metrics and refine based on results

---

## Log Analysis Pipeline

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

---

## Pattern Detection

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

---

## Automatic Mode Improvement

**Goal:** Modes self-evolve based on usage.

### Improvement Process

```
1. Detect pattern (e.g., "Research mode often needs more RAG results")
2. Generate proposed change to mode document
3. Show diff to user: "Research mode could be improved"
4. User approves → Update mode
5. Track success of new mode version
6. Rollback if quality decreases
```

### Example Improvement

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

## Approval Workflow

Each workflow specifies approval requirements (approve all, keep improving, etc.). Default: improvements visible but don't override in-use files until user approves. When approved, starts using improved workflow. Self-improvement logs batch process includes scoped summary comparing metrics (minimize back-and-forth, first correct behavior). If results similar, workflow can shift back to previous versions, then reflection workflow reasons through why similar results and thinks of other strategies.

Everything learns through self-improving workflows (learns from both approved and rejected improvements).

---

## Conflict Resolution

Conflicting patterns logged for later user review. Conflict doc `.md` file can be chatted with to create resolution implemented in all conflicting and related files in agentic suite.

---

## Background Experimentation

The system can run background experiments using workflows to:
- Test different context combinations
- Try alternative mode selection strategies
- Experiment with chunking approaches
- Validate improvements before deployment

All experimentation is done through workflows (both .md and config file types), not hardcoded logic.

---

**See also:** [agentic-mode-system](./agentic-mode-system.md) for how modes are structured, [smart-chunking-memory](./smart-chunking-memory.md) for context pattern learning, [transparency-observability](./transparency-observability.md) for decision logging
