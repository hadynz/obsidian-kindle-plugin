import { Plugin, addIcon } from 'obsidian';
import { get } from 'svelte/store';

import FileManager from './fileManager';
import SyncModal from './components/syncModal';
import { SettingsTab } from './settingsTab';
import { StatusBar } from './components/statusBar';
import { initialise, settingsStore } from './store';
import { SyncHighlights, SyncKindleClippings } from './sync';
import kindleIcon from './assets/kindleIcon.svg';

addIcon('kindle', kindleIcon);

export default class KindlePlugin extends Plugin {
  private syncHighlights!: SyncHighlights;
  private syncKindleClippings!: SyncKindleClippings;

  async onload(): Promise<void> {
    console.log('loading plugin', new Date().toLocaleString());

    await initialise(this);

    const fileManager = new FileManager(this.app.vault);

    this.syncHighlights = new SyncHighlights(fileManager);
    this.syncKindleClippings = new SyncKindleClippings(fileManager);

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

  showSyncModal(): void {
    new SyncModal(this.app, {
      onOnlineSync: () => this.startAmazonSync(),
      onMyClippingsSync: () => this.syncKindleClippings.startSync(),
    });
  }

  startAmazonSync(): void {
    this.syncHighlights.startSync();
  }

  async onunload(): Promise<void> {
    console.log('unloading plugin', new Date().toLocaleString());
  }
}
