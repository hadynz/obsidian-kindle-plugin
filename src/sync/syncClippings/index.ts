import { openDialog } from './openDialog';
import { parseBooks } from './parseBooks';
import type { SyncManager } from '~/sync';

export default class SyncKindleClippings {
  constructor(private syncManager: SyncManager) {}

  public async startSync(): Promise<void> {
    const [clippingsFile, canceled] = await openDialog();

    if (canceled) {
      return; // Do nothing...
    }

    try {
      const bookHighlights = await parseBooks(clippingsFile);

      for (const { book, highlights } of bookHighlights) {
        await this.syncManager.syncBook(book, highlights);
      }
    } catch (error) {
      const errorMessage = `Error parsing ${clippingsFile}.`;
      console.error(errorMessage, error);
    }
  }
}
