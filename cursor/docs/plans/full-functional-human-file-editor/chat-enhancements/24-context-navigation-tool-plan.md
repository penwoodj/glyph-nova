---
name: @ Context Navigation Tool Implementation Plan
overview: Implement @ context navigation tool in chat input with autocomplete for files, folders, and context items, with hoverable full path display
todos: []
---

# @ Context Navigation Tool Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Implement a @ context navigation tool in the chat input that provides autocomplete suggestions when typing `@`. The tool should suggest files, folders, and other context items, display full paths on hover, and insert selected items into the chat input. This matches Cursor's @ mention system for context selection.

---

## Overview

This plan implements a @ context navigation tool that:
- Detects `@` character in chat input
- Shows autocomplete dropdown with files, folders, and context items
- Filters suggestions as user types after `@`
- Displays full file paths on hover
- Inserts selected item into input at cursor position
- Supports keyboard navigation (arrow keys, Enter, Escape)
- Matches Cursor's @ mention UX patterns

**Target**: Professional @ context navigation matching Cursor's @ mention system
**Priority**: High (improves chat context selection UX)
**Estimated Time**: 8-10 hours (with 20% buffer: 9.6-12 hours)
**Risk Level**: Medium (complex autocomplete UI, cursor position handling)

---

## Current State Analysis

### Existing Implementation
- **Chat Input**: Simple textarea with no autocomplete
- **File Path Detection**: Detects paths in messages after sending
- **File Context Loading**: Loads file content when paths detected
- **No @ Tool**: No @ mention or autocomplete system
- **No Autocomplete**: No autocomplete in chat input

### Gaps Identified
- No @ character detection
- No autocomplete dropdown
- No file/folder suggestion system
- No hover tooltips for paths
- No keyboard navigation for autocomplete

---

## External Documentation Links

### Autocomplete Patterns
1. **Cursor @ Mentions**
   - Link: https://cursor.sh/docs
   - Description: Cursor's @ mention system (reference from user requirements)
   - Rating: High - User-specified pattern

2. **GitHub Copilot Chat @ Mentions**
   - Link: https://github.com/features/copilot
   - Description: GitHub Copilot chat @ mention patterns
   - Rating: Medium - Similar feature reference

3. **React Autocomplete Patterns**
   - Link: https://react.dev/learn/conditional-rendering
   - Description: React patterns for autocomplete UI
   - Rating: Medium - React documentation

### Autocomplete Libraries
4. **Downshift**
   - Link: https://www.downshift-js.com/
   - Description: Accessible autocomplete component library
   - Rating: High - Popular autocomplete library

5. **React Autocomplete**
   - Link: https://github.com/eliasmeire/react-autocomplete
   - Description: React autocomplete component
   - Rating: Medium - Autocomplete library

6. **Headless UI Combobox**
   - Link: https://headlessui.com/react/combobox
   - Description: Accessible combobox/autocomplete component
   - Rating: High - Well-maintained, accessible

### Textarea Cursor Handling
7. **Textarea Selection API**
   - Link: https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement
   - Description: Textarea selection and cursor position
   - Rating: High - MDN documentation

8. **Range API**
   - Link: https://developer.mozilla.org/en-US/docs/Web/API/Range
   - Description: DOM Range API for text manipulation
   - Rating: High - MDN documentation

### File Search & Filtering
9. **Fuse.js Search Library**
   - Link: https://fusejs.io/
   - Description: Lightweight fuzzy search library
   - Rating: High - Popular search library

10. **File System Search**
    - Link: https://nodejs.org/api/fs.html
    - Description: File system search patterns
    - Rating: Medium - Node.js documentation

---

## Implementation Phases

### Phase 1: @ Detection & Autocomplete Trigger (1.5-2 hours)

**Goal**: Detect @ character and trigger autocomplete dropdown.

#### 1.1 @ Character Detection
- [ ] Update `ChatInterface.tsx`:
  - [ ] Monitor textarea input for `@` character
  - [ ] Detect cursor position when `@` is typed
  - [ ] Extract query text after `@` (if any)
- [ ] Detection logic:
  ```typescript
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart

    // Check if @ is at cursor or just before
    const textBeforeCursor = value.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      // Check if @ is not part of a word (whitespace or start before it)
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' '
      if (charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) {
        const query = textBeforeCursor.substring(lastAtIndex + 1)
        showAutocomplete(lastAtIndex, query)
      }
    } else {
      hideAutocomplete()
    }

    setInputValue(value)
  }
  ```

#### 1.2 Autocomplete State Management
- [ ] Add autocomplete state:
  - [ ] `showAutocomplete: boolean`
  - [ ] `autocompleteQuery: string`
  - [ ] `autocompletePosition: { start: number, end: number }`
  - [ ] `selectedIndex: number`
- [ ] State management:
  - [ ] Show autocomplete when `@` detected
  - [ ] Hide autocomplete when `@` removed or selection made
  - [ ] Update query as user types

#### 1.3 Autocomplete Dropdown Component
- [ ] Create `ContextAutocomplete.tsx`:
  - [ ] Dropdown container
  - [ ] Positioned near cursor or below input
  - [ ] List of suggestions
  - [ ] Keyboard navigation support
- [ ] Dropdown positioning:
  - [ ] Calculate position based on cursor
  - [ ] Or position below input area
  - [ ] Ensure dropdown is visible

**Success Criteria**:
- [ ] @ character detected correctly
- [ ] Autocomplete triggers on @
- [ ] Query extracted correctly
- [ ] Dropdown appears in correct position

---

### Phase 2: File & Folder Suggestions (2-2.5 hours)

**Goal**: Generate autocomplete suggestions for files and folders.

#### 2.1 File Search Service
- [ ] Create `web/src/services/contextAutocomplete.ts`:
  - [ ] `searchFiles(query: string, rootPath: string): Promise<FileSuggestion[]>`
  - [ ] Search files and folders
  - [ ] Filter by query string
  - [ ] Return suggestions with metadata
- [ ] Search implementation:
  - [ ] Query directory contents via GraphQL
  - [ ] Filter files/folders matching query
  - [ ] Use fuzzy search (optional: Fuse.js)
  - [ ] Limit results (e.g., top 20)

#### 2.2 Suggestion Data Structure
- [ ] Define suggestion interface:
  ```typescript
  interface FileSuggestion {
    type: 'file' | 'folder'
    path: string
    name: string
    displayName: string // Short name for display
    fullPath: string // Full path for hover
    icon?: string
  }
  ```
- [ ] Generate suggestions:
  - [ ] Files matching query
  - [ ] Folders matching query
  - [ ] Sorted by relevance
  - [ ] Include path information

#### 2.3 Autocomplete Filtering
- [ ] Implement filtering:
  - [ ] Filter by file/folder name
  - [ ] Filter by path (optional)
  - [ ] Case-insensitive matching
  - [ ] Highlight matching text
- [ ] Filtering logic:
  - [ ] Simple string matching
  - [ ] Or fuzzy search
  - [ ] Prioritize exact matches
  - [ ] Show most relevant first

**Success Criteria**:
- [ ] File search works correctly
- [ ] Suggestions generated correctly
- [ ] Filtering works as user types
- [ ] Results sorted by relevance

---

### Phase 3: Autocomplete UI & Interaction (2-2.5 hours)

**Goal**: Create autocomplete dropdown UI with interactions.

#### 3.1 Autocomplete Dropdown UI
- [ ] Create `ContextAutocomplete.tsx` component:
  - [ ] Dropdown container with styling
  - [ ] List of suggestion items
  - [ ] Selected item highlighting
  - [ ] Scrollable list
- [ ] UI styling:
  - [ ] Match VSCode autocomplete style
  - [ ] Dark theme support
  - [ ] Proper spacing and padding
  - [ ] Clear visual hierarchy

#### 3.2 Suggestion Item Component
- [ ] Create `SuggestionItem.tsx`:
  - [ ] Display file/folder icon
  - [ ] Display file/folder name
  - [ ] Show full path on hover
  - [ ] Highlight selected item
- [ ] Item features:
  - [ ] Icon based on file type
  - [ ] Name with query highlighting
  - [ ] Hover tooltip with full path
  - [ ] Click to select

#### 3.3 Keyboard Navigation
- [ ] Implement keyboard navigation:
  - [ ] Arrow Up/Down: Navigate suggestions
  - [ ] Enter: Select suggestion
  - [ ] Escape: Close autocomplete
  - [ ] Tab: Select suggestion (optional)
- [ ] Navigation logic:
  ```typescript
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showAutocomplete) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      selectSuggestion(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      hideAutocomplete()
    }
  }
  ```

**Success Criteria**:
- [ ] Autocomplete UI displays correctly
- [ ] Suggestions render properly
- [ ] Keyboard navigation works
- [ ] Hover tooltips show full paths

---

### Phase 4: Insertion & Text Manipulation (1.5-2 hours)

**Goal**: Insert selected suggestion into textarea at correct position.

#### 4.1 Text Insertion
- [ ] Implement text insertion:
  - [ ] Get cursor position
  - [ ] Get @ position
  - [ ] Replace @ and query with selected path
  - [ ] Update cursor position after insertion
- [ ] Insertion logic:
  ```typescript
  const insertSuggestion = (suggestion: FileSuggestion) => {
    const textarea = inputRef.current
    if (!textarea) return

    const value = textarea.value
    const cursorPos = textarea.selectionStart
    const textBeforeCursor = value.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      const beforeAt = value.substring(0, lastAtIndex)
      const afterCursor = value.substring(cursorPos)
      const newValue = `${beforeAt}${suggestion.path}${afterCursor}`

      setInputValue(newValue)

      // Set cursor after inserted path
      const newCursorPos = lastAtIndex + suggestion.path.length
      setTimeout(() => {
        textarea.setSelectionRange(newCursorPos, newCursorPos)
        textarea.focus()
      }, 0)
    }

    hideAutocomplete()
  }
  ```

#### 4.2 Cursor Position Management
- [ ] Handle cursor position:
  - [ ] Track cursor position during typing
  - [ ] Update cursor after insertion
  - [ ] Maintain cursor when autocomplete open
  - [ ] Handle cursor movement during autocomplete

#### 4.3 Text Selection Handling
- [ ] Handle text selection:
  - [ ] If text selected, replace selection
  - [ ] If no selection, insert at cursor
  - [ ] Preserve text before and after
  - [ ] Handle multi-line text

**Success Criteria**:
- [ ] Suggestions insert correctly
- [ ] Cursor position maintained
- [ ] Text manipulation works
- [ ] No text corruption

---

### Phase 5: Hover Tooltips & Polish (1-1.5 hours)

**Goal**: Add hover tooltips and polish the autocomplete UI.

#### 5.1 Full Path Tooltip
- [ ] Add hover tooltip:
  - [ ] Show full path on hover
  - [ ] Position tooltip near item
  - [ ] Style tooltip to match VSCode
- [ ] Tooltip implementation:
  - [ ] Use CSS tooltip or component
  - [ ] Show on mouse hover
  - [ ] Hide on mouse leave
  - [ ] Position correctly

#### 5.2 Autocomplete Styling
- [ ] Polish autocomplete UI:
  - [ ] Match VSCode autocomplete style
  - [ ] Proper shadows and borders
  - [ ] Smooth animations
  - [ ] Clear visual feedback
- [ ] Styling details:
  - [ ] Background color matching sidebar
  - [ ] Selected item highlight
  - [ ] Hover states
  - [ ] Icon alignment

#### 5.3 Performance Optimization
- [ ] Optimize autocomplete:
  - [ ] Debounce search queries
  - [ ] Limit suggestion count
  - [ ] Cache search results
  - [ ] Virtual scrolling for many results (optional)

**Success Criteria**:
- [ ] Hover tooltips work correctly
- [ ] Autocomplete styled properly
- [ ] Performance acceptable
- [ ] UI polished and professional

---

## Dependencies

### Internal Dependencies
- **Chat Interface**: Existing `ChatInterface.tsx` component
- **File Tree**: File tree data for suggestions
- **GraphQL API**: Directory contents query
- **File Icons**: File icon system (from file icon pack plan)

### External Dependencies
- **Optional**: Fuse.js for fuzzy search
- **Optional**: Downshift or Headless UI for autocomplete component

---

## Risk Assessment

### High Risk
- **Cursor Position Handling**: Complex textarea cursor manipulation
  - **Mitigation**: Careful cursor position tracking, test edge cases, handle selection properly

### Medium Risk
- **Autocomplete Performance**: Many files might slow down search
  - **Mitigation**: Debounce queries, limit results, cache searches, optimize filtering
- **UI Positioning**: Dropdown positioning might be complex
  - **Mitigation**: Use fixed positioning below input, or calculate position based on cursor

### Low Risk
- **File Search**: Standard file filtering
- **UI Components**: Standard React components

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Feature flag**: Disable @ autocomplete, keep basic input
- **Component removal**: Remove autocomplete components, restore simple textarea

### Phase-Specific Rollback
- **Phase 1**: Remove @ detection, keep basic input
- **Phase 2**: Remove file search, keep basic autocomplete
- **Phase 3**: Simplify UI, keep basic dropdown
- **Phase 4**: Simplify insertion, keep basic functionality
- **Phase 5**: Remove tooltips, keep basic autocomplete

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore previous chat input
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (@ Detection)
- [ ] @ character detected
- [ ] Autocomplete triggers
- [ ] Query extracted correctly
- [ ] Dropdown appears

### After Phase 2 (Suggestions)
- [ ] File search works
- [ ] Suggestions generated
- [ ] Filtering works
- [ ] Results relevant

### After Phase 3 (UI)
- [ ] Autocomplete UI displays
- [ ] Keyboard navigation works
- [ ] Suggestions selectable
- [ ] UI styled correctly

### After Phase 4 (Insertion)
- [ ] Suggestions insert correctly
- [ ] Cursor position maintained
- [ ] Text manipulation works
- [ ] No regressions

### After Phase 5 (Polish)
- [ ] Tooltips work
- [ ] UI polished
- [ ] Performance acceptable
- [ ] Integration complete

---

## Success Criteria

1. **@ Detection**: @ character detected in chat input
2. **Autocomplete Trigger**: Autocomplete appears when @ typed
3. **File Suggestions**: Files and folders suggested based on query
4. **Filtering**: Suggestions filter as user types
5. **Keyboard Navigation**: Arrow keys, Enter, Escape work
6. **Insertion**: Selected suggestion inserts at correct position
7. **Hover Tooltips**: Full paths shown on hover
8. **Cursor Management**: Cursor position handled correctly
9. **Performance**: Autocomplete responsive and fast
10. **Visual Design**: Matches Cursor/VSCode autocomplete style
11. **Integration**: Works seamlessly with existing chat
12. **No Regressions**: Existing chat functionality unchanged
13. **User Experience**: Intuitive and responsive
14. **Accessibility**: Keyboard navigation and screen reader support
15. **Documentation**: Code documented for future maintenance

---

## Code Examples

### Example: @ Detection in Chat Input
```tsx
// web/src/components/Chat/ChatInterface.tsx
const [showAutocomplete, setShowAutocomplete] = useState(false)
const [autocompleteQuery, setAutocompleteQuery] = useState('')
const [autocompletePosition, setAutocompletePosition] = useState<number | null>(null)
const [selectedIndex, setSelectedIndex] = useState(0)

const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const value = e.target.value
  const cursorPos = e.target.selectionStart
  setInputValue(value)

  // Detect @ mention
  const textBeforeCursor = value.substring(0, cursorPos)
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')

  if (lastAtIndex !== -1) {
    // Check if @ is valid (not part of a word)
    const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' '
    const isValidAt = charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0

    if (isValidAt) {
      const query = textBeforeCursor.substring(lastAtIndex + 1)
      // Check if query doesn't contain spaces (still in @ mention)
      if (!query.includes(' ') && !query.includes('\n')) {
        setAutocompleteQuery(query)
        setAutocompletePosition(lastAtIndex)
        setShowAutocomplete(true)
        setSelectedIndex(0)
        return
      }
    }
  }

  // Hide autocomplete if @ removed or invalid
  setShowAutocomplete(false)
  setAutocompleteQuery('')
  setAutocompletePosition(null)
}
```

### Example: Context Autocomplete Component
```tsx
// web/src/components/Chat/ContextAutocomplete.tsx
import { useState, useEffect } from 'react'
import { searchFiles } from 'src/services/contextAutocomplete'
import { useAppStore } from 'src/state/store'

interface ContextAutocompleteProps {
  query: string
  position: number
  onSelect: (suggestion: FileSuggestion) => void
  onClose: () => void
}

export const ContextAutocomplete = ({
  query,
  position,
  onSelect,
  onClose,
}: ContextAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<FileSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const openFolderPath = useAppStore((state) => state.openFolderPath)

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!query && query.length === 0) {
        // Show all files when query is empty
        setLoading(true)
        const results = await searchFiles('', openFolderPath || '/')
        setSuggestions(results.slice(0, 20))
        setLoading(false)
      } else {
        setLoading(true)
        const results = await searchFiles(query, openFolderPath || '/')
        setSuggestions(results.slice(0, 20))
        setLoading(false)
      }
      setSelectedIndex(0)
    }

    loadSuggestions()
  }, [query, openFolderPath])

  const handleSelect = (suggestion: FileSuggestion) => {
    onSelect(suggestion)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions[selectedIndex]) {
        handleSelect(suggestions[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (suggestions.length === 0 && !loading) {
    return null
  }

  return (
    <div
      className="absolute z-50 mt-1 max-h-64 w-96 overflow-y-auto rounded border border-vscode-border bg-vscode-sidebar-bg shadow-lg"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {loading ? (
        <div className="p-2 text-sm text-vscode-fg-secondary">Searching...</div>
      ) : (
        suggestions.map((suggestion, index) => (
          <SuggestionItem
            key={suggestion.path}
            suggestion={suggestion}
            isSelected={index === selectedIndex}
            isHovered={index === hoveredIndex}
            onSelect={() => handleSelect(suggestion)}
            onHover={() => setHoveredIndex(index)}
            onLeave={() => setHoveredIndex(null)}
          />
        ))
      )}
    </div>
  )
}
```

### Example: Suggestion Item Component
```tsx
// web/src/components/Chat/SuggestionItem.tsx
import { FileIcon } from '../FileTree/FileIcon'
import { useState } from 'react'

interface SuggestionItemProps {
  suggestion: FileSuggestion
  isSelected: boolean
  isHovered: boolean
  onSelect: () => void
  onHover: () => void
  onLeave: () => void
}

export const SuggestionItem = ({
  suggestion,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onLeave,
}: SuggestionItemProps) => {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors',
        isSelected || isHovered
          ? 'bg-vscode-selection-bg'
          : 'hover:bg-vscode-hover-bg'
      )}
      onClick={onSelect}
      onMouseEnter={() => {
        onHover()
        setShowTooltip(true)
      }}
      onMouseLeave={() => {
        onLeave()
        setShowTooltip(false)
      }}
    >
      <FileIcon
        fileName={suggestion.name}
        isDirectory={suggestion.type === 'folder'}
      />
      <span className="flex-1 text-sm text-vscode-fg">{suggestion.displayName}</span>

      {showTooltip && (
        <div className="absolute left-full ml-2 z-50 px-2 py-1 rounded bg-vscode-editor-bg border border-vscode-border shadow-lg text-xs text-vscode-fg whitespace-nowrap">
          {suggestion.fullPath}
        </div>
      )}
    </div>
  )
}
```

### Example: File Search Service
```typescript
// web/src/services/contextAutocomplete.ts
import { gql } from '@apollo/client'
import { useAppStore } from 'src/state/store'

interface FileSuggestion {
  type: 'file' | 'folder'
  path: string
  name: string
  displayName: string
  fullPath: string
}

const DIRECTORY_CONTENTS_QUERY = gql`
  query DirectoryContentsForAutocomplete($path: String!) {
    directoryContents(path: $path) {
      files {
        name
        path
        type
      }
      folders {
        name
        path
        type
      }
    }
  }
`

export async function searchFiles(
  query: string,
  rootPath: string
): Promise<FileSuggestion[]> {
  // Query directory contents
  const { data } = await apolloClient.query({
    query: DIRECTORY_CONTENTS_QUERY,
    variables: { path: rootPath },
  })

  const allItems: FileSuggestion[] = [
    ...(data.directoryContents.files || []).map((file: any) => ({
      type: 'file' as const,
      path: file.path,
      name: file.name,
      displayName: file.name,
      fullPath: file.path,
    })),
    ...(data.directoryContents.folders || []).map((folder: any) => ({
      type: 'folder' as const,
      path: folder.path,
      name: folder.name,
      displayName: folder.name,
      fullPath: folder.path,
    })),
  ]

  // Filter by query
  if (!query) {
    return allItems.slice(0, 20)
  }

  const lowerQuery = query.toLowerCase()
  const filtered = allItems.filter(item =>
    item.name.toLowerCase().includes(lowerQuery) ||
    item.path.toLowerCase().includes(lowerQuery)
  )

  // Sort by relevance (exact matches first, then by position in name)
  return filtered
    .sort((a, b) => {
      const aExact = a.name.toLowerCase().startsWith(lowerQuery)
      const bExact = b.name.toLowerCase().startsWith(lowerQuery)
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      return a.name.localeCompare(b.name)
    })
    .slice(0, 20)
}
```

### Example: Text Insertion
```tsx
// In ChatInterface.tsx
const handleSelectSuggestion = (suggestion: FileSuggestion) => {
  const textarea = inputRef.current
  if (!textarea) return

  const value = textarea.value
  const cursorPos = textarea.selectionStart

  if (autocompletePosition === null) return

  const beforeAt = value.substring(0, autocompletePosition)
  const afterCursor = value.substring(cursorPos)
  const newValue = `${beforeAt}${suggestion.path}${afterCursor}`

  setInputValue(newValue)

  // Set cursor after inserted path
  const newCursorPos = autocompletePosition + suggestion.path.length
  setTimeout(() => {
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    textarea.focus()
  }, 0)

  setShowAutocomplete(false)
  setAutocompleteQuery('')
  setAutocompletePosition(null)
}
```

---

## Notes

- @ should trigger autocomplete when typed
- Autocomplete should filter as user types after @
- Full paths should be shown on hover for clarity
- Keyboard navigation is essential for good UX
- Text insertion should be precise and maintain cursor position
- Performance is important - debounce searches, limit results
- Match Cursor's @ mention UX patterns
- Support both files and folders in suggestions
- Consider adding function/symbol suggestions in future
- Test with various file names and paths

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
