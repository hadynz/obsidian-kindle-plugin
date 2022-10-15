import _ from 'lodash';
import { App, PluginSettingTab, Setting } from 'obsidian';
import { get } from 'svelte/store';

import type KindlePlugin from '~/.';
import { AmazonRegions, orderedAmazonRegions } from '~/amazonRegion';
import AmazonLogoutModal from '~/components/amazonLogoutModal';
import { ee } from '~/eventEmitter';
import type FileManager from '~/fileManager';
import type { AmazonAccountRegion } from '~/models';
import { scrapeLogoutUrl } from '~/scraper';
import { settingsStore } from '~/store';

import TemplateEditorModal from './templateEditorModal';

const { moment } = window;

type AdapterFile = {
  type: 'folder' | 'file';
};

export class SettingsTab extends PluginSettingTab {
  constructor(app: App, plugin: KindlePlugin, private fileManager: FileManager) {
    super(app, plugin);
    this.app = app;
  }

  public display(): void {
    const { containerEl } = this;

    containerEl.empty();

    if (get(settingsStore).isLoggedIn) {
      this.logout();
    }

    this.templatesEditor();
    this.highlightsFolder();
    this.amazonRegion();
    this.downloadBookMetadata();
    this.syncOnBoot();
    this.sponsorMe();
  }

  private templatesEditor(): void {
    new Setting(this.containerEl)
      .setName('Templates')
      .setDesc('Manage and edit templates for file names and highlight note content')
      .addButton((button) => {
        button
          .setButtonText('Manage')
          .onClick(() => {
            new TemplateEditorModal(this.app).show();
          });
      });
  }

  private logout(): void {
    const syncMessage = get(settingsStore).lastSyncDate
      ? `Last sync ${moment(get(settingsStore).lastSyncDate).fromNow()}`
      : 'Sync has never run';

    const kindleFiles = this.fileManager.getKindleFiles();

    const descFragment = document.createRange().createContextualFragment(`
      ${kindleFiles.length} book(s) synced<br/>
      ${syncMessage}
    `);

    new Setting(this.containerEl)
      .setName('Logged in to Amazon Kindle Reader')
      .setDesc(descFragment)
      .addButton((button) => {
        return button
          .setButtonText('Sign out')
          .setCta()
          .onClick(async () => {
            button.removeCta().setButtonText('Signing out...').setDisabled(true);

            ee.emit('startLogout');

            try {
              const signout = await scrapeLogoutUrl();

              // User is still logged in
              if (signout.isStillLoggedIn) {
                const modal = new AmazonLogoutModal(signout.url);
                await modal.doLogout();
              }

              settingsStore.actions.logout();
            } catch (error) {
              console.error('Error when trying to logout', error);
              ee.emit('logoutFailure');
            }

            ee.emit('logoutSuccess');

            this.display(); // rerender
          });
      });
  }

  private amazonRegion(): void {
    new Setting(this.containerEl)
      .setName('Amazon region')
      .setDesc(
        "Amazon's kindle reader is region specific. Choose your preferred country/region which has your highlights"
      )
      .addDropdown((dropdown) => {
        orderedAmazonRegions().forEach((region: AmazonAccountRegion) => {
          const account = AmazonRegions[region];
          dropdown.addOption(region, `${account.name} (${account.hostname})`);
        });

        return dropdown
          .setValue(get(settingsStore).amazonRegion)
          .onChange((value: AmazonAccountRegion) => {
            settingsStore.actions.setAmazonRegion(value);
          });
      });
  }

  private highlightsFolder(): void {
    new Setting(this.containerEl)
      .setName('Highlights folder location')
      .setDesc('Vault folder to use for writing book highlight notes')
      .addDropdown((dropdown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        const files = (this.app.vault.adapter as any).files as AdapterFile[];
        const folders = _.pickBy(files, (val) => {
          return val.type === 'folder';
        });

        Object.keys(folders).forEach((val) => {
          dropdown.addOption(val, val);
        });
        return dropdown.setValue(get(settingsStore).highlightsFolder).onChange((value) => {
          settingsStore.actions.setHighlightsFolder(value);
        });
      });
  }

  private downloadBookMetadata(): void {
    new Setting(this.containerEl)
      .setName('Download book metadata')
      .setDesc(
        'Download extra book metadata from Amazon.com (Amazon sync only). Switch off to speed sync'
      )
      .addToggle((toggle) =>
        toggle.setValue(get(settingsStore).downloadBookMetadata).onChange((value) => {
          settingsStore.actions.setDownloadBookMetadata(value);
        })
      );
  }

  private syncOnBoot(): void {
    new Setting(this.containerEl)
      .setName('Sync on Startup')
      .setDesc(
        'Automatically sync new Kindle highlights when Obsidian starts  (Amazon sync only)'
      )
      .addToggle((toggle) =>
        toggle.setValue(get(settingsStore).syncOnBoot).onChange((value) => {
          settingsStore.actions.setSyncOnBoot(value);
        })
      );
  }

  private sponsorMe(): void {
    new Setting(this.containerEl)
      .setName('Sponsor')
      .setDesc(
        'Has this plugin enhanced your workflow? Say thanks as a one-time payment and buy me a coffee'
      )
      .addButton((bt) => {
        bt.buttonEl.outerHTML = `<a href="https://www.buymeacoffee.com/hadynz"><img style="height: 35px;" src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=hadynz&button_colour=BD5FFF&font_colour=ffffff&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00"></a>`;
      });
  }
}
