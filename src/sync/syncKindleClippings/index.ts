import FileManager from '../../fileManager';
import { BookHighlight } from '../../models';
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
    syncSessionStore.actions.startSync();

    const [clippingsFile, canceled] = await openDialog();

    if (canceled) {
      return; // Do nothing...
    }

    const bookHighlights = await parseBooks(clippingsFile);
    await this.writeBooks(bookHighlights);

    syncSessionStore.actions.syncComplete();
  }

  private async writeBooks(entries: BookHighlight[]): Promise<void> {
    syncSessionStore.actions.setJobs(entries.map((e) => e.book));

    for (const entry of entries) {
      await this.writeBook(entry);
    }

    syncSessionStore.actions.completeJobs(entries.map((e) => e.book));
  }

  private async writeBook(entry: BookHighlight): Promise<void> {
    const content = this.renderer.render(entry);
    await this.fileManager.writeNote(entry.book.title, content);
  }
}
