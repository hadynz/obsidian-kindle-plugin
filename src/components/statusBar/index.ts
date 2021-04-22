import StatusBarContent from './StatusBar.svelte';

export class StatusBar {
  constructor(el: HTMLElement, onClick: () => void) {
    el.addClass('mod-clickable');
    el.onClickEvent(onClick);

    new StatusBarContent({
      target: el,
    });
  }
}
