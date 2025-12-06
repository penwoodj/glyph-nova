/**
 * HomePage
 *
 * Main application page that integrates all three panels:
 * - Left: File Tree
 * - Center: Editor
 * - Right: Chat Interface
 */

import { useState } from 'react'
import { useQuery } from '@redwoodjs/web'
import { Metadata } from '@redwoodjs/web'
import { DesktopLayout } from 'src/components/Layouts/DesktopLayout/DesktopLayout'
import { FileTreeView } from 'src/components/FileTree/FileTreeView'
import { EditorPanel } from 'src/components/Editor/EditorPanel'
import { ChatInterface } from 'src/components/Chat/ChatInterface'
import { useAppStore } from 'src/state/store'

const DIRECTORY_QUERY = gql`
  query HomePageDirectoryQuery($path: String!) {
    directoryContents(path: $path) {
      files {
        name
        path
        type
        extension
        size
        modified
      }
      folders {
        name
        path
        type
        size
        modified
      }
    }
  }
`

const HomePage = () => {
  // Get initial folder path - use current project directory
  // This will be allowed by the backend's home directory whitelist
  const defaultPath = '/home/jon/code/llm-ui'
  const [rootPath, setRootPath] = useState(defaultPath)

  // Get panel widths from store
  const leftPanelWidth = useAppStore((state) => state.leftPanelWidth)
  const rightPanelWidth = useAppStore((state) => state.rightPanelWidth)
  const setLeftPanelWidth = useAppStore((state) => state.setLeftPanelWidth)
  const setRightPanelWidth = useAppStore((state) => state.setRightPanelWidth)
  const setOpenFolder = useAppStore((state) => state.setOpenFolder)

  // Load directory contents
  const { data, loading, error } = useQuery(DIRECTORY_QUERY, {
    variables: { path: rootPath },
    onCompleted: (data) => {
      console.log('✅ Query completed:', data)
      setOpenFolder(rootPath)
    },
    onError: (error) => {
      console.error('❌ Query error:', error)
    },
  })

  // Debug logging
  console.log('HomePage render:', { loading, error: error?.message, hasData: !!data, directoryContents: data?.directoryContents })

  return (
    <>
      <Metadata title="LLM UI" description="Desktop LLM Chat Application" />

      {loading && (
        <div className="flex h-screen w-screen items-center justify-center bg-vscode-bg text-vscode-fg">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-vscode-fg border-r-transparent"></div>
            <p className="text-sm">Loading application...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex h-screen w-screen items-center justify-center bg-vscode-bg text-vscode-fg">
          <div className="max-w-lg text-center">
            <div className="mb-4 text-4xl">⚠️</div>
            <p className="mb-2 text-lg">Failed to load directory</p>
            <p className="mb-4 text-sm opacity-60">{error.message}</p>
            <p className="text-xs opacity-40">
              Make sure the application has permission to access the file system
            </p>
          </div>
        </div>
      )}

      {data?.directoryContents && (
        <DesktopLayout
          leftPanel={
            <FileTreeView
              files={data.directoryContents.files || []}
              folders={data.directoryContents.folders || []}
              rootPath={rootPath}
            />
          }
          centerPanel={<EditorPanel />}
          rightPanel={<ChatInterface />}
          leftPanelWidth={leftPanelWidth}
          rightPanelWidth={rightPanelWidth}
          onLeftPanelResize={setLeftPanelWidth}
          onRightPanelResize={setRightPanelWidth}
        />
      )}

      {!loading && !error && !data?.directoryContents && (
        <div className="flex h-screen w-screen items-center justify-center bg-vscode-bg text-vscode-fg">
          <div className="max-w-lg text-center">
            <div className="mb-4 text-4xl">🔍</div>
            <p className="mb-2 text-lg">No directory data received</p>
            <p className="mb-4 text-sm opacity-60">
              The GraphQL query completed but returned null
            </p>
            <p className="text-xs opacity-40">
              Check browser console (F12) for errors. Path: {rootPath}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default HomePage

