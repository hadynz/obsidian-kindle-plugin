import FileManager from '../../fileManager';
import { BookHighlight } from '../../models';
import { Renderer } from '../../renderer';
import { openDialog } from './openDialog';
import { parseBooks } from './parseBooks';

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

  private async writeBook(entry: BookHighlight): Promise<void> {
    const content = this.renderer.render(entry);
    await this.fileManager.writeNote(entry.book.title, content);
  }
}
