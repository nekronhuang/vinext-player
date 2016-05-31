'use strict'

const path = require('path')
const webpack = require('webpack')

const config = require('./base')

config.debug = true

config.devtool = 'cheap-module-source-map'

config.output = {
  publicPath: '/dev/',
  filename: '[name].js',
  sourceMapFilename: '[name].map',
  chunkFilename: '[id].chunk.js',
  library: 'Player',
  libraryTarger: 'this',
}

config.devServer = {
  port: 8800,
  host: '0.0.0.0',
  historyApiFallback: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  contentBase: './demo',
}

config.plugins = config.plugins.concat([
  new webpack.DefinePlugin({
    VERSION: `'debug mode'`
  })
])

module.exports = config