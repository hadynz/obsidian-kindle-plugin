import sanitize from 'sanitize-filename';
import { Vault } from 'obsidian';
import { get } from 'svelte/store';

import { settingsStore } from './store';

export const santizeTitle = (title: string): string => {
  const santizedTitle = title
    .replace(/ *\([^)]*\) */g, '') // remove parenthesis and contents from title
    .replace(/:.*/g, '') // remove description test after `:` in title
    .replace(/[':]/g, ''); // remove single quotes from title

  return sanitize(santizedTitle);
};

export default class FileManager {
  private vault: Vault;

  constructor(vault: Vault) {
    this.vault = vault;
  }

  public async writeNote(title: string, content: string): Promise<void> {
    const fileName = santizeTitle(title);
    const filePath = `${get(settingsStore).highlightsFolder}/${fileName}.md`;

    await this.saveToFile(filePath, content);
  }

  private async saveToFile(filePath: string, content: string): Promise<void> {
    const fileExists = await this.vault.adapter.exists(filePath);

    if (fileExists) {
      console.log('File exists already...');
    } else {
      await this.vault.create(filePath, content);
    }
  }
}
