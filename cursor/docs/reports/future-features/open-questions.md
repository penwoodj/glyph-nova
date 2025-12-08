# Design Decisions

**Related:** [index](./index.md) | [implementation-roadmap](./implementation-roadmap.md) | [agentic-mode-system](./agentic-mode-system.md) | [context-engineering](./context-engineering.md) | [self-improvement-system](./self-improvement-system.md) | [multi-machine-swarm](./multi-machine-swarm.md)

---

## Documented Design Decisions

This section documents key design decisions that have been made based on user requirements and vision alignment.

### 1. Multi-Machine Architecture

**Decision:** Multi-machine swarm is integrated into Phase 3/4 combined phase. Architecture is strictly local/self-hosted with no cloud servers or third-party LLM APIs. Network topology starts with star topology (one coordinator, multiple workers) and evolves to mesh topology (peer-to-peer) as hardware expands.

**Rationale:** Ensures complete data privacy and user control while providing scalability through distributed local infrastructure.

**Related:** [multi-machine-swarm](./multi-machine-swarm.md)

---

### 2. Mode System Implementation

**Decision:** Modes use composition via n8n-style agent workflow config files that preprocess `.md` workflow files to parse inheritance. Mode selection is a config file workflow accessible and configurable at every level. Community mode sharing will be available through GitHub/NPM marketplace (Phase 6/7).

**Rationale:** Provides maximum flexibility and transparency while enabling community contributions similar to n8n workflows and Hugging Face models.

**Related:** [agentic-mode-system](./agentic-mode-system.md)

---

### 3. Context Engineering Philosophy

**Decision:** Quality output is measurably more important than speed. Responses taking 2-10 minutes are acceptable if output quality is high and minimal back-and-forth is needed. Context engineering is controlled by agentic self-improving workflow system with good defaults and full transparency.

**Rationale:** Prioritizes user satisfaction and correct outcomes over raw speed, while maintaining configurability through workflows.

**Related:** [context-engineering](./context-engineering.md) | [multi-source-integration](./multi-source-integration.md)

---

### 4. Self-Improvement Approach

**Decision:** Self-improvement uses scoped summary workflows (both `.md` and n8n-style) to analyze logs based on specific scopes. Each workflow specifies approval requirements. Default: improvements visible but don't override in-use files until user approves. Conflicting patterns are logged for later user review via conflict doc `.md` files that can be chatted with to create resolutions.

**Rationale:** Balances automation with user control, ensuring improvements align with user goals while maintaining transparency.

**Related:** [self-improvement-system](./self-improvement-system.md) | [agentic-mode-system](./agentic-mode-system.md)

---

### 5. Editor Philosophy & Audience

**Decision:** Primary audience is context engineers trying to get quality output from local LLMs through easy-to-edit fully transparent simple local agentic workflows. The project serves as a PKM and tool builder for managing life notes to direct research and activity to building ideas. VSCode compatibility is desired eventually but not required initially. Themes based on VSCode styles are fine. Extensions initially supplemented through agentic n8n-style workflows, eventually full compatibility.

**Rationale:** Focuses on the core use case of context engineering while maintaining flexibility for future expansion.

**Related:** [editor-experience](./editor-experience.md) | [vscode-integration](./vscode-integration.md)

---

**See also:** [implementation-roadmap](./implementation-roadmap.md) for phased planning, [technical-architecture](./technical-architecture.md) for technical considerations
