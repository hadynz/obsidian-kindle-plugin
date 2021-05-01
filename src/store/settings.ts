import { writable } from 'svelte/store';

import KindlePlugin from '../index';
import defaultTemplate from '../assets/defaultTemplate.njk';

type SyncHistory = {
  totalBooks: number;
  totalHighlights: number;
};

type Settings = {
  highlightsFolder: string;
  lastSyncDate?: string;
  loggedInEmail?: string;
  isLoggedIn: boolean;
  noteTemplate: string;
  syncOnBoot: boolean;
  history: SyncHistory;
};

const DEFAULT_SETTINGS: Settings = {
  highlightsFolder: '/',
  isLoggedIn: false,
  noteTemplate: defaultTemplate,
  syncOnBoot: false,
  history: {
    totalBooks: 0,
    totalHighlights: 0,
  },
};

const createSettingsStore = () => {
  const store = writable(DEFAULT_SETTINGS as Settings);

  let _plugin!: KindlePlugin;

  // Load settings data from disk into store
  const initialise = async (plugin: KindlePlugin): Promise<void> => {
    const settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await plugin.loadData(),
    );

    settings.lastSyncDate === undefined
      ? undefined
      : new Date(settings.lastSyncDate);

    store.set(settings);

    _plugin = plugin;
  };

  // Listen to any change to store, and write to disk
  store.subscribe(async (settings) => {
    if (_plugin) {
      await _plugin.saveData(settings);
    }
  });

  const setHighlightsFolder = (value: string) => {
    store.update((state) => {
      state.highlightsFolder = value;
      return state;
    });
  };

  const resetSyncHistory = () => {
    store.update((state) => {
      state.history = DEFAULT_SETTINGS.history;
      state.lastSyncDate = undefined;
      return state;
    });
  };

  const setSyncDateToNow = () => {
    store.update((state) => {
      state.lastSyncDate = new Date().toString();
      return state;
    });
  };

  const login = (value: string) => {
    store.update((state) => {
      state.isLoggedIn = true;
      state.loggedInEmail = value;
      return state;
    });
  };

  const logout = () => {
    store.update((state) => {
      state.isLoggedIn = false;
      state.loggedInEmail = undefined;
      return state;
    });
  };

  const setNoteTemplate = (value: string) => {
    store.update((state) => {
      state.noteTemplate = value;
      return state;
    });
  };

  const setSyncOnBoot = (value: boolean) => {
    store.update((state) => {
      state.syncOnBoot = value;

      return state;
    });
  };

  const incrementHistory = (delta: SyncHistory) => {
    store.update((state) => {
      state.history.totalBooks += delta.totalBooks;
      state.history.totalHighlights += delta.totalHighlights;
      return state;
    });
  };

  return {
    subscribe: store.subscribe,
    initialise,
    actions: {
      setHighlightsFolder,
      resetSyncHistory,
      setSyncDateToNow,
      login,
      logout,
      setNoteTemplate,
      setSyncOnBoot,
      incrementHistory,
    },
  };
};

export const settingsStore = createSettingsStore();
