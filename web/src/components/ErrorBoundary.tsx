/**
 * Error Boundary Component
 *
 * React Error Boundary for catching and displaying component errors gracefully.
 * Prevents the entire app from crashing when a component error occurs.
 *
 * Reference: Report 09 (Desktop App Architecture - Error handling section)
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Update state with error info
    this.state = {
      hasError: true,
      error,
      errorInfo,
    }

    // TODO: Send error to error reporting service (e.g., Sentry)
    // Example: errorReportingService.captureException(error, { extra: errorInfo })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI with VSCode theme
      return (
        <div className="flex h-full w-full items-center justify-center bg-vscode-editor-bg p-8">
          <div className="w-full max-w-2xl rounded-lg border border-vscode-border bg-vscode-sidebar-bg p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-vscode-fg">
                  Something went wrong
                </h2>
                <p className="text-sm text-vscode-fg-secondary">
                  An error occurred while rendering this component
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-4 rounded border border-vscode-border bg-vscode-input-bg p-4">
                <div className="mb-2 text-xs font-semibold uppercase text-vscode-fg-secondary">
                  Error Details
                </div>
                <div className="font-mono text-sm text-red-400">
                  {this.state.error.toString()}
                </div>
                {this.state.errorInfo && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-vscode-fg-secondary hover:text-vscode-fg">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 max-h-48 overflow-auto rounded bg-vscode-editor-bg p-2 text-xs text-vscode-fg-secondary">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="rounded border border-vscode-border bg-vscode-button-bg px-4 py-2 text-sm font-medium text-vscode-button-fg transition-colors hover:bg-vscode-button-hover-bg"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded border border-vscode-border bg-vscode-button-secondaryBg px-4 py-2 text-sm text-vscode-button-secondaryFg transition-colors hover:bg-vscode-button-secondaryHoverBg"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
