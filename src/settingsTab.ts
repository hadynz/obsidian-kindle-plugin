import { App, PluginSettingTab, Setting } from 'obsidian';
import pickBy from 'lodash.pickby';

import KindlePlugin from '.';
import { PluginSettings } from './settings';

export class SettingsTab extends PluginSettingTab {
  public app: App;
  private settings: PluginSettings;

  constructor(app: App, plugin: KindlePlugin, settings: PluginSettings) {
    super(app, plugin);

    this.app = app;
    this.settings = settings;
  }

  async display(): Promise<void> {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Highlights file location')
      .addDropdown((dropdown) => {
        const files = (this.app.vault.adapter as any).files;
        const folders = pickBy(files, (val) => {
          return val.type === 'folder';
        });

        Object.keys(folders).forEach((val) => {
          dropdown.addOption(val, val);
        });
        return dropdown
          .setValue(this.settings.highlightsFolderLocation)
          .onChange(async (value) => {
            await this.settings.setHighlightsFolderLocation(value);
          });
      });
  }
}
