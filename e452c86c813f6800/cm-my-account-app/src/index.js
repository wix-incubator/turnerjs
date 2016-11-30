'use strict'

const ReactDOM = require('react-dom')
const Raven = require('raven-js')

const createApp = require('./app')

require('dbsm-common/src/raven/configure')(Raven, window.location.href)

const instance = window.instance
const wixData = window.wixData.wixData
const devToolsExtension = window.devToolsExtension
const staticsUrl = window.staticsUrl
const staticMediaUrl = window.staticMediaUrl
const myAccountSDK = window.Wix

window.elementorySupport.baseUrl = '/api'
window.elementorySupport.queryParameters = `viewMode=site&locale=en&instance=${instance}&locale=en&module-name=wixData`

ReactDOM.render(createApp({
  wixData, 
  devToolsExtension, 
  Raven, 
  staticsUrl, 
  staticMediaUrl,
  myAccountSDK
}), document.getElementById('cm-wrapper'))
