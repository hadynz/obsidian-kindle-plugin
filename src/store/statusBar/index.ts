import { derived } from 'svelte/store';
const { moment } = window;

import { SetInterval, SetTimeout } from './scheduling';
import { settingsStore, fileStore } from '~/store';
import { sanitizeTitle } from '~/utils';
import { ee } from '~/eventEmitter';

const _setInterval = new SetInterval();
const _setTimeout = new SetTimeout();

const intervalInMs = 1000 * 60 * 5; // 5 minute
const timeoutInMs = 1000 * 30; // 30 seconds

type StatusBarMessage = {
  status: 'idle' | 'ready' | 'syncing' | 'error';
  text: string;
};

const FirstTimeMessage: StatusBarMessage = {
  status: 'idle',
  text: 'Kindle sync never run. Start now...',
};

class DefaultMessage {
  private lastSyncDate: Date;
  private fileCount: number;

  public set(lastSyncDate: Date, fileCount: number): void {
    this.lastSyncDate = lastSyncDate;
    this.fileCount = fileCount;
  }

  public get(): StatusBarMessage {
    if (this.lastSyncDate == null) {
      return FirstTimeMessage;
    }

    const timeAgo = moment(this.lastSyncDate).fromNow();

    return {
      status: 'ready',
      text: `${this.fileCount} books synced. Last sync ${timeAgo}`,
    };
  }
}

const createStatusBarStore = () => {
  let setMessage: (StatusBarMessage) => void = () => {
    // Do nothing...
  };

  const defaultMessage = new DefaultMessage();

  const waitThenResumeDefaultMessage = () => {
    _setTimeout.reset(() => {
      _setInterval.reset(() => setMessage(defaultMessage.get()), intervalInMs);
    }, timeoutInMs);
  };

  ee.on('resyncBook', (file) => {
    _setInterval.clear();
    setMessage({
      status: 'syncing',
      text: `Resyncing ${sanitizeTitle(file.book.title)}`,
    });
  });

  ee.on('resyncFailure', async (file) => {
    setMessage({
      status: 'error',
      text: `Error resyncing ${sanitizeTitle(file.book.title)}`,
    });
    waitThenResumeDefaultMessage();
  });

  ee.on('resyncComplete', (_file, diffCount) => {
    setMessage({
      status: 'ready',
      text: `${diffCount} highlight(s) were imported`,
    });
    waitThenResumeDefaultMessage();
  });

  const store = derived(
    [settingsStore, fileStore],
    ([$settings, $file], set) => {
      // Always update parameters of default message
      defaultMessage.set($settings.lastSyncDate, $file);

      // Expose store's set method to closure
      setMessage = set;

      // Set default message on initial load of plugin
      setMessage(defaultMessage.get());

      // Update default message regularly
      _setInterval.reset(() => setMessage(defaultMessage.get()), intervalInMs);

      return () => {
        _setTimeout.clear();
        _setInterval.clear();
      };
    }
  );

  return {
    subscribe: store.subscribe,
  };
};

export const statusBarStore = createStatusBarStore();
