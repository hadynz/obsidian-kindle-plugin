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

const getBooks = (state: SyncSession): Book[] => {
  return state.jobs.map((j) => j.book);
};

const getJobFromBook = (state: SyncSession, book: Book): SyncJob => {
  return state.jobs.find((j) => j.book.title === book.title) as SyncJob;
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
      statusBarStore.actions.syncComplete(getBooks(state));
      settingsStore.actions.setSyncDate(new Date());
      state.status = 'idle';
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

  const completeJobs = (books: Book[]) => {
    store.update((state) => {
      books.forEach((book) => {
        const job = getJobFromBook(state, book);
        job.status = 'done';
      });

      settingsStore.actions.setSyncDate(new Date());
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
      completeJobs,
      errorJob: (book: Book) => updateJob(book, 'error'),
    },
  };
};

export const syncSessionStore = createSyncSessionStore();
