/**
 * Debug logging utility
 *
 * Provides debug-level logging that can be enabled/disabled via environment variable
 * or configuration. All VERIFIED logs should use this utility.
 */

const DEBUG_ENABLED = process.env.RAG_DEBUG === 'true' || process.env.RAG_DEBUG === '1';

export function debugLog(module: string, message: string, ...args: any[]): void {
  if (DEBUG_ENABLED) {
    console.log(`[${module}] ${message}`, ...args);
  }
}

export function debugLogEnabled(): boolean {
  return DEBUG_ENABLED;
}
