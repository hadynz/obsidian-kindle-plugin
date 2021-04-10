const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'main.js',
    libraryTarget: 'commonjs',
  },
  target: 'node',
  mode: 'production',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: './manifest.json', to: '.' }],
      //patterns: [{ from: './dist/main.js', to: '..' }],
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  externals: {
    obsidian: 'commonjs2 obsidian',
  },
};
