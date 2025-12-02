/**
 * FileTreeCell Storybook Stories
 *
 * Stories for testing the FileTreeCell component in isolation.
 * Note: Requires GraphQL server to be running for full functionality.
 */

import type { Meta, StoryObj } from '@storybook/react'
import FileTreeCell from './FileTreeCell'

const meta: Meta<typeof FileTreeCell> = {
  title: 'Components/FileTree/FileTreeCell',
  component: FileTreeCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'vscode-dark',
    },
  },
  argTypes: {
    rootPath: {
      control: 'text',
      description: 'Root directory path to display',
    },
    selectedPath: {
      control: 'text',
      description: 'Currently selected file path',
    },
  },
}

export default meta
type Story = StoryObj<typeof FileTreeCell>

// Mock story - requires GraphQL server
export const Default: Story = {
  args: {
    rootPath: process.env.HOME || '/home',
    onFileClick: (path) => {
      console.log('File clicked:', path)
    },
    onFileRightClick: (path, event) => {
      console.log('File right-clicked:', path, event)
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'FileTreeCell component that fetches and displays directory contents. Requires GraphQL server to be running.',
      },
    },
  },
}

export const WithSelectedFile: Story = {
  args: {
    rootPath: process.env.HOME || '/home',
    selectedPath: '/home/example/file.txt',
    onFileClick: (path) => {
      console.log('File clicked:', path)
    },
  },
}

export const LoadingState: Story = {
  render: () => {
    // Manually render Loading state for demonstration
    const { Loading } = require('./FileTreeCell')
    return <Loading />
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state displayed while fetching directory contents.',
      },
    },
  },
}

export const ErrorState: Story = {
  render: () => {
    // Manually render Failure state for demonstration
    const { Failure } = require('./FileTreeCell')
    return <Failure error={new Error('Failed to load directory: Permission denied')} />
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state displayed when directory loading fails.',
      },
    },
  },
}

export const EmptyState: Story = {
  render: () => {
    // Manually render Empty state for demonstration
    const { Empty } = require('./FileTreeCell')
    return <Empty />
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state displayed when directory is empty.',
      },
    },
  },
}

