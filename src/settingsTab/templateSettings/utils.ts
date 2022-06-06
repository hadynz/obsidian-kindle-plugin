export const createDocumentFragment = (innerHtml: string): DocumentFragment => {
  const descEl = document.createElement('span');
  descEl.innerHTML = innerHtml;

  const descFragment = document.createDocumentFragment();
  descFragment.appendChild(descEl);

  return descFragment;
};
