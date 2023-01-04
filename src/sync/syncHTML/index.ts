import { ee } from '~/eventEmitter';
import type { SyncManager } from '~/sync';

import { openDialog } from './openDialog';
import { parseHTML } from './parseHTML';

export default class SyncExportedHTML {
  constructor(private syncManager: SyncManager) {}

  public async startSync(): Promise<void> {
    const [HTMLFile, canceled] = await openDialog();

    if (canceled) {
      return; // Do nothing...
    }

    try {
      ee.emit('syncSessionStart', 'exported-html');

      const bookHighlights = parseHTML(HTMLFile);
      

      for (const { book, highlights } of bookHighlights) {
        console.log(book);
        console.log(highlights);
        await this.syncManager.syncBook(book, highlights);
      }
      

      ee.emit('syncSessionSuccess');
    } catch (error) {
      const message = `Error parsing ${HTMLFile}.\n\n${String(error)}`;
      ee.emit('syncSessionFailure', message);
      console.error(message);
    }
  }
}