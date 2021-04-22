import StatusBarContent from './components/StatusBar.svelte';

export class StatusBar {
  private el: HTMLElement;

  constructor(el: HTMLElement) {
    this.el = el;
    this.el.addClass('mod-clickable');

    new StatusBarContent({
      target: this.el,
    });
  }

  public onClick(callback: () => void): void {
    this.el.onClickEvent(callback);
  }
}
