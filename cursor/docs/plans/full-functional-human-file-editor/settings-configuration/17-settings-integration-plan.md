---
name: Settings Integration Across Features Implementation Plan
overview: Integrate settings system across all features (editor, UI, chat, file explorer, etc.), ensuring settings load correctly, apply to components, and persist changes
todos: []
---

# Settings Integration Across Features Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Integrate the settings system across all features in GlyphNova, ensuring that settings from the settings page are properly loaded, applied to components (editor, UI, chat, file explorer, etc.), and persist correctly. This includes migrating existing hardcoded preferences to the settings system.

---

## Overview

This plan integrates the settings system across all features:
- Load settings on app startup
- Apply settings to all components (editor, UI, chat, etc.)
- Migrate existing preferences to settings system
- Ensure settings persist correctly
- Handle settings updates in real-time
- Support user and folder settings merging
- Integrate with existing Zustand store

**Target**: Complete settings integration across all features
**Priority**: High (enables all settings functionality)
**Estimated Time**: 6-8 hours (with 20% buffer: 7.2-9.6 hours)
**Risk Level**: Medium (complex integration across many components)

---

## Current State Analysis

### Existing Implementation
- **Zustand Store**: Some preferences stored in localStorage
- **Hardcoded Preferences**: Panel widths, model selection, etc. in store
- **No Settings Integration**: Components don't read from settings
- **No Settings Loading**: Settings not loaded on startup
- **No Settings Application**: Settings not applied to components

### Gaps Identified
- Settings not integrated with components
- Existing preferences not migrated to settings
- Settings not loaded on app startup
- Settings changes don't apply in real-time
- No settings merging (user + folder)

---

## External Documentation Links

### Settings Integration Patterns
1. **VSCode Settings Application**
   - Link: https://code.visualstudio.com/docs/getstarted/settings
   - Description: How VSCode applies settings to features
   - Rating: High - Official VSCode documentation

2. **Zustand Store Integration**
   - Link: https://github.com/pmndrs/zustand#typescript
   - Description: Zustand TypeScript integration patterns
   - Rating: High - Zustand documentation

3. **React Context for Settings**
   - Link: https://react.dev/reference/react/useContext
   - Description: React Context for global settings
   - Rating: Medium - React documentation

### State Management
4. **React useEffect Hook**
   - Link: https://react.dev/reference/react/useEffect
   - Description: React useEffect for side effects
   - Rating: High - React documentation

5. **React useMemo Hook**
   - Link: https://react.dev/reference/react/useMemo
   - Description: React useMemo for computed values
   - Rating: Medium - React documentation

### Settings Persistence
6. **localStorage API**
   - Link: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   - Description: Browser localStorage for persistence
   - Rating: High - MDN documentation

7. **JSON File Handling**
   - Link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
   - Description: JSON parsing and stringification
   - Rating: High - MDN documentation

---

## Implementation Phases

### Phase 1: Settings Loading & Initialization (1.5-2 hours)

**Goal**: Load settings on app startup and initialize settings system.

#### 1.1 Settings Loading Service
- [ ] Create `web/src/services/settingsLoader.ts`:
  - [ ] `loadUserSettings(): Promise<UserSettings>`
  - [ ] `loadFolderSettings(folderPath: string): Promise<FolderSettings | null>`
  - [ ] `mergeSettings(user: UserSettings, folder: FolderSettings | null): UserSettings`
- [ ] Settings loading logic:
  - [ ] Load user settings from localStorage
  - [ ] Load folder settings from `.glyphnova/settings.json` (if folder open)
  - [ ] Merge settings (folder overrides user)
  - [ ] Return merged settings

#### 1.2 App Initialization
- [ ] Update app initialization:
  - [ ] Load settings on app mount
  - [ ] Update Zustand store with loaded settings
  - [ ] Handle loading errors gracefully
- [ ] Initialization in `App.tsx` or `HomePage.tsx`:
  ```typescript
  useEffect(() => {
    const initializeSettings = async () => {
      const userSettings = await loadUserSettings()
      const folderPath = useAppStore.getState().openFolderPath
      const folderSettings = folderPath
        ? await loadFolderSettings(folderPath)
        : null
      const merged = mergeSettings(userSettings, folderSettings)
      useAppStore.setState({ userSettings, folderSettings, mergedSettings: merged })
    }
    initializeSettings()
  }, [])
  ```

#### 1.3 Settings Migration
- [ ] Migrate existing preferences:
  - [ ] Panel widths → `ui.panelWidths`
  - [ ] Current model → `chat.defaultModel`
  - [ ] Other preferences → appropriate settings
- [ ] Migration logic:
  - [ ] Check for old preference format
  - [ ] Migrate to new settings format
  - [ ] Preserve user preferences
  - [ ] Clear old format after migration

**Success Criteria**:
- [ ] Settings load on app startup
- [ ] User and folder settings merge correctly
- [ ] Existing preferences migrated
- [ ] Settings stored in Zustand store

---

### Phase 2: Editor Settings Integration (1.5-2 hours)

**Goal**: Integrate editor settings with editor components.

#### 2.1 CodeEditor Integration
- [ ] Update `CodeEditor.tsx`:
  - [ ] Read `editor.lineWrap` from settings
  - [ ] Read `editor.fontSize` from settings
  - [ ] Read `editor.fontFamily` from settings
  - [ ] Apply settings to textarea/SyntaxHighlighter
- [ ] Settings application:
  ```typescript
  const mergedSettings = useAppStore((state) => state.mergedSettings)
  const lineWrap = mergedSettings?.editor?.lineWrap ?? false
  const fontSize = mergedSettings?.editor?.fontSize ?? 14
  const fontFamily = mergedSettings?.editor?.fontFamily ?? 'monospace'
  ```

#### 2.2 VditorEditor Integration
- [ ] Update `VditorEditor.tsx`:
  - [ ] Read editor settings
  - [ ] Apply to Vditor configuration
  - [ ] Update Vditor when settings change
- [ ] Settings updates:
  - [ ] Watch for settings changes
  - [ ] Update Vditor configuration
  - [ ] Re-initialize if needed

#### 2.3 Line Numbers Integration
- [ ] Update line numbers component (when implemented):
  - [ ] Read line number settings
  - [ ] Show/hide line numbers based on settings
  - [ ] Apply line number styling from settings

**Success Criteria**:
- [ ] Editor settings apply to CodeEditor
- [ ] Editor settings apply to VditorEditor
- [ ] Settings updates apply in real-time
- [ ] Line numbers respect settings

---

### Phase 3: UI Settings Integration (1.5-2 hours)

**Goal**: Integrate UI settings with UI components.

#### 3.1 Panel Widths Integration
- [ ] Update `DesktopLayout.tsx`:
  - [ ] Read `ui.panelWidths` from settings
  - [ ] Use settings for initial panel widths
  - [ ] Save panel width changes to settings
- [ ] Panel width handling:
  - [ ] Load from settings on mount
  - [ ] Update settings when user resizes
  - [ ] Support user and folder settings

#### 3.2 Theme Integration
- [ ] Update theme system:
  - [ ] Read `ui.theme` from settings
  - [ ] Apply theme on app load
  - [ ] Update theme when settings change
- [ ] Theme application:
  - [ ] Load theme CSS/variables
  - [ ] Apply to root element
  - [ ] Update all components

#### 3.3 Other UI Settings
- [ ] Integrate other UI settings:
  - [ ] File explorer settings
  - [ ] Chat panel settings
  - [ ] Editor panel settings
- [ ] Apply settings to components:
  - [ ] Read from merged settings
  - [ ] Apply on component mount
  - [ ] Update on settings change

**Success Criteria**:
- [ ] Panel widths load from settings
- [ ] Panel widths save to settings
- [ ] Theme applies from settings
- [ ] UI settings apply correctly

---

### Phase 4: Chat Settings Integration (1 hour)

**Goal**: Integrate chat settings with chat component.

#### 4.1 Default Model Integration
- [ ] Update `ChatInterface.tsx`:
  - [ ] Read `chat.defaultModel` from settings
  - [ ] Set default model on mount
  - [ ] Update model when settings change
- [ ] Model selection:
  - [ ] Use settings default if no model selected
  - [ ] Save model selection to settings
  - [ ] Support user and folder settings

#### 4.2 Chat UI Settings
- [ ] Integrate chat UI settings:
  - [ ] Chat panel width (from UI settings)
  - [ ] Chat font size (if added)
  - [ ] Chat theme (if added)
- [ ] Apply settings to chat component

**Success Criteria**:
- [ ] Default model loads from settings
- [ ] Model selection saves to settings
- [ ] Chat UI settings apply
- [ ] Settings updates work

---

### Phase 5: Settings Updates & Persistence (1.5-2 hours)

**Goal**: Handle settings updates and persistence.

#### 5.1 Settings Update Handler
- [ ] Create settings update service:
  - [ ] `updateUserSetting(category, key, value): Promise<void>`
  - [ ] `updateFolderSetting(category, key, value): Promise<void>`
  - [ ] Update Zustand store
  - [ ] Persist to storage
- [ ] Update logic:
  - [ ] Update store immediately
  - [ ] Persist to localStorage/file
  - [ ] Notify components of changes
  - [ ] Handle errors gracefully

#### 5.2 Real-Time Settings Updates
- [ ] Implement settings change notifications:
  - [ ] Components subscribe to settings changes
  - [ ] Components update when settings change
  - [ ] Use Zustand store subscriptions
- [ ] Update mechanism:
  ```typescript
  useEffect(() => {
    const unsubscribe = useAppStore.subscribe(
      (state) => state.mergedSettings,
      (settings) => {
        // Apply settings to component
        applySettings(settings)
      }
    )
    return unsubscribe
  }, [])
  ```

#### 5.3 Settings Persistence
- [ ] Ensure settings persist:
  - [ ] User settings → localStorage
  - [ ] Folder settings → `.glyphnova/settings.json`
  - [ ] Save on change (debounced)
  - [ ] Handle save errors
- [ ] Persistence strategy:
  - [ ] Immediate save for user settings
  - [ ] Debounced save for folder settings
  - [ ] Batch updates if needed
  - [ ] Error recovery

**Success Criteria**:
- [ ] Settings update correctly
- [ ] Settings persist correctly
- [ ] Real-time updates work
- [ ] Error handling works

---

## Dependencies

### Internal Dependencies
- **Settings Page**: Settings page for UI (from settings plan)
- **Settings Store**: Settings store structure (from settings plan)
- **Zustand Store**: Existing Zustand store
- **All Components**: Editor, UI, Chat, File Explorer components

### External Dependencies
- **None**: Pure React/TypeScript implementation

---

## Risk Assessment

### High Risk
- **Settings Migration**: Migrating existing preferences might lose data
  - **Mitigation**: Careful migration logic, backup old preferences, test thoroughly

### Medium Risk
- **Settings Application**: Complex integration across many components
  - **Mitigation**: Systematic integration, test each component, handle edge cases
- **Real-Time Updates**: Settings updates might cause performance issues
  - **Mitigation**: Optimize updates, use debouncing, minimize re-renders

### Low Risk
- **Settings Loading**: Standard file I/O operations
- **Settings Persistence**: Standard localStorage/JSON operations

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Feature flag**: Disable settings integration, restore hardcoded preferences
- **Component restoration**: Restore previous component implementations

### Phase-Specific Rollback
- **Phase 1**: Remove settings loading, keep hardcoded preferences
- **Phase 2**: Remove editor integration, keep editor defaults
- **Phase 3**: Remove UI integration, keep UI defaults
- **Phase 4**: Remove chat integration, keep chat defaults
- **Phase 5**: Remove real-time updates, keep manual refresh

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore previous state
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (Loading)
- [ ] Settings load on startup
- [ ] Settings merge correctly
- [ ] Preferences migrated
- [ ] Settings in store

### After Phase 2 (Editor)
- [ ] Editor settings apply
- [ ] Settings updates work
- [ ] All editor components integrated
- [ ] No regressions

### After Phase 3 (UI)
- [ ] UI settings apply
- [ ] Panel widths work
- [ ] Theme applies
- [ ] All UI components integrated

### After Phase 4 (Chat)
- [ ] Chat settings apply
- [ ] Default model works
- [ ] Chat UI settings work
- [ ] No regressions

### After Phase 5 (Updates)
- [ ] Settings update correctly
- [ ] Settings persist correctly
- [ ] Real-time updates work
- [ ] Error handling works

---

## Success Criteria

1. **Settings Loading**: Settings load on app startup
2. **Settings Merging**: User and folder settings merge correctly
3. **Editor Integration**: Editor settings apply to all editor components
4. **UI Integration**: UI settings apply to all UI components
5. **Chat Integration**: Chat settings apply to chat component
6. **Settings Updates**: Settings update in real-time
7. **Settings Persistence**: Settings persist correctly
8. **Migration**: Existing preferences migrated successfully
9. **No Regressions**: All existing functionality works
10. **Performance**: Settings updates don't impact performance
11. **Error Handling**: Settings errors handled gracefully
12. **User Experience**: Settings apply smoothly and intuitively
13. **Documentation**: Settings integration documented
14. **Testing**: All settings tested and working
15. **Completeness**: All features integrated with settings

---

## Code Examples

### Example: Settings Loader Service
```typescript
// web/src/services/settingsLoader.ts
import { useAppStore } from 'src/state/store'
import { loadFolderSettings } from './settings'
import type { UserSettings, FolderSettings } from 'src/lib/settings'

export async function loadUserSettings(): Promise<UserSettings> {
  // Load from localStorage
  const stored = localStorage.getItem('glyph-nova-user-settings')
  if (stored) {
    try {
      return JSON.parse(stored) as UserSettings
    } catch {
      // Invalid JSON, use defaults
    }
  }

  // Return defaults
  return getDefaultUserSettings()
}

export async function loadAndMergeSettings(
  folderPath: string | null
): Promise<UserSettings> {
  const userSettings = await loadUserSettings()

  if (!folderPath) {
    return userSettings
  }

  const folderSettings = await loadFolderSettings(folderPath)
  return mergeSettings(userSettings, folderSettings)
}

function mergeSettings(
  user: UserSettings,
  folder: FolderSettings | null
): UserSettings {
  if (!folder) return user

  return {
    editor: {
      ...user.editor,
      ...folder.editor,
    },
    ui: {
      ...user.ui,
      ...folder.ui,
    },
    chat: {
      ...user.chat,
      ...folder.chat,
    },
  }
}

function getDefaultUserSettings(): UserSettings {
  return {
    editor: {
      lineWrap: false,
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    },
    ui: {
      theme: 'dark',
      panelWidths: { left: 300, right: 400 },
    },
    chat: {
      defaultModel: null,
    },
  }
}
```

### Example: App Initialization
```tsx
// web/src/App.tsx or web/src/pages/HomePage/HomePage.tsx
import { useEffect } from 'react'
import { useAppStore } from 'src/state/store'
import { loadAndMergeSettings } from 'src/services/settingsLoader'

export const App = () => {
  const openFolderPath = useAppStore((state) => state.openFolderPath)
  const setMergedSettings = useAppStore((state) => state.setMergedSettings)

  useEffect(() => {
    const initializeSettings = async () => {
      const merged = await loadAndMergeSettings(openFolderPath)
      setMergedSettings(merged)
    }
    initializeSettings()
  }, [openFolderPath, setMergedSettings])

  // ... rest of app
}
```

### Example: Editor Settings Integration
```tsx
// web/src/components/Editor/CodeEditor.tsx
import { useAppStore } from 'src/state/store'

export const CodeEditor = ({ ... }: CodeEditorProps) => {
  const mergedSettings = useAppStore((state) => state.mergedSettings)

  const lineWrap = mergedSettings?.editor?.lineWrap ?? false
  const fontSize = mergedSettings?.editor?.fontSize ?? 14
  const fontFamily = mergedSettings?.editor?.fontFamily ?? 'monospace'

  return (
    <textarea
      style={{
        whiteSpace: lineWrap ? 'pre-wrap' : 'pre',
        fontSize: `${fontSize}px`,
        fontFamily,
      }}
      // ... other props
    />
  )
}
```

### Example: Settings Update Service
```typescript
// web/src/services/settingsUpdater.ts
import { useAppStore } from 'src/state/store'
import { saveFolderSettings } from './settings'
import type { UserSettings, FolderSettings } from 'src/lib/settings'

export async function updateUserSetting(
  category: string,
  key: string,
  value: any
): Promise<void> {
  const store = useAppStore.getState()
  const currentSettings = store.userSettings || {}

  const updated = {
    ...currentSettings,
    [category]: {
      ...currentSettings[category as keyof UserSettings],
      [key]: value,
    },
  }

  // Update store
  useAppStore.setState({ userSettings: updated })

  // Persist to localStorage
  localStorage.setItem('glyph-nova-user-settings', JSON.stringify(updated))

  // Re-merge settings
  const folderPath = store.openFolderPath
  if (folderPath) {
    const folderSettings = store.folderSettings
    const merged = mergeSettings(updated, folderSettings)
    useAppStore.setState({ mergedSettings: merged })
  } else {
    useAppStore.setState({ mergedSettings: updated })
  }
}

export async function updateFolderSetting(
  category: string,
  key: string,
  value: any
): Promise<void> {
  const store = useAppStore.getState()
  const folderPath = store.openFolderPath

  if (!folderPath) {
    throw new Error('No folder open')
  }

  const currentSettings = store.folderSettings || {}

  const updated: FolderSettings = {
    ...currentSettings,
    [category]: {
      ...currentSettings[category as keyof FolderSettings],
      [key]: value,
    },
  }

  // Update store
  useAppStore.setState({ folderSettings: updated })

  // Persist to file
  await saveFolderSettings(folderPath, updated)

  // Re-merge settings
  const userSettings = store.userSettings
  const merged = mergeSettings(userSettings, updated)
  useAppStore.setState({ mergedSettings: merged })
}
```

### Example: Real-Time Settings Updates
```tsx
// web/src/components/Editor/CodeEditor.tsx
import { useEffect } from 'react'
import { useAppStore } from 'src/state/store'

export const CodeEditor = ({ ... }: CodeEditorProps) => {
  const mergedSettings = useAppStore((state) => state.mergedSettings)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  // Apply settings when they change
  useEffect(() => {
    if (!editorRef.current) return

    const editor = editorRef.current
    const settings = mergedSettings?.editor

    if (settings) {
      editor.style.whiteSpace = settings.lineWrap ? 'pre-wrap' : 'pre'
      editor.style.fontSize = `${settings.fontSize || 14}px`
      editor.style.fontFamily = settings.fontFamily || 'monospace'
    }
  }, [mergedSettings])

  return (
    <textarea
      ref={editorRef}
      // ... other props
    />
  )
}
```

---

## Notes

- Settings should load before components render
- Settings merging: folder overrides user
- Settings updates should be immediate in UI
- Settings persistence should be reliable
- Handle missing settings gracefully (use defaults)
- Test settings migration carefully
- Settings updates should not cause performance issues
- All components should read from merged settings
- Settings changes should apply in real-time
- Error handling is critical for settings persistence

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
