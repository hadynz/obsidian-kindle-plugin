import _ from 'lodash';

import type { Highlight, PreRenderedHighlight } from '~/models';

const clippingType = (note: string): PreRenderedHighlight['type'] => {
  switch (note) {
    case '.h1':
      return 'heading1';
    case '.h2':
      return 'heading2';
    case '.h3':
      return 'heading3';
    case '.h4':
      return 'heading4';
    default:
      return 'clipping';
  }
};

const mergeClippings = (highlights: Highlight[]): Highlight[] => {
  if (highlights.length === 0) {
    return [];
  }

  const text = highlights
    .map((highlight) => {
      return highlights.length > 1 ? highlight.text.replace(/\.$/, '') : highlight.text;
    })
    .map((text, index) => {
      return index > 0 ? _.lowerFirst(text) : text;
    })
    .join('... ');

  const note = highlights
    .map((highlight) => {
      const data = noteConcatCount(highlight);
      return data == null ? highlight.note : data.text;
    })
    .filter((h) => h != null)
    .join('\n\n')
    .trim();

  return [{ ...highlights[highlights.length - 1], text, note: note === '' ? null : note }];
};

type ConcatenatedNote = {
  index: number;
  text: string;
};

const noteConcatCount = (highlight: Highlight | null): ConcatenatedNote => {
  const matches = /^\s*\.c(\d+)\s*(.*?)\s*$/.exec(highlight?.note?.trim());

  if (matches) {
    return {
      index: +matches[1],
      text: matches[2],
    };
  }

  return null;
};

export const mapToPreRenderedHighlights = (highlight: Highlight): PreRenderedHighlight => {
  return {
    ...highlight,
    type: clippingType(highlight.note),
    note: highlight.note != null ? highlight.note.trim() : null,
  };
};

export const preRenderHighlights = (entry: Highlight[]): PreRenderedHighlight[] => {
  let clippingsCache: Highlight[] = [];

  const concatenatedClips = entry.reduce(
    (accum, currentHighlight: Highlight, index: number) => {
      const currentConcatCount = noteConcatCount(currentHighlight);
      const previousConcatCount = noteConcatCount(clippingsCache[clippingsCache.length - 1]);

      // Current highlight doesn't have a special concat notation in note
      if (currentConcatCount == null) {
        accum = accum.concat(mergeClippings(clippingsCache)); // Flush anything in cache
        clippingsCache = []; // Reset cache

        accum.push(currentHighlight); // Add current highlight
      }

      // Current highlight is an increment over previous; add to cache
      if (
        currentConcatCount?.index > previousConcatCount?.index ||
        (currentConcatCount != null && previousConcatCount == null)
      ) {
        clippingsCache.push(currentHighlight);
      } else if (clippingsCache.length > 0) {
        accum = accum.concat(mergeClippings(clippingsCache)); // Flush anything in cache
        clippingsCache = []; // Reset cache

        clippingsCache.push(currentHighlight);
      }

      // No more clippings? Then flush!
      if (index === entry.length - 1) {
        accum = accum.concat(mergeClippings(clippingsCache)); // Flush anything in cache
        clippingsCache = []; // Reset cache
      }

      return accum;
    },
    [] as Highlight[]
  );

  return concatenatedClips.map(mapToPreRenderedHighlights);
};
