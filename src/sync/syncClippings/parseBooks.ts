import fs from 'fs';
import * as kc from '@hadynz/kindle-clippings';

import { hash } from '~/utils';
import type { BookHighlight, Highlight } from '~/models';

const toBookHighlight = (book: kc.Book): BookHighlight => {
  return {
    book: {
      title: book.title,
      author: book.author,
    },
    highlights: book.entries
      .filter((entry) => entry.type === 'HIGHLIGHT' || entry.type === 'UNKNOWN')
      .map(
        (entry): Highlight => ({
          id: hash(entry.content),
          text: entry.content,
          note: entry.note,
          location: entry.location,
          page: entry.page,
        })
      ),
  };
};

export const parseBooks = async (file: string): Promise<BookHighlight[]> => {
  const clippingsFileContent = fs.readFileSync(file, 'utf8');

  const rawRows = kc.readKindleClipping(clippingsFileContent);
  const parsedRows = kc.parseKindleEntries(rawRows);
  const books = kc.organizeKindleEntriesByBooks(parsedRows);

  return books.map(toBookHighlight);
};
