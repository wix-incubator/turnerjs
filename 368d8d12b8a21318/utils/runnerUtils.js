var _ = require('underscore');
var url = require('url');
var teamCityLogger = require('../utils/teamCityLogger');

var fetchProgress = function (driver) {
    return driver.executeScript('return window.reporter');
};

var getSpecResult = function (spec) {
    var result = {
        spec: spec.description
    };
    result.passed = spec.status !== "failed";
    return result;
};

var logJasmineReporterDidNotLoad = function () {
    console.log('Jasmine reporter did not load');
};

var logLoginFailed = function () {
    console.log('Login to wix.com failed');
};

var isJasmineReporterLoaded = function (driver) {
    return driver.isElementPresent(by.css('.jasmine_html-reporter'));
};
var pollingOnProgress = function (progress, cb) {
    progress.then(function (report) {
        if(report.finished) {
            browser.driver.executeScript('return window.reporter.specs()').then(function (specs) {
                cb(createResults(specs));
            });
        } else {
            pollingOnProgress(fetchProgress(browser.driver), cb);
        }
    }, function onError(err) {
        console.log('Failed while fetching tests progress', err);
    });
};


var createResults = function (specs) {
    var results = [];
    _.each(specs, function (spec) {
        teamCityLogger.logJasmine2SpecResult(spec);
        results.push(getSpecResult(spec));
    });
    return results;
};

var isLoginSuccess = function (driver) {
    return driver.isElementPresent(by.tagName("userName"));
};

var getSpecUrl = function(testConfig){
    var artifact = browser.params.artifact;
    if (artifact === 'santa') {
        var santaUrl= '&ReactSource=' + browser.params.ReactSource;
        var pageId = testConfig.pageId || '';
        return testConfig.siteUrl + '?jasmineSpec=tpaIntegration:/runners/' + testConfig.runner + '&isTpaIntegration=true&debug=tpaIntegration' + santaUrl + '#!' + pageId;
    } else if (artifact === 'santaEditor'){
        return urlFormat(testConfig.urlParams);
    }
};

var urlFormat = function(config) {
    var cfg = {
        protocol: 'http',
        host: 'editor.wix.com'
    };

    var defaultQueryParams = {
        petri_ovr: 'specs.DisableNewRelicScriptsSantaEditor:true',
        isTpaIntegration: true,
        forceEditorVersion: 'new',
        leavePagePopUp: false
    };

    var params = _.pick(browser.params, ['ReactSource', 'EditorSource', 'debug']);

    var defaultQuery = _.extend(defaultQueryParams, params);
    console.log(defaultQuery);
    _.extend(config.query, defaultQuery);
    _.extend(cfg, config);
    var formattedUrl = url.format(cfg);
    console.log(formattedUrl);
    return formattedUrl;
};

var loginToWix = function(browser, callback){
    var loginUrl = 'http://users.wix.com/wix-users/auth/login?email=adiela@wix.com&password=tpa84Super91Us';
    browser.get(loginUrl);
    browser.wait(function () {
        return isLoginSuccess(browser.driver);
    }).then(function () {
        callback();
    }, logLoginFailed);
};

module.exports = {
    fetchProgress: fetchProgress,
    logJasmineReporterDidNotLoad: logJasmineReporterDidNotLoad,
    isJasmineReporterLoaded: isJasmineReporterLoaded,
    pollingOnProgress: pollingOnProgress,
    logLoginFailed: logLoginFailed,
    isLoginSuccess: isLoginSuccess,
    getSpecUrl: getSpecUrl,
    loginToWix: loginToWix
};
