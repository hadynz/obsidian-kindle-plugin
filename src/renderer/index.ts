import nunjucks, { Environment } from 'nunjucks';
import { get } from 'svelte/store';

import bookTemplate from './templates/bookTemplate.njk';
import defaultHighlightTemplate from './templates/defaultHighlightTemplate.njk';
import { TrimAllEmptyLinesExtension } from './nunjucks.extensions';
import { sanitizeTitle } from '~/utils';
import { settingsStore } from '~/store';
import { trimMultipleLines } from './helper';
import type { Book, BookHighlight, Highlight, RenderTemplate } from '~/models';

export const HighlightIdBlockRefPrefix = '^ref-';

export class Renderer {
  private nunjucks: Environment;

  constructor() {
    this.nunjucks = new nunjucks.Environment(null, { autoescape: false });
    this.nunjucks.addExtension('Trim', new TrimAllEmptyLinesExtension());
  }

  public validate(template: string): boolean {
    try {
      this.nunjucks.renderString(template, {});
      return true;
    } catch (error) {
      return false;
    }
  }

  public defaultHighlightTemplate(): string {
    return defaultHighlightTemplate.trim();
  }

  public render(entry: BookHighlight): string {
    const { book, highlights } = entry;

    const appLink = book.asin ? `kindle://book?action=open&asin=${book.asin}` : null;

    const params: RenderTemplate = {
      ...book,
      fullTitle: book.title,
      title: sanitizeTitle(book.title),
      appLink,
      ...entry.metadata,
      highlights: this.renderHighlights(book, highlights),
    };

    return this.nunjucks.renderString(bookTemplate, params);
  }

  public renderHighlight(book: Book, highlight: Highlight): string {
    const appLink = book.asin
      ? `kindle://book?action=open&asin=${book.asin}&location=${highlight.location}`
      : null;

    const highlightParams = { ...highlight, appLink };

    const userTemplate =
      get(settingsStore).highlightTemplate || this.defaultHighlightTemplate();

    const renderedHighlight = this.nunjucks.renderString(userTemplate, highlightParams);
    const trimmedHighlight = trimMultipleLines(renderedHighlight);

    // Surround all highlights with a block reference to enable re-sync functionality
    return `${HighlightIdBlockRefPrefix}${highlight.id}\n${trimmedHighlight}`;
  }

  private renderHighlights(book: Book, highlights: Highlight[]): string {
    return highlights.map((h) => this.renderHighlight(book, h)).join('\n');
  }
}
