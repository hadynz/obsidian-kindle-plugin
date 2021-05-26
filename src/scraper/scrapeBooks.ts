import type { Root } from 'cheerio';

import type { Book } from '../models';
import { loadRemoteDom } from './loadRemoteDom';

export const parseBooks = ($: Root): Book[] => {
  const booksEl = $('.kp-notebook-library-each-book').toArray();

  return booksEl.map(
    (bookEl): Book => {
      return {
        asin: $(bookEl).attr('id') as string,
        title: $('h2.kp-notebook-searchable', bookEl).text(),
        author: $('p.kp-notebook-searchable', bookEl)
          .text()
          .replace(/^(By: )/, ''),
        url: `https://www.amazon.com/dp/${$(bookEl).attr('id')}`, // Can be scraped
        imageUrl: $('.kp-notebook-cover-image', bookEl).attr('src') as string,
        lastAccessedDate: $('[id^="kp-notebook-annotated-date"]', bookEl).val(),
      };
    }
  );
};

const scrapeBooks = async (): Promise<Book[]> => {
  const dom = await loadRemoteDom('https://read.amazon.com/notebook', 1000);
  return parseBooks(dom);
};

export default scrapeBooks;
