exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['../spec/runSpec.js'],
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 60000
    },
    onPrepare: function () {
        browser.ignoreSynchronization = true;
        require('jasmine-reporters');
        require('jasmine-before-all');
        jasmine.getEnv().addReporter(new jasmine.TeamcityReporter());
    }
};