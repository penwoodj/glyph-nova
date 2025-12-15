---
name: File Icon Pack Implementation Plan
overview: Replace basic lucide-react file icons with professional VSCode-style icon pack for better visual file type identification
todos: []
---

# File Icon Pack Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Replace the current basic lucide-react file icons with a professional VSCode-style icon pack that provides better visual file type identification, more comprehensive file type coverage, and icons that match VSCode/Cursor design patterns.

---

## Overview

This plan implements a professional file icon pack system for GlyphNova that:
- Replaces basic lucide-react icons with VSCode-style file icons
- Provides comprehensive file type coverage (100+ file types)
- Uses proper VSCode Material Icon Theme or similar icon set
- Maintains performance with tree-shakable imports
- Integrates seamlessly with existing file tree component
- Supports folder icons (expanded/collapsed states)

**Target**: Professional file icon pack matching VSCode/Cursor icon appearance
**Priority**: Medium (improves visual UX but not blocking)
**Estimated Time**: 4-6 hours (with 20% buffer: 4.8-7.2 hours)
**Risk Level**: Low (icon replacement, low risk of breaking functionality)

---

## Current State Analysis

### Existing Implementation
- **Icon Library**: Uses `lucide-react` icons
- **Icon Mapping**: `web/src/lib/fileIcons.ts` maps extensions to lucide icons
- **Icon Component**: `web/src/components/FileTree/FileIcon.tsx` renders icons
- **Coverage**: Limited file types (30-40 extensions)
- **Styling**: Basic color coding with Tailwind classes
- **Folder Icons**: Uses `Folder` and `FolderOpen` from lucide-react

### Gaps Identified
- Icons don't match VSCode appearance (generic lucide icons)
- Limited file type coverage (many extensions use default icon)
- No proper VSCode Material Icon Theme integration
- Icons look generic and not professional
- Missing many common file types and frameworks

---

## External Documentation Links

### VSCode Icon Packages
1. **@iconify/icons-vscode-icons**
   - Link: https://www.npmjs.com/package/@iconify/icons-vscode-icons
   - Description: Comprehensive VSCode icons package with Iconify integration
   - Rating: High - Most comprehensive, actively maintained

2. **@iconify/react**
   - Link: https://www.npmjs.com/package/@iconify/react
   - Description: React component for Iconify icons
   - Rating: High - Required for @iconify/icons-vscode-icons

3. **@uiw/file-icons**
   - Link: https://www.npmjs.com/package/@uiw/file-icons
   - Description: File icons using vscode-material-icon-theme as React components
   - Rating: High - React components, good coverage

4. **vscode-material-icons**
   - Link: https://www.npmjs.com/package/vscode-material-icons
   - Description: All icons from VSCode Material Icon Theme as SVG files
   - Rating: Medium - SVG files, requires bundler configuration

### Icon Libraries & Tools
5. **Iconify Documentation**
   - Link: https://iconify.design/
   - Description: Comprehensive icon framework with VSCode icons
   - Rating: High - Official Iconify documentation

6. **VSCode Material Icon Theme**
   - Link: https://github.com/PKief/vscode-material-icon-theme
   - Description: Official VSCode Material Icon Theme repository
   - Rating: High - Source of icon designs

7. **vscode-icons-js**
   - Link: https://www.npmjs.com/package/vscode-icons-js
   - Description: JavaScript library for VSCode icons (older, simpler API)
   - Rating: Medium - Older package, less maintained

### File Type Detection
8. **MIME Type Detection**
   - Link: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
   - Description: MIME type standards for file type detection
   - Rating: Medium - Reference for file type detection

9. **File Extension Reference**
   - Link: https://fileinfo.com/
   - Description: Comprehensive file extension database
   - Rating: Low - Reference only, not for code

### Performance & Optimization
10. **Tree Shaking in Webpack/Vite**
    - Link: https://webpack.js.org/guides/tree-shaking/
    - Description: Tree shaking for reducing bundle size
    - Rating: High - Important for icon pack performance

11. **Code Splitting Best Practices**
    - Link: https://react.dev/reference/react/lazy
    - Description: React lazy loading for code splitting
    - Rating: Medium - May be needed for large icon sets

---

## Implementation Phases

### Phase 1: Icon Pack Evaluation & Selection (1 hour)

**Goal**: Evaluate icon pack options and select the best one for the project.

#### 1.1 Research Icon Pack Options
- [ ] Evaluate `@iconify/icons-vscode-icons` + `@iconify/react`:
  - [ ] Check package size and tree-shaking support
  - [ ] Review icon coverage (file types supported)
  - [ ] Test integration with React
  - [ ] Check maintenance status and updates
- [ ] Evaluate `@uiw/file-icons`:
  - [ ] Check React component API
  - [ ] Review icon coverage
  - [ ] Test bundle size impact
  - [ ] Check TypeScript support
- [ ] Evaluate `vscode-material-icons`:
  - [ ] Check SVG file structure
  - [ ] Review bundler requirements
  - [ ] Test integration complexity
- [ ] Compare options:
  - [ ] Bundle size impact
  - [ ] Ease of integration
  - [ ] Icon coverage
  - [ ] Maintenance status
  - [ ] TypeScript support

#### 1.2 Select Icon Pack
- [ ] Choose best option based on evaluation
- [ ] Document selection rationale
- [ ] **Recommended**: `@iconify/icons-vscode-icons` + `@iconify/react`
  - Most comprehensive coverage
  - Actively maintained
  - Tree-shakable
  - Good React integration

**Success Criteria**:
- [ ] Icon pack options evaluated
- [ ] Best option selected with rationale
- [ ] Selection documented

---

### Phase 2: Icon Pack Installation & Setup (0.5-1 hour)

**Goal**: Install selected icon pack and configure it for the project.

#### 2.1 Install Icon Packages
- [ ] Install selected icon pack:
  ```bash
  yarn add @iconify/react @iconify/icons-vscode-icons
  ```
- [ ] Or for `@uiw/file-icons`:
  ```bash
  yarn add @uiw/file-icons
  ```
- [ ] Verify installation in `package.json`
- [ ] Check TypeScript types are available

#### 2.2 Configure Bundler (if needed)
- [ ] For SVG-based packs, configure bundler:
  - [ ] Vite: Ensure SVG imports work
  - [ ] Webpack: Configure SVG loader if needed
- [ ] Test icon import in a component
- [ ] Verify tree-shaking works (check bundle size)

#### 2.3 Create Icon Utility Functions
- [ ] Create or update `web/src/lib/fileIcons.ts`:
  - [ ] Import icon pack functions/components
  - [ ] Create icon mapping function
  - [ ] Map file extensions to icon names/IDs
  - [ ] Handle folder icons (expanded/collapsed)
  - [ ] Provide fallback for unknown file types

**Success Criteria**:
- [ ] Icon pack installed and working
- [ ] Icons can be imported and rendered
- [ ] Utility functions created
- [ ] Tree-shaking verified

---

### Phase 3: Icon Mapping Implementation (1.5-2 hours)

**Goal**: Create comprehensive icon mapping for all file types.

#### 3.1 Create Icon Mapping System
- [ ] Update `getFileIcon` function in `web/src/lib/fileIcons.ts`:
  - [ ] Replace lucide-react imports with icon pack imports
  - [ ] Map common file extensions to icon names:
    - [ ] Programming languages (JS, TS, Python, Java, C++, Go, Rust, etc.)
    - [ ] Web technologies (HTML, CSS, SCSS, Vue, React, etc.)
    - [ ] Data formats (JSON, YAML, XML, TOML, etc.)
    - [ ] Config files (.gitignore, .env, etc.)
    - [ ] Media files (images, videos, audio)
    - [ ] Archives (zip, tar, etc.)
    - [ ] Documents (PDF, DOC, etc.)
    - [ ] Database files (SQL, SQLite, etc.)
    - [ ] Build tools (Dockerfile, Makefile, etc.)
    - [ ] Framework-specific files (package.json, tsconfig.json, etc.)
  - [ ] Handle special file names (README, LICENSE, Dockerfile, etc.)
  - [ ] Provide fallback for unknown extensions

#### 3.2 Folder Icon Mapping
- [ ] Update `getFolderIcon` function:
  - [ ] Use proper folder icons from icon pack
  - [ ] Support expanded/collapsed states
  - [ ] Match VSCode folder icon appearance
- [ ] Handle special folders:
  - [ ] `.git`, `.vscode`, `.idea`, etc.
  - [ ] `node_modules`, `dist`, `build`, etc.

#### 3.3 Icon Name Resolution
- [ ] Create icon name resolution function:
  - [ ] Map extension to icon name/ID
  - [ ] Handle multiple extensions per icon
  - [ ] Handle case-insensitive matching
  - [ ] Handle file names without extensions

**Success Criteria**:
- [ ] Comprehensive icon mapping created
- [ ] All common file types mapped
- [ ] Folder icons working correctly
- [ ] Fallback icons provided

---

### Phase 4: Component Integration (1-1.5 hours)

**Goal**: Integrate new icon pack with existing file tree components.

#### 4.1 Update FileIcon Component
- [ ] Update `web/src/components/FileTree/FileIcon.tsx`:
  - [ ] Replace lucide-react icon rendering
  - [ ] Use icon pack components/functions
  - [ ] Maintain same props interface
  - [ ] Ensure styling works correctly
  - [ ] Handle icon size and spacing
- [ ] Test with various file types:
  - [ ] Common extensions (js, ts, json, md)
  - [ ] Less common extensions
  - [ ] Files without extensions
  - [ ] Folders (expanded/collapsed)

#### 4.2 Update File Tree Item
- [ ] Verify `FileTreeItem.tsx` works with new icons:
  - [ ] Icons render correctly
  - [ ] Spacing and alignment correct
  - [ ] No layout shifts
  - [ ] Performance acceptable

#### 4.3 Styling & Theming
- [ ] Ensure icons match VSCode theme:
  - [ ] Icon colors match VSCode appearance
  - [ ] Icon sizes appropriate (16px or 20px)
  - [ ] Icons align properly with text
  - [ ] Hover states work correctly
- [ ] Test with dark theme (current theme)
- [ ] Ensure icons are readable

**Success Criteria**:
- [ ] FileIcon component updated and working
- [ ] All file types display correct icons
- [ ] Styling matches VSCode appearance
- [ ] No regressions in file tree functionality

---

### Phase 5: Testing & Optimization (0.5-1 hour)

**Goal**: Comprehensive testing and performance optimization.

#### 5.1 Functionality Testing
- [ ] Test icon display:
  - [ ] Common file types show correct icons
  - [ ] Unknown file types show fallback icon
  - [ ] Folders show correct icons (expanded/collapsed)
  - [ ] Special files (README, LICENSE, etc.) show correct icons
- [ ] Test with various file structures:
  - [ ] Simple project
  - [ ] Complex nested structure
  - [ ] Many file types
  - [ ] Large file tree

#### 5.2 Performance Testing
- [ ] Check bundle size impact:
  - [ ] Compare before/after bundle size
  - [ ] Verify tree-shaking works
  - [ ] Check if code splitting needed
- [ ] Test rendering performance:
  - [ ] File tree with many files
  - [ ] Icon rendering speed
  - [ ] No noticeable lag

#### 5.3 Visual Testing
- [ ] Verify icons match VSCode:
  - [ ] Icon appearance
  - [ ] Icon colors
  - [ ] Icon sizes
  - [ ] Overall visual quality
- [ ] Test with different file types:
  - [ ] Programming languages
  - [ ] Web technologies
  - [ ] Config files
  - [ ] Media files

#### 5.4 Edge Case Testing
- [ ] Test edge cases:
  - [ ] Files with no extension
  - [ ] Files with multiple extensions (.tar.gz)
  - [ ] Files with special characters
  - [ ] Very long file names
  - [ ] Hidden files (.gitignore, .env)

**Success Criteria**:
- [ ] All functionality tested and working
- [ ] Performance acceptable
- [ ] Visual quality matches VSCode
- [ ] Edge cases handled

---

## Dependencies

### Internal Dependencies
- **File Tree Component**: Existing `FileTreeView` and `FileTreeItem` components
- **File Icon Component**: Existing `FileIcon` component
- **File Icon Utilities**: Existing `fileIcons.ts` utility file

### External Dependencies
- **Icon Pack**: Selected VSCode icon pack (e.g., `@iconify/icons-vscode-icons`)
- **Icon Renderer**: Icon rendering library (e.g., `@iconify/react`)
- **Bundler Configuration**: Vite/Webpack configured for icon imports

---

## Risk Assessment

### High Risk
- **Bundle Size Increase**: Large icon packs might significantly increase bundle size
  - **Mitigation**: Use tree-shakable imports, code splitting, lazy loading if needed

### Medium Risk
- **Icon Mapping Complexity**: Many file types to map correctly
  - **Mitigation**: Start with common types, add more incrementally, test thoroughly
- **Visual Consistency**: Ensuring icons match VSCode appearance
  - **Mitigation**: Use official VSCode icon packs, test visual appearance

### Low Risk
- **Component Integration**: Icon component replacement is straightforward
- **Performance**: Modern icon packs are optimized for performance

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Package removal**: Remove new icon packages, restore lucide-react
- **Code restoration**: Restore previous `fileIcons.ts` implementation

### Phase-Specific Rollback
- **Phase 1**: No code changes, just evaluation
- **Phase 2**: Remove icon packages, restore previous imports
- **Phase 3**: Restore previous icon mapping, keep new packages for future
- **Phase 4**: Restore previous FileIcon component
- **Phase 5**: No rollback needed (testing phase)

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore lucide-react icons
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (Evaluation)
- [ ] Icon pack options evaluated
- [ ] Best option selected
- [ ] Selection rationale documented

### After Phase 2 (Installation)
- [ ] Icon pack installed
- [ ] Icons can be imported
- [ ] Tree-shaking verified

### After Phase 3 (Icon Mapping)
- [ ] Comprehensive icon mapping created
- [ ] Common file types mapped
- [ ] Fallback icons provided

### After Phase 4 (Integration)
- [ ] FileIcon component updated
- [ ] Icons render correctly
- [ ] Styling matches VSCode

### After Phase 5 (Testing)
- [ ] All functionality tested
- [ ] Performance acceptable
- [ ] Visual quality verified

---

## Success Criteria

1. **Icon Pack Installed**: Professional VSCode-style icon pack installed
2. **Comprehensive Coverage**: 100+ file types supported with proper icons
3. **Visual Quality**: Icons match VSCode Material Icon Theme appearance
4. **Component Integration**: Seamlessly integrated with existing file tree
5. **Performance**: Bundle size impact acceptable, rendering performant
6. **Folder Icons**: Proper folder icons for expanded/collapsed states
7. **Special Files**: Correct icons for README, LICENSE, Dockerfile, etc.
8. **Fallback Icons**: Unknown file types show appropriate fallback
9. **Tree Shaking**: Only used icons included in bundle
10. **TypeScript Support**: Full TypeScript support for icon mapping
11. **No Regressions**: Existing file tree functionality unchanged
12. **Visual Consistency**: Icons match VSCode/Cursor design patterns
13. **Accessibility**: Icons are accessible and readable
14. **Maintainability**: Icon mapping is easy to extend
15. **Documentation**: Icon mapping documented for future additions

---

## Code Examples

### Example: Iconify Integration
```typescript
// web/src/lib/fileIcons.ts
import { Icon } from '@iconify/react'
import type { IconifyIcon } from '@iconify/react'

// Icon name mappings
const iconMap: Record<string, string> = {
  // JavaScript/TypeScript
  'js': 'vscode-icons:file-type-js',
  'jsx': 'vscode-icons:file-type-reactjs',
  'ts': 'vscode-icons:file-type-typescript',
  'tsx': 'vscode-icons:file-type-reactts',

  // Python
  'py': 'vscode-icons:file-type-python',

  // Web
  'html': 'vscode-icons:file-type-html',
  'css': 'vscode-icons:file-type-css',
  'scss': 'vscode-icons:file-type-scss',

  // Data
  'json': 'vscode-icons:file-type-json',
  'yaml': 'vscode-icons:file-type-yaml',
  'yml': 'vscode-icons:file-type-yaml',

  // Markdown
  'md': 'vscode-icons:file-type-markdown',

  // ... more mappings
}

export interface FileIconInfo {
  iconName: string
  className?: string
}

export const getFileIcon = (fileName: string, isDirectory: boolean): FileIconInfo => {
  if (isDirectory) {
    return {
      iconName: 'vscode-icons:default-folder',
      className: 'text-vscode-fg-secondary',
    }
  }

  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  const lowerName = fileName.toLowerCase()

  // Special file names
  if (lowerName === 'readme' || lowerName.startsWith('readme.')) {
    return { iconName: 'vscode-icons:file-type-readme' }
  }

  if (lowerName === 'license' || lowerName.startsWith('license.')) {
    return { iconName: 'vscode-icons:file-type-license' }
  }

  if (lowerName === 'dockerfile' || lowerName.startsWith('dockerfile.')) {
    return { iconName: 'vscode-icons:file-type-docker' }
  }

  // Extension-based mapping
  const iconName = iconMap[extension] || 'vscode-icons:default-file'

  return {
    iconName,
    className: 'text-vscode-fg-secondary',
  }
}

export const getFolderIcon = (isExpanded: boolean): FileIconInfo => {
  return {
    iconName: isExpanded
      ? 'vscode-icons:default-folder-opened'
      : 'vscode-icons:default-folder',
    className: isExpanded
      ? 'text-vscode-active-border'
      : 'text-vscode-fg-secondary',
  }
}
```

### Example: Updated FileIcon Component
```tsx
// web/src/components/FileTree/FileIcon.tsx
import { memo } from 'react'
import { Icon } from '@iconify/react'
import { getFileIcon, getFolderIcon } from 'src/lib/fileIcons'

interface FileIconProps {
  fileName: string
  isDirectory: boolean
  expanded?: boolean
}

export const FileIcon = memo(({ fileName, isDirectory, expanded = false }: FileIconProps) => {
  if (isDirectory) {
    const { iconName, className } = getFolderIcon(expanded)
    return (
      <Icon
        icon={iconName}
        className={`h-4 w-4 mr-2 flex-shrink-0 ${className || ''}`}
      />
    )
  }

  const { iconName, className } = getFileIcon(fileName, false)

  return (
    <Icon
      icon={iconName}
      className={`h-4 w-4 mr-2 flex-shrink-0 ${className || ''}`}
    />
  )
})

FileIcon.displayName = 'FileIcon'
```

### Example: @uiw/file-icons Alternative
```typescript
// Alternative using @uiw/file-icons
import {
  FileTypeJs,
  FileTypeTs,
  FileTypePython,
  FileTypeJson,
  FileTypeMarkdown,
  DefaultFile,
} from '@uiw/file-icons'

const iconComponentMap: Record<string, React.ComponentType<any>> = {
  'js': FileTypeJs,
  'ts': FileTypeTs,
  'py': FileTypePython,
  'json': FileTypeJson,
  'md': FileTypeMarkdown,
  // ... more mappings
}

export const getFileIcon = (fileName: string): React.ComponentType<any> => {
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  return iconComponentMap[extension] || DefaultFile
}
```

---

## Notes

- Icon pack selection should prioritize:
  - Comprehensive file type coverage
  - VSCode Material Icon Theme compatibility
  - Tree-shakable imports for performance
  - Active maintenance and updates
  - TypeScript support
- Start with common file types, add more incrementally
- Test bundle size impact and optimize if needed
- Ensure icons match VSCode visual appearance
- Maintain backward compatibility with existing component interface
- Consider lazy loading icons if bundle size becomes an issue

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 evaluation and selection
