import { addIcon, Plugin } from 'obsidian';
import { get } from 'svelte/store';

import kindleIcon from '~/assets/kindleIcon.svg';
import SyncModal from '~/components/syncModal';
import { ee } from '~/eventEmitter';
import FileManager from '~/fileManager';
import { registerNotifications } from '~/notifications';
import { SettingsTab } from '~/settings';
import { initializeStores, settingsStore } from '~/store';
import { SyncAmazon, SyncClippings, SyncManager } from '~/sync';

addIcon('kindle', kindleIcon);

export default class KindlePlugin extends Plugin {
  private fileManager!: FileManager;
  private syncAmazon!: SyncAmazon;
  private syncClippings!: SyncClippings;

  public async onload(): Promise<void> {
    console.log('Kindle Highlights plugin: loading plugin', new Date().toLocaleString());

    this.fileManager = new FileManager(this.app.vault, this.app.metadataCache);
    const syncManager = new SyncManager(this.fileManager);

    await initializeStores(this, this.fileManager);

    this.syncAmazon = new SyncAmazon(syncManager);
    this.syncClippings = new SyncClippings(syncManager);

    this.addRibbonIcon('kindle', 'Sync your Kindle highlights', async () => {
      await this.showSyncModal();
    });

    this.addCommand({
      id: 'kindle-sync',
      name: 'Sync highlights',
      callback: async () => {
        await this.showSyncModal();
      },
    });

    this.addCommand({
      id: 'kindle-sync-amazon',
      name: 'Sync highlights from Amazon',
      callback: async () => {
        await this.startAmazonSync();
      },
    });

    this.addSettingTab(new SettingsTab(this.app, this, this.fileManager));

    registerNotifications();
    this.registerEvents();

    if (get(settingsStore).syncOnBoot) {
      await this.startAmazonSync();
    }
  }

  private registerEvents(): void {
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        const kindleFile = this.fileManager.mapToKindleFile(file);
        if (kindleFile == null) {
          return;
        }

        menu.addItem((item) => {
          item
            .setTitle('Resync Kindle highlights in file')
            .setIcon('kindle')
            .setDisabled(kindleFile.book.asin == null)
            .onClick(async () => {
              await this.syncAmazon.resync(kindleFile);
            });
        });
      })
    );

    this.app.workspace.onLayoutReady(() => {
      ee.emit('obsidianReady');
    });
  }

  private async showSyncModal(): Promise<void> {
    await new SyncModal(this.app, {
      onOnlineSync: () => this.startAmazonSync(),
      onMyClippingsSync: () => this.syncClippings.startSync(),
    }).show();
  }

  private async startAmazonSync(): Promise<void> {
    await this.syncAmazon.startSync();
  }

  public onunload(): void {
    ee.removeAllListeners();
    console.log('Kindle Highlights plugin: unloading plugin', new Date().toLocaleString());
  }
}
