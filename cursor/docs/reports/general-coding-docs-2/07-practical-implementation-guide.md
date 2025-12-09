# Practical Implementation Guide

## Overview

This guide provides a step-by-step implementation plan for integrating Ollama CLI command execution into your RedwoodJS/Tauri application. It synthesizes concepts from all previous documents into a practical, actionable workflow.

## Document Navigation

**Prerequisites - Read These First:**
- **[Tauri Command Execution Fundamentals](./01-tauri-command-execution-fundamentals.md)** - Understanding Tauri command architecture
- **[GraphQL-Tauri Integration](./03-graphql-tauri-integration.md)** - Understanding the recommended direct Node.js approach
- **[Ollama CLI Command Reference](./04-ollama-cli-command-reference.md)** - Understanding Ollama commands you'll execute

**Reference During Implementation:**
- **[Rust Process Execution Patterns](./02-rust-process-execution-patterns.md)** - If implementing Rust-based commands
- **[Security and Permissions](./05-security-permissions-command-execution.md)** - Security practices to follow
- **[Error Handling and Debugging](./06-error-handling-debugging.md)** - Error handling patterns and troubleshooting

## Implementation Roadmap

### Phase 1: Setup and Configuration (30 minutes)

#### Step 1.1: Update Tauri Permissions

**File**: `src-tauri/capabilities/default.json`

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "enables the default permissions for LLM UI desktop app",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:allow-close",
    "core:window:allow-hide",
    "core:window:allow-show",
    "core:window:allow-set-focus",
    "core:window:allow-set-always-on-top",
    "core:window:allow-unmaximize",
    "core:window:allow-minimize",
    "core:window:allow-maximize",
    "core:window:allow-start-dragging",
    "log:default",
    "shell:allow-execute"
  ]
}
```

**Verification**:
```bash
cd src-tauri
cargo check
```

#### Step 1.2: Verify Ollama Installation

```bash
# Check if ollama is in PATH
which ollama

# Check ollama version
ollama --version

# Test basic command
ollama list
```

**Expected Output**: List of installed models or empty list if no models installed.

### Phase 2: Create Ollama CLI Service (45 minutes)

#### Step 2.1: Create Service File

**File**: `api/src/services/ollama/ollama-cli.ts`

```typescript
import { execFile, spawn } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// Allowed commands whitelist
const ALLOWED_COMMANDS = ['list', 'show', 'generate', 'pull', 'ps', 'stop', 'rm'] as const;
type AllowedCommand = typeof ALLOWED_COMMANDS[number];

export interface OllamaModel {
  name: string;
  id: string;
  size: string;
  modified: string;
}

export interface OllamaCommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface OllamaError {
  type: 'model_not_found' | 'connection_error' | 'invalid_command' |
        'pull_failed' | 'generation_error' | 'unknown';
  message: string;
  originalError: string;
  model?: string;
  suggestion?: string;
}

export class OllamaCLIService {
  /**
   * Validate command and arguments
   */
  private validateCommand(command: string, args: string[]): void {
    if (!ALLOWED_COMMANDS.includes(command as AllowedCommand)) {
      throw new Error(`Command '${command}' is not allowed`);
    }

    // Validate model names
    for (const arg of args) {
      if (!/^[a-zA-Z0-9][a-zA-Z0-9:_-]*[a-zA-Z0-9]$/.test(arg)) {
        throw new Error(`Invalid argument: ${arg}`);
      }
    }
  }

  /**
   * Parse ollama list output
   */
  private parseListOutput(output: string): OllamaModel[] {
    const lines = output.trim().split('\n');
    if (lines.length < 2) return [];

    const models: OllamaModel[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(/\s+/);
      if (parts.length >= 4) {
        models.push({
          name: parts[0],
          id: parts[1],
          size: parts[2],
          modified: parts.slice(3).join(' ')
        });
      }
    }
    return models;
  }

  /**
   * Parse Ollama error output
   */
  private parseError(stderr: string, command: string, args: string[]): OllamaError {
    const error: OllamaError = {
      type: 'unknown',
      message: stderr.trim(),
      originalError: stderr,
    };

    if (stderr.includes('not found')) {
      error.type = 'model_not_found';
      const match = stderr.match(/model ['"]([^'"]+)['"] not found/i);
      if (match) {
        error.model = match[1];
        error.message = `Model '${error.model}' not found. Try pulling it first.`;
        error.suggestion = `Run: ollama pull ${error.model}`;
      }
    } else if (stderr.includes('connection refused') || stderr.includes('dial tcp')) {
      error.type = 'connection_error';
      error.message = 'Cannot connect to Ollama server. Is Ollama running?';
      error.suggestion = 'Start Ollama service: ollama serve';
    } else if (stderr.includes('unknown command')) {
      error.type = 'invalid_command';
      error.message = `Unknown command: ${command}`;
    } else if (command === 'pull' && stderr.includes('error')) {
      error.type = 'pull_failed';
      error.message = `Failed to pull model: ${args[0] || 'unknown'}`;
      error.model = args[0];
    }

    return error;
  }

  /**
   * Execute Ollama command
   */
  async executeCommand(
    command: string,
    args: string[] = [],
    timeoutMs: number = 30000
  ): Promise<OllamaCommandResult> {
    this.validateCommand(command, args);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const { stdout, stderr } = await execFileAsync(
          'ollama',
          [command, ...args],
          {
            signal: controller.signal,
            timeout: timeoutMs,
            maxBuffer: 1024 * 1024, // 1MB
            env: {
              PATH: process.env.PATH || '',
              HOME: process.env.HOME || '',
            }
          }
        );

        clearTimeout(timeoutId);

        return {
          success: true,
          stdout: stdout.toString().trim(),
          stderr: stderr.toString().trim(),
          exitCode: 0
        };
      } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.code === 'ENOENT') {
          throw new Error('Ollama is not installed or not in PATH');
        }

        if (error.signal === 'SIGTERM' || error.name === 'AbortError') {
          throw new Error(`Command timeout after ${timeoutMs}ms`);
        }

        return {
          success: false,
          stdout: error.stdout?.toString() || '',
          stderr: error.stderr?.toString() || error.message,
          exitCode: error.code || 1
        };
      }
    } catch (error: any) {
      throw new Error(`Failed to execute command: ${error.message}`);
    }
  }

  /**
   * List all available models
   */
  async listModels(): Promise<OllamaModel[]> {
    const result = await this.executeCommand('list');

    if (!result.success) {
      const parsedError = this.parseError(result.stderr, 'list', []);
      throw new Error(parsedError.message);
    }

    return this.parseListOutput(result.stdout);
  }

  /**
   * Pull a model with streaming progress
   */
  async* pullModel(model: string): AsyncGenerator<string, void, unknown> {
    this.validateCommand('pull', [model]);

    return new Promise<void>((resolve, reject) => {
      const process = spawn('ollama', ['pull', model], {
        env: {
          PATH: process.env.PATH || '',
          HOME: process.env.HOME || '',
        }
      });

      process.stdout.on('data', (chunk: Buffer) => {
        yield chunk.toString();
      });

      process.stderr.on('data', (chunk: Buffer) => {
        const error = chunk.toString();
        if (error.includes('error') || error.includes('failed')) {
          reject(new Error(`Pull failed: ${error}`));
        }
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Pull process exited with code ${code}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`Failed to spawn pull process: ${error.message}`));
      });
    });
  }

  /**
   * Show model details
   */
  async showModel(model: string): Promise<string> {
    const result = await this.executeCommand('show', [model]);

    if (!result.success) {
      const parsedError = this.parseError(result.stderr, 'show', [model]);
      throw new Error(parsedError.message);
    }

    return result.stdout;
  }
}

// Export singleton instance
export const ollamaCLI = new OllamaCLIService();
```

#### Step 2.2: Create Tests

**File**: `api/src/services/ollama/ollama-cli.test.ts`

```typescript
import { ollamaCLI } from './ollama-cli'

describe('OllamaCLIService', () => {
  describe('listModels', () => {
    it('should list available models', async () => {
      const models = await ollamaCLI.listModels()
      expect(Array.isArray(models)).toBe(true)
      // Models may be empty if none installed
    })
  })

  describe('executeCommand', () => {
    it('should reject invalid commands', async () => {
      await expect(
        ollamaCLI.executeCommand('invalid-command', [])
      ).rejects.toThrow('not allowed')
    })

    it('should reject invalid model names', async () => {
      await expect(
        ollamaCLI.executeCommand('show', ['invalid;model;name'])
      ).rejects.toThrow('Invalid argument')
    })
  })
})
```

**Run Tests**:
```bash
yarn rw test api/src/services/ollama/ollama-cli.test.ts
```

### Phase 3: Create GraphQL Schema and Resolvers (30 minutes)

#### Step 3.1: Create GraphQL Schema

**File**: `api/src/graphql/ollama-cli.sdl.ts`

```typescript
export const schema = gql`
  type OllamaModel {
    name: String!
    id: String!
    size: String!
    modified: String!
  }

  type OllamaCommandResult {
    success: Boolean!
    stdout: String!
    stderr: String!
    exitCode: Int!
  }

  type Query {
    ollamaModelsCLI: [OllamaModel!]!
    ollamaModelDetails(model: String!): String!
  }

  type Mutation {
    ollamaPullModel(model: String!): String!
  }
`
```

#### Step 3.2: Create GraphQL Resolvers

**File**: `api/src/graphql/ollama-cli.ts`

```typescript
import { QueryResolvers, MutationResolvers } from './types'
import { ollamaCLI } from 'src/services/ollama/ollama-cli'

export const Query: QueryResolvers = {
  ollamaModelsCLI: async () => {
    try {
      return await ollamaCLI.listModels()
    } catch (error: any) {
      throw new Error(`Failed to list models: ${error.message}`)
    }
  },

  ollamaModelDetails: async (_parent, { model }) => {
    try {
      return await ollamaCLI.showModel(model)
    } catch (error: any) {
      throw new Error(`Failed to show model details: ${error.message}`)
    }
  },
}

export const Mutation: MutationResolvers = {
  ollamaPullModel: async (_parent, { model }) => {
    try {
      const chunks: string[] = []

      for await (const chunk of ollamaCLI.pullModel(model)) {
        chunks.push(chunk)
        // In a real implementation, you might want to emit events
        // or stream this to the client
      }

      return chunks.join('')
    } catch (error: any) {
      throw new Error(`Failed to pull model: ${error.message}`)
    }
  },
}
```

#### Step 3.3: Verify GraphQL Schema

```bash
# Check for schema errors
yarn rw type-check

# Test GraphQL endpoint (after starting dev server)
# Open http://localhost:8911/graphql
```

**Test Query**:
```graphql
query {
  ollamaModelsCLI {
    name
    id
    size
    modified
  }
}
```

### Phase 4: Integration Testing (30 minutes)

#### Step 4.1: Manual Testing Checklist

- [ ] **Ollama Installation Check**
  ```bash
  which ollama
  ollama list
  ```

- [ ] **Service Layer Test**
  ```bash
  yarn rw test api/src/services/ollama/ollama-cli.test.ts
  ```

- [ ] **GraphQL Query Test**
  - Start dev server: `yarn rw dev`
  - Open GraphQL playground: http://localhost:8911/graphql
  - Execute query:
    ```graphql
    query {
      ollamaModelsCLI {
        name
        size
      }
    }
    ```

- [ ] **Error Handling Test**
  - Try querying with invalid model name
  - Verify error message is user-friendly

- [ ] **Model Pull Test** (if you want to test pulling)
  ```graphql
  mutation {
    ollamaPullModel(model: "llama2:7b")
  }
  ```

#### Step 4.2: Build Verification

```bash
# Build the application
yarn rw build

# Verify no TypeScript errors
yarn rw type-check

# Check for linter errors
yarn rw lint
```

### Phase 5: Frontend Integration (Optional, 45 minutes)

#### Step 5.1: Create React Hook

**File**: `web/src/hooks/useOllamaCLI.ts`

```typescript
import { useQuery, useMutation } from '@redwoodjs/web'

export const OLLAMA_MODELS_CLI_QUERY = gql`
  query OllamaModelsCLI {
    ollamaModelsCLI {
      name
      id
      size
      modified
    }
  }
`

export const OLLAMA_PULL_MODEL_MUTATION = gql`
  mutation OllamaPullModel($model: String!) {
    ollamaPullModel(model: $model)
  }
`

export const useOllamaModelsCLI = () => {
  const { data, loading, error, refetch } = useQuery(OLLAMA_MODELS_CLI_QUERY)

  return {
    models: data?.ollamaModelsCLI || [],
    loading,
    error,
    refetch,
  }
}

export const useOllamaPullModel = () => {
  const [pullModel, { loading, error }] = useMutation(OLLAMA_PULL_MODEL_MUTATION)

  return {
    pullModel: (model: string) => pullModel({ variables: { model } }),
    loading,
    error,
  }
}
```

#### Step 5.2: Create Component

**File**: `web/src/components/OllamaModelsList/OllamaModelsList.tsx`

```typescript
import { useOllamaModelsCLI, useOllamaPullModel } from 'src/hooks/useOllamaCLI'

const OllamaModelsList = () => {
  const { models, loading, error, refetch } = useOllamaModelsCLI()
  const { pullModel, loading: pulling } = useOllamaPullModel()

  const handlePull = async (modelName: string) => {
    try {
      await pullModel(modelName)
      await refetch()
    } catch (error) {
      console.error('Failed to pull model:', error)
    }
  }

  if (loading) return <div>Loading models...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h2>Ollama Models (CLI)</h2>
      <ul>
        {models.map((model) => (
          <li key={model.id}>
            <strong>{model.name}</strong> - {model.size} - {model.modified}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default OllamaModelsList
```

## Troubleshooting Common Issues

### Issue 1: "Command not found: ollama"

**Symptoms**: Error when executing any Ollama command.

**Solutions**:
1. Verify Ollama is installed: `which ollama`
2. Check PATH environment variable includes Ollama location
3. For Tauri apps, ensure PATH is passed correctly in command execution

**Debug**:
```typescript
console.log('PATH:', process.env.PATH)
console.log('Ollama path:', await execFileAsync('which', ['ollama']))
```

### Issue 2: "Permission denied"

**Symptoms**: Commands fail with permission errors.

**Solutions**:
1. Check Tauri capabilities include `shell:allow-execute`
2. Verify file permissions on Ollama binary
3. Check user has execute permissions

**Debug**:
```bash
ls -la $(which ollama)
```

### Issue 3: "Connection refused"

**Symptoms**: Commands that require Ollama server fail.

**Solutions**:
1. Start Ollama server: `ollama serve` (or ensure it's running as a service)
2. Check if server is running: `curl http://localhost:11434/api/tags`
3. Verify OLLAMA_HOST environment variable if using custom host

**Debug**:
```typescript
try {
  const response = await fetch('http://localhost:11434/api/tags')
  console.log('Ollama server status:', response.status)
} catch (error) {
  console.error('Cannot connect to Ollama server:', error)
}
```

### Issue 4: GraphQL Query Returns Empty Array

**Symptoms**: `ollamaModelsCLI` returns `[]` even when models exist.

**Solutions**:
1. Verify `ollama list` works in terminal
2. Check output parsing logic handles your Ollama version's format
3. Add debug logging to see raw output

**Debug**:
```typescript
const result = await ollamaCLI.executeCommand('list', [])
console.log('Raw output:', result.stdout)
console.log('Parsed models:', ollamaCLI.parseListOutput(result.stdout))
```

### Issue 5: Timeout Errors

**Symptoms**: Commands timeout before completing.

**Solutions**:
1. Increase timeout for long-running commands (e.g., `pull`)
2. Use streaming for pull operations instead of waiting for completion
3. Check system resources (CPU, memory, disk)

**Debug**:
```typescript
// Increase timeout for pull
await ollamaCLI.executeCommand('pull', ['llama2:7b'], 300000) // 5 minutes
```

## Performance Optimization

### 1. Cache Model Lists

```typescript
class CachedOllamaCLIService extends OllamaCLIService {
  private modelCache: { models: OllamaModel[]; timestamp: number } | null = null
  private readonly CACHE_TTL = 60000 // 1 minute

  async listModels(): Promise<OllamaModel[]> {
    const now = Date.now()

    if (this.modelCache && (now - this.modelCache.timestamp) < this.CACHE_TTL) {
      return this.modelCache.models
    }

    const models = await super.listModels()
    this.modelCache = { models, timestamp: now }
    return models
  }

  invalidateCache() {
    this.modelCache = null
  }
}
```

### 2. Parallel Command Execution

```typescript
async function getMultipleModelDetails(models: string[]): Promise<Map<string, string>> {
  const results = await Promise.all(
    models.map(async (model) => {
      try {
        const details = await ollamaCLI.showModel(model)
        return [model, details] as [string, string]
      } catch (error) {
        return [model, `Error: ${error}`] as [string, string]
      }
    })
  )

  return new Map(results)
}
```

## Next Steps

1. **Add Streaming Support**: Implement GraphQL subscriptions for real-time pull progress
2. **Add Error Recovery**: Implement retry logic for transient failures
3. **Add Monitoring**: Log all command executions for debugging
4. **Add Rate Limiting**: Prevent command execution abuse
5. **Add User Feedback**: Show progress indicators for long-running operations
6. **Add Model Management UI**: Create UI for pulling, removing, and managing models

## Verification Checklist

Before considering implementation complete:

- [ ] Tauri permissions updated and verified
- [ ] Ollama CLI service created and tested
- [ ] GraphQL schema and resolvers working
- [ ] Manual testing completed successfully
- [ ] Build verification passed
- [ ] Error handling tested
- [ ] TypeScript types correct
- [ ] No linter errors
- [ ] Documentation updated

## Related Documents

This implementation guide synthesizes concepts from all other documents:

1. **[Tauri Command Execution Fundamentals](./01-tauri-command-execution-fundamentals.md)** - Core Tauri command patterns (Phase 1: Permissions)
2. **[Rust Process Execution Patterns](./02-rust-process-execution-patterns.md)** - Rust implementation patterns (if using Rust approach)
3. **[GraphQL-Tauri Integration](./03-graphql-tauri-integration.md)** - GraphQL integration patterns (Phase 3: GraphQL Schema)
4. **[Ollama CLI Command Reference](./04-ollama-cli-command-reference.md)** - Ollama command reference (Phase 2: Service Implementation)
5. **[Security and Permissions](./05-security-permissions-command-execution.md)** - Security practices (applied throughout)
6. **[Error Handling and Debugging](./06-error-handling-debugging.md)** - Error handling (Phase 4: Testing and Troubleshooting)

**Document Reading Order:**
1. Start here (07) for the big picture
2. Read 01, 03, 04 for core concepts
3. Reference 02, 05, 06 as needed during implementation
