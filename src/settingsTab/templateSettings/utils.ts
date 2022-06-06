import { getRenderers } from '~/rendering';
import { fileName, BookDemo } from './store';

export const updateFileNamePreview = (book: BookDemo): void => {
  const renderedFileName = getRenderers().fileNameRenderer.render(book);
  fileName.set(renderedFileName);
};

export const createDocumentFragment = (innerHtml: string): DocumentFragment => {
  const descEl = document.createElement('span');
  descEl.innerHTML = innerHtml;

  const descFragment = document.createDocumentFragment();
  descFragment.appendChild(descEl);

  return descFragment;
};
