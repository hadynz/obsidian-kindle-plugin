import { TinyEmitter } from 'tiny-emitter';

import AmazonLoginModal from './modals/amazonLoginModal';
import FileManager from './fileManager';
import { Book } from './models';
import { PluginSettings } from './settings';
import { getBookHighlights, getListofBooks } from './scraper';
import { Renderer } from './renderer';

export default class SyncHighlights {
  private fileManager: FileManager;
  private settings: PluginSettings;
  private renderer: Renderer;
  private emitter: TinyEmitter;

  constructor(
    fileManager: FileManager,
    settings: PluginSettings,
    emitter: TinyEmitter,
  ) {
    this.fileManager = fileManager;
    this.settings = settings;
    this.renderer = new Renderer(settings);
    this.emitter = emitter;
  }

  async sync(): Promise<void> {
    const modal = new AmazonLoginModal(this.settings);
    await modal.doLogin();

    this.emitter.emit('sync-start');

    const allBooks = await getListofBooks();
    const booksToSync = allBooks.filter(
      (b) => !this.settings.synchedBookAsins.includes(b.asin),
    );

    if (booksToSync.length > 0) {
      await this.syncBooks(booksToSync);
    }

    this.emitter.emit('sync-complete', booksToSync);
  }

  async syncBooks(books: Book[]): Promise<void> {
    this.emitter.emit('sync-books', books);

    for (const book of books) {
      try {
        this.emitter.emit('sync-book-start', book);

        await this.syncBook(book);

        await this.settings.setSyncDate(new Date());

        this.emitter.emit('sync-book-success', book);

        await this.settings.addSynchedBookAsins(book.asin);
      } catch (error) {
        this.emitter.emit('sync-book-error', book, error);
      }
    }
  }

  async syncBook(book: Book): Promise<void> {
    const highlights = await getBookHighlights(book);

    const content = this.renderer.render(book, highlights);
    await this.fileManager.writeNote(book.title, content);
  }
}
