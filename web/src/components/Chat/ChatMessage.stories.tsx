/**
 * ChatMessage Storybook Stories
 *
 * Test stories for ChatMessage component showing different message types
 * and content rendering.
 */

import type { Meta, StoryObj } from '@storybook/react'
import { ChatMessage } from './ChatMessage'
import type { ChatMessage as ChatMessageType } from 'src/state/store'

const meta: Meta<typeof ChatMessage> = {
  component: ChatMessage,
  title: 'Chat/ChatMessage',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof ChatMessage>

const baseUserMessage: ChatMessageType = {
  id: '1',
  role: 'user',
  content: 'Hello! Can you help me with this code?',
  timestamp: new Date('2025-12-04T10:00:00'),
}

const baseAssistantMessage: ChatMessageType = {
  id: '2',
  role: 'assistant',
  content: 'Of course! I\'d be happy to help. What code would you like assistance with?',
  timestamp: new Date('2025-12-04T10:00:05'),
}

// Story: User message
export const UserMessage: Story = {
  args: {
    message: baseUserMessage,
  },
}

// Story: Assistant message with plain text
export const AssistantMessagePlain: Story = {
  args: {
    message: baseAssistantMessage,
  },
}

// Story: Assistant message with markdown
export const AssistantMessageMarkdown: Story = {
  args: {
    message: {
      ...baseAssistantMessage,
      content: `# Code Review

Here's my analysis of your code:

## Issues Found

1. **Missing error handling** - You should wrap the database call in a try-catch block
2. **Memory leak** - The event listener is not being cleaned up

## Recommendations

- Use \`async/await\` for better readability
- Add input validation
- Consider using a connection pool

Let me know if you need help implementing these changes!`,
    },
  },
}

// Story: Assistant message with code block
export const AssistantMessageWithCode: Story = {
  args: {
    message: {
      ...baseAssistantMessage,
      content: `Here's how you can improve your function:

\`\`\`javascript
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}
\`\`\`

This version includes:
- Proper error handling with try-catch
- HTTP status checking
- Better error messages`,
    },
  },
}

// Story: Assistant message with multiple code blocks
export const AssistantMessageMultipleCodeBlocks: Story = {
  args: {
    message: {
      ...baseAssistantMessage,
      content: `I can show you examples in both JavaScript and Python:

**JavaScript:**
\`\`\`javascript
const result = await processData(input);
console.log(result);
\`\`\`

**Python:**
\`\`\`python
result = process_data(input)
print(result)
\`\`\`

Both achieve the same result!`,
    },
  },
}

// Story: User message with file path
export const UserMessageWithFilePath: Story = {
  args: {
    message: {
      ...baseUserMessage,
      content: 'Can you review /home/user/project/src/components/Button.tsx and suggest improvements?',
    },
  },
}

// Story: Assistant message with list
export const AssistantMessageWithList: Story = {
  args: {
    message: {
      ...baseAssistantMessage,
      content: `Here are the steps to fix this issue:

1. First, update your dependencies
2. Then, modify the configuration file
3. Finally, restart the application

You should also consider:
- Adding unit tests
- Implementing error logging
- Documenting the changes`,
    },
  },
}

// Story: Assistant message with table
export const AssistantMessageWithTable: Story = {
  args: {
    message: {
      ...baseAssistantMessage,
      content: `Here's a comparison:

| Feature | Option A | Option B |
|---------|----------|----------|
| Performance | Fast | Very Fast |
| Memory | Low | Medium |
| Complexity | Simple | Complex |

Based on your needs, I recommend **Option A** for its simplicity.`,
    },
  },
}

// Story: Message with file context
export const MessageWithFileContext: Story = {
  args: {
    message: {
      ...baseUserMessage,
      content: 'Can you help me fix this function?',
      fileContext: [
        {
          path: '/home/user/project/src/utils/helpers.js',
          content: 'function calculate() { return 42; }',
        },
        {
          path: '/home/user/project/src/components/App.jsx',
          content: 'export const App = () => { return <div>Hello</div>; }',
        },
      ],
    },
  },
}

// Story: Long assistant message
export const LongAssistantMessage: Story = {
  args: {
    message: {
      ...baseAssistantMessage,
      content: `# Comprehensive Guide to React Hooks

## Introduction

React Hooks are functions that let you "hook into" React state and lifecycle features from function components. They were introduced in React 16.8 and have become the preferred way to write React components.

## Common Hooks

### useState

The \`useState\` hook lets you add state to functional components:

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

### useEffect

The \`useEffect\` hook lets you perform side effects in function components:

\`\`\`javascript
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\`

### useContext

Access context values without wrapping components:

\`\`\`javascript
const theme = useContext(ThemeContext);
\`\`\`

## Best Practices

1. **Call hooks at the top level** - Don't call hooks inside loops, conditions, or nested functions
2. **Only call hooks from React functions** - Don't call hooks from regular JavaScript functions
3. **Use custom hooks for reusable logic** - Extract component logic into reusable functions

## Conclusion

React Hooks provide a more direct API to the React concepts you already know. They offer a powerful way to compose behavior and reuse logic across your application.`,
    },
  },
}

// Story: Inline code
export const AssistantMessageInlineCode: Story = {
  args: {
    message: {
      ...baseAssistantMessage,
      content: 'You can use the \`useState\` hook to manage state, and \`useEffect\` for side effects. The \`return\` statement should come at the end of your component.',
    },
  },
}

