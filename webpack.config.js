const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const sveltePreprocess = require('svelte-preprocess');

const isDevMode = process.env.NODE_ENV === 'development';

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'main.js',
    libraryTarget: 'commonjs',
  },
  target: 'node',
  mode: isDevMode ? 'development' : 'production',
  devtool: isDevMode ? 'eval' : 'none',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.(html|svelte)$/,
        use: [
          { loader: 'babel-loader' },
          {
            loader: 'svelte-loader',
            options: {
              emitCss: true,
              preprocess: sveltePreprocess({}),
            },
          },
        ],
      },
      {
        // required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
        test: /node_modules\/svelte\/.*\.mjs$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: './manifest.json', to: '.' }],
    }),
  ],
  resolve: {
    alias: {
      svelte: path.resolve('node_modules', 'svelte'),
    },
    extensions: ['.ts', '.tsx', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
  externals: {
    obsidian: 'commonjs2 obsidian',
  },
};
