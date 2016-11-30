var TEST_IGNORED  = '##teamcity[testIgnored name=\'%s\']';
var SUITE_START   = '##teamcity[testSuiteStarted name=\'%s\']';
var SUITE_END     = '##teamcity[testSuiteFinished name=\'%s\']';
var TEST_START    = '##teamcity[testStarted name=\'%s\']';
var TEST_FAILED   = '##teamcity[testFailed name=\'%s\' message=\'FAILED\' details=\'%s\']';
var TEST_END      = '##teamcity[testFinished name=\'%s\' duration=\'%s\']';

module.exports = {
    logJasmine2SpecResult: function (specResult) {
        console.log(TEST_START, specResult.fullName);
        if (specResult.status === 'passed') {
            console.log(TEST_END, specResult.fullName);
        } else {
            var message = '';
            if (specResult.failedExpectations && specResult.failedExpectations[0]) {
                message = specResult.failedExpectations[0].message;
            }
            console.log(TEST_FAILED, specResult.fullName, message);
        }
    },

    logSpecResult: function (specResult) {
        var info = specResult[2];
        var template = TEST_FAILED;

        if (info.passed) {
            if (process.env.TEAMCITY_VERSION) {
                console.log(TEST_START, info.suite + ' ' + info.description);
            }
            template = TEST_END;
        } else if (info.skipped) {
            template = TEST_IGNORED;
        }

        if (process.env.TEAMCITY_VERSION) {
            console.log(template, info.suite + ' ' + info.description, info.durationMs);
        }
    },

    logSuiteStart: function (name) {
        console.log(SUITE_START, name);
    },

    logSuiteEnd: function (name) {
        console.log(SUITE_END, name);
    }
};
