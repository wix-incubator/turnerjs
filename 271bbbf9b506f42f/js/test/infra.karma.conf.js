/*eslint santa/enforce-package-access:0*/
// Karma configuration
module.exports = function (config) {
    'use strict';
    var path = require('path');
    console.log('Running karma.conf.js for infrastructures');

    config.set({
        basePath: path.join(__dirname, '../../'), // base path, that will be used to resolve files and exclude
        frameworks: ['jasmine', 'requirejs'], // frameworks to use

        files: [
            'js/test/karmaRequireUtils.js',
            'node_modules/santa-utils/common/jasmine/matchers.js',
            'js/test/jasmineMatchers-react.js',
            'node_modules/santa-utils/common/partials/urlUtils.js',
            {pattern: 'packages/*/src/main/**/*.js', included: false},
            {pattern: 'js/**/test/*.spec.js', included: false},
            {pattern: 'js/vendor/**/*.js', included: false},
            {pattern: 'js/plugins/**/*.js', included: false},
            {pattern: 'static/wixcode/static/RMI/rmi-bundle.js', included: false},
            'app/rjs-config.js',
            'js/test/packagesList.js',
            'js/test/karmaTestSetup.js'
        ], // list of files / patterns to load in the browser

        exclude: [], // list of files to exclude

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'packages/*/src/main/**/*.js': ['coverage']
        },
        reporters: ['progress'], // test results reporter to use // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        port: 9876, // web server port
        colors: true, // enable / disable colors in the output (reporters and logs)
        logLevel: config.LOG_INFO, // level of logging: possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        captureTimeout: 60000, // If browser does not capture in given timeout [ms], kill it
        autoWatch: true, // enable / disable watching file and executing tests whenever any file changes

        // Start these browsers, currently available:
        // - Chrome, ChromeCanary, Firefox, PhantomJS, Opera (karma-opera-launcher), Safari (karma-safari-launcher), IE (karma-ie-launcher)
        browsers: ['Chrome'],
        // browsers: ['PhantomJS'],
        // browsers: ['Chrome','ChromeCanary','PhantomJS'],

        singleRun: false // Continuous Integration mode // if true, it capture browsers, run tests and exit
    });
};
