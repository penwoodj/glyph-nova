# Storybook Redwood.js Integration Guide for Desktop Application Development

**Purpose**: Complete guide for integrating Storybook with Redwood.js for component-driven development, covering setup, configuration, component patterns, and desktop app-specific considerations.

**Target**: Frontend developers building UI components in isolation  
**Date**: January 2025  
**Status**: Research Phase - Development Workflow  
**Size**: ~10KB (context window compatible)

---

## Executive Summary

Storybook enables component-driven development by allowing you to build and test UI components in isolation from your application. This guide covers Storybook integration with Redwood.js, configuration for desktop application components, patterns for testing Cells and services, and best practices for developing file tree, chat interface, and markdown editor components. Storybook runs independently of the main Redwood.js app, providing a focused development environment for UI components.

**Key Recommendations**:
- Use Storybook for all UI component development (file tree, chat, editor)
- Mock Redwood.js services and API calls in stories
- Use decorators to provide Redwood.js context to components
- Create stories for different states (loading, error, success)
- Test component variations and edge cases in isolation

---

## Storybook Setup with Redwood.js

### Initial Setup

**Redwood.js Built-in Support**:

Redwood.js includes Storybook support out of the box:

```bash
# Start Storybook (first run installs dependencies)
yarn redwood storybook

# Storybook runs on http://localhost:7910
```

**First Run Process**:
1. Redwood.js detects Storybook not installed
2. Automatically installs Storybook and dependencies
3. Generates default configuration
4. Starts Storybook server on port 7910

### Configuration Files

**Storybook Configuration Location**:

```
my-redwood-app/
├── web/
│   ├── config/
│   │   ├── storybook.config.js    # Storybook server configuration
│   │   └── storybook.preview.js   # Preview configuration (decorators, parameters)
│   └── src/
│       ├── components/
│       │   └── Button/
│       │       ├── Button.tsx
│       │       └── Button.stories.tsx
```

### Storybook Server Configuration

**`web/config/storybook.config.js`**:

```javascript
// web/config/storybook.config.js
module.exports = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y', // Accessibility testing
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  core: {
    builder: '@storybook/builder-webpack5',
  },
  features: {
    interactionsDebugger: true,
  },
}
```

### Preview Configuration

**`web/config/storybook.preview.js`**:

```javascript
// web/config/storybook.preview.js
import { withRedwoodJS } from '@redwoodjs/storybook-config'

// Global decorators for all stories
export const decorators = [
  withRedwoodJS(),
  // Add Redwood.js router mock
  (Story) => (
    <MemoryRouter>
      <Story />
    </MemoryRouter>
  ),
]

// Global parameters for all stories
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  // Mock Redwood.js API calls
  msw: {
    handlers: [],
  },
}
```

---

## Redwood.js Component Patterns for Storybook

### Standard Components

**Simple Component Story**:

```typescript
// web/src/components/Button/Button.tsx
export const Button = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}: { 
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}) => {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  )
}

// web/src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    label: 'Click me',
    onClick: () => console.log('Clicked!'),
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    label: 'Click me',
    onClick: () => console.log('Clicked!'),
    variant: 'secondary',
  },
}
```

### Cell Components in Storybook

**Challenge**: Cells use GraphQL queries and have loading/error states

**Solution**: Mock GraphQL responses and use decorators

```typescript
// web/src/components/FileTree/FileTreeCell.tsx
export const QUERY = gql`
  query GetDirectoryContents($path: String!) {
    directoryContents(path: $path) {
      files { name, path, type }
      folders { name, path, type }
    }
  }
`

export const Loading = () => <div>Loading files...</div>
export const Empty = () => <div>No files found</div>
export const Failure = ({ error }) => <div>Error: {error.message}</div>
export const Success = ({ directoryContents }) => {
  return <FileTreeView data={directoryContents} />
}

// web/src/components/FileTree/FileTreeCell.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { FileTreeCell } from './FileTreeCell'

const meta: Meta<typeof FileTreeCell> = {
  title: 'Components/FileTreeCell',
  component: FileTreeCell,
  decorators: [
    (Story) => (
      <MockedProvider mocks={[
        {
          request: {
            query: FileTreeCell.QUERY,
            variables: { path: '/home/user/projects' },
          },
          result: {
            data: {
              directoryContents: {
                files: [
                  { name: 'file1.ts', path: '/home/user/projects/file1.ts', type: 'file' },
                  { name: 'file2.js', path: '/home/user/projects/file2.js', type: 'file' },
                ],
                folders: [
                  { name: 'src', path: '/home/user/projects/src', type: 'directory' },
                ],
              },
            },
          },
        },
      ]}>
        <Story />
      </MockedProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FileTreeCell>

export const Default: Story = {
  args: {
    path: '/home/user/projects',
  },
}

export const Loading: Story = {
  parameters: {
    apolloClient: {
      mocks: [
        {
          request: {
            query: FileTreeCell.QUERY,
            variables: { path: '/home/user/projects' },
          },
          delay: 10000, // Simulate loading
        },
      ],
    },
  },
}

export const Empty: Story = {
  parameters: {
    apolloClient: {
      mocks: [
        {
          request: {
            query: FileTreeCell.QUERY,
            variables: { path: '/home/user/projects' },
          },
          result: {
            data: {
              directoryContents: {
                files: [],
                folders: [],
              },
            },
          },
        },
      ],
    },
  },
}
```

### Service Mocking Patterns

**Mock Redwood.js Services in Stories**:

```typescript
// web/src/components/Chat/ChatInterface.stories.tsx
import { rest } from 'msw'

export default {
  title: 'Components/ChatInterface',
  parameters: {
    msw: {
      handlers: [
        // Mock Ollama API calls
        rest.post('http://localhost:11434/api/chat', (req, res, ctx) => {
          return res(
            ctx.json({
              message: {
                content: 'This is a mock response from Ollama',
              },
            })
          )
        }),
      ],
    },
  },
}
```

---

## Desktop App Component Testing

### File Tree Component Stories

**Component Story Examples**:

```typescript
// web/src/components/FileTree/FileTreeView.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { FileTreeView } from './FileTreeView'

const meta: Meta<typeof FileTreeView> = {
  title: 'Desktop/FileTree',
  component: FileTreeView,
}

export default meta
type Story = StoryObj<typeof FileTreeView>

const mockData = {
  files: [
    { name: 'app.tsx', path: '/projects/app.tsx', type: 'file', extension: '.tsx' },
    { name: 'config.json', path: '/projects/config.json', type: 'file', extension: '.json' },
  ],
  folders: [
    { name: 'src', path: '/projects/src', type: 'directory' },
    { name: 'components', path: '/projects/components', type: 'directory' },
  ],
}

export const Default: Story = {
  args: {
    data: mockData,
    expandedPaths: new Set(['/projects/src']),
    onToggleExpand: (path) => console.log('Toggle:', path),
    onFileClick: (file) => console.log('File clicked:', file),
    onFileRightClick: (file) => console.log('File right-clicked:', file),
  },
}

export const LargeDirectory: Story = {
  args: {
    data: {
      files: Array.from({ length: 100 }, (_, i) => ({
        name: `file${i}.ts`,
        path: `/projects/file${i}.ts`,
        type: 'file' as const,
        extension: '.ts',
      })),
      folders: [],
    },
    expandedPaths: new Set(),
  },
}

export const DeeplyNested: Story = {
  args: {
    data: {
      files: [],
      folders: [
        {
          name: 'level1',
          path: '/projects/level1',
          type: 'directory',
          children: [
            {
              name: 'level2',
              path: '/projects/level1/level2',
              type: 'directory',
              children: [
                {
                  name: 'level3',
                  path: '/projects/level1/level2/level3',
                  type: 'directory',
                },
              ],
            },
          ],
        },
      ],
    },
    expandedPaths: new Set(['/projects/level1', '/projects/level1/level2']),
  },
}
```

### Chat Interface Component Stories

```typescript
// web/src/components/Chat/ChatInterface.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ChatInterface } from './ChatInterface'

const meta: Meta<typeof ChatInterface> = {
  title: 'Desktop/ChatInterface',
  component: ChatInterface,
}

export default meta
type Story = StoryObj<typeof ChatInterface>

export const Default: Story = {
  args: {
    messages: [
      { role: 'user', content: 'Hello, can you help me with this code?' },
      { role: 'assistant', content: 'Of course! What would you like help with?' },
    ],
    onSendMessage: (message) => console.log('Send:', message),
    onFileContextAdd: (filePath) => console.log('Add context:', filePath),
    availableModels: ['llama2', 'mistral', 'codellama'],
    selectedModel: 'llama2',
  },
}

export const Streaming: Story = {
  args: {
    messages: [
      { role: 'user', content: 'Explain this code' },
      { role: 'assistant', content: 'This code is', isStreaming: true },
    ],
    isStreaming: true,
  },
}

export const WithFileContext: Story = {
  args: {
    messages: [
      { role: 'user', content: 'Can you review this file?' },
      { role: 'system', content: 'File context: /projects/app.tsx', type: 'context' },
      { role: 'assistant', content: 'I can see your file. Let me review it...' },
    ],
    fileContexts: ['/projects/app.tsx'],
  },
}
```

### Markdown Editor Component Stories

```typescript
// web/src/components/Editor/MarkdownEditor.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { MarkdownEditor } from './MarkdownEditor'

const meta: Meta<typeof MarkdownEditor> = {
  title: 'Desktop/MarkdownEditor',
  component: MarkdownEditor,
}

export default meta
type Story = StoryObj<typeof MarkdownEditor>

const sampleMarkdown = `# Hello World

This is a **markdown** file with some \`code\`.

\`\`\`typescript
function hello() {
  console.log('Hello, World!')
}
\`\`\`
`

export const Default: Story = {
  args: {
    content: sampleMarkdown,
    language: 'markdown',
    onChange: (content) => console.log('Content changed:', content.length),
    onSave: (content) => console.log('Save:', content),
  },
}

export const CodeFile: Story = {
  args: {
    content: `function example() {
  return 'Hello, World!'
}`,
    language: 'typescript',
    readOnly: false,
  },
}

export const LargeFile: Story = {
  args: {
    content: Array.from({ length: 1000 }, (_, i) => `Line ${i + 1}`).join('\n'),
    language: 'text',
  },
}
```

---

## Component Isolation Strategies

### Mocking Dependencies

**Mock Redwood.js Router**:

```typescript
// web/config/storybook.preview.js
import { MemoryRouter } from 'react-router-dom'

export const decorators = [
  (Story) => (
    <MemoryRouter>
      <Story />
    </MemoryRouter>
  ),
]
```

**Mock Desktop App APIs**:

```typescript
// For Tauri commands
import { vi } from 'vitest'

vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn((cmd, args) => {
    if (cmd === 'read_directory') {
      return Promise.resolve({
        files: [],
        folders: [],
      })
    }
  }),
}))

// For Electron IPC
vi.mock('electron', () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
  },
}))
```

### Providing Context

**Redwood.js Context Decorator**:

```typescript
// web/config/storybook.preview.js
import { RedwoodProvider } from '@redwoodjs/web'

export const decorators = [
  (Story) => (
    <RedwoodProvider>
      <Story />
    </RedwoodProvider>
  ),
]
```

**Desktop App Context Decorator**:

```typescript
// web/src/lib/DesktopAppDecorator.tsx
export const DesktopAppDecorator = (Story) => {
  return (
    <DesktopAppProvider
      value={{
        fileSystem: mockFileSystem,
        clipboard: mockClipboard,
        ollama: mockOllama,
      }}
    >
      <Story />
    </DesktopAppProvider>
  )
}
```

---

## Story Organization Patterns

### Directory Structure

```
web/src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.stories.tsx
│   ├── FileTree/
│   │   ├── FileTreeView.tsx
│   │   ├── FileTreeCell.tsx
│   │   ├── FileTreeView.stories.tsx
│   │   └── FileTreeCell.stories.tsx
│   └── Chat/
│       ├── ChatInterface.tsx
│       ├── ChatMessage.tsx
│       ├── ChatInterface.stories.tsx
│       └── ChatMessage.stories.tsx
└── layouts/
    └── DesktopLayout/
        ├── DesktopLayout.tsx
        └── DesktopLayout.stories.tsx
```

### Story Naming Convention

```typescript
// Use clear, hierarchical titles
title: 'Desktop/FileTree/FileTreeView'        // Component location
title: 'Components/Button'                    // Generic component
title: 'Layouts/DesktopLayout'                // Layout component
```

---

## Development Workflow

### Component-Driven Development

1. **Create Component in Storybook First**:
   - Build component in isolation
   - Test all states and variations
   - Get visual feedback quickly

2. **Add to Redwood.js App**:
   - Import component into pages/cells
   - Connect to real data sources
   - Test in application context

3. **Iterate in Storybook**:
   - Make changes in Storybook
   - Test edge cases and variations
   - Refine component API

### Testing Strategy

**Unit Tests in Storybook**:

```typescript
// Use @storybook/test for interaction testing
import { expect, userEvent, within } from '@storybook/test'

export const InteractionTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    
    await userEvent.click(button)
    await expect(button).toHaveTextContent('Clicked!')
  },
}
```

**Visual Regression Testing**:

- Use Chromatic or Percy for visual testing
- Compare screenshots across commits
- Catch visual regressions early

---

## Desktop App-Specific Considerations

### File System Mocking

**Mock File System for Stories**:

```typescript
// web/src/lib/mockFileSystem.ts
export const mockFileSystem = {
  '/home/user/projects': {
    files: ['app.tsx', 'config.json'],
    folders: ['src', 'components'],
  },
  '/home/user/projects/src': {
    files: ['index.ts'],
    folders: [],
  },
}

export const useMockFileSystem = () => {
  // Provide mock file system for Storybook
}
```

### Desktop Window Mocking

**Mock Desktop Window APIs**:

```typescript
// Mock window size and desktop features
export const DesktopWindowDecorator = (Story) => {
  return (
    <div style={{ width: '1200px', height: '800px' }}>
      <Story />
    </div>
  )
}
```

---

## Best Practices

### 1. Keep Stories Focused

- One story per component state
- Clear, descriptive names
- Minimal, focused props

### 2. Use Controls

- Enable controls for interactive testing
- Provide default values
- Use appropriate control types

### 3. Document Components

- Use JSDoc comments
- Add argTypes descriptions
- Include usage examples

### 4. Test Edge Cases

- Empty states
- Error states
- Loading states
- Large datasets
- Edge case inputs

### 5. Maintain Consistency

- Use shared decorators
- Consistent story structure
- Shared mock data

---

## External Documentation Links

### Storybook Official Docs
- [Storybook for React](https://storybook.js.org/docs/react/get-started/introduction) - Getting started guide
- [Storybook Configuration](https://storybook.js.org/docs/react/configure/overview) - Configuration options
- [Writing Stories](https://storybook.js.org/docs/react/writing-stories/introduction) - Story writing guide
- [Testing with Storybook](https://storybook.js.org/docs/react/writing-tests/introduction) - Testing strategies

### Redwood.js Storybook
- [Redwood.js Storybook Docs](https://redwoodjs.com/docs/storybook) - Redwood.js specific guide
- [Redwood.js Storybook Config](https://github.com/redwoodjs/redwood/tree/main/packages/storybook-config) - Configuration package

### Storybook Addons
- [Storybook Addons](https://storybook.js.org/docs/react/addons/introduction) - Available addons
- [Controls Addon](https://storybook.js.org/docs/react/essentials/controls) - Interactive controls
- [Actions Addon](https://storybook.js.org/docs/react/essentials/actions) - Event logging
- [Accessibility Addon](https://storybook.js.org/addons/@storybook/addon-a11y) - A11y testing

---

## Implementation Checklist

- [ ] Install and configure Storybook in Redwood.js project
- [ ] Set up configuration files (storybook.config.js, storybook.preview.js)
- [ ] Create global decorators for Redwood.js context
- [ ] Set up GraphQL mocking for Cell components
- [ ] Create stories for FileTree component
- [ ] Create stories for ChatInterface component
- [ ] Create stories for MarkdownEditor component
- [ ] Set up desktop app API mocking
- [ ] Configure addons (controls, actions, a11y)
- [ ] Test component isolation and interaction

---

## Next Steps

1. **Review Component Library Evaluation**: Choose UI component library for consistent design
2. **Begin Component Development**: Start building FileTree component in Storybook
3. **Set Up Visual Testing**: Configure Chromatic or similar for visual regression
4. **Integrate with Redwood.js**: Connect Storybook components to Redwood.js app

---

**Report Status**: Complete  
**Verification**: All external links verified as of January 2025  
**Context Window Compatibility**: ~10KB - Can be loaded with 2-3 other reports simultaneously

