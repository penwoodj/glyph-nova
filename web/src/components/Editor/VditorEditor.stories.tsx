/**
 * Storybook Stories for VditorEditor Component
 *
 * Demonstrates different editor modes and configurations.
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { VditorEditor } from './VditorEditor'

const meta: Meta<typeof VditorEditor> = {
  title: 'Components/Editor/VditorEditor',
  component: VditorEditor,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'vscode-dark',
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['instant', 'wysiwyg', 'sv'],
      description: 'Editor mode: instant (live preview), wysiwyg, or sv (split view)',
    },
    readonly: {
      control: 'boolean',
      description: 'Whether the editor is read-only',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when editor is empty',
    },
    height: {
      control: 'text',
      description: 'Editor height (number or CSS string)',
    },
  },
}

export default meta
type Story = StoryObj<typeof VditorEditor>

// Interactive wrapper to handle onChange
const InteractiveEditor = (args: any) => {
  const [content, setContent] = useState(
    args.content ||
      `# Welcome to Vditor Editor

This is a **markdown editor** with live preview.

## Features

- Instant rendering mode
- Syntax highlighting
- Full markdown support

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> This is a blockquote

- Item 1
- Item 2
- Item 3
`
  )

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <VditorEditor
        {...args}
        content={content}
        onChange={(newContent) => {
          setContent(newContent)
          args.onChange?.(newContent)
        }}
        onSave={(savedContent) => {
          console.log('Save triggered:', savedContent)
          args.onSave?.(savedContent)
        }}
      />
    </div>
  )
}

export const Default: Story = {
  render: InteractiveEditor,
  args: {
    mode: 'instant',
    readonly: false,
    placeholder: 'Start typing markdown...',
    onChange: (content: string) => console.log('Content changed:', content.length, 'chars'),
    onSave: (content: string) => console.log('Save triggered:', content.length, 'chars'),
  },
}

export const InstantMode: Story = {
  render: InteractiveEditor,
  args: {
    mode: 'instant',
    content: `# Instant Mode

This mode provides **live preview** as you type.

\`\`\`typescript
const editor = new VditorEditor({
  mode: 'instant'
})
\`\`\`
`,
  },
}

export const WYSIWYGMode: Story = {
  render: InteractiveEditor,
  args: {
    mode: 'wysiwyg',
    content: `# WYSIWYG Mode

This mode provides **visual editing** like a word processor.

You can format text directly without markdown syntax.`,
  },
}

export const SplitViewMode: Story = {
  render: InteractiveEditor,
  args: {
    mode: 'sv',
    content: `# Split View Mode

This mode shows **side-by-side** editing and preview.

- Left: Markdown source
- Right: Rendered preview`,
  },
}

export const Readonly: Story = {
  render: InteractiveEditor,
  args: {
    mode: 'instant',
    readonly: true,
    content: `# Read-Only Mode

This editor is **read-only**. You cannot edit the content.

This is useful for displaying documentation or viewing files.`,
  },
}

export const Empty: Story = {
  render: InteractiveEditor,
  args: {
    mode: 'instant',
    content: '',
    placeholder: 'Type your markdown here...',
  },
}

