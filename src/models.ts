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
    appLink?: string;
    highlights: {
      text: string;
      location?: string;
      page?: string;
      note?: string;
      appLink?: string;
    }[];
  };

export type SyncMode = 'amazon' | 'my-clippings';

export type SyncJob = {
  status: 'idle' | 'in-progress' | 'done' | 'error' | 'skip';
  book: Book;
  highlightsProcessed: number;
};
