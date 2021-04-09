import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import pickBy from 'lodash.pickby';

import KindlePlugin from './KindlePlugin';
import KindleService from './KindleService';

export class SettingsTab extends PluginSettingTab {
  plugin: KindlePlugin;
  app: App;
  kindle: KindleService;

  constructor(app: App, plugin: KindlePlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.app = app;
    this.kindle = new KindleService(plugin.settings.goodreadsCredentials);
  }

  async display(): Promise<void> {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Login to your Goodreads account' });

    new Setting(containerEl).setName('Email').addText((text) =>
      text
        .setPlaceholder('Your email address...')
        .setValue(this.plugin.settings.goodreadsCredentials.username)
        .onChange(async (value) => {
          this.plugin.settings.goodreadsCredentials.username = value;
        }),
    );

    new Setting(containerEl).setName('Password').addText((text) =>
      text
        .setPlaceholder('Your password...')
        .setValue(this.plugin.settings.goodreadsCredentials.password)
        .onChange(async (value) => {
          this.plugin.settings.goodreadsCredentials.password = value;
        })
        .inputEl.setAttribute('type', 'password'),
    );

    new Setting(containerEl).addButton((button) => {
      return button
        .setButtonText('Login')
        .setClass('mod-cta')
        .setDisabled(true)
        .onClick(async () => {
          new Notice('Logging into Goodreads...');

          const success = await this.kindle.login();

          if (success) {
            await this.plugin.saveData(this.plugin.settings);
            new Notice('Login successful. Credentials saved');
          } else {
            new Notice('Invalid credentials');
          }
        });
    });

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
