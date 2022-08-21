import type { App } from 'obsidian';

import {
  fileNameTemplateSetting,
  fileTemplateSetting,
  highlightTemplateSetting,
  templatesHeaderSetting,
} from './templates';

export default (app: App, el: HTMLElement): void => {
  templatesHeaderSetting(app, el);
  fileNameTemplateSetting(el);
  fileTemplateSetting(el);
  highlightTemplateSetting(el);
};
