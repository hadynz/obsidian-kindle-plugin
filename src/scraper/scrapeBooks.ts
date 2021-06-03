import type { Root } from 'cheerio';

import type { Book } from '~/models';
import { loadRemoteDom } from './loadRemoteDom';
import { currentAmazonRegion } from '~/amazonRegion';

export const parseBooks = ($: Root): Book[] => {
  const booksEl = $('.kp-notebook-library-each-book').toArray();

  return booksEl.map(
    (bookEl): Book => {
      return {
        asin: $(bookEl).attr('id') as string,
        title: $('h2.kp-notebook-searchable', bookEl).text()?.trim(),
        author: $('p.kp-notebook-searchable', bookEl)
          .text()
          .replace(/^(By: )/, '')
          ?.trim(),
        url: `https://www.amazon.com/dp/${$(bookEl).attr('id')}`,
        imageUrl: $('.kp-notebook-cover-image', bookEl).attr('src') as string,
        lastAccessedDate: $('[id^="kp-notebook-annotated-date"]', bookEl).val(),
      };
    }
  );
};

const scrapeBooks = async (): Promise<Book[]> => {
  const region = currentAmazonRegion();
  const dom = await loadRemoteDom(region.notebookUrl, 1000);
  return parseBooks(dom);
};

export default scrapeBooks;
