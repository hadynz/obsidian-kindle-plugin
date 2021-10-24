import { writable } from 'svelte/store';

import { ee } from '~/eventEmitter';
import type { Book, SyncMode } from '~/models';
import type { KindleFile } from '~/fileManager';

type ErroredBook = {
  book: Book;
  reason: string;
};

export type SyncModalState = {
  status:
    | 'first-time'
    | 'sync:login'
    | 'sync:fetching-books'
    | 'sync:syncing'
    | 'idle'
    | 'choose-sync-method';
  syncMode?: SyncMode;
  currentBook?: Book;
  syncError: string | undefined;
  erroredBooks: ErroredBook[];
};

const InitialState: SyncModalState = {
  status: 'idle',
  syncError: undefined,
  erroredBooks: [],
};

const createSyncModalStore = () => {
  const store = writable(InitialState);

  const syncing = function (status: SyncModalState['status']) {
    store.update((state) => ({ ...state, status }));
  };

  ee.on('login', () => syncing('sync:login'));

  ee.on('fetchingBooks', () => syncing('sync:fetching-books'));

  ee.on('syncStart', (mode: SyncMode) => {
    store.update((state) => ({
      ...state,
      status: 'sync:syncing',
      syncMode: mode,
    }));
  });

  ee.on('syncBook', (book: Book) => {
    store.update((state) => ({
      ...state,
      status: 'sync:syncing',
      currentBook: book,
    }));
  });

  ee.on('resyncBook', (file: KindleFile) => {
    store.update((state) => ({
      ...state,
      status: 'sync:syncing',
      currentBook: file.book,
    }));
  });

  ee.on('syncSuccess', () => syncing('idle'));

  ee.on('resyncComplete', () => syncing('idle'));

  ee.on('syncFailure', (message: string) => {
    store.update((state) => ({
      ...state,
      status: 'idle',
      syncError: message,
    }));
  });

  ee.on('resyncFailure', (file: KindleFile, message: string) => {
    store.update((state) => ({
      ...state,
      status: 'idle',
      erroredBooks: [{ book: file.book, reason: message }],
    }));
  });

  ee.on('syncBookFailure', (book: Book, message: string) => {
    store.update((state) => ({
      ...state,
      erroredBooks: [...state.erroredBooks, { book, reason: message }],
    }));
  });

  return store;
};

export const store = createSyncModalStore();
