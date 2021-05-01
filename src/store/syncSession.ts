import { writable } from 'svelte/store';

import { Book } from '../models';
import { statusBarStore, settingsStore } from '../store';

type SyncJob = {
  status: 'idle' | 'in-progress' | 'done' | 'error';
  book: Book;
};

type SyncResult = {
  newBookCount: number;
  newHighlightsCount: number;
  updatedBookCount: number;
  updatedHighlightsCount: number;
};

type SyncSession = {
  status: 'idle' | 'loading';
  method?: 'amazon' | 'clippings-file';
  jobs: SyncJob[];
};

const getBooks = (state: SyncSession): Book[] => {
  return state.jobs.map((j) => j.book);
};

const createSyncSessionStore = () => {
  const initialState: SyncSession = {
    status: 'idle',
    jobs: [],
  };

  const store = writable(initialState);

  const startSync = (method: SyncSession['method']) => {
    store.update((state) => {
      statusBarStore.actions.syncStarted();
      state.status = 'loading';
      state.method = method;
      return state;
    });
  };

  const completeSync = (result: SyncResult) => {
    store.update((state) => {
      statusBarStore.actions.syncComplete(getBooks(state));
      settingsStore.actions.setSyncDateToNow();
      settingsStore.actions.incrementHistory({
        totalBooks: result.newBookCount,
        totalHighlights: result.newHighlightsCount,
      });
      state.status = 'idle';
      state.method = undefined;
      state.jobs = [];
      return state;
    });
  };

  const setJobs = (books: Book[]) => {
    store.update((state) => {
      state.jobs = books.map((book) => ({ status: 'idle', book }));
      statusBarStore.actions.booksFound(books);
      return state;
    });
  };

  const updateJob = (book: Book, status: SyncJob['status']) => {
    store.update((state) => {
      const job = state.jobs.filter((job) => job.book.asin === book.asin)[0];
      job.status = status;

      if (status === 'in-progress') {
        statusBarStore.actions.syncingBook(book);
      }

      if (status === 'done') {
        settingsStore.actions.setSyncDateToNow();
      }

      return state;
    });
  };

  return {
    subscribe: store.subscribe,
    actions: {
      startSync,
      completeSync,
      setJobs,
      startJob: (book: Book) => updateJob(book, 'in-progress'),
      completeJob: (book: Book) => updateJob(book, 'done'),
      errorJob: (book: Book) => updateJob(book, 'error'),
    },
  };
};

export const syncSessionStore = createSyncSessionStore();
