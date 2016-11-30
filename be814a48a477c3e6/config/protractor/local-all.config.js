/*global browser, jasmine*/
'use strict'

var jasmineReporters = require('jasmine-reporters')

module.exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    params: {
        debug: 'all',
        ReactSource: 'http://localhost',
        EditorSource: 'http://localhost/editor-base'
    },
    retries: 3,
    specs: ['../../spec/santaEditorSpec.js'],
    framework: 'jasmine2',
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 60000
    },
    onPrepare: function () {
        browser.ignoreSynchronization = true
        if (process.env.TEAMCITY_VERSION) {
            jasmine.getEnv().addReporter(new jasmineReporters.TeamCityReporter())
        }
    }
}
