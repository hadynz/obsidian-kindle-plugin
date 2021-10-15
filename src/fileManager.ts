import type { MetadataCache, TFile, Vault } from 'obsidian';
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
  title: string;
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
      (file) => file.frontmatter.title === book.title
    );

    return kindleFile == null ? undefined : { ...kindleFile, book };
  }

  public async getKindleFiles(): Promise<KindleFile[]> {
    const files = this.vault.getMarkdownFiles();

    return files
      .map((file): KindleFile => {
        const { frontmatter } = this.metadataCache.getFileCache(file);
        return { file, frontmatter: frontmatter?.[SyncingStateKey] };
      })
      .filter((file) => file.frontmatter !== undefined);
  }

  public async createFile(book: Book, content: string): Promise<void> {
    const filePath = bookFilePath(book);

    const frontMatterContent = frontMatterUtil.stringify(content, {
      [SyncingStateKey]: { title: book.title },
    });

    await this.vault.create(filePath, frontMatterContent);
  }

  public async updateFile(file: KindleFile, content: string): Promise<void> {
    await this.vault.modify(file.file, content);
  }
}
