import { writable } from 'svelte/store';

import KindlePlugin from '../index';
import { Book } from '../models';

type Settings = {
  highlightsFolder: string;
  synchedBookAsins: string[];
  lastSyncDate?: string;
  loggedInEmail?: string;
  isLoggedIn: boolean;
  noteTemplate: string;
  syncOnBoot: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  highlightsFolder: '/',
  synchedBookAsins: [],
  isLoggedIn: false,
  noteTemplate: `# {{title}}
* Author: [[{{author}}]]
* Reference: {{url}}

{% for highlight in highlights %}
  - > {{highlight.text}} (location: {{highlight.location}})
{% endfor %}
`,
  syncOnBoot: true,
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

  const setHighlightsFolderLocation = (value: string) => {
    store.update((state) => {
      state.highlightsFolder = value;
      return state;
    });
  };

  const markBookAsSynced = (book: Book) => {
    store.update((state) => {
      state.synchedBookAsins.push(book.asin);
      return state;
    });
  };

  const resetSyncHistory = () => {
    store.update((state) => {
      state.synchedBookAsins = [];
      state.lastSyncDate = undefined;
      return state;
    });
  };

  const setSyncDate = (value: Date) => {
    store.update((state) => {
      state.lastSyncDate = value.toString();
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

  return {
    subscribe: store.subscribe,
    initialise,
    actions: {
      setHighlightsFolder: setHighlightsFolderLocation,
      markBookAsSynced,
      resetSyncHistory,
      setSyncDate,
      login,
      logout,
      setNoteTemplate,
      setSyncOnBoot,
    },
  };
};

export const settingsStore = createSettingsStore();
