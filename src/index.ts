import { Plugin } from 'obsidian';

import loadSettings from './settings';
import FileManager from './fileManager';
import SyncHighlights from './syncHighlights';
import SyncModal from './components/syncModal';
import { SettingsTab } from './settingsTab';
import { StatusBar } from './components/statusBar';
import store from './store';

export default class KindlePlugin extends Plugin {
  private syncHighlights!: SyncHighlights;

  async onload(): Promise<void> {
    console.log('loading plugin', new Date().toLocaleString());

    const settings = loadSettings(this, await this.loadData());
    store.initialize(settings);

    new StatusBar(this.addStatusBarItem(), () => {
      new SyncModal(this.app, () => this.startSync());
    });

    const fileManager = new FileManager(this.app.vault, settings);
    this.syncHighlights = new SyncHighlights(fileManager, settings);

    this.addCommand({
      id: 'kindle-sync',
      name: 'Sync highlights',
      callback: () => {
        this.startSync();
      },
    });

    this.addSettingTab(new SettingsTab(this.app, this, settings));

    if (settings.syncOnBoot) {
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
