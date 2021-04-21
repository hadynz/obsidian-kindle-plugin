import StatusBarContent from './statusBarContent.svelte';

import { PluginSettings } from './settings';

export class StatusBar {
  private el: HTMLElement;
  private cmp: StatusBarContent;

  constructor(el: HTMLElement, settings: PluginSettings) {
    this.el = el;
    this.el.addClass('mod-clickable');

    this.cmp = new StatusBarContent({
      target: this.el,
      props: {
        text: 'Hello there?',
        isSyncing: true,
        booksSyncCount: settings.synchedBookAsins.length,
        lastSyncDate: settings.lastSyncDate,
      },
    });
  }

  setText(text: string): void {
    this.cmp.$set({ text });
  }

  onClick(callback: () => void): void {
    this.el.onClickEvent(callback);
  }
}
