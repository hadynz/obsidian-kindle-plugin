import type { App } from 'obsidian';
import { get } from 'svelte/store';

import type FileManager from '~/fileManager';
import type { KindleFile } from '~/fileManager';
import { settingsStore } from '~/store';
import type { Book, BookMetadata, Highlight } from '~/models';
import { scrapeBookMetadata } from '~/scraper';
import { SyncDiff } from '~/sync/syncDiff';
import { Renderer } from '~/renderer';
import { ResyncBookModal } from '~/components/resyncModal';

export default class SyncManager {
  private diff: SyncDiff;
  private renderer: Renderer;

  constructor(private app: App, private fileManager: FileManager) {
    this.fileManager = fileManager;
    this.diff = new SyncDiff(fileManager);
    this.renderer = new Renderer();
  }

  public async syncBook(book: Book, highlights: Highlight[]): Promise<void> {
    if (highlights.length === 0) {
      return; // No highlights for book. Skip sync
    }

    const file = await this.fileManager.getFile(book);

    if (file == null) {
      await this.createBook(book, highlights);
      return;
    }

    const result = await new ResyncBookModal(this.app).show(book);

    if (result === 'resync') {
      await this.resyncBook(file, highlights);
    }
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
    const metadata = await this.syncMetadata(book);

    const content = this.renderer.render({ book, highlights, metadata });
    await this.fileManager.createFile(book, content);
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
