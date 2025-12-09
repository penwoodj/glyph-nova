import { hydrateRoot, createRoot } from 'react-dom/client'

import App from './App'
import Routes from './Routes'
import { captureError, capturePromiseRejection, errorReportingService } from './services/errorReporting'

/**
 * Global Error Handler
 *
 * Catches unhandled JavaScript errors and promise rejections that occur outside
 * of React components. Provides centralized error logging and user notification.
 *
 * Reference: Report 09 (Desktop App Architecture - Error handling section)
 */
function setupGlobalErrorHandler() {
  // Initialize error reporting service
  // For MVP: Uses console logging fallback
  // To enable Sentry: Install @sentry/browser and provide DSN via environment variable
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN
  const environment = import.meta.env.MODE || 'development'
  errorReportingService.init(sentryDsn, environment)

  // Handle unhandled JavaScript errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message)

    // Log to console for debugging
    console.error('Global error handler caught unhandled error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error,
      stack: error.stack,
    })

    // Send to error reporting service (Sentry if configured, otherwise console)
    captureError(error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: error.stack,
    })

    // Prevent default browser error handling if needed
    // event.preventDefault()
  })

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))

    // Log to console for debugging
    console.error('Global error handler caught unhandled promise rejection:', {
      reason: event.reason,
      promise: event.promise,
      error,
      stack: error.stack,
    })

    // Send to error reporting service (Sentry if configured, otherwise console)
    capturePromiseRejection(event.reason, event.promise)

    // Prevent default browser console error for unhandled rejections
    // event.preventDefault()
  })
}

// Setup global error handler before app initialization
setupGlobalErrorHandler()

/**
 * When `#redwood-app` isn't empty then it's very likely that you're using
 * prerendering. So React attaches event listeners to the existing markup
 * rather than replacing it.
 * https://react.dev/reference/react-dom/client/hydrateRoot
 */
const redwoodAppElement = document.getElementById('redwood-app')

if (!redwoodAppElement) {
  throw new Error(
    "Could not find an element with ID 'redwood-app'. Please ensure it " +
      "exists in your 'web/src/index.html' file."
  )
}

if (redwoodAppElement.children?.length > 0) {
  hydrateRoot(
    redwoodAppElement,
    <App>
      <Routes />
    </App>
  )
} else {
  const root = createRoot(redwoodAppElement)
  root.render(
    <App>
      <Routes />
    </App>
  )
}
