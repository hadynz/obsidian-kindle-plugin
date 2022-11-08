import { derived, get, Readable, readable, Writable, writable } from 'svelte/store';

import type { BookHighlight } from '~/models';
import {
  DefaultFileNameTemplate,
  DefaultFileTemplate,
  DefaultHighlightTemplate,
  getRenderers,
} from '~/rendering';
import { FileNameRenderer, FileRenderer } from '~/rendering/renderer';
import { settingsStore } from '~/store/settingsStore';

import data from './data';
import type { TemplateTab } from './types';

const { fileNameRenderer, fileRenderer, highlightRenderer } = getRenderers();

const InvalidRender = 'not valid';

export type TemplateEditorModalStore = {
  activeTab: Writable<TemplateTab>;
  demoBooks: Readable<BookHighlight[]>;
  selectedBook: Writable<BookHighlight>;
  isDirty: Readable<boolean>;
  fileNameTemplateField: Writable<string>;
  fileNameTemplateFieldHasError: Writable<boolean>;
  fileTemplateField: Writable<string>;
  fileTemplateFieldHasError: Writable<boolean>;
  highlightTemplateField: Writable<string>;
  highlightTemplateFieldHasError: Writable<boolean>;
  renderedFileName: Readable<string>;
  renderedFile: Readable<string>;
  hasErrors: Readable<boolean>;
};

export default (): TemplateEditorModalStore => {
  const selectedBook = writable(data[0]);

  const fileNameTemplateField = writable(get(settingsStore).fileNameTemplate);
  const fileNameTemplateFieldHasError = writable(false);

  const fileTemplateField = writable(get(settingsStore).fileTemplate);
  const fileTemplateFieldHasError = writable(false);

  const highlightTemplateField = writable(get(settingsStore).highlightTemplate);
  const highlightTemplateFieldHasError = writable(false);

  const renderedFileName = derived(
    [selectedBook, fileNameTemplateField],
    ([$selectedBook, $fileNameTemplateField]) => {
      const fileNameTemplate = $fileNameTemplateField || DefaultFileNameTemplate;
      try {
        const renderer = new FileNameRenderer(fileNameTemplate);
        return renderer.render($selectedBook.book);
      } catch (error) {
        return InvalidRender;
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
        return InvalidRender;
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

  fileNameTemplateField.subscribe((value) => {
    const isValid = fileNameRenderer.validate(value);
    fileNameTemplateFieldHasError.set(!isValid);
  });

  fileTemplateField.subscribe((value) => {
    const isValid = fileRenderer.validate(value);
    fileTemplateFieldHasError.set(!isValid);
  });

  highlightTemplateField.subscribe((value) => {
    const isValid = highlightRenderer.validate(value);
    highlightTemplateFieldHasError.set(!isValid);
  });

  const hasErrors = derived(
    [fileNameTemplateFieldHasError, fileTemplateFieldHasError, highlightTemplateFieldHasError],
    ([
      $fileNameTemplateFieldHasError,
      $fileTemplateFieldHasError,
      $highlightTemplateFieldHasError,
    ]) => {
      return (
        $fileNameTemplateFieldHasError ||
        $fileTemplateFieldHasError ||
        $highlightTemplateFieldHasError
      );
    }
  );

  return {
    activeTab: writable<TemplateTab>('file-name'),
    demoBooks: readable(data),
    selectedBook,
    isDirty,
    fileNameTemplateField,
    fileNameTemplateFieldHasError,
    fileTemplateField,
    fileTemplateFieldHasError,
    highlightTemplateField,
    highlightTemplateFieldHasError,
    renderedFileName,
    renderedFile,
    hasErrors,
  };
};
