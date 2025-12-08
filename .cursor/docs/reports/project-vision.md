# Glyph Nova - Project Vision

**Status:** Living Document | **Version:** 0.1.0 | **Last Updated:** 2025-12-07

> 🎯 **Core Mission:** A transparency-first, local-LLM text editor with customizable agentic behavior that replaces Cursor for advanced context engineering workflows.

---

## Vision at a Glance

```
┌────────────────────────────────────────────────────────────────┐
│                    TRANSPARENCY FIRST                          │
│  Every AI decision, context, and workflow is visible & editable│
└────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────┬──────────────┬───────────────┬──────────────┐
│  LOCAL-LLM   │   AGENTIC    │   CONTEXT     │   SWARM      │
│   SWARM      │    MODES     │ ENGINEERING   │  DEPLOYMENT  │
│              │              │               │              │
│ Multi-machine│ Editable AI  │ MCP + RAG +   │ Distributed  │
│ distribution │ workflows    │ Smart chunking│ orchestration│
└──────────────┴──────────────┴───────────────┴──────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              SPEED-OPTIMIZED ARCHITECTURE                   │
│  Fast agents (chat) + Slow agents (background tasks)        │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Principles

### 🔍 Transparency First
- **All AI behavior is visible**: Every prompt, context selection, and reasoning step
- **Everything is editable**: No black boxes, no hidden rules
- **Self-improving**: Logs analyzed to improve context quality automatically or on approval

### 🏠 Local First
- **Your data, your machine**: No cloud dependencies
- **Swarm-ready**: Distribute across multiple machines you control
- **Privacy by design**: Everything runs on infrastructure you own

### ⚡ Speed-Optimized
```
Fast Tier (Chat)     →  Smaller models, <1s response
Slow Tier (Background) →  Larger models, quality over speed
```

### 🎨 Obsidian Meets VSCode
- **Rich markdown editor**: Notion/Obsidian-style WYSIWYG
- **Toggleable text mode**: System-wide or per-document plain text
- **VSCode compatibility**: Eventually full compatibility desired but not required initially. Themes based on VSCode styles is fine. Extensions initially supplemented through agentic n8n-style workflows, eventually full compatibility.

### 👥 Primary Audience
- **Context engineers**: Trying to get quality output from local LLMs through easy-to-edit fully transparent simple local agentic workflows
- **PKM focus**: This whole project is a PKM and tool builder for managing life notes to direct research and activity to building ideas

---

## What Makes It Different

| Feature | Cursor | Glyph Nova |
|---------|--------|------------|
| **Transparency** | Hidden prompts & rules | Fully visible & editable |
| **Context Engine** | Fixed behavior | Smart chunking, self-learning |
| **Modes** | Predefined | Agentic instruction documents |
| **Deployment** | Cloud-based | Local swarm across machines |
| **Rules** | Static .cursorrules | Dynamic, context-aware modes |
| **Context Sources** | Limited | MCP + RAG + custom integrations |

---

## The "Mode" Concept

**Modes are not settings** — they're **agentic instruction documents** that define:

```
📄 Mode Document = {
  ├─ Context gathering rules (what to search, where to look)
  ├─ MCP connections (which servers to query)
  ├─ RAG configurations (which indices to use)
  ├─ Workflow instructions (how to process information)
  ├─ Output formatting (how to present results)
  └─ Quality metrics (how to self-evaluate)
}
```

**Examples:**
- **Code Review Mode**: Reads lints, runs tests, checks git history
- **Research Mode**: Queries RAG indices, searches docs, synthesizes findings
- **Refactor Mode**: Analyzes AST, checks dependencies, suggests patterns

All modes are:
- ✅ Fully visible as markdown files
- ✅ User-editable
- ✅ Context-aware (can read from multiple sources)
- ✅ Self-documenting (explain their reasoning)

---

## Architecture Vision

### Three-Tier Intelligence
```
┌─────────────────────────────────────────────────┐
│         USER INTERFACE (Markdown Editor)        │
│  Obsidian-style editing with inline AI         │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│        FAST AGENTS (Chat & Interactions)        │
│  Small models: Qwen, Phi, Gemma (< 7B)         │
│  Response time: < 1s                            │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│      SLOW AGENTS (Background Analysis)          │
│  Large models: LLaMA 70B, Mixtral 8x22B        │
│  Quality tasks: refactoring, research, testing  │
└─────────────────────────────────────────────────┘
```

### Context Engineering Pipeline
```
Input → [Smart Chunking] → [Relevance Ranking] → [Mode-Based Selection]
   → [LLM Processing] → [Self-Evaluation] → [Log Analysis] → [Auto-Improvement]
```

### Multi-Machine Swarm
```
Development Machine:  Fast agents + Editor
Local Server 1:       Slow agents (code analysis)
Local Server 2:       RAG indexing + search
Local Server 3:       Background research tasks
```

**Network Topology:** Start with star topology (one coordinator, multiple workers), evolve to mesh topology (peer-to-peer) over time as hardware expands.

---

## Image Capabilities (Long-Term)

**Local-First Vision:**
- Generate images with local models (Stable Diffusion, Flux)
- Edit images inline (ControlNet, InstructPix2Pix)
- Context-aware generation (use codebase for UI mockups)
- No cloud APIs, all local inference

---

## Implementation Philosophy

### Phase 1: Foundation (Current)
- ✅ Basic editor + chat
- ✅ File context loading
- ✅ Ollama integration

### Phase 2: Transparency & Context
- 🔄 Visible prompts/contexts
- 🔄 MCP integration
- 🔄 RAG setup
- 🔄 Smart chunking

### Phase 3: Modes, RAG & Multi-Machine
- ⏭️ Agentic mode system
- ⏭️ Default workflow library
- ⏭️ Self-improvement from logs
- ⏭️ RAG indexing system
- ⏭️ Multi-machine protocol
- ⏭️ Context orchestration
- ⏭️ Vector database integration
- ⏭️ MCP server ecosystem
- ⏭️ Performance monitoring
- ⏭️ Advanced ranking algorithms
- ⏭️ Task distribution system
- ⏭️ Load balancing
- ⏭️ Failover mechanisms

---

## Success Metrics

**The goal is achieved when:**
1. ✅ I prefer using Glyph Nova over Cursor for daily work
2. ✅ Context engineering is faster and more precise
3. ✅ AI behavior is completely transparent and controllable
4. ✅ Through opting in, Modes are easily shared and improved by the community
5. ✅ Multi-machine setup provides clear performance benefits

---

## Related Documentation

### Feature Specifications

The [[future-features]] documentation has been split into detailed sections:

**Core Features:**
- [[transparency-observability]] - Full prompt visibility and decision logging
- [[context-engineering]] - Smart chunking, relevance ranking, and budget management
- [[agentic-mode-system]] - Mode structure, selection, and composition

**Advanced Capabilities:**
- [[multi-source-integration]] - MCP, RAG, and context orchestration
- [[self-improvement-system]] - Log analysis and automatic mode improvement
- [[multi-machine-swarm]] - Distributed AI work across multiple machines
- [[smart-chunking-memory]] - Persistent memory and context patterns

**User Experience:**
- [[editor-experience]] - Rich markdown editing and code editing features
- [[image-capabilities]] - Local image generation and editing
- [[vscode-integration]] - Configuration import and extension compatibility

**Planning & Architecture:**
- [[implementation-roadmap]] - Phased development plan
- [[technical-architecture]] - Technology stack and data flow
- [[open-questions]] - Considerations and clarifications needed

**Quick Access:**
- [[future-features/index]] - Complete table of contents and navigation

### Other Documentation

- **[Implementation Status](./implementation-status.md)** - Current development status
- **[Desktop Architecture](./pass2/09-desktop-app-architecture.md)** - Technical architecture details

---

**For detailed feature specifications, see [[future-features/index]]**
