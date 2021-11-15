import nunjucks, { Environment } from 'nunjucks';
import { get } from 'svelte/store';

import bookTemplate from './templates/bookTemplate.njk';
import defaultHighlightTemplate from './templates/defaultHighlightTemplate.njk';
import highlightTemplateWrapper from './templates/highlightTemplateWrapper.njk';
import { BlockReferenceExtension, TrimAllEmptyLinesExtension } from './nunjucks.extensions';
import { shortenTitle } from '~/utils';
import { settingsStore } from '~/store';
import { trimMultipleLines } from './helper';
import type { Book, BookHighlight, Highlight, RenderTemplate } from '~/models';

export const HighlightIdBlockRefPrefix = '^ref-';

const appLink = (book: Book, highlight?: Highlight): string => {
  if (book.asin == null) {
    return null;
  }
  if (highlight != null) {
    return `kindle://book?action=open&asin=${book.asin}&location=${highlight.location}`;
  }
  return `kindle://book?action=open&asin=${book.asin}`;
};

export class Renderer {
  private nunjucks: Environment;

  constructor() {
    this.nunjucks = new nunjucks.Environment(null, { autoescape: false });
    this.nunjucks.addExtension('BlockRef', new BlockReferenceExtension());
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

    const params: RenderTemplate = {
      ...book,
      fullTitle: book.title,
      title: shortenTitle(book.title),
      appLink: appLink(book),
      ...entry.metadata,
      highlights: this.renderHighlights(book, highlights),
    };

    return this.nunjucks.renderString(bookTemplate, params);
  }

  public renderHighlight(book: Book, highlight: Highlight): string {
    const highlightParams = { ...highlight, appLink: appLink(book, highlight) };

    const userTemplate =
      get(settingsStore).highlightTemplate || this.defaultHighlightTemplate();

    const highlightTemplate = highlightTemplateWrapper.replace('{{ content }}', userTemplate);

    const renderedHighlight = this.nunjucks.renderString(highlightTemplate, highlightParams);

    return trimMultipleLines(renderedHighlight);
  }

  private renderHighlights(book: Book, highlights: Highlight[]): string {
    return highlights.map((h) => this.renderHighlight(book, h)).join('\n');
  }
}
