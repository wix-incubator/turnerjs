const base = require('./webpack-base.config.js')
const cloneDeep_ = require('lodash/cloneDeep')
const mapValues_ = require('lodash/mapValues')

const prod = cloneDeep_(base)

prod.entry = typeof prod.entry === 'object' ?
  mapValues_(prod.entry, v => ['dbsm-common/src/turnOffBabelPolyfill', 'babel-polyfill'].concat(v)) :
  ['dbsm-common/src/turnOffBabelPolyfill', 'babel-polyfill'].concat(prod.entry)

module.exports = prod
