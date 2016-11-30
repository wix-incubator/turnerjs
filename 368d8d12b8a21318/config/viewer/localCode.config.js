exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    params:{
      santaUrl: '&ReactSource=http://localhost&baseVersion=http://localhost'
    },
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
