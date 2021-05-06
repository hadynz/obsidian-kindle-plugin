import { filterAsync } from 'lodasync';
import { get } from 'svelte/store';

import AmazonLoginModal from '../components/amazonLoginModal';
import type FileManager from '../fileManager';
import { settingsStore, syncSessionStore } from '../store';
import type { Book, BookMetadata } from '../models';
import {
  scrapeHighlightsForBook,
  scrapeBookMetadata,
  scrapeBooks,
} from '../scraper';
import { Renderer } from '../renderer';
import type { SyncState } from './syncState';

const initialState = { newBooksSynced: 0, newHighlightsSynced: 0 };

export default class SyncHighlights {
  private fileManager: FileManager;
  private renderer: Renderer;
  private state: SyncState = initialState;

  constructor(fileManager: FileManager) {
    this.fileManager = fileManager;
    this.renderer = new Renderer();
  }

  async startSync(): Promise<void> {
    this.state = initialState;

    const modal = new AmazonLoginModal();
    await modal.doLogin();

    syncSessionStore.actions.startSync('amazon');

    const allBooks = await scrapeBooks();

    const booksToSync = await filterAsync(async (b) => {
      const exists = await this.fileManager.fileExists(b);
      return !exists;
    }, allBooks);

    syncSessionStore.actions.setJobs(booksToSync);

    if (booksToSync.length > 0) {
      await this.syncBooks(booksToSync);
    }

    syncSessionStore.actions.completeSync({
      newBookCount: this.state.newBooksSynced,
      newHighlightsCount: this.state.newHighlightsSynced,
      updatedBookCount: 0,
      updatedHighlightsCount: 0,
    });
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
    const highlights = await scrapeHighlightsForBook(book);
    const populatedHighlights = highlights.filter((h) => h.text);

    if (populatedHighlights.length === 0) {
      return; // No highlights for book. Skip sync
    }

    let metadata: BookMetadata;

    if (get(settingsStore).downloadBookMetadata && book.asin) {
      metadata = await scrapeBookMetadata(book);
    }

    const content = this.renderer.render({ book, highlights, metadata });
    await this.fileManager.createFile(book, content);

    this.state.newBooksSynced += 1;
    this.state.newHighlightsSynced += populatedHighlights.length;
  }
}
