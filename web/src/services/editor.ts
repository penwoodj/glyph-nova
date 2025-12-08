/**
 * Editor Service - Edit Request Parsing and Application
 *
 * Service for parsing file edit requests from LLM responses and applying them to files.
 * Handles multiple edit formats and validates requests before application.
 *
 * Reference: Report 05 (Ollama Integration Patterns - File editing patterns, lines 200-300)
 */

import { gql } from '@apollo/client'
import type { ApolloClient } from '@apollo/client'
import type { FileContext } from 'src/state/store'

/**
 * Edit request interface
 * Represents a single file edit operation parsed from LLM response
 */
export interface EditRequest {
  filePath: string
  operation: 'replace' | 'insert' | 'delete' | 'append'
  content?: string
  lineStart?: number
  lineEnd?: number
  originalContent?: string
}

/**
 * Edit parse result interface
 * Contains parsed edit requests and any errors/warnings encountered
 */
export interface EditParseResult {
  requests: EditRequest[]
  errors: string[]
  warnings: string[]
}

/**
 * Detect if LLM response contains file edit requests
 *
 * Looks for patterns like:
 * - "Edit file: /path/to/file"
 * - "Update /path/to/file with: ..."
 * - Code blocks with file paths
 * - Markdown file references
 *
 * @param response - The LLM response text to analyze
 * @returns true if edit requests are detected, false otherwise
 */
export const detectEditRequests = (response: string): boolean => {
  // Check for file path patterns
  const filePathPattern = /(?:file|path|edit|update|modify)[:\s]+([\/\w\.\-]+\.\w+)/gi
  // Check for code block markers with file paths
  const codeBlockPattern = /```(?:[\w]+:)?([\/\w\.\-]+\.\w+)/gi
  // Check for explicit edit keywords
  const editKeywords = /(?:edit|update|modify|change|replace|write)\s+(?:file|to)/gi

  return (
    filePathPattern.test(response) ||
    codeBlockPattern.test(response) ||
    editKeywords.test(response)
  )
}

/**
 * Parse edit requests from LLM response
 *
 * Handles multiple formats:
 * 1. Explicit edit instructions: "Edit /path/to/file: ..."
 * 2. Code blocks with file paths: ```typescript:/path/to/file
 * 3. Markdown file references: [file:/path/to/file]
 * 4. Inline file edits: "Update /path/to/file with: ..."
 *
 * @param response - The LLM response text to parse
 * @returns EditParseResult with parsed requests, errors, and warnings
 */
export const parseEditRequest = (response: string): EditParseResult => {
  const requests: EditRequest[] = []
  const errors: string[] = []
  const warnings: string[] = []

  // Pattern 1: Explicit edit instructions
  // Matches: "Edit /path/to/file:", "Update /path/to/file with:", etc.
  const explicitPattern =
    /(?:edit|update|modify|change|replace|write)\s+([\/\w\.\-]+\.\w+)[:\s]*(?:\n|```)?([\s\S]*?)(?:```|$)/gi
  let match
  while ((match = explicitPattern.exec(response)) !== null) {
    const filePath = match[1]?.trim()
    const content = match[2]?.trim()

    if (filePath) {
      requests.push({
        filePath,
        operation: 'replace', // Default to replace for explicit instructions
        content: content || '',
      })
    }
  }

  // Pattern 2: Code blocks with file paths
  // Matches: ```typescript:/path/to/file\n...content...\n```
  const codeBlockPattern = /```(?:[\w]+:)?([\/\w\.\-]+\.\w+)\n([\s\S]*?)```/gi
  while ((match = codeBlockPattern.exec(response)) !== null) {
    const filePath = match[1]?.trim()
    const content = match[2]?.trim()

    if (filePath) {
      // Check if this file was already added (avoid duplicates)
      const existing = requests.find((r) => r.filePath === filePath)
      if (!existing) {
        requests.push({
          filePath,
          operation: 'replace',
          content: content || '',
        })
      } else if (content && content !== existing.content) {
        // Update existing with new content if different
        existing.content = content
      }
    }
  }

  // Pattern 3: Markdown file references
  // Matches: [file:/path/to/file] followed by code block
  const markdownPattern = /\[file:([\/\w\.\-]+\.\w+)\][\s\S]*?```[\w]*\n([\s\S]*?)```/gi
  while ((match = markdownPattern.exec(response)) !== null) {
    const filePath = match[1]?.trim()
    const content = match[2]?.trim()

    if (filePath) {
      const existing = requests.find((r) => r.filePath === filePath)
      if (!existing) {
        requests.push({
          filePath,
          operation: 'replace',
          content: content || '',
        })
      } else if (content && content !== existing.content) {
        existing.content = content
      }
    }
  }

  // Pattern 4: Line-specific edits (e.g., "Insert at line 10:", "Delete lines 5-10")
  const lineInsertPattern = /(?:insert|add)\s+(?:at\s+)?line\s+(\d+)[:\s]*\n?([\s\S]*?)(?=\n\n|\n(?:edit|update|delete|insert|$))/gi
  while ((match = lineInsertPattern.exec(response)) !== null) {
    const lineNum = parseInt(match[1], 10)
    const content = match[2]?.trim()
    // Try to find associated file path from context
    const contextMatch = response.substring(0, match.index).match(/([\/\w\.\-]+\.\w+)/)
    if (contextMatch && content) {
      const filePath = contextMatch[1]
      requests.push({
        filePath,
        operation: 'insert',
        content,
        lineStart: lineNum,
      })
    }
  }

  const lineDeletePattern = /(?:delete|remove)\s+lines?\s+(\d+)(?:\s*-\s*(\d+))?/gi
  while ((match = lineDeletePattern.exec(response)) !== null) {
    const lineStart = parseInt(match[1], 10)
    const lineEnd = match[2] ? parseInt(match[2], 10) : lineStart
    const contextMatch = response.substring(0, match.index).match(/([\/\w\.\-]+\.\w+)/)
    if (contextMatch) {
      const filePath = contextMatch[1]
      requests.push({
        filePath,
        operation: 'delete',
        lineStart,
        lineEnd,
      })
    }
  }

  // Validate parsed requests
  for (const request of requests) {
    if (!request.filePath || !request.filePath.startsWith('/')) {
      errors.push(`Invalid file path: ${request.filePath}`)
    }
    if (!['replace', 'insert', 'delete', 'append'].includes(request.operation)) {
      errors.push(`Invalid operation: ${request.operation}`)
    }
  }

  return { requests, errors, warnings }
}

/**
 * Validate parsed edit request
 *
 * Checks:
 * - File paths are valid (absolute paths)
 * - File exists in available files list (if provided)
 * - Operation types are valid
 * - Line numbers are valid (if provided)
 *
 * @param request - The edit request to validate
 * @param availableFiles - Optional list of available file paths to check against
 * @returns Validation result with success status and any errors
 */
export const validateEditRequest = async (
  request: EditRequest,
  availableFiles?: string[]
): Promise<{ valid: boolean; errors: string[]; warnings?: string[] }> => {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate file path
  if (!request.filePath || !request.filePath.startsWith('/')) {
    errors.push('Invalid file path: must be absolute path')
  }

  // Check if file is in available files list (if provided)
  if (availableFiles && !availableFiles.includes(request.filePath)) {
    warnings.push(`File not found in workspace: ${request.filePath}`)
    // Note: This is a warning, not an error, as file might exist outside workspace
  }

  // Validate operation
  const validOperations = ['replace', 'insert', 'delete', 'append']
  if (!validOperations.includes(request.operation)) {
    errors.push(`Invalid operation: ${request.operation}`)
  }

  // Validate line numbers (if provided)
  if (request.lineStart !== undefined && request.lineStart < 1) {
    errors.push('Line numbers must be >= 1')
  }

  if (
    request.lineEnd !== undefined &&
    request.lineStart !== undefined &&
    request.lineEnd < request.lineStart
  ) {
    errors.push('Line end must be >= line start')
  }

  // Validate content for operations that require it
  if (
    (request.operation === 'replace' || request.operation === 'insert' || request.operation === 'append') &&
    request.content === undefined
  ) {
    errors.push(`Operation '${request.operation}' requires content`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

/**
 * Read file content via GraphQL query
 *
 * @param filePath - Absolute path to the file
 * @param client - Apollo Client instance
 * @returns File content as string
 */
const readFileContent = async (
  filePath: string,
  client: ApolloClient<any>
): Promise<string> => {
  const result = await client.query({
    query: gql`
      query ReadFile($path: String!) {
        readFile(path: $path) {
          content
        }
      }
    `,
    variables: { path: filePath },
    fetchPolicy: 'network-only', // Always fetch fresh content
  })

  return result.data.readFile.content
}

/**
 * Apply edit request to file via GraphQL mutation
 *
 * Uses existing writeFile mutation from api/src/graphql/files.ts.
 * Reads current file content first, applies the edit operation, then writes the file.
 *
 * @param edit - The edit request to apply
 * @param client - Apollo Client instance
 * @returns Success status and optional error message
 */
export const applyEdit = async (
  edit: EditRequest,
  client: ApolloClient<any>
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Read current file content first (for backup and edit operations)
    let currentContent = ''
    try {
      currentContent = await readFileContent(edit.filePath, client)
    } catch (error) {
      // File might not exist yet (for replace operation), that's okay
      if (edit.operation !== 'replace') {
        return {
          success: false,
          error: `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
        }
      }
    }

    // Apply edit operation
    let newContent: string
    switch (edit.operation) {
      case 'replace':
        newContent = edit.content || ''
        break

      case 'append':
        newContent = currentContent + '\n' + (edit.content || '')
        break

      case 'insert':
        // Insert at specific line
        const lines = currentContent.split('\n')
        const insertIndex = (edit.lineStart || 1) - 1
        if (insertIndex < 0 || insertIndex > lines.length) {
          return {
            success: false,
            error: `Invalid line number: ${edit.lineStart}. File has ${lines.length} lines.`,
          }
        }
        lines.splice(insertIndex, 0, edit.content || '')
        newContent = lines.join('\n')
        break

      case 'delete':
        // Delete lines
        const deleteLines = currentContent.split('\n')
        const deleteStart = (edit.lineStart || 1) - 1
        const deleteEnd = edit.lineEnd
          ? edit.lineEnd
          : edit.lineStart || 1
        if (deleteStart < 0 || deleteStart >= deleteLines.length) {
          return {
            success: false,
            error: `Invalid line range: ${edit.lineStart}-${deleteEnd}. File has ${deleteLines.length} lines.`,
          }
        }
        const deleteCount = deleteEnd - deleteStart + 1
        deleteLines.splice(deleteStart, deleteCount)
        newContent = deleteLines.join('\n')
        break

      default:
        return {
          success: false,
          error: `Unknown operation: ${edit.operation}`,
        }
    }

    // Write file via GraphQL mutation
    const result = await client.mutate({
      mutation: gql`
        mutation WriteFile($path: String!, $content: String!) {
          writeFile(path: $path, content: $content) {
            success
            path
            message
          }
        }
      `,
      variables: {
        path: edit.filePath,
        content: newContent,
      },
    })

    if (result.data.writeFile.success) {
      return { success: true }
    } else {
      return {
        success: false,
        error: result.data.writeFile.message || 'Failed to write file',
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
