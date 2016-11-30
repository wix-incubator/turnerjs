/*eslint no-unused-vars:0*/
define(['lodash', 'tpaIntegration/bootstrap/utils'], function (_, testsUtils) {
    'use strict';

    var siteAPI, tpaPostMessageAspect, siteAspectsRegistry;

    function init(core) {
        siteAspectsRegistry = core.siteAspectsRegistry;
        var TPADriverAspect = function (aspectSiteAPI) {
            siteAPI = aspectSiteAPI;
        };
        siteAspectsRegistry.registerSiteAspect('tpaDriverAspect', TPADriverAspect);
    }

    var endsWith = function (string, suffix) {
        return string.indexOf(suffix, string.length - suffix.length) !== -1;
    };

    /*global jasmineRequire*/
    var run = function (global, runner) {
        var santaBase = global.siteModel.santaBase;

        if (!endsWith(santaBase, '/')) {
            santaBase += '/';
        }
        var base  = 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/runners/';
        testsUtils.loadCss(base + 'tpaIntegration/src/jasmine.css');
        //testsUtils.loadCss(santaBase + 'packages/tpaIntegration/src/jasmine.css');
        require([runner], function () {
            testsUtils.boot();

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
                testsUtils.playBall();
            };

            setTimeout(startTests, 2000);
        });
    };

    var getSiteAPI = function () {
        return siteAPI;
    };

    var getTpaPostMessageAspect = function () {
        return siteAPI.getSiteAspect('tpaPostMessageAspect');
    };

    return {
        init: init,
        run: run,
        getSiteAPI: getSiteAPI,
        getTpaPostMessageAspect: getTpaPostMessageAspect
    };
});
