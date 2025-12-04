/**
 * ChatInterface Storybook Stories
 *
 * Test stories for ChatInterface component showing different states
 * and interactions with Ollama models.
 */

import type { Meta, StoryObj } from '@storybook/react'
import { ChatInterface } from './ChatInterface'

const meta: Meta<typeof ChatInterface> = {
  component: ChatInterface,
  title: 'Chat/ChatInterface',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ChatInterface>

// Story: Default empty state
export const Empty: Story = {
  args: {},
}

// Story: With mock data (requires Ollama running)
export const WithMockConversation: Story = {
  args: {},
  decorators: [
    (Story) => {
      // Note: This story requires Ollama to be running locally
      // to display models and health status
      return <Story />
    },
  ],
}

// Story: Loading state placeholder
export const LoadingModels: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Shows the interface while loading Ollama models. Requires Ollama to be running.',
      },
    },
  },
}

// Story: No Ollama connection
export const OllamaOffline: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Shows the interface when Ollama is not available. Start Ollama to see the connected state.',
      },
    },
  },
}

