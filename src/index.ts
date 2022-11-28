import { addIcon, Plugin } from 'obsidian';
import { get } from 'svelte/store';

import kindleIcon from '~/assets/kindleIcon.svg';
import SyncModal from '~/components/syncModal';
import { ee } from '~/eventEmitter';
import FileManager from '~/fileManager';
import { registerNotifications } from '~/notifications';
import { getRenderers } from '~/rendering';
import { SettingsTab } from '~/settings';
import { initializeStores, settingsStore } from '~/store';
import { SyncAmazon, SyncClippings, SyncManager } from '~/sync';

import '~/sentry';

addIcon('kindle', kindleIcon);

export default class KindlePlugin extends Plugin {
  public async onload(): Promise<void> {
    console.log('Kindle Highlights plugin: loading plugin', new Date().toLocaleString());

    const fileManager = this.createFileManager();

    await initializeStores(this, fileManager);

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

    this.addSettingTab(new SettingsTab(this.app, this, fileManager));

    registerNotifications();
    this.registerEvents();

    if (get(settingsStore).syncOnBoot) {
      await this.createSyncAmazon().startSync();
    }
  }

  private registerEvents(): void {
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        const fileManager = this.createFileManager();
        const kindleFile = fileManager.mapToKindleFile(file);
        if (kindleFile == null) {
          return;
        }

        menu.addItem((item) => {
          item
            .setTitle('Resync Kindle highlights in file')
            .setIcon('kindle')
            .setDisabled(kindleFile.book.asin == null)
            .onClick(async () => {
              await this.createSyncAmazon().resync(kindleFile);
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
      onOnlineSync: () => this.createSyncAmazon().startSync(),
      onMyClippingsSync: () => this.createSyncClippings().startSync(),
    }).show();
  }

  private createSyncAmazon(): SyncAmazon {
    const syncManager = this.createSyncManager();
    return new SyncAmazon(syncManager);
  }

  private createSyncClippings(): SyncClippings {
    const syncManager = this.createSyncManager();
    return new SyncClippings(syncManager);
  }

  private createSyncManager(): SyncManager {
    const { fileRenderer, highlightRenderer } = getRenderers();
    const fileManager = this.createFileManager();
    return new SyncManager(fileManager, fileRenderer, highlightRenderer);
  }

  private createFileManager(): FileManager {
    const { fileNameRenderer } = getRenderers();
    return new FileManager(this.app.vault, this.app.metadataCache, fileNameRenderer);
  }

  public onunload(): void {
    ee.removeAllListeners();
    console.log('Kindle Highlights plugin: unloading plugin', new Date().toLocaleString());
  }
}
