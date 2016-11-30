var username = 'liorshefer1';
var accessKey = 'ijKcQzj1LbsVVpVcnGau';

exports.config = {
    // The address of a running selenium server.
    seleniumAddress: 'http://hub.browserstack.com/wd/hub',

    multiCapabilities: [
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

    specs: ['../spec/runSpec.js'],

    jasmineNodeOpts: {
        defaultTimeoutInterval: 6000000
    },

    onPrepare: function () {
        browser.ignoreSynchronization = true;
        require('jasmine-reporters');
        require('jasmine-before-all');
        jasmine.getEnv().addReporter(new jasmine.TeamcityReporter());
    }
};
