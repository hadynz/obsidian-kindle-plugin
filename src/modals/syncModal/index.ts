import { TinyEmitter } from 'tiny-emitter';
import { App, Modal } from 'obsidian';

import SyncModalContent from '../../components/SyncModalContent.svelte';
import { santizeTitle } from '../../fileManager';
import { PluginSettings } from '../../settings';
import { Book } from '../../models';

export default class SyncModal extends Modal {
  public waitForClose: Promise<void>;
  private resolvePromise!: () => void;
  private modalContent: SyncModalContent;
  private emitter: TinyEmitter;

  private DEFAULT_MODAL_TITLE = 'Sync your Kindle highlights';
  private SYNCING_MODAL_TITLE = 'Syncing data...';

  constructor(app: App, settings: PluginSettings, emitter: TinyEmitter) {
    super(app);

    this.emitter = emitter;

    this.waitForClose = new Promise(
      (resolve) => (this.resolvePromise = resolve),
    );

    const isSyncing = false;

    this.titleEl.innerText = isSyncing
      ? this.SYNCING_MODAL_TITLE
      : this.DEFAULT_MODAL_TITLE;

    this.modalContent = new SyncModalContent({
      target: this.contentEl,
      props: {
        isSyncing: false,
        booksSyncCount: settings.synchedBookAsins.length,
        lastSyncDate: settings.lastSyncDate,
        startSync: () => {
          this.startSync();
        },
      },
    });

    this.setupListeners();

    this.open();
  }

  private setupListeners(): void {
    this.emitter.on('sync-start', () => {
      this.titleEl.innerText = this.SYNCING_MODAL_TITLE;
      this.modalContent.$set({
        isSyncing: true,
      });
    });

    this.emitter.on('sync-book-start', (book: Book) =>
      this.modalContent.$set({
        currentBookTitle: santizeTitle(book.title),
      }),
    );

    this.emitter.on('sync-complete', () => {
      this.titleEl.innerText = this.DEFAULT_MODAL_TITLE;
      this.modalContent.$set({
        isSyncing: false,
      });
    });
  }

  startSync(): void {
    this.emitter.emit('start-sync');
  }

  onClose(): void {
    super.onClose();
    this.modalContent.$destroy();
    this.resolvePromise();
  }
}
