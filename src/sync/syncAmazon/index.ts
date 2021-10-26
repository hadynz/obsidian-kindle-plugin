import AmazonLoginModal from '~/components/amazonLoginModal';
import { scrapeHighlightsForBook, scrapeBooks } from '~/scraper';
import { ee } from '~/eventEmitter';
import type { SyncManager } from '~/sync';
import type { Book } from '~/models';
import type { KindleFile } from '~/fileManager';

export default class SyncAmazon {
  constructor(private syncManager: SyncManager) {}

  public async startSync(): Promise<void> {
    ee.emit('syncSessionStart', 'amazon');

    const success = await this.login();

    if (!success) {
      return; // Do nothing...
    }

    try {
      ee.emit('fetchingBooks');

      const remoteBooks = await scrapeBooks();
      const booksToSync = await this.syncManager.filterBooksToSync(remoteBooks);

      ee.emit('fetchingBooksSuccess', booksToSync, remoteBooks);

      if (booksToSync.length > 0) {
        await this.syncBooks(booksToSync);
      }

      ee.emit('syncSessionSuccess');
    } catch (error) {
      ee.emit('syncSessionFailure', String(error));
    }
  }

  public async resync(file: KindleFile): Promise<void> {
    const success = await this.login();

    if (!success) {
      return; // Do nothing...
    }

    try {
      ee.emit('resyncBook', file);

      const remoteBooks = await scrapeBooks();
      const remoteBook = remoteBooks.find((r) => r.id === file.book.id);

      const highlights = await scrapeHighlightsForBook(file.book);

      const diffs = await this.syncManager.resyncBook(
        file,
        remoteBook,
        highlights
      );

      ee.emit('resyncComplete', file, diffs.length);
    } catch (error) {
      ee.emit('resyncFailure', file, String(error));
    }
  }

  private async login(): Promise<boolean> {
    ee.emit('login');

    const modal = new AmazonLoginModal();
    const success = await modal.doLogin();

    ee.emit('loginComplete', success);

    return success;
  }

  private async syncBooks(books: Book[]): Promise<void> {
    for (const [index, book] of books.entries()) {
      try {
        ee.emit('syncBook', book, index);

        const highlights = await scrapeHighlightsForBook(book);
        await this.syncManager.syncBook(book, highlights);

        ee.emit('syncBookSuccess', book, highlights);
      } catch (error) {
        ee.emit('syncBookFailure', book, String(error));
      }
    }
  }
}
