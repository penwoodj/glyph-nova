---
name: Keyboard Shortcuts System Implementation Plan
overview: Implement keyboard shortcut system with shortcut to settings page, extensible shortcut registry, and keyboard shortcuts help display
todos: []
---

# Keyboard Shortcuts System Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Implement a comprehensive keyboard shortcuts system that includes a shortcut to open the settings page, an extensible shortcut registry for future shortcuts, and a keyboard shortcuts help/display feature. The system should match VSCode keyboard shortcut patterns and be customizable.

---

## Overview

This plan implements a keyboard shortcuts system that:
- Provides keyboard shortcut to open settings page (e.g., `Ctrl/Cmd + ,`)
- Creates extensible keyboard shortcut registry
- Supports global and context-specific shortcuts
- Allows shortcut customization (future)
- Displays keyboard shortcuts help/cheat sheet
- Matches VSCode keyboard shortcut patterns

**Target**: Professional keyboard shortcuts system matching VSCode patterns
**Priority**: Medium (improves accessibility and UX)
**Estimated Time**: 4-6 hours (with 20% buffer: 4.8-7.2 hours)
**Risk Level**: Low (keyboard event handling, low risk)

---

## Current State Analysis

### Existing Implementation
- **Save Shortcut**: `Ctrl/Cmd + S` in editors (VditorEditor, CodeEditor)
- **Chat Shortcut**: `Enter` to send message in chat
- **Context Menu**: `Escape` to close context menu
- **No Shortcut Registry**: Shortcuts are hardcoded in components
- **No Settings Shortcut**: No keyboard shortcut to open settings
- **No Shortcuts Help**: No way to view available shortcuts

### Gaps Identified
- No centralized shortcut system
- No shortcut to settings page
- No keyboard shortcuts help/display
- Shortcuts not customizable
- No shortcut conflict detection

---

## External Documentation Links

### Keyboard Shortcut Patterns
1. **VSCode Keyboard Shortcuts**
   - Link: https://code.visualstudio.com/docs/getstarted/keybindings
   - Description: VSCode keyboard shortcuts and keybindings
   - Rating: High - Official VSCode documentation

2. **VSCode Default Keybindings**
   - Link: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf
   - Description: VSCode default keyboard shortcuts reference
   - Rating: High - Official VSCode documentation

3. **Keyboard Event API**
   - Link: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
   - Description: Web KeyboardEvent API
   - Rating: High - MDN documentation

### React Keyboard Handling
4. **React Keyboard Events**
   - Link: https://react.dev/reference/react-dom/components/common#keyboard-events
   - Description: React keyboard event handling
   - Rating: High - React documentation

5. **React useCallback Hook**
   - Link: https://react.dev/reference/react/useCallback
   - Description: React useCallback for event handlers
   - Rating: Medium - React documentation

### Accessibility
6. **WCAG Keyboard Navigation**
   - Link: https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
   - Description: WCAG keyboard navigation requirements
   - Rating: High - Accessibility standards

7. **ARIA Keyboard Shortcuts**
   - Link: https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
   - Description: ARIA patterns for keyboard shortcuts
   - Rating: High - Accessibility guidelines

### Shortcut Libraries
8. **react-hotkeys-hook**
   - Link: https://github.com/JohannesKlauss/react-hotkeys-hook
   - Description: React hook for keyboard shortcuts
   - Rating: High - Popular React shortcuts library

9. **react-shortcuts**
   - Link: https://github.com/avocode/react-shortcuts
   - Description: React keyboard shortcuts component
   - Rating: Medium - Alternative shortcuts library

---

## Implementation Phases

### Phase 1: Keyboard Shortcut Registry (1.5-2 hours)

**Goal**: Create centralized keyboard shortcut registry system.

#### 1.1 Create Shortcut Registry
- [ ] Create `web/src/lib/keyboardShortcuts.ts`:
  - [ ] Define `KeyboardShortcut` interface
  - [ ] Create shortcut registry
  - [ ] Register default shortcuts
- [ ] Shortcut interface:
  ```typescript
  interface KeyboardShortcut {
    id: string
    keys: string[] // e.g., ['ctrl', 's'] or ['cmd', ',']
    description: string
    action: () => void
    context?: string // 'editor', 'chat', 'global', etc.
    enabled?: boolean
  }
  ```

#### 1.2 Shortcut Registration
- [ ] Create shortcut registry:
  - [ ] `registerShortcut(shortcut: KeyboardShortcut): void`
  - [ ] `unregisterShortcut(id: string): void`
  - [ ] `getShortcut(id: string): KeyboardShortcut | undefined`
  - [ ] `getAllShortcuts(): KeyboardShortcut[]`
- [ ] Register default shortcuts:
  - [ ] `Ctrl/Cmd + ,` → Open settings
  - [ ] `Ctrl/Cmd + S` → Save file (already exists, register it)
  - [ ] `Ctrl/Cmd + W` → Close tab (when tabs implemented)
  - [ ] `Ctrl/Cmd + K` → Command palette (future)
  - [ ] `Escape` → Close dialogs/menus

#### 1.3 Shortcut Key Parsing
- [ ] Create key parser:
  - [ ] Parse shortcut strings (e.g., "Ctrl+S", "Cmd+,")
  - [ ] Normalize keys (Ctrl vs Cmd based on platform)
  - [ ] Handle modifier keys (Ctrl, Alt, Shift, Meta)
  - [ ] Handle special keys (Enter, Escape, etc.)

**Success Criteria**:
- [ ] Shortcut registry created
- [ ] Default shortcuts registered
- [ ] Key parsing works correctly
- [ ] Shortcuts can be registered/unregistered

---

### Phase 2: Global Shortcut Handler (1.5-2 hours)

**Goal**: Create global keyboard shortcut handler.

#### 2.1 Global Event Listener
- [ ] Create `KeyboardShortcutsProvider.tsx`:
  - [ ] React context provider for shortcuts
  - [ ] Global keyboard event listener
  - [ ] Handle shortcut matching
- [ ] Provider component:
  ```tsx
  export const KeyboardShortcutsProvider = ({ children }) => {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Match shortcut and execute action
        const shortcut = matchShortcut(e)
        if (shortcut) {
          e.preventDefault()
          shortcut.action()
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    return <>{children}</>
  }
  ```

#### 2.2 Shortcut Matching
- [ ] Implement shortcut matching:
  - [ ] Match pressed keys to registered shortcuts
  - [ ] Handle modifier keys correctly
  - [ ] Support platform-specific keys (Ctrl vs Cmd)
  - [ ] Handle context-specific shortcuts
- [ ] Matching logic:
  - [ ] Check if modifiers match
  - [ ] Check if key matches
  - [ ] Check if shortcut is enabled
  - [ ] Check if context matches

#### 2.3 Settings Page Shortcut
- [ ] Implement settings page shortcut:
  - [ ] Register `Ctrl/Cmd + ,` shortcut
  - [ ] Action: Navigate to `/settings` route
  - [ ] Use React Router navigation
- [ ] Test shortcut:
  - [ ] Shortcut opens settings page
  - [ ] Works from any page/component
  - [ ] Doesn't conflict with other shortcuts

**Success Criteria**:
- [ ] Global shortcut handler works
- [ ] Shortcuts match correctly
- [ ] Settings page shortcut works
- [ ] No conflicts with existing shortcuts

---

### Phase 3: Context-Specific Shortcuts (1 hour)

**Goal**: Support context-specific shortcuts (editor, chat, etc.).

#### 3.1 Context System
- [ ] Add context support to shortcut system:
  - [ ] Track current context (editor, chat, global)
  - [ ] Only execute shortcuts matching current context
  - [ ] Global shortcuts work in all contexts
- [ ] Context tracking:
  - [ ] Use React context or state
  - [ ] Update context when focus changes
  - [ ] Handle context transitions

#### 3.2 Editor Shortcuts
- [ ] Register editor-specific shortcuts:
  - [ ] `Ctrl/Cmd + S` → Save (already exists, register it)
  - [ ] `Ctrl/Cmd + Z` → Undo (future)
  - [ ] `Ctrl/Cmd + Y` → Redo (future)
  - [ ] `Alt + Z` → Toggle word wrap (from line wrap plan)
- [ ] Context: `editor` or `code-editor`

#### 3.3 Chat Shortcuts
- [ ] Register chat-specific shortcuts:
  - [ ] `Enter` → Send message (already exists, register it)
  - [ ] `Shift + Enter` → New line (already exists)
  - [ ] `Ctrl/Cmd + Enter` → Send message (optional)
- [ ] Context: `chat`

**Success Criteria**:
- [ ] Context system works
- [ ] Editor shortcuts work in editor
- [ ] Chat shortcuts work in chat
- [ ] Context transitions work correctly

---

### Phase 4: Keyboard Shortcuts Help (1-1.5 hours)

**Goal**: Create keyboard shortcuts help/cheat sheet display.

#### 4.1 Shortcuts Help Component
- [ ] Create `KeyboardShortcutsHelp.tsx`:
  - [ ] Display all registered shortcuts
  - [ ] Group by context or category
  - [ ] Show key combinations
  - [ ] Show descriptions
- [ ] Help display:
  - [ ] Table or list format
  - [ ] Grouped by category
  - [ ] Searchable (optional)
  - [ ] Copyable key combinations

#### 4.2 Shortcuts Help Integration
- [ ] Add to settings page:
  - [ ] "Keyboard Shortcuts" section
  - [ ] Display all shortcuts
  - [ ] Allow filtering by context
- [ ] Or create separate help page:
  - [ ] Route: `/shortcuts` or `/help/shortcuts`
  - [ ] Accessible from menu or `Ctrl/Cmd + ?`

#### 4.3 Shortcut Display Formatting
- [ ] Format key combinations:
  - [ ] Display as "Ctrl+S" or "⌘S" (Mac)
  - [ ] Platform-specific display
  - [ ] Visual key indicators
- [ ] Key formatting:
  - [ ] Use platform symbols (⌘, ⌃, ⌥)
  - [ ] Consistent formatting
  - [ ] Clear and readable

**Success Criteria**:
- [ ] Shortcuts help displays correctly
- [ ] All shortcuts shown
- [ ] Grouped and organized
- [ ] Accessible from settings or help

---

### Phase 5: Integration & Testing (0.5-1 hour)

**Goal**: Complete integration and comprehensive testing.

#### 5.1 Component Integration
- [ ] Integrate shortcut system:
  - [ ] Wrap app with KeyboardShortcutsProvider
  - [ ] Register existing shortcuts
  - [ ] Test all shortcuts work
- [ ] Update existing components:
  - [ ] Migrate hardcoded shortcuts to registry
  - [ ] Use shortcut registry instead of direct handlers
  - [ ] Maintain existing functionality

#### 5.2 Shortcut Testing
- [ ] Test all shortcuts:
  - [ ] Settings page shortcut
  - [ ] Save shortcut
  - [ ] Chat shortcuts
  - [ ] Context-specific shortcuts
- [ ] Test edge cases:
  - [ ] Multiple modifiers
  - [ ] Platform differences (Ctrl vs Cmd)
  - [ ] Shortcut conflicts
  - [ ] Context transitions

#### 5.3 Documentation
- [ ] Document shortcuts:
  - [ ] List all shortcuts
  - [ ] Document shortcut registration
  - [ ] Document context system
  - [ ] Update README with shortcuts

**Success Criteria**:
- [ ] All shortcuts integrated
- [ ] All shortcuts tested
- [ ] Documentation complete
- [ ] No regressions

---

## Dependencies

### Internal Dependencies
- **Settings Page**: Settings page route (from settings plan)
- **React Router**: For navigation to settings page
- **Existing Components**: Editors, chat, etc. for context

### External Dependencies
- **Optional**: `react-hotkeys-hook` or similar library (if using library)
- **None**: Can be implemented with pure React/TypeScript

---

## Risk Assessment

### High Risk
- **None**: Low-risk feature

### Medium Risk
- **Shortcut Conflicts**: Multiple shortcuts might conflict
  - **Mitigation**: Conflict detection, priority system, clear documentation
- **Platform Differences**: Ctrl vs Cmd differences
  - **Mitigation**: Platform detection, normalize keys, test on both platforms

### Low Risk
- **Keyboard Events**: Standard browser API
- **Event Handling**: Straightforward React patterns

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Feature flag**: Disable shortcut system, restore direct handlers
- **Component restoration**: Restore previous keyboard handlers

### Phase-Specific Rollback
- **Phase 1**: Remove registry, keep direct handlers
- **Phase 2**: Remove global handler, keep component-specific handlers
- **Phase 3**: Remove context system, keep global shortcuts only
- **Phase 4**: Remove help display, keep shortcut functionality

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore previous handlers
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (Registry)
- [ ] Shortcut registry created
- [ ] Default shortcuts registered
- [ ] Key parsing works
- [ ] Shortcuts can be registered/unregistered

### After Phase 2 (Global Handler)
- [ ] Global handler works
- [ ] Shortcuts match correctly
- [ ] Settings page shortcut works
- [ ] No conflicts

### After Phase 3 (Context)
- [ ] Context system works
- [ ] Context-specific shortcuts work
- [ ] Context transitions work
- [ ] Global shortcuts still work

### After Phase 4 (Help)
- [ ] Shortcuts help displays
- [ ] All shortcuts shown
- [ ] Grouped correctly
- [ ] Accessible

### After Phase 5 (Integration)
- [ ] All shortcuts integrated
- [ ] All shortcuts tested
- [ ] Documentation complete
- [ ] No regressions

---

## Success Criteria

1. **Settings Shortcut**: `Ctrl/Cmd + ,` opens settings page
2. **Shortcut Registry**: Centralized shortcut registration system
3. **Global Shortcuts**: Shortcuts work globally
4. **Context Support**: Context-specific shortcuts work
5. **Existing Shortcuts**: All existing shortcuts registered
6. **Shortcuts Help**: Keyboard shortcuts help/cheat sheet available
7. **Platform Support**: Works on Windows, Mac, Linux
8. **No Conflicts**: No shortcut conflicts
9. **Extensibility**: Easy to add new shortcuts
10. **Documentation**: Shortcuts documented
11. **User Experience**: Intuitive and responsive
12. **Accessibility**: Keyboard navigation works correctly
13. **Visual Feedback**: Clear indication of available shortcuts (optional)
14. **Customization**: Shortcuts can be customized (future)
15. **Integration**: Works seamlessly with existing features

---

## Code Examples

### Example: Shortcut Registry
```typescript
// web/src/lib/keyboardShortcuts.ts
export interface KeyboardShortcut {
  id: string
  keys: string[]
  description: string
  action: () => void
  context?: 'global' | 'editor' | 'chat' | 'file-tree'
  enabled?: boolean
}

class ShortcutRegistry {
  private shortcuts: Map<string, KeyboardShortcut> = new Map()
  private currentContext: string = 'global'

  register(shortcut: KeyboardShortcut): void {
    this.shortcuts.set(shortcut.id, shortcut)
  }

  unregister(id: string): void {
    this.shortcuts.delete(id)
  }

  match(event: KeyboardEvent): KeyboardShortcut | null {
    for (const shortcut of this.shortcuts.values()) {
      if (!shortcut.enabled && shortcut.enabled !== false) continue
      if (shortcut.context && shortcut.context !== this.currentContext) continue

      if (this.keysMatch(shortcut.keys, event)) {
        return shortcut
      }
    }
    return null
  }

  private keysMatch(keys: string[], event: KeyboardEvent): boolean {
    const modifiers = {
      ctrl: event.ctrlKey,
      cmd: event.metaKey,
      alt: event.altKey,
      shift: event.shiftKey,
    }

    const key = event.key.toLowerCase()

    for (const k of keys) {
      const lowerK = k.toLowerCase()
      if (lowerK === 'ctrl' && !modifiers.ctrl) return false
      if (lowerK === 'cmd' && !modifiers.cmd) return false
      if (lowerK === 'alt' && !modifiers.alt) return false
      if (lowerK === 'shift' && !modifiers.shift) return false
      if (lowerK !== 'ctrl' && lowerK !== 'cmd' && lowerK !== 'alt' && lowerK !== 'shift') {
        if (lowerK !== key) return false
      }
    }

    return true
  }

  setContext(context: string): void {
    this.currentContext = context
  }

  getAll(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values())
  }
}

export const shortcutRegistry = new ShortcutRegistry()

// Register default shortcuts
shortcutRegistry.register({
  id: 'settings',
  keys: ['ctrl', ','],
  description: 'Open Settings',
  action: () => {
    // Navigate to settings
    window.location.href = '/settings'
    // Or use React Router: navigate('/settings')
  },
  context: 'global',
})

shortcutRegistry.register({
  id: 'save',
  keys: ['ctrl', 's'],
  description: 'Save File',
  action: () => {
    // Trigger save in active editor
    // This will be handled by editor component
  },
  context: 'editor',
})
```

### Example: Keyboard Shortcuts Provider
```tsx
// web/src/components/KeyboardShortcuts/KeyboardShortcutsProvider.tsx
import { useEffect, createContext, useContext } from 'react'
import { shortcutRegistry } from 'src/lib/keyboardShortcuts'

const KeyboardShortcutsContext = createContext<{
  setContext: (context: string) => void
}>({
  setContext: () => {},
})

export const useKeyboardShortcuts = () => useContext(KeyboardShortcutsContext)

export const KeyboardShortcutsProvider = ({ children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcut = shortcutRegistry.match(e)
      if (shortcut) {
        e.preventDefault()
        shortcut.action()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const setContext = (context: string) => {
    shortcutRegistry.setContext(context)
  }

  return (
    <KeyboardShortcutsContext.Provider value={{ setContext }}>
      {children}
    </KeyboardShortcutsContext.Provider>
  )
}
```

### Example: Settings Page Shortcut Registration
```tsx
// web/src/pages/SettingsPage/SettingsPage.tsx
import { useEffect } from 'react'
import { shortcutRegistry } from 'src/lib/keyboardShortcuts'
import { useNavigate } from '@redwoodjs/router'

export const SettingsPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Register settings shortcut if not already registered
    if (!shortcutRegistry.get('settings')) {
      shortcutRegistry.register({
        id: 'settings',
        keys: ['ctrl', ','],
        description: 'Open Settings',
        action: () => navigate('/settings'),
        context: 'global',
      })
    }
  }, [navigate])

  // ... rest of component
}
```

### Example: Keyboard Shortcuts Help
```tsx
// web/src/components/KeyboardShortcuts/KeyboardShortcutsHelp.tsx
import { shortcutRegistry } from 'src/lib/keyboardShortcuts'

export const KeyboardShortcutsHelp = () => {
  const shortcuts = shortcutRegistry.getAll()

  const grouped = shortcuts.reduce((acc, shortcut) => {
    const context = shortcut.context || 'global'
    if (!acc[context]) acc[context] = []
    acc[context].push(shortcut)
    return acc
  }, {} as Record<string, typeof shortcuts>)

  const formatKeys = (keys: string[]): string => {
    // Format for display: "Ctrl+S" or "⌘S" on Mac
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    return keys.map(k => {
      if (k === 'ctrl') return isMac ? '⌃' : 'Ctrl'
      if (k === 'cmd') return isMac ? '⌘' : 'Ctrl'
      if (k === 'alt') return isMac ? '⌥' : 'Alt'
      if (k === 'shift') return '⇧'
      return k.toUpperCase()
    }).join(isMac ? '' : '+')
  }

  return (
    <div className="keyboard-shortcuts-help">
      <h2>Keyboard Shortcuts</h2>

      {Object.entries(grouped).map(([context, contextShortcuts]) => (
        <div key={context} className="shortcut-group">
          <h3>{context.charAt(0).toUpperCase() + context.slice(1)}</h3>
          <table>
            <thead>
              <tr>
                <th>Shortcut</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {contextShortcuts.map(shortcut => (
                <tr key={shortcut.id}>
                  <td>
                    <kbd>{formatKeys(shortcut.keys)}</kbd>
                  </td>
                  <td>{shortcut.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
```

### Example: App Integration
```tsx
// web/src/App.tsx
import { KeyboardShortcutsProvider } from 'src/components/KeyboardShortcuts/KeyboardShortcutsProvider'

export const App = () => {
  return (
    <KeyboardShortcutsProvider>
      {/* Rest of app */}
    </KeyboardShortcutsProvider>
  )
}
```

---

## Notes

- Default shortcut for settings: `Ctrl/Cmd + ,` (matches VSCode)
- Shortcuts should be platform-aware (Ctrl vs Cmd)
- Context system allows shortcuts to work only in specific areas
- Shortcut registry makes it easy to add new shortcuts
- Keyboard shortcuts help improves discoverability
- Consider adding shortcut customization in settings (future)
- Test on multiple platforms (Windows, Mac, Linux)
- Handle edge cases (multiple modifiers, special keys)
- Document all shortcuts in help/README

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
