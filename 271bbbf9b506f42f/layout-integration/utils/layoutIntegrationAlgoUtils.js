/*eslint strict:['error', 'global']*/
'use strict';

//NOTE: This file CANNOT be required as a standalone file- it must only be required as part of the webpack bundle buildAPI, as it depends on webpack resolving the dependencies from santa
/** deps from packages, resolved by webpack config resolve.root */
const utils = require('utils/utils');
const experiment = require('experiment');
const layoutAlgorithm = require('layout/util/layoutAlgorithm');
/** end of deps from packages*/

const _ = require('lodash');
const VIEW_MODES = utils.constants.VIEW_MODES; //MOBILE, DESKTOP

const COMP_WITH_MARGIN_STYLE_ID = 'compWithMargin-style';

// This skin has a margin of 10px, which will be added when making anchors
// This is so we can test 'nonAnchorableHeight' in skins for backwards compatibility
const mockTheme = {
    [COMP_WITH_MARGIN_STYLE_ID]: {
        skin: 'wysiwyg.viewer.skins.area.BubbleAreaLeft'
    }
};

const DEFAULT_VIEWER_EXPERIMENTS = {
    viewerGeneratedAnchors: 1,
    removeJsonAnchors: 1
};

const getExperimentConfigurations = (viewerExperiments) => {
    return _.assign({}, DEFAULT_VIEWER_EXPERIMENTS, viewerExperiments || {});
};

const createExperimentAPI = (santaExperimentAPI) => {
    return _.assign({}, santaExperimentAPI, {
        setExperiments: (experimentsConfig) => santaExperimentAPI.setExperiments(getExperimentConfigurations(experimentsConfig))
    });
};
var experimentAPI = createExperimentAPI(experiment);


const createOriginalValuesMap = (structure) => {
    var originalValuesMap = utils.originalValuesMapGenerator.createOriginalValuesMap(structure, mockTheme, false);

    return {
        [structure.id]: {
            [VIEW_MODES.DESKTOP]: originalValuesMap
        }
    };
};
const createAnchorsMap = (structure) => {
    var anchorsMap = utils.layoutAnchors.createPageAnchors(structure, mockTheme, false);

    return {
        [structure.id]: {
            [VIEW_MODES.DESKTOP]: anchorsMap
        }
    };
};

const getLayoutFromMeasure = (measureMap, componentId) => {
    return {
        x: measureMap.left[componentId],
        y: measureMap.top[componentId],
        width: measureMap.width[componentId],
        height: measureMap.height[componentId]
    };
};

const updateLockedComponentInStructure = (structure, measureMap, lockedComponents) => {

    function updateLockedComponent(comp){
        if (lockedComponents[comp.id]){
            _.assign(comp.layout, getLayoutFromMeasure(measureMap, comp.id));
        }

        _.forEach(comp.children, child => updateLockedComponent(child));
    }

    updateLockedComponent(structure);
};


const enforceStructure = (structure, measureMap, viewerExperiments, lockedComponents, repeat) => {
    experimentAPI.setExperiments(viewerExperiments);

    var repeatTimes = repeat || 1;

    var anchorsMap = createAnchorsMap(structure);
    var originalValuesMap = createOriginalValuesMap(structure);
    var isMobileView = false;
    var skipEnforceAnchors = false;
    var lockedComponentsMap = lockedComponents || {};
    var structureAfterEditing = _.cloneDeep(structure);
    updateLockedComponentInStructure(structureAfterEditing, measureMap, lockedComponentsMap);

    for (var i = 0; i < repeatTimes; i++){
        layoutAlgorithm.enforceStructure(structureAfterEditing, measureMap, anchorsMap, originalValuesMap, isMobileView, skipEnforceAnchors, lockedComponentsMap);
    }
};

const enforceStructureWithGivenAnchorsMap = (structure, measureMap, viewerExperiments, lockedComponents, anchorsMap, originalValuesMap) => {
    experimentAPI.setExperiments(viewerExperiments);

    var isMobileView = false;
    var skipEnforceAnchors = false;
    var lockedComponentsMap = lockedComponents || {};
    var structureAfterEditing = _.cloneDeep(structure);
    updateLockedComponentInStructure(structureAfterEditing, measureMap, lockedComponentsMap);

    layoutAlgorithm.enforceStructure(structureAfterEditing, measureMap, anchorsMap, originalValuesMap, isMobileView, skipEnforceAnchors, lockedComponentsMap);
};

module.exports = {
    createAnchorsMap,
    createOriginalValuesMap,
    enforceStructure,
    enforceStructureWithGivenAnchorsMap
};
