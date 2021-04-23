import { writable } from 'svelte/store';

import { santizeTitle } from './fileManager';
import { Book } from './models';
import { PluginSettings } from './settings';

const moment = window.moment;

type AppState = {
  status: 'idle' | 'loading';
  statusMessage: string;
  lastSyncDate: Date | null;
  synchedBookAsins: string[];
  jobs: Book[];
  inProgress: Book | null;
  done: Book[];
};

const foundBooks = (books: Book[]): string => {
  let text = `Found ${books.length} books to sync`;
  if (books.length === 1) {
    text = 'Found 1 book to sync';
  }
  return text;
};

const syncingBook = (book: Book): string => {
  return `Syncing "${santizeTitle(book.title)}"`;
};

const syncedBooks = (books: Book[]): string => {
  let text = `${books.length} books synced`;
  if (books.length === 0) {
    text = 'No highlights synced';
  } else if (books.length == 1) {
    text = '1 book synced';
  }
  return text;
};

const defaultMessage = (state: AppState): string => {
  if (state.lastSyncDate) {
    return `${state.synchedBookAsins.length} book(s) synced. Last sync ${moment(
      state.lastSyncDate,
    ).fromNow()}`;
  }
  return 'Start syncing your Kindle highlights';
};

const store = () => {
  const initialState: AppState = {
    status: 'idle',
    statusMessage: '',
    lastSyncDate: null,
    synchedBookAsins: [],
    jobs: [],
    inProgress: null,
    done: [],
  };

  const { subscribe, set, update } = writable(initialState);

  const actions = {
    initialize: (settings: PluginSettings) =>
      update((state) => {
        state.lastSyncDate = settings.lastSyncDate;
        state.synchedBookAsins = settings.synchedBookAsins;
        state.statusMessage = defaultMessage(state);
        console.log('initialize store', settings);
        return state;
      }),

    getBooks: () =>
      update((state) => {
        state.status = 'loading';
        state.statusMessage = 'Starting sync...';
        console.log('started sync');
        return state;
      }),

    getBooksSuccessful: (books: Book[]) =>
      update((state) => {
        state.jobs = [...books];
        state.statusMessage = foundBooks(books);
        console.log('found books', books);
        return state;
      }),

    getBookHighlights: (book: Book) =>
      update((state) => {
        state.inProgress = book;
        state.statusMessage = syncingBook(book);
        console.log('fetching highlights for book', book);
        return state;
      }),

    getBookHighlightsSuccess: (book: Book) =>
      update((state) => {
        state.inProgress = null;
        state.done = [book, ...state.done];
        console.log('fetched highlights for book', book);
        return state;
      }),

    syncComplete: (books: Book[]) =>
      update((state) => {
        state.status = 'idle';
        state.statusMessage = syncedBooks(books);
        console.log('syncing complete');
        return state;
      }),
  };

  return {
    subscribe,
    set,
    update,
    ...actions,
  };
};

export default store();
