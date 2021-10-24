import faker from 'faker';

import { sb } from '~/utils';

describe('StringBuffer', () => {
  describe('insertLinesAt', () => {
    it('Add a single line mid string', () => {
      const content = `Line 1
Line 2
Line 3`;

      const expected = `Line 1
Line 1a
Line 2
Line 3`;

      const actual = sb(content)
        .insertLinesAt([{ line: 2, content: 'Line 1a' }])
        .toString();

      expect(actual).toEqual(expected);
    });

    it('Add a single line at the start of string', () => {
      const content = `Line 1
Line 2
Line 3`;

      const expected = `Line 1a
Line 1
Line 2
Line 3`;

      const actual = sb(content)
        .insertLinesAt([{ line: 1, content: 'Line 1a' }])
        .toString();

      expect(actual).toEqual(expected);
    });

    it('Line numbers must start at 1', () => {
      expect(() => {
        sb(faker.datatype.string()).insertLinesAt([
          { line: 2, content: faker.datatype.string() },
          { line: 0, content: faker.datatype.string() },
        ]);
      }).toThrow('Line numbers must start from 1');
    });

    it('Inserting multiple lines in document', () => {
      const content = `Line 1
Line 2
Line 3`;

      const expected = `Before Line 1
Line 1
After Line 1
Line 2
After Line 2
Line 3`;

      const actual = sb(content)
        .insertLinesAt([
          { line: 1, content: 'Before Line 1' },
          { line: 2, content: 'After Line 1' },
          { line: 3, content: 'After Line 2' },
        ])
        .toString();

      expect(actual).toEqual(expected);
    });

    it('Inserting multiple subsequent lines at the same location', () => {
      const content = `Line 1
Line 2
Line 3`;

      const expected = `Line 1
Line 2
Line 2a
Line 2b
Line 3`;

      const actual = sb(content)
        .insertLinesAt([
          { line: 3, content: 'Line 2a' },
          { line: 3, content: 'Line 2b' },
        ])
        .toString();

      expect(actual).toEqual(expected);
    });
  });

  describe('append', () => {
    it('Append multiple lines to a string', () => {
      const content = `Line 1
Line 2
Line 3`;

      const expected = `Line 1
Line 2
Line 3
hello
there`;

      const actual = sb(content).append(['hello', 'there']).toString();

      expect(actual).toEqual(expected);
    });
  });

  describe('getLine', () => {
    it('Append multiple lines to a string', () => {
      const content = `Line 1
Line 2
Line 3`;

      expect(sb(content).getLine(1)).toEqual('Line 1');
      expect(sb(content).getLine(2)).toEqual('Line 2');
      expect(sb(content).getLine(3)).toEqual('Line 3');
    });

    it('Append multiple lines to a string', () => {
      expect(() => {
        sb(faker.datatype.string()).getLine(0);
      }).toThrow('Line numbers must start from 1');
    });
  });
});
