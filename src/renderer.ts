import nunjucks from 'nunjucks';
import { get } from 'svelte/store';

import { settingsStore } from './store';
import { Book, Highlight } from './models';

export class Renderer {
  constructor() {
    nunjucks.configure({ autoescape: true });
  }

  render(book: Book, highlights: Highlight[]): string {
    const content = nunjucks.renderString(get(settingsStore).noteTemplate, {
      title: book.title,
      author: book.author,
      url: book.url,
      highlights,
    });

    return content;
  }
}
