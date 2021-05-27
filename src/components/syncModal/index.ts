import { App, Modal } from 'obsidian';
import { get } from 'svelte/store';

import SyncModalContent from './SyncModalContent.svelte';
import { settingsStore, syncSessionStore } from '~/store';
import type { SyncMode } from '~/models';

export type SyncModalState =
  | 'first-time'
  | 'syncing'
  | 'idle'
  | 'choose-sync-method';

const SyncModalTitle: Record<SyncModalState, string> = {
  'first-time': '',
  idle: 'Your Kindle highlights',
  syncing: 'Syncing data...',
  'choose-sync-method': 'Choose a sync method...',
};

type SyncModalProps = {
  onOnlineSync: () => void;
  onMyClippingsSync: () => void;
};

export default class SyncModal extends Modal {
  public waitForClose: Promise<void>;
  private resolvePromise!: () => void;
  private modalContent: SyncModalContent;

  constructor(app: App, props: SyncModalProps) {
    super(app);

    this.waitForClose = new Promise(
      (resolve) => (this.resolvePromise = resolve)
    );

    this.modalContent = new SyncModalContent({
      target: this.contentEl,
      props: {
        setModalTitle: (modalState: SyncModalState) => {
          this.setModalTitle(modalState);
        },
        onDone: () => {
          this.close();
          syncSessionStore.actions.reset();
        },
        onClick: (mode: SyncMode) => {
          if (mode === 'amazon') {
            props.onOnlineSync();
          } else {
            props.onMyClippingsSync();
          }
        },
      },
    });

    this.susbcribeToStores();
    this.open();
  }

  private susbcribeToStores(): void {
    const updateModal = () => {
      const modalState = this.getSyncModalState();
      this.setModalTitle(modalState);
      this.modalContent.$set({ modalState });
    };

    settingsStore.subscribe(updateModal);
    syncSessionStore.subscribe(updateModal);
  }

  private setModalTitle(modalState: SyncModalState): void {
    this.titleEl.innerText = SyncModalTitle[modalState];
  }

  private getSyncModalState(): SyncModalState {
    if (!get(settingsStore).lastSyncDate) {
      return 'first-time';
    }
    return get(syncSessionStore).status === 'idle' ? 'idle' : 'syncing';
  }

  onClose(): void {
    super.onClose();
    this.modalContent.$destroy();
    this.resolvePromise();
  }
}
