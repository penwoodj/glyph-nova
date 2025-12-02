// web/config/storybook.preview.js
// Preview configuration for Storybook with Redwood.js integration

import { withRedwoodJS } from '@redwoodjs/storybook-config'

// Import Tailwind CSS for component styling
import '../src/index.css'

// Global decorators for all stories
export const decorators = [
  withRedwoodJS(),
]

// Global parameters for all stories
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  // VSCode dark theme for desktop app development
  backgrounds: {
    default: 'vscode-dark',
    values: [
      {
        name: 'vscode-dark',
        value: '#1e1e1e',
      },
      {
        name: 'vscode-editor',
        value: '#252526',
      },
      {
        name: 'vscode-sidebar',
        value: '#252526',
      },
    ],
  },
  // Viewport presets for desktop app
  viewport: {
    viewports: {
      desktop: {
        name: 'Desktop',
        styles: {
          width: '1280px',
          height: '800px',
        },
      },
      desktopLarge: {
        name: 'Desktop Large',
        styles: {
          width: '1920px',
          height: '1080px',
        },
      },
    },
    defaultViewport: 'desktop',
  },
}

