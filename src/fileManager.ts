import type { Vault } from 'obsidian';
import { get } from 'svelte/store';

import { settingsStore } from '~/store';
import { santizeTitle } from '~/utils';
import type { Book } from '~/models';

const bookFilePath = (book: Book): string => {
  const fileName = santizeTitle(book.title);
  return `${get(settingsStore).highlightsFolder}/${fileName}.md`;
};

export default class FileManager {
  private vault: Vault;

  constructor(vault: Vault) {
    this.vault = vault;
  }

  public async fileExists(book: Book): Promise<boolean> {
    const filePath = bookFilePath(book);
    return await this.vault.adapter.exists(filePath);
  }

  public async createFile(book: Book, content: string): Promise<void> {
    const filePath = bookFilePath(book);
    await this.vault.create(filePath, content);
  }
}
