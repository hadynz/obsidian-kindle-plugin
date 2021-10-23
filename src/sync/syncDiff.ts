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
  prevRenderedHighlight: RenderedHighlight;
  nextRenderedHighlight: RenderedHighlight;
};

type DiffIndex = {
  highlight: Highlight;
  exists: boolean;
};

const getNeighbours = (
  state: Map<string, DiffIndex>,
  needle: string
): [Highlight, Highlight] => {
  const keys = Array.from(state.keys());
  const needleIndex = keys.indexOf(needle);

  let prev = null;
  let next = null;

  for (let i = needleIndex - 1; i >= 0; i--) {
    const diffIndex = state.get(keys[i]);
    if (diffIndex.exists) {
      prev = diffIndex.highlight;
      break;
    }
  }

  for (let i = needleIndex + 1; i < keys.length; i++) {
    const diffIndex = state.get(keys[i]);
    if (diffIndex.exists) {
      next = diffIndex.highlight;
      break;
    }
  }

  return [prev, next];
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
    const [prev, next] = getNeighbours(syncState, remote.id);
    const prevRendered = renders.find((r) => r.highlightId === prev?.id);
    const nextRendered = renders.find((r) => r.highlightId === next?.id);

    return {
      remoteHighlight: remote,
      nextRenderedHighlight: nextRendered,
      prevRenderedHighlight: prevRendered,
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

    const modifiedFileContents = sb(fileContents)
      .insertLinesAt(
        diffs.map((d) => ({
          line: d.nextRenderedHighlight.line,
          content: this.renderer.renderHighlight(
            kindleFile.book,
            d.remoteHighlight
          ),
        }))
      )
      .toString();

    this.fileManager.updateFile(kindleFile, modifiedFileContents);
  }
}
