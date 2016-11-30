exports.config = {
    sauceUser: 'ci-tester',
    sauceKey: 'aee65616-230d-49b3-974f-4d1b8afac45c',
    params: {
        debug: 'tpaIntegrationEditor',
        ReactSource: 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa',
        EditorSource: 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa-editor'
    },

    multiCapabilities: [
        {
            'browserName': 'chrome',
            'platform': 'OS X 10.10',
            'name': 'Santa Editor SDK Integration tests - Chrome'
        }
        //{
        //    'browserName': 'firefox',
        //    'platform': 'Windows 8.1',
        //    'name': 'Santa SDK Integration tests - FF'
        //}
    ],

    jasmineNodeOpts: {
        defaultTimeoutInterval: 6000000
    },

    // Spec patterns are relative to the current working directly when protractor is called.
    specs: ['../../spec/santaEditorSpec.js'],

    onPrepare: function () {
        browser.ignoreSynchronization = true;
        if (process.env.TEAMCITY_VERSION) {
            require('jasmine-reporters');
            require('jasmine-before-all');
            jasmine.getEnv().addReporter(new jasmine.TeamcityReporter());
        }
    }
};
