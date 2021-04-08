export type Credentials = {
  username: string;
  password: string;
};

export interface PluginSettings {
  goodreadsCredentials: Credentials;
  highlightsFolderLocation: string;
  synchedBookAsins: string[];
  lastSyncDate: Date | null;
}
