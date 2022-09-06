import moment from 'moment';

import type { Book, BookHighlight, Highlight } from '~/models';
import { parseAuthors, shortenTitle } from '~/utils';

import { generateAppLink } from './utils';

export type AuthorsTemplateVariables = {
  author: string;
  authorsLastNames: string;
  firstAuthorFirstName?: string;
  firstAuthorLastName: string;
  secondAuthorFirstName?: string;
  secondAuthorLastName?: string;
};

type CommonTemplateVariables = AuthorsTemplateVariables & {
  title: string;
  longTitle: string;
};

type FileNameTemplateVariables = CommonTemplateVariables & {
  shortTitle: string; // TODO: Eventually deprecate
};

type FileTemplateVariables = CommonTemplateVariables & {
  asin?: string;
  url?: string;
  imageUrl?: string;
  lastAnnotatedDate?: string;
  appLink?: string;
  isbn?: string;
  pages: string;
  publicationDate: string;
  publisher: string;
  authorUrl: string;
  highlightsCount: number;
  highlights: string;
};

type HighlightTemplateVariables = CommonTemplateVariables & {
  id: string;
  text: string;
  location?: string;
  page?: string;
  note?: string;
  color?: 'pink' | 'blue' | 'yellow' | 'orange';
  createdDate?: Date;
  appLink?: string;
};

export const authorsTemplateVariables = (author: string): AuthorsTemplateVariables => {
  const authors = parseAuthors(author);

  let authorsLastNames = authors[0].lastName;

  if (authors.length == 2) {
    authorsLastNames += `-${authors[1].lastName}`;
  } else if (authors.length > 2) {
    authorsLastNames += `_et_al`;
  }

  return {
    author: author,
    authorsLastNames,
    firstAuthorFirstName: authors[0].firstName,
    firstAuthorLastName: authors[0].lastName,
    secondAuthorFirstName: authors[1]?.firstName,
    secondAuthorLastName: authors[1]?.lastName,
  };
};

export const commonTemplateVariables = (book: Partial<Book>): FileNameTemplateVariables => {
  return {
    title: shortenTitle(book.title),
    shortTitle: shortenTitle(book.title),
    longTitle: book.title,
    ...authorsTemplateVariables(book.author),
  };
};

export const fileNameTemplateVariables = (book: Partial<Book>): FileNameTemplateVariables => {
  return commonTemplateVariables(book);
};

export const highlightTemplateVariables = (
  highlight: Highlight,
  book: Book
): HighlightTemplateVariables => {
  return {
    ...highlight,
    ...commonTemplateVariables(book),
    appLink: generateAppLink(book.asin, highlight),
  };
};

export const fileTemplateVariables = (
  entry: BookHighlight,
  renderedHighlights: string
): FileTemplateVariables => {
  const { book, highlights, metadata } = entry;

  return {
    ...commonTemplateVariables(book),
    asin: book.asin,
    url: book.url,
    imageUrl: book.imageUrl,
    lastAnnotatedDate: book.lastAnnotatedDate
      ? moment(book.lastAnnotatedDate).format('YYYY-MM-DD').toString()
      : undefined,
    appLink: generateAppLink(book.asin),
    isbn: metadata?.isbn,
    pages: metadata?.pages,
    publicationDate: metadata?.publicationDate,
    publisher: metadata?.publisher,
    authorUrl: metadata?.authorUrl,
    highlightsCount: highlights.length,
    highlights: renderedHighlights,
  };
};
