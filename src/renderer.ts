import nunjucks from 'nunjucks';
import { get } from 'svelte/store';

import { settingsStore } from './store';
import { BookHighlight } from './models';

export class Renderer {
  constructor() {
    nunjucks.configure({ autoescape: true });
  }

  render(entry: BookHighlight): string {
    const content = nunjucks.renderString(get(settingsStore).noteTemplate, {
      title: entry.book.title,
      author: entry.book.author,
      url: entry.book.url,
      highlights: entry.highlights,
    });

    return content;
  }
}
