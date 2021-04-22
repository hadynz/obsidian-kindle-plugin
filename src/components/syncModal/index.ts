import { App, Modal } from 'obsidian';

import SyncModalContent from './SyncModalContent.svelte';
import store from '../../store';

export default class SyncModal extends Modal {
  public waitForClose: Promise<void>;
  private resolvePromise!: () => void;
  private modalContent: SyncModalContent;

  private DEFAULT_MODAL_TITLE = 'Sync your Kindle highlights';
  private SYNCING_MODAL_TITLE = 'Syncing data...';

  constructor(app: App, startSync: () => void) {
    super(app);

    this.waitForClose = new Promise(
      (resolve) => (this.resolvePromise = resolve),
    );

    store.subscribe((state) => {
      this.titleEl.innerText =
        state.status === 'loading'
          ? this.SYNCING_MODAL_TITLE
          : this.DEFAULT_MODAL_TITLE;
    });

    this.modalContent = new SyncModalContent({
      target: this.contentEl,
      props: {
        startSync,
      },
    });

    this.open();
  }

  onClose(): void {
    super.onClose();
    this.modalContent.$destroy();
    this.resolvePromise();
  }
}
