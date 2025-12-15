---
name: Draggable Panels Implementation Plan
overview: Enhance panel resizing system with improved draggable borders, smooth interactions, panel collapse/expand functionality, and VSCode/Cursor-style panel management
todos: []
---

# Draggable Panels Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Enhance the existing panel resizing system with improved draggable borders, smooth interactions, panel collapse/expand functionality, visual feedback during drag, and panel state persistence - all matching VSCode/Cursor design patterns.

---

## Overview

This plan enhances the existing panel resizing functionality in GlyphNova to provide:
- Improved draggable panel borders with better visual feedback
- Smooth drag interactions with proper cursor states
- Panel collapse/expand functionality (minimize panels)
- Visual indicators during drag operations
- Panel state persistence across sessions
- Better minimum/maximum width constraints
- Integration with existing DesktopLayout component

**Target**: Professional draggable panel system matching VSCode/Cursor design patterns
**Priority**: High (core layout functionality)
**Estimated Time**: 6-8 hours (with 20% buffer: 7.2-9.6 hours)
**Risk Level**: Medium (enhances existing functionality, requires careful integration)

---

## Current State Analysis

### Existing Implementation
- **Basic Resizing**: `DesktopLayout.tsx` has basic resize functionality
- **Mouse Events**: Uses mouse events (mousedown, mousemove, mouseup)
- **Resize Handles**: 1px borders on left/right panels
- **State Management**: Panel widths stored in Zustand store
- **Constraints**: Basic min/max width constraints (150-600px left, 200-800px right)
- **No Collapse**: Panels cannot be collapsed/minimized
- **Basic Feedback**: Simple hover state on resize handles

### Gaps Identified
- Resize handles are thin (1px) and hard to grab
- No visual feedback during drag (cursor change, drag indicator)
- No panel collapse/expand functionality
- No smooth animations when resizing
- Limited visual feedback during drag operations
- No panel state persistence (collapse state)
- Resize handles could be more visible/accessible

---

## External Documentation Links

### Resizable Panel Libraries
1. **react-resizable-panels**
   - Link: https://github.com/bvaughn/react-resizable-panels
   - Description: Modern, accessible resizable panel library for React
   - Rating: High - Well-maintained, VSCode-like behavior

2. **react-resizable-panels Documentation**
   - Link: https://react-resizable-panels.vercel.app/
   - Description: Official documentation and examples
   - Rating: High - Comprehensive documentation

3. **react-split-pane**
   - Link: https://github.com/tomkp/react-split-pane
   - Description: Split pane component for React
   - Rating: Medium - Older library, less maintained

4. **@deviousm/react-split-pane**
   - Link: https://www.npmjs.com/package/@deviousm/react-split-pane
   - Description: Fork of react-split-pane with additional features
   - Rating: Medium - Alternative to original

### VSCode Panel Patterns
5. **VSCode Panel Management**
   - Link: https://code.visualstudio.com/docs/getstarted/userinterface#_panel-layout
   - Description: VSCode panel layout and management features
   - Rating: High - Official VSCode documentation

6. **VSCode UI/UX Design Principles**
   - Link: https://github.com/microsoft/vscode/wiki/UX-Guidelines
   - Description: VSCode's official UX guidelines
   - Rating: High - Official design guidelines

### Drag & Interaction Patterns
7. **CSS Cursor Property**
   - Link: https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
   - Description: CSS cursor types for drag operations
   - Rating: High - MDN documentation

8. **Pointer Events API**
   - Link: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
   - Description: Modern pointer events for better touch/mouse support
   - Rating: Medium - MDN documentation

### Animation & Transitions
9. **CSS Transitions**
   - Link: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions
   - Description: CSS transitions for smooth animations
   - Rating: High - MDN documentation

10. **React Spring (Optional)**
    - Link: https://www.react-spring.dev/
    - Description: Animation library for React (if complex animations needed)
    - Rating: Medium - Third-party library

### Accessibility
11. **ARIA Separator Role**
    - Link: https://www.w3.org/WAI/ARIA/apg/patterns/separator/
    - Description: Accessible separator/resizer patterns
    - Rating: High - W3C accessibility guidelines

12. **Keyboard Navigation for Panels**
    - Link: https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
    - Description: WCAG keyboard navigation requirements
    - Rating: High - Accessibility standards

---

## Implementation Phases

### Phase 1: Enhanced Resize Handles (1.5-2 hours)

**Goal**: Improve resize handles with better visibility, visual feedback, and interaction.

#### 1.1 Enhance Resize Handle Design
- [ ] Update resize handles in `DesktopLayout.tsx`:
  - [ ] Increase handle width from 1px to 4-6px for easier grabbing
  - [ ] Add visible background color (subtle, matches theme)
  - [ ] Add hover state with more prominent color
  - [ ] Add active/dragging state with distinct color
  - [ ] Add cursor: `col-resize` during hover and drag
- [ ] Style handles to match VSCode:
  - [ ] Subtle background: `bg-vscode-border` or similar
  - [ ] Hover: `bg-vscode-active-border` or `bg-vscode-hover-bg`
  - [ ] Active: `bg-vscode-active-border` (more prominent)
  - [ ] Smooth transitions between states

#### 1.2 Visual Feedback During Drag
- [ ] Add visual feedback during drag:
  - [ ] Change cursor to `col-resize` globally during drag
  - [ ] Add drag indicator (optional: show width or percentage)
  - [ ] Highlight resize handle during drag
  - [ ] Add subtle overlay or guide line (optional)
- [ ] Prevent text selection during drag:
  - [ ] Add `user-select: none` during drag
  - [ ] Prevent default drag behavior

#### 1.3 Improve Handle Accessibility
- [ ] Enhance ARIA attributes:
  - [ ] Add `aria-label` with current width
  - [ ] Add `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
  - [ ] Add `role="separator"` with proper attributes
- [ ] Add keyboard support (optional):
  - [ ] Arrow keys to resize panels
  - [ ] Enter to toggle collapse

**Success Criteria**:
- [ ] Resize handles more visible and easier to grab
- [ ] Visual feedback during drag operations
- [ ] Cursor changes appropriately
- [ ] Accessibility attributes added

---

### Phase 2: Panel Collapse/Expand (2-2.5 hours)

**Goal**: Add ability to collapse/expand panels (minimize to edge).

#### 2.1 Add Collapse State Management
- [ ] Extend Zustand store in `web/src/state/store.ts`:
  - [ ] Add `leftPanelCollapsed: boolean` state
  - [ ] Add `rightPanelCollapsed: boolean` state
  - [ ] Add `setLeftPanelCollapsed: (collapsed: boolean) => void` action
  - [ ] Add `setRightPanelCollapsed: (collapsed: boolean) => void` action
- [ ] Persist collapse state:
  - [ ] Add to Zustand persist middleware
  - [ ] Restore collapse state on app startup

#### 2.2 Implement Collapse Functionality
- [ ] Update `DesktopLayout.tsx` to support collapse:
  - [ ] When collapsed, set panel width to 0 or minimal width (e.g., 30px for icon)
  - [ ] Hide panel content when collapsed
  - [ ] Show collapse/expand button or icon
  - [ ] Animate collapse/expand with CSS transitions
- [ ] Add collapse triggers:
  - [ ] Double-click resize handle to toggle collapse
  - [ ] Click collapse button/icon
  - [ ] Keyboard shortcut (optional)

#### 2.3 Collapse Button UI
- [ ] Add collapse/expand buttons:
  - [ ] Small icon button on panel edge when collapsed
  - [ ] Or button in panel header
  - [ ] Use chevron icons (left/right arrows)
  - [ ] Match VSCode collapse button design
- [ ] Style collapse buttons:
  - [ ] VSCode-style icon buttons
  - [ ] Hover states
  - [ ] Proper positioning

**Success Criteria**:
- [ ] Panels can be collapsed/expanded
- [ ] Collapse state persists across sessions
- [ ] Smooth animations when collapsing/expanding
- [ ] Collapse buttons visible and functional

---

### Phase 3: Enhanced Resize Logic (1.5-2 hours)

**Goal**: Improve resize logic with better constraints, smooth interactions, and edge case handling.

#### 3.1 Improve Resize Constraints
- [ ] Enhance min/max width logic:
  - [ ] Dynamic constraints based on window size
  - [ ] Ensure center panel always has minimum width
  - [ ] Prevent panels from overlapping
  - [ ] Handle edge cases (very small windows)
- [ ] Add snap points (optional):
  - [ ] Snap to common widths (200px, 300px, etc.)
  - [ ] Snap when dragging near certain widths
  - [ ] Visual feedback when snapping

#### 3.2 Smooth Resize Interactions
- [ ] Improve resize performance:
  - [ ] Use `requestAnimationFrame` for smooth updates
  - [ ] Throttle resize updates if needed
  - [ ] Optimize re-renders during drag
- [ ] Add resize animations:
  - [ ] Smooth transitions when programmatically resizing
  - [ ] Disable transitions during drag (for responsiveness)
  - [ ] Re-enable transitions after drag

#### 3.3 Edge Case Handling
- [ ] Handle window resize:
  - [ ] Adjust panel widths when window resizes
  - [ ] Maintain proportions or reset to defaults
  - [ ] Handle very small windows gracefully
- [ ] Handle panel state conflicts:
  - [ ] Prevent both panels from collapsing if center would be too small
  - [ ] Ensure at least one panel is always visible
  - [ ] Handle rapid collapse/expand actions

**Success Criteria**:
- [ ] Resize constraints work correctly
- [ ] Smooth resize interactions
- [ ] Edge cases handled gracefully
- [ ] Performance acceptable during drag

---

### Phase 4: Integration & Polish (1-1.5 hours)

**Goal**: Complete integration and add polish.

#### 4.1 State Persistence
- [ ] Ensure panel state persists:
  - [ ] Panel widths persist (already implemented)
  - [ ] Collapse states persist
  - [ ] State restores correctly on app startup
  - [ ] Handle invalid persisted state gracefully

#### 4.2 Visual Polish
- [ ] Polish resize handles:
  - [ ] Smooth hover transitions
  - [ ] Proper z-index to stay above content
  - [ ] Visual feedback matches VSCode
- [ ] Polish collapse animations:
  - [ ] Smooth expand/collapse transitions
  - [ ] Content fades in/out appropriately
  - [ ] No layout shifts or jumps

#### 4.3 Integration Testing
- [ ] Test with file tree:
  - [ ] File tree works when panel resized
  - [ ] File tree works when panel collapsed
  - [ ] No content overflow issues
- [ ] Test with editor:
  - [ ] Editor adapts to panel size changes
  - [ ] Editor works when panels collapsed
  - [ ] No layout issues
- [ ] Test with chat:
  - [ ] Chat panel resizes correctly
  - [ ] Chat works when collapsed
  - [ ] No content clipping

**Success Criteria**:
- [ ] State persistence working
- [ ] Visual polish complete
- [ ] Integration tested and working
- [ ] No regressions in existing functionality

---

### Phase 5: Testing & Validation (0.5-1 hour)

**Goal**: Comprehensive testing and validation.

#### 5.1 Functionality Testing
- [ ] Test resize functionality:
  - [ ] Left panel resizes correctly
  - [ ] Right panel resizes correctly
  - [ ] Constraints enforced properly
  - [ ] State updates correctly
- [ ] Test collapse functionality:
  - [ ] Left panel collapses/expands
  - [ ] Right panel collapses/expands
  - [ ] State persists correctly
  - [ ] Animations smooth

#### 5.2 Edge Case Testing
- [ ] Test with different window sizes:
  - [ ] Very small windows
  - [ ] Very large windows
  - [ ] Window resize during drag
- [ ] Test rapid interactions:
  - [ ] Rapid resize operations
  - [ ] Rapid collapse/expand
  - [ ] Multiple panels collapsing

#### 5.3 Performance Testing
- [ ] Test resize performance:
  - [ ] Smooth during drag (60fps)
  - [ ] No lag or stuttering
  - [ ] No memory leaks
- [ ] Test with many components:
  - [ ] File tree with many files
  - [ ] Editor with large files
  - [ ] Chat with many messages

**Success Criteria**:
- [ ] All functionality tested and working
- [ ] Edge cases handled
- [ ] Performance acceptable
- [ ] No regressions

---

## Dependencies

### Internal Dependencies
- **UI Foundation Plans**: Color theming and spacing systems
- **DesktopLayout Component**: Existing `DesktopLayout.tsx` component
- **State Store**: Existing Zustand store

### External Dependencies
- **Optional Library**: `react-resizable-panels` (if replacing current implementation)
- **CSS Transitions**: For smooth animations
- **React Hooks**: For state management and event handling

---

## Risk Assessment

### High Risk
- **Breaking Existing Functionality**: Enhancing resize might break current behavior
  - **Mitigation**: Careful integration, comprehensive testing, gradual enhancement

### Medium Risk
- **Performance During Drag**: Many re-renders during drag might impact performance
  - **Mitigation**: Optimize with requestAnimationFrame, throttle updates, memoization
- **State Management Complexity**: Adding collapse state adds complexity
  - **Mitigation**: Clear state structure, thorough testing, handle edge cases

### Low Risk
- **Visual Enhancements**: Improving handles and feedback is straightforward
- **CSS Animations**: Transitions are well-supported

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Feature flag**: Disable enhanced features, restore basic resize
- **State removal**: Remove collapse state, keep basic resize

### Phase-Specific Rollback
- **Phase 1**: Restore previous handle styling, keep basic resize
- **Phase 2**: Remove collapse functionality, keep enhanced handles
- **Phase 3**: Restore previous resize logic, keep collapse
- **Phase 4**: Remove polish, keep core functionality

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore previous DesktopLayout
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (Enhanced Handles)
- [ ] Resize handles more visible
- [ ] Visual feedback during drag
- [ ] Cursor changes correctly
- [ ] No regressions in resize functionality

### After Phase 2 (Collapse/Expand)
- [ ] Panels can collapse/expand
- [ ] State persists correctly
- [ ] Animations smooth
- [ ] No layout issues

### After Phase 3 (Enhanced Logic)
- [ ] Resize constraints work correctly
- [ ] Smooth interactions
- [ ] Edge cases handled
- [ ] Performance acceptable

### After Phase 4 (Integration)
- [ ] State persistence working
- [ ] Visual polish complete
- [ ] Integration tested
- [ ] No regressions

### After Phase 5 (Testing)
- [ ] All functionality verified
- [ ] Edge cases handled
- [ ] Performance acceptable
- [ ] No regressions

---

## Success Criteria

1. **Enhanced Resize Handles**: More visible, easier to grab (4-6px width)
2. **Visual Feedback**: Clear feedback during drag operations
3. **Smooth Interactions**: Smooth resize with proper cursor states
4. **Panel Collapse**: Panels can be collapsed/expanded
5. **State Persistence**: Collapse state persists across sessions
6. **Resize Constraints**: Proper min/max constraints enforced
7. **Edge Case Handling**: Handles window resize, small windows, etc.
8. **Performance**: Smooth 60fps during drag operations
9. **Accessibility**: Proper ARIA attributes and keyboard support
10. **Visual Design**: Matches VSCode/Cursor panel design patterns
11. **Integration**: Works seamlessly with file tree, editor, and chat
12. **No Regressions**: Existing functionality unchanged
13. **Animations**: Smooth collapse/expand animations
14. **User Experience**: Intuitive and responsive interactions
15. **Documentation**: Code documented for future maintenance

---

## Code Examples

### Example: Enhanced Resize Handle
```tsx
// web/src/components/Layouts/DesktopLayout/DesktopLayout.tsx
<div
  className={cn(
    'absolute right-0 top-0 h-full transition-colors',
    'w-1 hover:w-1.5', // Wider on hover
    isResizingLeft
      ? 'bg-vscode-active-border cursor-col-resize'
      : 'bg-vscode-border hover:bg-vscode-hover-bg cursor-col-resize'
  )}
  onMouseDown={handleLeftResizeStart}
  role="separator"
  aria-label="Resize left panel"
  aria-valuemin={150}
  aria-valuemax={600}
  aria-valuenow={leftWidth}
  style={{
    userSelect: isResizingLeft ? 'none' : 'auto',
  }}
/>
```

### Example: Collapse State in Store
```typescript
// web/src/state/store.ts
interface AppState {
  // ... existing state
  leftPanelCollapsed: boolean
  rightPanelCollapsed: boolean

  // Actions
  setLeftPanelCollapsed: (collapsed: boolean) => void
  setRightPanelCollapsed: (collapsed: boolean) => void
}

// In store implementation
leftPanelCollapsed: false,
rightPanelCollapsed: false,

setLeftPanelCollapsed: (collapsed) => set({ leftPanelCollapsed: collapsed }),
setRightPanelCollapsed: (collapsed) => set({ rightPanelCollapsed: collapsed }),

// In persist middleware
partialize: (state) => ({
  // ... existing persisted state
  leftPanelCollapsed: state.leftPanelCollapsed,
  rightPanelCollapsed: state.rightPanelCollapsed,
}),
```

### Example: Collapsed Panel Rendering
```tsx
// web/src/components/Layouts/DesktopLayout/DesktopLayout.tsx
const leftPanelCollapsed = useAppStore((state) => state.leftPanelCollapsed)
const setLeftPanelCollapsed = useAppStore((state) => state.setLeftPanelCollapsed)

{/* Left Panel */}
<div
  className={cn(
    'relative flex-shrink-0 border-r border-vscode-border bg-vscode-sidebar-bg overflow-hidden transition-all',
    leftPanelCollapsed ? 'w-8' : 'w-auto'
  )}
  style={{
    width: leftPanelCollapsed ? '32px' : `${leftWidth}px`,
    maxWidth: leftPanelCollapsed ? '32px' : `${leftWidth}px`,
  }}
>
  {leftPanelCollapsed ? (
    <button
      onClick={() => setLeftPanelCollapsed(false)}
      className="w-full h-full flex items-center justify-center hover:bg-vscode-hover-bg"
      aria-label="Expand left panel"
    >
      <ChevronRight className="w-4 h-4 text-vscode-fg-secondary" />
    </button>
  ) : (
    <>
      {leftPanel}
      <button
        onClick={() => setLeftPanelCollapsed(true)}
        className="absolute top-2 right-2 p-1 hover:bg-vscode-hover-bg rounded"
        aria-label="Collapse left panel"
      >
        <ChevronLeft className="w-4 h-4 text-vscode-fg-secondary" />
      </button>
    </>
  )}
  {/* Resize Handle - hidden when collapsed */}
  {!leftPanelCollapsed && (
    <div
      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-vscode-active-border transition-colors"
      onMouseDown={handleLeftResizeStart}
      onDoubleClick={() => setLeftPanelCollapsed(true)}
      role="separator"
      aria-label="Resize left panel"
    />
  )}
</div>
```

### Example: Smooth Resize with requestAnimationFrame
```tsx
// web/src/components/Layouts/DesktopLayout/DesktopLayout.tsx
const handleMouseMove = useCallback(
  (e: MouseEvent) => {
    if (isResizingLeft || isResizingRight) {
      requestAnimationFrame(() => {
        if (isResizingLeft) {
          const newWidth = e.clientX
          const minWidth = 150
          const maxWidth = 600
          const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
          setLeftWidth(clampedWidth)
          onLeftPanelResize?.(clampedWidth)
        }
        if (isResizingRight) {
          const newWidth = window.innerWidth - e.clientX
          const minWidth = 200
          const maxWidth = 800
          const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
          setRightWidth(clampedWidth)
          onRightPanelResize?.(clampedWidth)
        }
      })
    }
  },
  [isResizingLeft, isResizingRight, onLeftPanelResize, onRightPanelResize]
)
```

---

## Notes

- Enhance existing implementation rather than replacing (unless react-resizable-panels is significantly better)
- Resize handles should be more visible (4-6px) but not obtrusive
- Collapse functionality should match VSCode (double-click handle or button)
- State persistence is important for user experience
- Smooth animations improve perceived performance
- Ensure accessibility with proper ARIA attributes
- Test with various window sizes and edge cases
- Performance is critical - optimize for 60fps during drag

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
