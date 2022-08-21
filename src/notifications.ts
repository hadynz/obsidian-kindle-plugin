import { Notice } from 'obsidian';

import { ee } from '~/eventEmitter';
import type { KindleFile } from '~/models';
import { shortenTitle } from '~/utils';

export const registerNotifications = (): void => {
  ee.on('resyncBook', (kindleFile) => {
    new Notice(`Resyncing "${shortenTitle(kindleFile.book.title)}" book highlights`);
  });

  ee.on('resyncComplete', (_kindleFile, diffCount) => {
    let message = 'No new highlights to resync';

    if (diffCount === 1) {
      message = '1 new highlight imported';
    } else if (diffCount > 1) {
      message = `${diffCount} highlights imported`;
    }

    new Notice(message);
  });

  ee.on('syncSessionFailure', (message: string) => {
    new Notice(message);
  });

  ee.on('resyncFailure', (_file: KindleFile, message: string) => {
    new Notice(message);
  });

  ee.on('startLogout', () => {
    new Notice('Signing out...');
  });

  ee.on('logoutSuccess', () => {
    new Notice('Signed out');
  });

  ee.on('logoutFailure', () => {
    new Notice('Error. Could not sign out');
  });
};
