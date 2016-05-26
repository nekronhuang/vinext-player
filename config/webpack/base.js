'use strict'

const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: {
    main: './src/main.ts',
  },

  resolve: {
    root: path.resolve(__dirname, '../../src'),
    extensions: ['', '.ts', '.js', '.scss'],
    modulesDirectories: ['node_modules'],
  },

  module: {
    preLoaders: [
      { test: /\.ts$/, loader: 'tslint-loader' },
    ],

    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' },
      { test: /\.scss$/, loader: 'style!css!autoprefixer!sass' },

      // { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff' },
      // { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' },

      // { test: /\.png$/, loader: 'url', exclude: /node_modules/ },
      // { test: '\.jpg$', loader: 'file', exclude: /node_modules/ },
    ],
  },

  plugins: [
    // This make entry chunks smaller but increases the overall size.
    new webpack.optimize.OccurenceOrderPlugin(true),
  ],
}