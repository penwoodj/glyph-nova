---
name: File Path Navigation Chips Implementation Plan
overview: Implement fixed file path navigation with clickable chips at top of editor that navigate to file tree and expand folders with soft oscillating highlight
todos: []
---

# File Path Navigation Chips Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Implement a fixed file path navigation bar at the top of the editor with clickable chips for each path segment. When clicked, focus moves to the left file navigation menu with all folders needed to reach that file/folder expanded, with a soft oscillating highlight on the focused item.

---

## Overview

This plan implements a VSCode-style breadcrumb navigation system for GlyphNova that enables:
- Fixed file path display at top of editor (below tabs, above content)
- Clickable chips for each path segment (folder/file)
- Navigation to file tree when chip clicked
- Automatic folder expansion to reveal clicked path
- Soft oscillating highlight on focused file/folder in tree
- Integration with existing file tree and editor components

**Target**: Professional breadcrumb navigation matching VSCode/Cursor design patterns
**Priority**: High (improves file navigation UX)
**Estimated Time**: 6-8 hours (with 20% buffer: 7.2-9.6 hours)
**Risk Level**: Medium (requires coordination between editor and file tree)

---

## Current State Analysis

### Existing Implementation
- **Editor Panel**: `EditorPanel.tsx` displays file content but no path
- **File Tree**: `FileTreeView.tsx` shows file structure with expand/collapse
- **State Management**: Zustand store tracks `selectedFilePath`
- **No Path Display**: File path not shown anywhere in editor
- **No Breadcrumb Navigation**: No way to navigate via path segments

### Gaps Identified
- No file path displayed at top of editor
- No clickable path navigation
- No automatic folder expansion when navigating
- No visual feedback when focusing file tree from breadcrumb
- No oscillating highlight for focused items

---

## External Documentation Links

### VSCode Breadcrumb Patterns
1. **VSCode Breadcrumb Navigation**
   - Link: https://code.visualstudio.com/docs/getstarted/userinterface#_breadcrumbs
   - Description: VSCode breadcrumb navigation features and usage
   - Rating: High - Official VSCode documentation

2. **VSCode Breadcrumb Settings**
   - Link: https://code.visualstudio.com/docs/getstarted/settings#_breadcrumbs
   - Description: VSCode breadcrumb configuration options
   - Rating: High - Official settings documentation

### React Breadcrumb Components
3. **React Breadcrumb Component Patterns**
   - Link: https://react-bootstrap.github.io/components/breadcrumb/
   - Description: React Bootstrap breadcrumb component patterns
   - Rating: Medium - Component pattern reference

4. **Material-UI Breadcrumbs**
   - Link: https://mui.com/material-ui/react-breadcrumbs/
   - Description: Material-UI breadcrumb component with navigation
   - Rating: Medium - Component library reference

### Path Parsing & Navigation
5. **Node.js Path Module**
   - Link: https://nodejs.org/api/path.html
   - Description: Node.js path utilities for parsing file paths
   - Rating: High - Official Node.js documentation

6. **JavaScript Path Parsing**
   - Link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
   - Description: String manipulation for path parsing
   - Rating: Medium - MDN documentation

### Animation & Highlighting
7. **CSS Animations for Oscillating Highlight**
   - Link: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Using_CSS_animations
   - Description: CSS animations for creating oscillating effects
   - Rating: High - MDN documentation

8. **React Focus Management**
   - Link: https://react.dev/reference/react-dom/hooks/useFocusManagement
   - Description: Managing focus states in React applications
   - Rating: Medium - React documentation

### Accessibility
9. **ARIA Breadcrumb Pattern**
   - Link: https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/
   - Description: Accessible breadcrumb navigation patterns
   - Rating: High - W3C accessibility guidelines

10. **Keyboard Navigation Best Practices**
    - Link: https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
    - Description: WCAG keyboard navigation requirements
    - Rating: High - Accessibility standards

### UI/UX Design
11. **VSCode UI/UX Design Principles**
    - Link: https://github.com/microsoft/vscode/wiki/UX-Guidelines
    - Description: VSCode's official UX guidelines
    - Rating: High - Official design guidelines

12. **Material Design Navigation Patterns**
    - Link: https://m3.material.io/components/navigation-bar/overview
    - Description: Material Design navigation patterns
    - Rating: Medium - Design pattern reference

---

## Implementation Phases

### Phase 1: Path Navigation Component (2-2.5 hours)

**Goal**: Create breadcrumb navigation component with clickable chips.

#### 1.1 Create Path Navigation Component
- [ ] Create `web/src/components/PathNavigation/` directory
- [ ] Create `PathNavigation.tsx` main component
  - [ ] Accept `filePath: string` prop
  - [ ] Parse file path into segments (folders + filename)
  - [ ] Render chips for each path segment
  - [ ] Add separators between chips (e.g., `/` or `>`)
  - [ ] Style to match VSCode breadcrumb design
- [ ] Create `PathChip.tsx` individual chip component
  - [ ] Clickable chip for each path segment
  - [ ] Hover states
  - [ ] Active/focused state styling
  - [ ] Click handler to navigate to that path

#### 1.2 Path Parsing Logic
- [ ] Create `web/src/lib/pathUtils.ts` utility file
  - [ ] `parsePathSegments(path: string): PathSegment[]` function
    - [ ] Split path by `/` or `\` (handle both)
    - [ ] Return array of segments with:
      - `name`: Segment name (folder or file)
      - `fullPath`: Full path up to this segment
      - `isFile`: Boolean indicating if this is the file (last segment)
      - `isFolder`: Boolean indicating if this is a folder
  - [ ] Handle edge cases:
    - [ ] Root paths (`/` or `C:\`)
    - [ ] Relative paths
    - [ ] Paths with special characters
- [ ] Test path parsing with various path formats

#### 1.3 Component Styling
- [ ] Style breadcrumb bar:
  - [ ] Fixed position at top of editor (below tabs if tabs exist)
  - [ ] Background color matching editor background
  - [ ] Border bottom for separation
  - [ ] Horizontal layout with chips
- [ ] Style individual chips:
  - [ ] VSCode-style chip appearance
  - [ ] Hover state (background color change)
  - [ ] Active state (if current segment)
  - [ ] Clickable cursor
- [ ] Add separators between chips:
  - [ ] `/` or `>` character
  - [ ] Styled to match VSCode

**Success Criteria**:
- [ ] Path navigation component renders file path as chips
- [ ] Path parsing handles various path formats correctly
- [ ] Chips are clickable and styled appropriately
- [ ] Component matches VSCode breadcrumb design

---

### Phase 2: File Tree Integration (2-2.5 hours)

**Goal**: Integrate path navigation with file tree to expand folders and focus items.

#### 2.1 Add Navigation Action to Store
- [ ] Extend Zustand store in `web/src/state/store.ts`
  - [ ] Add `navigateToPath: (path: string) => void` action
  - [ ] Add `focusedPath: string | null` state for oscillating highlight
  - [ ] Action should:
    - [ ] Set `focusedPath` to the clicked path
    - [ ] Trigger file tree expansion (via callback or event)
    - [ ] Scroll file tree to show focused item

#### 2.2 Update File Tree Component
- [ ] Modify `FileTreeView.tsx` to support:
  - [ ] Listening to `focusedPath` from store
  - [ ] Automatically expanding folders to reveal `focusedPath`
  - [ ] Scrolling to focused item when path changes
  - [ ] Applying oscillating highlight to focused item
- [ ] Create `expandPathToFile(path: string)` function:
  - [ ] Parse path into folder segments
  - [ ] Recursively expand each folder in path
  - [ ] Ensure file tree state reflects expanded folders
  - [ ] Handle async folder loading if needed

#### 2.3 Path Navigation Click Handler
- [ ] Implement click handler in `PathChip.tsx`:
  - [ ] When chip clicked, call `navigateToPath(fullPath)`
  - [ ] This triggers file tree expansion and focus
  - [ ] If clicked path is a file, also open it in editor
  - [ ] If clicked path is a folder, just focus it in tree

**Success Criteria**:
- [ ] Clicking path chip navigates to file tree
- [ ] Folders automatically expand to reveal clicked path
- [ ] File tree scrolls to show focused item
- [ ] Focused item receives oscillating highlight

---

### Phase 3: Oscillating Highlight Animation (1-1.5 hours)

**Goal**: Implement soft oscillating highlight on focused file/folder in tree.

#### 3.1 Create Oscillating Highlight CSS
- [ ] Add CSS animation in `web/src/index.css`:
  - [ ] `@keyframes pathFocusOscillate` animation
    - [ ] Smooth opacity/background color transition
    - [ ] 2-3 second cycle (subtle, not distracting)
    - [ ] Ease-in-out timing function
  - [ ] Animation should be subtle and professional
- [ ] Create `.path-focused` CSS class:
  - [ ] Applies oscillating animation
  - [ ] Background color with opacity variation
  - [ ] Border highlight (optional)

#### 3.2 Apply Highlight to File Tree Items
- [ ] Update `FileTreeItem.tsx` to:
  - [ ] Check if item's path matches `focusedPath` from store
  - [ ] Apply `.path-focused` class when focused
  - [ ] Remove class when focus changes
- [ ] Ensure highlight is visible but not overwhelming:
  - [ ] Subtle background color change
  - [ ] Optional border highlight
  - [ ] Smooth animation

#### 3.3 Auto-remove Highlight
- [ ] Implement auto-removal of highlight:
  - [ ] Remove highlight after 3-5 seconds
  - [ ] Or remove when user interacts with file tree
  - [ ] Or remove when different path is focused
- [ ] Update store action to handle highlight timeout

**Success Criteria**:
- [ ] Oscillating highlight animation smooth and subtle
- [ ] Highlight applied to focused file/folder in tree
- [ ] Highlight automatically removed after timeout or interaction
- [ ] Animation performance acceptable (60fps)

---

### Phase 4: Editor Integration (1-1.5 hours)

**Goal**: Integrate path navigation into editor panel.

#### 4.1 Add Path Navigation to Editor Panel
- [ ] Update `EditorPanel.tsx` to include path navigation:
  - [ ] Render `PathNavigation` component at top
  - [ ] Pass `selectedFilePath` or active file path as prop
  - [ ] Position below file tabs (if tabs exist) or at very top
  - [ ] Ensure path navigation is always visible when file is open
- [ ] Handle case when no file is selected:
  - [ ] Hide path navigation or show placeholder
  - [ ] Or show current folder path if available

#### 4.2 Fixed Positioning
- [ ] Ensure path navigation is fixed at top:
  - [ ] Use CSS `position: sticky` or `position: fixed`
  - [ ] Ensure it doesn't scroll with editor content
  - [ ] Maintain proper z-index to stay above content
- [ ] Adjust editor content area to account for path navigation height

#### 4.3 Responsive Behavior
- [ ] Handle long paths gracefully:
  - [ ] Horizontal scroll if path is too long
  - [ ] Or truncate with ellipsis and show full path on hover
  - [ ] Or show only last N segments with "..." prefix
- [ ] Test with various path lengths

**Success Criteria**:
- [ ] Path navigation visible at top of editor
- [ ] Fixed positioning works correctly
- [ ] Long paths handled gracefully
- [ ] Integration with editor panel seamless

---

### Phase 5: Testing & Polish (1 hour)

**Goal**: Comprehensive testing and final polish.

#### 5.1 Functionality Testing
- [ ] Test path parsing:
  - [ ] Various path formats (absolute, relative, Windows, Unix)
  - [ ] Special characters in paths
  - [ ] Very long paths
  - [ ] Root paths
- [ ] Test navigation:
  - [ ] Clicking folder chip expands and focuses folder
  - [ ] Clicking file chip opens file and focuses it
  - [ ] File tree expands correctly
  - [ ] Scroll to focused item works
- [ ] Test highlight:
  - [ ] Oscillating animation smooth
  - [ ] Highlight appears on correct item
  - [ ] Highlight removes after timeout

#### 5.2 Integration Testing
- [ ] Test with file tree:
  - [ ] Navigation from breadcrumb works
  - [ ] Folder expansion works correctly
  - [ ] File tree state updates properly
- [ ] Test with editor:
  - [ ] Path updates when file changes
  - [ ] Path navigation doesn't interfere with editing
  - [ ] Fixed positioning works with scrolling

#### 5.3 Visual Testing
- [ ] Verify styling matches VSCode:
  - [ ] Chip appearance
  - [ ] Separator styling
  - [ ] Hover states
  - [ ] Active states
- [ ] Test with different themes (if multi-theme support exists)

#### 5.4 Accessibility Testing
- [ ] Keyboard navigation:
  - [ ] Tab key moves between chips
  - [ ] Enter activates chip
  - [ ] Arrow keys navigate between chips (optional)
- [ ] Screen reader support:
  - [ ] ARIA labels on chips
  - [ ] Breadcrumb role and structure announced
  - [ ] Navigation state communicated

**Success Criteria**:
- [ ] All functionality tested and working
- [ ] Integration with file tree and editor verified
- [ ] Visual design matches VSCode patterns
- [ ] Accessibility requirements met
- [ ] Performance acceptable

---

## Dependencies

### Internal Dependencies
- **UI Foundation Plans**: Color theming system for styling
- **File Tree Component**: Existing `FileTreeView` component
- **Editor System**: Existing `EditorPanel` component
- **State Store**: Existing Zustand store

### External Dependencies
- **Path Utilities**: Node.js path module or custom path parsing
- **CSS Animations**: For oscillating highlight effect

---

## Risk Assessment

### High Risk
- **File tree expansion complexity**: Automatically expanding nested folders can be complex
  - **Mitigation**: Implement recursive expansion carefully, handle async loading, test edge cases
- **State synchronization**: Keeping file tree and breadcrumb in sync
  - **Mitigation**: Use centralized state management, clear update patterns

### Medium Risk
- **Path parsing edge cases**: Various path formats and special characters
  - **Mitigation**: Comprehensive path parsing utility, test with various formats
- **Performance with deep paths**: Very nested folder structures
  - **Mitigation**: Optimize expansion logic, lazy load if needed, test with deep paths

### Low Risk
- **CSS animation performance**: Oscillating highlight should be lightweight
- **Component styling**: Can reference VSCode patterns for consistency

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Feature flag**: Disable path navigation, restore previous editor layout
- **Component removal**: Remove path navigation component, restore editor

### Phase-Specific Rollback
- **Phase 1**: Remove path navigation component, keep utilities for future
- **Phase 2**: Disconnect from file tree, keep component for display only
- **Phase 3**: Remove highlight animation, keep basic focus
- **Phase 4**: Remove from editor, keep as standalone component

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore previous editor
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (Path Navigation Component)
- [ ] Path navigation component renders correctly
- [ ] Path parsing handles various formats
- [ ] Chips are clickable and styled
- [ ] Component matches VSCode design

### After Phase 2 (File Tree Integration)
- [ ] Clicking chip navigates to file tree
- [ ] Folders expand automatically
- [ ] File tree scrolls to focused item
- [ ] Integration working smoothly

### After Phase 3 (Oscillating Highlight)
- [ ] Highlight animation smooth and subtle
- [ ] Highlight applied to correct item
- [ ] Auto-removal working
- [ ] Performance acceptable

### After Phase 4 (Editor Integration)
- [ ] Path navigation visible in editor
- [ ] Fixed positioning works
- [ ] Long paths handled gracefully
- [ ] Integration seamless

### After Phase 5 (Testing)
- [ ] All functionality verified
- [ ] Integration tested
- [ ] Visual design verified
- [ ] Accessibility requirements met

---

## Success Criteria

1. **Path Display**: File path displayed as clickable chips at top of editor
2. **Path Parsing**: Handles various path formats correctly (Windows, Unix, absolute, relative)
3. **Clickable Chips**: Each path segment is clickable
4. **File Tree Navigation**: Clicking chip navigates to file tree
5. **Folder Expansion**: Folders automatically expand to reveal clicked path
6. **Focus Highlight**: Focused item receives oscillating highlight
7. **Auto-scroll**: File tree scrolls to show focused item
8. **Fixed Positioning**: Path navigation fixed at top of editor
9. **Long Path Handling**: Long paths handled gracefully (scroll or truncate)
10. **Editor Integration**: Seamlessly integrated with editor panel
11. **State Management**: File tree and breadcrumb stay in sync
12. **Visual Design**: Matches VSCode breadcrumb design patterns
13. **Accessibility**: Keyboard navigation and screen reader support
14. **Performance**: Smooth animations and responsive interactions
15. **Edge Cases**: Handles root paths, special characters, very long paths

---

## Code Examples

### Example: Path Parsing Utility
```typescript
// web/src/lib/pathUtils.ts
export interface PathSegment {
  name: string
  fullPath: string
  isFile: boolean
  isFolder: boolean
}

export function parsePathSegments(filePath: string): PathSegment[] {
  // Normalize path (handle both / and \)
  const normalized = filePath.replace(/\\/g, '/')

  // Split into segments
  const parts = normalized.split('/').filter(Boolean)

  // Build segments with full paths
  const segments: PathSegment[] = []
  let currentPath = ''

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    currentPath = currentPath ? `${currentPath}/${part}` : part

    segments.push({
      name: part,
      fullPath: currentPath,
      isFile: i === parts.length - 1, // Last segment is file
      isFolder: i < parts.length - 1,  // Others are folders
    })
  }

  return segments
}
```

### Example: Path Navigation Component
```tsx
// web/src/components/PathNavigation/PathNavigation.tsx
import { useAppStore } from 'src/state/store'
import { parsePathSegments } from 'src/lib/pathUtils'
import { PathChip } from './PathChip'

export const PathNavigation = ({ filePath }: { filePath: string | null }) => {
  const navigateToPath = useAppStore((state) => state.navigateToPath)

  if (!filePath) return null

  const segments = parsePathSegments(filePath)

  return (
    <nav
      className="flex items-center gap-1 px-4 py-2 bg-vscode-editor-bg border-b border-vscode-border"
      aria-label="File path navigation"
    >
      {segments.map((segment, index) => (
        <div key={segment.fullPath} className="flex items-center">
          {index > 0 && (
            <span className="mx-1 text-vscode-fg-secondary">/</span>
          )}
          <PathChip
            segment={segment}
            onClick={() => navigateToPath(segment.fullPath)}
          />
        </div>
      ))}
    </nav>
  )
}
```

### Example: Path Chip Component
```tsx
// web/src/components/PathNavigation/PathChip.tsx
export const PathChip = ({
  segment,
  onClick,
}: {
  segment: PathSegment
  onClick: () => void
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2 py-1 rounded text-sm',
        'text-vscode-fg hover:text-vscode-fg',
        'hover:bg-vscode-hover-bg',
        'transition-colors',
        segment.isFile && 'font-medium'
      )}
      aria-label={`Navigate to ${segment.name}`}
    >
      {segment.name}
    </button>
  )
}
```

### Example: Store Action
```typescript
// web/src/state/store.ts
navigateToPath: (path) => {
  set({ focusedPath: path })

  // Trigger file tree expansion (via callback or event)
  // This will be handled by FileTreeView component
}
```

### Example: File Tree Expansion
```tsx
// web/src/components/FileTree/FileTreeView.tsx
const focusedPath = useAppStore((state) => state.focusedPath)

useEffect(() => {
  if (focusedPath) {
    expandPathToFile(focusedPath)
    scrollToPath(focusedPath)
  }
}, [focusedPath])

const expandPathToFile = async (path: string) => {
  const segments = parsePathSegments(path)
  const folderSegments = segments.filter((s) => s.isFolder)

  // Recursively expand each folder
  for (const segment of folderSegments) {
    await expandFolder(segment.fullPath)
  }
}
```

### Example: Oscillating Highlight CSS
```css
/* web/src/index.css */
@keyframes pathFocusOscillate {
  0%, 100% {
    background-color: rgba(0, 122, 204, 0.1);
    opacity: 0.6;
  }
  50% {
    background-color: rgba(0, 122, 204, 0.15);
    opacity: 0.8;
  }
}

.path-focused {
  animation: pathFocusOscillate 2.5s ease-in-out infinite;
  border-left: 2px solid var(--vscode-active-border);
}
```

---

## Notes

- Path navigation should be fixed at top of editor, always visible when file is open
- Clicking a chip should navigate to that path in file tree, not necessarily open it
- Oscillating highlight should be subtle and professional (2-3 second cycle)
- Handle various path formats (Windows, Unix, absolute, relative)
- Long paths should be handled gracefully (scroll or truncate)
- Integration with file tree should be seamless and responsive
- Ensure accessibility with keyboard navigation and screen readers
- Visual design should match VSCode breadcrumb patterns

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
