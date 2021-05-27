import { writable, derived } from 'svelte/store';

import type { Book } from '~/models';
import { santizeTitle } from '~/utils';
import { settingsStore, syncSessionStore } from './';

const { moment } = window;

const createStatusBarStore = () => {
  const config = writable('Kindle sync never run. Start now...');

  const store = derived(
    [config, settingsStore, syncSessionStore],
    ([$config, $settings, $syncSession]) => {
      const isSyncing = $syncSession.status === 'loading';
      let text = $config;

      if (!isSyncing && $settings.lastSyncDate) {
        const booksCount = $settings.history.totalBooks;
        const lastSyncText = `Last sync ${moment(
          $settings.lastSyncDate
        ).fromNow()}`;

        if (booksCount === 0) {
          text = `No books found to sync. ${lastSyncText}`;
        } else if (booksCount === 1) {
          text = `1 book synced. ${lastSyncText}`;
        } else {
          text = `${booksCount} books synced. ${lastSyncText}`;
        }
      }

      return { text, isSyncing };
    }
  );

  const syncStarted = () => {
    config.set('Starting sync...');
  };

  const booksFound = (books: Book[]) => {
    if (books.length === 0) {
      config.set('No new books found to sync');
    } else if (books.length === 1) {
      config.set('Found 1 book to sync');
    } else {
      config.set(`Found ${books.length} books to sync`);
    }
  };

  const syncComplete = (books: Book[]) => {
    if (books.length === 0) {
      config.set('No highlights synced');
    } else if (books.length == 1) {
      config.set('1 book synced');
    } else {
      config.set(`${books.length} books synced`);
    }
  };

  const syncingBook = (book: Book) => {
    config.set(`Syncing "${santizeTitle(book.title)}"`);
  };

  return {
    subscribe: store.subscribe,
    actions: {
      syncStarted,
      syncComplete,
      booksFound,
      syncingBook,
    },
  };
};

export const statusBarStore = createStatusBarStore();
