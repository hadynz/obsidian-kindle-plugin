import nunjucks, { Environment } from 'nunjucks';
import sanitize from 'sanitize-filename';
import { get } from 'svelte/store';

import type { Book, BookMetadata } from '~/models';
import { settingsStore } from '~/store';

import { fileNameTemplateVariables } from './templateVariables';

/**
 * Sanitize a filename for use in Obsidian.
 *
 * sanitize-filename handles OS-level restrictions (?, *, <, >, ", NUL, etc.)
 * but Obsidian has additional forbidden characters: # ^ [ ] |
 * We also replace : and / with " - " so titles like "Deep Work: Rules"
 * become "Deep Work - Rules" instead of silently stripping the separator.
 */
export const sanitizeForObsidian = (fileName: string): string => {
  let result = fileName;

  // Replace meaningful separators with " - " before sanitize-filename strips them
  result = result.replace(/[:/\\]/g, ' - ');

  // Run OS-level sanitization (strips ?, *, <, >, ", |, control chars)
  result = sanitize(result);

  // Strip Obsidian-specific forbidden characters: # ^ [ ]
  result = result.replace(/[#^[\]]/g, '');

  // Collapse multiple consecutive spaces into one and trim
  result = result.replace(/ {2,}/g, ' ').trim();

  return result;
};

export default class FileNameRenderer {
  private nunjucks: Environment;

  constructor(private template: string) {
    this.nunjucks = new nunjucks.Environment(null, { autoescape: false });
  }

  public validate(template: string): boolean {
    try {
      this.nunjucks.renderString(template ?? '', {});
      return true;
    } catch (error) {
      return false;
    }
  }

  public render(book: Partial<Book>, metadata: Partial<BookMetadata>): string {
    const settings = get(settingsStore);

    // Apply bracket removal to title and/or author if enabled
    const processedBook = { ...book };
    if (settings.removeParens) {
      const whitelist = settings.removeParensWhitelist
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line !== '');

      if (settings.removeParensFromTitle) {
        processedBook.title = this.removeParenthesesFromText(
          processedBook.title ?? '',
          whitelist,
          settings.removeParensType,
          settings.removeParensSpaces
        );
      }
      if (settings.removeParensFromAuthor) {
        processedBook.author = this.removeParenthesesFromText(
          processedBook.author ?? '',
          whitelist,
          settings.removeParensType,
          settings.removeParensSpaces
        );
      }
    }

    const templateVariables = fileNameTemplateVariables(processedBook, metadata);

    const rendered = this.nunjucks.renderString(this.template, templateVariables);

    const fileName = sanitizeForObsidian(rendered);

    return `${fileName}.md`;
  }

  /**
   * Remove parenthetical content from text based on bracket type settings.
   * Handles nested brackets by running multiple passes.
   */
  private removeParenthesesFromText(
    text: string,
    whitelist: string[],
    removeParensType: 'all' | 'chinese' | 'english',
    removeParensSpaces: boolean
  ): string {
    // Skip if text matches any whitelist keyword
    if (whitelist.some((keyword) => text.includes(keyword))) {
      return text;
    }

    let result = text;

    // Loop to handle nested brackets
    let prev = '';
    while (prev !== result) {
      prev = result;

      if (removeParensType === 'chinese' || removeParensType === 'all') {
        result = result.replace(/（[^（）]*）/g, '');
      }

      if (removeParensType === 'english' || removeParensType === 'all') {
        if (removeParensSpaces) {
          // Remove English brackets and surrounding spaces, avoiding double spaces
          result = result.replace(/\s*\([^()]*\)\s*/g, ' ');
        } else {
          result = result.replace(/\([^()]*\)/g, '');
        }
      }
    }

    // Collapse multiple spaces and trim
    result = result.replace(/ {2,}/g, ' ').trim();

    return result;
  }
}
