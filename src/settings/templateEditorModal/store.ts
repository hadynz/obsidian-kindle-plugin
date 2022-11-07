import { derived, get, Readable, readable, Writable, writable } from 'svelte/store';

import type { BookHighlight } from '~/models';
import {
  DefaultFileNameTemplate,
  DefaultFileTemplate,
  DefaultHighlightTemplate,
} from '~/rendering';
import { FileNameRenderer, FileRenderer } from '~/rendering/renderer';
import { settingsStore } from '~/store/settingsStore';

import data from './data';
import type { TemplateTab } from './types';

export type TemplateEditorModalStore = {
  activeTab: Writable<TemplateTab>;
  demoBooks: Readable<BookHighlight[]>;
  isDirty: Readable<boolean>;
  selectedBook: Writable<BookHighlight>;
  fileNameTemplateField: Writable<string>;
  fileTemplateField: Writable<string>;
  highlightTemplateField: Writable<string>;
  renderedFileName: Readable<string>;
  renderedFile: Readable<string>;
};

export default (): TemplateEditorModalStore => {
  const activeTab = writable<TemplateTab>('file-name');

  const demoBooks = readable(data);
  const selectedBook = writable(data[0]);

  const fileNameTemplateField = writable(get(settingsStore).fileNameTemplate);
  const fileTemplateField = writable(get(settingsStore).fileTemplate);
  const highlightTemplateField = writable(get(settingsStore).highlightTemplate);

  const renderedFileName = derived(
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

  const renderedFile = derived(
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

  const isDirty = derived(
    [fileNameTemplateField, fileTemplateField, highlightTemplateField, settingsStore.store],
    ([
      $fileNameTemplateField,
      $fileTemplateField,
      $highlightTemplateField,
      $settingsStore,
    ]) => {
      const { fileNameTemplate, fileTemplate, highlightTemplate } = $settingsStore;
      return (
        fileNameTemplate !== $fileNameTemplateField ||
        fileTemplate !== $fileTemplateField ||
        highlightTemplate !== $highlightTemplateField
      );
    }
  );

  return {
    activeTab,
    demoBooks,
    selectedBook,
    fileNameTemplateField,
    fileTemplateField,
    highlightTemplateField,
    renderedFileName,
    renderedFile,
    isDirty,
  };
};
