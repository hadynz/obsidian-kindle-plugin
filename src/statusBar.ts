import { PluginSettings } from './settings';

const moment = (window as any).moment;

export class StatusBar {
  el: HTMLElement;

  constructor(el: HTMLElement, settings: PluginSettings) {
    this.el = el;
    this.el.addClass('mod-clickable');

    if (settings.lastSyncDate === null) {
      this.el.setText('Kindle sync has never run');
    } else {
      this.el.setText(
        `${settings.synchedBookAsins.length} books synced. Last sync ${moment(
          settings.lastSyncDate,
        ).fromNow()}`,
      );
    }
  }

  setText(text: string): void {
    this.el.setText(text);
  }
}
