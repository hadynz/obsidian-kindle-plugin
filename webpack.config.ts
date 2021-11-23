import path from 'path';
import pack from './package.json';
import sveltePreprocess from 'svelte-preprocess';
import TerserPlugin from 'terser-webpack-plugin';
import EmitFilePlugin from 'emit-file-webpack-plugin';
import SentryWebpackPlugin from '@sentry/webpack-plugin';
import { Configuration, DefinePlugin, WebpackPluginInstance } from 'webpack';

const isProduction = process.env.NODE_ENV === 'production';

const obsidianManifestPlugin = new EmitFilePlugin({
  filename: 'manifest.json',
  content: () => ({
    name: 'Kindle Highlights',
    minAppVersion: '0.10.2',
    isDesktopOnly: true,
    id: pack.name,
    version: pack.version,
    description: pack.description,
    author: pack.author.name,
    authorUrl: pack.author.url,
  }),
});

const sentryPlugin = new SentryWebpackPlugin({
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: 'hadynz',
  project: 'kindle-highlights',
  release: pack.version,
  ignore: ['node_modules', 'webpack.config.js'],
  include: 'dist',
});

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
    new DefinePlugin({
      PACKAGE_NAME: JSON.stringify(pack.name),
      VERSION: JSON.stringify(pack.version),
      PRODUCTION: JSON.stringify(isProduction),
    }),
    ...(isProduction ? [sentryPlugin] : []),
    ...(isProduction ? [obsidianManifestPlugin as WebpackPluginInstance] : []),
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
