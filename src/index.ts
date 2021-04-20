import { Plugin } from 'obsidian';

import loadSettings from './settings';
import FileManager from './fileManager';
import SyncHighlights from './syncHighlights';
import { SettingsTab } from './settingsTab';
import { StatusBar } from './statusBar';

export default class KindlePlugin extends Plugin {
  async onload(): Promise<void> {
    console.log('loading plugin', new Date().toLocaleString());

    const settings = loadSettings(this, await this.loadData());

    const fileManager = new FileManager(this.app.vault, settings);

    const statusBar = new StatusBar(this.addStatusBarItem(), settings);

    const syncHighlights = new SyncHighlights(statusBar, fileManager, settings);

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
