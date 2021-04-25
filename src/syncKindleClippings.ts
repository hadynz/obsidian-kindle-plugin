import * as kc from '@darylserrano/kindle-clippings';
import fs from 'fs';
import { remote } from 'electron';

import FileManager from './fileManager';
import { Book, Highlight, BookHighlight } from './models';
import { Renderer } from './renderer';

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
    };

    const highlights = entries
      .filter((entry) => entry.type === 'HIGHLIGHT')
      .map(
        (entry): Highlight => ({
          text: entry.content,
          location: parseInt(entry.location),
          page: entry.page,
        }),
      );

    return {
      book,
      highlights,
    };
  });
};

export default class SyncKindleClippings {
  private fileManager: FileManager;

  private renderer: Renderer;

  constructor(fileManager: FileManager) {
    this.fileManager = fileManager;

    this.renderer = new Renderer();
  }

  async startSync(): Promise<void> {
    const [clippingsFile, canceled] = await openDialog();

    if (canceled) {
      return; // Do nothing...
    }

    const books = await parseBooks(clippingsFile);

    for (const book of books) {
      await this.writeBook(book);
    }
  }

  async writeBook(entry: BookHighlight): Promise<void> {
    const content = this.renderer.render(entry);
    await this.fileManager.writeNote(entry.book.title, content);
  }
}
