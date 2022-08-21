import { writable } from 'svelte/store';

import { ee } from '~/eventEmitter';
import type { Book, KindleFile, SyncMode } from '~/models';

type Job = {
  book: Book;
};

type JobError = {
  book: Book;
  reason: string;
};

export type SyncModalState = {
  status:
    | 'upgrade-warning'
    | 'first-time'
    | 'idle'
    | 'choose-sync-method'
    | 'sync:login'
    | 'sync:fetching-books'
    | 'sync:syncing';
  syncMode?: SyncMode;
  currentJob?: { book: Book; index: number };
  syncError: string | undefined;
  jobs?: Job[] | undefined;
  erroredJobs: JobError[];
};

const InitialState: SyncModalState = {
  status: 'idle',
  syncError: undefined,
  erroredJobs: [],
};

const createSyncModalStore = () => {
  const store = writable(InitialState);

  const syncing = (status: SyncModalState['status']) => {
    store.update((state) => ({ ...state, status }));
  };

  ee.on('startLogin', () => syncing('sync:login'));

  ee.on('fetchingBooks', () => syncing('sync:fetching-books'));

  ee.on('fetchingBooksSuccess', (booksToSync: Book[]) => {
    store.update((state) => ({
      ...state,
      status: 'sync:fetching-books',
      jobs: booksToSync.map((book) => ({ book, status: 'idle' })),
    }));
  });

  ee.on('syncSessionStart', (mode: SyncMode) => {
    store.set({ ...InitialState, status: 'sync:syncing', syncMode: mode });
  });

  ee.on('syncBook', (book: Book, index: number) => {
    store.update((state) => ({
      ...state,
      status: 'sync:syncing',
      currentJob: { book, index },
    }));
  });

  ee.on('resyncBook', (file: KindleFile) => {
    store.set({
      ...InitialState,
      status: 'sync:syncing',
      currentJob: { book: file.book, index: 0 },
    });
  });

  ee.on('syncSessionSuccess', () => {
    store.set(InitialState);
  });

  ee.on('resyncComplete', () => syncing('idle'));

  ee.on('syncSessionFailure', (message: string) => {
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
      erroredJobs: [{ book: file.book, reason: message }],
    }));
  });

  ee.on('syncBookFailure', (book: Book, message: string) => {
    store.update((state) => ({
      ...state,
      erroredJobs: [...state.erroredJobs, { book, reason: message }],
    }));
  });

  return store;
};

export const store = createSyncModalStore();
