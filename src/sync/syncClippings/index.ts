import type FileManager from '../../fileManager';
import type { BookHighlight } from '../../models';
import { Renderer } from '../../renderer';
import { openDialog } from './openDialog';
import { parseBooks } from './parseBooks';
import { syncSessionStore } from '../../store';

export default class SyncKindleClippings {
  private fileManager: FileManager;
  private renderer: Renderer;

  constructor(fileManager: FileManager) {
    this.fileManager = fileManager;
    this.renderer = new Renderer();
  }

  async startSync(): Promise<void> {
    const [clippingsFile, canceled] = await openDialog();

    if (canceled) {
      return; // Do nothing...
    }

    syncSessionStore.actions.startSync('my-clippings');

    try {
      const bookHighlights = await parseBooks(clippingsFile);

      syncSessionStore.actions.setJobs(bookHighlights.map((b) => b.book));

      await this.writeBooks(bookHighlights);

      syncSessionStore.actions.completeSync();
    } catch (error) {
      const errorMessage = `Error parsing ${clippingsFile}.`;
      syncSessionStore.actions.errorSync(errorMessage);
      console.error(errorMessage, error);
    }
  }

  private async writeBooks(entries: BookHighlight[]): Promise<void> {
    for (const entry of entries) {
      const book = entry.book;
      try {
        syncSessionStore.actions.updateJob(book, { status: 'in-progress' });

        await this.writeBook(entry);
      } catch (error) {
        console.error(`Error syncing ${book.title}`, error);
        syncSessionStore.actions.updateJob(book, { status: 'error' });
      }
    }
  }

  private async writeBook(entry: BookHighlight): Promise<void> {
    // File already exists. Do nothing for now...
    if (await this.fileManager.fileExists(entry.book)) {
      syncSessionStore.actions.updateJob(entry.book, { status: 'skip' });
      return;
    }

    const content = this.renderer.render(entry);
    await this.fileManager.createFile(entry.book, content);

    syncSessionStore.actions.updateJob(entry.book, {
      status: 'done',
      highlightsProcessed: entry.highlights.length,
    });
  }
}
