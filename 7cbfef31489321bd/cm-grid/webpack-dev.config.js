require('wix-data-testkit/lib/babelHelpers')
const _ = require('lodash')
const webpack = require('webpack')
const base = require('./webpack-base.config.js')
const serveAssets = require('cm-common-test/src/server/assets')
const testkit = require('wix-data-testkit/lib/testkit-factory')()
const express = require('express')
const {collectionName, schema, data} = require('cm-common-test/src/wix-data/mockData')

const dev = _.cloneDeep(base)

dev.devServer = {
  contentBase: 'src',
  port: process.env.PORT || 3000,
  inline: true,
  hot: true,
  setup: app => {
    app.use(serveAssets(__dirname))
    app.use('/api', testkit.getRouter())
    app.use('/lib/es6runtime.min.js', express.static(require.resolve('wix-data-testkit/lib/web-client/es6runtime.min.js')))
    app.use('/lib/wix-data.min.js', express.static(require.resolve('wix-data-testkit/lib/web-client/wix-data.min.js')))

    testkit.givenSchemaForCollection(collectionName, schema)
    testkit.setInitialData({
      [collectionName]: data
    })
  }
}

dev.plugins.push(new webpack.HotModuleReplacementPlugin())

module.exports = dev
