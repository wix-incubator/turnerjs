// Karma configuration
module.exports = function (config) {
    'use strict';
    var serveLocalfiles = require('../server/main/dev/server').serveLocalfiles;
    var port = Number.parseInt(10000 + Math.random() * 1000, 10);

    config.set({
        basePath: '..',
        frameworks: ['jasmine', 'requirejs', 'expressServer'],
        files: [
            'node_modules/santa-utils/common/partials/urlUtils.js',
            {pattern: 'app/main-r.min.js', included: false},
            {pattern: 'app/rjs-config.js', included: true},
            {pattern: 'static/**', included: false},
            {pattern: 'packages/*/src/main/**/*.js', included: false},
            {pattern: 'js/vendor/**/*.js', included: false},
            {pattern: 'js/plugins/**/*.js', included: false},
            'beaker/test-main.js',
            {pattern: 'beaker/core/**', included: false},
            {pattern: 'beaker/sites/**', included: false},
            {pattern: 'beaker/vm.html', included: false},
            {pattern: 'beaker/**/*.it.js', included: false},
            {pattern: 'beaker/utils/**/*.js', included: false}
        ],

        preprocessors: {
            'beaker/test-main.js': ['global']
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
            extensions: [function (app) {
                serveLocalfiles(app);
            }
            ]
        },
        globals: {
            SERVER_PORT: port
        },
        browserNoActivityTimeout: 40000
    });
};
