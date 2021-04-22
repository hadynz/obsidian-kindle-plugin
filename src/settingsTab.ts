import { App, PluginSettingTab, Setting } from 'obsidian';
import pickBy from 'lodash.pickby';

import KindlePlugin from '.';
import AmazonLogoutModal from './components/amazonLogoutModal';
import { PluginSettings } from './settings';
import { getLogoutLink } from './scraper';

const moment = (window as any).moment;

export class SettingsTab extends PluginSettingTab {
  public app: App;
  private settings: PluginSettings;

  constructor(app: App, plugin: KindlePlugin, settings: PluginSettings) {
    super(app, plugin);

    this.app = app;
    this.settings = settings;
  }

  public async display(): Promise<void> {
    const { containerEl } = this;

    containerEl.empty();

    if (this.settings.isLoggedIn) {
      this.logout();
    }

    this.highlightsFolder();
    this.noteTemplate();
    this.syncOnBoot();
    this.resetSyncHistory();
  }

  private logout(): void {
    const syncMessage = this.settings.lastSyncDate
      ? `Last sync ${moment(this.settings.lastSyncDate).fromNow()}`
      : 'Sync has never run';

    const descFragment = document.createRange().createContextualFragment(`
      ${this.settings.synchedBookAsins.length} book(s) synced<br/>
      ${syncMessage}
    `);

    new Setting(this.containerEl)
      .setName(`Logged in as ${this.settings.loggedInEmail}`)
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

            const signoutLink = await getLogoutLink();

            const modal = new AmazonLogoutModal(signoutLink, this.settings);
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

  private noteTemplate(): void {
    const descFragment = document.createRange().createContextualFragment(`
      Template (<a href="https://mozilla.github.io/nunjucks/">Nunjucks</a>) for rendering every synced Kindle note highlights.
      <br/><br/>
      <b>Available variables to use</b>
      <br/>
      Book
      <ul>
        <li><span class="u-pop">{{title}}</span> - Book title</li>
        <li><span class="u-pop">{{author}}</span> - Book author</li>
        <li><span class="u-pop">{{url}}</span> - Book url (Amazon)</li>
        <li><span class="u-pop">{{highlights}}</span> - List of your Kindle highlights for this book</li>
      </ul>
      <br/>
      Highlight
      <ul>
        <li><span class="u-pop">{{text}}</span> - Highlight text</li>
        <li><span class="u-pop">{{location}}</span> - Highlight location in book</li>
        <li><span class="u-pop">{{page}}</span> - Highlighted page location in book</li>
      </ul>
    `);

    new Setting(this.containerEl)
      .setName('Note template')
      .setDesc(descFragment)
      .addTextArea((text) => {
        text.inputEl.style.width = '100%';
        text.inputEl.style.height = '250px';
        text.inputEl.style.fontSize = '0.8em';
        text.setValue(this.settings.noteTemplate).onChange(async (value) => {
          await this.settings.setNoteTemplate(value);
        });
        return text;
      });
  }

  private syncOnBoot(): void {
    new Setting(this.containerEl)
      .setName('Sync on Startup')
      .setDesc('Automatically sync new Kindle highlights when Obsidian starts')
      .addToggle((toggle) =>
        toggle.setValue(this.settings.syncOnBoot).onChange(async (value) => {
          await this.settings.setSyncOnBoot(value);
        }),
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
            await this.settings.resetSyncHistory();
            this.display(); // rerender
          });
      });
  }
}
