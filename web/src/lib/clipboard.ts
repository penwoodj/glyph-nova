/**
 * Clipboard Utilities
 *
 * Utility functions for clipboard operations in the desktop application.
 * Handles copying file paths and integrating with chat functionality.
 *
 * Reference: Report 07 (Clipboard integration)
 */

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      return successful
    } catch (err) {
      document.body.removeChild(textArea)
      return false
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Copy file path to clipboard
 */
export const copyFilePath = async (filePath: string): Promise<boolean> => {
  return await copyToClipboard(filePath)
}

/**
 * Read text from clipboard
 */
export const readFromClipboard = async (): Promise<string | null> => {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      return await navigator.clipboard.readText()
    }
    return null
  } catch (error) {
    console.error('Failed to read from clipboard:', error)
    return null
  }
}

