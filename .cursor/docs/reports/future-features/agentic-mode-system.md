# Agentic Mode System

**Related:** [[index]] | [[context-engineering]] | [[self-improvement-system]] | [[multi-source-integration]]

---

## Mode Structure

**Modes are markdown documents** with special sections. There are two kinds of files for customizable agentic behavior:

1. **Workflow .md documents**: Markdown files with structured sections
2. **Agentic system config files**: n8n-like config files with visualization modes

<REFACTOR_BELOW_SECTIONS> From `#### Mode Document Template` to `#### Mode Composition` refactor this with a bit less details on the implementation details and with this in mind: There will be 2 kinds of files for customizable agentic behavior; workflow .md documents or the agentic system config files with n8n type functionality. The agentic behavior workflow files will have this format so you can leave a template example for one of these files per file type and what it might look like but it is mainly for exampling out all the possible sections and reasonable examples with templated out details with brief descriptions about the type of stuff that will go in these files and why, but the descriptions shouldn't contain details of each config property as that is what the individual example files by type are for, and give a disclaimer that the real files might be shorter or need to be shorter, and the recommended section lenght will be detected from the system and models running capabilities but these recommendations will display in the app when editing these files depending on the file visualization mode. edit other relevant sections without removing any other tags or their corresponding prompts based on the changes made here

### Mode Document Template

**Note:** This template shows all possible sections with examples. Real files might be shorter. Recommended section length will be detected from system and model capabilities, and these recommendations will display in the app when editing these files depending on the file visualization mode.

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

### Built-In Modes

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

---

## Mode Selection

<REFACTOR_SECTION> This Mode Selection section needs a refactor with some more info. Don't put implementation details in this context to this low of a level.  you can outline shapes of known data structures, but don't be too opinionated.  this mode selection will be a config file workflow mentioned previously, and will accessible and configurable at every level.  we want good defaults like these but I don't want to be stuck to any specific implementation details past high level feature expression, and encoding that is okay. I want there to be an auto mode select similar to cursor, but that is just a workflow that uses/links to workflows.  again everything is either a .md file, or a config file workflow similar to n8n. The default starting built in workflows will encompas the modes, but a list and brief description of key feature goals and how it works is preferred. edit other relevant sections without removing any other tags or their corresponding prompts based on the changes made here

**Mode selection is a config file workflow** that is accessible and configurable at every level. There will be good defaults, but everything is either a `.md` file or a config file workflow similar to n8n.

### Auto Mode Selection

Similar to Cursor's auto mode, but implemented as a workflow that uses/links to other workflows. The default starting built-in workflows will encompass the modes.

### Key Features

- **Automatic detection**: Based on keywords, context, file types, and patterns
- **Configurable triggers**: Define custom mode selection logic
- **Workflow-based**: Uses markdown or n8n-style config files
- **Composable**: Modes can reference and combine with other modes

### Mode Selection Workflow Structure

The mode selection workflow can be configured to:
- Analyze user input for keywords and intent
- Check current context (open files, git state, etc.)
- Match against mode definitions
- Select and activate appropriate mode
- Allow manual override at any time

---

## Mode Composition

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

**See also:** [[context-engineering]] for how modes gather context, [[self-improvement-system]] for how modes improve over time, [[multi-source-integration]] for MCP and RAG integration
