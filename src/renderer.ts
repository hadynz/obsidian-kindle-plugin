import nunjucks from 'nunjucks';

import { Book, Highlight } from './models';
import { PluginSettings } from './settings';

export class Renderer {
  private settings: PluginSettings;

  constructor(settings: PluginSettings) {
    this.settings = settings;

    nunjucks.configure({ autoescape: true });
  }

  render(book: Book, highlights: Highlight[]): string {
    const content = nunjucks.renderString(this.settings.noteTemplate, {
      title: book.title,
      author: book.author,
      highlights,
    });

    return content;
  }
}
