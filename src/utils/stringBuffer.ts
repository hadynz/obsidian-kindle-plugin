type LineEntry = {
  line: number;
  content: string;
};

type LineEntryMatch = LineEntry & {
  match: RegExpMatchArray;
  matchIndex: number;
};

export class StringBuffer {
  private lines: string[];

  constructor(content: string) {
    this.lines = content.split('\n');
  }

  public getLine(line: number): string {
    if (line <= 0) {
      throw new Error('Line numbers must start from 1');
    }

    return this.lines[line - 1];
  }

  public find(predicate: (entry: LineEntry) => boolean): LineEntry[] {
    return this.lines
      .map((content, index): LineEntry => ({ line: index + 1, content }))
      .filter(predicate);
  }

  public match(regexList: RegExp[]): LineEntryMatch[] {
    return this.lines.map((content, index) => {
      for (let matchIndex = 0; matchIndex < regexList.length; matchIndex++) {
        const regex = regexList[matchIndex];
        const match = content.match(regex);

        if (match) {
          return { line: index + 1, content, match, matchIndex };
        }
      }

      return { line: index + 1, content, match: null, matchIndex: regexList.length };
    });
  }

  public insertLinesAt(newLines: LineEntry[]): StringBuffer {
    if (newLines.some((l) => l.line <= 0)) {
      throw new Error('Line numbers must start from 1');
    }

    for (let i = newLines.length - 1; i >= 0; i--) {
      const newLine = newLines[i];
      this.lines.splice(newLine.line - 1, 0, newLine.content);
    }

    return this;
  }

  public replace(line: LineEntry): StringBuffer {
    this.lines[line.line] = line.content;
    return this;
  }

  public append(newLines: string[]): StringBuffer {
    this.lines.push(...newLines);
    return this;
  }

  public toString(): string {
    return this.lines.join('\n');
  }
}

export const sb = (content: string): StringBuffer => new StringBuffer(content);
