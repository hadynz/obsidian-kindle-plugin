import _ from 'lodash';

import type FileManager from '~/fileManager';
import type { Highlight } from '~/models';
import type { Book, KindleFile } from '~/models';
import { HighlightIdBlockRefPrefix, HighlightRenderer } from '~/rendering/renderer';
import { mapToPreRenderedHighlights } from '~/rendering/renderer/fileRenderer/preRender';
import { sb, StringBuffer } from '~/utils';

import { diffLists } from './helpers';

export type RenderedHighlight = {
  line: number;
  highlightId?: string;
  text: string;
  type: 'clipping' | 'heading';
};

export type DiffLocation = {
  highlight: Highlight;
  successorSibling?: RenderedHighlight;
};

export class DiffManager {
  private fileBuffer: StringBuffer;

  public static async create(
    highlightRenderer: HighlightRenderer,
    fileManager: FileManager,
    kindleFile: KindleFile
  ): Promise<DiffManager> {
    const manager = new DiffManager(highlightRenderer, fileManager, kindleFile);
    await manager.load();
    return manager;
  }

  private constructor(
    private highlightRenderer: HighlightRenderer,
    private fileManager: FileManager,
    private kindleFile: KindleFile
  ) {}

  private async load(): Promise<void> {
    const fileContents = await this.fileManager.readFile(this.kindleFile);
    this.fileBuffer = sb(fileContents);
  }

  public diff(remoteHighlights: Highlight[]): DiffLocation[] {
    const renderedHighlights = this.parseRenderedHighlights();
    return diffLists(remoteHighlights, renderedHighlights);
  }

  private parseRenderedHighlights(): RenderedHighlight[] {
    const needle = _.escapeRegExp(HighlightIdBlockRefPrefix);

    const endsWithRegex = new RegExp(`.*(${needle}.*)$`);
    const headerThreePlusRegex = /#{3} (.*)/;

    return this.fileBuffer
      .match([endsWithRegex, headerThreePlusRegex])
      .filter((lem) => lem.match != null)
      .map((lem) => {
        const type = lem.matchIndex === 0 ? 'clipping' : 'heading';
        return {
          line: lem.line,
          text: type === 'clipping' ? lem.content : lem.match[1],
          highlightId:
            type === 'clipping'
              ? lem.match[1].replace(HighlightIdBlockRefPrefix, '')
              : undefined,
          type,
        };
      });
  }

  public async applyDiffs(
    remoteBook: Book,
    remoteHighlights: Highlight[],
    diffs: DiffLocation[]
  ): Promise<void> {
    const insertList = diffs
      .filter((d) => d.successorSibling)
      .map((d) => ({
        line: d.successorSibling?.line,
        content: this.highlightRenderer.render(
          mapToPreRenderedHighlights(d.highlight),
          this.kindleFile.book
        ),
      }));

    const appendList = diffs
      .filter((d) => d.successorSibling == null)
      .map((d) =>
        this.highlightRenderer.render(
          mapToPreRenderedHighlights(d.highlight),
          this.kindleFile.book
        )
      );

    const modifiedFileContents = this.fileBuffer
      .insertLinesAt(insertList)
      .append(appendList)
      .toString();

    await this.fileManager.updateFile(
      this.kindleFile,
      remoteBook,
      modifiedFileContents,
      remoteHighlights.length
    );
  }
}
