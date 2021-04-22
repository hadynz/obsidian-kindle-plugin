import KindlePlugin from '.';

interface PluginSettingsData {
  highlightsFolderLocation: string;
  synchedBookAsins: string[];
  lastSyncDate?: string;
  loggedInEmail?: string;
  isLoggedIn: boolean;
  noteTemplate: string;
  syncOnBoot: boolean;
}

export interface PluginSettings {
  readonly highlightsFolderLocation: string;
  readonly synchedBookAsins: string[];
  readonly lastSyncDate: Date | null;
  readonly loggedInEmail: string;
  readonly isLoggedIn: boolean;
  readonly noteTemplate: string;
  readonly syncOnBoot: boolean;
  setHighlightsFolderLocation: (value: string) => Promise<void>;
  addSynchedBookAsins: (value: string) => Promise<void>;
  resetSyncHistory: () => Promise<void>;
  setSyncDate: (value: Date) => Promise<void>;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  setNoteTemplate: (value: string) => Promise<void>;
  setSyncOnBoot: (value: boolean) => Promise<void>;
}

const DEFAULT_SETTINGS: PluginSettingsData = {
  highlightsFolderLocation: '/',
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
      return settings.lastSyncDate === undefined
        ? null
        : new Date(settings.lastSyncDate);
    },

    get loggedInEmail() {
      return settings.loggedInEmail || '';
    },

    get isLoggedIn() {
      return settings.isLoggedIn;
    },

    get noteTemplate(): string {
      return settings.noteTemplate;
    },

    get syncOnBoot(): boolean {
      return settings.syncOnBoot;
    },

    async setHighlightsFolderLocation(value: string) {
      settings.highlightsFolderLocation = value;
      await saveData();
    },

    async addSynchedBookAsins(value: string) {
      settings.synchedBookAsins.push(value);
      await saveData();
    },

    async resetSyncHistory() {
      settings.synchedBookAsins = [];
      settings.lastSyncDate = undefined;
      await saveData();
    },

    async setSyncDate(value: Date) {
      settings.lastSyncDate = value.toString();
      await saveData();
    },

    async login(email: string) {
      settings.isLoggedIn = true;
      settings.loggedInEmail = email;
      await saveData();
    },

    async logout() {
      settings.isLoggedIn = false;
      await saveData();
    },

    async setNoteTemplate(value: string) {
      settings.noteTemplate = value;
      await saveData();
    },

    async setSyncOnBoot(value: boolean) {
      settings.syncOnBoot = value;
      await saveData();
    },
  };
};
