import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';

const TEST_VAULT = '.';

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
    typescript({ sourceMap: true }),
    commonjs({ sourceMap: true }),
    json(),
    copy({
      targets: [
        { src: 'dist/main.js', dest: TEST_VAULT },
        {
          src: 'manifest.json',
          dest: 'dist/',
        },
      ],
      flatten: true,
      verbose: true,
      hook: 'closeBundle',
    }),
  ],
};
