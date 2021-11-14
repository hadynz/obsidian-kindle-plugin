import nunjucks, { Environment } from 'nunjucks';

const DefaultTemplate = '{{shortTitle}}';

class FileNameRenderer {
  private nunjucks: Environment;

  constructor() {
    this.nunjucks = new nunjucks.Environment(null, { autoescape: false });
  }

  public validate(template: string): boolean {
    try {
      this.nunjucks.renderString(template, {});
      return true;
    } catch (error) {
      return false;
    }
  }

  public defaultTemplate(): string {
    return DefaultTemplate;
  }
}

export const fileNameRenderer = new FileNameRenderer();
