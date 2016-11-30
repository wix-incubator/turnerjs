exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['../../spec/editorUiLibSpec.js'],
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 10 * 60000
    },
    params: {
        ReactSource: 'http://localhost',
        EditorSource: 'http://localhost/editor-base'
    },
    framework: 'jasmine2',
    onPrepare: function () {
        browser.ignoreSynchronization = true;
        require('jasmine-reporters');
        require('jasmine-before-all');
        jasmine.getEnv().addReporter(new jasmine.TeamcityReporter());
    }
};
