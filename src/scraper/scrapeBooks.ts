import type { Root } from 'cheerio';
import moment from 'moment';
import { get } from 'svelte/store';

import { currentAmazonRegion } from '~/amazonRegion';
import { ee } from '~/eventEmitter';
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

export const parseImageUrl = (scrapedImageUrl: string): string => {
  return scrapedImageUrl.replace(/\._SY\d+\./, '._SX1024.')?.trim();
};

export const parseBooks = ($: Root): Book[] => {
  const region = currentAmazonRegion();
  const domainURL = `https://${region.hostname}`;
  const booksEl = $('.kp-notebook-library-each-book').toArray();

  return booksEl.map((bookEl): Book => {
    const title = $('h2.kp-notebook-searchable', bookEl).text()?.trim();

    const scrapedLastAnnotatedDate = $('[id^="kp-notebook-annotated-date"]', bookEl).val();
    const scrapedAuthor = $('p.kp-notebook-searchable', bookEl).text();
    const scrapedImageUrl = $('.kp-notebook-cover-image', bookEl).attr('src');

    return {
      id: hash(title),
      asin: $(bookEl).attr('id'),
      title,
      author: parseAuthor(scrapedAuthor),
      url: `${domainURL}/dp/${$(bookEl).attr('id')}`,
      imageUrl: parseImageUrl(scrapedImageUrl),
      lastAnnotatedDate: parseToDateString(
        scrapedLastAnnotatedDate,
        get(settingsStore).amazonRegion
      ),
    };
  });
};

// Amazon's Kindle notebook page lazily renders books into the DOM as the page is scrolled,
// so a single unscrolled read only ever sees the first batch (regardless of library size).
const NotebookBookSelector = '.kp-notebook-library-each-book';

const scrapeBooks = async (): Promise<Book[]> => {
  const region = currentAmazonRegion();
  ee.emit('syncLog', `Loading Kindle notebook from ${region.hostname}…`);
  const { dom } = await loadRemoteDom(region.notebookUrl, 0, {
    scrollToLoadAll: {
      itemSelector: NotebookBookSelector,
      // Large libraries (hundreds+ of books) need more, and slower-loading, scrolls than the
      // defaults tuned for a typical page
      scrollDelayMs: 1500,
      maxIterations: 150,
      stableIterations: 3,
    },
  });
  const books = parseBooks(dom);

  ee.emit('syncLog', `Found ${books.length} book(s) in Kindle notebook`);

  return books;
};

export default scrapeBooks;
