---
name: BlockNote Editor Integration Implementation Plan
overview: Integrate BlockNote block-based rich-text editor to replace/enhance Vditor, providing Notion-like editing experience with markdown import/export, image rendering, and customizable theming
todos: []
---

# BlockNote Editor Integration Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Integrate BlockNote as the primary markdown editor, providing a modern block-based editing experience with Notion-like UX, full markdown import/export support, image rendering, and seamless integration with GlyphNova's theming system.

---

## Overview

This plan implements BlockNote editor integration to replace or work alongside the existing Vditor editor. BlockNote provides:
- Block-based document structure (like Notion)
- WYSIWYG editing experience
- Markdown import/export
- Image rendering and file handling
- Customizable theming matching VSCode colors
- Real-time collaboration support (for future)
- Extensible block types and schemas

**Target**: Modern block-based editor with Notion-like UX
**Priority**: High (core editor functionality)
**Estimated Time**: 10-14 hours (with 20% buffer: 12-16.8 hours)
**Risk Level**: Medium-High (replacing core editor component)

---

## Current State Analysis

### Existing Implementation
- **Vditor Editor**: `web/src/components/Editor/VditorEditor.tsx` - Current markdown editor
- **Editor Integration**: Used in `UnifiedEditor.tsx` and `EditorPanel.tsx`
- **Features**: WYSIWYG editing, syntax highlighting, file operations
- **Styling**: VSCode theme integration via CSS variables

### Gaps Identified
- Vditor doesn't provide block-based editing
- Limited customization options
- No block-based document structure
- Image handling needs improvement
- No real-time collaboration support
- Limited extensibility for custom block types

---

## External Documentation Links

### BlockNote Core Documentation
1. **BlockNote Getting Started**
   - Link: https://www.blocknotejs.org/docs
   - Description: Installation guide and first editor setup
   - Rating: High - Official getting started documentation

2. **BlockNote Editor Setup**
   - Link: https://www.blocknotejs.org/docs/getting-started/quickstart
   - Description: useCreateBlockNote and BlockNoteView setup guide
   - Rating: High - Core setup documentation

3. **BlockNote GitHub Repository**
   - Link: https://github.com/TypeCellOS/BlockNote
   - Description: Source code, packages, and examples
   - Rating: High - Official repository with comprehensive examples

### BlockNote Features
4. **BlockNote Built-in Block Types**
   - Link: https://www.blocknotejs.org/docs/blocks/overview
   - Description: What content types are supported by default
   - Rating: High - Official block types reference

5. **BlockNote Schemas**
   - Link: https://www.blocknotejs.org/docs/schemas/overview
   - Description: Blocks, inline content, and styles schema system
   - Rating: High - Schema customization documentation

6. **BlockNote Styling & Theming**
   - Link: https://www.blocknotejs.org/docs/styling/overview
   - Description: Themes, CSS variables, and style overrides
   - Rating: High - Theming and customization guide

7. **BlockNote API: Manipulating Content**
   - Link: https://www.blocknotejs.org/docs/api-reference/editor-methods
   - Description: Programmatic manipulation of blocks and inline content
   - Rating: High - API reference for content manipulation

### BlockNote Import/Export
8. **BlockNote Markdown Import**
   - Link: https://www.blocknotejs.org/docs/features/import/markdown
   - Description: Converting Markdown to BlockNote blocks
   - Rating: High - Essential for markdown file support

9. **BlockNote Markdown Export**
   - Link: https://www.blocknotejs.org/docs/features/export/markdown
   - Description: Converting BlockNote blocks to Markdown
   - Rating: High - Essential for markdown file support

### BlockNote Advanced Features
10. **BlockNote Real-time Collaboration**
    - Link: https://www.blocknotejs.org/docs/collaboration/overview
    - Description: Yjs providers and collaboration setup
    - Rating: Medium - Collaboration features (future enhancement)

11. **BlockNote Custom Blocks**
    - Link: https://www.blocknotejs.org/docs/schemas/custom-blocks
    - Description: Creating custom block types
    - Rating: Medium - Advanced customization

12. **BlockNote React Components**
    - Link: https://www.blocknotejs.org/docs/react/overview
    - Description: React-specific components and hooks
    - Rating: High - React integration guide

---

## Implementation Phases

### Phase 1: BlockNote Installation & Setup (1-2 hours)

**Goal**: Install BlockNote packages and create basic editor component.

#### 1.1 Install BlockNote Packages
- [ ] Install core BlockNote packages:
  ```bash
  yarn add @blocknote/core @blocknote/react @blocknote/mantine
  ```
- [ ] Install Mantine UI (if not already installed):
  ```bash
  yarn add @mantine/core @mantine/hooks
  ```
- [ ] Verify package installation and versions
- [ ] Check for any dependency conflicts

#### 1.2 Create Basic BlockNote Editor Component
- [ ] Create `web/src/components/Editor/BlockNoteEditor.tsx`:
  - [ ] Import BlockNote dependencies
  - [ ] Set up useCreateBlockNote hook
  - [ ] Render BlockNoteView component
  - [ ] Implement basic props interface (content, onChange, onSave)
  - [ ] Add VSCode theme styling
- [ ] Create basic story file: `BlockNoteEditor.stories.tsx`
- [ ] Test basic editor renders correctly

#### 1.3 Basic Integration Test
- [ ] Create test page or update existing editor to use BlockNote
- [ ] Verify editor loads and is editable
- [ ] Test basic typing and formatting
- [ ] Verify no console errors

**Success Criteria**:
- [ ] BlockNote packages installed successfully
- [ ] Basic editor component created and renders
- [ ] Editor is editable and functional
- [ ] No dependency conflicts or errors

---

### Phase 2: Markdown Import/Export Integration (2-3 hours)

**Goal**: Implement seamless markdown import/export for file operations.

#### 2.1 Markdown Import
- [ ] Implement markdown import in BlockNoteEditor:
  - [ ] Use `@blocknote/core` markdown import utilities
  - [ ] Convert markdown string to BlockNote blocks
  - [ ] Handle edge cases (empty files, malformed markdown)
  - [ ] Preserve formatting (headers, lists, code blocks, etc.)
- [ ] Test import with various markdown files:
  - [ ] Simple text files
  - [ ] Files with headers and lists
  - [ ] Files with code blocks
  - [ ] Files with images
  - [ ] Complex markdown documents

#### 2.2 Markdown Export
- [ ] Implement markdown export in BlockNoteEditor:
  - [ ] Use `@blocknote/core` markdown export utilities
  - [ ] Convert BlockNote blocks to markdown string
  - [ ] Preserve all formatting and structure
  - [ ] Handle custom blocks appropriately
- [ ] Test export with various content:
  - [ ] Text blocks
  - [ ] Headers and lists
  - [ ] Code blocks
  - [ ] Images
  - [ ] Complex documents

#### 2.3 File Integration
- [ ] Update file save/load operations:
  - [ ] On file open: Import markdown to BlockNote blocks
  - [ ] On file save: Export BlockNote blocks to markdown
  - [ ] Handle file change detection
  - [ ] Preserve cursor position if possible
- [ ] Update `UnifiedEditor.tsx` to use BlockNote for markdown files
- [ ] Test file operations:
  - [ ] Open existing markdown file
  - [ ] Edit and save markdown file
  - [ ] Create new markdown file
  - [ ] Verify markdown format is preserved

**Success Criteria**:
- [ ] Markdown files import correctly to BlockNote
- [ ] BlockNote documents export correctly to markdown
- [ ] File operations work seamlessly
- [ ] Markdown format is preserved through import/export cycle

---

### Phase 3: VSCode Theme Integration (2-3 hours)

**Goal**: Style BlockNote to match VSCode dark theme.

#### 3.1 Theme Configuration
- [ ] Create BlockNote theme configuration:
  - [ ] Map VSCode colors to BlockNote theme
  - [ ] Configure editor background: `--vscode-editor-bg`
  - [ ] Configure text color: `--vscode-fg`
  - [ ] Configure selection: `--vscode-selection-bg`
  - [ ] Configure borders: `--vscode-border`
- [ ] Update `BlockNoteEditor.tsx` with theme props
- [ ] Test theme application

#### 3.2 CSS Customization
- [ ] Add BlockNote CSS overrides to `web/src/index.css`:
  - [ ] Override default BlockNote styles
  - [ ] Apply VSCode color variables
  - [ ] Style toolbar to match VSCode
  - [ ] Style menus and dropdowns
  - [ ] Style code blocks with syntax highlighting
- [ ] Test visual appearance matches VSCode theme
- [ ] Verify all UI elements are styled correctly

#### 3.3 Component Styling
- [ ] Style BlockNote components:
  - [ ] Formatting toolbar
  - [ ] Slash menu
  - [ ] Side menu (block controls)
  - [ ] Link toolbar
  - [ ] File panel (for images)
- [ ] Ensure hover states match VSCode
- [ ] Test focus states and accessibility

**Success Criteria**:
- [ ] BlockNote matches VSCode dark theme
- [ ] All UI elements are properly styled
- [ ] Theme is consistent across all BlockNote components
- [ ] Visual appearance is polished and professional

---

### Phase 4: Image Rendering & File Handling (2-3 hours)

**Goal**: Implement image upload, rendering, and file handling.

#### 4.1 Image Upload Integration
- [ ] Implement image upload handler:
  - [ ] Use BlockNote file panel for image uploads
  - [ ] Handle file selection and validation
  - [ ] Upload images to appropriate location (local or server)
  - [ ] Generate image URLs for BlockNote blocks
  - [ ] Handle upload errors gracefully
- [ ] Test image upload:
  - [ ] Single image upload
  - [ ] Multiple image upload
  - [ ] Invalid file types
  - [ ] Large file handling

#### 4.2 Image Rendering
- [ ] Configure BlockNote image block rendering:
  - [ ] Display images inline in editor
  - [ ] Support image resizing
  - [ ] Support image alignment
  - [ ] Handle broken image links
- [ ] Test image rendering:
  - [ ] Local images
  - [ ] Remote images (URLs)
  - [ ] Image sizing and alignment
  - [ ] Image in markdown export

#### 4.3 File Path Handling
- [ ] Implement file path resolution:
  - [ ] Resolve relative image paths
  - [ ] Handle absolute paths
  - [ ] Support `.glyphnova/` folder for images
  - [ ] Preserve image paths in markdown export
- [ ] Update markdown export to include proper image paths
- [ ] Test file path handling:
  - [ ] Relative paths
  - [ ] Absolute paths
  - [ ] Path resolution in different contexts

**Success Criteria**:
- [ ] Images can be uploaded and inserted
- [ ] Images render correctly in editor
- [ ] Image paths are preserved in markdown export
- [ ] Image handling is robust and error-tolerant

---

### Phase 5: Editor Integration & Migration (2-3 hours)

**Goal**: Integrate BlockNote into existing editor system and provide migration path.

#### 5.1 UnifiedEditor Integration
- [ ] Update `UnifiedEditor.tsx`:
  - [ ] Add BlockNote as editor option
  - [ ] Detect file type and choose appropriate editor
  - [ ] Support switching between editors (if needed)
  - [ ] Handle editor state management
- [ ] Update `EditorPanel.tsx`:
  - [ ] Integrate BlockNote editor
  - [ ] Handle editor lifecycle
  - [ ] Manage editor focus and state

#### 5.2 Vditor Migration Strategy
- [ ] Decide on migration approach:
  - [ ] Option A: Replace Vditor entirely with BlockNote
  - [ ] Option B: Keep both editors, use BlockNote for markdown
  - [ ] Option C: Gradual migration with user preference
- [ ] Implement chosen migration strategy
- [ ] Update file type detection logic
- [ ] Test migration with existing files

#### 5.3 Editor Features Parity
- [ ] Ensure BlockNote supports all needed features:
  - [ ] Save functionality (Ctrl/Cmd+S)
  - [ ] Keyboard shortcuts
  - [ ] Undo/redo
  - [ ] Find/replace (if BlockNote supports)
  - [ ] Line numbers (if needed, may require custom implementation)
- [ ] Add any missing features or workarounds
- [ ] Test feature parity with Vditor

**Success Criteria**:
- [ ] BlockNote integrated into editor system
- [ ] File operations work correctly
- [ ] Migration strategy implemented
- [ ] Feature parity maintained or improved

---

## Dependencies

### Prerequisites
- Existing editor infrastructure (EditorPanel, UnifiedEditor)
- VSCode theme system (CSS variables)
- File system integration
- Image upload/handling system (may need to be created)

### Blocks
- None - can work in parallel with other features

### Enables
- Enhanced markdown editing experience
- Block-based document structure
- Future collaboration features
- Custom block types for workflows

---

## Risk Assessment

### High Risk
- **Breaking existing editor functionality**: Replacing Vditor may break existing features
  - **Mitigation**: Keep Vditor as fallback, gradual migration, thorough testing
  - **Rollback**: Keep Vditor code, easy to revert

- **Markdown compatibility issues**: Import/export may not preserve all markdown features
  - **Mitigation**: Extensive testing with various markdown files, handle edge cases
  - **Rollback**: Keep Vditor for complex markdown if needed

### Medium Risk
- **Performance issues**: BlockNote may be slower than Vditor for large files
  - **Mitigation**: Test with large files, implement lazy loading if needed
  - **Rollback**: Use Vditor for very large files

- **Theme integration complexity**: BlockNote theming may require significant customization
  - **Mitigation**: Use BlockNote theme API, CSS overrides, test thoroughly
  - **Rollback**: Adjust theme gradually, keep Vditor as backup

### Low Risk
- **Learning curve**: Developers need to learn BlockNote API
  - **Mitigation**: Good documentation, examples, gradual adoption
  - **Rollback**: N/A - knowledge transfer

---

## Rollback Procedures

### Immediate Rollback
If critical issues arise:
1. Revert BlockNote integration commits
2. Restore Vditor as primary editor
3. Remove BlockNote packages (optional)
4. Test application functionality

### Partial Rollback
If specific features have issues:
1. Keep BlockNote for simple markdown files
2. Use Vditor for complex markdown
3. Implement file type-based editor selection
4. Gradually fix BlockNote issues

### Emergency Rollback
If entire system fails:
1. Revert all BlockNote-related changes
2. Restore original editor components
3. Remove BlockNote dependencies
4. Document issues for future improvement

---

## Validation Checkpoints

### After Phase 1 (Installation)
- [ ] BlockNote packages installed
- [ ] Basic editor component renders
- [ ] Editor is editable
- [ ] No console errors

### After Phase 2 (Import/Export)
- [ ] Markdown imports correctly
- [ ] Markdown exports correctly
- [ ] File operations work
- [ ] Format preservation verified

### After Phase 3 (Theming)
- [ ] Theme matches VSCode
- [ ] All components styled
- [ ] Visual consistency achieved
- [ ] Accessibility maintained

### After Phase 4 (Images)
- [ ] Images upload correctly
- [ ] Images render in editor
- [ ] Image paths preserved
- [ ] Error handling works

### After Phase 5 (Integration)
- [ ] Editor integrated into system
- [ ] Migration strategy working
- [ ] Feature parity maintained
- [ ] No regressions

### Pre-Deployment Validation
- [ ] All features tested
- [ ] Performance acceptable
- [ ] Theme consistent
- [ ] File operations reliable
- [ ] User experience polished

---

## Success Criteria

1. ✅ **BlockNote Installed**: Packages installed and working
2. ✅ **Basic Editor**: Editor component created and functional
3. ✅ **Markdown Import**: Markdown files import correctly to blocks
4. ✅ **Markdown Export**: Blocks export correctly to markdown
5. ✅ **Theme Integration**: Matches VSCode dark theme
6. ✅ **Image Support**: Images upload, render, and export correctly
7. ✅ **Editor Integration**: Integrated into existing editor system
8. ✅ **Migration**: Migration strategy implemented
9. ✅ **Feature Parity**: All essential features working
10. ✅ **Performance**: Acceptable performance for typical file sizes
11. ✅ **User Experience**: Polished, Notion-like editing experience
12. ✅ **Documentation**: Code documented and examples provided

---

## Time Estimates

### Phase 1: Installation & Setup
- Install packages: 15 minutes
- Create basic component: 45 minutes
- Integration test: 30 minutes
- **Total**: 1.5 hours

### Phase 2: Markdown Import/Export
- Import implementation: 1 hour
- Export implementation: 1 hour
- File integration: 45 minutes
- Testing: 45 minutes
- **Total**: 3.5 hours

### Phase 3: Theme Integration
- Theme configuration: 1 hour
- CSS customization: 1 hour
- Component styling: 1 hour
- Testing: 30 minutes
- **Total**: 3.5 hours

### Phase 4: Image Handling
- Upload integration: 1 hour
- Image rendering: 1 hour
- File path handling: 45 minutes
- Testing: 30 minutes
- **Total**: 3 hours

### Phase 5: Integration & Migration
- UnifiedEditor integration: 1 hour
- Migration strategy: 1 hour
- Feature parity: 1 hour
- Testing: 1 hour
- **Total**: 4 hours

### Buffer Time (20%)
- **Additional time**: 3 hours

### Total Estimated Time
- **Minimum**: 10 hours
- **With buffer**: 12-16.8 hours
- **Realistic**: 14 hours

---

## Related Documents

- [[cursor/docs/plans/full-functional-human-file-editor/editor-features/11-image-rendering-plan.md]] - Related image rendering plan
- [[cursor/docs/plans/full-functional-human-file-editor/01-ui-foundation-theming-plan.md]] - Theming system plan
- [[cursor/rules/manual/tracking/plan-generation.mdc]] - Plan generation standards

---

**Plan Status:** Ready for execution
**Last Updated:** 2025-01-15
**Next Steps:** Begin Phase 1 implementation (Installation & Setup)
