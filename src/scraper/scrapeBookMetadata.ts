import type { Root } from 'cheerio';

import type { Book, BookMetadata } from '../models';
import { loadRemoteDom } from './loadRemoteDom';

export const parseBookMetadata = ($: Root): BookMetadata => {
  const detailsListEl = $(
    '#detailBullets_feature_div .detail-bullet-list:first-child li span.a-list-item'
  ).toArray();

  const result = detailsListEl.reduce((accumulator, currentEl) => {
    const key = $('span:first-child', currentEl)
      .text()
      .replace(/[\n\r]+/g, '')
      .replace(':', '');

    const value = $('span:nth-child(2)', currentEl).text();

    return { ...accumulator, [key]: value };
  }, {});

  return {
    isbn: result['Page numbers source ISBN'],
    pages: result['Print length'],
    publication: result['Publication date'],
    publisher: result['Publisher'],
  };
};

const scrapeBookMetadata = async (book: Book): Promise<BookMetadata> => {
  const dom = await loadRemoteDom(
    `https://www.amazon.com/dp/${book.asin}`,
    1000
  );

  return parseBookMetadata(dom);
};

export default scrapeBookMetadata;
