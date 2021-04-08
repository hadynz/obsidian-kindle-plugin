import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';

const DIST_DIR = '../../dist/';

export default {
  input: 'src/main.ts',
  output: {
    dir: 'dist/',
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default',
  },

  external: ['obsidian'],
  plugins: [
    nodeResolve({ browser: true, preferBuiltins: true }),
    typescript({ sourceMap: false }),
    commonjs({ sourceMap: false }),
    json(),
    copy({
      targets: [
        { src: './dist/main.js', dest: DIST_DIR },
        {
          src: 'manifest.json',
          dest: DIST_DIR,
        },
      ],
      flatten: true,
      verbose: true,
      hook: 'closeBundle',
    }),
  ],
};
