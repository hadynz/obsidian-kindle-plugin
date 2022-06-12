import type { App } from 'obsidian';

import {
  templatesHeaderSetting,
  fileNameTemplateSetting,
  fileTemplateSetting,
  highlightTemplateSetting,
} from './templates';

export default (app: App, el: HTMLElement): void => {
  templatesHeaderSetting(app, el);
  fileNameTemplateSetting(el);
  fileTemplateSetting(el);
  highlightTemplateSetting(el);
};
