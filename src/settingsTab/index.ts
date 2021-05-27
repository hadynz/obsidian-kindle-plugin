import pickBy from 'lodash.pickby';
import { App, PluginSettingTab, Setting } from 'obsidian';
import { get } from 'svelte/store';

import AmazonLogoutModal from '~/components/amazonLogoutModal';
import templateInstructions from './templateInstructions.html';
import type KindlePlugin from '~/.';
import { Renderer } from '~/renderer';
import { settingsStore } from '~/store';
import { scrapeLogoutUrl } from '~/scraper';

const { moment } = window;

export class SettingsTab extends PluginSettingTab {
  public app: App;
  private renderer: Renderer;

  constructor(app: App, plugin: KindlePlugin) {
    super(app, plugin);
    this.app = app;
    this.renderer = new Renderer();
  }

  public async display(): Promise<void> {
    const { containerEl } = this;

    containerEl.empty();

    if (get(settingsStore).isLoggedIn) {
      this.logout();
    }

    this.highlightsFolder();
    this.downloadBookMetadata();
    this.syncOnBoot();
    this.noteTemplate();
    this.resetSyncHistory();
  }

  private logout(): void {
    const syncMessage = get(settingsStore).lastSyncDate
      ? `Last sync ${moment(get(settingsStore).lastSyncDate).fromNow()}`
      : 'Sync has never run';

    const descFragment = document.createRange().createContextualFragment(`
      ${get(settingsStore).history.totalBooks} book(s) synced<br/>
      ${syncMessage}
    `);

    new Setting(this.containerEl)
      .setName(`Logged in as ${get(settingsStore).loggedInEmail}`)
      .setDesc(descFragment)
      .addButton((button) => {
        return button
          .setButtonText('Sign out')
          .setCta()
          .onClick(async () => {
            button
              .removeCta()
              .setButtonText('Signing out...')
              .setDisabled(true);

            const signoutLink = await scrapeLogoutUrl();

            const modal = new AmazonLogoutModal(signoutLink);
            await modal.doLogout();

            this.display(); // rerender
          });
      });
  }

  private highlightsFolder(): void {
    new Setting(this.containerEl)
      .setName('Highlights folder location')
      .setDesc('Vault folder to use for writing book highlight notes')
      .addDropdown((dropdown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const files = (this.app.vault.adapter as any).files;
        const folders = pickBy(files, (val) => {
          return val.type === 'folder';
        });

        Object.keys(folders).forEach((val) => {
          dropdown.addOption(val, val);
        });
        return dropdown
          .setValue(get(settingsStore).highlightsFolder)
          .onChange(async (value) => {
            await settingsStore.actions.setHighlightsFolder(value);
          });
      });
  }

  private noteTemplate(): void {
    const descFragment = document
      .createRange()
      .createContextualFragment(templateInstructions);

    new Setting(this.containerEl)
      .setName('Note template')
      .setDesc(descFragment)
      .addTextArea((text) => {
        text.inputEl.style.width = '100%';
        text.inputEl.style.height = '450px';
        text.inputEl.style.fontSize = '0.8em';
        text
          .setValue(get(settingsStore).noteTemplate)
          .onChange(async (value) => {
            const isValid = this.renderer.validate(value);

            if (isValid) {
              await settingsStore.actions.setNoteTemplate(value);
            }

            text.inputEl.style.border = isValid ? '' : '1px solid red';
          });
        return text;
      });
  }

  private downloadBookMetadata(): void {
    new Setting(this.containerEl)
      .setName('Download book metadata')
      .setDesc(
        'Download extra book metadata from Amazon.com (Amazon sync only). Switch off to speed sync'
      )
      .addToggle((toggle) =>
        toggle
          .setValue(get(settingsStore).downloadBookMetadata)
          .onChange(async (value) => {
            await settingsStore.actions.setDownloadBookMetadata(value);
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
        toggle
          .setValue(get(settingsStore).syncOnBoot)
          .onChange(async (value) => {
            await settingsStore.actions.setSyncOnBoot(value);
          })
      );
  }

  private resetSyncHistory(): void {
    new Setting(this.containerEl)
      .setName('Reset sync')
      .setDesc('Wipe sync history to allow for resync')
      .addButton((button) => {
        return button
          .setButtonText('Reset')
          .setWarning()
          .onClick(async () => {
            await settingsStore.actions.resetSyncHistory();
            this.display(); // rerender
          });
      });
  }
}
