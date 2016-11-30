/*global browser, jasmine*/
'use strict'

var jasmineReporters = require('jasmine-reporters')

module.exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    params: {
        debug: 'platformIntegrationEditor',
        ReactSource: 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa',
        EditorSource: 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa-editor'
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
        require('jasmine-before-all')
        if (process.env.TEAMCITY_VERSION) {
            jasmine.getEnv().addReporter(new jasmineReporters.TeamCityReporter())
        }
    }
}
