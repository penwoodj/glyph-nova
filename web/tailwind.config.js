/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.stories.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // VSCode Dark Theme Colors
        'vscode-bg': '#1e1e1e',
        'vscode-editor-bg': '#252526',
        'vscode-sidebar-bg': '#252526',
        'vscode-fg': '#d4d4d4',
        'vscode-fg-secondary': '#cccccc',
        'vscode-border': '#3e3e3e',
        'vscode-active-border': '#007acc',
        'vscode-selection-bg': '#264f78',
        'vscode-hover-bg': '#2a2d2e',
        'vscode-button-bg': '#0e639c',
        'vscode-button-fg': '#ffffff',
        'vscode-button-hover': '#1177bb',
        'vscode-button-hover-bg': '#1177bb',
        'vscode-button-secondaryBg': '#3c3c3c',
        'vscode-button-secondaryFg': '#cccccc',
        'vscode-button-secondaryHoverBg': '#454545',
        'vscode-input-bg': '#3c3c3c',
        'vscode-input-border': '#454545',
        'vscode-focus-border': '#007acc',
        'vscode-tree-indent': '#383838',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

