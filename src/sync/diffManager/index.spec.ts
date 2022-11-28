jest.mock('~/fileManager');

import FileManager from '~/fileManager';
import type { Highlight, KindleFile } from '~/models';
import { HighlightRenderer } from '~/rendering/renderer';

import { DiffManager } from './';

const mockHighlights = (ids: string[]): Highlight[] => {
  return ids.map((id) => ({ id, text: 'highlighted text' }));
};

const mockFileManager = (fileContent: string): jest.Mocked<FileManager> => {
  const mockedFileManager: jest.Mocked<FileManager> = new FileManager(
    null,
    null,
    null
  ) as jest.Mocked<FileManager>;

  mockedFileManager.readFile.mockImplementation(() => Promise.resolve(fileContent));

  return mockedFileManager;
};

describe('DiffManager', () => {
  describe('diff', () => {
    it('New highlights are correctly flagged for syncing in the right locations', async () => {
      const remotes = mockHighlights(['A', 'B', 'C', 'D', 'E', 'F']);
      const renderedFile = `
- Highlight B ^ref-B
- Highlight E ^ref-E
`;

      const highlightRenderer = new HighlightRenderer('- {{ text }}');
      const fileManagerMock = mockFileManager(renderedFile);
      const diffManager = await DiffManager.create(highlightRenderer, fileManagerMock, null);
      const diffResults = diffManager.diff(remotes);

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
  });

  describe('applyDiffs', () => {
    it('New highlights are correctly flagged for syncing in the right locations', async () => {
      const highlightRenderer = new HighlightRenderer('- {{ text }}');
      const remotes = mockHighlights(['A', 'B', 'C', 'D', 'E', 'F']);
      const renderedFile = `
- Highlight B ^ref-B
- Highlight E ^ref-E
`;

      const fileManagerMock = mockFileManager(renderedFile);
      const file: KindleFile = {
        file: null,
        book: { id: 'A', title: 'My Book', author: 'My Author' },
        frontmatter: null,
      };
      const diffManager = await DiffManager.create(highlightRenderer, fileManagerMock, file);
      const diffResults = diffManager.diff(remotes);
      await diffManager.applyDiffs(null, [], diffResults);

      const updatedFileContents = fileManagerMock.updateFile.mock.calls[0][2];
    });
  });
});
