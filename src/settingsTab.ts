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

    this.highlightsFolder();
    this.noteTemplate();
  }

  highlightsFolder(): void {
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

  noteTemplate(): void {
    const descFragment = document.createRange().createContextualFragment(`
      Template (<a href="https://mozilla.github.io/nunjucks/">Nunjucks</a>) for rendering every synced Kindle note highlights.
      <br/><br/>
      <b>Available variables to use</b>
      <br/>
      Book
      <ul>
        <li><span class="u-pop">{{title}}</span> - Book title</li>
        <li><span class="u-pop">{{author}}</span> - Book author</li>
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
}
