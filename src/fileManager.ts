import { Vault } from 'obsidian';
import { get } from 'svelte/store';

import { settingsStore } from './store';
import { santizeTitle } from './utils';

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
      // TODO: Handle scenario when a file exists. How do we prompt the user?
    } else {
      await this.vault.create(filePath, content);
    }
  }
}
