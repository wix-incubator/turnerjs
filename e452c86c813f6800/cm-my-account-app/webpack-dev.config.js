require('wix-data-testkit/lib/babelHelpers')
const cloneDeep_ = require('lodash/cloneDeep')
const webpack = require('webpack')
const base = require('./webpack-base.config.js')
const Dashboard = require('webpack-dashboard')
const DashboardPlugin = require('webpack-dashboard/plugin')
const path = require('path')
const serveAssets = require('cm-common-test/src/server/assets')
const serveVmTemplate = require('cm-common-test/src/server/vmTemplate')
const scriptsMiddleware = require('cm-common-test/src/server/scripts')
const express = require('express')
const testkit = require('wix-data-testkit/lib/testkit-factory')()

const {collectionName, schema, data} = require('cm-common-test/src/wix-data/mockData')
const vmTemplateConfig = require('./vmTemplateConfig')

const dashboard = new Dashboard()
const dev = cloneDeep_(base)
const port = process.env.PORT || 3000
const host = `http://localhost:${port}/`

dev.devServer = {
  contentBase: 'src',
  port,
  inline: true,
  hot: true,
  quiet: true,
  setup: app => {
    app.use(serveVmTemplate(vmTemplateConfig(host)))

    app.use('/api', testkit.getRouter())
    app.use('/lib/es6runtime.min.js', express.static(require.resolve('wix-data-testkit/lib/web-client/es6runtime.min.js')))
    app.use('/lib/wix-data.min.js', express.static(require.resolve('wix-data-testkit/lib/web-client/wix-data.min.js')))

    testkit.givenSchemaForCollection(collectionName, schema)
    testkit.setInitialData({
      [collectionName]: data
    })
    
    app.use(scriptsMiddleware.ignore([
      vmTemplateConfig.scriptsPaths.sdk
    ]))

    app.use(scriptsMiddleware.local({
      [vmTemplateConfig.scriptsPaths.react]: path.resolve(__dirname, './node_modules/react/dist/react.min.js'),
      [vmTemplateConfig.scriptsPaths.reactDOM]: path.resolve(__dirname, './node_modules/react-dom/dist/react-dom.min.js')
    }))
    
    app.use(serveAssets(__dirname))
    app.use(serveAssets(path.join(__dirname, 'node_modules/cm-grid/assets')))
  }
}

dev.plugins.push(new webpack.HotModuleReplacementPlugin())
dev.plugins.push(new DashboardPlugin(dashboard.setData))

dev.module = {
  loaders: [
    {
      test: /\.jsx?$/,
      exclude: p => {
        return p.includes('node_modules') && !p.includes('cm-grid/src') && !p.includes('common-test/src') && !p.includes('common/src') && !p.includes('wix-code-media-manager-support/src')
      },
      loader: 'babel',
      query: {
        presets: [require.resolve('babel-preset-es2015'), require.resolve('babel-preset-react-hmre')]
      }
    },
    {
      test: /\.css$/,
      loader: 'style!css'
    },
    {
      test: /node_modules.*\.scss$/,
      exclude: p => p.includes('cm-grid/src'),
      loader: 'style!css!postcss!sass'
    },
    {
      test: /\.scss$/,
      exclude: p => p.includes('node_modules') && !p.includes('cm-grid/src'),
      loader: 'style!css?modules=true&camelCase=true&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass'
    }
  ]
}

module.exports = dev
