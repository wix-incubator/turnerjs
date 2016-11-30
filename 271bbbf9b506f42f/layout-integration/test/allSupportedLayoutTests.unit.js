/*eslint strict:['error', 'global']*/
'use strict';

// NOTE:
// This file runs all the layout tests for verbs which we have completed and support.
// There are also tests which define behaviour which has not yet been implemented, and therefore fail, so these will not run as part of the build.
// The tests here should only fail if someone breaks a verb which has already been implemented.

const integrationAPI = require('../integrationAPI'),
    _ = require('lodash'),
    path = require('path');

const expectedTestUrl = (describeId, testId) => `See the failing test at: http://localhost:8080/view/${describeId}/${testId}`;

const readMe = 'You can read instructions for how to run the layout framework at https://github.com/wix-private/santa-layout-tests';

let runTest,
    allDescribes = _.mapValues(integrationAPI.testsDataAPI.getAllTestsSync(), describeData => {
        describeData.tests = _.omit(describeData.tests, _.matches({runInBuild: false})); // in lodash 4, this will be omitBy
        return describeData;
    });

const distPath = path.join(__dirname, '../dist'),
    fileName = 'santaLayoutAPI.js';

describe('Layout tests', ()=>{
    beforeAll(done => integrationAPI.build(distPath, fileName, () => {
        runTest = require('../dist/santaLayoutAPI').runTest;
        done();
    }));

    _.forEach(allDescribes, (testDescribe, describeId) => {

        describe(testDescribe.name, () => {
            _.forEach(testDescribe.tests, (test, testId) => {
                if (_.isEmpty(test.testData)) {
                    return;
                }

                it(test.name, () => {
                    let didPass = runTest(test, testDescribe.experiments);
                    if (!didPass) {
                        expect(expectedTestUrl(describeId, testId)).toBe(readMe);
                    }
                });
            });
        });
    });
});
