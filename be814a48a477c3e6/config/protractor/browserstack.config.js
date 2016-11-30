/*global browser, jasmine*/
'use strict'

var username = 'liorshefer1'
var accessKey = 'ijKcQzj1LbsVVpVcnGau'
var jasmineReporters = require('jasmine-reporters')

module.exports.config = {
    seleniumAddress: 'http://hub.browserstack.com/wd/hub',
    params: {
        debug: 'platformIntegrationEditor',
        ReactSource: 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa',
        EditorSource: 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa-editor'
    },

    multiCapabilities: [
        {
            'name': 'Santa Editor Platform Integration tests - Chrome',
            'browserName': 'chrome',
            'os': 'OS X',
            'browserstack.user': username,
            'browserstack.key': accessKey,
            'browserstack.debug': 'true',
            'browserstack.bfcache': '0'
        }
    ],

    specs: ['../../spec/santaEditorSpec.js'],

    jasmineNodeOpts: {
        defaultTimeoutInterval: 6000000
    },

    onPrepare: function () {
        browser.ignoreSynchronization = true
        require('jasmine-before-all')
        if (process.env.TEAMCITY_VERSION) {
            jasmine.getEnv().addReporter(new jasmineReporters.TeamCityReporter())
        }
    }
}
