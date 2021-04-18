import { Notice, Vault } from 'obsidian';

import { Highlight, PluginSettings } from './models';
import { santizeTitle } from './util/santizeTitle';
import { StatusBar } from './StatusBar';
import KindlePlugin from '.';
import AmazonLoginModal from './modals/amazonLoginModal';
import { getListofBooks, getBookHighlights } from './scraper';

export default class SyncHighlights {
  vault: Vault;
  statusBar: StatusBar;
  plugin: KindlePlugin;
  settings: PluginSettings;

  constructor(plugin: KindlePlugin, statusBar: StatusBar) {
    this.plugin = plugin;
    this.settings = plugin.settings;
    this.vault = plugin.app.vault;
    this.statusBar = statusBar;
  }

  async sync(): Promise<void> {
    const modal = new AmazonLoginModal();
    await modal.waitForSignIn;

    new Notice('Starting sync...');

    const books = await getListofBooks();
    const booksToSync = books.filter(
      (newBook) => !this.settings.synchedBookAsins.includes(newBook.asin),
    );

    // TODO: Always sync the latest book in the list

    new Notice(`Found ${booksToSync.length} books to sync...`);

    for (let book of booksToSync) {
      try {
        console.log(
          `Starting sync of ${book.title}`,
          new Date().toLocaleString(),
        );

        await this.syncBook(book);

        console.log(
          `Finished syncing of ${book.title}`,
          new Date().toLocaleString(),
        );

        this.settings.synchedBookAsins.push(book.asin);
        await this.plugin.saveData(this.plugin.settings);
      } catch (error) {
        console.log(
          `Error syncing ${book.title}`,
          book,
          new Date().toLocaleString(),
        );
      }
    }

    this.statusBar.setText(`Finished syncing ${booksToSync.length} books`);

    new Notice('Sync complete');
  }

  async syncBook(book: any): Promise<void> {
    this.statusBar.setText(`Syncing "${santizeTitle(book.title)}"...`);

    const highlights = await getBookHighlights(book);
    await this.writeBook(book, highlights);

    this.settings.lastSyncDate = new Date();
    await this.plugin.saveData(this.plugin.settings);
  }

  async writeBook(book: any, highlights: Highlight[]): Promise<void> {
    const filename = `${this.settings.highlightsFolderLocation}/${santizeTitle(
      book.title,
    )}.md`;

    const highlightsContent = highlights
      .map((h) => `- > ${h.text} (location ${h.location})`)
      .join('\n\n');

    const content = `# ${book.title}\n\n${highlightsContent}`;
    await this.saveToFile(filename, content);
  }

  async saveToFile(filePath: string, content: string): Promise<void> {
    const fileExists = await this.vault.adapter.exists(filePath);
    if (fileExists) {
      console.log('File exists already...');
    } else {
      await this.vault.create(filePath, content);
    }
  }
}
