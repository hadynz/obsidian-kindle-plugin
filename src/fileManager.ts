import type { MetadataCache, TFile, Vault } from 'obsidian';
import { get } from 'svelte/store';

import { settingsStore } from '~/store';
import { santizeTitle, frontMatter as fmUtil } from '~/utils';
import type { Book } from '~/models';

const bookFilePath = (book: Book): string => {
  const fileName = santizeTitle(book.title);
  return `${get(settingsStore).highlightsFolder}/${fileName}.md`;
};

export default class FileManager {
  private vault: Vault;
  private metadataCache: MetadataCache;

  constructor(vault: Vault, metadataCache: MetadataCache) {
    this.vault = vault;
    this.metadataCache = metadataCache;
  }

  public async fileExists(book: Book): Promise<boolean> {
    const filePath = bookFilePath(book);
    return await this.vault.adapter.exists(filePath);
  }

  public async getFiles(): Promise<TFile[]> {
    const files = this.vault.getMarkdownFiles();
    return files.filter((file) => {
      const { frontmatter = {} } = this.metadataCache.getFileCache(file);
      return frontmatter['hello'] !== undefined;
    });
  }

  public async createFile(book: Book, content: string): Promise<void> {
    const filePath = bookFilePath(book);
    const frontMatterContent = fmUtil.set(content, { hello: 'world' });
    await this.vault.create(filePath, frontMatterContent);
  }

  public async updateFile(book: Book, _content: string): Promise<void> {
    const filePath = bookFilePath(book);
    const file = this.vault.getAbstractFileByPath(filePath) as TFile;
    const content = await this.vault.read(file);

    const frontMatterContent = fmUtil.set(content, { hello: 'sunshine!' });
    await this.vault.modify(file, frontMatterContent);
  }
}
