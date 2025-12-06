#!/usr/bin/env node
/**
 * Test script for n8n workflow execution
 *
 * This script:
 * 1. Connects to n8n API
 * 2. Finds the workflow by name
 * 3. Executes it with test prompts
 * 4. Captures and displays step-by-step outputs
 */

interface N8nWorkflow {
  id: string
  name: string
  active: boolean
}

interface N8nExecution {
  id: string
  finished: boolean
  mode: string
  retryOf?: string
  retrySuccessId?: string
  startedAt: string
  stoppedAt?: string
  workflowId: string
  workflowData: {
    nodes: Array<{
      name: string
      type: string
      parameters: any
    }>
    connections: any
  }
}

interface ExecutionData {
  resultData: {
    runData: {
      [nodeName: string]: Array<{
        data: {
          main: Array<Array<{ json: any }>>
        }
        executionTime?: number
        error?: any
      }>
    }
  }
  executionData?: {
    data: {
      main: Array<Array<{ json: any }>>
    }
  }
}

class N8nWorkflowTester {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl: string = 'http://localhost:5678', apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.apiKey = apiKey
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.apiKey) {
      headers['X-N8N-API-KEY'] = this.apiKey
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `n8n API error: ${response.status} ${response.statusText}\n${errorText}`
      )
    }

    return response.json()
  }

  async getWorkflowId(name: string): Promise<string | null> {
    try {
      const workflows = await this.request('/api/v1/workflows')
      const workflow = workflows.data?.find(
        (w: N8nWorkflow) => w.name === name
      )
      return workflow?.id || null
    } catch (error) {
      console.error('Error fetching workflows:', error)
      throw error
    }
  }

  async executeWorkflow(
    workflowId: string,
    input: { chatInput: string }
  ): Promise<string> {
    try {
      // Trigger workflow execution via webhook
      // For chat trigger workflows, we need to POST to the webhook URL
      // First, let's try to get the workflow details to find the webhook URL
      const workflow = await this.request(`/api/v1/workflows/${workflowId}`)

      // Find the chat trigger node
      const chatTriggerNode = workflow.nodes?.find(
        (node: any) => node.type === '@n8n/n8n-nodes-langchain.chatTrigger'
      )

      if (!chatTriggerNode) {
        throw new Error('Chat trigger node not found in workflow')
      }

      const webhookId = chatTriggerNode.parameters?.webhookId ||
                       chatTriggerNode.webhookId ||
                       'web-search-agent-chat'

      // Execute via webhook
      const webhookUrl = `${this.baseUrl}/webhook/${webhookId}`

      console.log(`\n📤 Executing workflow via webhook: ${webhookUrl}`)
      console.log(`📝 Input: "${input.chatInput}"`)

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Webhook execution failed: ${response.status} ${response.statusText}\n${errorText}`
        )
      }

      // For chat triggers, the response might be streaming
      // Let's get the execution ID from the response or headers
      const executionId = response.headers.get('x-execution-id') ||
                         response.headers.get('execution-id')

      if (executionId) {
        return executionId
      }

      // If no execution ID in headers, try to get it from the response
      const responseData = await response.json().catch(() => ({}))
      return responseData.executionId || responseData.id || 'unknown'
    } catch (error) {
      console.error('Error executing workflow:', error)
      throw error
    }
  }

  async getExecutionData(executionId: string): Promise<ExecutionData | null> {
    try {
      // Wait a bit for execution to complete
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const execution = await this.request(`/api/v1/executions/${executionId}`)
      return execution.data || null
    } catch (error) {
      console.error('Error fetching execution data:', error)
      return null
    }
  }

  formatStepOutput(nodeName: string, data: any, index: number = 0): string {
    const output: string[] = []
    output.push(`\n${'='.repeat(60)}`)
    output.push(`Node: ${nodeName} (Step ${index + 1})`)
    output.push('='.repeat(60))

    if (data.error) {
      output.push(`❌ ERROR: ${JSON.stringify(data.error, null, 2)}`)
    }

    if (data.data?.main) {
      const mainData = data.data.main[0] || []
      mainData.forEach((item: any, i: number) => {
        output.push(`\n--- Item ${i + 1} ---`)
        output.push(JSON.stringify(item.json, null, 2))
      })
    }

    if (data.executionTime) {
      output.push(`\n⏱️  Execution Time: ${data.executionTime}ms`)
    }

    return output.join('\n')
  }

  async testWorkflow(prompt: string): Promise<void> {
    console.log(`\n${'#'.repeat(60)}`)
    console.log(`# Testing Workflow with Prompt: "${prompt}"`)
    console.log('#'.repeat(60))

    try {
      // Find workflow
      console.log('\n🔍 Finding workflow...')
      const workflowId = await this.getWorkflowId('AI Agent with Web Search (@web)')

      if (!workflowId) {
        throw new Error('Workflow not found. Make sure it is imported in n8n.')
      }

      console.log(`✅ Found workflow: ${workflowId}`)

      // Execute workflow
      const executionId = await this.executeWorkflow(workflowId, {
        chatInput: prompt,
      })

      console.log(`✅ Execution started: ${executionId}`)

      // Wait for execution to complete and get results
      console.log('\n⏳ Waiting for execution to complete...')
      let executionData = await this.getExecutionData(executionId)

      // Retry a few times if execution is still running
      let retries = 0
      while (!executionData && retries < 10) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        executionData = await this.getExecutionData(executionId)
        retries++
      }

      if (!executionData) {
        console.log('⚠️  Could not retrieve execution data. Execution may still be running.')
        console.log('   Check n8n UI for execution details.')
        return
      }

      // Display step-by-step outputs
      console.log('\n📊 Execution Results:')
      console.log('='.repeat(60))

      const runData = executionData.resultData?.runData || {}
      const nodeNames = Object.keys(runData).sort()

      nodeNames.forEach((nodeName, index) => {
        const nodeData = runData[nodeName]
        nodeData.forEach((execution: any, execIndex: number) => {
          console.log(this.formatStepOutput(nodeName, execution, execIndex))
        })
      })

      // Show final output if available
      if (executionData.executionData?.data?.main) {
        console.log(`\n${'='.repeat(60)}`)
        console.log('Final Output:')
        console.log('='.repeat(60))
        const finalData = executionData.executionData.data.main[0] || []
        finalData.forEach((item: any, i: number) => {
          console.log(`\n--- Final Item ${i + 1} ---`)
          console.log(JSON.stringify(item.json, null, 2))
        })
      }

    } catch (error) {
      console.error('\n❌ Test failed:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
        console.error('Stack:', error.stack)
      }
      throw error
    }
  }
}

// Main execution
async function main() {
  const n8nUrl = process.env.N8N_URL || 'http://localhost:5678'
  const n8nApiKey = process.env.N8N_API_KEY

  const tester = new N8nWorkflowTester(n8nUrl, n8nApiKey)

  const testPrompts = [
    'why is the sky blue?',
    '@web why is the sky blue?',
  ]

  console.log('🚀 Starting n8n Workflow Tests')
  console.log(`📍 n8n URL: ${n8nUrl}`)

  for (const prompt of testPrompts) {
    try {
      await tester.testWorkflow(prompt)
      console.log(`\n✅ Test completed for: "${prompt}"`)
    } catch (error) {
      console.error(`\n❌ Test failed for: "${prompt}"`)
      console.error(error)
    }

    // Wait between tests
    if (prompt !== testPrompts[testPrompts.length - 1]) {
      console.log('\n⏸️  Waiting 3 seconds before next test...')
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }
  }

  console.log('\n✨ All tests completed!')
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { N8nWorkflowTester }
