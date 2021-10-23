import { App, Modal } from 'obsidian';
import { get } from 'svelte/store';

import SyncModalContent from './SyncModalContent.svelte';
import { settingsStore, syncSessionStore } from '~/store';
import type { SyncMode } from '~/models';
import type FileManager from '~/fileManager';

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

// TODO: This class needs to be refactored
export default class SyncModal extends Modal {
  private modalContent: SyncModalContent;

  constructor(
    app: App,
    private fileManager: FileManager,
    private props: SyncModalProps
  ) {
    super(app);
  }

  public async show(): Promise<void> {
    const kindleFiles = await this.fileManager.getKindleFiles();

    this.modalContent = new SyncModalContent({
      target: this.contentEl,
      props: {
        modalState: this.getSyncModalState(),
        booksCount: kindleFiles.length,
        setModalTitle: (modalState: SyncModalState) => {
          this.setModalTitle(modalState);
        },
        onDone: () => {
          this.close();
          syncSessionStore.actions.reset();
        },
        onClick: (mode: SyncMode) => {
          if (mode === 'amazon') {
            this.props.onOnlineSync();
          } else {
            this.props.onMyClippingsSync();
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
  }
}
