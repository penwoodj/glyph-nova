---
name: File Tabs System Implementation Plan
overview: Implement comprehensive file tabs system with drag-and-drop reordering, close buttons, reopen functionality, and integration with file tree navigation
todos: []
---

# File Tabs System Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Implement a comprehensive file tabs system that allows multiple files to be open simultaneously, with drag-and-drop reordering, close buttons on tabs, ability to reopen closed files from the file tree, and seamless integration with the existing editor system.

---

## Overview

This plan implements a file tabs system for GlyphNova that enables:
- Multiple files open simultaneously in tabs
- Drag-and-drop reordering of tabs
- Close buttons on each tab
- Reopening closed files from file tree navigation
- Active tab highlighting
- Unsaved changes indicators on tabs
- Integration with existing editor and file tree components

**Target**: Professional file tabs system matching VSCode/Cursor design patterns
**Priority**: High (core file management functionality)
**Estimated Time**: 10-12 hours (with 20% buffer: 12-14.4 hours)
**Risk Level**: Medium-High (affects core editor functionality, requires state management changes)

---

## Current State Analysis

### Existing Implementation
- **Single File Editor**: `EditorPanel.tsx` shows one file at a time
- **State Management**: Zustand store tracks single `selectedFilePath`
- **File Selection**: File tree sets `selectedFilePath` in store
- **Editor Component**: `UnifiedEditor` and `FileEditorCell` handle single file editing
- **No Tab System**: No tabs component or multi-file management

### Gaps Identified
- No support for multiple open files
- No tab UI component
- No drag-and-drop functionality
- No close buttons on files
- No way to reopen closed files
- State management only tracks single file
- No tab ordering or history

---

## External Documentation Links

### Drag and Drop Libraries
1. **dnd-kit Documentation**
   - Link: https://docs.dndkit.com/
   - Description: Modern, accessible drag-and-drop toolkit for React
   - Rating: High - Recommended library (react-beautiful-dnd is archived)

2. **dnd-kit Quick Start Guide**
   - Link: https://docs.dndkit.com/getting-started/quick-start
   - Description: Getting started guide for dnd-kit implementation
   - Rating: High - Official quick start documentation

3. **dnd-kit Sortable Example**
   - Link: https://docs.dndkit.com/presets/sortable
   - Description: Sortable preset for drag-and-drop lists
   - Rating: High - Perfect for tab reordering

4. **react-beautiful-dnd (Reference Only)**
   - Link: https://github.com/atlassian/react-beautiful-dnd
   - Description: Archived library, use dnd-kit instead
   - Rating: Low - Archived, not recommended for new projects

### VSCode Tab Patterns
5. **VSCode Editor Tabs Documentation**
   - Link: https://code.visualstudio.com/docs/getstarted/userinterface#_editor-tabs
   - Description: VSCode editor tabs features and behavior
   - Rating: High - Official VSCode documentation

6. **VSCode Tab Management Shortcuts**
   - Link: https://code.visualstudio.com/docs/getstarted/keybindings#_editor-management
   - Description: Keyboard shortcuts for tab management
   - Rating: Medium - Reference for keyboard shortcuts

### React State Management
7. **Zustand Documentation**
   - Link: https://docs.pmnd.rs/zustand/
   - Description: Lightweight state management for React
   - Rating: High - Official Zustand documentation

8. **Zustand Best Practices**
   - Link: https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions
   - Description: Best practices for Zustand store design
   - Rating: Medium - State management patterns

### UI/UX Design
9. **VSCode UI/UX Design Principles**
   - Link: https://github.com/microsoft/vscode/wiki/UX-Guidelines
   - Description: VSCode's official UX guidelines
   - Rating: High - Official design guidelines

10. **Material Design Tabs**
    - Link: https://m3.material.io/components/tabs/overview
    - Description: Material Design tab component patterns
    - Rating: Medium - Design pattern reference

### Accessibility
11. **ARIA Tabs Pattern**
    - Link: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
    - Description: Accessible tab component patterns
    - Rating: High - W3C accessibility guidelines

12. **Keyboard Navigation Best Practices**
    - Link: https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
    - Description: WCAG keyboard navigation requirements
    - Rating: High - Accessibility standards

---

## Implementation Phases

### Phase 1: State Management Enhancement (2-2.5 hours)

**Goal**: Extend Zustand store to support multiple open files and tab management.

#### 1.1 Update Store Interface
- [ ] Extend `AppState` interface in `web/src/state/store.ts`
  - [ ] Add `openFiles: OpenFile[]` array to track open files
  - [ ] Add `activeFileId: string | null` to track active tab
  - [ ] Add `closedFilesHistory: ClosedFile[]` to track recently closed files
  - [ ] Define `OpenFile` interface:
    ```typescript
    interface OpenFile {
      id: string // Unique ID for tab
      path: string // File path
      title: string // Display title (filename)
      hasUnsavedChanges: boolean
      order: number // Tab order for drag-and-drop
    }
    ```
  - [ ] Define `ClosedFile` interface:
    ```typescript
    interface ClosedFile {
      id: string
      path: string
      title: string
      closedAt: number // Timestamp
    }
    ```

#### 1.2 Add Tab Management Actions
- [ ] Add actions to store:
  - [ ] `openFile(path: string)`: Open file in new tab (or switch if already open)
  - [ ] `closeFile(fileId: string)`: Close file tab, add to closed history
  - [ ] `setActiveFile(fileId: string)`: Set active tab
  - [ ] `reorderTabs(fileIds: string[])`: Reorder tabs after drag-and-drop
  - [ ] `reopenClosedFile(fileId: string)`: Reopen file from closed history
  - [ ] `updateFileUnsavedChanges(fileId: string, hasChanges: boolean)`: Update unsaved changes state
  - [ ] `closeAllFiles()`: Close all open files
  - [ ] `closeOtherFiles(fileId: string)`: Close all files except specified one

#### 1.3 Maintain Backward Compatibility
- [ ] Keep `selectedFilePath` for backward compatibility
  - [ ] Update `setSelectedFile` to also call `openFile` and `setActiveFile`
  - [ ] Ensure existing components continue working
- [ ] Migration strategy:
  - [ ] If `selectedFilePath` is set but no tabs open, create tab automatically
  - [ ] Sync `selectedFilePath` with `activeFileId` when tabs change

**Success Criteria**:
- [ ] Store supports multiple open files
- [ ] Tab management actions implemented
- [ ] Closed files history maintained
- [ ] Backward compatibility maintained
- [ ] All existing components continue working

---

### Phase 2: Tab Component Implementation (3-3.5 hours)

**Goal**: Create tab bar component with drag-and-drop, close buttons, and visual indicators.

#### 2.1 Create Tab Component Structure
- [ ] Create `web/src/components/FileTabs/` directory
- [ ] Create `FileTabs.tsx` main component
  - [ ] Tab bar container with horizontal scroll
  - [ ] Individual tab items
  - [ ] Active tab highlighting
  - [ ] Unsaved changes indicator (dot or asterisk)
  - [ ] Close button on each tab
- [ ] Create `FileTab.tsx` individual tab component
  - [ ] Tab item with title
  - [ ] Close button
  - [ ] Active state styling
  - [ ] Hover states
  - [ ] Click handler to switch active tab

#### 2.2 Implement Drag-and-Drop
- [ ] Install `@dnd-kit/core` and `@dnd-kit/sortable`
  ```bash
  yarn add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
  ```
- [ ] Wrap tab bar with `DndContext` from `@dnd-kit/core`
- [ ] Use `SortableContext` from `@dnd-kit/sortable` for horizontal sorting
- [ ] Make each tab draggable using `useSortable` hook
- [ ] Implement `onDragEnd` handler to reorder tabs
  - [ ] Update store with new tab order
  - [ ] Maintain active tab after reorder

#### 2.3 Tab Styling and Visual Indicators
- [ ] Style tabs to match VSCode design:
  - [ ] Background colors (active vs inactive)
  - [ ] Border on active tab
  - [ ] Hover states
  - [ ] Close button styling
- [ ] Add unsaved changes indicator:
  - [ ] Dot or asterisk on tab when `hasUnsavedChanges` is true
  - [ ] Visual distinction from saved files
- [ ] Add tab overflow handling:
  - [ ] Horizontal scroll when tabs exceed container width
  - [ ] Scroll buttons if needed
  - [ ] Keep active tab visible

**Success Criteria**:
- [ ] Tab bar component renders all open files
- [ ] Drag-and-drop reordering works smoothly
- [ ] Close buttons functional on each tab
- [ ] Active tab clearly highlighted
- [ ] Unsaved changes indicators visible
- [ ] Styling matches VSCode design patterns

---

### Phase 3: Editor Integration (2-2.5 hours)

**Goal**: Integrate tabs with existing editor system and file tree.

#### 3.1 Update EditorPanel Component
- [ ] Modify `EditorPanel.tsx` to work with tabs:
  - [ ] Get active file from store (`activeFileId`)
  - [ ] Load file content for active tab
  - [ ] Handle file changes and update tab's `hasUnsavedChanges`
  - [ ] Handle file save and clear unsaved changes indicator
- [ ] Support multiple file editing:
  - [ ] Keep editor state per file (if needed)
  - [ ] Switch editor content when active tab changes

#### 3.2 Update File Tree Integration
- [ ] Modify `FileTreeView.tsx` to work with tabs:
  - [ ] When file clicked, call `openFile` action (not just `setSelectedFile`)
  - [ ] If file already open, switch to that tab
  - [ ] Show visual indicator for open files in tree
  - [ ] Show visual indicator for files with unsaved changes
- [ ] Add "Reopen Closed File" functionality:
  - [ ] Context menu option to reopen recently closed files
  - [ ] Or click file in tree to reopen if it was recently closed

#### 3.3 Tab Bar Integration
- [ ] Add `FileTabs` component to `EditorPanel` or `DesktopLayout`
  - [ ] Position tabs above editor content
  - [ ] Ensure tabs are always visible when files are open
- [ ] Handle tab interactions:
  - [ ] Click tab to switch active file
  - [ ] Click close button to close tab
  - [ ] Middle-click tab to close (optional)
  - [ ] Right-click tab for context menu (optional)

**Success Criteria**:
- [ ] Editor switches content when active tab changes
- [ ] File tree opens files in tabs
- [ ] Tab bar integrated and functional
- [ ] Unsaved changes tracked per tab
- [ ] File save updates tab state correctly

---

### Phase 4: Advanced Features (1.5-2 hours)

**Goal**: Add advanced tab management features and polish.

#### 4.1 Keyboard Shortcuts
- [ ] Implement keyboard shortcuts:
  - [ ] `Ctrl/Cmd + W`: Close active tab
  - [ ] `Ctrl/Cmd + Shift + T`: Reopen last closed tab
  - [ ] `Ctrl/Cmd + Tab`: Switch to next tab
  - [ ] `Ctrl/Cmd + Shift + Tab`: Switch to previous tab
  - [ ] `Ctrl/Cmd + 1-9`: Switch to tab by number
- [ ] Add keyboard shortcut handlers in `FileTabs` component
- [ ] Document shortcuts in UI or help menu

#### 4.2 Context Menu
- [ ] Add right-click context menu on tabs:
  - [ ] "Close": Close this tab
  - [ ] "Close Others": Close all other tabs
  - [ ] "Close All": Close all tabs
  - [ ] "Reopen Closed File": Show recently closed files
- [ ] Create `TabContextMenu.tsx` component
- [ ] Integrate with tab component

#### 4.3 Tab Overflow Handling
- [ ] Implement tab overflow UI:
  - [ ] Show scroll arrows when tabs overflow
  - [ ] Auto-scroll to active tab when it's out of view
  - [ ] Dropdown menu for tabs that don't fit (optional)
- [ ] Test with many open files (10+ tabs)

#### 4.4 Persistence (Optional)
- [ ] Persist open tabs across app restarts:
  - [ ] Save open files to localStorage
  - [ ] Restore tabs on app startup
  - [ ] Handle file path changes gracefully

**Success Criteria**:
- [ ] Keyboard shortcuts working
- [ ] Context menu functional
- [ ] Tab overflow handled gracefully
- [ ] All features tested and working

---

### Phase 5: Testing & Polish (1-1.5 hours)

**Goal**: Comprehensive testing and final polish.

#### 5.1 Functionality Testing
- [ ] Test tab opening:
  - [ ] Open file from file tree creates tab
  - [ ] Opening already-open file switches to that tab
  - [ ] Multiple files can be open simultaneously
- [ ] Test tab closing:
  - [ ] Close button works
  - [ ] Closed file added to history
  - [ ] Active tab updates correctly after close
- [ ] Test drag-and-drop:
  - [ ] Tabs can be reordered
  - [ ] Active tab maintained after reorder
  - [ ] Visual feedback during drag
- [ ] Test unsaved changes:
  - [ ] Indicator appears when file modified
  - [ ] Indicator clears when file saved
  - [ ] Warning when closing tab with unsaved changes (optional)

#### 5.2 Integration Testing
- [ ] Test with file tree:
  - [ ] Opening file from tree creates/activates tab
  - [ ] File tree shows open file indicators
  - [ ] Reopening closed file works
- [ ] Test with editor:
  - [ ] Editor content switches with tab change
  - [ ] File save works from active tab
  - [ ] Unsaved changes tracked correctly

#### 5.3 Visual Testing
- [ ] Verify styling matches VSCode:
  - [ ] Tab colors and borders
  - [ ] Active tab highlighting
  - [ ] Hover states
  - [ ] Close button appearance
- [ ] Test with many tabs:
  - [ ] Horizontal scroll works
  - [ ] Active tab stays visible
  - [ ] Performance acceptable with 20+ tabs

#### 5.4 Accessibility Testing
- [ ] Keyboard navigation:
  - [ ] Tab key moves between tabs
  - [ ] Enter activates tab
  - [ ] Escape closes tab (optional)
- [ ] Screen reader support:
  - [ ] ARIA labels on tabs
  - [ ] Tab role and state announced
  - [ ] Close button accessible

**Success Criteria**:
- [ ] All functionality tested and working
- [ ] Integration with file tree and editor verified
- [ ] Visual design matches VSCode patterns
- [ ] Accessibility requirements met
- [ ] Performance acceptable with many tabs

---

## Dependencies

### Internal Dependencies
- **UI Foundation Plans**: Color theming and spacing systems
- **Editor System**: Existing `EditorPanel` and `UnifiedEditor` components
- **File Tree**: Existing `FileTreeView` component
- **State Store**: Existing Zustand store

### External Dependencies
- **@dnd-kit/core**: Core drag-and-drop functionality
- **@dnd-kit/sortable**: Sortable preset for tab reordering
- **@dnd-kit/utilities**: Utility functions for dnd-kit
- **Zustand**: State management (already in use)

---

## Risk Assessment

### High Risk
- **Breaking existing editor functionality**: Changing state management could break single-file editing
  - **Mitigation**: Maintain backward compatibility, gradual migration, comprehensive testing
- **State management complexity**: Managing multiple files adds complexity
  - **Mitigation**: Clear interface design, thorough testing, incremental implementation

### Medium Risk
- **Drag-and-drop performance**: Many tabs might impact drag performance
  - **Mitigation**: Use efficient dnd-kit implementation, test with many tabs, optimize renders
- **Tab overflow handling**: Many open files could cause UI issues
  - **Mitigation**: Implement proper overflow handling, horizontal scroll, test edge cases

### Low Risk
- **Library dependencies**: dnd-kit is well-maintained and stable
- **Styling consistency**: Can reference VSCode patterns for consistency

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Feature flag**: Disable tabs feature, restore single-file mode
- **State fallback**: Restore `selectedFilePath`-only mode

### Phase-Specific Rollback
- **Phase 1**: Remove tab state, restore single file state
- **Phase 2**: Remove tab component, keep state for future
- **Phase 3**: Disconnect tabs from editor, restore direct file selection
- **Phase 4**: Remove advanced features, keep basic tabs

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore previous editor system
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (State Management)
- [ ] Store supports multiple open files
- [ ] Tab management actions working
- [ ] Backward compatibility maintained
- [ ] No regressions in existing functionality

### After Phase 2 (Tab Component)
- [ ] Tab bar renders correctly
- [ ] Drag-and-drop working
- [ ] Close buttons functional
- [ ] Visual indicators working

### After Phase 3 (Editor Integration)
- [ ] Editor switches with tab changes
- [ ] File tree integration working
- [ ] Unsaved changes tracked correctly
- [ ] All interactions smooth

### After Phase 4 (Advanced Features)
- [ ] Keyboard shortcuts working
- [ ] Context menu functional
- [ ] Overflow handling working
- [ ] All features tested

### After Phase 5 (Testing)
- [ ] All functionality verified
- [ ] Integration tested
- [ ] Visual design verified
- [ ] Accessibility requirements met

---

## Success Criteria

1. **Multiple Open Files**: Support for multiple files open simultaneously
2. **Tab Bar UI**: Professional tab bar matching VSCode design
3. **Drag-and-Drop**: Smooth tab reordering via drag-and-drop
4. **Close Buttons**: Functional close buttons on each tab
5. **Active Tab**: Clear visual indication of active tab
6. **Unsaved Changes**: Visual indicators for files with unsaved changes
7. **File Tree Integration**: Opening files from tree creates/activates tabs
8. **Reopen Functionality**: Ability to reopen recently closed files
9. **Editor Integration**: Editor switches content with active tab
10. **Keyboard Shortcuts**: Standard keyboard shortcuts for tab management
11. **Context Menu**: Right-click context menu on tabs
12. **Tab Overflow**: Proper handling when many tabs are open
13. **State Management**: Robust state management for tab system
14. **Backward Compatibility**: Existing single-file mode still works
15. **Accessibility**: Keyboard navigation and screen reader support

---

## Code Examples

### Example: Updated Store Interface
```typescript
// web/src/state/store.ts
interface OpenFile {
  id: string
  path: string
  title: string
  hasUnsavedChanges: boolean
  order: number
}

interface ClosedFile {
  id: string
  path: string
  title: string
  closedAt: number
}

interface AppState {
  // ... existing state
  openFiles: OpenFile[]
  activeFileId: string | null
  closedFilesHistory: ClosedFile[]

  // Actions
  openFile: (path: string) => void
  closeFile: (fileId: string) => void
  setActiveFile: (fileId: string) => void
  reorderTabs: (fileIds: string[]) => void
  reopenClosedFile: (fileId: string) => void
  updateFileUnsavedChanges: (fileId: string, hasChanges: boolean) => void
}
```

### Example: Tab Component
```tsx
// web/src/components/FileTabs/FileTabs.tsx
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { FileTab } from './FileTab'

export const FileTabs = () => {
  const openFiles = useAppStore((state) => state.openFiles)
  const activeFileId = useAppStore((state) => state.activeFileId)
  const reorderTabs = useAppStore((state) => state.reorderTabs)
  const setActiveFile = useAppStore((state) => state.setActiveFile)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = openFiles.findIndex((f) => f.id === active.id)
      const newIndex = openFiles.findIndex((f) => f.id === over.id)
      const newOrder = arrayMove(openFiles, oldIndex, newIndex)
      reorderTabs(newOrder.map((f) => f.id))
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={openFiles.map((f) => f.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex overflow-x-auto bg-vscode-editor-bg border-b border-vscode-border">
          {openFiles.map((file) => (
            <FileTab
              key={file.id}
              file={file}
              isActive={file.id === activeFileId}
              onActivate={() => setActiveFile(file.id)}
              onClose={() => closeFile(file.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

### Example: Individual Tab Component
```tsx
// web/src/components/FileTabs/FileTab.tsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const FileTab = ({ file, isActive, onActivate, onClose }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: file.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'flex items-center gap-2 px-3 py-2 border-r border-vscode-border cursor-pointer',
        isActive
          ? 'bg-vscode-editor-bg border-b-2 border-b-vscode-active-border'
          : 'bg-vscode-sidebar-bg hover:bg-vscode-hover-bg'
      )}
      onClick={onActivate}
    >
      <span className="text-sm text-vscode-fg">{file.title}</span>
      {file.hasUnsavedChanges && (
        <span className="text-vscode-fg-secondary">•</span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="ml-1 hover:bg-vscode-hover-bg rounded p-1"
      >
        ×
      </button>
    </div>
  )
}
```

---

## Notes

- Use `@dnd-kit` instead of `react-beautiful-dnd` (which is archived)
- Maintain backward compatibility with existing single-file mode
- Tab system should feel natural and match VSCode/Cursor patterns
- Consider performance with many open tabs (20+)
- Ensure accessibility with keyboard navigation and screen readers
- Visual indicators should be clear but not overwhelming
- Integration with file tree should be seamless

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
