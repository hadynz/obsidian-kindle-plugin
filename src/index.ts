import { Plugin } from 'obsidian';
import { get } from 'svelte/store';

import FileManager from './fileManager';
import SyncModal from './components/syncModal';
import { SettingsTab } from './settingsTab';
import { StatusBar } from './components/statusBar';
import { initialise, settingsStore } from './store';
import { SyncHighlights, SyncKindleClippings } from './sync';

export default class KindlePlugin extends Plugin {
  private syncHighlights!: SyncHighlights;

  async onload(): Promise<void> {
    console.log('loading plugin', new Date().toLocaleString());

    await initialise(this);

    const fileManager = new FileManager(this.app.vault);

    this.syncHighlights = new SyncHighlights(fileManager);

    const syncKindleClippings = new SyncKindleClippings(fileManager);

    new StatusBar(this.addStatusBarItem(), () => {
      new SyncModal(this.app, {
        onOnlineSync: () => this.startSync(),
        onMyClippingsSync: () => syncKindleClippings.startSync(),
      });
    });

    this.addCommand({
      id: 'kindle-sync',
      name: 'Sync highlights',
      callback: () => {
        this.startSync();
      },
    });

    this.addSettingTab(new SettingsTab(this.app, this));

    if (get(settingsStore).syncOnBoot) {
      await this.startSync();
    }
  }

  startSync(): void {
    this.syncHighlights.startSync();
  }

  async onunload(): Promise<void> {
    console.log('unloading plugin', new Date().toLocaleString());
  }
}
