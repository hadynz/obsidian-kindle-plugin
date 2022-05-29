import nunjucks, { Environment } from 'nunjucks';
import { get } from 'svelte/store';

import defaultHighlightTemplate from '~/rendering/templates/defaultHighlightTemplate.njk';
import highlightTemplateWrapper from '~/rendering//templates/highlightTemplateWrapper.njk';
import { BlockReferenceExtension, TrimAllEmptyLinesExtension } from '../nunjucks.extensions';
import { settingsStore } from '~/store';
import { trimMultipleLines } from '../helper';
import type { Highlight } from '~/models';

export const HighlightIdBlockRefPrefix = '^ref-';

export const DefaultHighlightTemplate = defaultHighlightTemplate;

const appLink = (bookAsin: string, highlight?: Highlight): string => {
  if (bookAsin == null) {
    return null;
  }
  if (highlight?.location != null) {
    return `kindle://book?action=open&asin=${bookAsin}&location=${highlight.location}`;
  }
  return `kindle://book?action=open&asin=${bookAsin}`;
};

export class HighlightRenderer {
  private nunjucks: Environment;

  constructor(private template: string) {
    this.nunjucks = new nunjucks.Environment(null, { autoescape: false });
    this.nunjucks.addExtension('BlockRef', new BlockReferenceExtension());
    this.nunjucks.addExtension('Trim', new TrimAllEmptyLinesExtension());
  }

  public validate(template: string): boolean {
    try {
      this.nunjucks.renderString(template, { text: '' });
      return true;
    } catch (error) {
      return false;
    }
  }

  public render(highlight: Highlight, bookAsin: string = undefined): string {
    const highlightParams = { ...highlight, appLink: appLink(bookAsin, highlight) };

    const highlightTemplate = highlightTemplateWrapper.replace('{{ content }}', this.template);

    const renderedHighlight = this.nunjucks.renderString(highlightTemplate, highlightParams);

    return trimMultipleLines(renderedHighlight);
  }
}

const userFileNameTemplate = get(settingsStore).highlightTemplate || DefaultHighlightTemplate;

export const highlightRenderer = new HighlightRenderer(userFileNameTemplate);
