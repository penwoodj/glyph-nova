/**
 * EditorPanel Component
 *
 * Main editor panel that listens to the store for selected file changes
 * and loads the appropriate editor. Manages file editing state and saving.
 *
 * Reference: Report 09 (Desktop App Architecture - Cross-panel communication section)
 */

import { useCallback, useEffect, useState } from 'react'
import { useMutation } from '@redwoodjs/web'
import { gql } from '@apollo/client'
import { useAppStore } from 'src/state/store'
import FileEditorCell from './FileEditorCell'
import { UnifiedEditor } from './UnifiedEditor'

const WRITE_FILE_MUTATION = gql`
  mutation WriteFileMutation($path: String!, $content: String!) {
    writeFile(path: $path, content: $content) {
      success
      path
      message
    }
  }
`

export const EditorPanel = () => {
  const selectedFilePath = useAppStore((state) => state.selectedFilePath)
  const setUnsavedChanges = useAppStore((state) => state.setUnsavedChanges)
  const lastFileEdit = useAppStore((state) => state.lastFileEdit)
  const [refreshKey, setRefreshKey] = useState(0)

  const [writeFile] = useMutation(WRITE_FILE_MUTATION)

  // Watch for file edits and refresh editor if current file was edited
  useEffect(() => {
    if (
      lastFileEdit &&
      selectedFilePath &&
      lastFileEdit.filePath === selectedFilePath
    ) {
      // Force refresh by updating key, which will remount FileEditorCell and refetch
      setRefreshKey((prev) => prev + 1)
      // Clear unsaved changes since file was updated externally
      setUnsavedChanges(false)
    }
  }, [lastFileEdit, selectedFilePath, setUnsavedChanges])

  const handleSave = useCallback(
    async (content: string) => {
      if (!selectedFilePath) return

      try {
        const result = await writeFile({
          variables: {
            path: selectedFilePath,
            content,
          },
        })

        if (result.data?.writeFile?.success) {
          setUnsavedChanges(false)
          console.log('File saved successfully:', selectedFilePath)
        } else {
          console.error('Failed to save file:', result.data?.writeFile?.message)
          alert(`Failed to save file: ${result.data?.writeFile?.message}`)
        }
      } catch (error) {
        console.error('Error saving file:', error)
        alert(`Error saving file: ${error instanceof Error ? error.message : String(error)}`)
      }
    },
    [selectedFilePath, writeFile, setUnsavedChanges]
  )

  const handleChange = useCallback(
    (_content: string) => {
      setUnsavedChanges(true)
    },
    [setUnsavedChanges]
  )

  // No file selected - show placeholder
  if (!selectedFilePath) {
    return (
      <UnifiedEditor
        content=""
        filePath={undefined}
        placeholder="Select a file to view or edit..."
      />
    )
  }

  // File selected - load and display with FileEditorCell
  // Use refreshKey to force remount when file is edited externally
  return (
    <FileEditorCell
      key={`${selectedFilePath}-${refreshKey}`}
      path={selectedFilePath}
      onChange={handleChange}
      onSave={handleSave}
    />
  )
}

export default EditorPanel

