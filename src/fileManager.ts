import { MetadataCache, TAbstractFile, TFile, TFolder, Vault } from 'obsidian';
import { get } from 'svelte/store';

import { settingsStore } from '~/store';
import { sanitizeTitle, frontMatter as frontMatterUtil } from '~/utils';
import type { Book } from '~/models';

const bookFilePath = (book: Book): string => {
  const fileName = sanitizeTitle(book.title);
  return `${get(settingsStore).highlightsFolder}/${fileName}.md`;
};

const SyncingStateKey = 'kindle-sync';

type SyncingState = {
  bookId: string;
  title: string;
  author: string;
  asin: string;
  bookImageUrl: string;
};

export type KindleFile = {
  file: TFile;
  frontmatter: SyncingState;
  book?: Book;
};

export default class FileManager {
  constructor(private vault: Vault, private metadataCache: MetadataCache) {}

  public async readFile(file: KindleFile): Promise<string> {
    return await this.vault.cachedRead(file.file);
  }

  public async getFile(book: Book): Promise<KindleFile | undefined> {
    const allSyncedFiles = await this.getKindleFiles();

    const kindleFile = allSyncedFiles.find(
      (file) => file.frontmatter.bookId === book.id
    );

    return kindleFile == null ? undefined : { ...kindleFile, book };
  }

  public getKindleFile(fileOrFolder: TAbstractFile): KindleFile | undefined {
    if (fileOrFolder instanceof TFolder) {
      return undefined;
    }

    const file = fileOrFolder as TFile;
    const { frontmatter } = this.metadataCache.getFileCache(file);
    const kindleFrontmatter: SyncingState = frontmatter?.[SyncingStateKey];

    if (kindleFrontmatter == null) {
      return undefined;
    }

    const book: Book = {
      id: kindleFrontmatter.bookId,
      title: kindleFrontmatter.title,
      author: kindleFrontmatter.author,
      asin: kindleFrontmatter.asin,
      imageUrl: kindleFrontmatter.bookImageUrl,
    };

    return { file, frontmatter: kindleFrontmatter, book };
  }

  public async getKindleFiles(): Promise<KindleFile[]> {
    return this.vault
      .getMarkdownFiles()
      .map(this.getKindleFile)
      .filter((file) => file != null);
  }

  public async createFile(book: Book, content: string): Promise<void> {
    const filePath = bookFilePath(book);

    const frontmatterState: SyncingState = {
      bookId: book.id,
      title: book.title,
      author: book.author,
      asin: book.asin,
      bookImageUrl: book.imageUrl,
    };

    const frontMatterContent = frontMatterUtil.stringify(content, {
      [SyncingStateKey]: frontmatterState,
    });

    await this.vault.create(filePath, frontMatterContent);
  }

  public async updateFile(file: KindleFile, content: string): Promise<void> {
    await this.vault.modify(file.file, content);
  }
}
