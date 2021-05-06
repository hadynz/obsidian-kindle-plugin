import type { Root } from 'cheerio';

import type { Book, BookMetadata } from '../models';
import { loadRemoteDom } from './loadRemoteDom';

const parseDetailsList = ($: Root): Omit<BookMetadata, 'authorUrl'> => {
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

const parseIsbn = ($: Root): string | null => {
  const popoverData = $(
    '#rich_product_information ol.a-carousel li:first-child span[data-action=a-popover]'
  ).data('a-popover');

  const isbnMatches = popoverData.inlineContent.match(/(?<=\bISBN\s)(\w+)/g);

  if (isbnMatches) {
    return isbnMatches[0];
  }

  return null;
};

const parseAuthorUrl = ($: Root): string | null => {
  const href = $('.contributorNameID').attr('href');
  return `https://www.amazon.com${href}`;
};

export const parseBookMetadata = ($: Root): BookMetadata => {
  const metadata = parseDetailsList($);

  return {
    ...metadata,
    ...(metadata.isbn === undefined ? { isbn: parseIsbn($) } : {}),
    authorUrl: parseAuthorUrl($),
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
