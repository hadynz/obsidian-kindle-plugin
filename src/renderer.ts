import nunjucks from 'nunjucks';
import { get } from 'svelte/store';

import { settingsStore } from './store';
import type { BookHighlight } from './models';

type RenderTemplate = {
  title: string;
  author?: string;
  asin?: string;
  url?: string;
  imageUrl?: string;
  appLink?: string;
  highlights: {
    text: string;
    location?: string;
    page?: string;
    note?: string;
    appLink?: string;
  }[];
};

export class Renderer {
  constructor() {
    nunjucks.configure({ autoescape: false });
  }

  render(entry: BookHighlight): string {
    const { book, highlights } = entry;

    const context: RenderTemplate = {
      title: book.title,
      author: book.author,
      asin: book.asin,
      url: book.url,
      imageUrl: book.imageUrl,
      ...(book.asin
        ? { appLink: `kindle://book?action=open&asin=${book.asin}` }
        : {}),
      highlights: highlights.map((h) => ({
        text: h.text,
        location: h.location,
        page: h.page,
        note: h.note,
        ...(book.asin
          ? {
              appLink: `kindle://book?action=open&asin=${book.asin}&location=${h.location}`,
            }
          : {}),
      })),
    };

    const content = nunjucks.renderString(
      get(settingsStore).noteTemplate,
      context,
    );

    return content;
  }
}
