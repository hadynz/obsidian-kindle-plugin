import type FileManager from '../../fileManager';
import type { BookHighlight } from '../../models';
import { Renderer } from '../../renderer';
import { openDialog } from './openDialog';
import { parseBooks } from './parseBooks';
import { syncSessionStore } from '../../store';
import type { SyncState } from '../syncState';

const initialState = { newBooksSynced: 0, newHighlightsSynced: 0 };

export default class SyncKindleClippings {
  private fileManager: FileManager;
  private renderer: Renderer;
  private state: SyncState = initialState;

  constructor(fileManager: FileManager) {
    this.fileManager = fileManager;
    this.renderer = new Renderer();
  }

  async startSync(): Promise<void> {
    this.state = initialState;

    syncSessionStore.actions.startSync('clippings-file');

    const [clippingsFile, canceled] = await openDialog();

    if (canceled) {
      return; // Do nothing...
    }

    const bookHighlights = await parseBooks(clippingsFile);
    await this.writeBooks(bookHighlights);

    syncSessionStore.actions.completeSync({
      newBookCount: this.state.newBooksSynced,
      newHighlightsCount: this.state.newHighlightsSynced,
      updatedBookCount: 0,
      updatedHighlightsCount: 0,
    });
  }

  private async writeBooks(entries: BookHighlight[]): Promise<void> {
    for (const entry of entries) {
      await this.writeBook(entry);
    }
  }

  private async writeBook(entry: BookHighlight): Promise<void> {
    // File already exists. Do nothing for now...
    if (await this.fileManager.fileExists(entry.book)) {
      return;
    }

    const content = this.renderer.render(entry);
    await this.fileManager.createFile(entry.book, content);

    this.state.newBooksSynced += 1;
    this.state.newHighlightsSynced += entry.highlights.length;
  }
}
