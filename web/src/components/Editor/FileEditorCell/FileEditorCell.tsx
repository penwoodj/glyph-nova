/**
 * FileEditorCell Component
 *
 * Redwood.js Cell component for loading and displaying file content in the editor.
 * Handles loading, error, and empty states using the Cell pattern.
 *
 * Reference: Report 01 (Redwood.js Comprehensive Guide - Cells pattern section)
 */

import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'
import { UnifiedEditor } from '../UnifiedEditor'

export const QUERY = gql`
  query FileEditorQuery($path: String!) {
    readFile(path: $path) {
      path
      content
      encoding
    }
  }
`

// Loading state - shown while file is being loaded
export const Loading = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-vscode-editor-bg">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-vscode-fg border-r-transparent"></div>
        <p className="text-sm text-vscode-fg opacity-60">Loading file...</p>
      </div>
    </div>
  )
}

// Empty state - shown if file has no content (unlikely for readFile, but good practice)
export const Empty = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-vscode-editor-bg">
      <div className="text-center">
        <p className="text-lg text-vscode-fg opacity-60">File is empty</p>
        <p className="mt-2 text-sm text-vscode-fg opacity-40">
          Start editing to add content
        </p>
      </div>
    </div>
  )
}

// Failure state - shown if file loading fails
export const Failure = ({ error }: CellFailureProps) => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-vscode-editor-bg">
      <div className="max-w-lg text-center">
        <div className="mb-4 text-4xl">⚠️</div>
        <p className="mb-2 text-lg text-vscode-fg">Failed to load file</p>
        <p className="mb-4 text-sm text-vscode-fg opacity-60">
          {error?.message || 'An unknown error occurred'}
        </p>
        <p className="text-xs text-vscode-fg opacity-40">
          The file may not exist, or you may not have permission to read it
        </p>
      </div>
    </div>
  )
}

// Success state - shown when file is successfully loaded
interface FileEditorSuccessProps extends CellSuccessProps {
  readFile: {
    path: string
    content: string
    encoding?: string
  }
  onChange?: (content: string) => void
  onSave?: (content: string) => void
  readonly?: boolean
}

export const Success = ({
  readFile,
  onChange,
  onSave,
  readonly = false,
}: FileEditorSuccessProps) => {
  return (
    <UnifiedEditor
      content={readFile.content}
      filePath={readFile.path}
      onChange={onChange}
      onSave={onSave}
      readonly={readonly}
      height="100%"
    />
  )
}

