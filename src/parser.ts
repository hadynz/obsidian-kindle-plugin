import { Root } from 'cheerio';

import { Book, Highlight } from './models';

export const parseBooks = ($: Root): Book[] => {
  const booksEl = $('.kp-notebook-library-each-book').toArray();

  return booksEl.map((bookEl) => {
    return {
      asin: $(bookEl).attr('id'),
      title: $('h2.kp-notebook-searchable', bookEl).text(),
      author: $('p.kp-notebook-searchable', bookEl)
        .text()
        .replace(/^(By: )/, ''),
      imageUrl: $('.kp-notebook-cover-image', bookEl).attr('src'),
      lastAccessedDate: $('[id^="kp-notebook-annotated-date"]', bookEl).val(),
    } as Book;
  });
};

export const parseHighlights = ($: Root): Highlight[] => {
  const highlightsEl = $(
    '#kp-notebook-annotations .a-row.a-spacing-base',
  ).toArray();

  return highlightsEl.map((highlightEl) => {
    const highlight = {
      id: $(highlightEl).attr('id'),
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
      pageLocation: Number(highlight.pageLocationString![0]),
    } as Highlight;
  });
};
