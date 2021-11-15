import path from 'path';
import moment from 'moment';
import { get } from 'svelte/store';

import { settingsStore } from '~/store';
import { fileNameRenderer } from '~/fileNameRenderer';
import type { Book, KindleFrontmatter } from '~/models';

/**
 * Returns a file path for a given book relative to the current Obsidian
 * vault directory.
 */
export const bookFilePath = (book: Book): string => {
  const fileName = fileNameRenderer.render(book);
  return path.join(get(settingsStore).highlightsFolder, `${fileName}.md`);
};

export const bookToFrontMatter = (book: Book, highlightsCount: number): KindleFrontmatter => {
  return {
    bookId: book.id,
    title: book.title,
    author: book.author,
    asin: book.asin,
    lastAnnotatedDate: moment(book.lastAnnotatedDate).format('YYYY-MM-DD'),
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
    lastAnnotatedDate: moment(frontmatter.lastAnnotatedDate, formats).toDate(),
    imageUrl: frontmatter.bookImageUrl,
  };
};
