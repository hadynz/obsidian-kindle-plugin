import sanitize from 'sanitize-filename';
import { Vault } from 'obsidian';

import { PluginSettings } from './settings';

export const santizeTitle = (title: string): string => {
  const santizedTitle = title
    .replace(/ *\([^)]*\) */g, '') // remove parenthesis and contents from title
    .replace(/\:.*/g, '') // remove description test after `:` in title
    .replace(/[\':]/g, ''); // remove single quotes from title

  return sanitize(santizedTitle);
};

export default class FileManager {
  private vault: Vault;
  private settings: PluginSettings;

  constructor(vault: Vault, settings: PluginSettings) {
    this.vault = vault;
    this.settings = settings;
  }

  public async writeNote(title: string, content: string): Promise<void> {
    const fileName = santizeTitle(title);
    const filePath = `${this.settings.highlightsFolderLocation}/${fileName}.md`;

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
