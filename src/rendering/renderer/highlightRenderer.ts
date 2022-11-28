import { Environment } from 'nunjucks';
import dateFilter from 'nunjucks-date-filter';

import globalConfig from '~/globalConfig';
import type { Book, PreRenderedHighlight } from '~/models';

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

  public render(highlight: PreRenderedHighlight, book: Book): string {
    if (highlight.type === 'clipping') {
      return this.renderClipping(highlight, book);
    }

    return this.renderHeading(highlight);
  }

  private renderHeading(highlight: PreRenderedHighlight): string {
    const headingDepth = +highlight.type.replace('heading', '');
    return this.nunjucks.renderString(globalConfig.defaultTemplates.header, {
      text: highlight.text,
      hashes: '#'.repeat(headingDepth + 2),
    });
  }

  private renderClipping(highlight: PreRenderedHighlight, book: Book): string {
    const templateVariables = highlightTemplateVariables(highlight, book);

    // Use a special template wrapper with functionality to insert `ref-` block at right place
    const highlightTemplate = globalConfig.defaultTemplates.highlightWrapper.replace(
      '{{ content }}',
      this.clippingTemplate
    );

    const renderedHighlight = this.nunjucks.renderString(highlightTemplate, templateVariables);

    return trimMultipleLines(renderedHighlight);
  }
}
