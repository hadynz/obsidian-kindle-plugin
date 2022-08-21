import { ee } from '~/eventEmitter';
import type { SyncManager } from '~/sync';

import { openDialog } from './openDialog';
import { parseBooks } from './parseBooks';

export default class SyncKindleClippings {
  constructor(private syncManager: SyncManager) {}

  public async startSync(): Promise<void> {
    const [clippingsFile, canceled] = await openDialog();

    if (canceled) {
      return; // Do nothing...
    }

    try {
      ee.emit('syncSessionStart', 'my-clippings');

      const bookHighlights = parseBooks(clippingsFile);

      for (const { book, highlights } of bookHighlights) {
        await this.syncManager.syncBook(book, highlights);
      }

      ee.emit('syncSessionSuccess');
    } catch (error) {
      const message = `Error parsing ${clippingsFile}.\n\n${String(error)}`;
      ee.emit('syncSessionFailure', message);
      console.error(message);
    }
  }
}
