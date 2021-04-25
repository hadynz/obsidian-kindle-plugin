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
  location: number;
  page: number;
};

export type BookHighlight = {
  book: Book;
  highlights: Highlight[];
};
