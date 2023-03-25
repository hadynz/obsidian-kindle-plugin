jest.mock('~/fileManager');

import FileManager from '~/fileManager';
import type { Highlight, KindleFile } from '~/models';
import { HighlightRenderer } from '~/rendering/renderer';

import { DiffManager } from './';

const mockFileManager = (fileContent: string): jest.Mocked<FileManager> => {
  const mockedFileManager: jest.Mocked<FileManager> = new FileManager(
    null,
    null,
    null
  ) as jest.Mocked<FileManager>;

  mockedFileManager.readFile.mockImplementation(() => Promise.resolve(fileContent));

  return mockedFileManager;
};

const diff = async (
  originalContent: string,
  remoteHighlights: Highlight[],
  highlightTemplate = '- {{ text }}'
) => {
  const highlightRenderer = new HighlightRenderer(highlightTemplate);

  const fileManagerMock = mockFileManager(originalContent);

  const file: KindleFile = {
    file: null,
    book: { id: 'A', title: 'My Book', author: 'My Author' },
    frontmatter: null,
  };

  const diffManager = await DiffManager.create(highlightRenderer, fileManagerMock, file);
  return diffManager.diff(remoteHighlights);
};

const applyDiffs = async (
  originalContent: string,
  remoteHighlights: Highlight[],
  highlightTemplate = '- {{ text }}'
): Promise<jest.Mocked<FileManager>> => {
  const highlightRenderer = new HighlightRenderer(highlightTemplate);

  const fileManagerMock = mockFileManager(originalContent);

  const file: KindleFile = {
    file: null,
    book: { id: 'A', title: 'My Book', author: 'My Author' },
    frontmatter: null,
  };

  const diffManager = await DiffManager.create(highlightRenderer, fileManagerMock, file);
  const diffResults = diffManager.diff(remoteHighlights);
  await diffManager.applyDiffs(null, [], diffResults);

  return fileManagerMock;
};

describe('DiffManager', () => {
  describe('diff', () => {
    it('New highlights are correctly flagged for syncing in the right locations', async () => {
      const remotes: Highlight[] = [
        { id: 'A', text: 'any highlight' },
        { id: 'B', text: 'any highlight' },
        { id: 'C', text: 'any highlight' },
        { id: 'D', text: 'any highlight' },
        { id: 'E', text: 'any highlight' },
        { id: 'F', text: 'any highlight' },
      ];

      const renderedFile = `
- Highlight B ^ref-B
- Highlight E ^ref-E
`;

      const diffResults = await diff(renderedFile, remotes);

      expect(diffResults).toHaveLength(4);

      expect(diffResults[0].highlight.id).toEqual('A');
      expect(diffResults[0].successorSibling.highlightId).toEqual('B');
      expect(diffResults[0].successorSibling.line).toEqual(2);

      expect(diffResults[1].highlight.id).toEqual('C');
      expect(diffResults[1].successorSibling.highlightId).toEqual('E');
      expect(diffResults[1].successorSibling.line).toEqual(3);

      expect(diffResults[2].highlight.id).toEqual('D');
      expect(diffResults[2].successorSibling.highlightId).toEqual('E');
      expect(diffResults[2].successorSibling.line).toEqual(3);

      expect(diffResults[3].highlight.id).toEqual('F');
      expect(diffResults[3].successorSibling).toBeNull();
    });

    it('3-level headings are parsed as potential header highlights correctly', async () => {
      const remotes: Highlight[] = [
        { id: 'A', text: 'Header A', note: '.h1' },
        { id: 'B', text: 'Highlight B' },
        { id: 'C', text: 'Header B', note: '.h1' },
        { id: 'D', text: 'Header C', note: '.h2' },
        { id: 'E', text: 'Highlight E' },
        { id: 'F', text: 'Header D', note: '.h1' },
      ];

      const renderedFile = `
## Highlights

### Header A

- Highlight B ^ref-B

#### Header C

- Highlight E ^ref-E
`;

      const diffResults = await diff(renderedFile, remotes);

      expect(diffResults).toHaveLength(2);

      expect(diffResults[0].highlight.id).toEqual('A');
      expect(diffResults[0].successorSibling.highlightId).toEqual('B');
      expect(diffResults[0].successorSibling.line).toEqual(2);

      expect(diffResults[1].highlight.id).toEqual('C');
      expect(diffResults[1].successorSibling.highlightId).toEqual('E');
      expect(diffResults[1].successorSibling.line).toEqual(3);

      expect(diffResults[2].highlight.id).toEqual('D');
      expect(diffResults[2].successorSibling.highlightId).toEqual('E');
      expect(diffResults[2].successorSibling.line).toEqual(3);

      expect(diffResults[3].highlight.id).toEqual('F');
      expect(diffResults[3].successorSibling).toBeNull();
    });
  });

  describe('applyDiffs', () => {
    it('New highlights are correctly inserted and appended', async () => {
      const remotes: Highlight[] = [
        { id: 'A', text: 'New some text' },
        { id: 'B', text: 'Existing highlight' },
        { id: 'C', text: 'New some text' },
        { id: 'D', text: 'New some text' },
        { id: 'E', text: 'Existing highlight' },
        { id: 'F', text: 'New some text' },
      ];
      const renderedFile = `
- Existing highlight B ^ref-B
- Existing highlight E ^ref-E`;

      const fileManagerMock = await applyDiffs(renderedFile, remotes);
      const updatedFileContents = fileManagerMock.updateFile.mock.calls[0][2];
      expect(updatedFileContents).toEqual(`
- New some text ^ref-A
- Existing highlight B ^ref-B
- New some text ^ref-C
- New some text ^ref-D
- Existing highlight E ^ref-E
- New some text ^ref-F`);
    });

    it('Headings are inserted in the correct locations before/middle/after', async () => {
      const remotes: Highlight[] = [
        { id: 'H1', text: 'My Heading A', note: '.h1' },
        { id: 'B', text: 'Existing highlight' },
        { id: 'H2', text: 'My Heading B', note: '.h1' },
        { id: 'E', text: 'Existing highlight' },
        { id: 'H3', text: 'My Heading C', note: '.h1' },
      ];
      const renderedFile = `
- Highlight B ^ref-B
- Highlight E ^ref-E`;

      const fileManagerMock = await applyDiffs(renderedFile, remotes);
      const updatedFileContents = fileManagerMock.updateFile.mock.calls[0][2];
      expect(updatedFileContents).toEqual(`

### My Heading A

- Highlight B ^ref-B

### My Heading B

- Highlight E ^ref-E

### My Heading C
`);
    });

    it('Highlights with existing heading results in no change', async () => {
      const remotes: Highlight[] = [
        { id: 'B', text: 'Existing highlight' },
        { id: 'H1', text: 'My Heading', note: '.h1' },
        { id: 'E', text: 'Existing highlight' },
      ];
      const renderedFile = `
- Highlight B ^ref-B

### My Heading

- Highlight E ^ref-E`;

      const fileManagerMock = await applyDiffs(renderedFile, remotes);
      const updatedFileContents = fileManagerMock.updateFile.mock.calls[0][2];
      expect(updatedFileContents).toEqual(renderedFile);
    });
  });
});
