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

    const fileManager = new FileManager(this.app.vault, settings);

    const statusBar = new StatusBar(this.addStatusBarItem());

    statusBar.onClick(() => {
      new SyncModal(this.app, () => this.startSync());
    });

    this.syncHighlights = new SyncHighlights(fileManager, settings);

    this.addCommand({
      id: 'kindle-sync',
      name: 'Sync highlights',
      callback: () => {
        this.startSync();
      },
    });

    this.addSettingTab(new SettingsTab(this.app, this, settings));
  }

  startSync(): void {
    this.syncHighlights.startSync();
  }

  async onunload(): Promise<void> {
    console.log('unloading plugin', new Date().toLocaleString());
  }
}
