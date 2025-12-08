# Multi-Machine Swarm

**Related:** [index](./index.md) | [technical-architecture](./technical-architecture.md) | [context-engineering](./context-engineering.md)

---

## Architecture

**Goal:** Distribute AI work across multiple machines.

**Strictly Local/Self-Hosted:** Strictly local/self-hosted machines. No cloud servers or third-party LLM APIs. No connection to server LLMs ever. No cloud-hosted nodes. No AWS/GCP. No third-party server LLMs. Everything runs on infrastructure you own and control.

**Network Topology:** Start with star topology (one coordinator, multiple workers), evolve to mesh topology (peer-to-peer) over time as hardware expands.

```
┌──────────────────────────────────────────────────┐
│  Developer Machine (Primary)                     │
│  ├─ Editor UI                                    │
│  ├─ Fast agents (chat, autocomplete)             │
│  └─ Swarm orchestrator                           │
└──────────────────────────────────────────────────┘
          ↓ (gRPC / WebSocket)
┌──────────────────────────────────────────────────┐
│  Local Server 1: Code Analysis                   │
│  ├─ Slow LLM (70B+ models)                       │
│  ├─ Background refactoring                       │
│  └─ Deep code analysis                           │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│  Local Server 2: Research & RAG                  │
│  ├─ Vector database (Qdrant/Chroma)              │
│  ├─ Document indexing                            │
│  └─ Research agent                               │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│  Local Server 3: Testing & Validation            │
│  ├─ Test runner                                  │
│  ├─ Build verification                           │
│  └─ Quality analysis                             │
└──────────────────────────────────────────────────┘
```

---

## Task Distribution

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

---

## Communication Protocol

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

---

## Failover & Load Balancing

**Resilience:**

```
Primary strategy: Route to least-loaded machine
Fallback 1: Use slower local model if remote unavailable
Fallback 2: Queue task for later if all servers busy
Fallback 3: Notify user and ask to wait or use fast model
```

---

**See also:** [technical-architecture](./technical-architecture.md) for infrastructure details, [context-engineering](./context-engineering.md) for context distribution
