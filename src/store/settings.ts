import { writable } from 'svelte/store';

import type KindlePlugin from '../index';
import defaultTemplate from '../assets/defaultTemplate.njk';

type SyncHistory = {
  totalBooks: number;
  totalHighlights: number;
};

type Settings = {
  highlightsFolder: string;
  lastSyncDate?: Date;
  loggedInEmail?: string;
  isLoggedIn: boolean;
  noteTemplate: string;
  syncOnBoot: boolean;
  downloadBookMetadata: boolean;
  history: SyncHistory;
};

const DEFAULT_SETTINGS: Settings = {
  highlightsFolder: '/',
  isLoggedIn: false,
  noteTemplate: defaultTemplate,
  syncOnBoot: false,
  downloadBookMetadata: true,
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
    const data = Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());

    const settings: Settings = {
      ...data,
      lastSyncDate: data.lastSyncDate ? new Date(data.lastSyncDate) : undefined,
    };

    store.set(settings);

    _plugin = plugin;
  };

  // Listen to any change to store, and write to disk
  store.subscribe(async (settings) => {
    if (_plugin) {
      // Transform settings fields for serialization
      const data = {
        ...settings,
        lastSyncDate: settings.lastSyncDate
          ? settings.lastSyncDate.toJSON()
          : undefined,
      };

      await _plugin.saveData(data);
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
      state.lastSyncDate = new Date();
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

  const setDownloadBookMetadata = (value: boolean) => {
    store.update((state) => {
      state.downloadBookMetadata = value;
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
      setDownloadBookMetadata,
      incrementHistory,
    },
  };
};

export const settingsStore = createSettingsStore();
