import { Setting } from 'obsidian';
import { get } from 'svelte/store';

import {
  DefaultFileNameTemplate,
  DefaultFileTemplate,
  DefaultHighlightTemplate,
} from '~/rendering';
import { settingsStore } from '~/store';

const styleTextarea = (el: HTMLTextAreaElement): void => {
  el.style.width = '100%';
  el.style.maxWidth = '500px';
  el.style.height = '200px';
  el.style.fontSize = '0.8em';
  el.style.fontFamily = 'var(--font-monospace)';
};

export const fileNameTemplateSetting = (
  el: HTMLElement,
  onChange: (value: string) => void
): void => {
  new Setting(el).setName('File name template').addText((text) => {
    text.inputEl.style.width = '380px';
    text.inputEl.style.marginRight = '5px';
    text.inputEl.placeholder = DefaultFileNameTemplate;
    text.setValue(get(settingsStore).fileNameTemplate).onChange(onChange);
  });
};

export const fileTemplateSetting = (
  el: HTMLElement,
  onChange: (value: string) => void
): void => {
  const setting = new Setting(el)
    .setName('File template')
    .setDesc('Template for a file of highlights. This can include YAML front matter')
    .addTextArea((text) => {
      styleTextarea(text.inputEl);
      text.inputEl.placeholder = DefaultFileTemplate;
      text.setValue(get(settingsStore).fileTemplate).onChange(onChange);
    });

  setting.settingEl.style.alignItems = 'normal';
  setting.infoEl.style.flex = 'none';
};

export const highlightTemplateSetting = (
  el: HTMLElement,
  onChange: (value: string) => void
): void => {
  const setting = new Setting(el)
    .setName('Highlight template')
    .setDesc('Template for an individual highlight')
    .addTextArea((text) => {
      styleTextarea(text.inputEl);
      text.inputEl.placeholder = DefaultHighlightTemplate;
      text.setValue(get(settingsStore).highlightTemplate).onChange(onChange);
    });

  setting.settingEl.style.alignItems = 'normal';
  setting.infoEl.style.flex = 'none';
};
