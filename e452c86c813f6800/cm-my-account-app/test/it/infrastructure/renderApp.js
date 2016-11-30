'use strict'

require('wix-data-testkit/lib/babelHelpers')
const {render, findDOMNode} = require('react-dom')
const Raven = require('raven-js')
const testkit = require('wix-data-testkit/lib/testkit-factory')()

const createApp = wixData => {
  return require('../../../src/app')({wixData, Raven})
}

module.exports = (mountPoint, {wixDataHost}) => {
  const wixData = testkit.createClient(wixDataHost)
  findDOMNode(render(createApp(wixData), mountPoint))
}
