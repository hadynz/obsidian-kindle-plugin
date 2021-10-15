import nunjucks from 'nunjucks';
import { get } from 'svelte/store';

import defaultBookTemplate from '~/assets/defaultBookTemplate.njk';
import defaultHighlightTemplate from '~/assets/defaultHighlightTemplate.njk';
import { sanitizeTitle } from '~/utils';
import { settingsStore } from '~/store';
import type { Book, BookHighlight, Highlight, RenderTemplate } from '~/models';

export const HighlightIdBlockRefPrefix = '^ref-';

export class Renderer {
  constructor() {
    nunjucks.configure({ autoescape: false });
  }

  public validate(template: string): boolean {
    try {
      nunjucks.renderString(template, {});
      return true;
    } catch (error) {
      return false;
    }
  }

  public render(entry: BookHighlight): string {
    const { book, highlights } = entry;

    const appLink = book.asin
      ? `kindle://book?action=open&asin=${book.asin}`
      : null;

    const params: RenderTemplate = {
      ...book,
      fullTitle: book.title,
      title: sanitizeTitle(book.title),
      appLink,
      ...entry.metadata,
      highlights: this.renderHighlights(book, highlights),
    };

    return nunjucks.renderString(defaultBookTemplate, params);
  }

  public renderHighlight(book: Book, highlight: Highlight): string {
    const appLink = book.asin
      ? `kindle://book?action=open&asin=${book.asin}&location=${highlight.location}`
      : null;

    const highlightParams = { ...highlight, appLink };

    const template =
      get(settingsStore).highlightTemplate || defaultHighlightTemplate;

    const renderedHighlight = nunjucks.renderString(template, highlightParams);

    // Surround all highlights with a block reference to enable re-sync functionality
    return `${HighlightIdBlockRefPrefix}${highlight.id}\n${renderedHighlight}`;
  }

  private renderHighlights(book: Book, highlights: Highlight[]): string {
    return highlights.map((h) => this.renderHighlight(book, h)).join('\n');
  }
}
