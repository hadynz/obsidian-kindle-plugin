const proc = require('process');
const { fork } = require('child_process');

import { App } from 'obsidian';

async function getPluginPath(app: App): Promise<string> {
  let pathSep = '/';

  if (proc.platform == 'win32') {
    pathSep = '\\';
  }

  const pluginDirectory = `.obsidian${pathSep}obsidian-kindle-highlights`;
  const obsidianDirectory = (app.vault.adapter as any).basePath;
  return `${obsidianDirectory}${pathSep}${pluginDirectory}`;
}

export class KindleServer {
  child: any;
  file =
    '/Users/hady.osman/Documents/Hady 2nd brain/.obsidian/plugins/obsidian-kindle-highlights/kindle-server/build/index.js';

  async start() {
    this.child = fork(this.file);
    await new Promise((r) => setTimeout(r, 1000));
    console.log('Kindle server started...');
  }

  async stop() {
    this.child.kill();
    console.log('Killed server');
  }
}
