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

    // Apply bracket removal to filename-relevant book fields if enabled.
    const processedBook = { ...book };
    if (settings.removeParens) {
      const whitelist = settings.removeParensWhitelist
        .split('\n')
        .map((line: string) => line.trim().toLowerCase())
        .filter((line: string) => line !== '');

      // Check whitelist against book title once — skip all processing if matched
      const titleLower = (processedBook.title ?? '').toLowerCase();
      const isWhitelisted = whitelist.some((keyword) => titleLower.includes(keyword));

      if (!isWhitelisted) {
        processedBook.title = removeParenthesesFromText(processedBook.title ?? '');
        processedBook.author = removeParenthesesFromText(processedBook.author ?? '');
      }
    }

    const templateVariables = fileNameTemplateVariables(processedBook, metadata);

    const rendered = this.nunjucks.renderString(this.template, templateVariables);

    const fileName = sanitizeForObsidian(rendered);

    return `${fileName}.md`;
  }
}

/**
 * Remove English and Chinese bracketed content from text.
 * Handles nested brackets by running multiple passes.
 * Returns original text if removal would result in an empty string.
 */
export const removeParenthesesFromText = (text: string): string => {
  let result = text;

  // Loop to handle nested brackets
  let prev = '';
  while (prev !== result) {
    prev = result;

    result = result.replace(/（[^（）]*）/g, '');

    // Remove English brackets and surrounding spaces, avoiding double spaces.
    result = result.replace(/\s*\([^()]*\)\s*/g, ' ');
  }

  // Collapse multiple spaces and trim
  result = result.replace(/ {2,}/g, ' ').trim();

  // Return original text if removal resulted in empty string
  return result || text;
};
