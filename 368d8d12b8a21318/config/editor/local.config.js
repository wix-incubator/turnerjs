exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    params: {
        debug: 'tpaIntegrationEditor',
        ReactSource: 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa',
        EditorSource: 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa-editor'
    },
    specs: ['../../spec/santaEditorSpec.js'],
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 60000
    },
    framework: 'jasmine2',
    onPrepare: function () {
        browser.ignoreSynchronization = true;
        require('jasmine-reporters');
        require('jasmine-before-all');
        jasmine.getEnv().addReporter(new jasmine.TeamcityReporter());
    }
};
