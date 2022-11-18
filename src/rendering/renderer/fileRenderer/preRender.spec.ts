import faker from 'faker';

import type { Highlight, PreRenderedHighlight } from '~/models';

import { preRenderHighlights } from './preRender';

describe('FileRenderer', () => {
  describe('mapToRenderedHighlights', () => {
    it.each([
      ['.h1', 'heading1'],
      ['.h2', 'heading2'],
      ['.h3', 'heading3'],
      ['.h4', 'heading4'],
    ])(
      'A clipping with note "%s" is mapped to a highlight type "%s"',
      (note: string, highlightType: PreRenderedHighlight['type']) => {
        const renderedHighlights = preRenderHighlights([
          {
            id: faker.random.alphaNumeric(4),
            text: faker.lorem.paragraph(),
            note,
          },
        ]);

        expect(renderedHighlights[0].type).toBe(highlightType);
      }
    );

    it('Simple note concatenation', () => {
      const clippings: Highlight[] = [
        {
          id: faker.random.alphaNumeric(4),
          text: 'First sentence.',
          note: '.c1',
        },
        {
          id: faker.random.alphaNumeric(4),
          text: 'Second sentence',
          note: '.c2',
        },
      ];

      const renderedHighlights = preRenderHighlights(clippings);

      expect(renderedHighlights).toHaveLength(1);
      expect(renderedHighlights[0].text).toBe('First sentence... second sentence');
      expect(renderedHighlights[0].type).toBe('clipping');
      expect(renderedHighlights[0].note).toBeNull();
    });

    it('Multiple note concatenations', () => {
      const clippings: Highlight[] = [
        {
          id: faker.random.alphaNumeric(4),
          text: 'A normal note',
          note: ' My note   ',
        },
        {
          id: faker.random.alphaNumeric(4),
          text: 'Lone concat sentence.',
          note: '  .c1',
        },
        {
          id: faker.random.alphaNumeric(4),
          text: 'First sentence',
          note: '  .c1\n\nNote A',
        },
        {
          id: faker.random.alphaNumeric(4),
          text: 'Second sentence.',
          note: '.c2 Note B',
        },
      ];

      const renderedHighlights = preRenderHighlights(clippings);

      expect(renderedHighlights).toHaveLength(3);
      expect(renderedHighlights[0].text).toBe('A normal note');
      expect(renderedHighlights[0].note).toBe('My note');
      expect(renderedHighlights[1].text).toBe('Lone concat sentence.');
      expect(renderedHighlights[1].note).toBeNull();
      expect(renderedHighlights[2].text).toBe('First sentence... second sentence');
      expect(renderedHighlights[2].note).toBe('Note A\n\nNote B');
    });

    it('Multiple note concatenations - discontinued numbering', () => {
      const clippings: Highlight[] = [
        {
          id: faker.random.alphaNumeric(4),
          text: 'A normal note',
        },
        {
          id: faker.random.alphaNumeric(4),
          text: 'Lone concat sentence.',
          note: '.c1',
        },
        {
          id: faker.random.alphaNumeric(4),
          text: 'First sentence',
          note: '.c0',
        },
        {
          id: faker.random.alphaNumeric(4),
          text: 'Second sentence.',
          note: '.c3',
        },
        {
          id: faker.random.alphaNumeric(4),
          text: 'Discontinued sentence',
          note: '.c2',
        },
        {
          id: faker.random.alphaNumeric(4),
          text: 'Another normal note',
        },
      ];

      const renderedHighlights = preRenderHighlights(clippings);

      expect(renderedHighlights).toHaveLength(5);
      expect(renderedHighlights[0].text).toBe('A normal note');
      expect(renderedHighlights[1].text).toBe('Lone concat sentence.');
      expect(renderedHighlights[2].text).toBe('First sentence... second sentence');
      expect(renderedHighlights[3].text).toBe('Discontinued sentence');
      expect(renderedHighlights[4].text).toBe('Another normal note');
    });
  });
});
