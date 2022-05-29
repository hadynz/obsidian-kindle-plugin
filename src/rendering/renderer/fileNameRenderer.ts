import nunjucks, { Environment } from 'nunjucks';
import sanitize from 'sanitize-filename';
import { get } from 'svelte/store';

import { shortenTitle } from '~/utils';
import { settingsStore } from '~/store';
import type { Book } from '~/models';

export const DefaultFileNameTemplate = '{{shortTitle}}';

export class FileNameRenderer {
  private nunjucks: Environment;

  constructor(private template: string) {
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
    const fileName = this.nunjucks.renderString(this.template, {
      shortTitle: shortenTitle(book.title),
      longTitle: book.title,
      author: book.author,
    });

    return `${sanitize(fileName)}.md`;
  }
}

const userFileNameTemplate = get(settingsStore).fileNameTemplate || DefaultFileNameTemplate;

export const fileNameRenderer = new FileNameRenderer(userFileNameTemplate);
