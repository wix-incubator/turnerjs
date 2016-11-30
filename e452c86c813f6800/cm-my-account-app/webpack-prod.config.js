const base = require('./webpack-base.config.js')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const cloneDeep_ = require('lodash/cloneDeep')

const prod = cloneDeep_(base)

  prod.plugins.push(new ExtractTextPlugin('[name].css'))

prod.stats = {
  children: false
}

prod.module = {
  loaders: [
    {
      test: /\.jsx?$/,
      exclude: p => {
        return p.includes('node_modules') && !p.includes('cm-grid/src') && !p.includes('common-test/src') && !p.includes('common/src') && !p.includes('wix-code-media-manager-support/src')
      },
      loader: 'babel',
      query: {
        presets: [require.resolve('babel-preset-es2015')]
      }
    },
    {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract('style', '!css?minimize&-autoprefixer!postcss')
    },
    {
      test: /node_modules.*\.scss$/,
      exclude: p => p.includes('cm-grid/src'),
      loader: ExtractTextPlugin.extract('style', '!css?minimize&-autoprefixer!postcss!sass')
    },
    {
      test: /\.scss$/,
      exclude: p => p.includes('node_modules') && !p.includes('cm-grid/src'),
      loader: ExtractTextPlugin.extract('style', '!css?modules=true&minimize&-autoprefixer&camelCase=true&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass')
    }
  ]
}

module.exports = prod
