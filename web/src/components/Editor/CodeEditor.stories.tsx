/**
 * CodeEditor Storybook Stories
 *
 * Storybook stories for testing CodeEditor component with different languages
 * and configurations.
 */

import type { Meta, StoryObj } from '@storybook/react'
import { CodeEditor } from './CodeEditor'

const meta: Meta<typeof CodeEditor> = {
  title: 'Editor/CodeEditor',
  component: CodeEditor,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'vscode-dark',
      values: [
        {
          name: 'vscode-dark',
          value: '#1e1e1e',
        },
      ],
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CodeEditor>

const sampleJavaScript = `function greet(name) {
  return \`Hello, \${name}!\`;
}

const user = "World";
console.log(greet(user));
`

const sampleTypeScript = `interface User {
  id: number;
  name: string;
  email: string;
}

function getUserById(id: number): User | null {
  // Implementation here
  return null;
}
`

const samplePython = `def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence up to n terms."""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]

    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])

    return sequence

# Example usage
result = fibonacci(10)
print(result)
`

const sampleCSS = `.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--vscode-bg);
  color: var(--vscode-fg);
}

.button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vscode-border);
  background-color: var(--vscode-button-bg);
  color: var(--vscode-fg);
  cursor: pointer;
}

.button:hover {
  background-color: var(--vscode-button-hover);
}
`

const sampleJSON = `{
  "name": "llm-ui",
  "version": "1.0.0",
  "description": "Desktop application for local LLM interaction",
  "dependencies": {
    "react": "^18.0.0",
    "redwoodjs": "^8.9.0"
  }
}
`

export const JavaScript: Story = {
  args: {
    content: sampleJavaScript,
    filePath: 'example.js',
    onChange: (content) => console.log('Content changed:', content),
    onSave: (content) => console.log('Saving:', content),
    height: 400,
  },
}

export const TypeScript: Story = {
  args: {
    content: sampleTypeScript,
    filePath: 'example.ts',
    onChange: (content) => console.log('Content changed:', content),
    onSave: (content) => console.log('Saving:', content),
    height: 400,
  },
}

export const Python: Story = {
  args: {
    content: samplePython,
    filePath: 'example.py',
    onChange: (content) => console.log('Content changed:', content),
    onSave: (content) => console.log('Saving:', content),
    height: 400,
  },
}

export const CSS: Story = {
  args: {
    content: sampleCSS,
    filePath: 'styles.css',
    onChange: (content) => console.log('Content changed:', content),
    onSave: (content) => console.log('Saving:', content),
    height: 400,
  },
}

export const JSON: Story = {
  args: {
    content: sampleJSON,
    filePath: 'package.json',
    onChange: (content) => console.log('Content changed:', content),
    onSave: (content) => console.log('Saving:', content),
    height: 400,
  },
}

export const ReadOnly: Story = {
  args: {
    content: sampleJavaScript,
    filePath: 'example.js',
    readonly: true,
    height: 400,
  },
}

export const Empty: Story = {
  args: {
    content: '',
    filePath: 'new-file.ts',
    placeholder: 'Start typing your code...',
    height: 400,
  },
}

export const LongFile: Story = {
  args: {
    content: Array(100).fill(sampleJavaScript).join('\n\n'),
    filePath: 'large-file.js',
    height: 400,
  },
}





