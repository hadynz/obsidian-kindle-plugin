import { get } from 'svelte/store';

import { settingsStore } from '~/store';
import { scrapeBookMetadata } from '~/scraper';
import { DiffManager } from '../diffManager';
import { Renderer } from '~/renderer';
import { diffBooks } from './diffBooks';
import type FileManager from '~/fileManager';
import type { Book, BookMetadata, Highlight, KindleFile } from '~/models';
import type { DiffResult } from '../diffManager';

export default class SyncManager {
  private renderer: Renderer;

  constructor(private fileManager: FileManager) {
    this.fileManager = fileManager;
    this.renderer = new Renderer();
  }

  public async filterBooksToSync(remoteBooks: Book[]): Promise<Book[]> {
    const lastSyncDate = get(settingsStore).lastSyncDate;
    const vaultBooks = await this.fileManager.getKindleFiles();

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

    const file = await this.fileManager.getKindleFile(book);

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

    const diffs = await diffManager.diff(remoteHighlights);

    if (diffs.length > 0) {
      await diffManager.applyDiffs(remoteBook, remoteHighlights, diffs);
    }

    return diffs;
  }

  private async createBook(book: Book, highlights: Highlight[]): Promise<void> {
    const metadata = await this.syncMetadata(book);

    const content = this.renderer.render({ book, highlights, metadata });

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
