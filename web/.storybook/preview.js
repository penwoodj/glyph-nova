// .storybook/preview.js
// Preview configuration for Storybook

// Import Tailwind CSS and app styles
import '../src/index.css'

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

// Global decorators
export const decorators = [
  (Story) => (
    <div style={{ background: '#1e1e1e', minHeight: '100vh', padding: '1rem' }}>
      <Story />
    </div>
  ),
]

