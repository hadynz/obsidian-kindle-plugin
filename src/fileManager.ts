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

type KindleFile = {
  file: TFile;
  frontmatter?: SyncingState;
};

export default class FileManager {
  private vault: Vault;
  private metadataCache: MetadataCache;

  constructor(vault: Vault, metadataCache: MetadataCache) {
    this.vault = vault;
    this.metadataCache = metadataCache;
  }

  public async fileExists(book: Book): Promise<boolean> {
    const allSyncedFiles = await this.getKindleFiles();
    return allSyncedFiles.some((file) => file.frontmatter.title === book.title);
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
}
