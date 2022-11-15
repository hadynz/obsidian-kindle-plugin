import faker from 'faker';

import type { BookHighlight } from '~/models';

import FileRenderer from './';

describe('FileRenderer', () => {
  describe('validate', () => {
    it.each([null, undefined])('should return true for %s template', (template) => {
      const renderer = new FileRenderer('', '');
      expect(renderer.validate(template)).toBe(true);
    });
  });

  describe('render', () => {
    describe('file template variables', () => {
      const bookHighlight: BookHighlight = {
        book: {
          id: faker.random.alphaNumeric(4),
          title: 'My book title: extended description',
          author: faker.name.findName(),
          asin: faker.random.alphaNumeric(4),
          url: faker.internet.url(),
          imageUrl: faker.image.imageUrl(),
          lastAnnotatedDate: new Date(2022, 3, 4),
        },
        metadata: {
          isbn: faker.random.alphaNumeric(4),
          pages: faker.datatype.number(100).toString(),
          publicationDate: faker.date.past().toISOString(),
          publisher: faker.company.companyName(),
          authorUrl: faker.internet.url(),
        },
        highlights: [
          {
            id: faker.random.alphaNumeric(4),
            text: 'first highlighted text',
            note: '.c1',
          },
          {
            id: faker.random.alphaNumeric(4),
            text: 'second highlighted text',
            note: '.c2',
          },
          {
            id: faker.random.alphaNumeric(4),
            text: 'Chapter heading',
            note: '.h1',
          },
        ],
      };

      it.each([
        ['{{id}}', ''],
        ['{{title}}', 'My book title'],
        ['{{longTitle}}', 'My book title: extended description'],
        ['{{asin}}', bookHighlight.book.asin],
        ['{{url}}', bookHighlight.book.url],
        ['{{imageUrl}}', bookHighlight.book.imageUrl],
        ['{{lastAnnotatedDate}}', '2022-04-04'],
        ['{{isbn}}', bookHighlight.metadata.isbn],
        ['{{pages}}', bookHighlight.metadata.pages],
        ['{{publicationDate}}', bookHighlight.metadata.publicationDate],
        ['{{publisher}}', bookHighlight.metadata.publisher],
        ['{{authorUrl}}', bookHighlight.metadata.authorUrl],
        ['{{highlightsCount}}', '2'],
      ])('template variable "%s" evaluated as "%s"', (template, expected) => {
        const renderer = new FileRenderer(template, '');
        expect(renderer.render(bookHighlight)).toBe(expected);
      });
    });

    describe('file template variables works for null values', () => {
      const bookHighlight: BookHighlight = {
        book: {
          id: faker.random.alphaNumeric(4),
          title: 'My book title: extended description',
          author: faker.name.findName(),
        },
        metadata: {},
        highlights: [
          {
            id: faker.random.alphaNumeric(4),
            text: 'highlighted text',
          },
        ],
      };

      it.each([
        ['{{asin}}', ''],
        ['{{url}}', ''],
        ['{{imageUrl}}', ''],
        ['{{lastAnnotatedDate}}', ''],
        ['{{isbn}}', ''],
        ['{{pages}}', ''],
        ['{{publicationDate}}', ''],
        ['{{publisher}}', ''],
        ['{{authorUrl}}', ''],
        ['{{highlightsCount}}', '1'],
      ])('template variable "%s" evaluated as "%s"', (template, expected) => {
        const renderer = new FileRenderer(template, '');
        expect(renderer.render(bookHighlight)).toBe(expected);
      });
    });

    it('Simple render of a minimalist file template', () => {
      const bookHighlight: BookHighlight = {
        book: {
          id: faker.random.alphaNumeric(4),
          title: 'My book title: extended description',
          author: faker.name.findName(),
        },
        metadata: {
          publisher: faker.company.companyName(),
        },
        highlights: [
          {
            id: 'H1',
            text: 'highlighted text',
          },
          {
            id: 'H2',
            text: 'another piece of text',
          },
        ],
      };

      const fileTemplate = `
# {{title}}

## Metadata
- Author:: {{author}}
- Publisher:: {{publisher}}
- Highlights count:: {{highlightsCount}}

## Highlights
{{highlights}}
`;

      const renderedContent = `
# My book title

## Metadata
- Author:: ${bookHighlight.book.author}
- Publisher:: ${bookHighlight.metadata.publisher}
- Highlights count:: 2

## Highlights
- highlighted text ^ref-H1
- another piece of text ^ref-H2
`;

      const renderer = new FileRenderer(fileTemplate, '- {{text}}');
      expect(renderer.render(bookHighlight)).toBe(renderedContent);
    });

    it('Simple render works without optional metadata', () => {
      const bookHighlight: BookHighlight = {
        book: {
          id: faker.random.alphaNumeric(4),
          title: 'My book title: extended description',
          author: faker.name.findName(),
        },
        highlights: [],
      };

      const fileTemplate = `
# {{title}}

## Metadata
- Author:: {{author}}
- Publisher:: {{publisher}}.

## Highlights
{{highlights}}
`;

      const renderedContent = `
# My book title

## Metadata
- Author:: ${bookHighlight.book.author}
- Publisher:: .

## Highlights

`;

      const renderer = new FileRenderer(fileTemplate, '- {{text}}');
      expect(renderer.render(bookHighlight)).toBe(renderedContent);
    });

    it('Process notes using Readwise-like commands', () => {
      const bookHighlight: BookHighlight = {
        book: {
          id: faker.random.alphaNumeric(4),
          title: 'My book title: extended description',
          author: faker.name.findName(),
        },
        metadata: {
          publisher: faker.company.companyName(),
        },
        highlights: [
          {
            id: '01',
            text: 'An initial highlight',
          },
          {
            id: faker.datatype.uuid(),
            text: 'My first chapter',
            note: '.h1',
          },
          {
            id: '02',
            text: 'A long highlight',
            note: '.c1',
          },
          {
            id: '03',
            text: 'Followed by some context',
            note: '.c2',
          },
          {
            id: faker.datatype.uuid(),
            text: 'My nested chapter',
            note: '.h2',
          },
          {
            id: faker.datatype.uuid(),
            text: 'My second chapter',
            note: '.h1',
          },
        ],
      };

      const fileTemplate = `
# {{title}}

## Metadata
- Author:: {{author}}
- Publisher:: {{publisher}}
- Highlights count:: {{highlightsCount}}

## Highlights
{{highlights}}
`;

      const renderedContent = `
# My book title

## Metadata
- Author:: ${bookHighlight.book.author}
- Publisher:: ${bookHighlight.metadata.publisher}
- Highlights count:: 5

## Highlights
- An initial highlight ^ref-01

### My first chapter

- A long highlight... followed by some context ^ref-03

#### My nested chapter


### My second chapter

`;

      const renderer = new FileRenderer(fileTemplate, '- {{text}}');
      expect(renderer.render(bookHighlight)).toBe(renderedContent);
    });
  });
});
