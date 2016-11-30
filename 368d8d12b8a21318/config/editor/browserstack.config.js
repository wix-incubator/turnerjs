var username = 'liorshefer1';
var accessKey = 'ijKcQzj1LbsVVpVcnGau';

exports.config = {
    // The address of a running selenium server.
    seleniumAddress: 'http://hub.browserstack.com/wd/hub',
    params: {
        debug: 'tpaIntegrationEditor',
        ReactSource: 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa',
        EditorSource: 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa-editor'
    },

    multiCapabilities: [
        //{
        //    'name': 'Santa SDK Integration tests',
        //    'browserName' : 'firefox',
        //    'os': 'Windows',
        //    'browserstack.user': username,
        //    'browserstack.key': accessKey,
        //    'browserstack.debug': 'true'
        //},
        //{
        //    'name': 'Santa SDK Integration tests',
        //    'browserName': 'chrome',
        //    'os': 'Windows',
        //    'browserstack.user': username,
        //    'browserstack.key': accessKey,
        //    'browserstack.debug': 'true'
        //},
        //{
        //    'name': 'Santa SDK Integration tests - Safari',
        //    'browserName': 'safari',
        //    'os': 'OS X',
        //    'browserstack.user': username,
        //    'browserstack.key': accessKey,
        //    'browserstack.debug': 'true'
        //},
        {
            'name': 'Santa Editor SDK Integration tests - Chrome',
            'browserName': 'chrome',
            'os': 'OS X',
            'browserstack.user': username,
            'browserstack.key': accessKey,
            'browserstack.debug': 'true',
            'browserstack.bfcache': '0'
        }
    ],

    // Spec patterns are relative to the current working directly when protractor is called.
    specs: ['../../spec/santaEditorSpec.js'],

    jasmineNodeOpts: {
        defaultTimeoutInterval: 6000000
    },

    onPrepare: function () {
        browser.ignoreSynchronization = true;
        if (process.env.TEAMCITY_VERSION) {
            require('jasmine-reporters');
            require('jasmine-before-all');
            jasmine.getEnv().addReporter(new jasmine.TeamcityReporter());
        }
    }
};
