import type { Root } from 'cheerio';

import type { Book } from '~/models';
import { loadRemoteDom } from './loadRemoteDom';
import { currentAmazonRegion } from '~/amazonRegion';
import { hash } from '~/utils';

/**
 * Amazon dates in the Kindle notebook looks like "Sunday October 24, 2021"
 * This method will parse this string and return a valid Date object
 */
const parseToDateString = (kindleDate: string): string => {
  return kindleDate.substr(kindleDate.indexOf(' ') + 1);
};

export const parseBooks = ($: Root): Book[] => {
  const booksEl = $('.kp-notebook-library-each-book').toArray();

  return booksEl.map((bookEl): Book => {
    const title = $('h2.kp-notebook-searchable', bookEl).text()?.trim();

    const lastAnnotatedDate = $(
      '[id^="kp-notebook-annotated-date"]',
      bookEl
    ).val();

    return {
      id: hash(title),
      asin: $(bookEl).attr('id') as string,
      title,
      author: $('p.kp-notebook-searchable', bookEl)
        .text()
        .replace(/^(By: )/, '')
        ?.trim(),
      url: `https://www.amazon.com/dp/${$(bookEl).attr('id')}`,
      imageUrl: $('.kp-notebook-cover-image', bookEl).attr('src') as string,
      lastAnnotatedDate: parseToDateString(lastAnnotatedDate),
    };
  });
};

const scrapeBooks = async (): Promise<Book[]> => {
  const region = currentAmazonRegion();
  const dom = await loadRemoteDom(region.notebookUrl, 1000);
  return parseBooks(dom);
};

export default scrapeBooks;
