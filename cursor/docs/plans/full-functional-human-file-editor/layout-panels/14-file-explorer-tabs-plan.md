---
name: File Explorer Tabs System Implementation Plan
overview: Implement tab system within file explorer for switching between regular file tree, .glyphnova files view, file search, and future views
todos: []
---

# File Explorer Tabs System Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Implement a tab system within the file explorer panel that allows users to switch between different views: regular file tree, .glyphnova files (workflows, configs), file search window, and future views. Tabs should be positioned at the top of the file explorer, similar to VSCode's explorer tabs.

---

## Overview

This plan implements a tab system for the file explorer that enables:
- Tab bar at top of file explorer panel
- Multiple views: File Tree, .glyphnova Files, File Search, and extensible for future views
- Tab switching to change visible content
- Active tab highlighting
- Integration with existing file tree component
- Support for future tab additions (workflows, etc.)

**Target**: Professional tab system matching VSCode explorer tabs design patterns
**Priority**: Medium (improves file explorer organization)
**Estimated Time**: 6-8 hours (with 20% buffer: 7.2-9.6 hours)
**Risk Level**: Medium (requires restructuring file explorer component)

---

## Current State Analysis

### Existing Implementation
- **Single View**: File explorer shows only regular file tree
- **FileTreeView Component**: `FileTreeView.tsx` displays file tree
- **No Tabs**: No tab system for switching views
- **No .glyphnova View**: No special view for .glyphnova folder files
- **No File Search**: No file search functionality in explorer

### Gaps Identified
- No tab system for multiple views
- No .glyphnova files view
- No file search view
- File explorer is single-purpose (file tree only)
- No way to organize different file explorer views

---

## External Documentation Links

### Tab Component Patterns
1. **VSCode Explorer Tabs**
   - Link: https://code.visualstudio.com/docs/getstarted/userinterface#_explorer
   - Description: VSCode explorer and view organization
   - Rating: High - Official VSCode documentation

2. **React Tabs Component Patterns**
   - Link: https://react.dev/learn/conditional-rendering
   - Description: React patterns for tab-based UI
   - Rating: Medium - React documentation

3. **Headless UI Tabs**
   - Link: https://headlessui.com/react/tabs
   - Description: Accessible tab component for React
   - Rating: High - Well-maintained, accessible tabs

4. **Radix UI Tabs**
   - Link: https://www.radix-ui.com/primitives/docs/components/tabs
   - Description: Accessible, unstyled tab primitives
   - Rating: High - Professional tab primitives

### File Search Patterns
5. **VSCode File Search**
   - Link: https://code.visualstudio.com/docs/editor/codebasics#_search-across-files
   - Description: VSCode file search functionality
   - Rating: High - Official VSCode documentation

6. **Fuse.js Search Library**
   - Link: https://fusejs.io/
   - Description: Lightweight fuzzy search library
   - Rating: High - Popular search library

### UI/UX Design
7. **VSCode UI/UX Design Principles**
   - Link: https://github.com/microsoft/vscode/wiki/UX-Guidelines
   - Description: VSCode's official UX guidelines
   - Rating: High - Official design guidelines

8. **Material Design Tabs**
   - Link: https://m3.material.io/components/tabs/overview
   - Description: Material Design tab component patterns
   - Rating: Medium - Design pattern reference

### Accessibility
9. **ARIA Tabs Pattern**
   - Link: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
   - Description: Accessible tab component patterns
   - Rating: High - W3C accessibility guidelines

10. **Keyboard Navigation for Tabs**
    - Link: https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
    - Description: WCAG keyboard navigation requirements
    - Rating: High - Accessibility standards

---

## Implementation Phases

### Phase 1: Tab System Foundation (2-2.5 hours)

**Goal**: Create tab system structure and basic tab switching.

#### 1.1 Create Tab Component
- [ ] Create `web/src/components/FileExplorer/` directory
- [ ] Create `FileExplorerTabs.tsx` component:
  - [ ] Tab bar container
  - [ ] Individual tab items
  - [ ] Active tab highlighting
  - [ ] Click handler for tab switching
- [ ] Create `FileExplorerTab.tsx` individual tab component:
  - [ ] Tab item with label
  - [ ] Active state styling
  - [ ] Hover states
  - [ ] Click handler

#### 1.2 Tab State Management
- [ ] Add tab state to Zustand store or local state:
  - [ ] `activeExplorerTab: string` (e.g., 'files', 'glyphnova', 'search')
  - [ ] `setActiveExplorerTab: (tab: string) => void` action
- [ ] Define tab types:
  ```typescript
  type ExplorerTab = 'files' | 'glyphnova' | 'search'
  ```
- [ ] Persist active tab (optional):
  - [ ] Save to localStorage
  - [ ] Restore on app startup

#### 1.3 Tab Content Switching
- [ ] Create wrapper component `FileExplorer.tsx`:
  - [ ] Renders tab bar at top
  - [ ] Conditionally renders content based on active tab
  - [ ] Integrates with existing FileTreeView
- [ ] Implement tab content switching:
  - [ ] 'files' tab: Shows regular FileTreeView
  - [ ] 'glyphnova' tab: Shows .glyphnova files view (placeholder for now)
  - [ ] 'search' tab: Shows file search view (placeholder for now)

**Success Criteria**:
- [ ] Tab system component created
- [ ] Tab switching works
- [ ] Active tab highlighted
- [ ] Content switches based on active tab

---

### Phase 2: .glyphnova Files View (1.5-2 hours)

**Goal**: Implement view for .glyphnova folder files (workflows, configs, chats).

#### 2.1 .glyphnova Files Detection
- [ ] Create utility to find .glyphnova folder:
  - [ ] `web/src/lib/glyphnovaUtils.ts`
  - [ ] Function to locate `.glyphnova` folder in open folder
  - [ ] Handle case where .glyphnova doesn't exist
- [ ] Create GraphQL query or service:
  - [ ] Query for .glyphnova folder contents
  - [ ] Filter for workflow files, config files, chat files
  - [ ] Return structured data

#### 2.2 .glyphnova Files View Component
- [ ] Create `GlyphNovaFilesView.tsx` component:
  - [ ] Displays .glyphnova folder structure
  - [ ] Shows workflow files (.md workflows)
  - [ ] Shows config files (n8n-style configs)
  - [ ] Shows chat files (.md files in .glyphnova/chats)
  - [ ] Uses similar tree structure to FileTreeView
- [ ] Organize by category:
  - [ ] Workflows folder
  - [ ] Configs folder
  - [ ] Chats folder
  - [ ] Or flat list with icons

#### 2.3 Integration with Tab System
- [ ] Add 'glyphnova' tab to FileExplorer:
  - [ ] Tab label: "GlyphNova" or icon
  - [ ] Renders GlyphNovaFilesView when active
  - [ ] Handles empty .glyphnova folder gracefully

**Success Criteria**:
- [ ] .glyphnova folder detected and loaded
- [ ] .glyphnova files view displays correctly
- [ ] Files organized by type/category
- [ ] Tab switching works

---

### Phase 3: File Search View (1.5-2 hours)

**Goal**: Implement file search functionality within file explorer.

#### 3.1 File Search Component
- [ ] Create `FileSearchView.tsx` component:
  - [ ] Search input at top
  - [ ] Search results list
  - [ ] File path display
  - [ ] Click to open file
- [ ] Implement search functionality:
  - [ ] Search by filename
  - [ ] Fuzzy search support (optional)
  - [ ] Real-time search as user types
  - [ ] Search across open folder

#### 3.2 Search Implementation
- [ ] Create search service:
  - [ ] `web/src/services/fileSearch.ts`
  - [ ] Function to search files in folder
  - [ ] Use GraphQL query or local filtering
  - [ ] Return matching files with paths
- [ ] Implement search algorithm:
  - [ ] Simple string matching
  - [ ] Or use Fuse.js for fuzzy search
  - [ ] Filter by file name
  - [ ] Show file path and type

#### 3.3 Integration with Tab System
- [ ] Add 'search' tab to FileExplorer:
  - [ ] Tab label: "Search" or search icon
  - [ ] Renders FileSearchView when active
  - [ ] Auto-focus search input when tab activated

**Success Criteria**:
- [ ] File search component created
- [ ] Search functionality works
- [ ] Results display correctly
- [ ] Clicking result opens file

---

### Phase 4: Tab Styling & Polish (1-1.5 hours)

**Goal**: Style tabs to match VSCode design and add polish.

#### 4.1 Tab Bar Styling
- [ ] Style tab bar:
  - [ ] Background color matching sidebar
  - [ ] Border bottom for separation
  - [ ] Horizontal layout
  - [ ] VSCode-style tab appearance
- [ ] Style individual tabs:
  - [ ] Active tab: Highlighted background
  - [ ] Inactive tabs: Subtle background
  - [ ] Hover states
  - [ ] Tab labels or icons

#### 4.2 Tab Icons (Optional)
- [ ] Add icons to tabs:
  - [ ] Files tab: Folder icon
  - [ ] GlyphNova tab: Custom icon or workflow icon
  - [ ] Search tab: Search icon
- [ ] Use icon library (lucide-react or similar)
- [ ] Ensure icons are clear and recognizable

#### 4.3 Content Area Styling
- [ ] Ensure content area:
  - [ ] Takes remaining space below tabs
  - [ ] Proper padding and spacing
  - [ ] Scrollable when content overflows
  - [ ] Matches VSCode explorer content styling

**Success Criteria**:
- [ ] Tabs styled to match VSCode
- [ ] Active tab clearly highlighted
- [ ] Content area properly styled
- [ ] Overall appearance professional

---

### Phase 5: Integration & Testing (1 hour)

**Goal**: Complete integration and comprehensive testing.

#### 5.1 Component Integration
- [ ] Update `HomePage.tsx` or parent component:
  - [ ] Replace `FileTreeView` with `FileExplorer`
  - [ ] Ensure props are passed correctly
  - [ ] Verify layout works
- [ ] Test with existing functionality:
  - [ ] File tree still works in 'files' tab
  - [ ] File selection works
  - [ ] Context menu works
  - [ ] No regressions

#### 5.2 Functionality Testing
- [ ] Test tab switching:
  - [ ] All tabs switch correctly
  - [ ] Content updates properly
  - [ ] Active tab highlighted
  - [ ] State persists (if implemented)
- [ ] Test .glyphnova view:
  - [ ] .glyphnova files load correctly
  - [ ] Files organized properly
  - [ ] Clicking files works
- [ ] Test search view:
  - [ ] Search works correctly
  - [ ] Results display properly
  - [ ] Clicking results opens files

#### 5.3 Edge Case Testing
- [ ] Test with no .glyphnova folder:
  - [ ] Tab still shows
  - [ ] Empty state displayed
  - [ ] No errors
- [ ] Test with empty search:
  - [ ] Empty state shown
  - [ ] No errors
- [ ] Test tab persistence:
  - [ ] Active tab restores on app restart
  - [ ] Invalid tab state handled

**Success Criteria**:
- [ ] All functionality tested and working
- [ ] Integration verified
- [ ] Edge cases handled
- [ ] No regressions

---

## Dependencies

### Internal Dependencies
- **File Tree Component**: Existing `FileTreeView` component
- **UI Foundation Plans**: Color theming and spacing systems
- **State Store**: Existing Zustand store

### External Dependencies
- **Optional**: Fuse.js for fuzzy search (if implementing fuzzy search)
- **Icon Library**: Existing icon library for tab icons

---

## Risk Assessment

### High Risk
- **Component Restructuring**: Changing file explorer structure might break existing functionality
  - **Mitigation**: Careful integration, maintain backward compatibility, comprehensive testing

### Medium Risk
- **.glyphnova Folder Detection**: Finding and loading .glyphnova folder reliably
  - **Mitigation**: Handle edge cases, provide fallbacks, test with various folder structures
- **Search Performance**: File search might be slow with large folders
  - **Mitigation**: Optimize search algorithm, consider indexing, debounce search input

### Low Risk
- **Tab Component**: Tab UI is straightforward to implement
- **Styling**: CSS changes are low risk

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Component restoration**: Restore previous FileTreeView usage
- **Feature flag**: Disable tabs, show only file tree

### Phase-Specific Rollback
- **Phase 1**: Remove tabs, restore direct FileTreeView
- **Phase 2**: Remove .glyphnova view, keep tabs with files and search
- **Phase 3**: Remove search view, keep tabs with files and .glyphnova
- **Phase 4**: Simplify styling, keep basic functionality

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore previous file explorer
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (Tab System)
- [ ] Tab system component created
- [ ] Tab switching works
- [ ] Content switches correctly
- [ ] No regressions in file tree

### After Phase 2 (.glyphnova View)
- [ ] .glyphnova files view displays
- [ ] Files organized correctly
- [ ] Tab switching works
- [ ] Edge cases handled

### After Phase 3 (Search View)
- [ ] File search works
- [ ] Results display correctly
- [ ] Clicking results opens files
- [ ] Performance acceptable

### After Phase 4 (Styling)
- [ ] Tabs styled correctly
- [ ] Matches VSCode design
- [ ] Content area styled
- [ ] Visual polish complete

### After Phase 5 (Integration)
- [ ] All functionality tested
- [ ] Integration verified
- [ ] Edge cases handled
- [ ] No regressions

---

## Success Criteria

1. **Tab System**: Tab bar at top of file explorer
2. **Multiple Views**: Support for files, .glyphnova, search tabs
3. **Tab Switching**: Smooth switching between views
4. **Active Tab Highlighting**: Clear visual indication of active tab
5. **Files Tab**: Regular file tree works in files tab
6. **.glyphnova Tab**: .glyphnova files view displays workflow/config/chat files
7. **Search Tab**: File search functionality works
8. **Extensibility**: Easy to add future tabs
9. **State Persistence**: Active tab persists across sessions (optional)
10. **Visual Design**: Matches VSCode explorer tabs design
11. **Integration**: Works seamlessly with existing components
12. **No Regressions**: Existing file tree functionality unchanged
13. **Edge Cases**: Handles missing .glyphnova folder, empty search, etc.
14. **Performance**: Tab switching and views are performant
15. **Accessibility**: Keyboard navigation and screen reader support

---

## Code Examples

### Example: File Explorer Component
```tsx
// web/src/components/FileExplorer/FileExplorer.tsx
import { useState } from 'react'
import { FileTreeView } from '../FileTree/FileTreeView'
import { GlyphNovaFilesView } from './GlyphNovaFilesView'
import { FileSearchView } from './FileSearchView'
import { FileExplorerTabs } from './FileExplorerTabs'

type ExplorerTab = 'files' | 'glyphnova' | 'search'

export const FileExplorer = ({
  files,
  folders,
  rootPath,
  // ... other props
}: FileExplorerProps) => {
  const [activeTab, setActiveTab] = useState<ExplorerTab>('files')

  return (
    <div className="flex h-full flex-col bg-vscode-sidebar-bg">
      {/* Tab Bar */}
      <FileExplorerTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'files' && (
          <FileTreeView
            files={files}
            folders={folders}
            rootPath={rootPath}
            // ... other props
          />
        )}
        {activeTab === 'glyphnova' && (
          <GlyphNovaFilesView rootPath={rootPath} />
        )}
        {activeTab === 'search' && (
          <FileSearchView rootPath={rootPath} />
        )}
      </div>
    </div>
  )
}
```

### Example: Tab Component
```tsx
// web/src/components/FileExplorer/FileExplorerTabs.tsx
import { Folder, Workflow, Search } from 'lucide-react'

type ExplorerTab = 'files' | 'glyphnova' | 'search'

interface FileExplorerTabsProps {
  activeTab: ExplorerTab
  onTabChange: (tab: ExplorerTab) => void
}

export const FileExplorerTabs = ({
  activeTab,
  onTabChange,
}: FileExplorerTabsProps) => {
  const tabs: { id: ExplorerTab; label: string; icon: React.ComponentType }[] = [
    { id: 'files', label: 'Files', icon: Folder },
    { id: 'glyphnova', label: 'GlyphNova', icon: Workflow },
    { id: 'search', label: 'Search', icon: Search },
  ]

  return (
    <div className="flex border-b border-vscode-border bg-vscode-sidebar-bg">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-xs transition-colors',
              'border-b-2',
              isActive
                ? 'border-vscode-active-border bg-vscode-editor-bg text-vscode-fg'
                : 'border-transparent text-vscode-fg-secondary hover:text-vscode-fg hover:bg-vscode-hover-bg'
            )}
            aria-label={tab.label}
            aria-selected={isActive}
            role="tab"
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
```

### Example: .glyphnova Files View
```tsx
// web/src/components/FileExplorer/GlyphNovaFilesView.tsx
export const GlyphNovaFilesView = ({ rootPath }: { rootPath: string }) => {
  const glyphNovaPath = `${rootPath}/.glyphnova`
  const { data, loading } = useQuery(GLYPHNOVA_FILES_QUERY, {
    variables: { path: glyphNovaPath },
    skip: !glyphNovaPath,
  })

  if (loading) {
    return <div className="p-4 text-sm text-vscode-fg-secondary">Loading...</div>
  }

  if (!data?.directoryContents) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-sm text-vscode-fg-secondary">
          <p>No .glyphnova folder found</p>
          <p className="mt-2 text-xs opacity-60">
            Create a .glyphnova folder to store workflows and configs
          </p>
        </div>
      </div>
    )
  }

  // Organize files by type
  const workflows = data.directoryContents.files.filter(f =>
    f.path.includes('workflows') || f.extension === 'md'
  )
  const configs = data.directoryContents.files.filter(f =>
    f.path.includes('config') || f.extension === 'json'
  )
  const chats = data.directoryContents.files.filter(f =>
    f.path.includes('chats')
  )

  return (
    <div className="h-full overflow-y-auto p-2">
      {/* Workflows Section */}
      {workflows.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 text-xs font-semibold text-vscode-fg-secondary">
            Workflows
          </h3>
          {workflows.map((file) => (
            <FileItem key={file.path} file={file} />
          ))}
        </div>
      )}

      {/* Configs Section */}
      {configs.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 text-xs font-semibold text-vscode-fg-secondary">
            Configs
          </h3>
          {configs.map((file) => (
            <FileItem key={file.path} file={file} />
          ))}
        </div>
      )}

      {/* Chats Section */}
      {chats.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold text-vscode-fg-secondary">
            Chats
          </h3>
          {chats.map((file) => (
            <FileItem key={file.path} file={file} />
          ))}
        </div>
      )}
    </div>
  )
}
```

### Example: File Search View
```tsx
// web/src/components/FileExplorer/FileSearchView.tsx
export const FileSearchView = ({ rootPath }: { rootPath: string }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<FileEntry[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when tab becomes active
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Search files
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    // Implement search logic
    // Query files matching search term
    const searchResults = await searchFiles(rootPath, query)
    setResults(searchResults)
  }, [rootPath])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  return (
    <div className="flex h-full flex-col">
      {/* Search Input */}
      <div className="border-b border-vscode-border p-2">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search files..."
          className="w-full rounded border border-vscode-border bg-vscode-input-bg px-3 py-2 text-sm text-vscode-fg outline-none focus:border-vscode-focus-border"
        />
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-2">
        {searchQuery && results.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-vscode-fg-secondary">No results found</p>
          </div>
        )}
        {results.map((file) => (
          <FileItem
            key={file.path}
            file={file}
            onClick={() => openFile(file.path)}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## Notes

- Tabs should be positioned at top of file explorer panel
- Start with 3 tabs: Files, GlyphNova, Search
- Design should be extensible for future tabs (workflows, etc.)
- .glyphnova view should organize files by type (workflows, configs, chats)
- File search should be fast and responsive
- Tab state can be persisted for better UX
- Ensure tabs don't take too much vertical space
- Match VSCode explorer tabs design patterns

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
