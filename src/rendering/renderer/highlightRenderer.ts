import { Environment } from 'nunjucks';
import dateFilter from 'nunjucks-date-filter';

import type { Book, RenderedHighlight } from '~/models';
import headingTemplate from '~/rendering/templates/headingTemplate.njk';
import highlightTemplateWrapper from '~/rendering/templates/highlightTemplateWrapper.njk';

import { BlockReferenceExtension } from '../nunjucks.extensions';

import { highlightTemplateVariables } from './templateVariables';
import { trimMultipleLines } from './utils';

export const HighlightIdBlockRefPrefix = '^ref-';

dateFilter.setDefaultFormat('DD-MM-YYYY');

export default class HighlightRenderer {
  private nunjucks: Environment;

  constructor(private clippingTemplate: string) {
    this.nunjucks = new Environment(null, { autoescape: false });
    this.nunjucks.addExtension('BlockRef', new BlockReferenceExtension());
    this.nunjucks.addFilter('date', dateFilter);
  }

  public validate(template: string): boolean {
    try {
      this.nunjucks.renderString(template ?? '', { text: '' });
      return true;
    } catch (error) {
      return false;
    }
  }

  public render(highlight: RenderedHighlight, book: Book): string {
    if (highlight.type === 'clipping') {
      return this.renderClipping(highlight, book);
    }

    return this.renderHeading(highlight);
  }

  private renderHeading(highlight: RenderedHighlight): string {
    const headingDepth = +highlight.type.replace('heading', '');
    return this.nunjucks.renderString(headingTemplate, {
      text: highlight.text,
      hashes: '#'.repeat(headingDepth + 2),
    });
  }

  private renderClipping(highlight: RenderedHighlight, book: Book): string {
    const templateVariables = highlightTemplateVariables(highlight, book);

    // Use a special template wrapper with functionality to insert `ref-` block at right place
    const highlightTemplate = highlightTemplateWrapper.replace(
      '{{ content }}',
      this.clippingTemplate
    );

    const renderedHighlight = this.nunjucks.renderString(highlightTemplate, templateVariables);

    return trimMultipleLines(renderedHighlight);
  }
}
