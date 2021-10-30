import { addIcon, Plugin } from 'obsidian';
import { get } from 'svelte/store';

import FileManager from '~/fileManager';
import SyncModal from '~/components/syncModal';
import { SettingsTab } from '~/settingsTab';
//import { StatusBar } from '~/components/statusBar';
import { initializeStores, settingsStore } from '~/store';
import { SyncAmazon, SyncClippings, SyncManager } from '~/sync';
import { registerNotifications } from '~/notifications';
import kindleIcon from '~/assets/kindleIcon.svg';
import { ee } from '~/eventEmitter';

addIcon('kindle', kindleIcon);

export default class KindlePlugin extends Plugin {
  private fileManager!: FileManager;
  private syncAmazon!: SyncAmazon;
  private syncClippings!: SyncClippings;

  public async onload(): Promise<void> {
    console.log('Kindle Highlights plugin: loading plugin', new Date().toLocaleString());

    this.fileManager = new FileManager(this.app.vault, this.app.metadataCache);
    const syncManager = new SyncManager(this.app, this.fileManager);

    await initializeStores(this, this.fileManager);

    this.syncAmazon = new SyncAmazon(syncManager);
    this.syncClippings = new SyncClippings(syncManager);

    // new StatusBar(this.addStatusBarItem(), () => {
    //   this.showSyncModal();
    // });

    this.addRibbonIcon('kindle', 'Sync your Kindle highlights', () => {
      this.showSyncModal();
    });

    this.addCommand({
      id: 'kindle-sync',
      name: 'Sync highlights',
      callback: () => {
        this.showSyncModal();
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
            .setTitle('Resync Kindle highlights')
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

  private showSyncModal(): void {
    new SyncModal(this.app, {
      onOnlineSync: () => this.startAmazonSync(),
      onMyClippingsSync: () => this.syncClippings.startSync(),
    }).show();
  }

  private startAmazonSync(): void {
    this.syncAmazon.startSync();
  }

  public async onunload(): Promise<void> {
    ee.removeAllListeners();

    console.log('Kindle Highlights plugin: unloading plugin', new Date().toLocaleString());
  }
}
