import { writable } from 'svelte/store';

import type KindlePlugin from '~/.';
import { ee } from '~/eventEmitter';
import type { AmazonAccountRegion, SyncMode } from '~/models';

type Settings = {
  amazonRegion: AmazonAccountRegion;
  highlightsFolder: string;
  lastSyncDate?: Date;
  lastSyncMode: SyncMode;
  hasStartedSync?: boolean;
  isLoggedIn: boolean;
  fileTemplate?: string;
  highlightTemplate?: string;
  fileNameTemplate?: string;
  syncOnBoot: boolean;
  downloadBookMetadata: boolean;
  ignoredBooks: string[];
  removeParens: boolean;
  removeParensWhitelist: string;
  removeParensType: 'all' | 'chinese' | 'english';
  removeParensSpaces: boolean;
  removeParensFromTitle: boolean;
  removeParensFromAuthor: boolean;

  // Deprecated - delete eventually
  noteTemplate?: string;
  history?: string;
};

const DEFAULT_SETTINGS: Settings = {
  amazonRegion: 'global',
  highlightsFolder: '/',
  lastSyncMode: 'amazon',
  hasStartedSync: false,
  isLoggedIn: false,
  syncOnBoot: false,
  downloadBookMetadata: true,
  ignoredBooks: [],
  removeParens: false,
  removeParensWhitelist: '',
  removeParensType: 'all',
  removeParensSpaces: true,
  removeParensFromTitle: true,
  removeParensFromAuthor: false,
};

const createSettingsStore = () => {
  const store = writable(DEFAULT_SETTINGS);

  let _plugin!: KindlePlugin;

  // Load settings data from disk into store
  const initialize = async (plugin: KindlePlugin): Promise<void> => {
    const data = Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData()) as Settings;

    const settings: Settings = {
      ...data,
      lastSyncDate: data.lastSyncDate ? new Date(data.lastSyncDate) : undefined,
    };

    store.set(settings);

    _plugin = plugin;
  };

  ee.on('resyncComplete', () => {
    store.update((state) => {
      state.lastSyncDate = new Date();
      return state;
    });
  });

  ee.on('syncSessionStart', (mode) => {
    store.update((state) => {
      state.lastSyncMode = mode;
      state.hasStartedSync = true;
      return state;
    });
  });

  ee.on('syncSessionSuccess', () => {
    store.update((state) => {
      state.lastSyncDate = new Date();
      return state;
    });
  });

  // Listen to any change to store, and write to disk
  store.subscribe((settings) => {
    if (_plugin) {
      // Transform settings fields for serialization
      const data = {
        ...settings,
        lastSyncDate: settings.lastSyncDate ? settings.lastSyncDate.toJSON() : undefined,
      };

      _plugin
        .saveData(data)
        .catch((err) => console.error(`Error saving settings: ${String(err)}`));
    }
  });

  const setHighlightsFolder = (value: string) => {
    store.update((state) => {
      state.highlightsFolder = value;
      return state;
    });
  };

  const login = () => {
    store.update((state) => {
      state.isLoggedIn = true;
      return state;
    });
  };

  const logout = () => {
    store.update((state) => {
      state.isLoggedIn = false;
      return state;
    });
  };

  const setHighlightTemplate = (value: string) => {
    store.update((state) => {
      state.highlightTemplate = value;
      return state;
    });
  };

  const setFileTemplate = (value: string) => {
    store.update((state) => ({ ...state, fileTemplate: value }));
  };

  const setFileNameTemplate = (value: string) => {
    store.update((state) => ({ ...state, fileNameTemplate: value }));
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

  const setAmazonRegion = (value: AmazonAccountRegion) => {
    store.update((state) => {
      state.amazonRegion = value;
      return state;
    });
  };

  const setIgnoredBooks = (value: string[]) => {
    store.update((state) => {
      state.ignoredBooks = value;
      return state;
    });
  };

  const setRemoveParens = (value: boolean) => {
    store.update((state) => {
      state.removeParens = value;
      return state;
    });
  };

  const setRemoveParensWhitelist = (value: string) => {
    store.update((state) => {
      state.removeParensWhitelist = value;
      return state;
    });
  };

  const setRemoveParensType = (value: 'all' | 'chinese' | 'english') => {
    store.update((state) => {
      state.removeParensType = value;
      return state;
    });
  };

  const setRemoveParensSpaces = (value: boolean) => {
    store.update((state) => {
      state.removeParensSpaces = value;
      return state;
    });
  };

  const setRemoveParensFromTitle = (value: boolean) => {
    store.update((state) => {
      state.removeParensFromTitle = value;
      return state;
    });
  };

  const setRemoveParensFromAuthor = (value: boolean) => {
    store.update((state) => {
      state.removeParensFromAuthor = value;
      return state;
    });
  };

  return {
    store,
    subscribe: store.subscribe,
    initialize,
    actions: {
      setHighlightsFolder,
      login,
      logout,
      setFileTemplate,
      setFileNameTemplate,
      setHighlightTemplate,
      setSyncOnBoot,
      setDownloadBookMetadata,
      setAmazonRegion,
      setIgnoredBooks,
      setRemoveParens,
      setRemoveParensWhitelist,
      setRemoveParensType,
      setRemoveParensSpaces,
      setRemoveParensFromTitle,
      setRemoveParensFromAuthor,
    },
  };
};

export const settingsStore = createSettingsStore();
