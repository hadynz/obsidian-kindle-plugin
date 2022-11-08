import { Environment } from 'nunjucks';

import type { BookHighlight } from '~/models';

import { TrimAllEmptyLinesExtension } from '../nunjucks.extensions';

import HighlightRenderer from './highlightRenderer';
import { fileTemplateVariables } from './templateVariables';

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
      this.nunjucks.renderString(template ?? '', { text: '' });
      return true;
    } catch (error) {
      return false;
    }
  }

  public render(entry: BookHighlight): string {
    const { book, highlights } = entry;

    const renderedHighlights = highlights
      .map((h) => this.highlightRenderer.render(h, book))
      .join('\n');

    const templateVariables = fileTemplateVariables(entry, renderedHighlights);

    return this.nunjucks.renderString(this.fileTemplate, templateVariables);
  }
}
