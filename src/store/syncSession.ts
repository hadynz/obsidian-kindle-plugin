import { writable } from 'svelte/store';

import type { Book, SyncMode } from '~/models';
import { statusBarStore, settingsStore } from '~/store';

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
  status: 'idle' | 'login' | 'loading' | 'error';
  errorMessage?: string;
  method?: SyncMode;
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

  // This action is only relevant to syncing with Amazon, code smell in store?
  const login = () => {
    store.update((state) => {
      state.status = 'login';
      return state;
    });
  };

  const startSync = (method: SyncMode) => {
    store.update((state) => {
      statusBarStore.actions.syncStarted();
      settingsStore.actions.setLastSyncMode(method);
      state.status = 'loading';
      state.method = method;
      state.errorMessage = undefined;
      state.jobs = [];
      return state;
    });
  };

  const reset = () => {
    store.update((state) => {
      state.status = 'idle';
      state.errorMessage = undefined;
      state.method = undefined;
      state.jobs = [];
      return state;
    });
  };
  const errorSync = (errorMessage: string) => {
    store.update((state) => {
      state.status = 'error';
      state.errorMessage = errorMessage;
      state.method = undefined;
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
      reset();
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
      login,
      startSync,
      errorSync,
      completeSync,
      setJobs,
      startJob: (book: Book) => updateJob(book, 'in-progress'),
      completeJob: (book: Book) => updateJob(book, 'done'),
      errorJob: (book: Book) => updateJob(book, 'error'),
      reset,
    },
  };
};

export const syncSessionStore = createSyncSessionStore();
