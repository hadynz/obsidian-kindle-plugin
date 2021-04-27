import nunjucks from 'nunjucks';
import { get } from 'svelte/store';

import { settingsStore } from './store';
import { Book, Highlight } from './models';

type RenderTemplate = {
  title: string;
  author: string;
  asin: string;
  url: string;
  imageUrl: string;
  appLink: string;
  highlights: {
    text: string;
    location: string;
    page: string;
    appLink: string;
  }[];
};

export class Renderer {
  constructor() {
    nunjucks.configure({ autoescape: false });
  }

  render(book: Book, highlights: Highlight[]): string {
    const context: RenderTemplate = {
      title: book.title,
      author: book.author,
      asin: book.asin,
      url: book.url,
      imageUrl: book.imageUrl,
      appLink: `kindle://book?action=open&asin=${book.asin}`,
      highlights: highlights.map((h) => ({
        text: h.text,
        location: h.location,
        page: h.page,
        appLink: `kindle://book?action=open&asin=${book.asin}&location=${h.location}`,
      })),
    };

    const content = nunjucks.renderString(
      get(settingsStore).noteTemplate,
      context,
    );

    return content;
  }
}
