import fs from 'fs';
import { readMyClippingsFile, groupToBooks, Book } from '@hadynz/kindle-clippings';

import { hash } from '~/utils';
import type { BookHighlight, Highlight } from '~/models';

const toBookHighlight = (book: Book): BookHighlight => {
  return {
    book: {
      id: hash(book.title),
      title: book.title,
      author: book.author,
    },
    highlights: book.annotations
      .filter((entry) => entry.type === 'HIGHLIGHT' || entry.type === 'UNKNOWN')
      .map(
        (entry): Highlight => ({
          id: hash(entry.content),
          text: entry.content,
          note: entry.note,
          location: entry.location?.display,
          page: entry.page?.display,
        })
      ),
  };
};

export const parseBooks = async (file: string): Promise<BookHighlight[]> => {
  const clippingsFileContent = fs.readFileSync(file, 'utf8');

  const parsedRows = readMyClippingsFile(clippingsFileContent);
  const books = groupToBooks(parsedRows);

  return books.map(toBookHighlight);
};
