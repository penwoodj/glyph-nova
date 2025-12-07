/**
 * Application State Management Store
 *
 * Zustand store for managing global application state across components.
 * Handles file selection, folder state, chat state, and UI preferences.
 *
 * Reference: Report 09 (Desktop App Architecture - State management section)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// State interface
interface AppState {
  // File/Folder State
  selectedFilePath: string | null
  openFolderPath: string | null
  unsavedChanges: boolean

  // Chat State
  chatMessages: ChatMessage[]
  currentModel: string | null

  // UI State
  leftPanelWidth: number
  rightPanelWidth: number

  // Actions
  setSelectedFile: (path: string | null) => void
  setOpenFolder: (path: string | null) => void
  setUnsavedChanges: (hasChanges: boolean) => void
  addChatMessage: (message: ChatMessage) => void
  clearChatMessages: () => void
  setCurrentModel: (model: string | null) => void
  setLeftPanelWidth: (width: number) => void
  setRightPanelWidth: (width: number) => void
}

// Chat message interface
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  fileContext?: FileContext[]
  isStreaming?: boolean
}

// File context interface
export interface FileContext {
  path: string
  content: string
}

// Create the store with persistence for UI preferences
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      selectedFilePath: null,
      openFolderPath: null,
      unsavedChanges: false,
      chatMessages: [],
      currentModel: null,
      leftPanelWidth: 300,
      rightPanelWidth: 400,

      // Actions
      setSelectedFile: (path) => set({ selectedFilePath: path }),

      setOpenFolder: (path) =>
        set({
          openFolderPath: path,
          selectedFilePath: null, // Clear selected file when changing folders
        }),

      setUnsavedChanges: (hasChanges) => set({ unsavedChanges: hasChanges }),

      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),

      clearChatMessages: () => set({ chatMessages: [] }),

      setCurrentModel: (model) => set({ currentModel: model }),

      setLeftPanelWidth: (width) => set({ leftPanelWidth: width }),

      setRightPanelWidth: (width) => set({ rightPanelWidth: width }),
    }),
    {
      name: 'glyph-nova-storage', // localStorage key
      partialize: (state) => ({
        // Only persist UI preferences, not file/chat state
        leftPanelWidth: state.leftPanelWidth,
        rightPanelWidth: state.rightPanelWidth,
        currentModel: state.currentModel,
      }),
    }
  )
)

