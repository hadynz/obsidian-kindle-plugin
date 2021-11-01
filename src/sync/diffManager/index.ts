import { sb, StringBuffer } from '~/utils';
import { HighlightIdBlockRefPrefix, Renderer } from '~/renderer';
import { diffLists } from './helpers';
import type { Highlight } from '~/models';
import type FileManager from '~/fileManager';
import type { Book, KindleFile } from '~/models';

export type RenderedHighlight = {
  line: number;
  highlightId: string;
};

export type DiffResult = {
  remoteHighlight: Highlight;
  nextRenderedHighlight?: RenderedHighlight;
};

export class DiffManager {
  private renderer: Renderer;
  private fileBuffer: StringBuffer;

  public static async create(
    fileManager: FileManager,
    kindleFile: KindleFile
  ): Promise<DiffManager> {
    const manager = new DiffManager(fileManager, kindleFile);
    await manager.load();
    return manager;
  }

  private constructor(private fileManager: FileManager, private kindleFile: KindleFile) {
    this.renderer = new Renderer();
  }

  private async load(): Promise<void> {
    const fileContents = await this.fileManager.readFile(this.kindleFile);
    this.fileBuffer = sb(fileContents);
  }

  public async diff(remoteHighlights: Highlight[]): Promise<DiffResult[]> {
    const renderedHighlights = await this.parseRenderedHighlights();
    return diffLists(remoteHighlights, renderedHighlights);
  }

  private async parseRenderedHighlights(): Promise<RenderedHighlight[]> {
    return this.fileBuffer
      .find((lineEntry) => lineEntry.content.startsWith(HighlightIdBlockRefPrefix))
      .map((lineEntry): RenderedHighlight => {
        const { line, content } = lineEntry;
        return {
          line,
          highlightId: content.replace(HighlightIdBlockRefPrefix, ''),
        };
      });
  }

  public async applyDiffs(
    remoteBook: Book,
    remoteHighlights: Highlight[],
    diffs: DiffResult[]
  ): Promise<void> {
    const insertList = diffs
      .filter((d) => d.nextRenderedHighlight)
      .map((d) => ({
        line: d.nextRenderedHighlight?.line,
        content: this.renderer.renderHighlight(this.kindleFile.book, d.remoteHighlight),
      }));

    const appendList = diffs
      .filter((d) => d.nextRenderedHighlight == null)
      .map((d) => this.renderer.renderHighlight(this.kindleFile.book, d.remoteHighlight));

    const modifiedFileContents = this.fileBuffer
      .insertLinesAt(insertList)
      .append(appendList)
      .toString();

    this.fileManager.updateFile(
      this.kindleFile,
      remoteBook,
      modifiedFileContents,
      remoteHighlights.length
    );
  }
}
