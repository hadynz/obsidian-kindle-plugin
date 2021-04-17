export type Credentials = {
  email: string;
  password: string;
};

export interface PluginSettings {
  highlightsFolderLocation: string;
  synchedBookAsins: string[];
  lastSyncDate: Date | null;
}
