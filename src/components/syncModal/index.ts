import { App, Modal } from 'obsidian';

import SyncModalContent from './SyncModalContent.svelte';
import { syncSessionStore } from '../../store';

type SyncModalProps = {
  onOnlineSync: () => void;
  onMyClippingsSync: () => void;
};

export default class SyncModal extends Modal {
  public waitForClose: Promise<void>;
  private resolvePromise!: () => void;
  private modalContent: SyncModalContent;

  private DEFAULT_MODAL_TITLE = 'Sync your Kindle highlights';
  private SYNCING_MODAL_TITLE = 'Syncing data...';

  constructor(app: App, props: SyncModalProps) {
    super(app);

    this.waitForClose = new Promise(
      (resolve) => (this.resolvePromise = resolve)
    );

    syncSessionStore.subscribe((state) => {
      this.titleEl.innerText =
        state.status === 'loading'
          ? this.SYNCING_MODAL_TITLE
          : this.DEFAULT_MODAL_TITLE;
    });

    this.modalContent = new SyncModalContent({
      target: this.contentEl,
      props: {
        startSync: props.onOnlineSync,
        startUpload: props.onMyClippingsSync,
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
