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

    // Apply bracket removal to title if enabled
    const processedBook = { ...book };
    if (settings.removeParens) {
      const whitelist = settings.removeParensWhitelist
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line !== '');

      processedBook.title = this.removeParentheses(processedBook.title ?? '', whitelist);
    }

    const templateVariables = fileNameTemplateVariables(processedBook, metadata);

    const rendered = this.nunjucks.renderString(this.template, templateVariables);

    const fileName = sanitizeForObsidian(rendered);

    return `${fileName}.md`;
  }

  /**
   * Remove parenthetical content (both Chinese and English brackets) from text.
   * Handles nested brackets by running multiple passes.
   */
  private removeParentheses(text: string, whitelist: string[]): string {
    // Skip if text matches any whitelist keyword
    if (whitelist.some((keyword) => text.includes(keyword))) {
      return text;
    }

    let result = text;

    // Remove all types of brackets (Chinese （） and English ()) with content
    // Loop to handle nested brackets
    let prev = '';
    while (prev !== result) {
      prev = result;
      result = result.replace(/（[^（）]*）/g, '');
      result = result.replace(/\([^()]*\)/g, '');
    }

    // Collapse multiple spaces and trim
    result = result.replace(/ {2,}/g, ' ').trim();

    return result;
  }
}
