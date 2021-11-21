import Webpack from 'webpack';
import type WebpackDev from 'webpack-dev-server';
import path from 'path';
import sveltePreprocess from 'svelte-preprocess';
import pack from './package.json';
import CopyPlugin from 'copy-webpack-plugin';
import SentryWebpackPlugin from '@sentry/webpack-plugin';

const isProduction = process.env.NODE_ENV === 'production';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sentryPlugin = new SentryWebpackPlugin({
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: 'hadynz',
  project: 'kindle-highlights',
  release: pack.version,
  ignore: ['node_modules', 'webpack.config.js'],
  urlPrefix: '~/dist',
  include: './dist',
});

const config: Configuration = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs',
  },
  target: 'node',
  mode: isProduction ? 'production' : 'development',
  devtool: 'source-map',
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
        test: /\.(svelte)$/,
        use: [
          { loader: 'babel-loader' },
          {
            loader: 'svelte-loader',
            options: {
              preprocess: sveltePreprocess({}),
            },
          },
        ],
      },
      {
        test: /\.(svg|njk|html)$/,
        type: 'asset/source',
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: './manifest.json', to: '.' }],
    }),
    new Webpack.DefinePlugin({
      PACKAGE_NAME: JSON.stringify(pack.name),
      VERSION: JSON.stringify(pack.version),
      PRODUCTION: JSON.stringify(isProduction),
    }),
    //...(isProduction ? [sentryPlugin] : []),
  ],
  resolve: {
    alias: {
      svelte: path.resolve('node_modules', 'svelte'),
      '~': path.resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
  externals: {
    electron: 'commonjs2 electron',
    obsidian: 'commonjs2 obsidian',
  },
};

export interface Configuration extends Webpack.Configuration, WebpackDev.Configuration {}

export default config;
