/*eslint santa/enforce-package-access:0*/
// Karma configuration
module.exports = function (config, singlePackage, packageName, experiments) {
    'use strict';
    var path = require('path');
    // TODO expose grunt packages utils
    var karmaConfUtils = require('requirejs-packages').karmaConfUtils;
    var getExperimentsFromArgv = require('santa-utils').getExperimentsFromArgv;
    var packagesArray = karmaConfUtils.getPackagesList(singlePackage);
    experiments = experiments || getExperimentsFromArgv();
    if (process.env.experiments) {
        experiments = experiments.length ? experiments : process.env.experiments.split(' ');
    }
    console.log('Running karma.conf.js for package/s: ' + packagesArray.join(', '));
    if (experiments.length) {
        console.log('with experiments: ', experiments);
    }

    config.set({
        basePath: path.join(__dirname, '../../'), // base path, that will be used to resolve files and exclude
        frameworks: ['jasmine', 'requirejs'], // frameworks to use

        files: [
            'js/test/spiesProtection.js',
            // 'js/test/failOnWarnings.js',
            'js/test/karmaRequireUtils.js',
            'js/test/disableRandom.js',
            'node_modules/santa-utils/common/partials/urlUtils.js',
            'app/rjs-config.js',
            'js/test/packagesList.js',
            'js/test/karmaTestSetup.js',
            'node_modules/santa-utils/common/jasmine/matchers.js',
            'node_modules/santa-utils/common/jasmine/timeReporter.js',
            'js/test/jasmineMatchers-react.js',
            'js/external/pmrpc.js',
            {pattern: 'descriptors/test/internal/+(' + experiments.join('|') + ').js', included: true},
            {pattern: 'js/plugins/experiment/experiment.js', included: false},
            {pattern: 'static/wixcode/static/RMI/rmi-bundle.min.js', included: false},
            {pattern: 'static/platform/documentServices/worker.js', included: false},
            {pattern: 'packages/*/src/main/**/*.+(js|ts|js.map)', included: false},
            {pattern: 'packages/+(' + (packageName || packagesArray.join('|')) + ')/src/test/**/*.js', included: false},
            {pattern: 'js/vendor/**/*.js', included: false},
            {pattern: 'js/plugins/*/src/main/**/*.js', included: false}
        ], // list of files / patterns to load in the browser

        exclude: [], // list of files to exclude

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'packages/*/src/main/**/*.js': ['coverage']
        },
        reporters: ['spec'],
        specReporter: {
            maxLogLines: 15,
            suppressPassed: true,
            suppressSkipped: true
        },
        coverageReporter: {
            type: 'html',
            dir: 'target/coverage/'
        },

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
