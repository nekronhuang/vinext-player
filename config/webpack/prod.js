'use strict'

const path = require('path')
const webpack = require('webpack')

const pack = require('../../package.json')
const config = require('./base')

config.debug = false

config.devtool = 'souce-map'

config.output = {
  path: path.resolve(__dirname, '../../dist'),
  filename: '[name].bundle.js',
  sourceMapFilename: '[name].bundle.map',
  chunkFilename: '[id].chunk.js',
  library: 'VinextPlayer',
  libraryTarger: 'this',
}

config.plugins = config.plugins.concat([
  new webpack.optimize.UglifyJsPlugin({
    beautify: false,
    comments: false,
    compress: {
      screw_ie8: true, // give up support for ie 6-8
      warnings: false,
    },
    mangle: {
      screw_ie8: true,
      keep_fnames: true, // useful for code using Function.prototype.name
    }
  }),
  new webpack.DefinePlugin({
    VERSION: `'Vinext@${pack.version} update on ${new Date()}'`
  })
])

module.exports = config
