/*globals browser, describe, beforeAll, it, expect, by*/
'use strict'

const _ = require('lodash')
const specUtils = require('./specUtils')
const logger = require('./specLogger')
const constants = require('./specConstants')

describe('Platform integration runners', () => {
    beforeAll((done) => {
        loginToWix(done)
    })

    const runnerNames = specUtils.getRunnerNames()
    _.each(runnerNames, (runnerName) => {
        it(`should run ${runnerName}`, (done) => {
            startSuiteRunner(runnerName, done)
        })
    })
})

function startSuiteRunner(runnerName, done) {
    logger.logSuiteStart(runnerName)

    const urlParams = {
        pathname: constants.pathname,
        query: {
            metaSiteId: constants.metaSiteId,
            editorSessionId: constants.editorSessionId,
            jasmineSpec: constants.jasmineSpec + runnerName
        }
    }

    browser.driver
        .get(specUtils.createTestUrl(urlParams))
        .then(() => waitForJasmineReporter())
        .then(() => {}, logger.logJasmineReporterDidNotLoad)
        .then(() => waitForTestToFinish())
        .then(() => getTestReport())
        .then((res) => {checkTestResults(res)})
        .then(() => {logger.logSuiteEnd(runnerName)})
        .then(done, done.fail)
}

function loginToWix(callback) {
    browser.get(constants.loginUrl);
    browser.wait(() => {
        return isLoginSuccess(browser.driver);
    }).then(() => {
        callback();
    }, () => { logger.log('Login to wix.com failed') });
}

function isLoginSuccess(driver) {
    return driver.isElementPresent(by.tagName('userName'));
}

function isJasmineReporterLoaded() {
    return browser.driver.isElementPresent(by.css('.jasmine_html-reporter'))
}
function waitForJasmineReporter() {
    return browser.driver.wait(isJasmineReporterLoaded, 60 * 10000, 'Editor did not load on time!')
}

function isReportFinished() {
    return browser.driver
        .executeScript('return window.reporter')
        .then((report) => report.finished)
}
function waitForTestToFinish() {
    return browser.driver.wait(isReportFinished, 600 * 1000, 'Failed to check if report has finished')
}
function getTestReport() {
    return browser.driver
        .executeScript('return window.reporter.specs()')
        .then((specs) => specUtils.formatResults(specs))
}
function checkTestResults(result) {
    _.each(result, (specResult) => {
        expect(specResult.passed).toBeTruthy();
        logger.log(specResult);
    });
}
