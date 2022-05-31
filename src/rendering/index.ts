import { get } from 'svelte/store';

import bookTemplate from '~/rendering/templates/bookTemplate.njk';
import defaultHighlightTemplate from '~/rendering/templates/defaultHighlightTemplate.njk';
import { FileNameRenderer, FileRenderer, HighlightRenderer } from './renderer';
import { settingsStore } from '~/store';

// Exported constants
export const DefaultFileNameTemplate = '{{shortTitle}}';
export const DefaultFileTemplate = bookTemplate;
export const DefaultHighlightTemplate = defaultHighlightTemplate;

const { fileNameTemplate, highlightTemplate } = get(settingsStore);
const userFileNameTemplate = fileNameTemplate || DefaultFileNameTemplate;
const fileTemplate = highlightTemplate || DefaultFileTemplate;
const highlighTemplate = highlightTemplate || DefaultHighlightTemplate;

// Exported renderers
export const fileNameRenderer = new FileNameRenderer(userFileNameTemplate);
export const fileRenderer = new FileRenderer(fileTemplate, highlighTemplate);
export const highlightRenderer = new HighlightRenderer(highlighTemplate);
