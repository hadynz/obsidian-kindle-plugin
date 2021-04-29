import { get } from 'svelte/store';

import AmazonLoginModal from '../components/amazonLoginModal';
import FileManager from '../fileManager';
import { settingsStore, syncSessionStore } from '../store';
import { Book } from '../models';
import { getBookHighlights, getListofBooks } from '../scraper';
import { Renderer } from '../renderer';

export default class SyncHighlights {
  private fileManager: FileManager;

  private renderer: Renderer;

  constructor(fileManager: FileManager) {
    this.fileManager = fileManager;

    this.renderer = new Renderer();
  }

  async startSync(): Promise<void> {
    const modal = new AmazonLoginModal();
    await modal.doLogin();

    syncSessionStore.actions.startSync();

    const allBooks = await getListofBooks();
    const booksToSync = allBooks.filter(
      (b) => !get(settingsStore).synchedBookAsins.includes(b.asin),
    );

    syncSessionStore.actions.setJobs(booksToSync);

    if (booksToSync.length > 0) {
      await this.syncBooks(booksToSync);
    }

    await settingsStore.actions.setSyncDate(new Date());

    syncSessionStore.actions.syncComplete();
  }

  private async syncBooks(books: Book[]): Promise<void> {
    for (const book of books) {
      try {
        syncSessionStore.actions.startJob(book);

        await this.syncBook(book);

        syncSessionStore.actions.completeJob(book);
      } catch (error) {
        syncSessionStore.actions.errorJob(book);
      }
    }
  }

  private async syncBook(book: Book): Promise<void> {
    const highlights = await getBookHighlights(book);
    const populatedHighlights = highlights.filter((h) => h.text);

    if (populatedHighlights.length > 0) {
      const content = this.renderer.render({ book, highlights });
      await this.fileManager.writeNote(book.title, content);
    }

    // TODO: Track skipped books because of no highlights
  }
}
