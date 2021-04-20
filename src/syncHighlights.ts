import { Notice } from 'obsidian';

import AmazonLoginModal from './modals/amazonLoginModal';
import FileManager, { santizeTitle } from './fileManager';
import { Book } from './models';
import { PluginSettings } from './settings';
import { StatusBar } from './statusBar';
import { getBookHighlights, getListofBooks } from './scraper';
import { Renderer } from './renderer';

export default class SyncHighlights {
  private statusBar: StatusBar;
  private fileManager: FileManager;
  private settings: PluginSettings;
  private renderer: Renderer;

  constructor(
    statusBar: StatusBar,
    fileManager: FileManager,
    settings: PluginSettings,
  ) {
    this.statusBar = statusBar;
    this.fileManager = fileManager;
    this.settings = settings;
    this.renderer = new Renderer(settings);
  }

  async sync(): Promise<void> {
    const modal = new AmazonLoginModal();
    await modal.doLogin();

    new Notice('Starting sync...');

    const books = await getListofBooks();
    const booksToSync = books.filter(
      (newBook) => !this.settings.synchedBookAsins.includes(newBook.asin),
    );

    await this.syncBooks(booksToSync);

    // TODO: Always sync the latest book in the list

    new Notice(`Found ${booksToSync.length} books to sync...`);

    this.statusBar.setText(`Finished syncing ${booksToSync.length} books`);

    new Notice('Sync complete');
  }

  async syncBooks(books: Book[]): Promise<void> {
    for (const book of books) {
      try {
        console.log(
          `Starting sync of ${book.title}`,
          new Date().toLocaleString(),
        );

        await this.syncBook(book);

        await this.settings.setSyncDate(new Date());

        console.log(
          `Finished syncing of ${book.title}`,
          new Date().toLocaleString(),
        );

        await this.settings.addSynchedBookAsins(book.asin);
      } catch (error) {
        console.log(
          `Error syncing ${book.title}`,
          book,
          new Date().toLocaleString(),
        );
      }
    }
  }

  async syncBook(book: Book): Promise<void> {
    this.statusBar.setText(`Syncing "${santizeTitle(book.title)}"...`);

    const highlights = await getBookHighlights(book);

    const content = this.renderer.render(book, highlights);
    await this.fileManager.writeNote(book.title, content);
  }
}
