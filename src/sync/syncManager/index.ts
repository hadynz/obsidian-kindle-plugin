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
    const lastSyncDate = get(settingsStore).lastSyncDate;
    const vaultBooks = this.fileManager.getKindleFiles();

    return diffBooks(
      remoteBooks,
      vaultBooks.map((v) => v.book),
      lastSyncDate
    );
  }

  public async syncBook(book: Book, highlights: Highlight[]): Promise<void> {
    if (highlights.length === 0) {
      return; // No highlights for book. Skip sync
    }

    const file = this.fileManager.getKindleFile(book);

    if (file == null) {
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

    if (diffs.length > 0) {
      await diffManager.applyDiffs(remoteBook, remoteHighlights, diffs);
    }

    return diffs;
  }

  private async createBook(book: Book, highlights: Highlight[]): Promise<void> {
    const metadata = await this.syncMetadata(book);

    const content = getRenderers().fileRenderer.render({ book, highlights, metadata });

    await this.fileManager.createFile(book, content, highlights.length);
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
