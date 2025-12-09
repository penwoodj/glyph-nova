/**
 * Error Reporting Service
 *
 * Provides centralized error reporting with optional Sentry integration.
 * Falls back to console logging if Sentry is not configured.
 *
 * Reference: Report 09 (Desktop App Architecture - Error handling section)
 */

interface ErrorContext {
  filename?: string
  lineno?: number
  colno?: number
  stack?: string
  userAgent?: string
  url?: string
  extra?: Record<string, unknown>
}

/**
 * Error reporting service that supports optional Sentry integration
 */
class ErrorReportingService {
  private sentryAvailable = false
  private enabled = true

  constructor() {
    // Check if Sentry is available (optional dependency)
    try {
      // Dynamic import check - Sentry may not be installed
      if (typeof window !== 'undefined') {
        // Check if @sentry/browser is available
        // We'll use a try-catch approach to handle optional dependency
        this.sentryAvailable = false // Will be set to true if Sentry is configured
      }
    } catch (error) {
      // Sentry not available - use console logging fallback
      this.sentryAvailable = false
    }

    // Check if error reporting is enabled via environment variable
    // For now, default to enabled (can be disabled via env var in future)
    this.enabled = true
  }

  /**
   * Initialize error reporting service
   * Call this once at app startup if Sentry is configured
   */
  init(sentryDsn?: string, environment?: string): void {
    if (!sentryDsn) {
      // No Sentry DSN provided - use console logging fallback
      this.sentryAvailable = false
      console.log('[Error Reporting] Sentry not configured - using console logging')
      return
    }

    // Try to initialize Sentry if available
    // Note: This requires @sentry/browser to be installed
    // For now, we'll use a conditional approach
    try {
      // Dynamic import would be: const Sentry = await import('@sentry/browser')
      // For MVP, we'll use console logging until Sentry is explicitly added
      console.log('[Error Reporting] Sentry DSN provided but @sentry/browser not installed')
      console.log('[Error Reporting] To enable Sentry: yarn add @sentry/browser')
      this.sentryAvailable = false
    } catch (error) {
      console.warn('[Error Reporting] Failed to initialize Sentry:', error)
      this.sentryAvailable = false
    }
  }

  /**
   * Capture an exception/error
   */
  captureException(error: Error, context?: ErrorContext): void {
    if (!this.enabled) return

    const errorInfo = {
      message: error.message,
      stack: error.stack,
      ...context,
    }

    if (this.sentryAvailable) {
      // Send to Sentry if available
      // Example: Sentry.captureException(error, { extra: context })
      console.error('[Error Reporting] Sentry capture (not implemented):', errorInfo)
    } else {
      // Fallback to console logging
      console.error('[Error Reporting] Captured exception:', errorInfo)
    }
  }

  /**
   * Capture a message (non-error)
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext): void {
    if (!this.enabled) return

    const messageInfo = {
      message,
      level,
      ...context,
    }

    if (this.sentryAvailable) {
      // Send to Sentry if available
      // Example: Sentry.captureMessage(message, { level, extra: context })
      console.log(`[Error Reporting] Sentry message (not implemented):`, messageInfo)
    } else {
      // Fallback to console logging
      const logMethod = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log
      logMethod(`[Error Reporting] ${level}:`, messageInfo)
    }
  }

  /**
   * Set user context for error reporting
   */
  setUser(user: { id?: string; username?: string; email?: string }): void {
    if (!this.enabled || !this.sentryAvailable) return

    // Example: Sentry.setUser(user)
    console.log('[Error Reporting] Set user context (not implemented):', user)
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category?: string, level?: 'info' | 'warning' | 'error'): void {
    if (!this.enabled || !this.sentryAvailable) return

    // Example: Sentry.addBreadcrumb({ message, category, level })
    console.log('[Error Reporting] Breadcrumb (not implemented):', { message, category, level })
  }
}

// Export singleton instance
export const errorReportingService = new ErrorReportingService()

/**
 * Helper function to capture errors from global error handler
 */
export function captureError(
  error: Error | unknown,
  context?: {
    filename?: string
    lineno?: number
    colno?: number
    stack?: string
    extra?: Record<string, unknown>
  }
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error))
  errorReportingService.captureException(errorObj, {
    filename: context?.filename,
    lineno: context?.lineno,
    colno: context?.colno,
    stack: context?.stack || errorObj.stack,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    extra: context?.extra,
  })
}

/**
 * Helper function to capture promise rejections
 */
export function capturePromiseRejection(reason: unknown, promise?: Promise<unknown>): void {
  const error = reason instanceof Error ? reason : new Error(String(reason))
  errorReportingService.captureException(error, {
    stack: error.stack,
    extra: {
      promiseRejection: true,
      promise: promise ? 'Promise object' : undefined,
    },
  })
}
