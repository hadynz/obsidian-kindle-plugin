import matter from 'gray-matter';
import { MetadataCache, normalizePath, TAbstractFile, TFile, TFolder, Vault } from 'obsidian';
import { get } from 'svelte/store';

import type { Book, BookMetadata, KindleFile, KindleFrontmatter } from '~/models';
import { settingsStore } from '~/store';
import { mergeFrontmatter } from '~/utils';

import { bookFilePath, bookToFrontMatter, frontMatterToBook } from './mappers';

const SyncingStateKey = 'kindle-sync';
const PropertyPrefix = 'kindle-';

/**
 * Normalize a raw frontmatter object (from either the metadata cache or a
 * direct file read) into KindleFrontmatter, supporting both the legacy nested
 * `kindle-sync:` format and the current flat `kindle-*` properties format.
 */
const toKindleFrontmatter = (frontmatter: unknown): KindleFrontmatter | undefined => {
  if (frontmatter == null) {
    return undefined;
  }

  const properties = frontmatter as Record<string, unknown>;

  // Try nested format first (legacy support)
  const nested = properties[SyncingStateKey] as KindleFrontmatter | undefined;
  if (nested != null) {
    return nested;
  }

  // If not found, try flat format (new Obsidian properties format)
  if (properties[`${PropertyPrefix}bookId`] != null) {
    return {
      bookId: properties[`${PropertyPrefix}bookId`] as string,
      title: properties[`${PropertyPrefix}title`] as string,
      author: properties[`${PropertyPrefix}author`] as string,
      asin: properties[`${PropertyPrefix}asin`] as string | undefined,
      lastAnnotatedDate: properties[`${PropertyPrefix}lastAnnotatedDate`] as string | undefined,
      bookImageUrl: properties[`${PropertyPrefix}bookImageUrl`] as string | undefined,
      highlightsCount: properties[`${PropertyPrefix}highlightsCount`] as number | undefined,
    };
  }

  return undefined;
};

export default class FileManager {
  constructor(private vault: Vault, private metadataCache: MetadataCache) {}

  public async readFile(file: KindleFile): Promise<string> {
    return await this.vault.cachedRead(file.file);
  }

  public async getKindleFile(book: Book): Promise<KindleFile | undefined> {
    const allSyncedFiles = await this.getKindleFilesAsync();

    // Primary match: stable title hash (backwards compatible; only option when
    // ASIN is absent, e.g. "My Clippings" uploads).
    const kindleFile =
      allSyncedFiles.find((file) => file.frontmatter.bookId === book.id) ??
      // Fallback match: ASIN is stable even when Amazon changes a book's title
      // (subtitle / edition / author-credential drift), which otherwise changes
      // the title hash and makes the existing file miss -> duplicate.
      (book.asin != null
        ? allSyncedFiles.find((file) => file.frontmatter.asin === book.asin)
        : undefined);

    return kindleFile == null ? undefined : { ...kindleFile, book };
  }

  public mapToKindleFile(fileOrFolder: TAbstractFile): KindleFile | undefined {
    try {
      if (fileOrFolder instanceof TFolder) {
        return undefined;
      }

      const file = fileOrFolder as TFile;

      // Check if metadata cache is available - if not, return undefined to prevent blocking
      if (!this.metadataCache) {
        return undefined;
      }

      const fileCache = this.metadataCache.getFileCache(file);

      // File cache can be undefined if this file was just created and not yet cached by Obsidian
      const kindleFrontmatter = toKindleFrontmatter(fileCache?.frontmatter);

      if (kindleFrontmatter == null) {
        return undefined;
      }

      const book = frontMatterToBook(kindleFrontmatter);

      return { file, frontmatter: kindleFrontmatter, book };
    } catch (error) {
      // Silently return undefined on error to prevent blocking
      return undefined;
    }
  }

  public getKindleFiles(): KindleFile[] {
    if (!this.metadataCache) {
      return [];
    }

    const filesToProcess = this.getFilesInHighlightsFolder().slice(0, 1000);

    return filesToProcess
      .map((file) => {
        try {
          return this.mapToKindleFile(file);
        } catch (error) {
          // Silently skip files that can't be parsed to prevent blocking
          return undefined;
        }
      })
      .filter((file) => file != null) ;
  }

  /**
   * Same as getKindleFiles but resilient to a stale/missing metadata cache:
   * files whose frontmatter isn't in the cache are read directly from disk so
   * they are not silently dropped from the sync list (which would cause the
   * book to be re-created as a duplicate).
   */
  public async getKindleFilesAsync(): Promise<KindleFile[]> {
    const filesToProcess = this.getFilesInHighlightsFolder().slice(0, 1000);

    if (filesToProcess.length === 0) {
      return [];
    }

    const kindleFiles: KindleFile[] = [];
    for (const file of filesToProcess) {
      try {
        const cached = this.mapToKindleFile(file);
        if (cached != null) {
          kindleFiles.push(cached);
          continue;
        }

        // Cache miss: read the frontmatter directly from the file content.
        const raw = await this.vault.cachedRead(file);
        const { data } = matter(raw);
        const kindleFrontmatter = toKindleFrontmatter(data);
        if (kindleFrontmatter == null) {
          continue;
        }
        kindleFiles.push({
          file,
          frontmatter: kindleFrontmatter,
          book: frontMatterToBook(kindleFrontmatter),
        });
      } catch (error) {
        // Silently skip files that can't be parsed to prevent blocking
      }
    }

    return kindleFiles;
  }

  private getFilesInHighlightsFolder(): TFile[] {
    try {
      // Safety check: if settings store isn't ready, return empty array
      // This prevents blocking during plugin initialization
      let highlightsFolder: string;
      try {
        highlightsFolder = get(settingsStore).highlightsFolder;
      } catch (error) {
        // Settings store not ready yet, return empty to prevent blocking
        console.warn('Settings store not ready, skipping file scan');
        return [];
      }

      // Safety check: if vault isn't ready, return empty array
      if (!this.vault) {
        return [];
      }

      // Get files directly from the highlights folder if possible
      const folderPath = normalizePath(highlightsFolder === '/' ? '' : highlightsFolder);

      let filesInFolder: TFile[] = [];

      try {
        // Try to get the folder directly and its files
        if (folderPath !== '') {
          const folder = this.vault.getAbstractFileByPath(folderPath);
          if (folder instanceof TFolder) {
            // Get all markdown files recursively from this folder
            const getAllFilesInFolder = (folder: TFolder): TFile[] => {
              const files: TFile[] = [];
              for (const child of folder.children) {
                if (child instanceof TFile && child.extension === 'md') {
                  files.push(child);
                } else if (child instanceof TFolder) {
                  files.push(...getAllFilesInFolder(child));
                }
              }
              return files;
            };
            filesInFolder = getAllFilesInFolder(folder);
          }
        } else {
          // For root folder, we need to scan all files but filter for root only
          // This is less efficient but necessary for root folder
          const allMarkdownFiles = this.vault.getMarkdownFiles();
          filesInFolder = allMarkdownFiles.filter((file) => {
            const filePath = normalizePath(file.path);
            // File is in root if it has no '/' separator (just filename)
            return !filePath.includes('/');
          });
        }
      } catch (error) {
        // Fallback: if direct folder access fails, use filtered approach
        console.warn('Error accessing folder directly, using fallback method:', error);
        try {
          const allMarkdownFiles = this.vault.getMarkdownFiles();
          filesInFolder = allMarkdownFiles.filter((file) => {
            try {
              const filePath = normalizePath(file.path);
              if (folderPath === '') {
                return !filePath.includes('/');
              }
              return filePath.startsWith(folderPath + '/') || filePath === folderPath;
            } catch {
              return false;
            }
          });
        } catch (fallbackError) {
          console.warn('Fallback method also failed:', fallbackError);
          return [];
        }
      }

      return filesInFolder;
    } catch (error) {
      console.error('Error getting Kindle files:', error);
      return [];
    }
  }

  public async createFile(
    book: Book,
    metadata: BookMetadata,
    content: string,
    highlightsCount: number
  ): Promise<void> {
    const filePath = this.generateUniqueFilePath(book, metadata);
    const frontmatterContent = this.generateBookContent(book, content, highlightsCount);

    try {
      await this.vault.create(filePath, frontmatterContent);
      // Give Obsidian time to process the new file and update metadata cache
      // This helps prevent performance issues when syncing many books
      await new Promise((resolve) => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`Error writing new file (path="${filePath})"`);
      throw error;
    }
  }

  public async updateFile(
    kindleFile: KindleFile,
    remoteBook: Book,
    content: string,
    highlightsCount: number
  ): Promise<void> {
    const frontmatterContent = this.generateBookContent(remoteBook, content, highlightsCount);

    try {
      await this.vault.modify(kindleFile.file, frontmatterContent);
      // Give Obsidian time to process the file update and update metadata cache
      // This helps prevent performance issues when syncing many books
      await new Promise((resolve) => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`Error modifying e file (path="${kindleFile.file.path})"`);
      throw error;
    }
  }

  /**
   * Generate book content by combining both book (a) book markdown and
   * (b) rendered book highlights
   * Uses flat properties format compatible with Obsidian's properties system
   */
  private generateBookContent(book: Book, content: string, highlightsCount: number): string {
    const frontmatter = bookToFrontMatter(book, highlightsCount);
    
    // Use flat properties format for better Obsidian compatibility
    const flatProperties: Record<string, any> = {
      [`${PropertyPrefix}bookId`]: frontmatter.bookId,
      [`${PropertyPrefix}title`]: frontmatter.title,
      [`${PropertyPrefix}author`]: frontmatter.author,
      [`${PropertyPrefix}highlightsCount`]: frontmatter.highlightsCount,
    };
    
    // Only add optional fields if they exist
    if (frontmatter.asin) {
      flatProperties[`${PropertyPrefix}asin`] = frontmatter.asin;
    }
    if (frontmatter.lastAnnotatedDate) {
      flatProperties[`${PropertyPrefix}lastAnnotatedDate`] = frontmatter.lastAnnotatedDate;
    }
    if (frontmatter.bookImageUrl) {
      flatProperties[`${PropertyPrefix}bookImageUrl`] = frontmatter.bookImageUrl;
    }
    
    return mergeFrontmatter(content, flatProperties);
  }

  private generateUniqueFilePath(book: Book, metadata: BookMetadata): string {
    const filePath = bookFilePath(book, metadata);

    const isDuplicate = this.vault
      .getMarkdownFiles()
      .some((v) => v.path === normalizePath(filePath));

    if (isDuplicate) {
      const currentTime = new Date().getTime().toString();
      return filePath.replace('.md', `-${currentTime}.md`);
    }

    return filePath;
  }

  /**
   * Migrate existing files from nested kindle-sync format to flat properties format
   * This converts old files that have kindle-sync: {...} to individual kindle-* properties
   */
  public async migrateToFlatProperties(): Promise<{ migrated: number; failed: number; errors: string[] }> {
    const kindleFiles = this.getKindleFiles();
    let migrated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const kindleFile of kindleFiles) {
      try {
        const fileCache = this.metadataCache.getFileCache(kindleFile.file);
        
        // Check if file uses old nested format
        if (fileCache?.frontmatter?.[SyncingStateKey]) {
          // File uses old format, migrate it
          const oldFrontmatter = fileCache.frontmatter[SyncingStateKey] as KindleFrontmatter;
          
          // Read the file content
          const fileContent = await this.vault.read(kindleFile.file);
          
          // Parse frontmatter
          const { data, content } = matter(fileContent);
          
          // Remove the old nested property
          const newData = { ...data };
          delete newData[SyncingStateKey];
          
          // Add flat properties
          const flatProperties: Record<string, any> = {
            [`${PropertyPrefix}bookId`]: oldFrontmatter.bookId,
            [`${PropertyPrefix}title`]: oldFrontmatter.title,
            [`${PropertyPrefix}author`]: oldFrontmatter.author,
            [`${PropertyPrefix}highlightsCount`]: oldFrontmatter.highlightsCount,
          };
          
          // Add optional fields
          if (oldFrontmatter.asin) {
            flatProperties[`${PropertyPrefix}asin`] = oldFrontmatter.asin;
          }
          if (oldFrontmatter.lastAnnotatedDate) {
            flatProperties[`${PropertyPrefix}lastAnnotatedDate`] = oldFrontmatter.lastAnnotatedDate;
          }
          if (oldFrontmatter.bookImageUrl) {
            flatProperties[`${PropertyPrefix}bookImageUrl`] = oldFrontmatter.bookImageUrl;
          }
          
          // Merge with existing properties (preserving other properties)
          const mergedData = { ...newData, ...flatProperties };
          
          // Reconstruct file with new frontmatter
          const updatedContent = matter.stringify(content, mergedData);
          
          // Write back to file
          await this.vault.modify(kindleFile.file, updatedContent);
          
          // Give Obsidian time to process
          await new Promise((resolve) => setTimeout(resolve, 50));
          
          migrated++;
        } else if (fileCache?.frontmatter?.[`${PropertyPrefix}bookId`]) {
          // File already uses new format, skip
          continue;
        }
      } catch (error) {
        failed++;
        const errorMsg = `Failed to migrate ${kindleFile.file.path}: ${String(error)}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return { migrated, failed, errors };
  }
}
