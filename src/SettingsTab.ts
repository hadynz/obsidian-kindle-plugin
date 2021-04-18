import { App, PluginSettingTab, Setting } from 'obsidian';
import pickBy from 'lodash.pickby';

import KindlePlugin from '.';

export class SettingsTab extends PluginSettingTab {
  plugin: KindlePlugin;
  app: App;

  constructor(app: App, plugin: KindlePlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.app = app;
  }

  async display(): Promise<void> {
    let { containerEl } = this;

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
          .setValue(this.plugin.settings.highlightsFolderLocation)
          .onChange(async (value) => {
            this.plugin.settings.highlightsFolderLocation = value;
            await this.plugin.saveData(this.plugin.settings);
          });
      });
  }
}
