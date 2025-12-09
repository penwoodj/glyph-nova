/**
 * Retry Utility Service
 *
 * Provides retry logic for network requests and async operations.
 * Implements exponential backoff and configurable retry strategies.
 *
 * Reference: Report 09 (Desktop App Architecture - Error handling section)
 */

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number
  /** Initial delay in milliseconds before first retry (default: 1000) */
  initialDelay?: number
  /** Maximum delay in milliseconds (default: 10000) */
  maxDelay?: number
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number
  /** Function to determine if error should be retried (default: retry all errors) */
  shouldRetry?: (error: unknown, attempt: number) => boolean
  /** Function called before each retry attempt */
  onRetry?: (error: unknown, attempt: number, delay: number) => void
}

/**
 * Default retry options
 */
const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'shouldRetry' | 'onRetry'>> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
}

/**
 * Calculate delay for exponential backoff
 */
function calculateDelay(attempt: number, options: Required<Omit<RetryOptions, 'shouldRetry' | 'onRetry'>>): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1)
  return Math.min(delay, options.maxDelay)
}

/**
 * Check if error is retryable (network errors, timeouts, 5xx errors)
 */
function isRetryableError(error: unknown): boolean {
  // Network errors (fetch failures)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }

  // AbortError (timeouts)
  if (error instanceof Error && error.name === 'AbortError') {
    return true
  }

  // Check for error codes that indicate transient failures
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code
    const retryableCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'EAI_AGAIN']
    return retryableCodes.includes(code)
  }

  // Check for HTTP status codes (5xx server errors are retryable)
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status
    return status >= 500 && status < 600
  }

  // Check for Response objects with 5xx status
  if (error instanceof Response) {
    return error.status >= 500 && error.status < 600
  }

  return false
}

/**
 * Retry an async operation with exponential backoff
 *
 * @param fn - Async function to retry
 * @param options - Retry configuration options
 * @returns Result of the async function
 * @throws Last error if all retries fail
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = {
    ...DEFAULT_OPTIONS,
    shouldRetry: options.shouldRetry || isRetryableError,
    onRetry: options.onRetry,
  }

  let lastError: unknown

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry if this was the last attempt
      if (attempt >= config.maxAttempts) {
        break
      }

      // Check if error should be retried
      if (!config.shouldRetry(error, attempt)) {
        throw error
      }

      // Calculate delay for exponential backoff
      const delay = calculateDelay(attempt, config)

      // Call onRetry callback if provided
      if (config.onRetry) {
        config.onRetry(error, attempt, delay)
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // All retries failed, throw last error
  throw lastError
}

/**
 * Retry a fetch request with exponential backoff
 *
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param retryOptions - Retry configuration options
 * @returns Response from fetch
 */
export async function retryFetch(
  url: string | URL,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return retry(
    async () => {
      const response = await fetch(url, options)

      // Check if response indicates a retryable error (5xx)
      if (response.status >= 500 && response.status < 600) {
        throw response
      }

      // Check if response is not ok (4xx errors are not retryable)
      if (!response.ok && response.status < 500) {
        throw response
      }

      return response
    },
    {
      ...retryOptions,
      shouldRetry: (error, attempt) => {
        // Use custom shouldRetry if provided
        if (retryOptions.shouldRetry) {
          return retryOptions.shouldRetry(error, attempt)
        }

        // Default: retry network errors and 5xx errors
        return isRetryableError(error)
      },
    }
  )
}

/**
 * Retry configuration for Ollama requests
 * Ollama requests may be slow, so we use longer delays
 */
export const OLLAMA_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 2000, // Start with 2 seconds for Ollama
  maxDelay: 15000, // Max 15 seconds
  backoffMultiplier: 2,
  shouldRetry: (error) => {
    // Retry network errors and timeouts
    return isRetryableError(error)
  },
  onRetry: (error, attempt, delay) => {
    console.warn(`[Retry] Ollama request failed (attempt ${attempt}/${3}), retrying in ${delay}ms:`, error)
  },
}

/**
 * Retry configuration for general network requests
 */
export const NETWORK_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  shouldRetry: (error) => {
    // Retry network errors and 5xx errors
    return isRetryableError(error)
  },
  onRetry: (error, attempt, delay) => {
    console.warn(`[Retry] Network request failed (attempt ${attempt}/${3}), retrying in ${delay}ms:`, error)
  },
}
