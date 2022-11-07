import { writable } from 'svelte/store';

import type KindlePlugin from '~/.';
import { ee } from '~/eventEmitter';
import type { AmazonAccountRegion, SyncMode } from '~/models';

type Settings = {
  amazonRegion: AmazonAccountRegion;
  highlightsFolder: string;
  lastSyncDate?: Date;
  lastSyncMode: SyncMode;
  isLoggedIn: boolean;
  fileTemplate?: string;
  highlightTemplate?: string;
  fileNameTemplate?: string;
  syncOnBoot: boolean;
  downloadBookMetadata: boolean;

  // Deprecated - delete eventually
  noteTemplate?: string;
  history?: string;
};

const DEFAULT_SETTINGS: Settings = {
  amazonRegion: 'global',
  highlightsFolder: '/',
  lastSyncMode: 'amazon',
  isLoggedIn: false,
  syncOnBoot: false,
  downloadBookMetadata: true,
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

  const isLegacy = async () => {
    const data = Object.assign({}, DEFAULT_SETTINGS, await _plugin.loadData()) as Settings;
    return data.history != null;
  };

  const upgradeStoreState = async () => {
    const data = Object.assign({}, DEFAULT_SETTINGS, await _plugin.loadData()) as Settings;

    // Remove deprecated settings field
    delete data.noteTemplate;
    delete data.history;

    await _plugin.saveData(data);
  };

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

  return {
    store,
    subscribe: store.subscribe,
    initialize,
    isLegacy,
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
      upgradeStoreState,
    },
  };
};

export const settingsStore = createSettingsStore();
