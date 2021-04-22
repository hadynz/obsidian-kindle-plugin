import { get } from 'svelte/store';

import AmazonLoginModal from './components/amazonLoginModal';
import FileManager from './fileManager';
import { Book } from './models';
import { PluginSettings } from './settings';
import { getBookHighlights, getListofBooks } from './scraper';
import { Renderer } from './renderer';
import store from './store';

export default class SyncHighlights {
  private fileManager: FileManager;
  private settings: PluginSettings;
  private renderer: Renderer;

  constructor(fileManager: FileManager, settings: PluginSettings) {
    this.fileManager = fileManager;
    this.settings = settings;

    this.renderer = new Renderer(settings);
  }

  async startSync(): Promise<void> {
    const modal = new AmazonLoginModal(this.settings);
    await modal.doLogin();

    store.getBooks();

    const allBooks = await getListofBooks();
    const booksToSync = allBooks.filter(
      (b) => !get(store).synchedBookAsins.includes(b.asin),
    );

    store.getBooksSuccessful(booksToSync);

    if (booksToSync.length > 0) {
      await this.syncBooks(booksToSync);
    }

    await this.settings.setSyncDate(new Date());

    store.syncComplete(booksToSync);
  }

  async syncBooks(books: Book[]): Promise<void> {
    for (const book of books) {
      try {
        store.getBookHighlights(book);

        await this.syncBook(book);

        await this.settings.setSyncDate(new Date());

        store.getBookHighlightsSuccess(book);

        await this.settings.addSynchedBookAsins(book.asin);
      } catch (error) {
        // handle error
      }
    }
  }

  async syncBook(book: Book): Promise<void> {
    const highlights = await getBookHighlights(book);

    const content = this.renderer.render(book, highlights);
    await this.fileManager.writeNote(book.title, content);
  }
}
