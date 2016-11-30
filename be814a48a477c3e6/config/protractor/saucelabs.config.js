/*global browser, jasmine*/
'use strict'

var username = 'ci-tester'
var accessKey = 'aee65616-230d-49b3-974f-4d1b8afac45c'
var jasmineReporters = require('jasmine-reporters')

exports.config = {
    sauceUser: username,
    sauceKey: accessKey,
    params: {
        debug: 'platformIntegrationEditor',
        ReactSource: 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa',
        EditorSource: 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa-editor'
    },

    multiCapabilities: [
        {
            'browserName': 'chrome',
            'platform': 'OS X 10.10',
            'name': 'Santa Editor Platform Integration tests - Chrome'
        }
        //{
        //    'browserName': 'firefox',
        //    'platform': 'Windows 8.1',
        //    'name': 'Santa SDK Integration tests - FF'
        //}
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
