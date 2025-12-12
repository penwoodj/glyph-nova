import { readdirSync, statSync, existsSync } from 'fs';
import { join, resolve, extname } from 'path';

/**
 * File Collector for RAG Indexing
 *
 * Collects files from various sources (single file, folder, multiple paths)
 * and filters them based on file extensions and other criteria.
 *
 * This is part of the indexing pipeline - it gathers all the files
 * that need to be processed before chunking and embedding.
 */
export interface FileInfo {
  path: string;
  absolutePath: string;
  extension: string;
  size: number;
}

export class FileCollector {
  private supportedExtensions: Set<string>;
  private maxFileSize: number; // in bytes

  constructor(supportedExtensions: string[] = ['.txt', '.md', '.js', '.ts', '.json', '.py', '.java', '.cpp', '.c', '.h'], maxFileSize: number = 10 * 1024 * 1024) {
    // Default: common text-based file types for code/documentation
    this.supportedExtensions = new Set(supportedExtensions);
    this.maxFileSize = maxFileSize;
  }

  /**
   * Collect files from a single path (file or folder)
   *
   * This is the main entry point - it handles both files and directories
   * and recursively collects all supported files.
   */
  collectFiles(path: string): FileInfo[] {
    const absolutePath = resolve(path);

    if (!existsSync(absolutePath)) {
      throw new Error(`Path not found: ${absolutePath}`);
    }

    const stats = statSync(absolutePath);

    if (stats.isFile()) {
      // Single file - return it if supported
      return this.isFileSupported(absolutePath) ? [this.getFileInfo(absolutePath)] : [];
    } else if (stats.isDirectory()) {
      // Directory - recursively collect all supported files
      return this.collectFromDirectory(absolutePath);
    } else {
      throw new Error(`Path is neither a file nor a directory: ${absolutePath}`);
    }
  }

  /**
   * Collect files from multiple paths
   *
   * Useful when indexing multiple files/folders in one command.
   * Each path can be a file or folder, and all are combined.
   */
  collectFilesFromPaths(paths: string[]): FileInfo[] {
    const allFiles: FileInfo[] = [];
    const seenPaths = new Set<string>(); // Avoid duplicates

    for (const path of paths) {
      try {
        const files = this.collectFiles(path);

        // Add files, avoiding duplicates
        for (const file of files) {
          if (!seenPaths.has(file.absolutePath)) {
            seenPaths.add(file.absolutePath);
            allFiles.push(file);
          }
        }
      } catch (error: any) {
        console.warn(`Warning: Could not process path ${path}: ${error.message}`);
      }
    }

    return allFiles;
  }

  /**
   * Recursively collect files from a directory
   *
   * This walks through the directory tree and finds all supported files.
   * It skips hidden files/directories (starting with .) and node_modules.
   */
  private collectFromDirectory(dirPath: string, files: FileInfo[] = []): FileInfo[] {
    try {
      const entries = readdirSync(dirPath);

      for (const entry of entries) {
        // Skip hidden files/directories and common build/cache directories
        if (entry.startsWith('.') || entry === 'node_modules' || entry === 'dist' || entry === 'build') {
          continue;
        }

        const fullPath = join(dirPath, entry);

        try {
          const stats = statSync(fullPath);

          if (stats.isFile() && this.isFileSupported(fullPath)) {
            files.push(this.getFileInfo(fullPath));
          } else if (stats.isDirectory()) {
            // Recursively process subdirectories
            this.collectFromDirectory(fullPath, files);
          }
        } catch (error) {
          // Skip files we can't access (permissions, symlinks, etc.)
          continue;
        }
      }
    } catch (error) {
      // Skip directories we can't read
      console.warn(`Warning: Could not read directory ${dirPath}`);
    }

    return files;
  }

  /**
   * Check if a file is supported for indexing
   *
   * Checks both extension and file size to ensure we only index
   * appropriate files.
   */
  private isFileSupported(filePath: string): boolean {
    const ext = extname(filePath).toLowerCase();

    if (!this.supportedExtensions.has(ext)) {
      return false;
    }

    try {
      const stats = statSync(filePath);
      return stats.size <= this.maxFileSize;
    } catch {
      return false;
    }
  }

  /**
   * Get file information for a single file
   */
  private getFileInfo(filePath: string): FileInfo {
    const stats = statSync(filePath);
    return {
      path: filePath,
      absolutePath: resolve(filePath),
      extension: extname(filePath).toLowerCase(),
      size: stats.size,
    };
  }
}
