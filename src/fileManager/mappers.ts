import moment from 'moment';
import path from 'path';
import { get } from 'svelte/store';

import type { Book, KindleFrontmatter } from '~/models';
import { getRenderers } from '~/rendering';
import { settingsStore } from '~/store';

/**
 * Returns a file path for a given book relative to the current Obsidian
 * vault directory.
 */
export const bookFilePath = (book: Book): string => {
  const fileName = getRenderers().fileNameRenderer.render(book);
  return path.join(get(settingsStore).highlightsFolder, fileName);
};

export const bookToFrontMatter = (book: Book, highlightsCount: number): KindleFrontmatter => {
  return {
    bookId: book.id,
    title: book.title,
    author: book.author,
    asin: book.asin,
    lastAnnotatedDate: book.lastAnnotatedDate
      ? moment(book.lastAnnotatedDate).format('YYYY-MM-DD')
      : null,
    bookImageUrl: book.imageUrl,
    highlightsCount,
  };
};

export const frontMatterToBook = (frontmatter: KindleFrontmatter): Book => {
  const formats = ['MMM DD, YYYY', 'YYYY-MM-DD'];
  return {
    id: frontmatter.bookId,
    title: frontmatter.title,
    author: frontmatter.author,
    asin: frontmatter.asin,
    lastAnnotatedDate: frontmatter.lastAnnotatedDate
      ? moment(frontmatter.lastAnnotatedDate, formats).toDate()
      : null,
    imageUrl: frontmatter.bookImageUrl,
  };
};
