var _ = require('underscore');
var testsConfig = require('../spec/suiteGenerator');
var runnerUtils = require('../utils/runnerUtils');
var teamCityLogger = require('../utils/teamCityLogger');

var runnersRetriesCount = {};

var runTests = function(){

    var testDescription = getTestToRun();

    describe(browser.params.artifact + ' TPA integration runners', function () {
        beforeAll(function(done){
            if (browser.params.artifact === 'santaEditor') {
                runnerUtils.loginToWix(browser, done);
            } else {
                done();
            }
        });

        testDescription.forEach(function(testConfig){
            var runner = testConfig.runner;
            runnersRetriesCount[runner] = 0;
            it('should run ' + runner, function () {
                teamCityLogger.logSuiteStart(runner);
                var specUrl = runnerUtils.getSpecUrl(testConfig);
                run(runner, specUrl);
            });
        });
    });
};

var getTestToRun = function(){
    if (browser.params.tests !== undefined && browser.params.tests.length > 0){
        var tests =  testsConfig.getTests(browser.params.tests, browser.params.suite);
        return tests;
    }
    else {
        return testsConfig.getSuite(browser.params.suite);
    }
};

var isSpecFailed = function(specResult){
    return _.some(specResult, function (spec) {
        return !spec.passed;
    });
};

var run = function (runnerName, testUrl) {
    runnersRetriesCount[runnerName]++;
    browser.driver.get(testUrl);
    browser.driver.wait(runnerUtils.isJasmineReporterLoaded.bind(this, browser.driver), 180 * 1000, browser.params.artifact + ' did not load on time!')
        .then(function () {
            var progress = runnerUtils.fetchProgress(browser.driver);
            runnerUtils.pollingOnProgress(progress, function (specResult) {
                if (isSpecFailed(specResult) && runnersRetriesCount[runnerName] <= browser.params.retries) {
                    run(runnerName, testUrl);
                    console.log('running test ' + runnerName + " again. It failed " + runnersRetriesCount[runnerName] + " times." )
                } else {
                    _.each(specResult, function (spec) {
                        expect(spec.passed).toBeTruthy();
                    });
                    teamCityLogger.logSuiteEnd(runnerName);
                }
            });
        }, function(err){
            runnerUtils.logJasmineReporterDidNotLoad();
            throw err;
        });
};

runTests();