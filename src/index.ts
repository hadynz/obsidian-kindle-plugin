import { TinyEmitter } from 'tiny-emitter';
import { Plugin } from 'obsidian';

import loadSettings from './settings';
import FileManager from './fileManager';
import SyncHighlights from './syncHighlights';
import SyncModal from './modals/syncModal';
import { SettingsTab } from './settingsTab';
import { StatusBar } from './statusBar';

export default class KindlePlugin extends Plugin {
  async onload(): Promise<void> {
    console.log('loading plugin', new Date().toLocaleString());

    const emitter = new TinyEmitter();

    const settings = loadSettings(this, await this.loadData());

    const fileManager = new FileManager(this.app.vault, settings);

    const statusBar = new StatusBar(this.addStatusBarItem(), settings, emitter);
    statusBar.onClick(() => {
      new SyncModal(this.app, settings);
    });

    const syncHighlights = new SyncHighlights(fileManager, settings, emitter);

    this.addRibbonIcon(
      'dice',
      'Sync your Kindle highlights',
      async () => await syncHighlights.sync(),
    );

    this.addSettingTab(new SettingsTab(this.app, this, settings));
  }

  async onunload(): Promise<void> {
    console.log('unloading plugin', new Date().toLocaleString());
  }
}
