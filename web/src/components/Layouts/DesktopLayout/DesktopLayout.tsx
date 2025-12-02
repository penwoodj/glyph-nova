import { useState, useCallback, useEffect } from 'react'

interface DesktopLayoutProps {
  leftPanel: React.ReactNode
  centerPanel: React.ReactNode
  rightPanel: React.ReactNode
  leftPanelWidth?: number
  rightPanelWidth?: number
  onLeftPanelResize?: (width: number) => void
  onRightPanelResize?: (width: number) => void
}

export const DesktopLayout = ({
  leftPanel,
  centerPanel,
  rightPanel,
  leftPanelWidth: initialLeftWidth = 250,
  rightPanelWidth: initialRightWidth = 400,
  onLeftPanelResize,
  onRightPanelResize,
}: DesktopLayoutProps) => {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth)
  const [rightWidth, setRightWidth] = useState(initialRightWidth)
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isResizingLeft) {
        const newWidth = e.clientX
        const minWidth = 150
        const maxWidth = 600
        const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
        setLeftWidth(clampedWidth)
        onLeftPanelResize?.(clampedWidth)
      }
      if (isResizingRight) {
        const newWidth = window.innerWidth - e.clientX
        const minWidth = 200
        const maxWidth = 800
        const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
        setRightWidth(clampedWidth)
        onRightPanelResize?.(clampedWidth)
      }
    },
    [isResizingLeft, isResizingRight, onLeftPanelResize, onRightPanelResize]
  )

  const handleMouseUp = useCallback(() => {
    setIsResizingLeft(false)
    setIsResizingRight(false)
  }, [])

  const handleLeftResizeStart = useCallback(() => {
    setIsResizingLeft(true)
  }, [])

  const handleRightResizeStart = useCallback(() => {
    setIsResizingRight(true)
  }, [])

  // Attach global mouse event listeners
  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizingLeft, isResizingRight, handleMouseMove, handleMouseUp])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-vscode-bg text-vscode-fg">
      {/* Left Panel - File Tree */}
      <div
        className="relative flex-shrink-0 border-r border-vscode-border bg-vscode-sidebar-bg"
        style={{ width: `${leftWidth}px` }}
      >
        {leftPanel}
        {/* Resize Handle */}
        <div
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-vscode-active-border transition-colors"
          onMouseDown={handleLeftResizeStart}
          role="separator"
          aria-label="Resize left panel"
        />
      </div>

      {/* Center Panel - Editor */}
      <div className="flex-1 flex flex-col overflow-hidden bg-vscode-editor-bg">
        {centerPanel}
      </div>

      {/* Right Panel - Chat */}
      <div
        className="relative flex-shrink-0 border-l border-vscode-border bg-vscode-sidebar-bg"
        style={{ width: `${rightWidth}px` }}
      >
        {/* Resize Handle */}
        <div
          className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-vscode-active-border transition-colors"
          onMouseDown={handleRightResizeStart}
          role="separator"
          aria-label="Resize right panel"
        />
        {rightPanel}
      </div>
    </div>
  )
}

export default DesktopLayout

