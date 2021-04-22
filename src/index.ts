import { TinyEmitter } from 'tiny-emitter';
import { Plugin } from 'obsidian';

import loadSettings from './settings';
import FileManager from './fileManager';
import SyncHighlights from './syncHighlights';
import SyncModal from './modals/syncModal';
import { SettingsTab } from './settingsTab';
import { StatusBar } from './statusBar';

export default class KindlePlugin extends Plugin {
  private emitter!: TinyEmitter;
  private syncHighlights!: SyncHighlights;

  async onload(): Promise<void> {
    console.log('loading plugin', new Date().toLocaleString());

    this.emitter = new TinyEmitter();

    const settings = loadSettings(this, await this.loadData());

    const fileManager = new FileManager(this.app.vault, settings);

    const statusBar = new StatusBar(
      this.addStatusBarItem(),
      settings,
      this.emitter,
    );

    statusBar.onClick(() => {
      new SyncModal(this.app, settings, this.emitter);
    });

    this.syncHighlights = new SyncHighlights(
      fileManager,
      settings,
      this.emitter,
    );

    this.addSettingTab(new SettingsTab(this.app, this, settings));

    this.setupListeners();
  }

  setupListeners(): void {
    this.emitter.on('start-sync', () => {
      this.syncHighlights.startSync();
    });
  }

  async onunload(): Promise<void> {
    console.log('unloading plugin', new Date().toLocaleString());
  }
}
