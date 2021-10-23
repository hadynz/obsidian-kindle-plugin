import AmazonLoginModal from '~/components/amazonLoginModal';
import { scrapeHighlightsForBook, scrapeBooks } from '~/scraper';
import { ee } from '~/eventEmitter';
import type { SyncManager } from '~/sync';
import type { Book } from '~/models';
import type { KindleFile } from '~/fileManager';

export default class SyncAmazon {
  constructor(private syncManager: SyncManager) {}

  public async startSync(): Promise<void> {
    const success = await this.login();

    if (!success) {
      return; // Do nothing...
    }

    try {
      ee.emit('syncStart', 'amazon');

      const remoteBooks = await scrapeBooks();

      if (remoteBooks.length > 0) {
        await this.syncBooks([remoteBooks[0]]);
      }

      ee.emit('syncSuccess');
    } catch (error) {
      ee.emit('syncFailure', error);
    }
  }

  public async resync(file: KindleFile): Promise<void> {
    const success = await this.login();

    if (!success) {
      return; // Do nothing...
    }

    try {
      ee.emit('resyncBook', file);

      const highlights = await scrapeHighlightsForBook(file.book);
      const diffs = await this.syncManager.resyncBook(file, highlights);

      ee.emit('resyncComplete', file, diffs.length);
    } catch (error) {
      ee.emit('resyncFailure', file, error);
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
    for (const book of books) {
      try {
        ee.emit('syncBook', book);

        const highlights = await scrapeHighlightsForBook(book);
        await this.syncManager.syncBook(book, highlights);

        ee.emit('syncBookSuccess', book, highlights);
      } catch (error) {
        ee.emit('syncBookFailure', book, error);
      }
    }
  }
}
