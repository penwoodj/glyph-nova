# Image Capabilities

**Related:** [index](./index.md) | [editor-experience](./editor-experience.md) | [context-engineering](./context-engineering.md)

---

## Local Image Generation

**Goal:** Generate images without cloud APIs.

### Supported Models

```
Stable Diffusion:
├─ SD 1.5 (fast, lower quality)
├─ SDXL (slower, high quality)
└─ SD Turbo (real-time, preview)

Flux:
├─ Flux Dev (research, open)
└─ Flux Schnell (fast inference)

ControlNet:
├─ Canny edge detection
├─ Depth map
└─ Pose estimation
```

### Integration Points

```markdown
In markdown:
![Generate: A modern UI mockup for a chat interface](generate)

In chat:
User: Create a logo for Glyph Nova
AI: [Generates multiple options, shows inline]

In code comments:
// @generate-icon: A file tree icon, minimalist, 24x24
```

---

## Image Editing

**Goal:** Edit images inline with AI assistance.

### Features

- **InstructPix2Pix**: Edit with text instructions
  ```
  Original: photo.jpg
  Instruction: "Make the background darker"
  Result: photo-edited.jpg
  ```
- **Inpainting**: Select area to regenerate
- **Upscaling**: Local Real-ESRGAN
- **Style transfer**: Apply artistic styles

---

## Context-Aware Generation

**Goal:** Use codebase context for relevant images.

```typescript
// AI reads component code to generate mockup
function generateMockupFromComponent(componentPath: string) {
  const code = readFile(componentPath)
  const uiStructure = parseJSXStructure(code)
  const prompt = `
    Generate a UI mockup for:
    ${uiStructure.description}

    Layout:
    ${uiStructure.layout}

    Style: Modern, clean, dark theme
  `
  return generateImage(prompt, { model: 'sdxl' })
}
```

---

**See also:** [editor-experience](./editor-experience.md) for markdown integration, [context-engineering](./context-engineering.md) for context-aware features
