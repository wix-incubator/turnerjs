// Karma configuration
// Generated on Sun Jul 27 2014 15:38:54 GMT+0300 (Jerusalem Daylight Time)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'src/test/libs/mootools-core-1.3-full-nocompat.js',
            'src/test/libs/mootools-more.js',
            'src/test/libs/lodash.js',
            'src/test/libs/q.js',
            'http://static.parastorage.com/services/third-party/jquery/2.1.1/dist/jquery-2.1.1.auto-noconflict.js',
            'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.0-rc.0/angular.js',
            'src/main/libs/angular-mocks.js',
            'src/main/libs/w-mocks.js',
            'src/main/javascript/angular/init/InitAngularModules.js',
            'src/main/javascript/angular/**/*.js',
            'src/test/javascript/angular/**/*.js'
        ],


        // list of files to exclude
        exclude: [
            'src/main/javascript/angular/examples/**/*.js',
            'src/main/javascript/angular/**/TestPanel*.js'
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
//        preprocessors: {
//            'src/main/javascript/angular/!(cloud)/**/*.js': ['coverage']
//        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['dots', 'coverage'],

        coverageReporter: {
            type: 'html',
            dir: 'src/test/generated/coverage/'
        },


        /* coverageReporter: {
         type : 'html',
         dir : 'coverage/'
         },*/

        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};
