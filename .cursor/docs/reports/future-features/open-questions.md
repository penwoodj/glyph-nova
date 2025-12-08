# Open Questions & Considerations

**Related:** [[index]] | [[implementation-roadmap]] | [[agentic-mode-system]] | [[context-engineering]] | [[self-improvement-system]] | [[multi-machine-swarm]]

---

## Questions to Clarify Vision

### 1. Multi-Machine Priority

- Q: How important is swarm deployment in early phases?
- Q: Should we support cloud-hosted swarm nodes, or strictly local/self-hosted?
- Q: What's the network topology? (star, mesh, hierarchical?)

**Related:** [[multi-machine-swarm]]

---

### 2. Mode System Details

- Q: Should modes be Turing-complete (can they run code), or just declarative configs?
- Q: How should mode inheritance work? (extends, mixins, composition?)
- Q: Should there be a "mode marketplace" for sharing?

**Related:** [[agentic-mode-system]]

---

### 3. Context Engineering Trade-offs

- Q: What's more important: accuracy of context or speed of gathering?
- Q: Should RAG be mandatory or optional for each mode?
- Q: How much control should users have over chunking strategies?

**Related:** [[context-engineering]] | [[multi-source-integration]]

---

### 4. Self-Improvement Boundaries

- Q: Should AI be able to modify modes without approval?
- Q: What's the approval threshold? (single user, multiple sessions, confidence score?)
- Q: How to handle conflicting learned patterns?

**Related:** [[self-improvement-system]] | [[agentic-mode-system]]

---

### 5. Editor Philosophy

- Q: Primary audience: developers, researchers, or both?
- Q: Should it support non-code use cases (writing, note-taking)?
- Q: How much VSCode compatibility is required vs. nice-to-have?

**Related:** [[editor-experience]] | [[vscode-integration]]

---

**See also:** [[implementation-roadmap]] for phased planning, [[technical-architecture]] for technical considerations
