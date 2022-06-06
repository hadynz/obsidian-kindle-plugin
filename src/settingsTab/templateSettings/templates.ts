import { App, Setting } from 'obsidian';
import { get } from 'svelte/store';

import HeaderDescription from './components/HeaderDescription.svelte';
import { InfoModal } from './InfoModal';
import { settingsStore } from '~/store';
import { createDocumentFragment } from './utils';
import {
  DefaultHighlightTemplate,
  DefaultFileNameTemplate,
  DefaultFileTemplate,
  getRenderers,
} from '~/rendering';

const styleTextarea = (el: HTMLTextAreaElement): void => {
  el.style.width = '100%';
  el.style.maxWidth = '500px';
  el.style.height = '200px';
  el.style.fontSize = '0.8em';
  el.style.fontFamily = 'var(--font-monospace)';
};

export const templatesHeaderSetting = (app: App, el: HTMLElement): void => {
  const setting = new Setting(el).setName('Templates').setClass('setting-item-heading');

  const legendEl = document.createElement('div');
  new HeaderDescription({
    target: legendEl,
    props: {
      onClick: () => {
        new InfoModal(app).open();
      },
    },
  });

  // Render Legend above control text field
  setting.descEl.append(legendEl);
};

export const fileNameTemplateSetting = (el: HTMLElement): void => {
  new Setting(el).setName('File name template').addText((text) => {
    text.inputEl.style.width = '380px';
    text.inputEl.style.marginRight = '5px';
    text.inputEl.placeholder = DefaultFileNameTemplate;

    text.setValue(get(settingsStore).fileNameTemplate).onChange(async (value) => {
      const isValid = getRenderers().fileNameRenderer.validate(value);

      if (isValid) {
        settingsStore.actions.setFileNameTemplate(value);
      }

      text.inputEl.style.border = isValid ? '' : '1px solid red';
    });

    const mdSuffix = createDocumentFragment('.md');
    text.inputEl.parentNode.appendChild(mdSuffix);

    return text;
  });
};

export const fileTemplateSetting = (el: HTMLElement): void => {
  const setting = new Setting(el)
    .setName('File template')
    .setDesc('Template for a file of highlights. This can include YAML front matter')
    .addTextArea((text) => {
      styleTextarea(text.inputEl);
      text.inputEl.placeholder = DefaultFileTemplate;
      text.setValue(get(settingsStore).fileTemplate).onChange(async (value) => {
        const isValid = getRenderers().highlightRenderer.validate(value);

        if (isValid) {
          await settingsStore.actions.setFileTemplate(value);
        }

        text.inputEl.style.border = isValid ? '' : '1px solid red';
      });
      return text;
    });

  setting.settingEl.style.alignItems = 'normal';
  setting.infoEl.style.flex = 'none';
};

export const highlightTemplateSetting = (el: HTMLElement): void => {
  const setting = new Setting(el)
    .setName('Highlight template')
    .setDesc('Template for an individual highlight')
    .addTextArea((text) => {
      styleTextarea(text.inputEl);
      text.inputEl.placeholder = DefaultHighlightTemplate;
      text.setValue(get(settingsStore).highlightTemplate).onChange(async (value) => {
        const isValid = getRenderers().highlightRenderer.validate(value);

        if (isValid) {
          await settingsStore.actions.setHighlightTemplate(value);
        }

        text.inputEl.style.border = isValid ? '' : '1px solid red';
      });
      return text;
    });

  setting.settingEl.style.alignItems = 'normal';
  setting.infoEl.style.flex = 'none';
};
