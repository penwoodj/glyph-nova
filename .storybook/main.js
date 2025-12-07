// .storybook/main.js
// Storybook main configuration for Redwood.js desktop application

module.exports = {
  stories: [
    '../web/src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y', // Accessibility testing
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    builder: '@storybook/builder-vite',
  },
  features: {
    interactionsDebugger: true,
  },
  staticDirs: ['../web/public'],
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
  },
  async viteFinal(config) {
    // Ensure Vite resolves modules correctly
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...config.resolve.alias,
      src: '/home/jon/code/glyph-nova/web/src',
    }
    return config
  },
}

