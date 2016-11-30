exports.config = {
    sauceUser: 'ci-tester',
    sauceKey: 'aee65616-230d-49b3-974f-4d1b8afac45c',
    params:{
        santaUrl: '&ReactSource=http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa&baseVersion=http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa&SantaVersions=http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa/target'
    },

    multiCapabilities: [
        {
            'browserName': 'chrome',
            'platform': 'Windows 8.1',
            'name': 'Santa SDK Integration tests - Chrome'
        }
        //{
        //    'browserName': 'firefox',
        //    'platform': 'Windows 8.1',
        //    'name': 'Santa SDK Integration tests - FF'
        //}
    ],

    // Spec patterns are relative to the current working directly when protractor is called.
    specs: ['../../spec/santaSpec.js'],

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
