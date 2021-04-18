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

export type Highlight = {
  id: string;
  text: string;
  location: number;
  pageLocation: number;
};
