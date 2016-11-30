/*eslint strict:[2, "global"],semi:[2,"never"],no-unused-vars:0,curly:0 */
'use strict'

function setMockBrowserMocks() {
    var MockBrowser = require('mock-browser').mocks.MockBrowser
    var mock = new MockBrowser()
    global.document = mock.getDocument()
    global.window = mock.getWindow()
    global.navigator = global.window.navigator
}

function setJsDomMocks() {
    var jsdom = require('jsdom')
    global.document = jsdom.jsdom('<!doctype html><html><body></body></html>')
    global.window = global.document.defaultView
}

function loadExperiments() {
    var experiments = require('santa-utils').getExperimentsFromArgv()
    if (experiments.length) console.log('with experiments: ', experiments)
    experiments.forEach(function(e) { require('../../descriptors/test/internal/' + e + '.js') })
}

////////////////////////////////////////////////////////////////////////////////
var resolve = require('path').resolve.bind(null, process.cwd())

global._ = require('lodash') // for matchers

require(resolve('server', 'main', 'sssr', 'requirejs-config'))
require(resolve('node_modules', 'santa-utils', 'common', 'jasmine', 'matchers.js'))
require(resolve('js', 'test', 'disableRandom.js'))

global.define = function(required, cb) {
    if (cb) {
        cb.apply(null, required.map(require('requirejs')))
    }
}

setMockBrowserMocks()
// setJsDomMocks()

loadExperiments()

global.window._gaq = true // cause of stats.g.doubleclick.net/dc.js
