import CopyPlugin from 'copy-webpack-plugin';
import dotenv from 'dotenv';
import path from 'path';
import sveltePreprocess from 'svelte-preprocess';
import TerserPlugin from 'terser-webpack-plugin';
import { Configuration, DefinePlugin } from 'webpack';

import pack from './package.json';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const releaseVersion = pack.version;

const config: Configuration = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs',
    clean: true,
  },
  target: 'node',
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'inline-source-map',
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
  optimization: {
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        minify: TerserPlugin.uglifyJsMinify,
        terserOptions: {},
      }),
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: './manifest.json',
          to: '.',
        },
      ],
    }),
    new DefinePlugin({
      PACKAGE_NAME: JSON.stringify(pack.name),
      VERSION: JSON.stringify(releaseVersion),
      PRODUCTION: JSON.stringify(isProduction),
    }),
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

export default config;
