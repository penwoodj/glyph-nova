---
name: Image Rendering Implementation Plan
overview: Implement image rendering in markdown files and editor, supporting relative/absolute paths, image display in preview and read-only modes, and proper path resolution
todos: []
---

# Image Rendering Implementation Plan

**Status:** Ready to Execute | **Created:** 2025-01-15 | **Last Updated:** 2025-01-15

> 🎯 **Goal:** Implement image rendering functionality for markdown files and editor, allowing images to be displayed inline when referenced in markdown. Support relative and absolute paths, proper path resolution, and image display in both preview and read-only modes.

---

## Overview

This plan implements image rendering that:
- Displays images in markdown files when using markdown syntax `![alt](path)`
- Supports relative and absolute image paths
- Resolves image paths relative to the markdown file location
- Renders images in Vditor preview mode
- Renders images in read-only CodeEditor mode (for markdown)
- Handles various image formats (PNG, JPG, JPEG, GIF, SVG, WebP)
- Provides proper error handling for missing images

**Target**: Image rendering matching VSCode markdown preview behavior
**Priority**: Medium (improves markdown editing experience)
**Estimated Time**: 4-6 hours (with 20% buffer: 4.8-7.2 hours)
**Risk Level**: Medium (path resolution complexity, security considerations)

---

## Current State Analysis

### Existing Implementation
- **VditorEditor**: Has image upload handler (not implemented, TODO)
- **Markdown Rendering**: Uses Vditor for markdown editing
- **Read-Only Mode**: Uses SyntaxHighlighter for code, no markdown rendering
- **No Image Rendering**: Images in markdown are not displayed
- **Path Resolution**: No path resolution for relative image paths

### Gaps Identified
- Images in markdown not rendered
- No path resolution for relative paths
- No image display in read-only mode
- Image upload handler not implemented
- No support for image file access

---

## External Documentation Links

### Image Rendering Patterns
1. **VSCode Markdown Preview**
   - Link: https://code.visualstudio.com/docs/languages/markdown#_markdown-preview
   - Description: VSCode markdown preview image rendering
   - Rating: High - Official VSCode documentation

2. **React Markdown Image Rendering**
   - Link: https://github.com/remarkjs/react-markdown#use-custom-components-syntax-highlight-and-plugins
   - Description: React Markdown custom image component
   - Rating: High - React Markdown documentation

3. **Vditor Image Upload**
   - Link: https://github.com/Vanessa219/vditor#upload
   - Description: Vditor image upload configuration
   - Rating: High - Vditor documentation

### Path Resolution
4. **Node.js Path Module**
   - Link: https://nodejs.org/api/path.html
   - Description: Node.js path utilities for path resolution
   - Rating: High - Node.js documentation

5. **URL Path Resolution**
   - Link: https://developer.mozilla.org/en-US/docs/Web/API/URL
   - Description: URL API for path resolution
   - Rating: High - MDN documentation

### File Access & Security
6. **File System Access API**
   - Link: https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
   - Description: Browser file system access
   - Rating: Medium - MDN documentation

7. **Content Security Policy**
   - Link: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
   - Description: Content Security Policy for image loading
   - Rating: High - Security considerations

### Image Formats
8. **Image File Formats**
   - Link: https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
   - Description: Supported image formats
   - Rating: High - MDN documentation

9. **SVG Security**
   - Link: https://developer.mozilla.org/en-US/docs/Web/SVG
   - Description: SVG rendering and security
   - Rating: Medium - MDN documentation

---

## Implementation Phases

### Phase 1: Path Resolution Utility (1-1.5 hours)

**Goal**: Create utility functions for resolving image paths.

#### 1.1 Create Path Resolution Function
- [ ] Create `web/src/lib/imageUtils.ts`:
  - [ ] Function to resolve relative image paths
  - [ ] Function to resolve absolute paths
  - [ ] Function to check if path is relative or absolute
  - [ ] Handle path normalization
- [ ] Path resolution logic:
  ```typescript
  export function resolveImagePath(
    imagePath: string,
    markdownFilePath: string
  ): string {
    // If absolute path, return as-is
    if (isAbsolutePath(imagePath)) {
      return imagePath
    }

    // Resolve relative to markdown file directory
    const markdownDir = path.dirname(markdownFilePath)
    return path.join(markdownDir, imagePath)
  }
  ```

#### 1.2 Path Validation
- [ ] Add path validation:
  - [ ] Check if path is within project directory (security)
  - [ ] Validate file extensions
  - [ ] Handle path traversal attacks (../)
  - [ ] Normalize paths
- [ ] Security checks:
  - [ ] Prevent access outside project root
  - [ ] Validate image file extensions
  - [ ] Sanitize paths

#### 1.3 GraphQL Query for Images
- [ ] Create or use existing file read query:
  - [ ] Query to read image file
  - [ ] Return image data or URL
  - [ ] Handle file not found errors
- [ ] Image file handling:
  - [ ] Support reading image files via GraphQL
  - [ ] Return base64 data URL or file path
  - [ ] Cache image data if needed

**Success Criteria**:
- [ ] Path resolution works correctly
- [ ] Relative paths resolved relative to markdown file
- [ ] Absolute paths handled correctly
- [ ] Security checks in place

---

### Phase 2: Vditor Image Rendering (1.5-2 hours)

**Goal**: Enable image rendering in Vditor editor.

#### 2.1 Vditor Image Upload Handler
- [ ] Implement image upload handler in `VditorEditor.tsx`:
  - [ ] Handle file selection
  - [ ] Upload image to appropriate location
  - [ ] Return image URL for Vditor
  - [ ] Handle upload errors
- [ ] Upload implementation:
  ```typescript
  upload: {
    accept: 'image/*',
    handler: async (files: File[]) => {
      // Upload files via GraphQL mutation
      // Return URLs for Vditor
      const uploadedUrls = await uploadImages(files)
      return {
        msg: '',
        code: 0,
        data: {
          errFiles: [],
          succMap: uploadedUrls,
        },
      }
    },
  }
  ```

#### 2.2 Image Path Resolution in Vditor
- [ ] Configure Vditor to resolve image paths:
  - [ ] Use custom image renderer
  - [ ] Resolve relative paths
  - [ ] Handle image loading errors
- [ ] Vditor preview configuration:
  - [ ] Enable image rendering in preview
  - [ ] Configure image size limits
  - [ ] Handle broken image links

#### 2.3 Image Display in Vditor
- [ ] Test image rendering:
  - [ ] Local images (relative paths)
  - [ ] Absolute paths
  - [ ] Remote URLs (if supported)
  - [ ] Various image formats
- [ ] Handle edge cases:
  - [ ] Missing images
  - [ ] Large images
  - [ ] Invalid image formats

**Success Criteria**:
- [ ] Images render in Vditor preview
- [ ] Image upload works
- [ ] Path resolution works
- [ ] Error handling works

---

### Phase 3: Read-Only Mode Image Rendering (1.5-2 hours)

**Goal**: Add image rendering to read-only markdown view.

#### 3.1 Markdown Renderer for Read-Only
- [ ] Create markdown renderer component:
  - [ ] Use `react-markdown` or similar
  - [ ] Custom image component
  - [ ] Resolve image paths
  - [ ] Handle image loading
- [ ] Create `MarkdownRenderer.tsx`:
  ```tsx
  import ReactMarkdown from 'react-markdown'
  import { Image } from './Image'

  export const MarkdownRenderer = ({ content, filePath }) => {
    return (
      <ReactMarkdown
        components={{
          img: ({ src, alt }) => (
            <Image src={src} alt={alt} basePath={filePath} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }
  ```

#### 3.2 Custom Image Component
- [ ] Create `Image.tsx` component:
  - [ ] Resolve image path
  - [ ] Load image via GraphQL
  - [ ] Display image with error handling
  - [ ] Support image sizing and styling
- [ ] Image component features:
  - [ ] Path resolution
  - [ ] Loading state
  - [ ] Error state (broken image)
  - [ ] Responsive sizing
  - [ ] Click to view full size (optional)

#### 3.3 CodeEditor Integration
- [ ] Update `CodeEditor.tsx` read-only mode:
  - [ ] Detect markdown files
  - [ ] Use MarkdownRenderer for markdown
  - [ ] Keep SyntaxHighlighter for code files
  - [ ] Handle file type detection
- [ ] File type detection:
  - [ ] Check file extension (.md, .markdown)
  - [ ] Use MarkdownRenderer for markdown
  - [ ] Use SyntaxHighlighter for code

**Success Criteria**:
- [ ] Images render in read-only markdown view
- [ ] Path resolution works
- [ ] Error handling works
- [ ] CodeEditor integration complete

---

### Phase 4: Image Loading & Error Handling (1 hour)

**Goal**: Implement robust image loading with error handling.

#### 4.1 Image Loading Service
- [ ] Create image loading service:
  - [ ] `web/src/services/imageLoader.ts`
  - [ ] Function to load image via GraphQL
  - [ ] Cache image data
  - [ ] Handle loading errors
- [ ] Image loading implementation:
  ```typescript
  export async function loadImage(
    imagePath: string,
    basePath: string
  ): Promise<string> {
    const resolvedPath = resolveImagePath(imagePath, basePath)

    // Query image file via GraphQL
    const { data } = await apolloClient.query({
      query: READ_FILE_QUERY,
      variables: { path: resolvedPath },
    })

    // Convert to data URL or return file path
    return convertToDataUrl(data.readFile)
  }
  ```

#### 4.2 Error Handling
- [ ] Handle image loading errors:
  - [ ] File not found
  - [ ] Invalid image format
  - [ ] Network errors
  - [ ] Permission errors
- [ ] Error display:
  - [ ] Show placeholder for missing images
  - [ ] Display error message
  - [ ] Allow retry (optional)

#### 4.3 Image Optimization (Optional)
- [ ] Add image optimization:
  - [ ] Resize large images
  - [ ] Lazy loading
  - [ ] Image caching
  - [ ] Thumbnail generation (optional)

**Success Criteria**:
- [ ] Image loading works correctly
- [ ] Error handling robust
- [ ] User-friendly error messages
- [ ] Performance acceptable

---

### Phase 5: Integration & Testing (0.5-1 hour)

**Goal**: Complete integration and comprehensive testing.

#### 5.1 Integration Testing
- [ ] Test with various scenarios:
  - [ ] Images in same directory as markdown
  - [ ] Images in subdirectories
  - [ ] Images in parent directories (if allowed)
  - [ ] Absolute paths
  - [ ] Different image formats
- [ ] Test edge cases:
  - [ ] Missing images
  - [ ] Invalid image files
  - [ ] Very large images
  - [ ] Many images in one file

#### 5.2 Security Testing
- [ ] Test security:
  - [ ] Path traversal attempts
  - [ ] Access outside project root
  - [ ] Invalid file types
  - [ ] Malicious image files (if applicable)

#### 5.3 Performance Testing
- [ ] Test performance:
  - [ ] Loading many images
  - [ ] Large image files
  - [ ] Image caching effectiveness
  - [ ] Rendering performance

**Success Criteria**:
- [ ] All functionality tested
- [ ] Security verified
- [ ] Performance acceptable
- [ ] Edge cases handled

---

## Dependencies

### Internal Dependencies
- **VditorEditor Component**: Existing `VditorEditor.tsx` component
- **CodeEditor Component**: Existing `CodeEditor.tsx` component
- **GraphQL API**: Existing file read queries
- **File Utilities**: Existing file path utilities

### External Dependencies
- **react-markdown**: For markdown rendering in read-only mode (if not already installed)
- **GraphQL**: For image file access

---

## Risk Assessment

### High Risk
- **Path Traversal Security**: Relative paths might allow access outside project
  - **Mitigation**: Strict path validation, prevent ../ outside root, sanitize paths

### Medium Risk
- **Image Loading Performance**: Large images might impact performance
  - **Mitigation**: Image optimization, lazy loading, caching, size limits
- **Path Resolution Complexity**: Complex path resolution might have edge cases
  - **Mitigation**: Thorough testing, handle edge cases, clear error messages

### Low Risk
- **Image Rendering**: Standard HTML img tag rendering
- **Vditor Integration**: Vditor supports image rendering

---

## Rollback Procedures

### Immediate Rollback
- **Git revert**: Revert to previous commit if critical issues found
- **Feature flag**: Disable image rendering, restore previous behavior
- **Component restoration**: Restore previous markdown renderer

### Phase-Specific Rollback
- **Phase 1**: Remove path resolution, use absolute paths only
- **Phase 2**: Remove Vditor image upload, keep basic rendering
- **Phase 3**: Remove read-only image rendering, keep Vditor only
- **Phase 4**: Simplify error handling, keep basic loading

### Emergency Rollback
- **Complete feature removal**: Revert all changes, restore previous editor
- **Documentation**: Document what went wrong for future reference

---

## Validation Checkpoints

### After Phase 1 (Path Resolution)
- [ ] Path resolution works correctly
- [ ] Relative paths resolved
- [ ] Security checks in place
- [ ] GraphQL query works

### After Phase 2 (Vditor Rendering)
- [ ] Images render in Vditor
- [ ] Image upload works
- [ ] Path resolution works
- [ ] Error handling works

### After Phase 3 (Read-Only Rendering)
- [ ] Images render in read-only mode
- [ ] MarkdownRenderer works
- [ ] CodeEditor integration complete
- [ ] File type detection works

### After Phase 4 (Error Handling)
- [ ] Image loading works
- [ ] Error handling robust
- [ ] User-friendly messages
- [ ] Performance acceptable

### After Phase 5 (Integration)
- [ ] All functionality tested
- [ ] Security verified
- [ ] Performance acceptable
- [ ] Edge cases handled

---

## Success Criteria

1. **Image Rendering**: Images display in markdown files
2. **Path Resolution**: Relative paths resolved correctly
3. **Vditor Support**: Images render in Vditor preview
4. **Read-Only Support**: Images render in read-only markdown view
5. **Multiple Formats**: Support PNG, JPG, JPEG, GIF, SVG, WebP
6. **Error Handling**: Graceful handling of missing/invalid images
7. **Security**: Path traversal prevented, access control enforced
8. **Image Upload**: Vditor image upload works (optional)
9. **Performance**: Fast image loading and rendering
10. **Integration**: Works seamlessly with existing editors
11. **No Regressions**: Existing editor functionality unchanged
12. **User Experience**: Clear error messages, loading states
13. **Documentation**: Code documented for future maintenance
14. **Edge Cases**: Handles various path scenarios correctly
15. **Visual Quality**: Images display correctly sized and styled

---

## Code Examples

### Example: Path Resolution Utility
```typescript
// web/src/lib/imageUtils.ts
import path from 'path'

export function isAbsolutePath(filePath: string): boolean {
  return path.isAbsolute(filePath) || filePath.startsWith('http://') || filePath.startsWith('https://')
}

export function resolveImagePath(
  imagePath: string,
  markdownFilePath: string
): string {
  // Handle absolute paths and URLs
  if (isAbsolutePath(imagePath)) {
    return imagePath
  }

  // Resolve relative to markdown file directory
  const markdownDir = path.dirname(markdownFilePath)
  const resolvedPath = path.resolve(markdownDir, imagePath)

  // Security: Prevent access outside project root
  const projectRoot = process.env.PROJECT_ROOT || '/'
  if (!resolvedPath.startsWith(projectRoot)) {
    throw new Error('Image path outside project root')
  }

  return resolvedPath
}

export function isValidImageExtension(filePath: string): boolean {
  const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
  const ext = path.extname(filePath).toLowerCase()
  return validExtensions.includes(ext)
}
```

### Example: Custom Image Component
```tsx
// web/src/components/Editor/Image.tsx
import { useState, useEffect } from 'react'
import { resolveImagePath } from 'src/lib/imageUtils'
import { loadImage } from 'src/services/imageLoader'

interface ImageProps {
  src: string
  alt?: string
  basePath?: string
}

export const Image = ({ src, alt, basePath }: ImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!basePath) {
          setError('Base path required for relative images')
          return
        }

        const resolvedPath = resolveImagePath(src, basePath)
        const url = await loadImage(resolvedPath, basePath)
        setImageUrl(url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load image')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [src, basePath])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 text-vscode-fg-secondary">
        Loading image...
      </div>
    )
  }

  if (error || !imageUrl) {
    return (
      <div className="flex items-center justify-center p-4 text-red-400 border border-red-400 rounded">
        <span>Failed to load image: {error || src}</span>
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt || 'Image'}
      className="max-w-full h-auto rounded"
      style={{ maxHeight: '500px' }}
    />
  )
}
```

### Example: Markdown Renderer
```tsx
// web/src/components/Editor/MarkdownRenderer.tsx
import ReactMarkdown from 'react-markdown'
import { Image } from './Image'

interface MarkdownRendererProps {
  content: string
  filePath?: string
}

export const MarkdownRenderer = ({ content, filePath }: MarkdownRendererProps) => {
  return (
    <div className="markdown-content prose prose-invert max-w-none">
      <ReactMarkdown
        components={{
          img: ({ src, alt }) => (
            <Image
              src={src || ''}
              alt={alt}
              basePath={filePath}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

### Example: Vditor Image Upload Handler
```typescript
// web/src/components/Editor/VditorEditor.tsx
upload: {
  accept: 'image/*',
  handler: async (files: File[]) => {
    try {
      const uploadedUrls: Record<string, string> = {}

      for (const file of files) {
        // Upload via GraphQL mutation
        const { data } = await apolloClient.mutate({
          mutation: UPLOAD_IMAGE_MUTATION,
          variables: {
            file: file,
            path: `images/${file.name}`, // Or user-specified path
          },
        })

        uploadedUrls[file.name] = data.uploadImage.url
      }

      return {
        msg: '',
        code: 0,
        data: {
          errFiles: [],
          succMap: uploadedUrls,
        },
      }
    } catch (error) {
      console.error('Image upload error:', error)
      return {
        msg: 'Upload failed',
        code: -1,
        data: {
          errFiles: files.map(f => f.name),
          succMap: {},
        },
      }
    }
  },
}
```

### Example: CodeEditor Read-Only with Markdown
```tsx
// web/src/components/Editor/CodeEditor.tsx
import { MarkdownRenderer } from './MarkdownRenderer'
import { detectFileType } from 'src/lib/fileUtils'

// In read-only mode
if (readonly) {
  const fileType = filePath ? detectFileType(filePath) : 'text'

  if (fileType === 'markdown') {
    return (
      <div className="h-full w-full overflow-auto bg-vscode-editor-bg p-4">
        <MarkdownRenderer content={editedContent} filePath={filePath} />
      </div>
    )
  }

  // Use SyntaxHighlighter for code files
  return (
    <SyntaxHighlighter ... />
  )
}
```

---

## Notes

- Security is critical - prevent path traversal attacks
- Image paths should be resolved relative to markdown file location
- Support both relative and absolute paths
- Handle missing images gracefully with clear error messages
- Consider image optimization for large files
- Lazy loading can improve performance with many images
- Vditor image upload is optional but improves UX
- Read-only markdown rendering is important for viewing markdown files
- Test with various path scenarios (same dir, subdir, parent dir, absolute)

---

**Status**: Ready for implementation
**Created**: 2025-01-15
**Last Updated**: 2025-01-15
**Next Steps**: Begin Phase 1 implementation
