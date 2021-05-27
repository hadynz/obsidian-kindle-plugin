import nunjucks from 'nunjucks';
import { get } from 'svelte/store';

import { santizeTitle } from '~/utils';
import { settingsStore } from '~/store';
import type { BookHighlight, RenderTemplate } from '~/models';

export class Renderer {
  constructor() {
    nunjucks.configure({ autoescape: false });
  }

  validate(template: string): boolean {
    try {
      nunjucks.renderString(template, {});
      return true;
    } catch (error) {
      return false;
    }
  }

  render(entry: BookHighlight): string {
    const { book, highlights } = entry;

    const context: RenderTemplate = {
      ...book,
      fullTitle: book.title,
      title: santizeTitle(book.title),
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

    const template = get(settingsStore).noteTemplate;
    const content = nunjucks.renderString(template, context);

    return content;
  }
}
