import nunjucks, { Environment } from 'nunjucks';
import sanitize from 'sanitize-filename';
import { get } from 'svelte/store';

import { shortenTitle } from '~/utils';
import { settingsStore } from '~/store';
import type { Book } from '~/models';

const DefaultTemplate = '{{shortTitle}}';

class FileNameRenderer {
  private nunjucks: Environment;

  constructor() {
    this.nunjucks = new nunjucks.Environment(null, { autoescape: false });
  }

  public validate(template: string): boolean {
    try {
      this.nunjucks.renderString(template, {});
      return true;
    } catch (error) {
      return false;
    }
  }

  public render(book: Partial<Book>): string {
    const template = get(settingsStore).fileNameTemplate || this.defaultTemplate();

    const fileName = this.nunjucks.renderString(template, {
      shortTitle: shortenTitle(book.title),
      longTitle: book.title,
      author: book.author,
    });

    return `${sanitize(fileName)}.md`;
  }

  public defaultTemplate(): string {
    return DefaultTemplate;
  }
}

export const fileNameRenderer = new FileNameRenderer();
