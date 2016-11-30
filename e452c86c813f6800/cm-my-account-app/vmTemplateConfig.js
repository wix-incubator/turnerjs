'use strict'

const path = require('path')

module.exports = host => ({
  requestPath: '/',
  templatePath: path.join(__dirname, 'src/index.vm'),
  context: {
    data: {
      instance: ''
    },
    clientTopology: {
      myAccountAppStaticsUrl: host,
      cloudRuntimeStaticsUrl: host,
      staticBaseUrl: host,
      staticMediaUrl: 'http://static.wixstatic.com/media/'
    }
  }
})

module.exports.scriptsPaths = {
  es6runtime: '/lib/es6runtime.min.js',
  wixData: '/lib/wix-data.min.js',
  sdk: '/services/js-sdk/1.67.0/js/wix.min.js',
  react: '/services/third-party/react/15.3.1/react.min.js',
  reactDOM: '/services/third-party/react/15.3.1/react-dom.min.js'
}
