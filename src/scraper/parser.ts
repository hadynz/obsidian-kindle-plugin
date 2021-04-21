import { Root } from 'cheerio';

import { Book, Highlight } from '../models';

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
    },
  );
};

export const parseHighlights = ($: Root): Highlight[] => {
  const highlightsEl = $(
    '#kp-notebook-annotations .a-row.a-spacing-base',
  ).toArray();

  return highlightsEl.map(
    (highlightEl): Highlight => {
      const highlight = {
        id: $(highlightEl).attr('id') as string,
        text: $('#highlight', highlightEl).text(),
        locationString: $('#kp-annotation-location', highlightEl).val(),
        pageLocationString: $('#annotationNoteHeader', highlightEl)
          .text()
          ?.match(/\d+$/),
      };

      return {
        id: highlight.id,
        text: highlight.text,
        location: Number(highlight.locationString),
        page: Number(highlight.pageLocationString![0]),
      };
    },
  );
};

export const parseSignoutLink = ($: Root): string => {
  const signoutLinkEl = $('#kp-notebook-head tr:last-child a').attr('href');

  if (signoutLinkEl) {
    return signoutLinkEl;
  }

  throw new Error('Could not parse logout link');
};
