import AmazonLoginModal from '~/components/amazonLoginModal';
import { scrapeHighlightsForBook, scrapeBooks } from '~/scraper';
import type { SyncManager } from '~/sync';
import type { Book } from '~/models';

export default class SyncAmazon {
  constructor(private syncManager: SyncManager) {}

  public async startSync(): Promise<void> {
    const success = await this.login();

    if (!success) {
      return; // Do nothing...
    }

    const remoteBooks = await scrapeBooks();
    await this.syncBooks([remoteBooks[0]]);
  }

  private async login(): Promise<boolean> {
    const modal = new AmazonLoginModal();
    return await modal.doLogin();
  }

  private async syncBooks(books: Book[]): Promise<void> {
    for (const book of books) {
      try {
        const highlights = await scrapeHighlightsForBook(book);
        await this.syncManager.syncBook(book, highlights);
      } catch (error) {
        console.error(`Error syncing ${book.title}`, error);
      }
    }
  }
}
