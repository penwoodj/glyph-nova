# Technical Architecture

**Related:** [[index]] | [[implementation-roadmap]] | [[multi-machine-swarm]] | [[context-engineering]] | [[multi-source-integration]]

---

## Technology Stack

### Frontend

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

### Backend

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

### Infrastructure

```
Desktop App:
├─ Tauri (Rust + Web)
└─ Native file system access

Swarm:
├─ gRPC (inter-machine RPC)
├─ Redis (task queue, pub/sub)
└─ Docker (containerized agents)
```

---

## Data Flow

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

**See also:** [[implementation-roadmap]] for phased development, [[multi-machine-swarm]] for swarm architecture, [[context-engineering]] for context processing
