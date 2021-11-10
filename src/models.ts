import type { TFile } from 'obsidian';

export type Book = {
  id: string;
  title: string;
  author: string;
  asin?: string;
  url?: string;
  imageUrl?: string;
  lastAnnotatedDate?: Date;
};

export type Highlight = {
  id: string;
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
    highlights: string;
  };

export type SyncMode = 'amazon' | 'my-clippings';

export type AmazonAccountRegion = 'global' | 'india' | 'japan' | 'spain' | 'germany';

export type AmazonAccount = {
  name: string;
  hostname: string;
  kindleReaderUrl: string;
  notebookUrl: string;
};

export type KindleFrontmatter = {
  bookId: string;
  title: string;
  author: string;
  asin: string;
  lastAnnotatedDate: string;
  bookImageUrl: string;
  highlightsCount: number;
};

export type KindleFile = {
  file: TFile;
  frontmatter: KindleFrontmatter;
  book?: Book;
};
