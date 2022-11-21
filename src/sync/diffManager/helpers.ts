import _ from 'lodash';

import type { Highlight } from '~/models';

import type { DiffLocation, RenderedHighlight } from './';

type DiffIndex = {
  highlight: Highlight;
  exists: boolean;
};

const getNextNeighbour = (state: Map<string, DiffIndex>, needle: string): Highlight => {
  const keys = Array.from(state.keys());
  const needleIndex = keys.indexOf(needle);

  let next: Highlight = null;

  for (let i = needleIndex + 1; i < keys.length; i++) {
    const diffIndex = state.get(keys[i]);
    if (diffIndex.exists) {
      next = diffIndex.highlight;
      break;
    }
  }

  return next;
};

export const diffLists = (
  remotes: Highlight[],
  renders: RenderedHighlight[]
): DiffLocation[] => {
  /**
   * Array of remote highlights that have not been rendered
   */
  const newRemotes = _.differenceWith(remotes, renders, (a, b) => a.id === b.highlightId);

  /**
   * Map every remote highlight id to where it exists (in render)
   * Use an ES6 Map to ensure key orders are preserved
   */
  const remotesSyncStatusLookup = new Map<string, DiffIndex>();

  remotes.forEach((highlight) =>
    remotesSyncStatusLookup.set(highlight.id, {
      highlight,
      exists: _.find(newRemotes, (r) => r.id === highlight.id) == null, // Existing highlights won't be in the newRemotes object
    })
  );

  return newRemotes.map((highlight): DiffLocation => {
    const next = getNextNeighbour(remotesSyncStatusLookup, highlight.id);
    const nextRendered = renders.find((r) => r.highlightId === next?.id) || null;

    return {
      highlight,
      successorSibling: nextRendered,
    };
  });
};
