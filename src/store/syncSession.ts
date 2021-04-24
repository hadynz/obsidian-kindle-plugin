import { writable } from 'svelte/store';

import { Book } from '../models';
import { statusBarStore, settingsStore } from '../store';

type SyncJob = {
  status: 'idle' | 'in-progress' | 'done' | 'error';
  book: Book;
};

type SyncSession = {
  status: 'idle' | 'loading';
  jobs: SyncJob[];
};

const createSyncSessionStore = () => {
  const initialState: SyncSession = {
    status: 'idle',
    jobs: [],
  };

  const store = writable(initialState);

  const startSync = () => {
    store.update((state) => {
      state.status = 'loading';
      statusBarStore.actions.syncStarted();
      return state;
    });
  };

  const syncComplete = () => {
    store.update((state) => {
      state.status = 'idle';
      state.jobs = [];
      statusBarStore.actions.syncComplete(state.jobs.map((j) => j.book));
      settingsStore.actions.setSyncDate(new Date());
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
        settingsStore.actions.setSyncDate(new Date());
        settingsStore.actions.markBookAsSynced(book);
      }

      return state;
    });
  };

  return {
    subscribe: store.subscribe,
    actions: {
      startSync,
      syncComplete,
      setJobs,
      startJob: (book: Book) => updateJob(book, 'in-progress'),
      completeJob: (book: Book) => updateJob(book, 'done'),
      errorJob: (book: Book) => updateJob(book, 'error'),
    },
  };
};

export const syncSessionStore = createSyncSessionStore();
