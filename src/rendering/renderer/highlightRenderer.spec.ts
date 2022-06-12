import faker from 'faker';

import HighlightRenderer from './highlightRenderer';
import type { Highlight } from '~/models';

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
  });

  describe('render', () => {
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
      ])('template variable "%s" evaluated as "%s"', (template, expected) => {
        const renderer = new HighlightRenderer(template);
        expect(renderer.render(highlight)).toBe(expected);
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
          expect(renderer.render(highlight)).toBe(expected);
        }
      );
    });

    it('appLink template variable is set when a book has an ASIN value', () => {
      const asin = 'A1234';
      const highlight: Highlight = {
        id: faker.datatype.uuid(),
        text: 'highlighted text',
      };

      const renderer = new HighlightRenderer('{{text}} - {{appLink}}');
      expect(renderer.render(highlight, asin)).toMatch(
        new RegExp('^highlighted text - kindle://(.*) \\^ref-.*$')
      );
    });

    it('appLink template variable is undefined when a book is missing an ASIN value', () => {
      const highlight: Highlight = {
        id: faker.datatype.uuid(),
        text: 'highlighted text',
      };

      const renderer = new HighlightRenderer('{{text}} - {{appLink}}');

      expect(renderer.render(highlight)).toMatch(
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

      expect(renderer.render(highlight)).toMatch(
        new RegExp('^highlighted text \\^ref-.*\\n\\n110$')
      );
    });
  });
});
