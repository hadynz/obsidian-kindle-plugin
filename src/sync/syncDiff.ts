import _ from 'lodash';

import { sb } from '~/utils';
import type { Highlight } from '~/models';
import type FileManager from '~/fileManager';
import type { KindleFile } from '~/fileManager';
import { HighlightIdBlockRefPrefix, Renderer } from '~/renderer';

type RenderedHighlight = {
  line: number;
  highlightId: string;
};

export type DiffResult = {
  remoteHighlight: Highlight;
  nextRenderedHighlight?: RenderedHighlight;
};

type DiffIndex = {
  highlight: Highlight;
  exists: boolean;
};

const getNextNeighbour = (
  state: Map<string, DiffIndex>,
  needle: string
): Highlight => {
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
): DiffResult[] => {
  /**
   * Array of remote highlights that have not been rendered
   */
  const diff = _.differenceWith(
    remotes,
    renders,
    (a, b) => a.id === b.highlightId
  );

  /**
   * Map every remote highlight id to where it exists (in render)
   * Use an ES6 Map to ensure key orders are preserved
   */
  const syncState = new Map<string, DiffIndex>();
  remotes.forEach((r) =>
    syncState.set(r.id, { highlight: r, exists: !diff.contains(r) })
  );

  return diff.map((remote): DiffResult => {
    const next = getNextNeighbour(syncState, remote.id);
    const nextRendered = renders.find((r) => r.highlightId === next?.id);

    return {
      remoteHighlight: remote,
      nextRenderedHighlight: nextRendered,
    };
  });
};

// TODO: We are reading the following line twice :\
// const fileContents = await this.fileManager.readFile(kindleFile);
export class SyncDiff {
  private renderer: Renderer;

  constructor(private fileManager: FileManager) {
    this.renderer = new Renderer();
  }

  public async diff(
    kindleFile: KindleFile,
    remoteHighlights: Highlight[]
  ): Promise<DiffResult[]> {
    const renderedHighlights = await this.parseRenderedHighlights(kindleFile);
    return diffLists(remoteHighlights, renderedHighlights);
  }

  private async parseRenderedHighlights(
    kindleFile: KindleFile
  ): Promise<RenderedHighlight[]> {
    const fileContents = await this.fileManager.readFile(kindleFile);
    const fileBuffer = sb(fileContents);

    return fileBuffer
      .find((lineEntry) =>
        lineEntry.content.startsWith(HighlightIdBlockRefPrefix)
      )
      .map((lineEntry): RenderedHighlight => {
        const { line, content } = lineEntry;
        return {
          line,
          highlightId: content.replace(HighlightIdBlockRefPrefix, ''),
        };
      });
  }

  public async applyDiffs(
    kindleFile: KindleFile,
    diffs: DiffResult[]
  ): Promise<void> {
    const fileContents = await this.fileManager.readFile(kindleFile);

    const insertList = diffs
      .filter((d) => d.nextRenderedHighlight)
      .map((d) => ({
        line: d.nextRenderedHighlight?.line,
        content: this.renderer.renderHighlight(
          kindleFile.book,
          d.remoteHighlight
        ),
      }));

    const appendList = diffs
      .filter((d) => d.nextRenderedHighlight == null)
      .map((d) =>
        this.renderer.renderHighlight(kindleFile.book, d.remoteHighlight)
      );

    const modifiedFileContents = sb(fileContents)
      .insertLinesAt(insertList)
      .append(appendList)
      .toString();

    this.fileManager.updateFile(kindleFile, modifiedFileContents);
  }
}
