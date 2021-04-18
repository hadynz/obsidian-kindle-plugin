import { Notice, Vault } from 'obsidian';

import CredentialsManager from './CredentialsManager';
import KindleRepository from './KindleRepository';
import KindleServer from './KindleServer';
import { PluginSettings } from './models';
import { santizeTitle } from './util/santizeTitle';
import { StatusBar } from './StatusBar';
import KindlePlugin from './KindlePlugin';
import AmazonLoginModal from './modals/amazonLoginModal';
import { getListofBooks } from './scraper';

export default class SyncHighlights {
  vault: Vault;
  statusBar: StatusBar;
  plugin: KindlePlugin;
  settings: PluginSettings;
  kindle: KindleRepository;
  kindleServer: KindleServer;
  credentialsManager: CredentialsManager;

  constructor(
    plugin: KindlePlugin,
    statusBar: StatusBar,
    credentialsManager: CredentialsManager,
  ) {
    this.plugin = plugin;
    this.settings = plugin.settings;
    this.vault = plugin.app.vault;
    this.statusBar = statusBar;
    this.kindleServer = new KindleServer();
    this.credentialsManager = credentialsManager;
    this.kindle = new KindleRepository();
  }

  async sync(): Promise<void> {
    const modal = new AmazonLoginModal();
    await modal.waitForSignIn;

    const books2 = await getListofBooks();
    console.log('books2', books2);

    return;

    new Notice('Starting sync...');
    await this.kindleServer.start();

    const books = await this.kindle.getBooks();
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

    new Notice('Sync complete');
    await this.kindleServer.stop();
  }

  async syncBook(book: any): Promise<void> {
    this.statusBar.setText(`Syncing "${santizeTitle(book.title)}"...`);

    const highlights = await this.kindle.getBookHighlights(book.bookUrl);
    await this.writeBook(book, highlights);

    this.settings.lastSyncDate = new Date();
    await this.plugin.saveData(this.plugin.settings);
  }

  async writeBook(book: any, highlights: any[]): Promise<void> {
    const filename = `${this.settings.highlightsFolderLocation}/${santizeTitle(
      book.title,
    )}.md`;

    const highlightsContent = highlights
      .map((h) => `- > ${h.text} (location ${h.locationPercentage})`)
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
