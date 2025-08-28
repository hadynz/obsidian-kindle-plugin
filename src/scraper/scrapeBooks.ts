import type { Root } from 'cheerio';
import moment from 'moment';
import { get } from 'svelte/store';

import { currentAmazonRegion } from '~/amazonRegion';
import type { AmazonAccountRegion, Book } from '~/models';
import { settingsStore } from '~/store';
import { hash } from '~/utils';

import { loadRemoteDom } from './loadRemoteDom';

/**
 * Amazon dates in the Kindle notebook looks like "Sunday October 24, 2021"
 * This method will parse this string and return a valid Date object
 */
export const parseToDateString = (kindleDate: string, region: AmazonAccountRegion): Date => {
  switch (region) {
    case 'japan': {
      const amazonDateString = kindleDate.substring(0, kindleDate.indexOf(' '));
      return moment(amazonDateString, 'YYYY MM DD', 'ja').toDate();
    }
    case 'france': {
      return moment(kindleDate, 'MMMM D, YYYY', 'fr').toDate();
    }
    default: {
      const amazonDateString = kindleDate.substr(kindleDate.indexOf(' ') + 1);
      return moment(amazonDateString, 'MMM DD, YYYY').toDate();
    }
  }
};

export const parseAuthor = (scrapedAuthor: string): string => {
  return scrapedAuthor.replace(/.*: /, '')?.trim();
};

export const parseBooks = ($: Root): Book[] => {
  const booksEl = $('#kp-notebook-library > div[data-asin]').toArray();

  return booksEl.map((bookEl): Book => {
    const title = $('h2.a-spacing-top-small', bookEl).text()?.trim();
    const scrapedAuthor = $('p.a-spacing-top-small', bookEl).text()?.trim();
    const scrapedLastAnnotatedDate = $(
      '#kp-notebook-annotated-date',
      bookEl
    )
      .text()
      ?.trim();

    const asin = $(bookEl).attr('data-asin');

    return {
      id: hash(title),
      asin,
      title,
      author: parseAuthor(scrapedAuthor),
      url: `https://www.amazon.com/dp/${asin}`,
      imageUrl: $('.kp-notebook-cover-image', bookEl).attr('src'),
      lastAnnotatedDate: parseToDateString(
        scrapedLastAnnotatedDate,
        get(settingsStore).amazonRegion
      ),
    };
  });
};

export const scrapeBooks = async (): Promise<Book[]> => {
  const region = currentAmazonRegion();
  const { dom } = await loadRemoteDom(region.notebookUrl, 1000);
  return parseBooks(dom);
};