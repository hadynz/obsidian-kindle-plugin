import { App, Modal } from 'obsidian';

import SyncModalContent from '../../components/SyncModalContent.svelte';
import { PluginSettings } from '../../settings';

export default class SyncModal extends Modal {
  public waitForClose: Promise<void>;
  private resolvePromise!: () => void;
  private modalContent: SyncModalContent;

  private DEFAULT_MODAL_TITLE = 'Sync your Kindle highlights';
  private SYNCING_MODAL_TITLE = 'Syncing data...';

  constructor(app: App, settings: PluginSettings) {
    super(app);

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
        cancelSync: () => {
          this.stopSync();
        },
        sync: () => {
          this.startSync();
        },
      },
    });

    this.open();
  }

  stopSync(): void {
    this.titleEl.innerText = this.DEFAULT_MODAL_TITLE;
    this.modalContent.$set({
      isSyncing: false,
    });
  }

  startSync(): void {
    this.titleEl.innerText = this.SYNCING_MODAL_TITLE;
    this.modalContent.$set({
      isSyncing: true,
    });
  }

  onClose(): void {
    super.onClose();
    this.modalContent.$destroy();
    this.resolvePromise();
  }
}
