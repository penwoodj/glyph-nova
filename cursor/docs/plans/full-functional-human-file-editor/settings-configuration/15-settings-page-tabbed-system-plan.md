---
name: Settings Page Tabbed System Implementation Plan
overview: Create a comprehensive settings page with tabs for User Settings (global) and Folder Settings (workspace-specific), supporting various setting categories and persistence
todos: []
---

# Settings Page Tabbed System Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Create a comprehensive settings page with a tabbed interface separating User Settings (global, stored outside local folder) and Folder Settings (workspace-specific, stored in `.glyphnova/` folder). The settings page should support various setting categories (Editor, UI, Chat, etc.) and integrate with the existing Zustand store.

---

## Overview

This plan implements a settings page system that:
- Provides a tabbed interface with User Settings and Folder Settings tabs
- Stores user settings globally (localStorage or app data directory)
- Stores folder settings in `.glyphnova/settings.json` (workspace-specific)
- Supports multiple setting categories (Editor, UI, Chat, File Explorer, etc.)
- Integrates with existing Zustand store
- Provides search/filter functionality
- Matches VSCode settings page design patterns

**Target**: Professional settings page matching VSCode settings UI/UX
**Priority**: High (foundational for other features)
**Estimated Time**: 8-10 hours (with 20% buffer: 9.6-12 hours)
**Risk Level**: Medium (complex state management and file I/O)

---

## Current State Analysis

### Existing Implementation
- **No Settings Page**: No settings page exists
- **Zustand Store**: Some settings stored in localStorage via Zustand persist
- **No Folder Settings**: No workspace-specific settings
- **Routes**: Only HomePage and NotFoundPage routes exist
- **Settings Structure**: Basic UI preferences in store (panel widths, model)

### Gaps Identified
- No settings page UI
- No tabbed interface for user vs folder settings
- No folder settings file system
- No settings categories/organization
- No settings search functionality
- Limited settings currently stored

---

## External Documentation Links

### Settings UI Patterns
1. **VSCode Settings UI**
   - Link: https://code.visualstudio.com/docs/getstarted/settings
   - Description: VSCode settings page design and organization
   - Rating: High - Official VSCode documentation

2. **VSCode Settings File Locations**
   - Link: https://code.visualstudio.com/docs/getstarted/settings#_settings-file-locations
   - Description: Where VSCode stores user and workspace settings
   - Rating: High - Official VSCode documentation

3. **Material Design Settings Patterns**
   - Link: https://m3.material.io/components/settings/overview
   - Description: Material Design settings UI patterns
   - Rating: Medium - Design pattern reference

### File System & Persistence
4. **Node.js File System API**
   - Link: https://nodejs.org/api/fs.html
   - Description: Node.js file system operations
   - Rating: High - Node.js documentation

5. **JSON File Handling**
   - Link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
   - Description: JSON parsing and stringification
   - Rating: High - MDN documentation

6. **localStorage API**
   - Link: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   - Description: Browser localStorage for user settings
   - Rating: High - MDN documentation

### React Component Patterns
7. **React Tabs Component**
   - Link: https://react.dev/learn/conditional-rendering
   - Description: React patterns for tabbed interfaces
   - Rating: Medium - React documentation

8. **React Form Handling**
   - Link: https://react.dev/reference/react-dom/components/form
   - Description: React form components and handling
   - Rating: Medium - React documentation

### State Management
9. **Zustand Persist Middleware**
   - Link: https://github.com/pmndrs/zustand#persist-middleware
   - Description: Zustand persistence patterns
   - Rating: High - Zustand documentation

10. **React Context for Settings**
    - Link: https://react.dev/reference/react/useContext
    - Description: React Context for global settings
    - Rating: Medium - React documentation

---

## Implementation Phases

### Phase 1: Settings Page Structure & Routing (2-2.5 hours)

**Goal**: Create settings page component and routing.

#### 1.1 Create Settings Page Component
- [ ] Create `web/src/pages/SettingsPage/SettingsPage.tsx`:
  - [ ] Main settings page component
  - [ ] Tabbed interface structure
  - [ ] Layout matching VSCode settings
- [ ] Create settings page layout:
  - [ ] Header with title
  - [ ] Tab bar (User Settings / Folder Settings)
  - [ ] Settings content area
  - [ ] Search bar (optional)

#### 1.2 Add Route
- [ ] Update `web/src/Routes.tsx`:
  - [ ] Add route for `/settings`
  - [ ] Add route name `settings`
- [ ] Test navigation to settings page

#### 1.3 Tab Component
- [ ] Create tab switching logic:
  - [ ] State for active tab (`user` or `folder`)
  - [ ] Tab buttons with active state
  - [ ] Content switching based on active tab
- [ ] Style tabs to match VSCode:
  - [ ] Active tab highlighted
  - [ ] Hover states
  - [ ] Clear visual separation

**Success Criteria**:
- [ ] Settings page accessible at `/settings`
- [ ] Tabbed interface works
- [ ] Tabs switch correctly
- [ ] Layout matches VSCode design

---

### Phase 2: Settings Store & Data Structure (2-2.5 hours)

**Goal**: Create settings data structure and store management.

#### 2.1 Settings Interfaces
- [ ] Create `web/src/lib/settings.ts`:
  - [ ] Define `UserSettings` interface
  - [ ] Define `FolderSettings` interface
  - [ ] Define setting category interfaces
- [ ] Settings structure:
  ```typescript
  interface UserSettings {
    editor: {
      lineWrap: boolean
      fontSize: number
      fontFamily: string
      // ... other editor settings
    }
    ui: {
      theme: string
      panelWidths: { left: number; right: number }
      // ... other UI settings
    }
    chat: {
      defaultModel: string
      // ... other chat settings
    }
  }

  interface FolderSettings {
    editor?: {
      lineWrap?: boolean
      // ... folder-specific editor overrides
    }
    // ... other folder-specific settings
  }
  ```

#### 2.2 Settings Store
- [ ] Extend Zustand store:
  - [ ] Add `userSettings: UserSettings` state
  - [ ] Add `folderSettings: FolderSettings | null` state
  - [ ] Add settings actions (update, reset, etc.)
- [ ] Settings actions:
  - [ ] `updateUserSetting: (category, key, value) => void`
  - [ ] `updateFolderSetting: (category, key, value) => void`
  - [ ] `loadFolderSettings: (folderPath) => Promise<void>`
  - [ ] `saveFolderSettings: (folderPath) => Promise<void>`

#### 2.3 Settings Persistence
- [ ] User settings persistence:
  - [ ] Store in localStorage via Zustand persist
  - [ ] Or store in app data directory (Tauri)
- [ ] Folder settings persistence:
  - [ ] Store in `.glyphnova/settings.json`
  - [ ] Read/write via GraphQL file operations
  - [ ] Handle missing .glyphnova folder

**Success Criteria**:
- [ ] Settings interfaces defined
- [ ] Settings store created
- [ ] Persistence works for user settings
- [ ] Folder settings file structure defined

---

### Phase 3: Settings Categories & UI (2.5-3 hours)

**Goal**: Create settings category components and UI.

#### 3.1 Settings Category Components
- [ ] Create category components:
  - [ ] `EditorSettings.tsx` - Editor settings
  - [ ] `UISettings.tsx` - UI/Appearance settings
  - [ ] `ChatSettings.tsx` - Chat settings
  - [ ] `FileExplorerSettings.tsx` - File explorer settings
  - [ ] `GeneralSettings.tsx` - General settings
- [ ] Each category component:
  - [ ] Displays settings for that category
  - [ ] Handles user and folder settings
  - [ ] Shows which settings are user vs folder
  - [ ] Provides descriptions for each setting

#### 3.2 Setting Input Components
- [ ] Create reusable setting input components:
  - [ ] `ToggleSetting.tsx` - Boolean toggle
  - [ ] `TextSetting.tsx` - Text input
  - [ ] `NumberSetting.tsx` - Number input
  - [ ] `SelectSetting.tsx` - Dropdown select
- [ ] Setting input features:
  - [ ] Label and description
  - [ ] User vs folder setting indicator
  - [ ] Validation
  - [ ] Change handlers

#### 3.3 Settings Page Layout
- [ ] Organize settings in page:
  - [ ] Category sections with headers
  - [ ] Settings grouped by category
  - [ ] Clear visual hierarchy
  - [ ] Scrollable content area
- [ ] Match VSCode layout:
  - [ ] Left sidebar with categories (optional)
  - [ ] Or single scrollable page with sections
  - [ ] Search/filter functionality (optional)

**Success Criteria**:
- [ ] Settings categories display correctly
- [ ] Setting inputs work
- [ ] Layout matches VSCode design
- [ ] Settings organized clearly

---

### Phase 4: Folder Settings File I/O (1.5-2 hours)

**Goal**: Implement folder settings file read/write.

#### 4.1 GraphQL Mutations
- [ ] Create GraphQL mutations (if needed):
  - [ ] `readSettingsFile: (folderPath) => Settings`
  - [ ] `writeSettingsFile: (folderPath, settings) => void`
- [ ] Or use existing file operations:
  - [ ] Use `readFile` for `.glyphnova/settings.json`
  - [ ] Use `writeFile` for saving settings

#### 4.2 Settings File Service
- [ ] Create `web/src/services/settings.ts`:
  - [ ] `loadFolderSettings(folderPath): Promise<FolderSettings>`
  - [ ] `saveFolderSettings(folderPath, settings): Promise<void>`
  - [ ] Handle file not found (return defaults)
  - [ ] Handle JSON parsing errors
- [ ] Settings file location:
  - [ ] `.glyphnova/settings.json` in open folder
  - [ ] Create .glyphnova folder if needed
  - [ ] Validate JSON structure

#### 4.3 Settings Loading
- [ ] Load folder settings on folder open:
  - [ ] Detect when folder opens
  - [ ] Load `.glyphnova/settings.json`
  - [ ] Merge with user settings (folder overrides user)
  - [ ] Update store
- [ ] Settings saving:
  - [ ] Save on setting change (debounced)
  - [ ] Or save on explicit "Save" button
  - [ ] Handle save errors

**Success Criteria**:
- [ ] Folder settings load correctly
- [ ] Folder settings save correctly
- [ ] File I/O handles errors gracefully
- [ ] Settings merge correctly (folder overrides user)

---

### Phase 5: Integration & Testing (1-1.5 hours)

**Goal**: Complete integration and comprehensive testing.

#### 5.1 Settings Integration
- [ ] Integrate settings with existing features:
  - [ ] Editor settings (line wrap, etc.)
  - [ ] UI settings (panel widths, etc.)
  - [ ] Chat settings (default model, etc.)
- [ ] Update components to use settings:
  - [ ] Load settings on mount
  - [ ] Apply settings to components
  - [ ] Update settings when changed

#### 5.2 Settings Validation
- [ ] Add settings validation:
  - [ ] Validate setting values
  - [ ] Show validation errors
  - [ ] Prevent invalid settings
- [ ] Settings migration:
  - [ ] Handle settings format changes
  - [ ] Migrate old settings to new format
  - [ ] Provide defaults for missing settings

#### 5.3 Testing
- [ ] Test settings functionality:
  - [ ] User settings save/load
  - [ ] Folder settings save/load
  - [ ] Settings apply correctly
  - [ ] Settings merge correctly
- [ ] Test edge cases:
  - [ ] Missing .glyphnova folder
  - [ ] Invalid settings JSON
  - [ ] Missing settings file
  - [ ] Settings format changes

**Success Criteria**:
- [ ] Settings integrated with features
- [ ] Settings validation works
- [ ] All functionality tested
- [ ] Edge cases handled

---

## Dependencies

### Internal Dependencies
- **Zustand Store**: Existing store for state management
- **GraphQL API**: Existing file read/write operations
- **UI Foundation Plans**: Color theming and spacing systems
- **Routes**: Existing routing system

### External Dependencies
- **None**: Pure React/TypeScript implementation, no new dependencies

---

## Risk Assessment

### High Risk
- **Settings File I/O**: File operations might fail or have permission issues
  - **Mitigation**: Robust error handling, fallback to defaults, user-friendly error messages

### Medium Risk
- **Settings Merge Logic**: Complex logic for merging user and folder settings
  - **Mitigation**: Clear merge strategy, thorough testing, handle edge cases
- **State Management Complexity**: Managing settings state across components
  - **Mitigation**: Centralized store, clear data flow, proper state updates

### Low Risk
- **UI Components**: Standard React components
- **Routing**: Simple route addition

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Route removal**: Remove settings route, keep components for future
- **Feature flag**: Disable settings page, keep store structure

### Phase-Specific Rollback
- **Phase 1**: Remove settings page route, keep components
- **Phase 2**: Remove settings store extensions, keep basic structure
- **Phase 3**: Simplify UI, keep basic settings display
- **Phase 4**: Remove folder settings, keep user settings only

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore previous state
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (Structure)
- [ ] Settings page accessible
- [ ] Tabs work correctly
- [ ] Layout matches design
- [ ] Routing works

### After Phase 2 (Store)
- [ ] Settings interfaces defined
- [ ] Settings store created
- [ ] Persistence works
- [ ] Folder settings structure defined

### After Phase 3 (UI)
- [ ] Settings categories display
- [ ] Setting inputs work
- [ ] Layout complete
- [ ] Visual design matches target

### After Phase 4 (File I/O)
- [ ] Folder settings load
- [ ] Folder settings save
- [ ] File I/O handles errors
- [ ] Settings merge works

### After Phase 5 (Integration)
- [ ] Settings integrated
- [ ] Validation works
- [ ] All functionality tested
- [ ] Edge cases handled

---

## Success Criteria

1. **Settings Page**: Accessible at `/settings` route
2. **Tabbed Interface**: User Settings and Folder Settings tabs
3. **User Settings**: Stored globally (localStorage or app data)
4. **Folder Settings**: Stored in `.glyphnova/settings.json`
5. **Settings Categories**: Multiple categories (Editor, UI, Chat, etc.)
6. **Settings Inputs**: Various input types (toggle, text, number, select)
7. **Settings Persistence**: Settings save and load correctly
8. **Settings Merge**: Folder settings override user settings correctly
9. **Settings Integration**: Settings apply to features correctly
10. **Visual Design**: Matches VSCode settings page design
11. **Search Functionality**: Optional search/filter for settings
12. **Error Handling**: Graceful handling of file I/O errors
13. **Validation**: Settings values validated
14. **Documentation**: Settings documented with descriptions
15. **User Experience**: Intuitive and responsive settings page

---

## Code Examples

### Example: Settings Page Component
```tsx
// web/src/pages/SettingsPage/SettingsPage.tsx
import { useState } from 'react'
import { EditorSettings } from './EditorSettings'
import { UISettings } from './UISettings'
import { ChatSettings } from './ChatSettings'

type SettingsTab = 'user' | 'folder'

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('user')

  return (
    <div className="flex h-screen flex-col bg-vscode-editor-bg">
      {/* Header */}
      <div className="border-b border-vscode-border bg-vscode-sidebar-bg px-6 py-4">
        <h1 className="text-xl font-semibold text-vscode-fg">Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-vscode-border bg-vscode-sidebar-bg">
        <button
          onClick={() => setActiveTab('user')}
          className={cn(
            'px-6 py-3 text-sm font-medium transition-colors',
            activeTab === 'user'
              ? 'border-b-2 border-vscode-active-border text-vscode-fg'
              : 'text-vscode-fg-secondary hover:text-vscode-fg'
          )}
        >
          User Settings
        </button>
        <button
          onClick={() => setActiveTab('folder')}
          className={cn(
            'px-6 py-3 text-sm font-medium transition-colors',
            activeTab === 'folder'
              ? 'border-b-2 border-vscode-active-border text-vscode-fg'
              : 'text-vscode-fg-secondary hover:text-vscode-fg'
          )}
        >
          Folder Settings
        </button>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'user' ? (
          <UserSettingsContent />
        ) : (
          <FolderSettingsContent />
        )}
      </div>
    </div>
  )
}

const UserSettingsContent = () => (
  <div className="space-y-8">
    <EditorSettings type="user" />
    <UISettings type="user" />
    <ChatSettings type="user" />
  </div>
)

const FolderSettingsContent = () => (
  <div className="space-y-8">
    <EditorSettings type="folder" />
    <UISettings type="folder" />
    <ChatSettings type="folder" />
  </div>
)
```

### Example: Settings Store
```typescript
// web/src/state/store.ts
interface UserSettings {
  editor: {
    lineWrap: boolean
    fontSize: number
    fontFamily: string
  }
  ui: {
    theme: string
    panelWidths: { left: number; right: number }
  }
  chat: {
    defaultModel: string | null
  }
}

interface FolderSettings {
  editor?: {
    lineWrap?: boolean
  }
  ui?: {
    panelWidths?: { left?: number; right?: number }
  }
}

interface AppState {
  // ... existing state
  userSettings: UserSettings
  folderSettings: FolderSettings | null

  // Actions
  updateUserSetting: (category: string, key: string, value: any) => void
  updateFolderSetting: (category: string, key: string, value: any) => void
  loadFolderSettings: (folderPath: string) => Promise<void>
  saveFolderSettings: (folderPath: string) => Promise<void>
}

// In store implementation
userSettings: {
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
},
folderSettings: null,

updateUserSetting: (category, key, value) => set((state) => ({
  userSettings: {
    ...state.userSettings,
    [category]: {
      ...state.userSettings[category as keyof UserSettings],
      [key]: value,
    },
  },
})),

updateFolderSetting: (category, key, value) => set((state) => ({
  folderSettings: {
    ...(state.folderSettings || {}),
    [category]: {
      ...(state.folderSettings?.[category as keyof FolderSettings] || {}),
      [key]: value,
    },
  },
})),

loadFolderSettings: async (folderPath) => {
  // Load from .glyphnova/settings.json
  const settingsPath = `${folderPath}/.glyphnova/settings.json`
  // ... load logic
},

saveFolderSettings: async (folderPath) => {
  // Save to .glyphnova/settings.json
  const settingsPath = `${folderPath}/.glyphnova/settings.json`
  // ... save logic
},
```

### Example: Settings Category Component
```tsx
// web/src/pages/SettingsPage/EditorSettings.tsx
import { useAppStore } from 'src/state/store'
import { ToggleSetting, NumberSetting, TextSetting } from './SettingInputs'

interface EditorSettingsProps {
  type: 'user' | 'folder'
}

export const EditorSettings = ({ type }: EditorSettingsProps) => {
  const userSettings = useAppStore((state) => state.userSettings)
  const folderSettings = useAppStore((state) => state.folderSettings)
  const updateUserSetting = useAppStore((state) => state.updateUserSetting)
  const updateFolderSetting = useAppStore((state) => state.updateFolderSetting)

  const settings = type === 'user' ? userSettings : folderSettings
  const updateSetting = type === 'user' ? updateUserSetting : updateFolderSetting

  return (
    <div className="settings-category">
      <h2 className="mb-4 text-lg font-semibold text-vscode-fg">Editor</h2>

      <div className="space-y-4">
        <ToggleSetting
          label="Word Wrap"
          description="Enable word wrapping in the editor"
          value={settings?.editor?.lineWrap ?? userSettings.editor.lineWrap}
          onChange={(value) => updateSetting('editor', 'lineWrap', value)}
          isFolderSetting={type === 'folder'}
        />

        <NumberSetting
          label="Font Size"
          description="Editor font size in pixels"
          value={settings?.editor?.fontSize ?? userSettings.editor.fontSize}
          onChange={(value) => updateSetting('editor', 'fontSize', value)}
          min={8}
          max={72}
          isFolderSetting={type === 'folder'}
        />

        <TextSetting
          label="Font Family"
          description="Editor font family"
          value={settings?.editor?.fontFamily ?? userSettings.editor.fontFamily}
          onChange={(value) => updateSetting('editor', 'fontFamily', value)}
          isFolderSetting={type === 'folder'}
        />
      </div>
    </div>
  )
}
```

### Example: Setting Input Component
```tsx
// web/src/pages/SettingsPage/SettingInputs.tsx
interface ToggleSettingProps {
  label: string
  description?: string
  value: boolean
  onChange: (value: boolean) => void
  isFolderSetting?: boolean
}

export const ToggleSetting = ({
  label,
  description,
  value,
  onChange,
  isFolderSetting,
}: ToggleSettingProps) => {
  return (
    <div className="setting-item">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium text-vscode-fg">{label}</span>
            {isFolderSetting && (
              <span className="text-xs text-vscode-fg-secondary">(Folder)</span>
            )}
          </label>
          {description && (
            <p className="mt-1 text-xs text-vscode-fg-secondary">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Example: Folder Settings Service
```typescript
// web/src/services/settings.ts
import { apolloClient } from '@apollo/client'
import { gql } from '@apollo/client'
import type { FolderSettings } from 'src/lib/settings'

const READ_FILE_QUERY = gql`
  query ReadFile($path: String!) {
    readFile(path: $path)
  }
`

const WRITE_FILE_MUTATION = gql`
  mutation WriteFile($path: String!, $content: String!) {
    writeFile(path: $path, content: $content)
  }
`

export async function loadFolderSettings(
  folderPath: string
): Promise<FolderSettings | null> {
  const settingsPath = `${folderPath}/.glyphnova/settings.json`

  try {
    const { data } = await apolloClient.query({
      query: READ_FILE_QUERY,
      variables: { path: settingsPath },
    })

    if (!data.readFile) {
      return null
    }

    return JSON.parse(data.readFile) as FolderSettings
  } catch (error) {
    // File doesn't exist or invalid JSON
    return null
  }
}

export async function saveFolderSettings(
  folderPath: string,
  settings: FolderSettings
): Promise<void> {
  const settingsPath = `${folderPath}/.glyphnova/settings.json`
  const content = JSON.stringify(settings, null, 2)

  await apolloClient.mutate({
    mutation: WRITE_FILE_MUTATION,
    variables: { path: settingsPath, content },
  })
}
```

---

## Notes

- User settings should be global (stored outside project folder)
- Folder settings should be workspace-specific (in .glyphnova/)
- Folder settings should override user settings when both exist
- Settings should be validated before saving
- Settings page should be searchable (optional but improves UX)
- Settings should have clear descriptions
- Settings should be organized by category
- Settings file should be JSON format
- Handle missing .glyphnova folder gracefully
- Settings should apply immediately when changed (or on save)

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
