import type { Book, BookMetadata } from '~/models';
import { settingsStore } from '~/store';

import FileNameRenderer, { removeParenthesesFromText } from './fileNameRenderer';

describe('FileNameRenderer', () => {
  beforeEach(() => {
    settingsStore.store.set({
      amazonRegion: 'global',
      highlightsFolder: '/',
      lastSyncMode: 'amazon',
      hasStartedSync: false,
      isLoggedIn: false,
      syncOnBoot: false,
      downloadBookMetadata: true,
      ignoredBooks: [],
      removeParens: false,
      removeParensWhitelist: '',
    });
  });

  describe('validate', () => {
    it('should return true for valid template', () => {
      const renderer = new FileNameRenderer('');
      expect(renderer.validate('{{shortTitle}}')).toBe(true);
    });

    it('should return false for invalid template', () => {
      const renderer = new FileNameRenderer('');
      expect(renderer.validate('{{shortTitle')).toBe(false);
    });

    it.each([null, undefined])('should return true for %s template', (template) => {
      const renderer = new FileNameRenderer('');
      expect(renderer.validate(template)).toBe(true);
    });
  });

  describe('render', () => {
    it('File name with shortened book title', () => {
      const book: Partial<Book> = {
        title: 'Immunity to change: How to overcome it',
      };
      const metadata: Partial<BookMetadata> = {
        publicationDate: '2010'
      };

      const renderer = new FileNameRenderer('{{shortTitle}}');
      expect(renderer.render(book, metadata)).toBe('Immunity to change.md');
    });

    it('File name with book title as is', () => {
      const book: Partial<Book> = {
        title: 'Immunity to change: How to overcome it',
      };
      const metadata: Partial<BookMetadata> = {
        publicationDate: '2010'
      };

      const renderer = new FileNameRenderer('{{longTitle}}');
      expect(renderer.render(book, metadata)).toBe('Immunity to change - How to overcome it.md');
    });

    it('File name with author', () => {
      const book: Partial<Book> = {
        title: 'Immunity to change: How to overcome it',
        author: 'John Doe',
      };
      const metadata: Partial<BookMetadata> = {
        publicationDate: '2010'
      };

      const renderer = new FileNameRenderer('{{author}}');
      expect(renderer.render(book, metadata)).toBe('John Doe.md');
    });

    it('File name with publication date', () => {
      const book: Partial<Book> = {
        title: 'Immunity to change: How to overcome it',
        author: 'John Doe',
      };
      const metadata: Partial<BookMetadata> = {
        publicationDate: '2010'
      };

      const renderer = new FileNameRenderer('{{publicationDate}} - {{author}}');
      expect(renderer.render(book, metadata)).toBe('2010 - John Doe.md');
    });

    // Issue #287: Accented characters in author names should be preserved
    it('preserves accented characters in author names', () => {
      const book: Partial<Book> = {
        title: 'La vie devant soi',
        author: 'Frédéric Lenoir',
      };
      const metadata: Partial<BookMetadata> = {};

      const renderer = new FileNameRenderer('{{author}} - {{shortTitle}}');
      expect(renderer.render(book, metadata)).toBe('Frédéric Lenoir - La vie devant soi.md');
    });

    // Issue #287: Spanish accented characters
    it('preserves Spanish accented characters', () => {
      const book: Partial<Book> = {
        title: 'Crónica de una muerte anunciada',
        author: 'Gabriel García Márquez',
      };
      const metadata: Partial<BookMetadata> = {};

      const renderer = new FileNameRenderer('{{author}} - {{shortTitle}}');
      expect(renderer.render(book, metadata)).toBe(
        'Gabriel García Márquez - Crónica de una muerte anunciada.md'
      );
    });

    // Issue #220/#266: Forward slashes in titles should be replaced, not stripped
    it('replaces forward slashes in titles with dashes', () => {
      const book: Partial<Book> = {
        title: 'What If? / And Other Questions',
        author: 'Randall Munroe',
      };
      const metadata: Partial<BookMetadata> = {};

      const renderer = new FileNameRenderer('{{longTitle}}');
      const result = renderer.render(book, metadata);
      // Should not contain forward slash (filesystem separator)
      expect(result).not.toContain('/');
      // Should not silently strip the slash creating "What If  And Other Questions"
      // Instead should replace with a dash or similar
      expect(result).toBe('What If - And Other Questions.md');
    });

    // Obsidian-specific: # is not allowed in filenames
    it('strips hash characters from filenames (Obsidian restriction)', () => {
      const book: Partial<Book> = {
        title: 'C# in Depth',
        author: 'Jon Skeet',
      };
      const metadata: Partial<BookMetadata> = {};

      const renderer = new FileNameRenderer('{{longTitle}}');
      const result = renderer.render(book, metadata);
      expect(result).not.toContain('#');
    });

    // Obsidian-specific: [ ] are not allowed in filenames
    it('strips square brackets from filenames (Obsidian restriction)', () => {
      const book: Partial<Book> = {
        title: 'Programming [Advanced]',
        author: 'Test Author',
      };
      const metadata: Partial<BookMetadata> = {};

      const renderer = new FileNameRenderer('{{longTitle}}');
      const result = renderer.render(book, metadata);
      expect(result).not.toContain('[');
      expect(result).not.toContain(']');
    });

    // Obsidian-specific: ^ is not allowed in filenames
    it('strips caret from filenames (Obsidian restriction)', () => {
      const book: Partial<Book> = {
        title: '10^10: Big Numbers',
        author: 'Test Author',
      };
      const metadata: Partial<BookMetadata> = {};

      const renderer = new FileNameRenderer('{{longTitle}}');
      const result = renderer.render(book, metadata);
      expect(result).not.toContain('^');
    });

    // Obsidian-specific: | is not allowed in filenames
    it('strips pipe from filenames (Obsidian restriction)', () => {
      const book: Partial<Book> = {
        title: 'Truth | Lies',
        author: 'Test Author',
      };
      const metadata: Partial<BookMetadata> = {};

      const renderer = new FileNameRenderer('{{longTitle}}');
      const result = renderer.render(book, metadata);
      expect(result).not.toContain('|');
    });

    // Colons should be replaced with dashes in longTitle, not silently stripped
    it('replaces colons with dashes in longTitle', () => {
      const book: Partial<Book> = {
        title: 'Deep Work: Rules for Focused Success',
        author: 'Cal Newport',
      };
      const metadata: Partial<BookMetadata> = {};

      const renderer = new FileNameRenderer('{{longTitle}}');
      const result = renderer.render(book, metadata);
      expect(result).toBe('Deep Work - Rules for Focused Success.md');
    });

    // Multiple consecutive spaces should be collapsed
    it('collapses multiple consecutive spaces', () => {
      const book: Partial<Book> = {
        title: 'What If? / Really?',
        author: 'Test Author',
      };
      const metadata: Partial<BookMetadata> = {};

      const renderer = new FileNameRenderer('{{longTitle}}');
      const result = renderer.render(book, metadata);
      expect(result).not.toMatch(/  +/); // No double spaces
    });

    // Question marks should be removed (OS restriction handled by sanitize-filename)
    it('removes question marks from filenames', () => {
      const book: Partial<Book> = {
        title: 'What If?',
        author: 'Randall Munroe',
      };
      const metadata: Partial<BookMetadata> = {};

      const renderer = new FileNameRenderer('{{longTitle}}');
      const result = renderer.render(book, metadata);
      expect(result).not.toContain('?');
    });

    it('removes bracket content from both title and author when enabled', () => {
      settingsStore.actions.setRemoveParens(true);

      const book: Partial<Book> = {
        title: 'Deep Work (Updated Edition)',
        author: 'Cal Newport（Author）',
      };
      const metadata: Partial<BookMetadata> = {};

      const renderer = new FileNameRenderer('{{author}} - {{longTitle}}');
      expect(renderer.render(book, metadata)).toBe('Cal Newport - Deep Work.md');
    });

    it('skips bracket cleanup for whitelisted book titles', () => {
      settingsStore.actions.setRemoveParens(true);
      settingsStore.actions.setRemoveParensWhitelist('Deep Work');

      const book: Partial<Book> = {
        title: 'Deep Work (Updated Edition)',
        author: 'Cal Newport (Author)',
      };
      const metadata: Partial<BookMetadata> = {};

      const renderer = new FileNameRenderer('{{author}} - {{longTitle}}');
      expect(renderer.render(book, metadata)).toBe(
        'Cal Newport (Author) - Deep Work (Updated Edition).md'
      );
    });

    it('matches whitelist entries case-insensitively and skips title and author cleanup together', () => {
      settingsStore.actions.setRemoveParens(true);
      settingsStore.actions.setRemoveParensWhitelist('deep work');

      const book: Partial<Book> = {
        title: 'Deep Work (Updated Edition)',
        author: 'Cal Newport (Author)',
      };
      const metadata: Partial<BookMetadata> = {};

      const renderer = new FileNameRenderer('{{author}} - {{longTitle}}');
      expect(renderer.render(book, metadata)).toBe(
        'Cal Newport (Author) - Deep Work (Updated Edition).md'
      );
    });
  });
});

describe('removeParenthesesFromText', () => {
  it('removes English parentheses', () => {
    expect(removeParenthesesFromText('Title (Subtitle)')).toBe('Title');
  });

  it('removes Chinese parentheses', () => {
    expect(removeParenthesesFromText('Title（Subtitle）')).toBe('Title');
  });

  it('always cleans up spaces around removed English brackets', () => {
    expect(removeParenthesesFromText('Title (Subtitle)')).toBe('Title');
    expect(removeParenthesesFromText('Title  (Subtitle)')).toBe('Title');
  });

  it('removes nested parentheses', () => {
    // Nested English
    expect(removeParenthesesFromText('Title (Subtitle (Extra))')).toBe('Title');

    // Nested Chinese
    expect(removeParenthesesFromText('Title（Subtitle（Extra））')).toBe('Title');

    // Mixed nested
    expect(removeParenthesesFromText('Title (Subtitle（Extra）)')).toBe('Title');
    expect(removeParenthesesFromText('Title（Subtitle (Extra)）')).toBe('Title');
  });

  it('removes English and Chinese brackets together', () => {
    expect(removeParenthesesFromText('Title (English)（Chinese）')).toBe('Title');
  });

  it('handles edge cases', () => {
    // Empty string result -> returns original
    expect(removeParenthesesFromText('(Parens Only)')).toBe('(Parens Only)');
    expect(removeParenthesesFromText('（Parens Only）')).toBe('（Parens Only）');

    // No parentheses
    expect(removeParenthesesFromText('Title')).toBe('Title');

    // Multiple separate parentheses
    expect(removeParenthesesFromText('Title (One) (Two)')).toBe('Title');
  });

  it('returns original text when removal would produce an empty string', () => {
    expect(removeParenthesesFromText('()')).toBe('()');
    expect(removeParenthesesFromText('（ ）')).toBe('（ ）');
  });
});
