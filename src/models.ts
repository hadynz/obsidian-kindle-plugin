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
};
