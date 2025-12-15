---
name: n8n Integration Implementation Plan
overview: Integrate n8n workflow platform into GlyphNova application, providing workflow management UI, workflow execution, and integration with chat and agentic workflows
todos: []
---

# n8n Integration Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Integrate n8n workflow platform into GlyphNova application, providing UI for managing workflows, executing workflows from the application, and integrating n8n workflows with chat and agentic workflow framework. This enables visual workflow composition, workflow execution, and integration with the agentic workflow system.

---

## Overview

This plan implements n8n integration that:
- Connects to n8n instance (local or remote) via API
- Provides workflow management UI in application
- Allows workflow execution from application
- Integrates workflows with chat system
- Supports workflow configuration and monitoring
- Enables workflow triggers from application events
- Provides workflow status and execution history

**Target**: Complete n8n integration for workflow management and execution
**Priority**: Medium (enables agentic workflows)
**Estimated Time**: 10-12 hours (with 20% buffer: 12-14.4 hours)
**Risk Level**: Medium-High (complex API integration, external dependency)

---

## Current State Analysis

### Existing Implementation
- **RAG n8n Workflow**: RAG-specific n8n workflow exists (separate from this)
- **No General Integration**: No general n8n integration in application
- **No Workflow UI**: No UI for managing n8n workflows
- **No API Connection**: No n8n API client in application
- **No Workflow Execution**: Cannot execute workflows from application

### Gaps Identified
- No n8n API client
- No workflow management UI
- No workflow execution from app
- No integration with chat/workflows
- No workflow monitoring

---

## External Documentation Links

### n8n API & Integration
1. **n8n API Reference**
   - Link: https://docs.n8n.io/api/
   - Description: n8n REST API documentation
   - Rating: High - Official n8n API documentation

2. **n8n Workflow API**
   - Link: https://docs.n8n.io/api/api-reference/#workflows
   - Description: n8n workflow management API
   - Rating: High - Official API reference

3. **n8n Execution API**
   - Link: https://docs.n8n.io/api/api-reference/#executions
   - Description: n8n workflow execution API
   - Rating: High - Official API reference

### n8n Authentication
4. **n8n Authentication**
   - Link: https://docs.n8n.io/hosting/authentication/
   - Description: n8n authentication methods
   - Rating: High - Official n8n documentation

5. **n8n API Keys**
   - Link: https://docs.n8n.io/hosting/authentication/api-keys/
   - Description: n8n API key authentication
   - Rating: High - Official n8n documentation

### n8n Workflow Management
6. **n8n Workflows**
   - Link: https://n8n.io/workflows/
   - Description: n8n workflow examples and patterns
   - Rating: Medium - n8n workflow examples

7. **n8n Webhooks**
   - Link: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
   - Description: n8n webhook triggers
   - Rating: High - Official n8n documentation

### HTTP Client Libraries
8. **Axios**
   - Link: https://axios-http.com/docs/intro
   - Description: HTTP client library
   - Rating: High - Popular HTTP client

9. **Fetch API**
   - Link: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
   - Description: Browser Fetch API
   - Rating: High - MDN documentation

### Error Handling
10. **n8n Error Handling**
    - Link: https://docs.n8n.io/workflows/errors/
    - Description: n8n error handling patterns
    - Rating: Medium - n8n documentation

---

## Implementation Phases

### Phase 1: n8n API Client (2.5-3 hours)

**Goal**: Create n8n API client for workflow management and execution.

#### 1.1 n8n Client Service
- [ ] Create `web/src/services/n8nClient.ts`:
  - [ ] `N8nClient` class
  - [ ] API authentication (API key)
  - [ ] Workflow management methods
  - [ ] Workflow execution methods
- [ ] Client structure:
  ```typescript
  class N8nClient {
    private apiUrl: string
    private apiKey: string

    constructor(apiUrl: string, apiKey: string) {
      this.apiUrl = apiUrl
      this.apiKey = apiKey
    }

    async getWorkflows(): Promise<Workflow[]>
    async getWorkflow(id: string): Promise<Workflow>
    async executeWorkflow(id: string, data: any): Promise<Execution>
    async getExecutionStatus(id: string): Promise<ExecutionStatus>
    async getExecutions(workflowId?: string): Promise<Execution[]>
  }
  ```

#### 1.2 API Methods
- [ ] Implement API methods:
  - [ ] `GET /api/v1/workflows` - List workflows
  - [ ] `GET /api/v1/workflows/:id` - Get workflow
  - [ ] `POST /api/v1/workflows/:id/execute` - Execute workflow
  - [ ] `GET /api/v1/executions/:id` - Get execution status
  - [ ] `GET /api/v1/executions` - List executions
- [ ] Authentication:
  - [ ] Use API key in headers
  - [ ] Handle authentication errors
  - [ ] Support different n8n instances

#### 1.3 GraphQL Integration
- [ ] Create GraphQL queries/mutations:
  - [ ] `n8nWorkflows: [Workflow!]!`
  - [ ] `n8nWorkflow(id: String!): Workflow`
  - [ ] `executeN8nWorkflow(id: String!, data: JSON): Execution`
  - [ ] `n8nExecutions(workflowId: String): [Execution!]!`
- [ ] Or use direct API calls from frontend:
  - [ ] Call n8n API directly from frontend
  - [ ] Handle CORS if needed
  - [ ] Proxy through backend if CORS issues

**Success Criteria**:
- [ ] n8n API client created
- [ ] Authentication works
- [ ] Workflow methods implemented
- [ ] Execution methods implemented

---

### Phase 2: n8n Configuration & Settings (1.5-2 hours)

**Goal**: Add n8n configuration to settings.

#### 2.1 Settings Structure
- [ ] Add n8n settings to settings store:
  - [ ] `n8n.enabled: boolean`
  - [ ] `n8n.apiUrl: string`
  - [ ] `n8n.apiKey: string`
  - [ ] `n8n.workflowId: string | null` (default workflow)
- [ ] Settings interface:
  ```typescript
  interface N8nSettings {
    enabled: boolean
    apiUrl: string
    apiKey: string
    defaultWorkflowId?: string
  }
  ```

#### 2.2 Settings Page UI
- [ ] Add to settings page:
  - [ ] "n8n Integration" section
  - [ ] Toggle for "Enable n8n"
  - [ ] Input for API URL
  - [ ] Input for API Key (password field)
  - [ ] Dropdown for default workflow
  - [ ] Test connection button
- [ ] Settings UI:
  - [ ] Clear labels and descriptions
  - [ ] Connection test feedback
  - [ ] Workflow selection

#### 2.3 Connection Testing
- [ ] Implement connection test:
  - [ ] Test API connection
  - [ ] Verify API key
  - [ ] List available workflows
  - [ ] Show connection status
- [ ] Test logic:
  - [ ] Call n8n API health endpoint
  - [ ] Or call workflows endpoint
  - [ ] Display success/error
  - [ ] Update connection status

**Success Criteria**:
- [ ] n8n settings in settings store
- [ ] Settings page UI complete
- [ ] Connection testing works
- [ ] Settings persist correctly

---

### Phase 3: Workflow Management UI (2.5-3 hours)

**Goal**: Create UI for managing and viewing n8n workflows.

#### 3.1 Workflow List Component
- [ ] Create `N8nWorkflowList.tsx`:
  - [ ] Display list of workflows
  - [ ] Show workflow name, status, last execution
  - [ ] Allow selecting workflow
  - [ ] Allow executing workflow
- [ ] Workflow list features:
  - [ ] Fetch workflows from n8n
  - [ ] Display workflow metadata
  - [ ] Show active/inactive status
  - [ ] Sort and filter workflows

#### 3.2 Workflow Details Component
- [ ] Create `N8nWorkflowDetails.tsx`:
  - [ ] Display workflow details
  - [ ] Show workflow nodes and connections
  - [ ] Display execution history
  - [ ] Allow manual execution
- [ ] Details features:
  - [ ] Workflow JSON view (read-only)
  - [ ] Execution history list
  - [ ] Execution status and results
  - [ ] Manual trigger button

#### 3.3 Workflow Execution UI
- [ ] Create workflow execution interface:
  - [ ] Input form for workflow data
  - [ ] Execute button
  - [ ] Execution status display
  - [ ] Results display
- [ ] Execution features:
  - [ ] Input data (JSON or form)
  - [ ] Execute workflow
  - [ ] Monitor execution status
  - [ ] Display results

**Success Criteria**:
- [ ] Workflow list displays correctly
- [ ] Workflow details show correctly
- [ ] Workflow execution works
- [ ] UI intuitive and functional

---

### Phase 4: Chat Integration (2-2.5 hours)

**Goal**: Integrate n8n workflows with chat system.

#### 4.1 Workflow Trigger from Chat
- [ ] Add workflow execution to chat:
  - [ ] Detect workflow triggers in chat
  - [ ] Execute workflows based on chat context
  - [ ] Return workflow results to chat
- [ ] Integration points:
  - [ ] Chat message analysis
  - [ ] Workflow selection logic
  - [ ] Workflow execution
  - [ ] Result formatting for chat

#### 4.2 Workflow Chat Commands
- [ ] Add chat commands:
  - [ ] `@workflow <name>` - Execute workflow
  - [ ] `@workflows` - List available workflows
  - [ ] `@workflow-status <id>` - Check execution status
- [ ] Command handling:
  - [ ] Parse chat commands
  - [ ] Execute appropriate action
  - [ ] Format response for chat

#### 4.3 Workflow Results in Chat
- [ ] Display workflow results:
  - [ ] Format results as chat message
  - [ ] Show execution status
  - [ ] Display errors if any
- [ ] Result formatting:
  - [ ] Markdown formatting
  - [ ] Code blocks for JSON
  - [ ] Clear status messages

**Success Criteria**:
- [ ] Workflows trigger from chat
- [ ] Chat commands work
- [ ] Results display in chat
- [ ] Integration seamless

---

### Phase 5: Workflow Monitoring & History (1.5-2 hours)

**Goal**: Add workflow monitoring and execution history.

#### 5.1 Execution History
- [ ] Create execution history view:
  - [ ] List recent executions
  - [ ] Filter by workflow
  - [ ] Show execution status
  - [ ] Display execution results
- [ ] History features:
  - [ ] Fetch executions from n8n
  - [ ] Display in table/list
  - [ ] Filter and search
  - [ ] View execution details

#### 5.2 Workflow Monitoring
- [ ] Add monitoring:
  - [ ] Real-time execution status
  - [ ] Execution progress
  - [ ] Error notifications
  - [ ] Success notifications
- [ ] Monitoring features:
  - [ ] Poll execution status
  - [ ] Update UI in real-time
  - [ ] Show notifications
  - [ ] Handle errors gracefully

#### 5.3 Integration Testing
- [ ] Test complete integration:
  - [ ] Workflow execution from UI
  - [ ] Workflow execution from chat
  - [ ] Execution monitoring
  - [ ] Error handling
- [ ] Test scenarios:
  - [ ] Successful execution
  - [ ] Failed execution
  - [ ] Long-running workflow
  - [ ] Multiple concurrent executions

**Success Criteria**:
- [ ] Execution history displays
- [ ] Monitoring works correctly
- [ ] Integration tested
- [ ] Error handling works

---

## Dependencies

### Internal Dependencies
- **Settings System**: Settings page and settings store (from settings plans)
- **Chat Interface**: Existing chat system
- **GraphQL API**: For n8n API calls (if using GraphQL)

### External Dependencies
- **n8n Instance**: Running n8n instance (local or remote)
- **n8n API**: n8n REST API access
- **HTTP Client**: Axios or Fetch API

---

## Risk Assessment

### High Risk
- **External Dependency**: Requires n8n instance running
  - **Mitigation**: Clear setup instructions, connection testing, graceful degradation
- **API Integration Complexity**: n8n API integration might be complex
  - **Mitigation**: Use official n8n API docs, test thoroughly, handle errors

### Medium Risk
- **CORS Issues**: n8n API might have CORS restrictions
  - **Mitigation**: Proxy through backend, or configure n8n CORS
- **Workflow Execution**: Long-running workflows might timeout
  - **Mitigation**: Async execution, polling, timeout handling

### Low Risk
- **UI Components**: Standard React components
- **Settings Integration**: Standard settings patterns

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Feature flag**: Disable n8n integration, remove UI
- **Settings removal**: Remove n8n settings, keep code for future

### Phase-Specific Rollback
- **Phase 1**: Remove API client, keep structure
- **Phase 2**: Remove settings integration, keep API client
- **Phase 3**: Remove workflow UI, keep API client
- **Phase 4**: Remove chat integration, keep workflow UI
- **Phase 5**: Remove monitoring, keep basic execution

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore previous state
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (API Client)
- [ ] n8n API client created
- [ ] Authentication works
- [ ] API methods implemented
- [ ] Error handling works

### After Phase 2 (Configuration)
- [ ] Settings structure created
- [ ] Settings page UI complete
- [ ] Connection testing works
- [ ] Settings persist

### After Phase 3 (Workflow UI)
- [ ] Workflow list displays
- [ ] Workflow details show
- [ ] Workflow execution works
- [ ] UI functional

### After Phase 4 (Chat Integration)
- [ ] Workflows trigger from chat
- [ ] Chat commands work
- [ ] Results display correctly
- [ ] Integration seamless

### After Phase 5 (Monitoring)
- [ ] Execution history displays
- [ ] Monitoring works
- [ ] Integration tested
- [ ] Error handling works

---

## Success Criteria

1. **n8n API Client**: Client connects to n8n instance
2. **Workflow Management**: Workflows can be listed and viewed
3. **Workflow Execution**: Workflows can be executed from app
4. **Settings Integration**: n8n settings in settings page
5. **Connection Testing**: Connection can be tested
6. **Chat Integration**: Workflows can be triggered from chat
7. **Execution Monitoring**: Execution status can be monitored
8. **Execution History**: Execution history can be viewed
9. **Error Handling**: Errors handled gracefully
10. **User Experience**: UI intuitive and responsive
11. **Documentation**: Integration documented
12. **No Regressions**: Existing functionality unchanged
13. **Performance**: API calls don't impact performance
14. **Security**: API keys stored securely
15. **Integration**: Works seamlessly with existing features

---

## Code Examples

### Example: n8n API Client
```typescript
// web/src/services/n8nClient.ts
interface Workflow {
  id: string
  name: string
  active: boolean
  nodes: any[]
  connections: any[]
  createdAt: string
  updatedAt: string
}

interface Execution {
  id: string
  workflowId: string
  finished: boolean
  mode: string
  retryOf: string | null
  retrySuccessId: string | null
  startedAt: string
  stoppedAt: string | null
  workflowData: any
  data: any
}

interface ExecutionStatus {
  id: string
  finished: boolean
  mode: string
  startedAt: string
  stoppedAt: string | null
}

export class N8nClient {
  private apiUrl: string
  private apiKey: string

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl.replace(/\/$/, '') // Remove trailing slash
    this.apiKey = apiKey
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.apiUrl}/api/v1${endpoint}`
    const headers: HeadersInit = {
      'X-N8N-API-KEY': this.apiKey,
      'Content-Type': 'application/json',
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`n8n API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getWorkflows(): Promise<Workflow[]> {
    return this.request<Workflow[]>('GET', '/workflows')
  }

  async getWorkflow(id: string): Promise<Workflow> {
    return this.request<Workflow>('GET', `/workflows/${id}`)
  }

  async executeWorkflow(
    id: string,
    data: any = {}
  ): Promise<Execution> {
    return this.request<Execution>('POST', `/workflows/${id}/execute`, {
      data,
    })
  }

  async getExecutionStatus(id: string): Promise<ExecutionStatus> {
    const execution = await this.request<Execution>('GET', `/executions/${id}`)
    return {
      id: execution.id,
      finished: execution.finished,
      mode: execution.mode,
      startedAt: execution.startedAt,
      stoppedAt: execution.stoppedAt,
    }
  }

  async getExecutions(workflowId?: string): Promise<Execution[]> {
    const endpoint = workflowId
      ? `/executions?workflowId=${workflowId}`
      : '/executions'
    return this.request<Execution[]>('GET', endpoint)
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getWorkflows()
      return true
    } catch {
      return false
    }
  }
}
```

### Example: Settings Integration
```tsx
// web/src/pages/SettingsPage/N8nSettings.tsx
import { useAppStore } from 'src/state/store'
import { N8nClient } from 'src/services/n8nClient'
import { useState } from 'react'

export const N8nSettings = () => {
  const n8nSettings = useAppStore((state) => state.userSettings.n8n)
  const updateUserSetting = useAppStore((state) => state.updateUserSetting)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const handleTestConnection = async () => {
    if (!n8nSettings.apiUrl || !n8nSettings.apiKey) {
      setTestResult('Please provide API URL and API Key')
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      const client = new N8nClient(n8nSettings.apiUrl, n8nSettings.apiKey)
      const connected = await client.testConnection()

      if (connected) {
        setTestResult('✅ Connection successful')
      } else {
        setTestResult('❌ Connection failed')
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="settings-category">
      <h2 className="mb-4 text-lg font-semibold text-vscode-fg">n8n Integration</h2>

      <div className="space-y-4">
        <ToggleSetting
          label="Enable n8n"
          description="Enable n8n workflow integration"
          value={n8nSettings.enabled}
          onChange={(value) => updateUserSetting('n8n', 'enabled', value)}
        />

        {n8nSettings.enabled && (
          <>
            <TextSetting
              label="n8n API URL"
              description="URL of your n8n instance (e.g., http://localhost:5678)"
              value={n8nSettings.apiUrl || ''}
              onChange={(value) => updateUserSetting('n8n', 'apiUrl', value)}
            />

            <TextSetting
              label="n8n API Key"
              description="API key for n8n authentication"
              value={n8nSettings.apiKey || ''}
              onChange={(value) => updateUserSetting('n8n', 'apiKey', value)}
              type="password"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2 rounded bg-vscode-button-bg text-vscode-button-fg hover:bg-vscode-button-hover-bg"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              {testResult && (
                <span className="text-sm text-vscode-fg-secondary">{testResult}</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

### Example: Workflow List Component
```tsx
// web/src/components/N8n/WorkflowList.tsx
import { useState, useEffect } from 'react'
import { N8nClient } from 'src/services/n8nClient'
import { useAppStore } from 'src/state/store'
import type { Workflow } from 'src/services/n8nClient'

export const WorkflowList = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const n8nSettings = useAppStore((state) => state.userSettings.n8n)

  useEffect(() => {
    const loadWorkflows = async () => {
      if (!n8nSettings.enabled || !n8nSettings.apiUrl || !n8nSettings.apiKey) {
        setWorkflows([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const client = new N8nClient(n8nSettings.apiUrl, n8nSettings.apiKey)
        const workflowList = await client.getWorkflows()
        setWorkflows(workflowList)
      } catch (error) {
        console.error('Failed to load workflows:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWorkflows()
  }, [n8nSettings])

  if (loading) {
    return <div className="p-4 text-sm text-vscode-fg-secondary">Loading workflows...</div>
  }

  return (
    <div className="workflow-list">
      <h3 className="px-4 py-2 text-sm font-semibold text-vscode-fg">n8n Workflows</h3>
      <div className="space-y-1">
        {workflows.map(workflow => (
          <div
            key={workflow.id}
            className="flex items-center justify-between px-4 py-2 hover:bg-vscode-hover-bg"
          >
            <div>
              <div className="text-sm font-medium text-vscode-fg">{workflow.name}</div>
              <div className="text-xs text-vscode-fg-secondary">
                {workflow.active ? 'Active' : 'Inactive'}
              </div>
            </div>
            <button
              onClick={() => executeWorkflow(workflow.id)}
              className="px-2 py-1 text-xs rounded bg-vscode-button-bg text-vscode-button-fg"
            >
              Execute
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Example: Chat Integration
```tsx
// web/src/components/Chat/ChatInterface.tsx (integration)
import { N8nClient } from 'src/services/n8nClient'
import { useAppStore } from 'src/state/store'

// In handleSend function
const handleSend = async () => {
  // ... existing code ...

  // Check for workflow trigger
  if (userMessage.startsWith('@workflow ')) {
    const workflowName = userMessage.replace('@workflow ', '').trim()
    await executeWorkflowFromChat(workflowName, userMessage)
    return
  }

  // ... rest of send logic ...
}

const executeWorkflowFromChat = async (workflowName: string, message: string) => {
  const n8nSettings = useAppStore.getState().userSettings.n8n
  if (!n8nSettings.enabled) return

  try {
    const client = new N8nClient(n8nSettings.apiUrl, n8nSettings.apiKey)
    const workflows = await client.getWorkflows()
    const workflow = workflows.find(w => w.name === workflowName)

    if (!workflow) {
      addChatMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Workflow "${workflowName}" not found`,
        timestamp: new Date(),
      })
      return
    }

    const execution = await client.executeWorkflow(workflow.id, {
      message,
      timestamp: new Date().toISOString(),
    })

    // Poll for execution result
    const result = await pollExecutionResult(client, execution.id)

    addChatMessage({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `Workflow executed: ${JSON.stringify(result, null, 2)}`,
      timestamp: new Date(),
    })
  } catch (error) {
    addChatMessage({
      id: Date.now().toString(),
      role: 'assistant',
      content: `Error executing workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date(),
    })
  }
}

async function pollExecutionResult(
  client: N8nClient,
  executionId: string,
  maxAttempts = 30
): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await client.getExecutionStatus(executionId)
    if (status.finished) {
      const execution = await client.getExecutions()
      const result = execution.find(e => e.id === executionId)
      return result?.data || {}
    }
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
  }
  throw new Error('Workflow execution timeout')
}
```

---

## Notes

- n8n integration requires a running n8n instance
- API key should be stored securely (encrypted in settings)
- Workflow execution should be async with polling
- Handle n8n connection errors gracefully
- Support both local and remote n8n instances
- Consider CORS issues (may need backend proxy)
- Workflow execution can be long-running (handle timeouts)
- Integration with chat enables workflow automation
- Workflow management UI improves usability
- Consider adding workflow editor (future enhancement)

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
