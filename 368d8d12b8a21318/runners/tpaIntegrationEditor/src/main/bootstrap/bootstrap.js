define(['lodash', 'tpaIntegrationEditor/bootstrap/testsUtils'],
    function (_, testsUtils) {

    'use strict';
    /*global jasmineRequire*/
    var run = function (global, runner) {
        var base  = 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/runners/';
        testsUtils.loadCss(base + 'tpaIntegrationEditor/src/jasmine.css');
        require([runner], function () {
            var startTests = function () {
                var jasmine = window.jasmine;
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
                jasmineRequire.html(jasmine);
                var jasmineEnv = jasmine.getEnv();
                var reporter = new jasmine.JsApiReporter({
                    timer: new jasmine.Timer()
                });
                jasmineEnv.addReporter(reporter);
                global.reporter = reporter;
                window.onload();
            };

            setTimeout(startTests, 2000);
        });
    };

    return {
        run: run
    };
});
