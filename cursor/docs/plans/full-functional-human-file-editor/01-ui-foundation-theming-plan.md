---
name: UI Foundation & Theming Implementation Plan
overview: Implement comprehensive UI/UX foundation with theming system, spacing improvements, color separation, and VSCode/Cursor design patterns for multi-window feel in single window
todos: []
---

# UI Foundation & Theming Implementation Plan

## Overview

Transform GlyphNova's UI foundation to create a polished, professional editor experience that mimics VSCode/Cursor's multi-window feel in a single window. This plan covers theming system, spacing improvements, color separation, section differentiation, and visual hierarchy using background colors, minimal borders, shadows, and focus highlights.

**Target**: Full UI/UX foundation matching VSCode/Cursor design patterns
**Priority**: High (foundational for all other UI features)
**Estimated Time**: 12-16 hours (with 20% buffer: 14.4-19.2 hours)
**Risk Level**: Medium (affects all components, requires careful coordination)

---

## Current State Analysis

### Existing Implementation
- **CSS Variables**: VSCode color variables defined in `web/src/index.css`
- **Tailwind Config**: VSCode colors mapped in `web/tailwind.config.js`
- **Components**: Using VSCode color classes (`bg-vscode-bg`, `text-vscode-fg`, etc.)
- **Theme System**: Basic dark theme with CSS variables
- **Spacing**: Basic Tailwind spacing scale defined

### Gaps Identified
- No systematic theming system (single theme only)
- Inconsistent spacing across components
- No section separation using background colors
- Borders used instead of shadows for separation
- No focus highlighting system
- No differentiation between folder focus and open file highlighting
- Missing multi-window visual hierarchy

---

## External Documentation Links

### VSCode Theme Documentation
1. **VSCode Theme Color Reference**
   - Link: https://code.visualstudio.com/api/references/theme-color
   - Description: Official VSCode theme color tokens and their usage
   - Rating: High - Official documentation

2. **VSCode Extension API - Theme Colors**
   - Link: https://code.visualstudio.com/api/references/vscode-api#ThemeColor
   - Description: Programmatic access to theme colors in VSCode extensions
   - Rating: High - Official API documentation

### Design System & Theming
3. **Tailwind CSS Custom Properties**
   - Link: https://tailwindcss.com/docs/customizing-colors#using-css-variables
   - Description: Using CSS variables with Tailwind for dynamic theming
   - Rating: High - Official Tailwind documentation

4. **CSS Custom Properties Best Practices**
   - Link: https://css-tricks.com/a-complete-guide-to-custom-properties/
   - Description: Comprehensive guide to CSS custom properties for theming
   - Rating: High - Industry best practices

### UI/UX Design Patterns
5. **Material Design Elevation & Shadows**
   - Link: https://m3.material.io/styles/elevation/overview
   - Description: Elevation system using shadows for visual hierarchy
   - Rating: Medium - Design pattern reference

6. **VSCode UI/UX Design Principles**
   - Link: https://github.com/microsoft/vscode/wiki/UX-Guidelines
   - Description: VSCode's official UX guidelines and design principles
   - Rating: High - Official design guidelines

### Spacing & Layout
7. **8-Point Grid System**
   - Link: https://spec.fm/specifics/8-pt-grid
   - Description: Standard spacing system using 8px base unit
   - Rating: Medium - Industry standard

8. **VSCode Layout Patterns**
   - Link: https://code.visualstudio.com/api/ux-guidelines/overview
   - Description: VSCode's layout and component patterns
   - Rating: High - Official design patterns

### Focus & Highlighting
9. **CSS Focus States Best Practices**
   - Link: https://www.a11yproject.com/posts/never-remove-css-outlines/
   - Description: Accessible focus indicators and highlighting
   - Rating: Medium - Accessibility best practices

10. **React Focus Management**
    - Link: https://react.dev/reference/react-dom/hooks/useFocusManagement
    - Description: Managing focus states in React applications
    - Rating: Medium - React documentation

### Animation & Transitions
11. **CSS Transitions for UI Feedback**
    - Link: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions
    - Description: Smooth transitions for UI state changes
    - Rating: High - MDN documentation

12. **Framer Motion for React Animations**
    - Link: https://www.framer.com/motion/
    - Description: Animation library for React (if needed for complex animations)
    - Rating: Medium - Third-party library

---

## Implementation Phases

### Phase 1: Theming System Foundation (3-4 hours)

**Goal**: Create a flexible theming system that supports multiple themes and easy customization.

#### 1.1 Theme Configuration Structure
- [ ] Create theme configuration file: `web/src/config/themes.ts`
  - [ ] Define theme interface with all color tokens
  - [ ] Create VSCode Dark theme configuration object
  - [ ] Create VSCode Light theme configuration object (for future)
  - [ ] Export theme type definitions
- [ ] Update `web/src/index.css` to use theme configuration
  - [ ] Replace hardcoded CSS variables with theme-based variables
  - [ ] Ensure all existing components continue working
- [ ] Create theme context: `web/src/contexts/ThemeContext.tsx`
  - [ ] Theme provider component
  - [ ] Theme hook: `useTheme()`
  - [ ] Theme switching logic (for future multi-theme support)

#### 1.2 Color Token System
- [ ] Define comprehensive color token structure:
  - [ ] Background colors (main, editor, sidebar, panel)
  - [ ] Foreground colors (primary, secondary, muted)
  - [ ] Border colors (default, active, hover)
  - [ ] Focus colors (border, highlight, ring)
  - [ ] Selection colors
  - [ ] Hover colors
- [ ] Map tokens to CSS variables in `web/src/index.css`
- [ ] Update Tailwind config to reference CSS variables
- [ ] Test color consistency across all components

**Success Criteria**:
- [ ] Theme system supports easy addition of new themes
- [ ] All color tokens properly mapped to CSS variables
- [ ] No visual regressions in existing components
- [ ] Theme context provides theme access throughout app

---

### Phase 2: Spacing & Layout System (2-3 hours)

**Goal**: Implement consistent spacing system and improve layout hierarchy.

#### 2.1 Spacing Scale Refinement
- [ ] Review and refine Tailwind spacing scale in `web/tailwind.config.js`
  - [ ] Ensure 8px base unit consistency
  - [ ] Add semantic spacing tokens (tight, normal, loose, etc.)
  - [ ] Document spacing usage guidelines
- [ ] Audit component spacing:
  - [ ] File tree component spacing
  - [ ] Editor panel spacing
  - [ ] Chat interface spacing
  - [ ] Panel borders and padding
- [ ] Create spacing utility components if needed
- [ ] Update components to use consistent spacing

#### 2.2 Layout Hierarchy
- [ ] Define layout section hierarchy:
  - [ ] Main application container
  - [ ] Panel containers (left, center, right)
  - [ ] Component sections within panels
  - [ ] Content areas
- [ ] Implement background color separation:
  - [ ] Different background colors for different sections
  - [ ] Subtle color variations for hierarchy
  - [ ] Ensure sufficient contrast for readability
- [ ] Update `DesktopLayout` component:
  - [ ] Apply section background colors
  - [ ] Improve spacing between panels
  - [ ] Add visual separation without heavy borders

**Success Criteria**:
- [ ] Consistent spacing throughout application
- [ ] Clear visual hierarchy using background colors
- [ ] Sections clearly separated without heavy borders
- [ ] Spacing scale documented and followed

---

### Phase 3: Border & Shadow System (2-3 hours)

**Goal**: Replace heavy borders with subtle shadows and minimal borders for modern look.

#### 3.1 Shadow System
- [ ] Define shadow scale in Tailwind config:
  - [ ] Subtle shadow for section separation
  - [ ] Medium shadow for elevated elements
  - [ ] Strong shadow for modals/overlays
- [ ] Create shadow utility classes:
  - [ ] `shadow-section` for panel separation
  - [ ] `shadow-elevated` for elevated components
  - [ ] `shadow-focus` for focus states
- [ ] Replace borders with shadows:
  - [ ] Panel borders → shadows
  - [ ] Component borders → shadows (where appropriate)
  - [ ] Keep minimal borders for critical separations only

#### 3.2 Border Refinement
- [ ] Audit all border usage:
  - [ ] Identify borders that can be removed
  - [ ] Identify borders that should be minimal
  - [ ] Keep borders only for critical UI elements
- [ ] Update border colors to be more subtle:
  - [ ] Use lower opacity borders
  - [ ] Match border colors to background colors
  - [ ] Ensure accessibility (sufficient contrast)
- [ ] Create border utility classes:
  - [ ] `border-subtle` for minimal borders
  - [ ] `border-focus` for focus states
  - [ ] `border-divider` for section dividers

**Success Criteria**:
- [ ] Shadows used effectively for visual hierarchy
- [ ] Minimal borders only where necessary
- [ ] Modern, clean appearance
- [ ] No accessibility regressions

---

### Phase 4: Focus & Highlight System (2-3 hours)

**Goal**: Implement sophisticated focus and highlighting system differentiating folder focus from open file highlighting.

#### 4.1 Focus State System
- [ ] Define focus state tokens:
  - [ ] Focus border color
  - [ ] Focus background color
  - [ ] Focus ring/shadow
  - [ ] Focus animation
- [ ] Implement focus states:
  - [ ] File tree item focus
  - [ ] Editor focus
  - [ ] Chat input focus
  - [ ] Button focus
  - [ ] Input field focus
- [ ] Add focus animations:
  - [ ] Smooth transition on focus
  - [ ] Subtle pulse or glow effect
  - [ ] Ensure animations are performant

#### 4.2 Folder vs File Highlighting
- [ ] Differentiate folder highlighting:
  - [ ] Folder hover state (subtle background)
  - [ ] Folder focus state (border highlight)
  - [ ] Folder selected state (background + border)
- [ ] Differentiate open file highlighting:
  - [ ] Open file indicator (tab or badge)
  - [ ] Active file highlighting (stronger than folder)
  - [ ] Current file in editor (distinct style)
- [ ] Implement soft oscillating highlight:
  - [ ] CSS animation for focus indication
  - [ ] Subtle, non-distracting animation
  - [ ] Configurable animation duration/intensity
- [ ] Update file tree component:
  - [ ] Apply new highlighting system
  - [ ] Ensure clear visual feedback
  - [ ] Test with various file/folder states

**Success Criteria**:
- [ ] Clear differentiation between folder and file states
- [ ] Focus states are accessible and visible
- [ ] Animations are smooth and performant
- [ ] Visual feedback is clear and consistent

---

### Phase 5: Multi-Window Visual Hierarchy (2-3 hours)

**Goal**: Create multi-window feel in single window using background colors and visual separation.

#### 5.1 Panel Background System
- [ ] Define panel background hierarchy:
  - [ ] Main application background (darkest)
  - [ ] Panel backgrounds (slightly lighter)
  - [ ] Component backgrounds (lighter still)
  - [ ] Content backgrounds (lightest)
- [ ] Implement background colors:
  - [ ] File tree panel background
  - [ ] Editor panel background
  - [ ] Chat panel background
  - [ ] Ensure sufficient contrast between panels
- [ ] Add subtle gradients or textures (optional):
  - [ ] Very subtle gradients for depth
  - [ ] Ensure accessibility maintained

#### 5.2 Visual Separation
- [ ] Implement panel separation:
  - [ ] Use shadows instead of borders
  - [ ] Subtle background color differences
  - [ ] Clear visual boundaries
- [ ] Create "window" effect:
  - [ ] Each panel feels like separate window
  - [ ] Clear visual hierarchy
  - [ ] Professional, polished appearance
- [ ] Update DesktopLayout component:
  - [ ] Apply new background system
  - [ ] Improve visual separation
  - [ ] Test with different panel widths

#### 5.3 Component Integration
- [ ] Update all components to use new system:
  - [ ] File tree components
  - [ ] Editor components
  - [ ] Chat components
  - [ ] Layout components
- [ ] Ensure consistency:
  - [ ] All components follow same patterns
  - [ ] Visual hierarchy is clear
  - [ ] No jarring transitions between sections

**Success Criteria**:
- [ ] Multi-window feel achieved
- [ ] Clear visual hierarchy
- [ ] Professional, polished appearance
- [ ] All components integrated consistently

---

## Dependencies

### Internal Dependencies
- **DesktopLayout Component**: Needs updates for panel backgrounds
- **FileTree Components**: Need highlighting system updates
- **Editor Components**: Need focus state updates
- **Chat Components**: Need styling updates
- **State Management**: May need theme state management

### External Dependencies
- **Tailwind CSS**: Already in use, may need config updates
- **CSS Variables**: Foundation for theming system
- **React Context**: For theme management (if multi-theme support added)

### Implementation Order
1. Phase 1 (Theming System) - Foundation for everything
2. Phase 2 (Spacing & Layout) - Works with theming system
3. Phase 3 (Borders & Shadows) - Enhances layout system
4. Phase 4 (Focus & Highlight) - Uses theme and spacing
5. Phase 5 (Multi-Window Hierarchy) - Integrates all previous phases

---

## Risk Assessment

### High Risk
- **Visual Regressions**: Changes to theming system may break existing components
  - **Mitigation**: Comprehensive testing after each phase, gradual rollout
  - **Contingency**: Rollback to previous theme system, fix issues incrementally

- **Accessibility Issues**: Color changes may reduce contrast or visibility
  - **Mitigation**: Test with accessibility tools, maintain WCAG AA compliance
  - **Contingency**: Adjust colors to meet accessibility standards

### Medium Risk
- **Performance Impact**: Shadows and animations may affect performance
  - **Mitigation**: Use CSS transforms for animations, optimize shadow rendering
  - **Contingency**: Reduce animation complexity, use simpler shadows

- **Theme Consistency**: Ensuring all components use theme system consistently
  - **Mitigation**: Create component style guide, code review process
  - **Contingency**: Gradual migration, component-by-component updates

### Low Risk
- **User Preference**: Some users may prefer previous styling
  - **Mitigation**: Make theme system flexible, allow customization
  - **Contingency**: Provide theme switching (future feature)

---

## Time Estimates

### Phase Breakdown
- **Phase 1**: Theming System Foundation - 3-4 hours
- **Phase 2**: Spacing & Layout System - 2-3 hours
- **Phase 3**: Border & Shadow System - 2-3 hours
- **Phase 4**: Focus & Highlight System - 2-3 hours
- **Phase 5**: Multi-Window Visual Hierarchy - 2-3 hours

**Total Estimated Time**: 11-16 hours
**Buffer Time (20%)**: 2.2-3.2 hours
**Total with Buffer**: 13.2-19.2 hours

### Task-Level Estimates
- Theme configuration structure: 1 hour
- Color token system: 1-1.5 hours
- Theme context: 1-1.5 hours
- Spacing scale refinement: 0.5-1 hour
- Layout hierarchy: 1-1.5 hours
- Shadow system: 1-1.5 hours
- Border refinement: 1-1.5 hours
- Focus state system: 1-1.5 hours
- Folder vs file highlighting: 1-1.5 hours
- Panel background system: 1-1.5 hours
- Visual separation: 1-1.5 hours
- Component integration: 1-1.5 hours

---

## Success Criteria

### Functional Requirements
1. ✅ Theming system supports easy theme addition and customization
2. ✅ All color tokens properly mapped and accessible
3. ✅ Consistent spacing throughout application (8px base unit)
4. ✅ Clear visual hierarchy using background colors
5. ✅ Shadows used effectively for section separation
6. ✅ Minimal borders only where necessary
7. ✅ Focus states clearly visible and accessible
8. ✅ Folder highlighting distinct from file highlighting
9. ✅ Open file highlighting distinct and clear
10. ✅ Multi-window feel achieved in single window
11. ✅ All components use theme system consistently
12. ✅ No visual regressions in existing functionality
13. ✅ Accessibility standards maintained (WCAG AA)
14. ✅ Performance impact minimal (< 5% render time increase)
15. ✅ Code is maintainable and well-documented

### Quality Metrics
- **Visual Consistency**: 100% of components use theme system
- **Accessibility**: WCAG AA compliance maintained
- **Performance**: No significant performance degradation
- **Code Quality**: All components follow style guide
- **Documentation**: Theme system documented with examples

---

## Rollback Procedures

### Immediate Rollback
- **Git Revert**: Revert commits if critical issues found
- **CSS Restore**: Restore previous CSS variables if needed
- **Component Restore**: Restore previous component styles

### Phase-Specific Rollback
- **Phase 1 Rollback**: Restore previous CSS variables, remove theme context
- **Phase 2 Rollback**: Restore previous spacing, revert layout changes
- **Phase 3 Rollback**: Restore borders, remove shadow system
- **Phase 4 Rollback**: Restore previous focus states
- **Phase 5 Rollback**: Restore previous backgrounds, remove panel system

### Emergency Rollback
- **Complete Restore**: Revert all changes, restore previous state
- **Documentation**: Document issues for future reference
- **Post-Mortem**: Analyze what went wrong, plan improvements

---

## Validation Checkpoints

### After Phase 1
- [ ] Theme system functional
- [ ] All components still render correctly
- [ ] Color tokens accessible throughout app
- [ ] No visual regressions

### After Phase 2
- [ ] Spacing consistent across components
- [ ] Layout hierarchy clear
- [ ] Background colors properly applied
- [ ] No layout breaking changes

### After Phase 3
- [ ] Shadows render correctly
- [ ] Borders minimal and appropriate
- [ ] Visual appearance improved
- [ ] Performance acceptable

### After Phase 4
- [ ] Focus states visible and accessible
- [ ] Folder/file highlighting distinct
- [ ] Animations smooth and performant
- [ ] User feedback clear

### After Phase 5
- [ ] Multi-window feel achieved
- [ ] All components integrated
- [ ] Visual hierarchy clear
- [ ] Professional appearance

### Pre-Deployment
- [ ] All success criteria met
- [ ] Accessibility validated
- [ ] Performance tested
- [ ] Code reviewed
- [ ] Documentation complete

---

## File Paths & Code Examples

### Key Files to Modify
- `web/src/index.css` - CSS variables and base styles
- `web/tailwind.config.js` - Tailwind configuration
- `web/src/config/themes.ts` - Theme configuration (new)
- `web/src/contexts/ThemeContext.tsx` - Theme context (new)
- `web/src/components/Layouts/DesktopLayout/DesktopLayout.tsx` - Layout component
- `web/src/components/FileTree/FileTreeView.tsx` - File tree component
- `web/src/components/Editor/EditorPanel.tsx` - Editor component
- `web/src/components/Chat/ChatInterface.tsx` - Chat component

### Example: Theme Configuration Structure
```typescript
// web/src/config/themes.ts
export interface Theme {
  colors: {
    background: {
      main: string
      editor: string
      sidebar: string
      panel: string
    }
    foreground: {
      primary: string
      secondary: string
      muted: string
    }
    border: {
      default: string
      active: string
      hover: string
    }
    focus: {
      border: string
      highlight: string
      ring: string
    }
    // ... more color tokens
  }
  shadows: {
    section: string
    elevated: string
    focus: string
  }
  spacing: {
    // spacing tokens
  }
}

export const vscodeDarkTheme: Theme = {
  // theme definition
}
```

### Example: Theme Context
```typescript
// web/src/contexts/ThemeContext.tsx
import { createContext, useContext, useState } from 'react'
import { Theme } from '../config/themes'
import { vscodeDarkTheme } from '../config/themes'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
} | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(vscodeDarkTheme)
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

---

## Notes

- This plan establishes the foundation for all UI improvements
- All subsequent UI feature plans will build upon this foundation
- Theme system should be flexible for future multi-theme support
- Focus on accessibility and performance throughout implementation
- Gradual rollout recommended to catch issues early

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
