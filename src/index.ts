import { Plugin, addIcon } from 'obsidian';
import { get } from 'svelte/store';

import FileManager from '~/fileManager';
import SyncModal from '~/components/syncModal';
import { SettingsTab } from '~/settingsTab';
import { StatusBar } from '~/components/statusBar';
import { initialise, settingsStore } from '~/store';
import { SyncAmazon, SyncClippings } from '~/sync';
import kindleIcon from '~/assets/kindleIcon.svg';

addIcon('kindle', kindleIcon);

export default class KindlePlugin extends Plugin {
  private syncAmazon!: SyncAmazon;
  private syncClippings!: SyncClippings;

  async onload(): Promise<void> {
    console.log('loading plugin', new Date().toLocaleString());

    await initialise(this);

    const fileManager = new FileManager(this.app.vault, this.app.metadataCache);
    await this.testCode(fileManager);

    this.syncAmazon = new SyncAmazon(fileManager);
    this.syncClippings = new SyncClippings(fileManager);

    new StatusBar(this.addStatusBarItem(), () => {
      this.showSyncModal();
    });

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

    this.addSettingTab(new SettingsTab(this.app, this));

    if (get(settingsStore).syncOnBoot) {
      await this.startAmazonSync();
    }
  }

  async testCode(fileManager: FileManager): Promise<void> {
    const files = await fileManager.getFiles();
    console.log('files', files);

    await fileManager.updateFile(
      { title: 'ABC', author: 'elo meno pee' },
      '# hello world with some new text',
      { bookId: '1234' }
    );
  }

  showSyncModal(): void {
    new SyncModal(this.app, {
      onOnlineSync: () => this.startAmazonSync(),
      onMyClippingsSync: () => this.syncClippings.startSync(),
    });
  }

  startAmazonSync(): void {
    this.syncAmazon.startSync();
  }

  async onunload(): Promise<void> {
    console.log('unloading plugin', new Date().toLocaleString());
  }
}
