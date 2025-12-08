# Agentic Mode System

**Related:** [index](./index.md) | [context-engineering](./context-engineering.md) | [self-improvement-system](./self-improvement-system.md) | [multi-source-integration](./multi-source-integration.md)

---

## Mode Structure

**Modes are markdown documents** with special sections. There are two kinds of files for customizable agentic behavior:

1. **Workflow .md documents**: Markdown files with structured sections
2. **Agentic system config files**: n8n-like config files with visualization modes

### Mode Document Template

**Note:** This template shows all possible sections with examples. Real files might be shorter or need to be shorter. Recommended section length will be detected from system and model capabilities, and these recommendations will display in the app when editing these files depending on the file visualization mode.

There are two types of files for customizable agentic behavior:

1. **Workflow .md documents**: Markdown files with structured sections
2. **Agentic system config files**: n8n-like config files with visualization modes

#### Workflow .md Document Template

This template shows the structure and possible sections for workflow markdown files. Brief descriptions indicate what goes in each section and why, but detailed config properties are documented in individual example files by type.

```markdown
# [Mode Name]

## Context Sources
# Define where to gather context from (files, MCP servers, RAG indices)

## Instructions
# Describe the role, goals, and process for this mode

## Context Rules
# Specify file selection patterns, chunking strategies, and prioritization

## Output Format
# Define how responses should be structured

## Quality Metrics
# Specify how to measure success for this mode

## Examples
# Provide example inputs, contexts, and expected outputs
```

#### n8n-Style Config File Template

Agentic system config files use n8n-like structure with visualization modes. The config defines workflow nodes, connections, and behavior flows for context selection and processing.

**Note:** Detailed config properties and node specifications are documented in individual example config files. This template shows the high-level structure only.

### Built-In Modes Examples

The default built-in workflows encompass several common modes. These examples show the structure and approach rather than detailed implementation:

**Code Review Mode** (`modes/code-review.md`)
- Gathers context from current file, dependencies, git history, and test results
- Analyzes code against standards and provides ranked feedback
- See individual mode files for complete structure and config details

**Research Mode** (`modes/research.md`)
- Queries RAG indices and web search for information
- Synthesizes findings with code examples
- Provides structured summaries with citations
- See individual mode files for complete structure and config details

**Refactor Mode** (`modes/refactor.md`)
- Analyzes code structure using AST and dependency graphs
- Suggests pattern improvements and refactoring steps
- Tracks quality metrics like complexity and type safety
- See individual mode files for complete structure and config details

**Note:** These are high-level descriptions. For detailed examples of workflow .md files and n8n-style config files, see the individual mode files in the modes directory.

---

## Mode Selection

**Mode selection is a config file workflow** that is accessible and configurable at every level. Good defaults are provided, but nothing is locked to specific implementations. Everything is either a workflow `.md` file or an n8n-style config file workflow.

### Key Feature Goals

- **Automatic mode detection**: Intelligently selects appropriate mode based on context
- **Configurable at every level**: Users can customize selection logic through workflows
- **Workflow-based architecture**: Uses markdown or n8n-style config files, not hardcoded logic
- **Composable selection**: Selection workflows can reference and combine with other workflows
- **Manual override**: Users can always manually select or override automatic selection

### How It Works

Mode selection operates as a workflow that analyzes context and user input to determine the most appropriate mode. The selection workflow can access:
- User input (keywords, intent signals)
- Current context (open files, git state, project structure)
- Mode definitions and capabilities
- Historical selection patterns

The workflow then selects and activates the appropriate mode, with the ability for users to override at any time.

### Auto Mode Selection

Similar to Cursor's auto mode, but implemented entirely as a workflow that uses and links to other workflows. The default built-in workflows encompass common mode selection patterns, but users can customize or replace these workflows entirely.

### Data Structure Shapes

Mode selection workflows work with data structures that include:
- **Input signals**: User input, context state, file information
- **Mode definitions**: Available modes and their characteristics
- **Selection results**: Chosen mode with confidence/explanation
- **Configuration**: Workflow settings and customization options

These are high-level shapes - specific implementations are defined in workflow files.

---

## Mode Composition

Modes can inherit and combine functionality from other modes. Composition is handled via n8n-style agent workflow config files that preprocess workflow `.md` files to parse inheritance relationships.

**How Composition Works:**
- Workflow config files parse linked mode files
- Relevant sections are extracted and combined
- New composite modes can be created from existing ones
- Inheritance relationships are defined through links

**Example Composition Structure:**

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
# Combines processes from extended modes
```

**Note:** The actual composition mechanism is workflow-based, allowing flexible combination of mode behaviors without hardcoded logic. See individual mode files for detailed composition examples.

---

**See also:** [context-engineering](./context-engineering.md) for how modes gather context, [self-improvement-system](./self-improvement-system.md) for how modes improve over time, [multi-source-integration](./multi-source-integration.md) for MCP and RAG integration
