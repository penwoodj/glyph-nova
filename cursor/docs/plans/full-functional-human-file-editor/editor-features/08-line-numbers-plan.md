---
name: Line Numbers Implementation Plan
overview: Add line numbers to code editor (CodeEditor component) with synchronized scrolling and VSCode-style appearance
todos: []
---

# Line Numbers Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Add line numbers to the code editor (CodeEditor component) with synchronized scrolling, proper alignment, and VSCode-style appearance. Line numbers should be visible, clickable for navigation, and properly styled to match VSCode editor design patterns.

---

## Overview

This plan implements line numbers for the code editor that:
- Display line numbers in a gutter next to the editor
- Synchronize scrolling between line numbers and editor content
- Support click-to-navigate functionality
- Match VSCode line number styling and behavior
- Work with both editable and read-only modes
- Handle dynamic content updates
- Support large files efficiently

**Target**: Professional line numbers matching VSCode editor design patterns
**Priority**: High (essential editor feature)
**Estimated Time**: 4-6 hours (with 20% buffer: 4.8-7.2 hours)
**Risk Level**: Medium (requires careful synchronization and performance optimization)

---

## Current State Analysis

### Existing Implementation
- **CodeEditor Component**: Uses textarea for editing, SyntaxHighlighter for read-only
- **No Line Numbers**: CodeEditor doesn't display line numbers
- **VditorEditor**: Already has line numbers enabled (`lineNumber: true`) for markdown
- **Textarea-Based**: Editable mode uses plain textarea without line numbers
- **Syntax Highlighter**: Read-only mode uses react-syntax-highlighter (no line numbers configured)

### Gaps Identified
- No line number gutter in CodeEditor
- No synchronized scrolling between line numbers and content
- No line number styling matching VSCode
- No click-to-navigate functionality
- Line numbers not calculated or displayed

---

## External Documentation Links

### Line Number Implementation Patterns
1. **VSCode Editor Line Numbers**
   - Link: https://code.visualstudio.com/docs/getstarted/userinterface#_editor
   - Description: VSCode editor line number design and behavior
   - Rating: High - Official VSCode documentation

2. **Monaco Editor Line Numbers**
   - Link: https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IEditorOptions.html#lineNumbers
   - Description: Monaco editor line number configuration (VSCode's editor)
   - Rating: High - Monaco editor documentation

3. **CodeMirror Line Numbers**
   - Link: https://codemirror.net/docs/ref/#view.lineNumbers
   - Description: CodeMirror line number implementation patterns
   - Rating: High - Professional editor library

### React Implementation Patterns
4. **React Virtual Scrolling**
   - Link: https://react.dev/reference/react/useMemo
   - Description: React patterns for efficient rendering
   - Rating: Medium - React documentation

5. **React Window (Virtual Scrolling)**
   - Link: https://github.com/bvaughn/react-window
   - Description: Virtual scrolling library for React
   - Rating: High - Popular virtual scrolling solution

### CSS & Styling
6. **CSS Grid Layout**
   - Link: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout
   - Description: CSS Grid for layout (gutter + editor)
   - Rating: High - MDN documentation

7. **CSS Flexbox Layout**
   - Link: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout
   - Description: Flexbox for layout
   - Rating: High - MDN documentation

### Synchronization Patterns
8. **Synchronized Scrolling**
   - Link: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop
   - Description: Scroll synchronization techniques
   - Rating: High - MDN documentation

9. **React useSyncExternalStore**
   - Link: https://react.dev/reference/react/useSyncExternalStore
   - Description: React hook for external store synchronization
   - Rating: Medium - React documentation

### Performance Optimization
10. **React Performance Optimization**
    - Link: https://react.dev/learn/render-and-commit
    - Description: React rendering optimization
    - Rating: Medium - React documentation

11. **Debouncing and Throttling**
    - Link: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
    - Description: Performance optimization techniques
    - Rating: High - MDN documentation

---

## Implementation Phases

### Phase 1: Line Number Gutter Component (1.5-2 hours)

**Goal**: Create line number gutter component and basic layout.

#### 1.1 Create Line Number Component
- [ ] Create `LineNumbers.tsx` component:
  - [ ] Calculate line count from content
  - [ ] Render line numbers (1, 2, 3, ...)
  - [ ] Style to match VSCode (right-aligned, monospace font)
  - [ ] Handle empty content (show at least line 1)
- [ ] Line number calculation:
  ```typescript
  const lineCount = content.split('\n').length || 1
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1)
  ```

#### 1.2 Layout Integration
- [ ] Update `CodeEditor.tsx` layout:
  - [ ] Use CSS Grid or Flexbox for gutter + editor layout
  - [ ] Line number gutter: Fixed width (e.g., 50-60px)
  - [ ] Editor content: Takes remaining space
  - [ ] Ensure proper alignment
- [ ] Layout structure:
  ```tsx
  <div className="flex h-full">
    <LineNumbers content={content} />
    <textarea ... />
  </div>
  ```

#### 1.3 Basic Styling
- [ ] Style line number gutter:
  - [ ] Background: `var(--vscode-editorLineNumber-foreground)` or similar
  - [ ] Text color: Muted, right-aligned
  - [ ] Font: Monospace, same size as editor
  - [ ] Padding: Matches editor padding
  - [ ] Border: Right border for separation

**Success Criteria**:
- [ ] Line numbers display correctly
- [ ] Layout works (gutter + editor)
- [ ] Styling matches VSCode appearance
- [ ] Line count updates with content

---

### Phase 2: Scroll Synchronization (1.5-2 hours)

**Goal**: Synchronize scrolling between line numbers and editor content.

#### 2.1 Scroll Event Handling
- [ ] Add scroll event listeners:
  - [ ] Listen to textarea scroll events
  - [ ] Update line number gutter scroll position
  - [ ] Handle scroll synchronization bidirectionally
- [ ] Implement scroll sync:
  ```typescript
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumberRef.current) {
      lineNumberRef.current.scrollTop = e.currentTarget.scrollTop
    }
  }
  ```

#### 2.2 Scroll Position Sync
- [ ] Sync scroll positions:
  - [ ] Editor scroll → Line numbers scroll
  - [ ] Line numbers scroll → Editor scroll (optional)
  - [ ] Use `scrollTop` for vertical synchronization
  - [ ] Handle horizontal scroll if needed (usually not needed for line numbers)
- [ ] Prevent scroll loops:
  - [ ] Use flags to prevent infinite scroll loops
  - [ ] Only sync when scroll is user-initiated

#### 2.3 Scroll Performance
- [ ] Optimize scroll handling:
  - [ ] Use `requestAnimationFrame` for smooth scrolling
  - [ ] Throttle scroll events if needed
  - [ ] Ensure smooth 60fps scrolling
  - [ ] Test with large files (1000+ lines)

**Success Criteria**:
- [ ] Scrolling synchronized between gutter and editor
- [ ] Smooth scrolling performance
- [ ] No scroll loops or jank
- [ ] Works with large files

---

### Phase 3: Line Number Styling & Alignment (1 hour)

**Goal**: Style line numbers to match VSCode and ensure proper alignment.

#### 3.1 VSCode-Style Styling
- [ ] Match VSCode line number appearance:
  - [ ] Right-aligned numbers
  - [ ] Muted text color (not too bright)
  - [ ] Same font family and size as editor
  - [ ] Proper padding and spacing
  - [ ] Background color matches editor
- [ ] Use CSS variables:
  ```css
  color: var(--vscode-editorLineNumber-foreground);
  background: var(--vscode-editor-bg);
  ```

#### 3.2 Line Height Alignment
- [ ] Ensure line numbers align with content:
  - [ ] Match line height between gutter and editor
  - [ ] Same padding top/bottom
  - [ ] Align first line number with first line of content
  - [ ] Handle empty lines correctly
- [ ] Calculate line height:
  - [ ] Use same line height as editor (1.6 or similar)
  - [ ] Ensure pixel-perfect alignment

#### 3.3 Active Line Highlighting (Optional)
- [ ] Highlight current line number:
  - [ ] Detect cursor position
  - [ ] Highlight corresponding line number
  - [ ] Subtle background color change
  - [ ] Match VSCode active line indicator

**Success Criteria**:
- [ ] Line numbers styled like VSCode
- [ ] Perfect alignment with content
- [ ] Visual appearance professional
- [ ] Active line highlighting works (if implemented)

---

### Phase 4: Click-to-Navigate & Interactions (0.5-1 hour)

**Goal**: Add click-to-navigate functionality and other interactions.

#### 4.1 Click-to-Navigate
- [ ] Add click handlers to line numbers:
  - [ ] Click line number → Move cursor to that line
  - [ ] Scroll editor to show clicked line
  - [ ] Focus editor after click
- [ ] Implement line navigation:
  ```typescript
  const handleLineNumberClick = (lineNumber: number) => {
    const lines = content.split('\n')
    const position = lines.slice(0, lineNumber - 1).join('\n').length
    editorRef.current?.setSelectionRange(position, position)
    editorRef.current?.focus()
  }
  ```

#### 4.2 Selection Highlighting (Optional)
- [ ] Highlight selected line numbers:
  - [ ] Detect selected lines in editor
  - [ ] Highlight corresponding line numbers
  - [ ] Show selection range in gutter
  - [ ] Match VSCode selection behavior

#### 4.3 Accessibility
- [ ] Add accessibility features:
  - [ ] ARIA labels for line numbers
  - [ ] Keyboard navigation support
  - [ ] Screen reader announcements
  - [ ] Proper semantic HTML

**Success Criteria**:
- [ ] Click-to-navigate works
- [ ] Editor focuses and scrolls correctly
- [ ] Selection highlighting works (if implemented)
- [ ] Accessibility features added

---

### Phase 5: Read-Only Mode & Integration (0.5-1 hour)

**Goal**: Add line numbers to read-only mode and complete integration.

#### 5.1 Read-Only Mode Support
- [ ] Add line numbers to read-only SyntaxHighlighter:
  - [ ] Wrap SyntaxHighlighter with line number gutter
  - [ ] Sync scrolling with syntax-highlighted content
  - [ ] Handle pre-formatted code blocks
- [ ] Update read-only layout:
  - [ ] Same gutter + content layout
  - [ ] Line numbers for syntax-highlighted code
  - [ ] Proper alignment

#### 5.2 Integration Testing
- [ ] Test with various file types:
  - [ ] Code files (JS, TS, Python, etc.)
  - [ ] Plain text files
  - [ ] Large files (1000+ lines)
  - [ ] Files with long lines
- [ ] Test edge cases:
  - [ ] Empty files
  - [ ] Single line files
  - [ ] Files with no newlines
  - [ ] Very long files (10,000+ lines)

#### 5.3 Performance Testing
- [ ] Test performance:
  - [ ] Rendering with many lines
  - [ ] Scroll performance
  - [ ] Content update performance
  - [ ] Memory usage

**Success Criteria**:
- [ ] Line numbers work in read-only mode
- [ ] Integration tested and working
- [ ] Edge cases handled
- [ ] Performance acceptable

---

## Dependencies

### Internal Dependencies
- **CodeEditor Component**: Existing `CodeEditor.tsx` component
- **UI Foundation Plans**: Color theming system for VSCode colors
- **State Management**: Existing Zustand store (if needed for preferences)

### External Dependencies
- **None**: Pure React/CSS implementation, no new dependencies

---

## Risk Assessment

### High Risk
- **Scroll Synchronization**: Complex scroll sync might cause performance issues or bugs
  - **Mitigation**: Careful implementation, use requestAnimationFrame, test thoroughly

### Medium Risk
- **Performance with Large Files**: Many line numbers might impact performance
  - **Mitigation**: Consider virtual scrolling for very large files, optimize rendering
- **Alignment Issues**: Line numbers might not align perfectly with content
  - **Mitigation**: Careful CSS, test with various line heights and fonts

### Low Risk
- **Styling**: CSS changes are straightforward
- **Click Navigation**: Simple event handling

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Feature flag**: Disable line numbers, restore previous CodeEditor
- **Component restoration**: Restore previous CodeEditor without line numbers

### Phase-Specific Rollback
- **Phase 1**: Remove line number gutter, restore simple layout
- **Phase 2**: Remove scroll sync, keep static line numbers
- **Phase 3**: Simplify styling, keep basic appearance
- **Phase 4**: Remove click navigation, keep display only
- **Phase 5**: Remove read-only support, keep editable mode only

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore previous CodeEditor
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (Gutter Component)
- [ ] Line numbers display correctly
- [ ] Layout works (gutter + editor)
- [ ] Styling matches VSCode
- [ ] Line count updates with content

### After Phase 2 (Scroll Sync)
- [ ] Scrolling synchronized
- [ ] Smooth performance
- [ ] No scroll loops
- [ ] Works with large files

### After Phase 3 (Styling)
- [ ] Styled like VSCode
- [ ] Perfect alignment
- [ ] Visual appearance professional
- [ ] Active line highlighting works (if implemented)

### After Phase 4 (Interactions)
- [ ] Click-to-navigate works
- [ ] Editor focuses correctly
- [ ] Selection highlighting works (if implemented)
- [ ] Accessibility features added

### After Phase 5 (Integration)
- [ ] Read-only mode works
- [ ] Integration tested
- [ ] Edge cases handled
- [ ] Performance acceptable

---

## Success Criteria

1. **Line Numbers Display**: Line numbers visible in gutter next to editor
2. **Scroll Synchronization**: Line numbers scroll in sync with editor content
3. **VSCode Styling**: Matches VSCode line number appearance
4. **Alignment**: Perfect alignment between line numbers and content lines
5. **Click Navigation**: Clicking line number moves cursor to that line
6. **Read-Only Support**: Line numbers work in read-only mode
7. **Performance**: Smooth scrolling and rendering with large files
8. **Edge Cases**: Handles empty files, single lines, very long files
9. **Accessibility**: Keyboard navigation and screen reader support
10. **Integration**: Works seamlessly with existing CodeEditor
11. **No Regressions**: Existing editor functionality unchanged
12. **Visual Quality**: Professional appearance matching VSCode
13. **Active Line**: Current line highlighted (optional)
14. **Selection**: Selected lines highlighted in gutter (optional)
15. **Documentation**: Code documented for future maintenance

---

## Code Examples

### Example: Line Numbers Component
```tsx
// web/src/components/Editor/LineNumbers.tsx
import { useMemo, useRef, useEffect } from 'react'

interface LineNumbersProps {
  content: string
  scrollTop: number
  lineHeight: number
  onLineClick?: (lineNumber: number) => void
}

export const LineNumbers = ({
  content,
  scrollTop,
  lineHeight,
  onLineClick,
}: LineNumbersProps) => {
  const gutterRef = useRef<HTMLDivElement>(null)

  // Calculate line count
  const lineCount = useMemo(() => {
    if (!content) return 1
    return Math.max(1, content.split('\n').length)
  }, [content])

  // Sync scroll position
  useEffect(() => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop
    }
  }, [scrollTop])

  return (
    <div
      ref={gutterRef}
      className="flex-shrink-0 overflow-hidden bg-vscode-editor-bg border-r border-vscode-border"
      style={{
        width: '50px',
        padding: '1rem 0.5rem',
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        fontSize: '14px',
        lineHeight: `${lineHeight}`,
        color: 'var(--vscode-editorLineNumber-foreground)',
        textAlign: 'right',
        userSelect: 'none',
      }}
    >
      {Array.from({ length: lineCount }, (_, i) => (
        <div
          key={i + 1}
          className="cursor-pointer hover:bg-vscode-hover-bg"
          onClick={() => onLineClick?.(i + 1)}
          style={{
            height: `${lineHeight * 16}px`, // lineHeight * font-size
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '0.5rem',
          }}
        >
          {i + 1}
        </div>
      ))}
    </div>
  )
}
```

### Example: Updated CodeEditor with Line Numbers
```tsx
// web/src/components/Editor/CodeEditor.tsx
import { LineNumbers } from './LineNumbers'

export const CodeEditor = ({ ... }: CodeEditorProps) => {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const lineHeight = 1.6 // Match editor line height

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  const handleLineClick = (lineNumber: number) => {
    if (!editorRef.current) return

    const lines = editedContent.split('\n')
    const position = lines.slice(0, lineNumber - 1).join('\n').length + (lineNumber > 1 ? 1 : 0)

    editorRef.current.setSelectionRange(position, position)
    editorRef.current.focus()

    // Scroll to line
    const lineElement = editorRef.current
    const lineHeightPx = parseFloat(getComputedStyle(editorRef.current).lineHeight)
    editorRef.current.scrollTop = (lineNumber - 1) * lineHeightPx
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-vscode-editor-bg">
      <LineNumbers
        content={editedContent}
        scrollTop={scrollTop}
        lineHeight={lineHeight}
        onLineClick={handleLineClick}
      />
      <textarea
        ref={editorRef}
        value={editedContent}
        onChange={handleChange}
        onScroll={handleScroll}
        // ... other props
        className="flex-1 ..."
      />
    </div>
  )
}
```

### Example: Read-Only Mode with Line Numbers
```tsx
// Read-only mode with line numbers
if (readonly) {
  return (
    <div className="flex h-full w-full overflow-hidden bg-vscode-editor-bg">
      <LineNumbers
        content={editedContent}
        scrollTop={scrollTop}
        lineHeight={lineHeight}
      />
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <SyntaxHighlighter
          language={language}
          style={customStyle}
          // ... other props
        >
          {editedContent || placeholder}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
```

---

## Notes

- Line numbers should be right-aligned for better readability
- Use same font family and size as editor for alignment
- Consider virtual scrolling for files with 10,000+ lines
- Active line highlighting improves UX but is optional
- Click-to-navigate is essential for good UX
- Ensure line numbers don't interfere with editor functionality
- Test with various line heights and font sizes
- Performance is critical - optimize for large files

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
