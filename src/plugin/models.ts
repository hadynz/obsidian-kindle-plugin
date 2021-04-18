export type Credentials = {
  email: string;
  password: string;
};

export interface PluginSettings {
  highlightsFolderLocation: string;
  synchedBookAsins: string[];
  lastSyncDate: Date | null;
}

export type Book = {
  asin: string;
  title: string;
  author: string;
  imageUrl: string;
  lastAccessedDate: string;
};
