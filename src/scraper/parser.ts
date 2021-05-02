import type { Root } from 'cheerio';

import type { Book, Highlight } from '../models';

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
        url: `https://www.amazon.com/dp/${$(bookEl).attr('id')}`,
        imageUrl: $('.kp-notebook-cover-image', bookEl).attr('src') as string,
        lastAccessedDate: $('[id^="kp-notebook-annotated-date"]', bookEl).val(),
      };
    }
  );
};

export const parseHighlights = ($: Root): Highlight[] => {
  const highlightsEl = $(
    '#kp-notebook-annotations .a-row.a-spacing-base'
  ).toArray();

  return highlightsEl.map(
    (highlightEl): Highlight => {
      const pageMatch = $('#annotationNoteHeader', highlightEl)
        .text()
        ?.match(/\d+$/);

      return {
        id: $(highlightEl).attr('id') as string,
        text: $('#highlight', highlightEl).text(),
        location: $('#kp-annotation-location', highlightEl).val(),
        page: pageMatch ? pageMatch[0] : null,
        note: $('#note', highlightEl).text(),
      };
    }
  );
};

export const parseSignoutLink = ($: Root): string => {
  const signoutLinkEl = $('#kp-notebook-head tr:last-child a').attr('href');

  if (signoutLinkEl) {
    return signoutLinkEl;
  }

  throw new Error('Could not parse logout link');
};
