---
name: Line Wrap Toggle Implementation Plan
overview: Add line wrap toggle functionality to code editor with settings persistence and visual indicator
todos: []
---

# Line Wrap Toggle Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Implement a line wrap toggle feature for the code editor that allows users to enable/disable word wrapping. The toggle should be accessible from the editor UI, persist in settings, and provide clear visual feedback. This matches VSCode's line wrap functionality.

---

## Overview

This plan implements line wrap toggle functionality that:
- Adds toggle button/control in editor UI
- Enables/disables word wrapping in textarea
- Persists preference in settings (user and folder settings)
- Provides visual indicator of wrap state
- Works with both editable and read-only modes
- Integrates with settings page (from settings plan)

**Target**: Line wrap toggle matching VSCode editor behavior
**Priority**: Medium (improves editor usability)
**Estimated Time**: 3-4 hours (with 20% buffer: 3.6-4.8 hours)
**Risk Level**: Low (CSS/textarea property change, low risk)

---

## Current State Analysis

### Existing Implementation
- **CodeEditor Component**: Uses textarea with `whiteSpace: 'pre'` (no wrapping)
- **No Line Wrap**: Editor doesn't support line wrapping
- **No Toggle**: No UI control for toggling line wrap
- **No Settings**: Line wrap preference not stored
- **VditorEditor**: May have its own wrap settings (separate implementation)

### Gaps Identified
- No line wrap toggle in editor UI
- No way to enable word wrapping
- No settings persistence for wrap preference
- Long lines require horizontal scrolling

---

## External Documentation Links

### Line Wrap Implementation
1. **VSCode Editor Word Wrap**
   - Link: https://code.visualstudio.com/docs/getstarted/userinterface#_editor
   - Description: VSCode editor word wrap settings and behavior
   - Rating: High - Official VSCode documentation

2. **CSS white-space Property**
   - Link: https://developer.mozilla.org/en-US/docs/Web/CSS/white-space
   - Description: CSS white-space values for text wrapping
   - Rating: High - MDN documentation

3. **HTML textarea wrap Attribute**
   - Link: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#wrap
   - Description: HTML textarea wrap attribute
   - Rating: High - MDN documentation

### Settings & Persistence
4. **VSCode Settings System**
   - Link: https://code.visualstudio.com/docs/getstarted/settings
   - Description: VSCode settings system (user vs workspace)
   - Rating: High - Official VSCode documentation

5. **localStorage API**
   - Link: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   - Description: Browser localStorage for persistence
   - Rating: High - MDN documentation

### UI/UX Design
6. **VSCode UI/UX Design Principles**
   - Link: https://github.com/microsoft/vscode/wiki/UX-Guidelines
   - Description: VSCode's official UX guidelines
   - Rating: High - Official design guidelines

7. **Material Design Toggle Buttons**
   - Link: https://m3.material.io/components/buttons/overview
   - Description: Material Design toggle button patterns
   - Rating: Medium - Design pattern reference

### Accessibility
8. **ARIA Button Pattern**
   - Link: https://www.w3.org/WAI/ARIA/apg/patterns/button/
   - Description: Accessible button component patterns
   - Rating: High - W3C accessibility guidelines

9. **Keyboard Shortcuts**
   - Link: https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
   - Description: WCAG keyboard navigation requirements
   - Rating: High - Accessibility standards

---

## Implementation Phases

### Phase 1: Line Wrap Implementation (1-1.5 hours)

**Goal**: Add line wrap functionality to CodeEditor component.

#### 1.1 Add Wrap State
- [ ] Add line wrap state to CodeEditor:
  - [ ] `const [lineWrap, setLineWrap] = useState(false)` (default: no wrap)
  - [ ] Or get from settings/store
- [ ] Update textarea styling:
  - [ ] When `lineWrap === false`: `whiteSpace: 'pre'` (no wrap)
  - [ ] When `lineWrap === true`: `whiteSpace: 'pre-wrap'` (wrap)
  - [ ] Update CSS class or inline styles

#### 1.2 Textarea Wrap Attribute
- [ ] Add wrap attribute to textarea:
  - [ ] `wrap="off"` when line wrap disabled
  - [ ] `wrap="soft"` when line wrap enabled
  - [ ] Or use CSS `white-space` property
- [ ] Ensure wrapping works correctly:
  - [ ] Long lines wrap at word boundaries
  - [ ] No horizontal scrollbar when wrapped
  - [ ] Cursor position updates correctly

#### 1.3 Read-Only Mode Support
- [ ] Add wrap support to read-only SyntaxHighlighter:
  - [ ] Wrap syntax-highlighted code blocks
  - [ ] Use CSS `white-space: pre-wrap` for wrapped mode
  - [ ] Ensure highlighting works with wrapped lines

**Success Criteria**:
- [ ] Line wrap can be toggled programmatically
- [ ] Textarea wraps/unwraps correctly
- [ ] Read-only mode supports wrapping
- [ ] No layout issues when toggling

---

### Phase 2: Toggle UI Component (1-1.5 hours)

**Goal**: Add toggle button/control in editor UI.

#### 2.1 Create Toggle Button
- [ ] Add toggle button to editor:
  - [ ] Position: Top-right of editor (like VSCode)
  - [ ] Or in editor toolbar/header
  - [ ] Icon: Wrap/unwrap icon (e.g., from lucide-react)
- [ ] Button styling:
  - [ ] VSCode-style icon button
  - [ ] Hover states
  - [ ] Active state when wrap enabled
  - [ ] Tooltip: "Toggle Word Wrap"

#### 2.2 Toggle Functionality
- [ ] Connect toggle to wrap state:
  - [ ] Click button → Toggle `lineWrap` state
  - [ ] Update textarea styling
  - [ ] Visual feedback (icon changes)
- [ ] Handle toggle:
  ```typescript
  const handleToggleWrap = () => {
    setLineWrap(prev => !prev)
  }
  ```

#### 2.3 Visual Indicator
- [ ] Show wrap state visually:
  - [ ] Icon changes (wrap icon vs unwrap icon)
  - [ ] Button highlighted when wrap enabled
  - [ ] Tooltip updates with current state
- [ ] Icons:
  - [ ] Wrap enabled: `WrapText` or similar icon
  - [ ] Wrap disabled: `Unwrap` or `AlignLeft` icon

**Success Criteria**:
- [ ] Toggle button visible and functional
- [ ] Click toggles wrap state
- [ ] Visual feedback clear
- [ ] Tooltip helpful

---

### Phase 3: Settings Integration (1 hour)

**Goal**: Persist line wrap preference in settings.

#### 3.1 Settings Store
- [ ] Add to Zustand store or settings:
  - [ ] `editorLineWrap: boolean` in settings
  - [ ] Default: `false` (no wrap)
  - [ ] User setting (global) and folder setting (workspace)
- [ ] Settings structure:
  ```typescript
  interface EditorSettings {
    lineWrap: boolean // User setting
    // ... other settings
  }
  interface FolderSettings {
    editor?: {
      lineWrap?: boolean // Folder-specific override
    }
  }
  ```

#### 3.2 Load from Settings
- [ ] Load wrap preference on editor mount:
  - [ ] Check folder settings first (if in workspace)
  - [ ] Fall back to user settings
  - [ ] Apply to editor state
- [ ] Update settings when toggled:
  - [ ] Save to appropriate settings (user or folder)
  - [ ] Persist to localStorage or settings file

#### 3.3 Settings Page Integration
- [ ] Add to settings page (when implemented):
  - [ ] Editor settings section
  - [ ] Toggle for "Word Wrap"
  - [ ] User settings and folder settings tabs
  - [ ] Description: "Enable word wrapping in editor"

**Success Criteria**:
- [ ] Wrap preference persists
- [ ] Loads correctly on editor mount
- [ ] Settings page shows toggle (when implemented)
- [ ] User and folder settings supported

---

### Phase 4: Integration & Polish (0.5-1 hour)

**Goal**: Complete integration and add polish.

#### 4.1 Editor Integration
- [ ] Ensure toggle works with:
  - [ ] File switching (preserve wrap state or load from settings)
  - [ ] Editor resize
  - [ ] Read-only mode
  - [ ] Different file types
- [ ] Test edge cases:
  - [ ] Very long lines
  - [ ] Empty files
  - [ ] Files with no newlines

#### 4.2 Visual Polish
- [ ] Polish toggle button:
  - [ ] Smooth transitions
  - [ ] Clear active state
  - [ ] Proper positioning
  - [ ] Doesn't interfere with editor content
- [ ] Ensure wrapping looks good:
  - [ ] Proper indentation for wrapped lines
  - [ ] Visual indicator for wrapped lines (optional)
  - [ ] No layout shifts

#### 4.3 Keyboard Shortcut (Optional)
- [ ] Add keyboard shortcut:
  - [ ] `Alt+Z` (VSCode default) or `Ctrl+Alt+W`
  - [ ] Toggle wrap on shortcut
  - [ ] Show in tooltip
  - [ ] Document in keyboard shortcuts

**Success Criteria**:
- [ ] Integration tested and working
- [ ] Visual polish complete
- [ ] Edge cases handled
- [ ] Keyboard shortcut works (if implemented)

---

## Dependencies

### Internal Dependencies
- **CodeEditor Component**: Existing `CodeEditor.tsx` component
- **Settings System**: Settings page and settings store (from settings plan)
- **UI Foundation Plans**: Icon library for toggle button

### External Dependencies
- **None**: Pure CSS/React implementation, no new dependencies

---

## Risk Assessment

### High Risk
- **None**: Low-risk feature

### Medium Risk
- **Settings Integration**: Depends on settings system implementation
  - **Mitigation**: Can use localStorage as fallback, integrate with settings later
- **Line Number Alignment**: Wrapped lines might affect line number alignment
  - **Mitigation**: Line numbers should still work (one line number per logical line)

### Low Risk
- **CSS Changes**: Simple white-space property change
- **Toggle Button**: Standard UI component

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Feature flag**: Disable line wrap toggle, restore previous editor
- **Settings removal**: Remove wrap setting, keep default behavior

### Phase-Specific Rollback
- **Phase 1**: Remove wrap functionality, restore previous textarea
- **Phase 2**: Remove toggle button, keep wrap state internal
- **Phase 3**: Remove settings integration, use localStorage only
- **Phase 4**: Simplify polish, keep basic functionality

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore previous editor
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (Wrap Implementation)
- [ ] Line wrap toggles programmatically
- [ ] Textarea wraps/unwraps correctly
- [ ] Read-only mode supports wrapping
- [ ] No layout issues

### After Phase 2 (Toggle UI)
- [ ] Toggle button visible and functional
- [ ] Click toggles wrap state
- [ ] Visual feedback clear
- [ ] Tooltip helpful

### After Phase 3 (Settings)
- [ ] Wrap preference persists
- [ ] Loads correctly on mount
- [ ] Settings page shows toggle (when implemented)
- [ ] User and folder settings supported

### After Phase 4 (Integration)
- [ ] Integration tested
- [ ] Visual polish complete
- [ ] Edge cases handled
- [ ] Keyboard shortcut works (if implemented)

---

## Success Criteria

1. **Line Wrap Toggle**: Toggle button in editor UI
2. **Wrap Functionality**: Textarea wraps/unwraps correctly
3. **Settings Persistence**: Wrap preference saved and loaded
4. **Visual Feedback**: Clear indication of wrap state
5. **Read-Only Support**: Wrapping works in read-only mode
6. **Settings Integration**: Toggle in settings page (when implemented)
7. **User & Folder Settings**: Support for both user and folder settings
8. **Keyboard Shortcut**: Optional keyboard shortcut for toggle
9. **No Regressions**: Existing editor functionality unchanged
10. **Visual Quality**: Professional appearance matching VSCode
11. **Edge Cases**: Handles long lines, empty files, etc.
12. **Performance**: No performance impact from wrapping
13. **Accessibility**: Keyboard accessible and screen reader friendly
14. **Documentation**: Code documented for future maintenance
15. **User Experience**: Intuitive and responsive toggle

---

## Code Examples

### Example: Line Wrap State and Styling
```tsx
// web/src/components/Editor/CodeEditor.tsx
export const CodeEditor = ({ ... }: CodeEditorProps) => {
  const [lineWrap, setLineWrap] = useState(() => {
    // Load from settings or localStorage
    const saved = localStorage.getItem('editor-line-wrap')
    return saved ? JSON.parse(saved) : false
  })

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('editor-line-wrap', JSON.stringify(lineWrap))
  }, [lineWrap])

  return (
    <div className="relative h-full w-full">
      {/* Toggle Button */}
      <button
        onClick={() => setLineWrap(prev => !prev)}
        className="absolute top-2 right-2 z-10 p-1.5 rounded hover:bg-vscode-hover-bg"
        title={lineWrap ? 'Disable Word Wrap' : 'Enable Word Wrap'}
        aria-label={lineWrap ? 'Disable word wrap' : 'Enable word wrap'}
      >
        {lineWrap ? (
          <WrapText className="h-4 w-4 text-vscode-fg-secondary" />
        ) : (
          <AlignLeft className="h-4 w-4 text-vscode-fg-secondary" />
        )}
      </button>

      {/* Textarea */}
      <textarea
        value={editedContent}
        onChange={handleChange}
        wrap={lineWrap ? 'soft' : 'off'}
        style={{
          whiteSpace: lineWrap ? 'pre-wrap' : 'pre',
          // ... other styles
        }}
        // ... other props
      />
    </div>
  )
}
```

### Example: Settings Store Integration
```typescript
// web/src/state/store.ts
interface EditorSettings {
  lineWrap: boolean
  // ... other editor settings
}

interface AppState {
  // ... existing state
  editorSettings: EditorSettings
  setEditorLineWrap: (wrap: boolean) => void
}

// In store implementation
editorSettings: {
  lineWrap: false,
},

setEditorLineWrap: (wrap) => set((state) => ({
  editorSettings: {
    ...state.editorSettings,
    lineWrap: wrap,
  },
})),

// In persist middleware
partialize: (state) => ({
  // ... existing persisted state
  editorSettings: state.editorSettings,
}),
```

### Example: Settings Page Integration
```tsx
// web/src/pages/SettingsPage/EditorSettings.tsx (when implemented)
export const EditorSettings = () => {
  const lineWrap = useAppStore((state) => state.editorSettings.lineWrap)
  const setEditorLineWrap = useAppStore((state) => state.setEditorLineWrap)

  return (
    <div className="settings-section">
      <h3>Editor</h3>
      <div className="setting-item">
        <label>
          <input
            type="checkbox"
            checked={lineWrap}
            onChange={(e) => setEditorLineWrap(e.target.checked)}
          />
          <span>Word Wrap</span>
        </label>
        <p className="setting-description">
          Enable word wrapping in the editor. Long lines will wrap to fit the editor width.
        </p>
      </div>
    </div>
  )
}
```

### Example: Read-Only Mode with Wrap
```tsx
// Read-only mode with wrap support
if (readonly) {
  return (
    <div
      className="h-full w-full overflow-auto bg-vscode-editor-bg"
      style={{
        whiteSpace: lineWrap ? 'pre-wrap' : 'pre',
      }}
    >
      <SyntaxHighlighter
        language={language}
        style={customStyle}
        customStyle={{
          whiteSpace: lineWrap ? 'pre-wrap' : 'pre',
          // ... other styles
        }}
      >
        {editedContent || placeholder}
      </SyntaxHighlighter>
    </div>
  )
}
```

### Example: Keyboard Shortcut
```tsx
// Add keyboard shortcut for toggle
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Alt+Z (VSCode default) or Ctrl+Alt+W
    if ((e.altKey && e.key === 'z') || (e.ctrlKey && e.altKey && e.key === 'w')) {
      e.preventDefault()
      setLineWrap(prev => !prev)
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [])
```

---

## Notes

- Default to no wrap (matches VSCode default)
- Toggle button should be unobtrusive but accessible
- Settings persistence is important for user experience
- Consider per-file-type wrap settings (optional)
- Wrapped lines should maintain proper indentation
- Line numbers should still work (one number per logical line)
- Keyboard shortcut improves accessibility
- Settings page integration can be done later when settings page is implemented

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
