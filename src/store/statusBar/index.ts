import { derived } from 'svelte/store';

import messageTicker from './messageTicker';
import { settingsStore, fileStore } from '~/store';
import { sanitizeTitle } from '~/utils';
import { ee } from '~/eventEmitter';

export type StatusBarMessage = {
  status: 'idle' | 'ready' | 'syncing' | 'error';
  text: string;
};

const FirstTimeMessage: StatusBarMessage = {
  status: 'idle',
  text: 'Kindle sync never run. Start now...',
};

const createStatusBarStore = () => {
  const store = derived(
    [settingsStore, fileStore],
    ([$settings, $file], set) => {
      const defaultTicker = messageTicker(set, $settings.lastSyncDate, $file);
      defaultTicker.start();

      ee.on('resyncBook', (file) => {
        defaultTicker.stop();
        set({
          status: 'syncing',
          text: `Resyncing ${sanitizeTitle(file.book.title)}`,
        });
      });

      ee.on('resyncFailure', async (file) => {
        set({
          status: 'error',
          text: `Error resyncing ${sanitizeTitle(file.book.title)}`,
        });
        defaultTicker.resume();
      });

      ee.on('resyncComplete', (_file, diffCount) => {
        set({
          status: 'ready',
          text: `${diffCount} highlight(s) were imported`,
        });
        defaultTicker.resume();
      });

      return () => {
        defaultTicker.stop();
      };
    },
    FirstTimeMessage
  );

  return {
    subscribe: store.subscribe,
  };
};

export const statusBarStore = createStatusBarStore();
