import { derived, get, readable, writable } from 'svelte/store';

import {
  DefaultFileNameTemplate,
  DefaultFileTemplate,
  DefaultHighlightTemplate,
} from '~/rendering';
import { FileNameRenderer, FileRenderer } from '~/rendering/renderer';
import { settingsStore } from '~/store/settingsStore';

import data from './data';

export const demoBooks = readable(data);
export const selectedBook = writable(data[0]);

export const fileNameTemplateField = writable(get(settingsStore).fileNameTemplate);
export const fileTemplateField = writable(get(settingsStore).fileTemplate);
export const highlightTemplateField = writable(get(settingsStore).highlightTemplate);

export const renderedFileName = derived(
  [selectedBook, fileNameTemplateField],
  ([$selectedBook, $fileNameTemplateField]) => {
    const fileNameTemplate = $fileNameTemplateField || DefaultFileNameTemplate;

    try {
      const renderer = new FileNameRenderer(fileNameTemplate);
      return renderer.render($selectedBook.book);
    } catch (error) {
      return 'not valid';
    }
  }
);

export const renderedFile = derived(
  [selectedBook, fileTemplateField, highlightTemplateField],
  ([$selectedBook, $fileTemplateField, $highlightTemplateField]) => {
    const fileTemplate = $fileTemplateField || DefaultFileTemplate;
    const highlightTemplate = $highlightTemplateField || DefaultHighlightTemplate;

    try {
      const renderer = new FileRenderer(fileTemplate, highlightTemplate);
      return renderer.render($selectedBook);
    } catch (error) {
      return 'not valid';
    }
  }
);
