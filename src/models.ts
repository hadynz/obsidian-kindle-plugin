export type Book = {
  title: string;
  author: string;
  asin?: string;
  url?: string;
  imageUrl?: string;
  lastAccessedDate?: string;
};

export type Highlight = {
  id?: string;
  text: string;
  location?: string;
  page?: string;
  note?: string;
  color?: 'pink' | 'blue' | 'yellow' | 'orange';
};

export type BookHighlight = {
  book: Book;
  highlights: Highlight[];
  metadata?: BookMetadata;
};

export type BookMetadata = {
  isbn?: string;
  pages: string;
  publication: string;
  publisher: string;
  authorUrl: string;
};

export type RenderTemplate = Book &
  BookMetadata & {
    fullTitle: string;
    appLink?: string;
    highlights: {
      text: string;
      location?: string;
      page?: string;
      note?: string;
      appLink?: string;
      color?: string;
    }[];
  };

export type SyncMode = 'amazon' | 'my-clippings';

export type AmazonAccountRegion = 'global' | 'japan' | 'spain';

export type AmazonAccount = {
  name: string;
  hostname: string;
  kindleReaderUrl: string;
  notebookUrl: string;
};
