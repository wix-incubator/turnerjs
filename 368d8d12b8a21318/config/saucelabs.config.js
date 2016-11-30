exports.config = {
    sauceUser: 'ci-tester',
    sauceKey: 'aee65616-230d-49b3-974f-4d1b8afac45c',

    multiCapabilities: [
        {
            'browserName': 'chrome',
            'platform': 'OS X 10.10',
            'name': 'Santa Editor SDK Integration tests - Chrome'
        }
    ],

    jasmineNodeOpts: {
        defaultTimeoutInterval: 6000000
    },

    specs: ['../spec/runSpec.js'],

    onPrepare: function () {
        browser.ignoreSynchronization = true;
        require('jasmine-reporters');
        require('jasmine-before-all');
        jasmine.getEnv().addReporter(new jasmine.TeamcityReporter());
    }
};