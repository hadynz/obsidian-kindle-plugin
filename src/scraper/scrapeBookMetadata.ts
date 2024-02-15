import type { Root } from 'cheerio';

import { currentAmazonRegion } from '~/amazonRegion';
import type { Book, BookMetadata } from '~/models';

import { loadRemoteDom } from './loadRemoteDom';

type AmazonDetailsList = {
  [key: string]: string;
};

type PopoverData = {
  inlineContent: string;
};

const parseDetailsList = ($: Root): Omit<BookMetadata, 'authorUrl'> => {
  const detailsListEl = $(
    '#detailBullets_feature_div .detail-bullet-list:first-child li span.a-list-item'
  ).toArray();

  const result: AmazonDetailsList = detailsListEl.reduce((accumulator, currentEl) => {
    const key = $('span:first-child', currentEl)
      .text()
      .replace(/[\n\r]+/g, '')
      .replace(':', '')
      .replace(/[^\w\s]/gi, ''); // Strip all chars except alpha numeric and spaces

    const value = $('span:nth-child(2)', currentEl).text();

    return { ...accumulator, [key]: value };
  }, {});

  return {
    isbn: result['Page numbers source ISBN'],
    pages: result['Print length'],
    publicationDate: result['Publication date'],
    publisher: result['Publisher'],
  };
};

const parseIsbn = ($: Root): string | null => {
  // Attempt 1 - Try and fetch isbn from product information popover
  const popoverData = $(
    '#rich_product_information ol.a-carousel span[data-action=a-popover]'
  ).data('a-popover') as PopoverData;

  const isbnMatches = popoverData?.inlineContent.match(/(?<=\bISBN\s)(\w+)/g);

  if (isbnMatches) {
    return isbnMatches[0];
  }

  // Attempt 2 - Look for ISBN feature on page
  const isbnFeature = $('#printEditionIsbn_feature_div .a-row:first-child span:nth-child(2)')
    ?.text()
    .trim();

  return isbnFeature;
};

const parseAuthorUrl = ($: Root): string | null => {
  const region = currentAmazonRegion();
  const domainURL = `https://${region.hostname}`;
  const href = $('a.a-size-base.a-link-normal.a-text-normal').attr('href');
  return href ? `${domainURL}/${href}` : domainURL;
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
  const region = currentAmazonRegion();
  const domainURL = `https://${region.hostname}`;
  const { dom } = await loadRemoteDom(`${domainURL}/dp/${book.asin}`, 1000);

  return parseBookMetadata(dom);
};

export default scrapeBookMetadata;
