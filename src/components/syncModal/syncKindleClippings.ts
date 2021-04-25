import * as kc from '@darylserrano/kindle-clippings';
import fs from 'fs';
import { remote } from 'electron';

import { Book, Highlight, BookHighlight } from '../../models';

const { dialog } = remote;

type DialogResponse = [file: string, canceled: boolean];

const openDialog = async (): Promise<DialogResponse> => {
  const result = await dialog.showOpenDialog(remote.getCurrentWindow(), {
    filters: [{ name: 'Text file', extensions: ['txt'] }],
    properties: ['openFile'],
  });

  if (result.canceled === true) {
    return ['', true];
  }

  return [result.filePaths[0], false];
};

const parseBooks = async (file: string): Promise<BookHighlight[]> => {
  const clippingsFileContent = fs.readFileSync(file, 'utf8');

  const rawRows = kc.readKindleClipping(clippingsFileContent);
  const parsedRows = kc.parseKindleEntries(rawRows);
  const rowsByBookTitle = kc.organizeKindleEntriesByBookTitle(parsedRows);

  return Array.from(rowsByBookTitle.values()).map((entries) => {
    const firstRow = entries[0];

    const book: Book = {
      title: firstRow.bookTile,
      author: firstRow.authors,
      asin: '',
      url: '',
      imageUrl: '',
      lastAccessedDate: '',
    };

    const highlights = entries
      .filter((e) => e.type === 'HIGHLIGHT')
      .map(
        (e): Highlight => ({
          id: '',
          text: e.content,
          location: parseInt(e.location),
          page: e.page,
        }),
      );

    return {
      book,
      highlights,
    };
  });
};

const syncKindleClippings = async (): Promise<void> => {
  const [clippingsFile, canceled] = await openDialog();

  if (canceled) {
    return; // Do nothing...
  }

  const books = await parseBooks(clippingsFile);
  console.log('books', books);
};

export default syncKindleClippings;
