import { Root } from 'cheerio';

import { Book } from './models';

export const parseBooks = ($: Root): Book[] => {
  const booksEl = $('.kp-notebook-library-each-book').toArray();

  return booksEl.map((bookEl) => {
    return {
      asin: $(bookEl).attr('id'),
      title: $('h2.kp-notebook-searchable', bookEl).text(),
      author: $('p.kp-notebook-searchable', bookEl)
        .text()
        .replace(/^(By: )/, ''),
      imageUrl: $('.kp-notebook-cover-image', bookEl).attr('src'),
      lastAccessedDate: $('[id^="kp-notebook-annotated-date"]', bookEl).val(),
    } as Book;
  });
};
