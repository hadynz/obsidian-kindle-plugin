import { get } from 'svelte/store';

import globalConfig from '~/globalConfig';
import { settingsStore } from '~/store';

import { FileNameRenderer, FileRenderer, HighlightRenderer } from './renderer';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getRenderers = () => {
  const { fileNameTemplate, fileTemplate, highlightTemplate } = get(settingsStore);
  const userFileNameTemplate = fileNameTemplate || globalConfig.defaultTemplates.fileName;
  const userFileTemplate = fileTemplate || globalConfig.defaultTemplates.file;
  const userHighlighTemplate = highlightTemplate || globalConfig.defaultTemplates.highlight;

  return {
    fileNameRenderer: new FileNameRenderer(userFileNameTemplate),
    fileRenderer: new FileRenderer(userFileTemplate, userHighlighTemplate),
    highlightRenderer: new HighlightRenderer(userHighlighTemplate),
  };
};
