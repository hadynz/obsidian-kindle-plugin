import matter from 'gray-matter';
import { MetadataCache, normalizePath, TAbstractFile, TFile, TFolder, Vault } from 'obsidian';
import { get } from 'svelte/store';

import type { Book, BookMetadata, KindleFile, KindleFrontmatter } from '~/models';
import { settingsStore } from '~/store';
import { mergeFrontmatter, withRetry } from '~/utils';

import { bookFilePath, bookToFrontMatter, frontMatterToBook } from './mappers';
import type { DuplicateCandidate } from './selectCanonicalDuplicate';
import { pickBetterDuplicate } from './selectCanonicalDuplicate';

const SyncingStateKey = 'kindle-sync';
const PropertyPrefix = 'kindle-';

export default class FileManager {
  constructor(private vault: Vault, private metadataCache: MetadataCache) {}

  public async readFile(file: KindleFile): Promise<string> {
    // Reading from a cloud-synced vault (iCloud Drive, Dropbox, ...) can transiently time out if
    // the file was evicted locally and needs to be fetched on demand, especially under the heavy,
    // rapid I/O of syncing a large library. Retry a few times before giving up on this book.
    return await withRetry(() => this.vault.cachedRead(file.file));
  }

  /**
   * Waits for Obsidian's metadataCache to actually reprocess a file we just wrote, instead of
   * guessing with a fixed delay. Every read in this file (getKindleFiles/mapToKindleFile) goes
   * through that same cache, so a fixed delay that's too short leaves a window where the very
   * next sync reads pre-write frontmatter - which looks identical to "we never checked this book"
   * and makes it look permanently stale no matter how many times it's actually corrected on disk.
   * Falls back to a timeout so a write that Obsidian never reports as changed (e.g. no actual
   * byte difference) can't hang the sync.
   */
  private waitForMetadataCache(file: TFile, timeoutMs = 5000): Promise<void> {
    return new Promise((resolve) => {
      let settled = false;

      const finish = (): void => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeoutHandle);
        this.metadataCache.off('changed', onChanged);
        resolve();
      };

      const onChanged = (changedFile: TFile): void => {
        if (changedFile.path === file.path) {
          finish();
        }
      };

      this.metadataCache.on('changed', onChanged);
      const timeoutHandle = setTimeout(finish, timeoutMs);
    });
  }

  public getKindleFile(book: Book): KindleFile | undefined {
    const allSyncedFiles = this.getKindleFiles();

    const matches = allSyncedFiles.filter((file) => file.frontmatter.bookId === book.id);

    if (matches.length === 0) {
      return undefined;
    }

    // Under normal operation there's exactly one match. If a duplicate ever exists anyway (a
    // leftover from a bug, a sync interrupted mid-write), pick deterministically instead of
    // depending on vault enumeration order - otherwise different syncs can read and write
    // different copies of "the same" book, which never converges.
    const asDuplicateCandidate = (kindleFile: KindleFile): DuplicateCandidate => ({
      path: kindleFile.file.path,
      highlightsCount: kindleFile.frontmatter.highlightsCount,
      createdAt: kindleFile.file.stat.ctime,
    });

    const kindleFile =
      matches.length === 1
        ? matches[0]
        : matches.reduce((best, candidate) =>
            pickBetterDuplicate(asDuplicateCandidate(best), asDuplicateCandidate(candidate)).path ===
            best.file.path
              ? best
              : candidate
          );

    return { ...kindleFile, book };
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
      // Every sync writes the flat format and is supposed to strip the legacy nested block, but
      // older files may still carry a stale nested block alongside now-current flat properties
      // (e.g. if they were written by a version of the plugin that merged forward without
      // removing it). Prefer the flat format - the one the plugin actively keeps up to date -
      // and only fall back to the nested one for files that predate the flat format entirely.
      let kindleFrontmatter: KindleFrontmatter | undefined;

      if (fileCache?.frontmatter) {
        if (fileCache.frontmatter[`${PropertyPrefix}bookId`]) {
          kindleFrontmatter = {
            bookId: fileCache.frontmatter[`${PropertyPrefix}bookId`] as string,
            title: fileCache.frontmatter[`${PropertyPrefix}title`] as string,
            author: fileCache.frontmatter[`${PropertyPrefix}author`] as string,
            asin: fileCache.frontmatter[`${PropertyPrefix}asin`] as string | undefined,
            lastAnnotatedDate: fileCache.frontmatter[`${PropertyPrefix}lastAnnotatedDate`] as string | undefined,
            lastChecked: fileCache.frontmatter[`${PropertyPrefix}lastChecked`] as string | undefined,
            bookImageUrl: fileCache.frontmatter[`${PropertyPrefix}bookImageUrl`] as string | undefined,
            highlightsCount: fileCache.frontmatter[`${PropertyPrefix}highlightsCount`] as number | undefined,
          };
        } else {
          kindleFrontmatter = fileCache.frontmatter[SyncingStateKey] as KindleFrontmatter | undefined;
        }
      }

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
      if (!this.vault || !this.metadataCache) {
        return [];
      }
      
      // Get files directly from the highlights folder if possible
      const folderPath = normalizePath(highlightsFolder === '/' ? '' : highlightsFolder);

      // Scans every markdown file in the vault and filters by path prefix. Used for the root
      // folder case, and as a fallback whenever direct folder resolution below doesn't pan out
      // (wrong case, a stray slash, or the folder not being resolvable yet) so that a lookup
      // hiccup can't make every book in the folder look "missing" and get duplicated.
      const scanAllFilesFallback = (): TFile[] => {
        const allMarkdownFiles = this.vault.getMarkdownFiles();
        return allMarkdownFiles.filter((file) => {
          try {
            const filePath = normalizePath(file.path);
            if (folderPath === '') {
              return !filePath.includes('/');
            }
            return filePath === folderPath || filePath.startsWith(folderPath + '/');
          } catch {
            return false;
          }
        });
      };

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
          } else {
            // Configured folder didn't resolve to a folder (case/slash mismatch, or it hasn't
            // been indexed yet) - fall back rather than silently treating the vault as empty
            filesInFolder = scanAllFilesFallback();
          }
        } else {
          filesInFolder = scanAllFilesFallback();
        }
      } catch (error) {
        // Fallback: if direct folder access fails, use filtered approach
        console.warn('Error accessing folder directly, using fallback method:', error);
        try {
          filesInFolder = scanAllFilesFallback();
        } catch (fallbackError) {
          console.warn('Fallback method also failed:', fallbackError);
          return [];
        }
      }

      // If no files, return early
      if (filesInFolder.length === 0) {
        return [];
      }

      return filesInFolder
        .map((file) => {
          try {
            return this.mapToKindleFile(file);
          } catch (error) {
            // Silently skip files that can't be parsed to prevent blocking
            return undefined;
          }
        })
        .filter((file) => file != null) ;
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
    const filePath = normalizePath(bookFilePath(book, metadata));

    // A file can already exist at this book's canonical path even though it wasn't found by its
    // stored bookId (e.g. Obsidian's metadata cache hasn't caught up with a recent write yet, or
    // the configured highlights folder briefly failed to resolve). Update that file in place
    // instead of creating a timestamp-suffixed duplicate alongside it.
    const existingFile = this.vault.getAbstractFileByPath(filePath);

    if (existingFile instanceof TFile) {
      try {
        const existingContent = await withRetry(() => this.vault.cachedRead(existingFile));
        const frontmatterContent = this.generateBookContent(
          book,
          content,
          highlightsCount,
          existingContent
        );
        await this.vault.modify(existingFile, frontmatterContent);
        await this.waitForMetadataCache(existingFile);
      } catch (error) {
        console.error(`Error updating existing file (path="${filePath})"`);
        throw error;
      }
      return;
    }

    try {
      const frontmatterContent = this.generateBookContent(book, content, highlightsCount);
      const createdFile = await this.vault.create(filePath, frontmatterContent);
      await this.waitForMetadataCache(createdFile);
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
      await this.waitForMetadataCache(kindleFile.file);
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
  private generateBookContent(
    book: Book,
    content: string,
    highlightsCount: number,
    preserveFrontmatterFrom?: string
  ): string {
    // lastChecked always means "the plugin wrote this file just now" - it's our own bookkeeping,
    // not something scraped from Amazon, so it's stamped fresh on every write rather than carried
    // over from whatever was on the book object passed in.
    const frontmatter = bookToFrontMatter({ ...book, lastChecked: new Date() }, highlightsCount);

    // When rewriting a file we found by path rather than by id (see createFile), `content` is a
    // freshly rendered body with no frontmatter of its own. Carrying over any frontmatter that
    // already existed on disk - including fields the plugin knows nothing about, like a user's
    // own rating or genre - before merging in the plugin's own fields, so a lookup miss can't
    // silently discard someone's own data along with fixing the duplicate.
    const baseContent = preserveFrontmatterFrom
      ? matter.stringify(content, matter(preserveFrontmatterFrom).data)
      : content;

    // Use flat properties format for better Obsidian compatibility
    const flatProperties: Record<string, any> = {
      [`${PropertyPrefix}bookId`]: frontmatter.bookId,
      [`${PropertyPrefix}title`]: frontmatter.title,
      [`${PropertyPrefix}author`]: frontmatter.author,
      [`${PropertyPrefix}highlightsCount`]: frontmatter.highlightsCount,
      [`${PropertyPrefix}lastChecked`]: frontmatter.lastChecked,
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
    
    // Strip any stale legacy nested block so it can't keep shadowing these freshly-written flat
    // properties on a future read (see the priority comment in mapToKindleFile)
    return mergeFrontmatter(baseContent, flatProperties, [SyncingStateKey]);
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
