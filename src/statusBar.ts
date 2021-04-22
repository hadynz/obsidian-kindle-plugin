import { TinyEmitter } from 'tiny-emitter';

import StatusBarContent from './components/StatusBar.svelte';
import { santizeTitle } from './fileManager';
import { Book } from './models';
import { PluginSettings } from './settings';

const moment = window.moment;

export class StatusBar {
  private el: HTMLElement;
  private cmp: StatusBarContent;
  private settings: PluginSettings;
  private emitter: TinyEmitter;

  constructor(el: HTMLElement, settings: PluginSettings, emitter: TinyEmitter) {
    this.settings = settings;
    this.emitter = emitter;
    this.el = el;

    this.el.addClass('mod-clickable');

    const text = this.defaultText();

    this.cmp = new StatusBarContent({
      target: this.el,
      props: {
        text,
        isSyncing: false,
      },
    });

    this.setupListeners();
  }

  private defaultText(): string {
    return `${
      this.settings.synchedBookAsins.length
    } book(s) synced. Last sync ${moment(
      this.settings.lastSyncDate,
    ).fromNow()}`;
  }

  private setupListeners(): void {
    this.emitter.on('sync-start', () => {
      this.cmp.$set({ text: 'Starting sync...', isSyncing: true });
    });

    this.emitter.on('sync-books', (books: Book[]) => {
      let text = `Found ${books.length} books to sync`;
      if (books.length === 1) {
        text = 'Found 1 book to sync';
      }

      this.cmp.$set({ text });
    });

    this.emitter.on('sync-book-start', (book: Book) =>
      this.cmp.$set({ text: `Syncing "${santizeTitle(book.title)}"` }),
    );

    this.emitter.on('sync-complete', (books: Book[]) => {
      let text = `${books.length} books synced`;
      if (books.length === 0) {
        text = 'No highlights synced';
      } else if (books.length == 1) {
        text = '1 book synced';
      }

      this.cmp.$set({ text: `Sync complete. ${text}`, isSyncing: false });

      setTimeout(() => {
        this.cmp.$set({ text: this.defaultText() });
      }, 5000);
    });
  }

  public onClick(callback: () => void): void {
    this.el.onClickEvent(callback);
  }
}
