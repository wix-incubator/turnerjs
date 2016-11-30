exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    params: {
        debug: 'all',
        ReactSource: 'http://localhost',
        EditorSource: 'http://localhost/editor-base',
    },
    retries: 3,
    specs: ['../../spec/santaEditorSpec.js'],
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 6000000
    },
    framework: 'jasmine2',
    onPrepare: function () {
        browser.ignoreSynchronization = true;
        require('jasmine-reporters');
        require('jasmine-before-all');
        jasmine.getEnv().addReporter(new jasmine.TeamcityReporter());
    }
};
