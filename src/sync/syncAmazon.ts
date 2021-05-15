import { forEachAsync } from 'lodasync';
import { get } from 'svelte/store';

import AmazonLoginModal from '../components/amazonLoginModal';
import type FileManager from '../fileManager';
import { settingsStore, syncSessionStore } from '../store';
import type { Book, BookMetadata, SyncJob } from '../models';
import {
  scrapeHighlightsForBook,
  scrapeBookMetadata,
  scrapeBooks,
} from '../scraper';
import { Renderer } from '../renderer';

export default class SyncAmazon {
  private fileManager: FileManager;
  private renderer: Renderer;

  constructor(fileManager: FileManager) {
    this.fileManager = fileManager;
    this.renderer = new Renderer();
  }

  async startSync(): Promise<void> {
    syncSessionStore.actions.login();

    const modal = new AmazonLoginModal();
    const success = await modal.doLogin();

    if (!success) {
      syncSessionStore.actions.reset();
      return; // Do nothing...
    }

    syncSessionStore.actions.startSync('amazon');

    const allBooks = await scrapeBooks();

    syncSessionStore.actions.setJobs(allBooks);

    // Skip all books that have been written in disc
    await forEachAsync(async (book) => {
      const exists = await this.fileManager.fileExists(book);
      if (exists) {
        syncSessionStore.actions.updateJob(book, { status: 'skip' });
      }
    }, allBooks);

    await this.syncBooks(syncSessionStore.getJobs('idle'));

    syncSessionStore.actions.completeSync();
  }

  private async syncBooks(jobs: SyncJob[]): Promise<void> {
    for (const job of jobs) {
      const book = job.book;

      try {
        syncSessionStore.actions.updateJob(book, { status: 'in-progress' });

        await this.syncBook(book);
      } catch (error) {
        console.error(`Error syncing ${book.title}`, error);
        syncSessionStore.actions.updateJob(book, { status: 'error' });
      }
    }
  }

  private async syncBook(book: Book): Promise<void> {
    const highlights = await scrapeHighlightsForBook(book);
    const populatedHighlights = highlights.filter((h) => h.text);

    if (populatedHighlights.length === 0) {
      syncSessionStore.actions.updateJob(book, { status: 'skip' });
      return; // No highlights for book. Skip sync
    }

    const metadata = await this.syncBookMetadata(book);

    const content = this.renderer.render({ book, highlights, metadata });
    await this.fileManager.createFile(book, content);

    syncSessionStore.actions.updateJob(book, {
      status: 'done',
      highlightsProcessed: highlights.length,
    });
  }

  private async syncBookMetadata(book: Book): Promise<BookMetadata> {
    let metadata: BookMetadata;

    try {
      if (get(settingsStore).downloadBookMetadata && book.asin) {
        metadata = await scrapeBookMetadata(book);
      }
    } catch (error) {
      console.error(`Couldn't download metadata for ${book.title}`, error);
    }

    return metadata;
  }
}
