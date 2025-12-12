import { watch, WatchOptions } from 'fs';
import { statSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * File Watcher for RAG Indexing
 *
 * Monitors indexed documents for changes and automatically re-indexes them.
 * This keeps the vector store up-to-date as documents are edited.
 *
 * Uses Node.js fs.watch for efficient file system monitoring.
 * Debounces rapid changes to avoid excessive re-indexing.
 */

export interface FileWatcherOptions {
  debounceMs?: number; // Delay before re-indexing after a change (default: 1000ms)
  recursive?: boolean; // Watch subdirectories (default: true)
  persistent?: boolean; // Keep process alive (default: true)
}

export type ReindexCallback = (filePath: string) => Promise<void>;

export class FileWatcher {
  private watchedFiles: Map<string, NodeJS.Timeout> = new Map();
  private watchers: Map<string, ReturnType<typeof watch>> = new Map();
  private reindexCallback: ReindexCallback;
  private options: Required<FileWatcherOptions>;

  constructor(reindexCallback: ReindexCallback, options: FileWatcherOptions = {}) {
    this.reindexCallback = reindexCallback;
    this.options = {
      debounceMs: options.debounceMs ?? 1000,
      recursive: options.recursive ?? true,
      persistent: options.persistent ?? true,
    };
  }

  /**
   * Start watching a file or directory
   *
   * When changes are detected, the reindex callback is called after
   * the debounce period. This prevents re-indexing on every keystroke.
   */
  watchFile(filePath: string): void {
    const absolutePath = resolve(filePath);

    if (!existsSync(absolutePath)) {
      console.warn(`[FileWatcher] Path not found: ${absolutePath}`);
      return;
    }

    // If already watching, skip
    if (this.watchers.has(absolutePath)) {
      return;
    }

    try {
      const stats = statSync(absolutePath);

      if (stats.isFile()) {
        // Watch single file
        this.watchSingleFile(absolutePath);
      } else if (stats.isDirectory()) {
        // Watch directory (recursively if enabled)
        this.watchDirectory(absolutePath);
      }
    } catch (error: any) {
      console.warn(`[FileWatcher] Error watching ${absolutePath}: ${error.message}`);
    }
  }

  /**
   * Watch multiple files/directories
   */
  watchFiles(filePaths: string[]): void {
    for (const path of filePaths) {
      this.watchFile(path);
    }
  }

  /**
   * Stop watching a file
   */
  unwatchFile(filePath: string): void {
    const absolutePath = resolve(filePath);
    const watcher = this.watchers.get(absolutePath);

    if (watcher) {
      watcher.close();
      this.watchers.delete(absolutePath);
    }

    // Clear any pending debounce timers
    const timer = this.watchedFiles.get(absolutePath);
    if (timer) {
      clearTimeout(timer);
      this.watchedFiles.delete(absolutePath);
    }
  }

  /**
   * Stop watching all files
   */
  stop(): void {
    for (const [path, watcher] of this.watchers.entries()) {
      watcher.close();
      this.watchers.delete(path);
    }

    for (const timer of this.watchedFiles.values()) {
      clearTimeout(timer);
    }

    this.watchedFiles.clear();
  }

  /**
   * Watch a single file
   */
  private watchSingleFile(filePath: string): void {
    const watcher = watch(
      filePath,
      { persistent: this.options.persistent },
      (eventType, filename) => {
        if (eventType === 'change') {
          this.handleFileChange(filePath);
        }
      }
    );

    this.watchers.set(filePath, watcher);
    // console.log(`[FileWatcher] Watching file: ${filePath}`);
  }

  /**
   * Watch a directory (and optionally subdirectories)
   */
  private watchDirectory(dirPath: string): void {
    const watcher = watch(
      dirPath,
      { persistent: this.options.persistent, recursive: this.options.recursive },
      (eventType, filename) => {
        if (eventType === 'change' && filename) {
          // Resolve the changed file path
          const changedPath = resolve(dirPath, filename);
          this.handleFileChange(changedPath);
        }
      }
    );

    this.watchers.set(dirPath, watcher);
    // console.log(`[FileWatcher] Watching directory: ${dirPath}`);
  }

  /**
   * Handle file change with debouncing
   *
   * Debouncing prevents re-indexing on every keystroke. Instead, we wait
   * for a period of inactivity before triggering re-indexing.
   */
  private handleFileChange(filePath: string): void {
    // Clear existing timer for this file
    const existingTimer = this.watchedFiles.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      try {
        // console.log(`[FileWatcher] File changed, re-indexing: ${filePath}`);
        await this.reindexCallback(filePath);
        // console.log(`[FileWatcher] Re-indexed: ${filePath}`);
      } catch (error: any) {
        console.error(`[FileWatcher] Error re-indexing ${filePath}: ${error.message}`);
      } finally {
        this.watchedFiles.delete(filePath);
      }
    }, this.options.debounceMs);

    this.watchedFiles.set(filePath, timer);
  }
}
