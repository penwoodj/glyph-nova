// web/config/storybook.config.js
// Storybook server configuration for Redwood.js desktop application

module.exports = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y', // Accessibility testing
    '@storybook/addon-viewport', // Viewport testing for desktop app
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      // Use Vite config from Redwood.js
      viteConfigPath: '../vite.config.ts',
    },
  },
  core: {
    builder: '@storybook/builder-vite',
  },
  features: {
    interactionsDebugger: true,
    storyStoreV7: true,
  },
  staticDirs: ['../public'],
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
}

