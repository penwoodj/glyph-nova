/**
 * ChatMessage Component
 *
 * Individual chat message component with markdown rendering and syntax highlighting.
 * Displays user and assistant messages with appropriate styling.
 *
 * Reference: Report 08 (Chat Interface Patterns - Message rendering section)
 */

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { ChatMessage as ChatMessageType } from 'src/state/store'

interface ChatMessageProps {
  message: ChatMessageType
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <div
      className={`mb-4 rounded-lg p-4 ${
        isUser
          ? 'ml-auto max-w-[80%] bg-vscode-button-bg text-vscode-button-fg'
          : 'mr-auto max-w-[95%] bg-vscode-sidebar-bg text-vscode-fg'
      }`}
    >
      {/* Message Header */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase opacity-75">
          {isUser ? 'You' : 'Assistant'}
        </span>
        <span className="text-xs opacity-50">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
        {message.isStreaming && (
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-vscode-fg-secondary"></span>
        )}
      </div>

      {/* Message Content */}
      <div className="prose prose-invert max-w-none">
        {isUser ? (
          // User messages: simple text with preserved formatting
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        ) : (
          // Assistant messages: markdown with syntax highlighting
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Code blocks with syntax highlighting
              code(props) {
                const { node, className, children, ...rest } = props
                const match = /language-(\w+)/.exec(className || '')
                const language = match ? match[1] : ''
                const inline = !match

                return !inline && language ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={language}
                    PreTag="div"
                    customStyle={{
                      margin: '0.5rem 0',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className={`${className || ''} rounded bg-black/30 px-1.5 py-0.5 text-sm`}
                  >
                    {children}
                  </code>
                )
              },
              // Paragraphs
              p({ children }) {
                return <p className="mb-2 text-sm leading-relaxed">{children}</p>
              },
              // Headings
              h1({ children }) {
                return (
                  <h1 className="mb-3 mt-4 text-xl font-bold">{children}</h1>
                )
              },
              h2({ children }) {
                return (
                  <h2 className="mb-2 mt-3 text-lg font-bold">{children}</h2>
                )
              },
              h3({ children }) {
                return (
                  <h3 className="mb-2 mt-3 text-base font-bold">{children}</h3>
                )
              },
              // Lists
              ul({ children }) {
                return (
                  <ul className="mb-2 ml-4 list-disc space-y-1 text-sm">
                    {children}
                  </ul>
                )
              },
              ol({ children }) {
                return (
                  <ol className="mb-2 ml-4 list-decimal space-y-1 text-sm">
                    {children}
                  </ol>
                )
              },
              li({ children }) {
                return <li className="leading-relaxed">{children}</li>
              },
              // Links
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    {children}
                  </a>
                )
              },
              // Blockquotes
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-4 border-vscode-fg-secondary pl-4 italic opacity-75">
                    {children}
                  </blockquote>
                )
              },
              // Tables
              table({ children }) {
                return (
                  <table className="mb-2 w-full border-collapse text-sm">
                    {children}
                  </table>
                )
              },
              thead({ children }) {
                return <thead className="bg-black/20">{children}</thead>
              },
              th({ children }) {
                return (
                  <th className="border border-vscode-border px-2 py-1 text-left font-semibold">
                    {children}
                  </th>
                )
              },
              td({ children }) {
                return (
                  <td className="border border-vscode-border px-2 py-1">
                    {children}
                  </td>
                )
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>

      {/* File Context (if present) */}
      {message.fileContext && message.fileContext.length > 0 && (
        <div className="mt-3 border-t border-vscode-border pt-3">
          <div className="mb-1 text-xs font-semibold uppercase opacity-75">
            File Context:
          </div>
          <div className="space-y-1 text-xs opacity-60">
            {message.fileContext.map((file, index) => (
              <div key={index}>{file.path}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatMessage

