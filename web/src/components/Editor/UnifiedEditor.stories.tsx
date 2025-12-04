/**
 * UnifiedEditor Storybook Stories
 *
 * Test stories for UnifiedEditor component showing different file types
 * and editor mode switching behavior.
 */

import type { Meta, StoryObj } from '@storybook/react'
import { UnifiedEditor } from './UnifiedEditor'

const meta: Meta<typeof UnifiedEditor> = {
  component: UnifiedEditor,
  title: 'Editor/UnifiedEditor',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof UnifiedEditor>

// Sample content for different file types
const markdownContent = `# Sample Markdown File

This is a **markdown** file with various formatting:

- Bullet point 1
- Bullet point 2
- Bullet point 3

## Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

## Links and Images

Check out [this link](https://example.com).
`

const javascriptContent = `/**
 * Sample JavaScript File
 */

import React from 'react';

export const MyComponent = ({ name }) => {
  const [count, setCount] = React.useState(0);

  const handleClick = () => {
    setCount(count + 1);
    console.log(\`Clicked \${count + 1} times\`);
  };

  return (
    <div className="container">
      <h1>Hello, {name}!</h1>
      <button onClick={handleClick}>
        Count: {count}
      </button>
    </div>
  );
};

export default MyComponent;
`

const pythonContent = `"""
Sample Python File
"""

import os
import sys
from typing import List, Dict, Optional


class DataProcessor:
    """Process data with various transformations."""

    def __init__(self, data: List[Dict]):
        self.data = data
        self.processed = False

    def process(self) -> List[Dict]:
        """Process the data."""
        result = []
        for item in self.data:
            if item.get('active'):
                result.append({
                    'id': item['id'],
                    'name': item['name'].upper(),
                    'count': item.get('count', 0) * 2
                })
        self.processed = True
        return result


def main():
    processor = DataProcessor([
        {'id': 1, 'name': 'item1', 'active': True, 'count': 10},
        {'id': 2, 'name': 'item2', 'active': False},
        {'id': 3, 'name': 'item3', 'active': True, 'count': 5},
    ])
    results = processor.process()
    print(f"Processed {len(results)} items")


if __name__ == '__main__':
    main()
`

const jsonContent = `{
  "name": "llm-ui",
  "version": "1.0.0",
  "description": "Desktop application for LLM chat with file context",
  "scripts": {
    "dev": "redwood dev",
    "build": "redwood build",
    "test": "redwood test"
  },
  "dependencies": {
    "@redwoodjs/core": "^7.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
`

const cssContent = `/**
 * Sample CSS File
 */

:root {
  --primary-color: #007acc;
  --secondary-color: #6c757d;
  --background-color: #1e1e1e;
  --text-color: #d4d4d4;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: var(--background-color);
  color: var(--text-color);
}

.button {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button:hover {
  background-color: #005a9e;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
`

const plainTextContent = `This is a plain text file.

It doesn't have any special syntax highlighting,
just plain text content.

Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

End of file.
`

// Story: No file selected
export const NoFileSelected: Story = {
  args: {
    content: '',
    filePath: undefined,
    placeholder: 'Select a file to view or edit...',
  },
}

// Story: Markdown file (uses VditorEditor)
export const MarkdownFile: Story = {
  args: {
    content: markdownContent,
    filePath: '/path/to/document.md',
    onChange: (content) => console.log('Markdown changed:', content.substring(0, 50)),
    onSave: (content) => console.log('Markdown saved:', content.substring(0, 50)),
  },
}

// Story: JavaScript file (uses CodeEditor with syntax highlighting)
export const JavaScriptFile: Story = {
  args: {
    content: javascriptContent,
    filePath: '/path/to/component.jsx',
    onChange: (content) => console.log('JavaScript changed:', content.substring(0, 50)),
    onSave: (content) => console.log('JavaScript saved:', content.substring(0, 50)),
  },
}

// Story: TypeScript file
export const TypeScriptFile: Story = {
  args: {
    content: javascriptContent.replace('JavaScript', 'TypeScript'),
    filePath: '/path/to/component.tsx',
    onChange: (content) => console.log('TypeScript changed:', content.substring(0, 50)),
    onSave: (content) => console.log('TypeScript saved:', content.substring(0, 50)),
  },
}

// Story: Python file
export const PythonFile: Story = {
  args: {
    content: pythonContent,
    filePath: '/path/to/script.py',
    onChange: (content) => console.log('Python changed:', content.substring(0, 50)),
    onSave: (content) => console.log('Python saved:', content.substring(0, 50)),
  },
}

// Story: JSON file
export const JSONFile: Story = {
  args: {
    content: jsonContent,
    filePath: '/path/to/package.json',
    onChange: (content) => console.log('JSON changed:', content.substring(0, 50)),
    onSave: (content) => console.log('JSON saved:', content.substring(0, 50)),
  },
}

// Story: CSS file
export const CSSFile: Story = {
  args: {
    content: cssContent,
    filePath: '/path/to/styles.css',
    onChange: (content) => console.log('CSS changed:', content.substring(0, 50)),
    onSave: (content) => console.log('CSS saved:', content.substring(0, 50)),
  },
}

// Story: Plain text file
export const PlainTextFile: Story = {
  args: {
    content: plainTextContent,
    filePath: '/path/to/notes.txt',
    onChange: (content) => console.log('Text changed:', content.substring(0, 50)),
    onSave: (content) => console.log('Text saved:', content.substring(0, 50)),
  },
}

// Story: Read-only mode (markdown)
export const ReadOnlyMarkdown: Story = {
  args: {
    content: markdownContent,
    filePath: '/path/to/readme.md',
    readonly: true,
  },
}

// Story: Read-only mode (code)
export const ReadOnlyCode: Story = {
  args: {
    content: javascriptContent,
    filePath: '/path/to/example.js',
    readonly: true,
  },
}

// Story: Empty file
export const EmptyFile: Story = {
  args: {
    content: '',
    filePath: '/path/to/empty.js',
    placeholder: 'Start typing...',
  },
}

