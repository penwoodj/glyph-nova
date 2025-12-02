import type { Meta, StoryObj } from '@storybook/react'
import { DesktopLayout } from './DesktopLayout'

const meta: Meta<typeof DesktopLayout> = {
  title: 'Layouts/DesktopLayout',
  component: DesktopLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'vscode-dark',
    },
  },
  argTypes: {
    leftPanelWidth: {
      control: { type: 'range', min: 150, max: 600, step: 10 },
      description: 'Initial width of the left panel in pixels',
    },
    rightPanelWidth: {
      control: { type: 'range', min: 200, max: 800, step: 10 },
      description: 'Initial width of the right panel in pixels',
    },
  },
}

export default meta
type Story = StoryObj<typeof DesktopLayout>

// Mock panels for Storybook
const MockFileTree = () => (
  <div className="p-4 h-full overflow-auto">
    <div className="text-sm font-semibold mb-2 text-vscode-fg-secondary">
      File Explorer
    </div>
    <div className="space-y-1">
      <div className="px-2 py-1 hover:bg-vscode-hover-bg rounded cursor-pointer text-vscode-fg">
        📁 src
      </div>
      <div className="px-2 py-1 hover:bg-vscode-hover-bg rounded cursor-pointer text-vscode-fg">
        📁 components
      </div>
      <div className="px-2 py-1 hover:bg-vscode-hover-bg rounded cursor-pointer text-vscode-fg">
        📄 App.tsx
      </div>
    </div>
  </div>
)

const MockEditor = () => (
  <div className="p-4 h-full overflow-auto">
    <div className="text-sm mb-2 text-vscode-fg-secondary border-b border-vscode-border pb-2">
      Editor - File Preview
    </div>
    <div className="font-mono text-sm text-vscode-fg">
      <div className="text-vscode-fg-secondary">// File content will appear here</div>
      <div className="mt-4">
        <span className="text-blue-400">import</span>{' '}
        <span className="text-green-400">React</span>{' '}
        <span className="text-blue-400">from</span>{' '}
        <span className="text-yellow-400">'react'</span>
      </div>
    </div>
  </div>
)

const MockChat = () => (
  <div className="p-4 h-full flex flex-col">
    <div className="text-sm font-semibold mb-4 text-vscode-fg-secondary border-b border-vscode-border pb-2">
      Chat
    </div>
    <div className="flex-1 overflow-auto mb-4 space-y-4">
      <div className="bg-vscode-input-bg p-3 rounded text-sm text-vscode-fg">
        Hello! How can I help you today?
      </div>
    </div>
    <div className="border-t border-vscode-border pt-2">
      <input
        type="text"
        placeholder="Type a message..."
        className="w-full bg-vscode-input-bg border border-vscode-input-border rounded px-3 py-2 text-sm text-vscode-fg focus:outline-none focus:border-vscode-active-border"
      />
    </div>
  </div>
)

export const Default: Story = {
  args: {
    leftPanel: <MockFileTree />,
    centerPanel: <MockEditor />,
    rightPanel: <MockChat />,
    leftPanelWidth: 250,
    rightPanelWidth: 400,
  },
}

export const NarrowLeftPanel: Story = {
  args: {
    leftPanel: <MockFileTree />,
    centerPanel: <MockEditor />,
    rightPanel: <MockChat />,
    leftPanelWidth: 180,
    rightPanelWidth: 400,
  },
}

export const WideRightPanel: Story = {
  args: {
    leftPanel: <MockFileTree />,
    centerPanel: <MockEditor />,
    rightPanel: <MockChat />,
    leftPanelWidth: 250,
    rightPanelWidth: 600,
  },
}

export const Resizable: Story = {
  args: {
    leftPanel: <MockFileTree />,
    centerPanel: <MockEditor />,
    rightPanel: <MockChat />,
    leftPanelWidth: 250,
    rightPanelWidth: 400,
    onLeftPanelResize: (width) => {
      console.log('Left panel resized to:', width)
    },
    onRightPanelResize: (width) => {
      console.log('Right panel resized to:', width)
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Drag the resize handles between panels to adjust their widths. Panels maintain minimum and maximum width constraints.',
      },
    },
  },
}

