import { get, writable } from 'svelte/store';

import { ee } from '~/eventEmitter';
import type { Book, Highlight, KindleFile, SyncMode } from '~/models';
import { shortenTitle } from '~/utils';

type Job = {
  book: Book;
};

type JobError = {
  book: Book;
  reason: string;
};

type SyncLogEntry = {
  timestamp: number;
  message: string;
  deltaMs?: number;
  indent: number;
};

const ellipsize = (value: string, maxLength = 64): string => {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
};

export type SyncModalState = {
  status:
    | 'idle'
    | 'sync:login'
    | 'sync:fetching-books'
    | 'sync:syncing'
    | 'sync:cancelling'
    | 'sync:cancelled'
    | 'sync:complete';
  syncMode?: SyncMode;
  currentJob?: { book: Book; index: number };
  syncError: string | undefined;
  jobs?: Job[] | undefined;
  erroredJobs: JobError[];
  isCancelling?: boolean;
  totalBooks?: number;
  remoteBookCount?: number;
  syncedCount?: number;
  highlightsSynced?: number;
  syncStartedAt?: number;
  syncDurationMs?: number;
  activityLog: SyncLogEntry[];
};

const InitialState: SyncModalState = {
  status: 'idle',
  syncError: undefined,
  erroredJobs: [],
  activityLog: [],
};

const createSyncModalStore = () => {
  const store = writable(InitialState);

  const addLog = (message: string) => {
    store.update((state) => {
      const timestamp = Date.now();
      const prev = state.activityLog[state.activityLog.length - 1];
      const deltaMs = prev ? timestamp - prev.timestamp : undefined;
      const indent = state.currentJob ? 1 : 0;

      const next: SyncLogEntry[] = [
        ...state.activityLog,
        {
          timestamp,
          message,
          deltaMs,
          indent,
        },
      ];
      const MAX_ENTRIES = 250;
      return {
        ...state,
        activityLog: next.length > MAX_ENTRIES ? next.slice(next.length - MAX_ENTRIES) : next,
      };
    });
  };

  const addRootLog = (message: string) => {
    store.update((state) => {
      const timestamp = Date.now();
      const prev = state.activityLog[state.activityLog.length - 1];
      const deltaMs = prev ? timestamp - prev.timestamp : undefined;

      const next: SyncLogEntry[] = [
        ...state.activityLog,
        {
          timestamp,
          message,
          deltaMs,
          indent: 0,
        },
      ];
      const MAX_ENTRIES = 250;
      return {
        ...state,
        activityLog: next.length > MAX_ENTRIES ? next.slice(next.length - MAX_ENTRIES) : next,
      };
    });
  };

  const syncing = (status: SyncModalState['status']) => {
    store.update((state) => ({ ...state, status }));
  };

  ee.on('startLogin', () => {
    syncing('sync:login');
    addRootLog('Logging in…');
  });

  ee.on('loginComplete', (success: boolean) => {
    addRootLog(success ? 'Login successful' : 'Login cancelled');
  });

  ee.on('fetchingBooks', () => {
    syncing('sync:fetching-books');
  });

  ee.on('fetchingBooksSuccess', (booksToSync: Book[], remoteBooks: Book[]) => {
    addRootLog(
      booksToSync.length > 0
        ? `Will sync ${booksToSync.length} book${booksToSync.length === 1 ? '' : 's'}`
        : 'All books are up to date'
    );
    store.update((state) => ({
      ...state,
      status: 'sync:fetching-books',
      jobs: booksToSync.map((book) => ({ book, status: 'idle' })),
      totalBooks: booksToSync.length,
      remoteBookCount: remoteBooks.length,
    }));
  });

  ee.on('syncSessionStart', (mode: SyncMode) => {
    store.set({
      ...InitialState,
      status: 'sync:syncing',
      syncMode: mode,
      syncStartedAt: Date.now(),
    });
  });

  ee.on('syncBook', (book: Book, index: number) => {
    const title = ellipsize(shortenTitle(book.title));
    addRootLog(`Opening "${title}"`);
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
    const erroredCount = get(store).erroredJobs.length;
    addRootLog(
      erroredCount > 0 ? `Sync complete with ${erroredCount} error${erroredCount === 1 ? '' : 's'}` : 'Sync complete'
    );
    store.update((state) => ({
      ...InitialState,
      status: 'sync:complete' as const,
      syncedCount: state.syncedCount,
      totalBooks: state.totalBooks,
      highlightsSynced: state.highlightsSynced,
      syncDurationMs: state.syncStartedAt ? Date.now() - state.syncStartedAt : undefined,
      activityLog: state.activityLog,
      // Carried over rather than reset - a session can complete overall while individual books
      // failed along the way, and that's otherwise invisible outside the console.
      erroredJobs: state.erroredJobs,
    }));
  });

  ee.on('resyncComplete', () => syncing('idle'));

  ee.on('syncSessionFailure', (message: string) => {
    addRootLog(`Sync failed: ${message}`);
    store.update((state) => ({
      ...state,
      status: 'idle',
      syncError: message,
      syncDurationMs: state.syncStartedAt ? Date.now() - state.syncStartedAt : undefined,
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
    addRootLog(`Error syncing "${book.title}": ${message}`);
    store.update((state) => ({
      ...state,
      erroredJobs: [...state.erroredJobs, { book, reason: message }],
    }));
  });

  ee.on('syncBookSuccess', (_book: Book, highlights: Highlight[]) => {
    store.update((state) => ({
      ...state,
      syncedCount: (state.syncedCount ?? 0) + 1,
      highlightsSynced: (state.highlightsSynced ?? 0) + highlights.length,
    }));
  });

  ee.on('syncCancelRequested', () => {
    addRootLog('Cancel requested — finishing current step…');
    store.update((state) => ({
      ...state,
      isCancelling: true,
      status: 'sync:cancelling',
    }));
  });

  ee.on('syncCancelled', (summary) => {
    addRootLog('Sync cancelled');
    store.update((state) => ({
      ...InitialState,
      status: 'sync:cancelled',
      syncedCount: summary.syncedCount,
      totalBooks: summary.totalCount,
      syncDurationMs: state.syncStartedAt ? Date.now() - state.syncStartedAt : undefined,
      activityLog: state.activityLog,
    }));
  });

  ee.on('syncLog', (message: string) => {
    addLog(message);
  });

  return store;
};

export const store = createSyncModalStore();
