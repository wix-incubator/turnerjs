'use strict';
// Karma configuration
module.exports = function (config) {
    var karmaRenderer = require('./serverSideIntegration/karmaRenderer');
    // TODO expose grunt packages utils
    var getExperimentsFromArgv = require('santa-utils').getExperimentsFromArgv;
    var experiments = getExperimentsFromArgv();
    if (process.env.experiments) {
        experiments = experiments.length ? experiments : process.env.experiments.split(' ');
    }
    console.log('Running karma.conf.js for serverSideIntegration');
    if (experiments.length) {
        console.log('with experiments: ', experiments);
    }
    var port = Number.parseInt(10000 + Math.random() * 1000, 10);

    config.set({
        basePath: '../../',
        frameworks: ['jasmine', 'requirejs', 'expressServer'],
        files: [
            'node_modules/santa-utils/common/partials/urlUtils.js',
            {pattern: 'app/main-r.min.js', included: false},
            {pattern: 'app/rjs-config.js', included: true},
            {pattern: 'static/**', included: false},
            {pattern: 'packages/*/src/main/**/*.js', included: false},
            {pattern: 'target/packages-bin/**/*.js', included: false},
            {pattern: 'js/vendor/**/*.js', included: false},
            {pattern: 'js/plugins/**/*.js', included: false},
            {pattern: 'server/test/**/*.spec.js', included: false},
            'server/test/test-main.js'
        ],

        preprocessors: {
            'server/test/test-main.js': ['global']
        },
        reporters: ['progress'],
        port: 9876,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome_big'],
        customLaunchers: {
            Chrome_big: {
                base: 'Chrome',
                flags: [
                    '--window-size=1800,1200',
                    '--window-position=0,0',
                    '--disable-web-security'
                ]
            }
        },
        client: {
            captureConsole: true
        },
        expressServer: {
            serverPort: port, // different than karma's port
            extensions: [function (app, logger) {
                karmaRenderer(app, logger, {santaBase: 'http://localhost:' + port, debug: false});
            }
            ]
        },
        globals: {
            KARMA_RENDERER_PORT: port
        },
        singleRun: false,
        browserNoActivityTimeout: 40000
    });
};
