/*eslint strict:['error', 'global']*/
'use strict';

const _ = require('lodash');
//NOTE: This file CANNOT be required as a standalone file- it must only be required as part of the webpack bundle buildAPI, as it depends on webpack resolving the dependencies from santa in layoutIntegrationAlgoUtils:
const enforceStructure = require('./layoutIntegrationAlgoUtils').enforceStructure;


function pickPositionAndSize(measureMap) {
    delete measureMap.height.page;
    return _.pick(measureMap, ['top', 'left', 'width', 'height']);
}

const enforceStructureTwice = (structure, measureMap, viewerExperiments, lockedComponents) => {
    return enforceStructure(structure, measureMap, viewerExperiments, lockedComponents, 2);
};

const runTest = (test, viewerExperiments) => {
    var measureMap = _.cloneDeep(test.testData.measureMap);

    enforceStructureTwice(test.testData.structure, measureMap, viewerExperiments, test.testData.lockedComponents);

    let actualMeasuredDimensions = pickPositionAndSize(measureMap),
        expectedMeasuredDimensions = pickPositionAndSize(test.testData.expectedMeasureMap);

    return _.isEqual(actualMeasuredDimensions, expectedMeasuredDimensions);
};

module.exports = runTest;
