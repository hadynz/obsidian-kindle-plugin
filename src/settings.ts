import KindlePlugin from '.';

interface PluginSettingsData {
  highlightsFolderLocation: string;
  synchedBookAsins: string[];
  lastSyncDate: string | null;
  isLoggedIn: boolean;
  noteTemplate: string;
}

export interface PluginSettings {
  readonly highlightsFolderLocation: string;
  readonly synchedBookAsins: string[];
  readonly lastSyncDate: Date | null;
  readonly isLoggedIn: boolean;
  readonly noteTemplate: string;
  setHighlightsFolderLocation: (value: string) => Promise<void>;
  addSynchedBookAsins: (value: string) => Promise<void>;
  setSyncDate: (value: Date) => Promise<void>;
  setIsLoggedIn: (value: boolean) => Promise<void>;
  setNoteTemplate: (value: string) => Promise<void>;
}

const DEFAULT_SETTINGS: PluginSettingsData = {
  highlightsFolderLocation: '/',
  synchedBookAsins: [],
  lastSyncDate: null,
  isLoggedIn: false,
  noteTemplate: `# {{title}}
* By [[{{author}}]]

{% for highlight in highlights %}
  - > {{highlight.text}} (location: {{highlight.location}})
{% endfor %}
`,
};

const loadSettings = (data: any): PluginSettingsData => {
  return Object.assign({}, DEFAULT_SETTINGS, data);
};

export default (plugin: KindlePlugin, data: any): PluginSettings => {
  const settings = loadSettings(data);

  const saveData = async () => {
    await plugin.saveData(settings);
  };

  return {
    get highlightsFolderLocation(): string {
      return settings.highlightsFolderLocation;
    },

    get synchedBookAsins(): string[] {
      return settings.synchedBookAsins;
    },

    get lastSyncDate() {
      return settings.lastSyncDate === null
        ? null
        : new Date(settings.lastSyncDate);
    },

    get isLoggedIn() {
      return settings.isLoggedIn;
    },

    get noteTemplate(): string {
      return settings.noteTemplate;
    },

    async setHighlightsFolderLocation(value: string) {
      settings.highlightsFolderLocation = value;
      await saveData();
    },

    async addSynchedBookAsins(value: string) {
      settings.synchedBookAsins.push(value);
      await saveData();
    },

    async setSyncDate(value: Date) {
      settings.lastSyncDate = value.toString();
      await saveData();
    },

    async setIsLoggedIn(value: boolean) {
      settings.isLoggedIn = value;
      await saveData();
    },

    async setNoteTemplate(value: string) {
      settings.noteTemplate = value;
      await saveData();
    },
  };
};
