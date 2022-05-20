import { ee } from '~/eventEmitter';
import { openDialog } from './openDialog';
import { parseBooks } from './parseBooks';
import type { SyncManager } from '~/sync';

import { get } from 'svelte/store';
import { settingsStore } from '~/store';
import { existsSync } from 'fs';


type FindMyClippingsFileResponse = [ file: string, canceled: boolean ];

export default class SyncKindleClippings {
  constructor(private syncManager: SyncManager) {}

  public async startSync(): Promise<void> {
    const [clippingsFile, canceled] = await this.findMyClippingsFile();
    if (canceled) {
      return; // Do nothing...
    }

    try {
      ee.emit('syncSessionStart', 'my-clippings');

      const bookHighlights = await parseBooks(clippingsFile);

      for (const { book, highlights } of bookHighlights) {
        await this.syncManager.syncBook(book, highlights);
      }

      ee.emit('syncSessionSuccess');
    } catch (error) {
      const message = `Error parsing ${clippingsFile}.\n\n${error}`;
      ee.emit('syncSessionFailure', message);
      console.error(message);
    }
  }

  public async findMyClippingsFile(): Promise<FindMyClippingsFileResponse> {
    /* First, check if setting for My Clippings path is specified */
    const myClippingsPath = await get(settingsStore).myClippingsFileLocation;
    
    /* Check if this path actually exists */
    const exists = myClippingsPath ? existsSync(myClippingsPath) : false;
    
    if(exists){
      /* We found it! */
      return [ myClippingsPath, false ];
    } else {
      /* We didn't... summon the file picker */
      return await openDialog();
    }
  }
}
