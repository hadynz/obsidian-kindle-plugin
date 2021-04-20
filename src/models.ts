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
  page: number;
};
