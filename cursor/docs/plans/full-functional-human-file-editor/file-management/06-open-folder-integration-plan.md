---
name: Open Folder Integration Implementation Plan
overview: Implement open folder functionality with folder picker dialog, file tree loading, and VSCode/Cursor-style icon buttons in file navigation menu
todos: []
---

# Open Folder Integration Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Implement open folder functionality that allows users to select a folder via native dialog, load it into the file navigation menu, and display it in the file tree. Add "Open Folder" icon button alongside "Collapse All" button in file tree header, matching VSCode/Cursor design patterns.

---

## Overview

This plan implements open folder functionality for GlyphNova that enables:
- "Open Folder" icon button in file tree header (alongside Collapse All)
- Native folder picker dialog using Tauri's dialog plugin
- Loading selected folder into file tree
- Updating application state with new root folder
- Clearing previous folder state when new folder opened
- Integration with existing file tree and state management

**Target**: Professional open folder functionality matching VSCode/Cursor design patterns
**Priority**: High (core file management functionality)
**Estimated Time**: 4-6 hours (with 20% buffer: 4.8-7.2 hours)
**Risk Level**: Medium (requires Tauri integration and state management)

---

## Current State Analysis

### Existing Implementation
- **Hardcoded Path**: `HomePage.tsx` uses hardcoded default path `/home/jon/code/glyph-nova`
- **State Management**: Zustand store has `openFolderPath` and `setOpenFolder` action
- **File Tree**: `FileTreeView.tsx` displays files from `rootPath` prop
- **Collapse All Button**: File tree has "Collapse All" functionality
- **No Folder Picker**: No UI for selecting/opening a folder

### Gaps Identified
- No "Open Folder" button in file tree header
- No folder picker dialog
- No way to change the root folder after initial load
- Hardcoded default path instead of user selection
- Missing Tauri dialog plugin integration

---

## External Documentation Links

### Tauri Dialog Plugin
1. **Tauri Dialog Plugin Documentation**
   - Link: https://v2.tauri.app/plugin/dialog/
   - Description: Official Tauri dialog plugin for file and directory selection
   - Rating: High - Official Tauri documentation

2. **Tauri Dialog Plugin Installation**
   - Link: https://v2.tauri.app/plugin/dialog/#installation
   - Description: Installation instructions for Tauri dialog plugin
   - Rating: High - Official installation guide

3. **Tauri Dialog API Reference**
   - Link: https://v2.tauri.app/plugin/dialog/api/js/
   - Description: Complete API reference for dialog plugin
   - Rating: High - Official API documentation

### VSCode Folder Selection Patterns
4. **VSCode Open Folder Dialog**
   - Link: https://code.visualstudio.com/docs/getstarted/userinterface#_opening-folders
   - Description: VSCode's open folder functionality and patterns
   - Rating: High - Official VSCode documentation

5. **VSCode Window API - Open Dialog**
   - Link: https://code.visualstudio.com/api/references/vscode-api#window.showOpenDialog
   - Description: VSCode extension API for folder selection dialogs
   - Rating: Medium - Extension API reference (for pattern understanding)

### File System Integration
6. **Tauri File System API**
   - Link: https://v2.tauri.app/plugin/fs/
   - Description: Tauri file system plugin for file operations
   - Rating: Medium - May be needed for folder validation

7. **Node.js Path Module**
   - Link: https://nodejs.org/api/path.html
   - Description: Node.js path utilities for path manipulation
   - Rating: High - Official Node.js documentation

### UI/UX Design
8. **VSCode UI/UX Design Principles**
   - Link: https://github.com/microsoft/vscode/wiki/UX-Guidelines
   - Description: VSCode's official UX guidelines
   - Rating: High - Official design guidelines

9. **Material Design Icon Buttons**
   - Link: https://m3.material.io/components/icon-buttons/overview
   - Description: Material Design icon button patterns
   - Rating: Medium - Design pattern reference

### State Management
10. **Zustand Documentation**
    - Link: https://docs.pmnd.rs/zustand/
    - Description: Lightweight state management for React
    - Rating: High - Official Zustand documentation

11. **React State Updates**
    - Link: https://react.dev/learn/queueing-a-series-of-state-updates
    - Description: React state update patterns and best practices
    - Rating: Medium - React documentation

---

## Implementation Phases

### Phase 1: Tauri Dialog Plugin Setup (1-1.5 hours)

**Goal**: Install and configure Tauri dialog plugin for folder selection.

#### 1.1 Install Dialog Plugin
- [ ] Install Tauri dialog plugin:
  ```bash
  cd src-tauri
  cargo add tauri-plugin-dialog
  ```
- [ ] Or use Tauri CLI:
  ```bash
  npm run tauri add dialog
  ```
- [ ] Verify plugin installation in `src-tauri/Cargo.toml`
- [ ] Update `src-tauri/tauri.conf.json` to include dialog plugin:
  - [ ] Add plugin to `plugins` array
  - [ ] Configure permissions if needed

#### 1.2 Frontend Dialog Integration
- [ ] Install frontend dialog package (if needed):
  ```bash
  yarn add @tauri-apps/plugin-dialog
  ```
- [ ] Create `web/src/lib/tauriDialog.ts` utility file:
  - [ ] Import dialog functions from `@tauri-apps/plugin-dialog`
  - [ ] Create `openFolderDialog()` function:
    ```typescript
    export async function openFolderDialog(): Promise<string | null> {
      const { open } = await import('@tauri-apps/plugin-dialog')
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Folder',
      })
      return selected ? (Array.isArray(selected) ? selected[0] : selected) : null
    }
    ```
  - [ ] Handle errors gracefully
  - [ ] Return null if user cancels

#### 1.3 Test Dialog Integration
- [ ] Test folder picker dialog opens
- [ ] Test folder selection works
- [ ] Test cancel behavior
- [ ] Verify path is returned correctly

**Success Criteria**:
- [ ] Tauri dialog plugin installed and configured
- [ ] Frontend can call folder picker dialog
- [ ] Dialog opens and returns selected folder path
- [ ] Error handling works correctly

---

### Phase 2: Open Folder Button UI (1-1.5 hours)

**Goal**: Add "Open Folder" icon button to file tree header.

#### 2.1 Create File Tree Header Component
- [ ] Create `web/src/components/FileTree/FileTreeHeader.tsx` component
  - [ ] Header container with icon buttons
  - [ ] "Collapse All" button (existing functionality)
  - [ ] "Open Folder" button (new)
  - [ ] Proper spacing and alignment
  - [ ] VSCode-style icon button design
- [ ] Style header to match VSCode file explorer header:
  - [ ] Background color matching sidebar
  - [ ] Border bottom for separation
  - [ ] Icon buttons with hover states
  - [ ] Proper padding and spacing

#### 2.2 Add Icon Buttons
- [ ] Install icon library (if not already installed):
  - [ ] Use existing icon library (e.g., lucide-react, heroicons)
  - [ ] Or add icon library: `yarn add lucide-react`
- [ ] Add "Open Folder" icon button:
  - [ ] Folder icon (e.g., `FolderOpen` from lucide-react)
  - [ ] Click handler to open folder dialog
  - [ ] Hover state styling
  - [ ] Tooltip: "Open Folder"
- [ ] Update "Collapse All" button:
  - [ ] Ensure it's an icon button (not text)
  - [ ] Match styling with Open Folder button
  - [ ] Proper icon (e.g., `ChevronsDownUp` or similar)

#### 2.3 Integrate Header with File Tree
- [ ] Update `FileTreeView.tsx` to include header:
  - [ ] Import `FileTreeHeader` component
  - [ ] Render header above file tree content
  - [ ] Pass necessary props (onCollapseAll, onOpenFolder)
- [ ] Ensure header is fixed/sticky at top of file tree panel

**Success Criteria**:
- [ ] File tree header component created
- [ ] "Open Folder" icon button visible and styled
- [ ] "Collapse All" button converted to icon button
- [ ] Header matches VSCode design patterns
- [ ] Header integrated with file tree component

---

### Phase 3: Folder Selection Logic (1.5-2 hours)

**Goal**: Implement folder selection and loading logic.

#### 3.1 Open Folder Handler
- [ ] Create `handleOpenFolder` function in `FileTreeView.tsx` or parent component:
  - [ ] Call `openFolderDialog()` from utility
  - [ ] Handle async dialog result
  - [ ] Validate selected folder path
  - [ ] Update store with new folder path
  - [ ] Trigger file tree reload
- [ ] Add error handling:
  - [ ] Handle dialog cancellation (user clicks cancel)
  - [ ] Handle invalid folder paths
  - [ ] Handle permission errors
  - [ ] Show user-friendly error messages

#### 3.2 Update State Management
- [ ] Update `HomePage.tsx` to handle folder changes:
  - [ ] Remove hardcoded default path
  - [ ] Use `openFolderPath` from store
  - [ ] Reload directory query when folder changes
  - [ ] Handle initial state (no folder selected)
- [ ] Update store actions if needed:
  - [ ] Ensure `setOpenFolder` clears previous state
  - [ ] Clear selected file when folder changes
  - [ ] Reset file tree state when folder changes

#### 3.3 File Tree Reload
- [ ] Update `FileTreeView.tsx` to reload when root path changes:
  - [ ] Watch for `rootPath` prop changes
  - [ ] Reset tree state when path changes
  - [ ] Reload root directory contents
  - [ ] Clear expanded paths
  - [ ] Clear selected file

**Success Criteria**:
- [ ] Folder picker dialog opens when button clicked
- [ ] Selected folder path stored in state
- [ ] File tree reloads with new folder
- [ ] Previous state cleared when new folder opened
- [ ] Error handling works correctly

---

### Phase 4: Integration & Polish (1-1.5 hours)

**Goal**: Complete integration and add polish.

#### 4.1 Initial State Handling
- [ ] Handle case when no folder is open:
  - [ ] Show placeholder in file tree: "No folder open"
  - [ ] Show "Open Folder" button prominently
  - [ ] Or auto-open default folder on first load (optional)
- [ ] Handle folder change:
  - [ ] Show loading state while folder loads
  - [ ] Clear previous folder contents
  - [ ] Display new folder contents

#### 4.2 Persistence (Optional)
- [ ] Persist last opened folder:
  - [ ] Save `openFolderPath` to localStorage
  - [ ] Restore on app startup
  - [ ] Handle case where folder no longer exists
- [ ] Add to Zustand persist middleware:
  - [ ] Include `openFolderPath` in persisted state
  - [ ] Validate path exists on restore

#### 4.3 UI Polish
- [ ] Add loading indicator when folder is loading
- [ ] Add success feedback when folder opens
- [ ] Ensure icon buttons are accessible:
  - [ ] Keyboard navigation (Tab, Enter)
  - [ ] ARIA labels
  - [ ] Tooltips on hover
- [ ] Test with various folder structures:
  - [ ] Empty folders
  - [ ] Folders with many files
  - [ ] Nested folder structures

**Success Criteria**:
- [ ] Initial state handled gracefully
- [ ] Folder changes work smoothly
- [ ] UI polished and accessible
- [ ] All edge cases handled

---

### Phase 5: Testing & Validation (0.5-1 hour)

**Goal**: Comprehensive testing and validation.

#### 5.1 Functionality Testing
- [ ] Test folder picker dialog:
  - [ ] Opens correctly
  - [ ] Allows folder selection
  - [ ] Returns correct path
  - [ ] Handles cancellation
- [ ] Test folder loading:
  - [ ] File tree updates with new folder
  - [ ] Previous state cleared
  - [ ] Files and folders display correctly
- [ ] Test state management:
  - [ ] Store updates correctly
  - [ ] State persists (if implemented)
  - [ ] State clears when needed

#### 5.2 Integration Testing
- [ ] Test with file tree:
  - [ ] File tree reloads correctly
  - [ ] Expand/collapse works with new folder
  - [ ] File selection works
- [ ] Test with editor:
  - [ ] Opening folder doesn't break editor
  - [ ] Selected file cleared when folder changes
  - [ ] Editor handles folder change gracefully

#### 5.3 Edge Case Testing
- [ ] Test with invalid paths
- [ ] Test with inaccessible folders
- [ ] Test with very large folders
- [ ] Test with special characters in path
- [ ] Test on different platforms (Windows, Linux, macOS)

**Success Criteria**:
- [ ] All functionality tested and working
- [ ] Integration verified
- [ ] Edge cases handled
- [ ] No regressions introduced

---

## Dependencies

### Internal Dependencies
- **File Tree Component**: Existing `FileTreeView` component
- **State Store**: Existing Zustand store with `openFolderPath`
- **HomePage**: Existing `HomePage` component that loads directory

### External Dependencies
- **Tauri Dialog Plugin**: `tauri-plugin-dialog` for native folder picker
- **Frontend Dialog Package**: `@tauri-apps/plugin-dialog` for frontend integration
- **Icon Library**: Existing icon library (e.g., lucide-react) for icons

---

## Risk Assessment

### High Risk
- **Tauri Plugin Integration**: Dialog plugin may have platform-specific issues
  - **Mitigation**: Test on all platforms, handle errors gracefully, provide fallbacks
- **State Management Complexity**: Changing root folder affects entire app state
  - **Mitigation**: Clear state systematically, test state transitions, handle edge cases

### Medium Risk
- **Path Validation**: Invalid or inaccessible folders
  - **Mitigation**: Validate paths, handle errors, show user-friendly messages
- **Performance with Large Folders**: Very large folders may load slowly
  - **Mitigation**: Show loading states, optimize directory loading, consider pagination

### Low Risk
- **UI Component**: Icon buttons are straightforward to implement
- **Dialog Integration**: Tauri dialog plugin is well-documented

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Feature flag**: Disable open folder button, restore hardcoded path
- **Plugin removal**: Remove dialog plugin if causing issues

### Phase-Specific Rollback
- **Phase 1**: Remove dialog plugin, keep UI button disabled
- **Phase 2**: Remove header component, restore previous file tree
- **Phase 3**: Disable folder selection, keep hardcoded path
- **Phase 4**: Remove persistence, keep basic functionality

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore hardcoded folder
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (Tauri Dialog Setup)
- [ ] Dialog plugin installed and configured
- [ ] Folder picker dialog opens
- [ ] Path returned correctly
- [ ] Error handling works

### After Phase 2 (UI Button)
- [ ] Open Folder button visible
- [ ] Button styled correctly
- [ ] Header integrated with file tree
- [ ] Icon buttons match VSCode design

### After Phase 3 (Folder Selection)
- [ ] Folder selection works
- [ ] File tree reloads with new folder
- [ ] State management working
- [ ] Previous state cleared

### After Phase 4 (Integration)
- [ ] Initial state handled
- [ ] Folder changes smooth
- [ ] UI polished
- [ ] All features working

### After Phase 5 (Testing)
- [ ] All functionality verified
- [ ] Integration tested
- [ ] Edge cases handled
- [ ] No regressions

---

## Success Criteria

1. **Open Folder Button**: Icon button visible in file tree header
2. **Folder Picker Dialog**: Native folder picker dialog opens when button clicked
3. **Folder Selection**: User can select folder from dialog
4. **File Tree Reload**: File tree reloads with selected folder contents
5. **State Management**: Store updates with new folder path
6. **State Clearing**: Previous folder state cleared when new folder opened
7. **Error Handling**: Graceful handling of errors and cancellations
8. **UI Design**: Matches VSCode/Cursor file explorer header design
9. **Icon Buttons**: Both "Open Folder" and "Collapse All" are icon buttons
10. **Accessibility**: Keyboard navigation and screen reader support
11. **Loading States**: Loading indicators when folder is loading
12. **Edge Cases**: Handles invalid paths, inaccessible folders, etc.
13. **Platform Support**: Works on Windows, Linux, and macOS
14. **Integration**: Seamlessly integrated with existing file tree and editor
15. **No Regressions**: Existing functionality continues to work

---

## Code Examples

### Example: Tauri Dialog Utility
```typescript
// web/src/lib/tauriDialog.ts
export async function openFolderDialog(): Promise<string | null> {
  try {
    const { open } = await import('@tauri-apps/plugin-dialog')

    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select Folder',
      defaultPath: undefined, // Optional: start at specific path
    })

    if (!selected) {
      return null // User cancelled
    }

    // Handle both string and array returns
    const path = Array.isArray(selected) ? selected[0] : selected
    return path as string
  } catch (error) {
    console.error('Error opening folder dialog:', error)
    throw error
  }
}
```

### Example: File Tree Header Component
```tsx
// web/src/components/FileTree/FileTreeHeader.tsx
import { FolderOpen, ChevronsDownUp } from 'lucide-react'
import { useAppStore } from 'src/state/store'
import { openFolderDialog } from 'src/lib/tauriDialog'

export const FileTreeHeader = ({
  onCollapseAll,
}: {
  onCollapseAll: () => void
}) => {
  const setOpenFolder = useAppStore((state) => state.setOpenFolder)

  const handleOpenFolder = async () => {
    try {
      const folderPath = await openFolderDialog()
      if (folderPath) {
        setOpenFolder(folderPath)
        // File tree will reload via rootPath prop change
      }
    } catch (error) {
      console.error('Failed to open folder:', error)
      // Show error message to user
    }
  }

  return (
    <div className="flex items-center justify-end gap-1 px-2 py-1 bg-vscode-sidebar-bg border-b border-vscode-border">
      <button
        onClick={handleOpenFolder}
        className="p-1 hover:bg-vscode-hover-bg rounded"
        title="Open Folder"
        aria-label="Open Folder"
      >
        <FolderOpen className="w-4 h-4 text-vscode-fg" />
      </button>
      <button
        onClick={onCollapseAll}
        className="p-1 hover:bg-vscode-hover-bg rounded"
        title="Collapse All"
        aria-label="Collapse All"
      >
        <ChevronsDownUp className="w-4 h-4 text-vscode-fg" />
      </button>
    </div>
  )
}
```

### Example: Updated HomePage
```tsx
// web/src/pages/HomePage/HomePage.tsx
const HomePage = () => {
  const openFolderPath = useAppStore((state) => state.openFolderPath)
  const setOpenFolder = useAppStore((state) => state.setOpenFolder)

  // Use openFolderPath from store, or default if not set
  const rootPath = openFolderPath || '/home/jon/code/glyph-nova'

  const { data, loading, error } = useQuery(DIRECTORY_QUERY, {
    variables: { path: rootPath },
    skip: !rootPath, // Skip query if no folder open
    onCompleted: (data) => {
      setOpenFolder(rootPath)
    },
  })

  // ... rest of component
}
```

### Example: Updated File Tree View
```tsx
// web/src/components/FileTree/FileTreeView.tsx
import { FileTreeHeader } from './FileTreeHeader'

export const FileTreeView = ({
  files,
  folders,
  rootPath,
  // ... other props
}: FileTreeViewProps) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())

  const handleCollapseAll = () => {
    setExpandedPaths(new Set())
  }

  // Reset tree when rootPath changes
  useEffect(() => {
    setTree(/* initialize with new files/folders */)
    setExpandedPaths(new Set())
  }, [rootPath])

  return (
    <div className="flex flex-col h-full">
      <FileTreeHeader onCollapseAll={handleCollapseAll} />
      <div className="flex-1 overflow-auto">
        {/* File tree content */}
      </div>
    </div>
  )
}
```

### Example: Store Update
```typescript
// web/src/state/store.ts
setOpenFolder: (path) =>
  set({
    openFolderPath: path,
    selectedFilePath: null, // Clear selected file when folder changes
  }),
```

---

## Notes

- Open Folder button should be icon-only, matching VSCode/Cursor design
- Collapse All should also be an icon button for consistency
- Folder picker should use native system dialog for best UX
- State should be cleared when new folder is opened
- Handle case where user cancels folder selection (no error)
- Consider persisting last opened folder for better UX
- Ensure folder picker works on all platforms (Windows, Linux, macOS)
- File tree should show loading state while folder loads
- Integration should be seamless with existing file tree functionality

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
