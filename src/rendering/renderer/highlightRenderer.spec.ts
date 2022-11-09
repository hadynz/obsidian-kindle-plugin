import faker from 'faker';

import type { Book, Highlight } from '~/models';

import HighlightRenderer from './highlightRenderer';

describe('HighlightRenderer', () => {
  describe('validate', () => {
    it('should return true for valid template', () => {
      const renderer = new HighlightRenderer('');
      expect(renderer.validate('{{note}}')).toBe(true);
    });

    it('should return false for invalid template', () => {
      const renderer = new HighlightRenderer('');
      expect(renderer.validate('{{note')).toBe(false);
    });

    it.each([null, undefined])('should return true for %s template', (template) => {
      const renderer = new HighlightRenderer('');
      expect(renderer.validate(template)).toBe(true);
    });
  });

  describe('render', () => {
    const book: Book = {
      id: faker.datatype.uuid(),
      title: 'Book title',
      author: faker.name.findName(),
    };

    describe('highlight template variables', () => {
      const highlight: Highlight = {
        id: '123',
        text: 'highlighted text',
        location: '110',
        page: '3',
        note: 'my smart note',
        color: 'pink',
      };

      it.each([
        ['{{text}}', 'highlighted text ^ref-123'],
        ['{{location}}', '110'],
        ['{{page}}', '3'],
        ['{{note}}', 'my smart note'],
        ['{{color}}', 'pink'],
        ['{{createdDate}}', ''],
        ['{{title}}', 'Book title'],
        ['{{longTitle}}', 'Book title'],
      ])('template variable "%s" evaluated as "%s"', (template, expected) => {
        const renderer = new HighlightRenderer(template);
        expect(renderer.render(highlight, book)).toBe(expected);
      });

      it.each([
        [new Date('2019-11-29T18:00:13Z'), '{{createdDate | date}}', '29-11-2019'],
        [
          new Date('2016-04-18T07:28:27Z'),
          '{{createdDate | date("LLL")}}',
          'April 18, 2016 7:28 AM',
        ],
      ])(
        'createdDate template variable is set when highlight creation date is set',
        (createdDate: Date, template: string, expected: string) => {
          const highlight: Highlight = {
            id: faker.datatype.uuid(),
            text: faker.lorem.sentence(),
            createdDate,
          };

          const renderer = new HighlightRenderer(template);
          expect(renderer.render(highlight, book)).toBe(expected);
        }
      );
    });

    it('appLink template variable is set when a book has an ASIN value', () => {
      const myBook: Book = { ...book, asin: 'A1234' };
      const highlight: Highlight = {
        id: faker.datatype.uuid(),
        text: 'highlighted text',
      };

      const renderer = new HighlightRenderer('{{text}} - {{appLink}}');
      expect(renderer.render(highlight, myBook)).toMatch(
        new RegExp('^highlighted text - kindle://(.*) \\^ref-.*$')
      );
    });

    it('appLink template variable is undefined when a book is missing an ASIN value', () => {
      const highlight: Highlight = {
        id: faker.datatype.uuid(),
        text: 'highlighted text',
      };

      const renderer = new HighlightRenderer('{{text}} - {{appLink}}');

      expect(renderer.render(highlight, book)).toMatch(
        // eslint-disable-next-line no-regex-spaces
        new RegExp('^highlighted text -  \\^ref-.*$')
      );
    });

    it('Only leading and trailing lines in a template are always trimmed', () => {
      const templateWithTrailingLines = '\n\n{{text}}\n\n{{location}}\n\n';
      const highlight: Highlight = {
        id: faker.datatype.uuid(),
        text: 'highlighted text',
        location: '110',
      };

      const renderer = new HighlightRenderer(templateWithTrailingLines);

      expect(renderer.render(highlight, book)).toMatch(
        new RegExp('^highlighted text \\^ref-.*\\n\\n110$')
      );
    });

    it('Highlight template starting with if statement renders as expected', () => {
      const template = `{% if note %}{{note}}{% endif %}
{{ text }}`;

      const highlight: Highlight = {
        id: faker.datatype.uuid(),
        text: 'highlighted text',
      };

      const renderer = new HighlightRenderer(template);

      expect(renderer.render(highlight, book)).toMatch(
        new RegExp(/highlighted text \^ref-.*/)
      );
    });
  });
});
