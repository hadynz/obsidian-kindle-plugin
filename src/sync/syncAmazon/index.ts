import { get } from 'svelte/store';

import AmazonLoginModal from '~/components/amazonLoginModal';
import type FileManager from '~/fileManager';
import type { KindleFile } from '~/fileManager';
import { settingsStore, syncSessionStore } from '~/store';
import type { Book, BookMetadata, Highlight } from '~/models';
import {
  scrapeHighlightsForBook,
  scrapeBookMetadata,
  scrapeBooks,
} from '~/scraper';
import { SyncDiff } from '~/sync/syncDiff';
import { Renderer } from '~/renderer';
import type { SyncState } from '~/sync/syncState';

const initialState = { newBooksSynced: 0, newHighlightsSynced: 0 };

export default class SyncAmazon {
  private renderer: Renderer;
  private diff: SyncDiff;
  private state: SyncState = initialState;

  constructor(private fileManager: FileManager) {
    this.fileManager = fileManager;
    this.renderer = new Renderer();
    this.diff = new SyncDiff(fileManager);
  }

  async startSync(): Promise<void> {
    this.state = initialState;

    syncSessionStore.actions.login();

    const modal = new AmazonLoginModal();
    const success = await modal.doLogin();

    if (!success) {
      syncSessionStore.actions.reset();
      return; // Do nothing...
    }

    syncSessionStore.actions.startSync('amazon');

    const remoteBooks = await scrapeBooks();

    syncSessionStore.actions.setJobs(remoteBooks);

    if (remoteBooks.length > 0) {
      await this.syncBooks([remoteBooks[0]]);
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
        console.error(`Error syncing ${book.title}`, error);
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

    const file = await this.fileManager.getFile(book);
    const fileExists = file != null;

    if (fileExists) {
      await this.resyncBook(file, populatedHighlights);
    } else {
      await this.createBook(book, populatedHighlights);
    }

    this.state.newBooksSynced += 1;
    this.state.newHighlightsSynced += populatedHighlights.length;
  }

  private async resyncBook(
    file: KindleFile,
    highlights: Highlight[]
  ): Promise<void> {
    const diffs = await this.diff.diff(file, highlights);

    if (diffs.length > 0) {
      await this.diff.applyDiffs(file, diffs);
    }
  }

  private async createBook(book: Book, highlights: Highlight[]): Promise<void> {
    const metadata = await this.syncBookMetadata(book);

    const content = this.renderer.render({ book, highlights, metadata });
    await this.fileManager.createFile(book, content);
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
