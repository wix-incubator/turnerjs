/*eslint no-console: 0*/
'use strict'

const SUITE_START = '##teamcity[testSuiteStarted name=\'%s\']'
const SUITE_END   = '##teamcity[testSuiteFinished name=\'%s\']'

const TEST_START  = '##teamcity[testStarted name=\'%s\']'
const TEST_FAILED = '##teamcity[testFailed name=\'%s\' message=\'FAILED\' details=\'%s\']'
const TEST_END    = '##teamcity[testFinished name=\'%s\' duration=\'%s\']'


function logSuiteStart(name) {
    console.log(SUITE_START, name)
}
function logSuiteEnd(name) {
    console.log(SUITE_END, name)
}

function logTestStart(name) {
    console.log(TEST_START, name)
}
function logTestResult(specResult) {
    if (specResult.passed) {
        console.log(TEST_END, specResult.name)
    } else {
        console.log(TEST_FAILED, specResult.name, specResult.messages)
    }
}
function logSpecResult(spec) {
    logTestStart(spec.desc)
    logTestResult(spec)
}

function logJasmineReporterDidNotLoad() {
    console.log('Jasmine reporter did not load')
}

module.exports = {
    logJasmineReporterDidNotLoad,
    logSpecResult,
    logSuiteStart,
    logSuiteEnd,
    log: console.log
}
