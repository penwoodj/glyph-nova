/**
 * Edit Confirmation Dialog Component
 *
 * Dialog component for confirming file edits parsed from LLM responses.
 * Displays list of files to be edited, operation types, and preview of changes.
 *
 * Reference: Report 05 (Ollama Integration Patterns - File editing patterns)
 */

import type { EditRequest } from 'src/services/editor'

interface EditConfirmationDialogProps {
  edits: EditRequest[]
  onConfirm: () => void
  onCancel: () => void
}

export const EditConfirmationDialog = ({
  edits,
  onConfirm,
  onCancel,
}: EditConfirmationDialogProps) => {
  if (edits.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg border border-vscode-border bg-vscode-editor-bg p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4 border-b border-vscode-border pb-3">
          <h2 className="text-lg font-semibold text-vscode-fg">
            Confirm File Edits
          </h2>
          <p className="mt-1 text-sm text-vscode-fg-secondary">
            The following {edits.length} file{edits.length > 1 ? 's' : ''} will be
            modified:
          </p>
        </div>

        {/* Edit List */}
        <div className="mb-4 max-h-96 overflow-y-auto">
          {edits.map((edit, index) => (
            <div
              key={index}
              className="mb-3 rounded border border-vscode-border bg-vscode-sidebar-bg p-3"
            >
              {/* File Path */}
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium text-vscode-fg">
                  {edit.filePath}
                </span>
                <span className="rounded bg-vscode-button-bg px-2 py-0.5 text-xs text-vscode-button-fg">
                  {edit.operation}
                </span>
              </div>

              {/* Operation Details */}
              {edit.lineStart && (
                <div className="mb-1 text-xs text-vscode-fg-secondary">
                  {edit.operation === 'insert' && `Insert at line ${edit.lineStart}`}
                  {edit.operation === 'delete' &&
                    `Delete lines ${edit.lineStart}${edit.lineEnd && edit.lineEnd !== edit.lineStart ? `-${edit.lineEnd}` : ''}`}
                </div>
              )}

              {/* Content Preview */}
              {edit.content && (
                <div className="mt-2 rounded border border-vscode-border bg-vscode-input-bg p-2">
                  <div className="mb-1 text-xs font-medium text-vscode-fg-secondary">
                    Preview:
                  </div>
                  <pre className="max-h-32 overflow-auto text-xs text-vscode-fg">
                    {edit.content.length > 200
                      ? `${edit.content.substring(0, 200)}...`
                      : edit.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-vscode-border pt-4">
          <button
            onClick={onCancel}
            className="rounded border border-vscode-border bg-vscode-button-secondaryBg px-4 py-2 text-sm text-vscode-button-secondaryFg hover:bg-vscode-button-secondaryHoverBg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded border border-vscode-border bg-vscode-button-bg px-4 py-2 text-sm font-medium text-vscode-button-fg hover:bg-vscode-button-hoverBg"
          >
            Confirm & Apply Edits
          </button>
        </div>
      </div>
    </div>
  )
}
