import moment from 'moment';
import { Environment } from 'nunjucks';

import type { BookHighlight, FileRenderTemplate } from '~/models';
import { shortenTitle } from '~/utils';

import { TrimAllEmptyLinesExtension } from '../nunjucks.extensions';
import { generateAppLink } from '../utils';

import HighlightRenderer from './highlightRenderer';

export default class FileRenderer {
  private nunjucks: Environment;
  private highlightRenderer: HighlightRenderer;

  constructor(private fileTemplate: string, highlightTemplate: string) {
    this.nunjucks = new Environment(null, { autoescape: false });
    this.nunjucks.addExtension('Trim', new TrimAllEmptyLinesExtension());

    this.highlightRenderer = new HighlightRenderer(highlightTemplate);
  }

  public validate(template: string): boolean {
    try {
      this.nunjucks.renderString(template, { text: '' });
      return true;
    } catch (error) {
      return false;
    }
  }

  public render(entry: BookHighlight): string {
    const { book, highlights, metadata } = entry;

    const params: FileRenderTemplate = {
      title: shortenTitle(book.title),
      longTitle: book.title,
      author: book.author,
      asin: book.asin,
      url: book.url,
      imageUrl: book.imageUrl,
      lastAnnotatedDate: book.lastAnnotatedDate
        ? moment(book.lastAnnotatedDate).format('YYYY-MM-DD').toString()
        : undefined,
      appLink: generateAppLink(book.asin),
      isbn: metadata?.isbn,
      pages: metadata?.pages,
      publicationDate: metadata?.publicationDate,
      publisher: metadata?.publisher,
      authorUrl: metadata?.authorUrl,
      highlightsCount: highlights.length,
      highlights: highlights.map((h) => this.highlightRenderer.render(h, book)).join('\n'),
    };

    return this.nunjucks.renderString(this.fileTemplate, params);
  }
}
