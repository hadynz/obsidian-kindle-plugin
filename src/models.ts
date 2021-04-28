export type Book = {
  asin: string;
  title: string;
  author: string;
  url: string;
  imageUrl: string;
  lastAccessedDate: string;
};

export type Highlight = {
  id: string;
  text: string;
  location: string;
  page: string;
  note?: string;
};
