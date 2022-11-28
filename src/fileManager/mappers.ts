import moment from 'moment';
import path from 'path';

import type { Book, KindleFrontmatter } from '~/models';
import type { FileNameRenderer } from '~/rendering/renderer';

/**
 * Returns a file path for a given book relative to the current Obsidian
 * vault directory.
 */
export const bookFilePath = (
  fileNameRenderer: FileNameRenderer,
  highlightsFolder: string,
  book: Book
): string => {
  const fileName = fileNameRenderer.render(book);
  return path.join(highlightsFolder, fileName);
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
