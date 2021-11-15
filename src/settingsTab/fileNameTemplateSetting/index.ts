import { Setting } from 'obsidian';
import { get } from 'svelte/store';

import Legend from './components/Legend.svelte';
import Preview from './components/Preview.svelte';
import { settingsStore } from '~/store';
import { fileName, BookDemo } from './store';
import { fileNameRenderer } from '~/fileNameRenderer';

const updateFileNamePreview = (book: BookDemo): void => {
  const renderedFileName = fileNameRenderer.render(book);
  fileName.set(renderedFileName);
};

export const fileNameTemplateSetting = (el: HTMLElement): void => {
  let currentBook: BookDemo;

  const setting = new Setting(el)
    .setName('File name template')
    .setDesc(
      createDocumentFragment(
        '<a href="https://mozilla.github.io/nunjucks/templating.html">Nunjucks template</a> to use for creation of file names from a book'
      )
    )
    .addText((text) => {
      text.inputEl.style.width = '400px';
      text.inputEl.placeholder = fileNameRenderer.defaultTemplate();

      text.setValue(get(settingsStore).fileNameTemplate).onChange(async (value) => {
        const isValid = fileNameRenderer.validate(value);

        if (isValid) {
          settingsStore.actions.setFileNameTemplate(value);
          updateFileNamePreview(currentBook);
        }

        text.inputEl.style.border = isValid ? '' : '1px solid red';
      });

      return text;
    });

  // Tweak vertical alignment of Settings component
  setting.settingEl.style.alignItems = 'normal';
  setting.controlEl.style.flexDirection = 'column';
  setting.controlEl.style.alignItems = 'flex-end';
  setting.controlEl.style.justifyContent = 'flex-start';

  // Render Legend above control text field
  const legendEl = document.createElement('div');
  setting.controlEl.prepend(legendEl);
  new Legend({ target: legendEl });

  // Render Preview box after description
  new Preview({
    target: setting.descEl,
    props: {
      onSelect: (book: BookDemo) => {
        currentBook = book;
        updateFileNamePreview(book);
      },
    },
  });
};

const createDocumentFragment = (innerHtml: string): DocumentFragment => {
  const descEl = document.createElement('span');
  descEl.innerHTML = innerHtml;

  const descFragment = document.createDocumentFragment();
  descFragment.appendChild(descEl);

  return descFragment;
};
