exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    params:{
      santaUrl: '&ReactSource=http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa&baseVersion=http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa&SantaVersions=http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa/target'
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
