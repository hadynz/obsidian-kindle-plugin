import AmazonLoginModal from '~/components/amazonLoginModal';
import { ee } from '~/eventEmitter';
import type { Book, KindleFile } from '~/models';
import { scrapeBooks, scrapeHighlightsForBook } from '~/scraper';
import type { SyncManager } from '~/sync';
import { syncCancellation } from '~/sync/syncCancellation';

export default class SyncAmazon {
  constructor(private syncManager: SyncManager) {}

  public async startSync(): Promise<void> {
    if (syncCancellation.isActive) {
      console.warn('Kindle: Sync already in progress, ignoring request');
      return;
    }

    syncCancellation.start('amazon');
    ee.emit('syncSessionStart', 'amazon');

    const success = await this.login();

    if (syncCancellation.isCancelled) {
      syncCancellation.complete();
      return;
    }

    if (!success) {
      syncCancellation.reset();
      return;
    }

    try {
      ee.emit('fetchingBooks');

      const remoteBooks = await scrapeBooks();

      if (syncCancellation.isCancelled) {
        syncCancellation.complete();
        return;
      }

      const booksToSync = await this.syncManager.filterBooksToSync(remoteBooks);
      syncCancellation.setTotalCount(booksToSync.length);

      ee.emit('fetchingBooksSuccess', booksToSync, remoteBooks);

      if (booksToSync.length > 0) {
        await this.syncBooks(booksToSync);
      }

      if (syncCancellation.isCancelled) {
        syncCancellation.complete();
      } else {
        syncCancellation.reset();
        ee.emit('syncSessionSuccess');
      }
    } catch (error) {
      syncCancellation.reset();
      console.error('Error while trying fetch books and to sync', error);
      ee.emit('syncSessionFailure', String(error));
    }
  }

  public async resync(file: KindleFile): Promise<void> {
    if (syncCancellation.isActive) {
      console.warn('Kindle: Sync already in progress, ignoring resync request');
      return;
    }

    ee.emit('resyncBook', file);

    const success = await this.login();

    if (!success) {
      return;
    }

    try {
      const remoteBooks = await scrapeBooks();
      const remoteBook = remoteBooks.find((r) => r.id === file.book.id);

      const highlights = await scrapeHighlightsForBook(file.book);

      const diffs = await this.syncManager.resyncBook(file, remoteBook, highlights);

      ee.emit('resyncComplete', file, diffs.length);
    } catch (error) {
      console.error('Error resyncing higlights for file', file, error);
      ee.emit('resyncFailure', file, String(error));
    }
  }

  private async login(): Promise<boolean> {
    ee.emit('startLogin');

    const modal = new AmazonLoginModal();
    const success = await modal.doLogin();

    ee.emit('loginComplete', success);

    return success;
  }

  private async syncBooks(books: Book[]): Promise<void> {
    for (const [index, book] of books.entries()) {
      if (syncCancellation.isCancelled) {
        break;
      }

      try {
        ee.emit('syncBook', book, index);

        const highlights = await scrapeHighlightsForBook(
          book,
          () => syncCancellation.isCancelled
        );
        await this.syncManager.syncBook(book, highlights);

        syncCancellation.incrementSynced();
        ee.emit('syncBookSuccess', book, highlights);

        if (index < books.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error('Error syncing book', book, error);
        ee.emit('syncBookFailure', book, String(error));
      }
    }
  }
}
