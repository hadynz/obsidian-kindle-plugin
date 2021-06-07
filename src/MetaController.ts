import type { App, TFile } from 'obsidian';

export type Property = { key: string; content: string; type: MetaType };

export enum MetaType {
  YAML,
  Dataview,
  Tag,
  Option,
}

export default class MetaController {
  private readonly app: App;

  constructor(app: App) {
    this.app = app;
  }

  public async updatePropertyInFile(
    property: Partial<Property>,
    newValue: string,
    file: TFile
  ): Promise<void> {
    const fileContent = await this.app.vault.read(file);

    const newFileContent = fileContent
      .split('\n')
      .map((line) => {
        if (this.lineMatch(property, line)) {
          return this.updatePropertyLine(property, newValue);
        }

        return line;
      })
      .join('\n');

    await this.app.vault.modify(file, newFileContent);
  }

  private lineMatch(property: Partial<Property>, line: string): boolean {
    const propertyRegex = new RegExp(`^s*${property.key}:{1,2}`);
    const tagRegex = new RegExp(`^s*${property.key}`);

    if (property.key.contains('#')) {
      return tagRegex.test(line);
    }

    return propertyRegex.test(line);
  }

  private updatePropertyLine(property: Partial<Property>, newValue: string) {
    let newLine: string;
    switch (property.type) {
      case MetaType.Dataview:
        newLine = `${property.key}:: ${newValue}`;
        break;
      case MetaType.YAML:
        newLine = `${property.key}: ${newValue}`;
        break;
      case MetaType.Tag:
        {
          const splitTag: string[] = property.key.split('/');
          if (splitTag.length === 1) newLine = `${splitTag[0]}/${newValue}`;
          else if (splitTag.length > 1) {
            const allButLast: string = splitTag
              .slice(0, splitTag.length - 1)
              .join('/');
            newLine = `${allButLast}/${newValue}`;
          } else newLine = property.key;
        }
        break;
      default:
        newLine = property.key;
        break;
    }

    return newLine;
  }
}
