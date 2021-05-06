import nunjucks from 'nunjucks';
import { get } from 'svelte/store';

import { settingsStore } from './store';
import type { BookHighlight, RenderTemplate } from './models';

export class Renderer {
  constructor() {
    nunjucks.configure({ autoescape: false });
  }

  render(entry: BookHighlight): string {
    const { book, highlights } = entry;

    const context: RenderTemplate = {
      ...book,
      ...(book.asin
        ? { appLink: `kindle://book?action=open&asin=${book.asin}` }
        : {}),
      ...entry.metadata,
      highlights: highlights.map((h) => ({
        ...h,
        ...(book.asin
          ? {
              appLink: `kindle://book?action=open&asin=${book.asin}&location=${h.location}`,
            }
          : {}),
      })),
    };

    const content = nunjucks.renderString(
      get(settingsStore).noteTemplate,
      context
    );

    return content;
  }
}
