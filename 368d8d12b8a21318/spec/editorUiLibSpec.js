var _ = require('underscore');
var url = require('url');
var runnerUtils = require('../utils/runnerUtils');
var teamCityLogger = require('../utils/teamCityLogger');
var IC = require('../utils/imageCompare');

var isJasmineReporterLoaded = function (driver) {
    return driver.isElementPresent(by.css('.jasmine_html-reporter'));
};

var logJasmineReporterDidNotLoad = function () {
    console.log('Jasmine reporter did not load');
};

var fetchProgress = function (driver) {
    var commands = [
        'jasmineReporter: window.reporter',
        'imageCompare: window.imageCompare && window.imageCompare.shouldITakeSnapshot()'
    ];

    if (IC.progress.status === 'done') {
        commands.push('imageCompareEnded: window.imageCompare && window.imageCompare.imageCompareEnded('+ JSON.stringify(IC.progress.lastCompareData) +')');
        IC.progress.status = 'standby'
    }
    
    return driver.executeScript('return {' +
        commands.join(',') +
    '}');
};

var pollingOnProgress = function (progress, cb) {
    if (!progress) {
        pollingOnProgress(fetchProgress(browser.driver), cb);
    } else {
        progress.then(function (report) {
            if(_.isObject(report.imageCompare)) {
                IC.takeSnapshotIfNeeded(report.imageCompare);
            }
            if(report.jasmineReporter.finished) {
                browser.driver.executeScript('return window.reporter.specs()').then(function (specs) {
                    cb(createResults(specs));
                });
            } else {
                pollingOnProgress(fetchProgress(browser.driver), cb);
            }
        }, function onError(err) {
            console.log('Failed while fetching tests progress', err);
        });
    }
};

var getSpecResult = function (spec) {
    if (spec.status === "failed") {
        return {
            passed: false,
            spec: spec.description
        };
    } else {
        return {
            passed: true,
            spec: spec.description
        };
    }
};

var createResults = function (specs) {
    var results = [];
    _.each(specs, function (spec) {
        teamCityLogger.logJasmine2SpecResult(spec);
        results.push(getSpecResult(spec));
    });
    return results;
};

//TODO - take params from local.config etc...
var defaultQueryParams = {
    petri_ovr: 'specs.DisableNewRelicScriptsSantaEditor:true',
    isTpaIntegration: true,
    forceEditorVersion: 'new',
    leavePagePopUp: false
};

var urlFormat = function (config) {
    var cfg = {
        protocol: 'http',
        host: 'editor.wix.com'
    };
    var defaultQuery = _.extend(defaultQueryParams, browser.params);
    console.log(defaultQuery);
    _.extend(config.query, defaultQuery);
    _.extend(cfg, config);
    var formattedUrl = url.format(cfg);
    console.log(formattedUrl);
    return formattedUrl;
};

var pollResults = function (runnerName, testUrlParams, retries) {
    browser.driver.get(urlFormat(testUrlParams));
    browser.driver.wait(isJasmineReporterLoaded, 600 * 10000, 'Editor did not load on time!').then(function () {
        pollingOnProgress(null, function (result) {
            var failedSpecs = _.filter(result, function (spec) {
                return !spec.passed;
            });

            if (_.size(failedSpecs) > 0 && retries > 0) {
                console.log('-------------retrying ' +runnerName+ '---------------');
                pollResults(runnerName, testUrlParams, --retries);
            } else {
                _.each(result, function (spec) {
                    expect(spec.passed).toBeTruthy();
                });
                var deferred = protractor.promise.defer();
                deferred.fulfill(_.size(failedSpecs) === 0);
                teamCityLogger.logSuiteEnd(runnerName);
            }
        });
    }, logJasmineReporterDidNotLoad);
};

describe('Santa editor TPA integration runners', function () {

    var executeRunner = function(runner, urlParams, retries) {
        pollResults(runner, urlParams, retries || 1);
    };

    beforeAll(function (done) {
        runnerUtils.loginToWix(browser, done);
    });

    beforeEach(function () {
        var body = $('body');
        browser.actions().mouseMove(body, {x: 0, y: 0}).perform();
        var width = 900;
        var height = 600;
        browser.driver.manage().window().setSize(width, height);
    });

    it('should run editorUILibRunner', function () {

        var runner = 'editorUILibRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/45e55d0f-4271-4bf3-bbdc-09d855a51d13',
            query: {
                metaSiteId: 'ce61c493-9b31-4b36-92d6-efb26adc3355',
                editorSessionId: '05C79F6F-F502-45AD-BE21-507F5BC14B06',
                jasmineSpec: 'tpaIntegrationEditor:/runners/editorUILibRunner'
            }
        };

        executeRunner(runner, urlParams);
    });
});
