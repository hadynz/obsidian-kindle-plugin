import { get } from 'svelte/store';

import type FileManager from '~/fileManager';
import type { Book, BookMetadata, Highlight, KindleFile } from '~/models';
import { getRenderers } from '~/rendering';
import { scrapeBookMetadata } from '~/scraper';
import { settingsStore } from '~/store';

import type { DiffResult } from '../diffManager';
import { DiffManager } from '../diffManager';

import { diffBooks } from './diffBooks';

export default class SyncManager {
  constructor(private fileManager: FileManager) {
    this.fileManager = fileManager;
  }

  public filterBooksToSync(remoteBooks: Book[]): Book[] {
    const ignoredBooks = get(settingsStore).ignoredBooks ?? [];
    const vaultBooks = this.fileManager.getKindleFiles();

    const booksToSync = diffBooks(
      remoteBooks,
      vaultBooks.map((v) => v.book)
    );

    if (ignoredBooks.length === 0) {
      return booksToSync;
    }

    const ignoredLower = ignoredBooks.map((t) => t.toLowerCase().trim()).filter((t) => t !== '');
    return booksToSync.filter((book) => {
      const titleLower = book.title.toLowerCase().trim();
      return !ignoredLower.some((pattern) => titleLower.includes(pattern));
    });
  }

  public async syncBook(book: Book, highlights: Highlight[]): Promise<void> {
    const file = this.fileManager.getKindleFile(book);

    if (file == null) {
      // Still create a file even with zero highlights - a book with no note has no lastChecked
      // to compare against, so it looks "new" again on every single sync, forever, exactly like
      // the bugs fixed elsewhere in this codebase. Recording that we checked it (even if there's
      // nothing to show yet) is what lets it drop out of the diff once confirmed empty.
      await this.createBook(book, highlights);
    } else {
      await this.resyncBook(file, book, highlights);
    }
  }

  public async resyncBook(
    file: KindleFile,
    remoteBook: Book,
    remoteHighlights: Highlight[]
  ): Promise<DiffResult[]> {
    const diffManager = await DiffManager.create(this.fileManager, file);

    const diffs = diffManager.diff(remoteHighlights);

    // Always write, even with zero diffs - this is what stamps lastChecked with today's date, so
    // a book we just confirmed is unchanged doesn't look perpetually stale to diffBooks
    await diffManager.applyDiffs(remoteBook, remoteHighlights, diffs);

    return diffs;
  }

  private async createBook(book: Book, highlights: Highlight[]): Promise<void> {
    const metadata = await this.syncMetadata(book);

    const content = getRenderers().fileRenderer.render({ book, highlights, metadata });

    await this.fileManager.createFile(book, metadata, content, highlights.length);
  }

  private async syncMetadata(book: Book): Promise<BookMetadata> {
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
