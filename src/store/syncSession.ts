import { writable, get } from 'svelte/store';

import type { Book, SyncJob, SyncMode } from '../models';
import { statusBarStore, settingsStore } from '../store';

type SyncSession = {
  status: 'idle' | 'login' | 'loading' | 'processing' | 'done' | 'error';
  errorMessage?: string;
  method?: SyncMode;
  jobs: SyncJob[];
};

const createSyncSessionStore = () => {
  const initialState: SyncSession = {
    status: 'idle',
    jobs: [],
  };

  const store = writable(initialState);

  const getJobs = (filter?: SyncJob['status']): SyncJob[] => {
    const allJobs = get(store).jobs;
    return filter ? allJobs.filter((job) => job.status === filter) : allJobs;
  };

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

  const completeSync = () => {
    store.update((state) => {
      const allBooks = getJobs().map((job) => job.book);
      statusBarStore.actions.syncComplete(allBooks);
      settingsStore.actions.setSyncDateToNow();
      state.status = 'done';
      return state;
    });
  };

  const setJobs = (books: Book[]) => {
    store.update((state) => {
      state.status = 'processing';
      state.jobs = books.map((book) => ({
        status: 'idle',
        book,
        highlightsProcessed: 0,
      }));
      statusBarStore.actions.booksFound(books);
      return state;
    });
  };

  const updateJob = (book: Book, updatedJob: Partial<SyncJob>) => {
    store.update((state) => {
      const jobIndex = state.jobs.findIndex((j) => j.book.title === book.title);
      const job = { ...state.jobs[jobIndex], ...updatedJob };
      state.jobs[jobIndex] = job;

      if (status === 'in-progress') {
        statusBarStore.actions.syncingBook(book);
      }

      if (status === 'done') {
        settingsStore.actions.setSyncDateToNow();
        settingsStore.actions.incrementHistory({
          totalBooks: 1,
          totalHighlights: job.highlightsProcessed,
        });
      }

      return state;
    });
  };

  return {
    subscribe: store.subscribe,
    getJobs,
    actions: {
      login,
      startSync,
      errorSync,
      completeSync,
      setJobs,
      updateJob,
      reset,
    },
  };
};

export const syncSessionStore = createSyncSessionStore();
