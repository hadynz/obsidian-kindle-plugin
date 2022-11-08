import type { Book } from '~/models';

import FileNameRenderer from './fileNameRenderer';

describe('FileNameRenderer', () => {
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

      const renderer = new FileNameRenderer('{{shortTitle}}');
      expect(renderer.render(book)).toBe('Immunity to change.md');
    });

    it('File name with book title as is', () => {
      const book: Partial<Book> = {
        title: 'Immunity to change: How to overcome it',
      };

      const renderer = new FileNameRenderer('{{longTitle}}');
      expect(renderer.render(book)).toBe('Immunity to change How to overcome it.md');
    });

    it('File name with author', () => {
      const book: Partial<Book> = {
        title: 'Immunity to change: How to overcome it',
        author: 'John Doe',
      };

      const renderer = new FileNameRenderer('{{author}}');
      expect(renderer.render(book)).toBe('John Doe.md');
    });
  });
});
