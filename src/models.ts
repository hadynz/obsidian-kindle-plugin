import type { TFile } from 'obsidian';

export type Book = {
  id: string;
  title: string;
  author: string;
  asin?: string;
  url?: string;
  imageUrl?: string;
  lastAnnotatedDate?: Date;
  /**
   * When the plugin itself last checked this book's highlights. Plugin-owned bookkeeping (not
   * something Amazon provides) - used to decide whether Amazon's own "last accessed" date
   * reflects new activity since we last looked, without being fooled by the fact that checking
   * a book is itself an access.
   */
  lastChecked?: Date;
};

export type Highlight = {
  id: string;
  text: string;
  location?: string;
  page?: string;
  note?: string;
  color?: 'pink' | 'blue' | 'yellow' | 'orange';
  createdDate?: Date;
};

export type BookHighlight = {
  book: Book;
  highlights: Highlight[];
  metadata?: BookMetadata;
};

export type BookMetadata = {
  isbn?: string;
  pages?: string;
  publicationDate?: string;
  publisher?: string;
  authorUrl?: string;
};

export type SyncMode = 'amazon' | 'my-clippings';

export type AmazonAccountRegion =
  | 'global'
  | 'india'
  | 'japan'
  | 'spain'
  | 'germany'
  | 'italy'
  | 'UK'
  | 'france'
  | 'netherlands'
  | 'canada';

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
  lastAnnotatedDate?: string; // Not set for My Clipping annotations
  lastChecked?: string;
  bookImageUrl: string;
  highlightsCount: number;
};

export type KindleFile = {
  file: TFile;
  frontmatter: KindleFrontmatter;
  book?: Book;
};
