import { MetadataCache, TAbstractFile, TFile, TFolder, Vault } from 'obsidian';
import { get } from 'svelte/store';
import path from 'path';

import { settingsStore } from '~/store';
import { sanitizeTitle, mergeFrontmatter } from '~/utils';
import type { Book } from '~/models';

/**
 * Returns a file path for a given book relative to the current Obsidian
 * vault directory. The method also trims leading slashes to help with
 * internal path matching with Obsidian's vault.getFiles method
 */
const bookFilePath = (book: Book): string => {
  const fileName = sanitizeTitle(book.title);
  return path
    .join(get(settingsStore).highlightsFolder, `${fileName}.md`)
    .replace(/\//, '');
};

const bookFrontMatter = (
  book: Book,
  highlightsCount: number
): KindleFrontmatter => {
  return {
    bookId: book.id,
    title: book.title,
    author: book.author,
    asin: book.asin,
    lastAnnotatedDate: book.lastAnnotatedDate,
    bookImageUrl: book.imageUrl,
    highlightsCount,
  };
};

const SyncingStateKey = 'kindle-sync';

type KindleFrontmatter = {
  bookId: string;
  title: string;
  author: string;
  asin: string;
  lastAnnotatedDate: string;
  bookImageUrl: string;
  highlightsCount: number;
};

export type KindleFile = {
  file: TFile;
  frontmatter: KindleFrontmatter;
  book?: Book;
};

export default class FileManager {
  constructor(private vault: Vault, private metadataCache: MetadataCache) {}

  public async readFile(file: KindleFile): Promise<string> {
    return await this.vault.cachedRead(file.file);
  }

  public async getKindleFile(book: Book): Promise<KindleFile | undefined> {
    const allSyncedFiles = await this.getKindleFiles();

    const kindleFile = allSyncedFiles.find(
      (file) => file.frontmatter.bookId === book.id
    );

    return kindleFile == null ? undefined : { ...kindleFile, book };
  }

  public mapToKindleFile(fileOrFolder: TAbstractFile): KindleFile | undefined {
    if (fileOrFolder instanceof TFolder) {
      return undefined;
    }

    const file = fileOrFolder as TFile;

    const fileCache = this.metadataCache.getFileCache(file);

    // File cache can be undefined if this file was just created and not yet cached by Obsidian
    const kindleFrontmatter: KindleFrontmatter =
      fileCache?.frontmatter?.[SyncingStateKey];

    if (kindleFrontmatter == null) {
      return undefined;
    }

    const book: Book = {
      id: kindleFrontmatter.bookId,
      title: kindleFrontmatter.title,
      author: kindleFrontmatter.author,
      asin: kindleFrontmatter.asin,
      lastAnnotatedDate: kindleFrontmatter.lastAnnotatedDate,
      imageUrl: kindleFrontmatter.bookImageUrl,
    };

    return { file, frontmatter: kindleFrontmatter, book };
  }

  public async getKindleFiles(): Promise<KindleFile[]> {
    return this.vault
      .getMarkdownFiles()
      .map((file) => this.mapToKindleFile(file))
      .filter((file) => file != null);
  }

  public async createFile(
    book: Book,
    content: string,
    highlightsCount: number
  ): Promise<void> {
    const filePath = this.generateUniqueFilePath(book);
    const frontmatterContent = this.generateBookContent(
      book,
      content,
      highlightsCount
    );
    await this.vault.create(filePath, frontmatterContent);
  }

  public async updateFile(
    kindleFile: KindleFile,
    remoteBook: Book,
    content: string,
    highlightsCount: number
  ): Promise<void> {
    const frontmatterContent = this.generateBookContent(
      remoteBook,
      content,
      highlightsCount
    );
    await this.vault.modify(kindleFile.file, frontmatterContent);
  }

  /**
   * Generate book content by combining both book (a) book markdown and
   * (b) rendered book highlights
   */
  private generateBookContent(
    book: Book,
    content: string,
    highlightsCount: number
  ): string {
    return mergeFrontmatter(content, {
      [SyncingStateKey]: bookFrontMatter(book, highlightsCount),
    });
  }

  private generateUniqueFilePath(book: Book): string {
    const filePath = bookFilePath(book);
    const isDuplicate = this.vault
      .getMarkdownFiles()
      .some((v) => v.path === filePath);

    if (isDuplicate) {
      const currentTime = new Date().getTime().toString();
      return filePath.replace('.md', `-${currentTime}.md`);
    }

    return filePath;
  }
}
