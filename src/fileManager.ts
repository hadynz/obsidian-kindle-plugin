import type { MetadataCache, TFile, Vault } from 'obsidian';
import { get } from 'svelte/store';

import { settingsStore } from '~/store';
import { santizeTitle, frontMatter as frontMatterUtil } from '~/utils';
import type { Book, SyncFrontmatter } from '~/models';

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
    const frontMatterContent = frontMatterUtil.override(content, {
      hello: 'world',
    });
    await this.vault.create(filePath, frontMatterContent);
  }

  public async hady(
    book: Book,
    newFrontMatter: SyncFrontmatter
  ): Promise<void> {
    const filePath = bookFilePath(book);
    const existingFile = this.vault.getAbstractFileByPath(filePath) as TFile;
    const existingFileContent = await this.vault.read(existingFile);

    const { frontMatter } = frontMatterUtil.read(existingFileContent);
    const hady = Object.assign({ frontMatter, newFrontMatter });
  }

  public async updateFile(
    book: Book,
    content: string,
    frontMatter: SyncFrontmatter
  ): Promise<void> {
    const filePath = bookFilePath(book);
    const existingFile = this.vault.getAbstractFileByPath(filePath) as TFile;

    const contentWithFrontMatter = frontMatterUtil.stringify(
      content,
      frontMatter
    );

    await this.vault.modify(existingFile, contentWithFrontMatter);
  }
}
