import { Book, groupToBooks, readMyClippingsFile } from '@hadynz/kindle-clippings';
import fs from 'fs';
import { get } from 'svelte/store';

import type { BookHighlight, Highlight } from '~/models';
import { settingsStore } from '~/store';
import { hash } from '~/utils';

/**
 * Restore line breaks in Chinese text.
 *
 * Kindle strips original line breaks and replaces them with spaces.
 * In Chinese text, a space after sentence-ending punctuation is a strong
 * signal of an original line break, since Chinese text normally has no
 * spaces between sentences.
 */
export const restoreChineseLineBreaks = (text: string): string => {
  // Match Chinese sentence-ending punctuation followed by a space
  // Punctuation: 。！？…」』）】
  return text.replace(/([。！？…」』）】])\s/g, '$1\n');
};

const toBookHighlight = (book: Book, shouldRestoreLineBreaks: boolean): BookHighlight => {
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
          text: shouldRestoreLineBreaks
            ? restoreChineseLineBreaks(entry.content)
            : entry.content,
          note: entry.note,
          location: entry.location?.display,
          page: entry.page?.display,
          createdDate: entry.createdDate,
        })
      ),
  };
};

export const parseBooks = (file: string): BookHighlight[] => {
  const clippingsFileContent = fs.readFileSync(file, 'utf8');

  const parsedRows = readMyClippingsFile(clippingsFileContent);
  const books = groupToBooks(parsedRows);

  const shouldRestoreLineBreaks = get(settingsStore).restoreChineseLineBreaks;

  return books.map((book) => toBookHighlight(book, shouldRestoreLineBreaks));
};
