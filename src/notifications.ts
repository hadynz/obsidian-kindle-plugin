import { Notice } from 'obsidian';
import { sanitizeTitle } from '~/utils';

import { ee } from '~/eventEmitter';

export const registerNotifications = (): void => {
  ee.on('resyncBook', (kindleFile) => {
    new Notice(
      `Resyncing "${sanitizeTitle(kindleFile.book.title)}" highlights`
    );
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
};
