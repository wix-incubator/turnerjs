var username = 'liorshefer1';
var accessKey = 'ijKcQzj1LbsVVpVcnGau';

exports.config = {
    // The address of a running selenium server.
    seleniumAddress: 'http://hub.browserstack.com/wd/hub',
    params:{
        santaUrl: '&ReactSource=http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa&baseVersion=http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa&SantaVersions=http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa/target'
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
            'name': 'Santa SDK Integration tests - IE',
            'browserName': 'chrome',
            'os': 'OS X',
            'browserstack.user': username,
            'browserstack.key': accessKey,
            'browserstack.debug': 'true',
            'browserstack.bfcache': '0'
        }
    ],

    // Spec patterns are relative to the current working directly when protractor is called.
    specs: ['../../spec/santaSpec.js'],

    // Options to be passed to Jasmine-node.
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 60000
    },

    onPrepare: function () {
        browser.ignoreSynchronization = true;
        require('jasmine-reporters');
        jasmine.getEnv().addReporter(new jasmine.TeamcityReporter());
    }
};
