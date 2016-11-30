define(['lodash',
    'layout/util/dataPreparationsForAnchors',
    'experiment'], function
    (_,
     dataPreparationsForAnchors,
     experiment) {
    'use strict';
    var ANCHOR_TOP_TOP = 'TOP_TOP';
    var ANCHOR_BOTTOM_TOP = 'BOTTOM_TOP';
    var ANCHOR_BOTTOM_BOTTOM = 'BOTTOM_BOTTOM';
    var ANCHOR_BOTTOM_PARENT = 'BOTTOM_PARENT';
    var DEFAULT_MARGIN = 10;

    var PAGE_TYPES = ['Page', 'Document'];

    var HARD_WIRED_COMPS = {
        'SITE_FOOTER': true,
        'SITE_HEADER': true,
        'SITE_PAGES': true,
        'PAGES_CONTAINER': true,
        'masterPage': true,
        'SITE_BACKGROUND': true
    };

    var anchorPushers = {};

    function getIsChangedAndMarkDirty(pushedId, currentValue, newValue, dataMap) {
        if (currentValue !== newValue) {
            dataMap.dirty[pushedId] = true;
        }

        if (dataMap.dirty[pushedId]) {
            dataMap.changedCompsMap[pushedId] = dataMap.flat[pushedId];
        }

        return dataMap.dirty[pushedId];
    }

    /**
     *
     * @param newValue
     * @param pusherId
     * @param maxValuesMap
     * @param  anchor
     * @returns {number}
     */
    function getMaxValueByAnchors(newValue, pusherId, maxValuesMap, anchor) {
        var pushedMap = maxValuesMap[anchor.targetComponent];
        var pusherMap = maxValuesMap[pusherId];
        //in 2 way anchors, if the value is enforced by a other anchor then it should be enforced on
        if (anchor.notEnforcingMinValue && !_.isEmpty(pusherMap)) {
            anchor.notEnforcingMinValue = false;
        }
        pushedMap[pusherId] = newValue;
        var maxValue = Math.max.apply(null, _.values(pushedMap));
        if (anchor.notEnforcingMinValue) {
            delete pushedMap[pusherId];
        }
        return maxValue;
    }

    function updateValueForFirstLockedAnchor(anchor, dataMap, maxValuesMap, pusherId, newValue) {
        var pushedId = anchor.targetComponent;
        var valueForFirstLockedAnchor = dataMap.valueForFirstLockedAnchor[pushedId];
        if (!valueForFirstLockedAnchor) {
            return;
        }

        //we can delete the whole map because all the stored values come from non locked anchors
        if (anchor.locked || ((dataMap.__isPopup || experiment.isOpen('removeJsonAnchors')) && newValue === null)) { // newValue is null in case of top top anchors which are always treated as locked,
            if (valueForFirstLockedAnchor.pusherId) {                   //we fix this bug only for progression for now - popup pages
                maxValuesMap[pushedId] = {};
                //we set here only one pusher because we don't need all the rest anymore, only the max between them
                maxValuesMap[pushedId][valueForFirstLockedAnchor.pusherId] = valueForFirstLockedAnchor.value;
            }
            delete dataMap.valueForFirstLockedAnchor[pushedId];
        } else {
            valueForFirstLockedAnchor.pusherId = pusherId;
            valueForFirstLockedAnchor.value = Math.max(newValue, valueForFirstLockedAnchor.value);
        }
    }

    function getDecimalPart(number) {
        return (number % 1);
    }

    /*
     * Makes sure not to push or pull by half a pixel. We couldn't find a better name for this function.
     * If currentPushedTop is 100 and newPushedTop is 94.5, we want to pull the top to 95 (closer to current)
     * If currentPushedTop is 100 and newPushedTop is 105.5, we want to keep the top at 105 (closer to current)
     */
    function makeSureNotPushingWithHalf(currentPushedTop, newPushedTop) {
        var pushedTopDiff = newPushedTop - currentPushedTop;
        newPushedTop -= getDecimalPart(pushedTopDiff);

        return newPushedTop;
    }

    function isCompExistsInDataMap(dataMap, compId) {
        return _.has(dataMap.currentHeight, compId);
    }

    anchorPushers[ANCHOR_TOP_TOP] = function (pusherId, anchor, dataMap) {
        var pushedId = anchor.targetComponent;
        if (!isCompExistsInDataMap(dataMap, pushedId) || !isCompExistsInDataMap(dataMap, pusherId)) {
            return false;
        }
        if (_.has(dataMap.locked, pushedId)) {
            return false;
        }
        var currentPushedTop = dataMap.currentY[pushedId];
        var newPushedTop = dataMap.currentY[pusherId] + anchor.distance;
//TODO: this should move to the data fixer when it seems safe - top top are always locked
        updateValueForFirstLockedAnchor(anchor, dataMap, dataMap.toTopAnchorsY, pusherId, null);
        newPushedTop = getMaxValueByAnchors(newPushedTop, pusherId, dataMap.toTopAnchorsY, anchor);
        newPushedTop = makeSureNotPushingWithHalf(currentPushedTop, newPushedTop);
        dataMap.currentY[pushedId] = newPushedTop;

        return getIsChangedAndMarkDirty(pushedId, currentPushedTop, newPushedTop, dataMap);
    };

    anchorPushers[ANCHOR_BOTTOM_TOP] = function (pusherId, anchor, dataMap) {
        var pushedId = anchor.targetComponent;
        if (!isCompExistsInDataMap(dataMap, pushedId) || !isCompExistsInDataMap(dataMap, pusherId)) {
            return false;
        }
        if (_.has(dataMap.locked, pushedId)) {
            return false;
        }

        var currentPushedTop = dataMap.currentY[pushedId];
        var newPushedTop = dataMap.currentHeight[pusherId] + dataMap.currentY[pusherId];

        var pushedTopWhenHaveLockedAnchor = null;

        if (anchor.locked) {
            newPushedTop += anchor.distance;
        } else {
            pushedTopWhenHaveLockedAnchor = newPushedTop + DEFAULT_MARGIN;
            newPushedTop = dataMap.valueForFirstLockedAnchor[pushedId] ?
                Math.max(newPushedTop + DEFAULT_MARGIN, anchor.originalValue) :
                pushedTopWhenHaveLockedAnchor;
        }
        newPushedTop = Math.max(newPushedTop, dataMap.currentY[pusherId] + dataMap.currentHeight[pusherId] / 2);
//TODO: this should move to the data fixer when it seems safe
        updateValueForFirstLockedAnchor(anchor, dataMap, dataMap.toTopAnchorsY, pusherId, pushedTopWhenHaveLockedAnchor);
        newPushedTop = getMaxValueByAnchors(newPushedTop, pusherId, dataMap.toTopAnchorsY, anchor);
        newPushedTop = makeSureNotPushingWithHalf(currentPushedTop, newPushedTop);
        dataMap.currentY[pushedId] = newPushedTop;

        return getIsChangedAndMarkDirty(pushedId, currentPushedTop, newPushedTop, dataMap);
    };

    function addAnchorDistanceToHeight(anchor, heightByPusher, pushedId, dataMap) {
        var newPushedHeight;

        if (dataMap.shrinkableContainer[pushedId]) {
            newPushedHeight = heightByPusher;
        } else if (anchor.locked) {
            newPushedHeight = heightByPusher + anchor.distance;
        } else {
            newPushedHeight = heightByPusher + DEFAULT_MARGIN;

            if (!dataMap.ignoreOriginalValue[pushedId]) {
                newPushedHeight = Math.max(newPushedHeight, anchor.originalValue);
            }
        }

        return newPushedHeight;
    }

    function enforceMinHeight(newHeight, pushedId, anchor, dataMap) {
        var enforcedHeight = newHeight;
        if (_.isNumber(dataMap.minHeight[pushedId]) && newHeight < dataMap.minHeight[pushedId]) {
            enforcedHeight = dataMap.minHeight[pushedId];
            //relevant only for 2 way anchors, if comp A shrinked and trying to shrink comp B but can't because of the minHeight
            // comp A should grow back (this will happen by enforcing the back anchor). and this value should be enforced for comp A as well
            if (anchor.notEnforcingMinValue) {
                anchor.notEnforcingMinValue = false;
                dataMap.dirty[pushedId] = true;
                dataMap.changedCompsMap[pushedId] = dataMap.flat[pushedId];
            }
        }
        return enforcedHeight;
    }


    anchorPushers[ANCHOR_BOTTOM_PARENT] = function (pusherId, anchor, dataMap) {
        var pushedId = anchor.targetComponent;
        if (!isCompExistsInDataMap(dataMap, pushedId) || !isCompExistsInDataMap(dataMap, pusherId)) {
            return false;
        }
        if (_.has(dataMap.locked, pushedId)) {
            return false;
        }

        if (dataMap.flat[pushedId].layout && dataMap.flat[pushedId].layout.rotationInDegrees) {
            return false;
        }
        var currentPushedHeight = dataMap.currentHeight[pushedId];
        var currentPusherBottom = dataMap.currentHeight[pusherId] + dataMap.currentY[pusherId];
        var margin = dataMap.containerHeightMargin[pushedId] || 0;

        var newPushedHeight = addAnchorDistanceToHeight(anchor, currentPusherBottom + margin, pushedId, dataMap);

        newPushedHeight = enforceMinHeight(newPushedHeight, pushedId, anchor, dataMap);
        newPushedHeight = getMaxValueByAnchors(newPushedHeight, pusherId, dataMap.toBottomAnchorsHeight, anchor);

        dataMap.currentHeight[pushedId] = newPushedHeight;

        return getIsChangedAndMarkDirty(pushedId, currentPushedHeight, newPushedHeight, dataMap);
    };

    anchorPushers[ANCHOR_BOTTOM_BOTTOM] = function (pusherId, anchor, dataMap) {
        if (dataMap.ignoreBottomBottom) {
            return false;
        }
        var pushedId = anchor.targetComponent;
        if (!isCompExistsInDataMap(dataMap, pushedId) || !isCompExistsInDataMap(dataMap, pusherId)) {
            return false;
        }
        if (_.has(dataMap.locked, pushedId)) {
            return false;
        }

        if (dataMap.flat[pushedId].layout && dataMap.flat[pushedId].layout.rotationInDegrees) {
            return false;
        }
        var currentPushedHeight = dataMap.currentHeight[pushedId];
        var currentPusherBottom = dataMap.currentHeight[pusherId] + dataMap.currentY[pusherId];
        var currentPushedTop = dataMap.currentY[pushedId];

        var newPushedHeight = addAnchorDistanceToHeight(anchor, currentPusherBottom - currentPushedTop, pushedId, dataMap);

        newPushedHeight = enforceMinHeight(newPushedHeight, pushedId, anchor, dataMap);
        newPushedHeight = getMaxValueByAnchors(newPushedHeight, pusherId, dataMap.toBottomAnchorsHeight, anchor);

        dataMap.currentHeight[pushedId] = newPushedHeight;

        return getIsChangedAndMarkDirty(pushedId, currentPushedHeight, newPushedHeight, dataMap);
    };

    function getCompAnchors(compId, rootAnchorsMap, dataMap) {
        if (compId === 'masterPage') {
            return [];
        }
        if (_.has(dataMap.injectedAnchors, compId)) {
            return dataMap.injectedAnchors[compId];
        }
        var pusher = dataMap.flat[compId];
        var jsonAnchors = pusher.layout ? pusher.layout.anchors : [];

        if (window.publicModel && rootAnchorsMap && experiment.isOpen('viewerGeneratedAnchors')) {
            return rootAnchorsMap[compId] || [];
        }

        var dynamicAnchors = rootAnchorsMap && rootAnchorsMap[compId];

        return jsonAnchors || dynamicAnchors || [];
    }

    function enforceAnchorsOfMarkedDirty(ySortedIds, compIndexes, dataMap, rootAnchorsMap, skipEnforceAnchors, structureId) {
        var hasAnchorsToStructure = false;

        function enforceAnchorOfPusher(pusherId) {
            var anchors = getCompAnchors(pusherId, rootAnchorsMap, dataMap);
            var lowestChanged = Number.MAX_VALUE;
            if (dataMap.dirty[pusherId] && (!skipEnforceAnchors || HARD_WIRED_COMPS[pusherId])) { // BOTTOM pushing
                _.forEach(anchors, function (anchor) {
                    if (anchorPushers[anchor.type] && dataMap.flat[anchor.targetComponent] && (!skipEnforceAnchors || HARD_WIRED_COMPS[anchor.targetComponent])) {
                        if (anchor.targetComponent === structureId) {
                            hasAnchorsToStructure = true;
                        }
                        var anchorChanged = anchorPushers[anchor.type](pusherId, anchor, dataMap) ? compIndexes[anchor.targetComponent] : Number.MAX_VALUE;
                        lowestChanged = Math.min(anchorChanged, lowestChanged);
                    }
                });
            }
            dataMap.dirty[pusherId] = false;
            return lowestChanged;
        }

        var numOfComps = ySortedIds.length;
        var index = 0;
        while (index < numOfComps) {
            var lowestChangedIndex = enforceAnchorOfPusher(ySortedIds[index]);
            index = Math.min(index + 1, lowestChangedIndex);
        }
        return hasAnchorsToStructure;
    }

    /**
     *  @typedef {layout.structureDataMap} layout.anchorsDataMap
     *  @property {Object.<string, boolean>} dirty
     *  @property {Object.<string, number>} toTopAnchorsY
     *  @property {Object.<string, number>} toBottomAnchorsHeight
     *
     */

    /**
     * this method changes the measureMap height and top according to anchors
     * @param {data.compStructure} structure
     * @param {layout.measureMap} measureMap
     * @param {layout.measureMap} ignoreBottomBottom - boolean, if true do not enforce anchors with type BOTTOM_BOTTOM
     * @returns {Object.<string, Object>} the structure flat map

     */
    function enforceAnchors(structure, measureMap, rootAnchorsMap, isMobileView, skipEnforceAnchors, lockedCompsMap, compsToEnforce, ignoreBottomBottom) {
        var structureDataAndSort = dataPreparationsForAnchors.getDataForAnchorsAndSort(structure, measureMap, isMobileView);
        /** @type layout.anchorsDataMap */
        var dataMap = structureDataAndSort.structureData;
        var ySortedIds = structureDataAndSort.sortedIds;
        var compIndexes = _.invert(ySortedIds);

        dataMap.dirty = {};
        dataMap.toTopAnchorsY = {};
        dataMap.toBottomAnchorsHeight = {};
        dataMap.locked = lockedCompsMap;
        dataMap.changedCompsMap = dataMap.flat;
        dataMap.ignoreBottomBottom = !!ignoreBottomBottom;

        _.forEach(dataMap.flat, function (compStructure, id) {
            dataMap.dirty[id] = true;
            dataMap.toTopAnchorsY[id] = {};
            dataMap.toBottomAnchorsHeight[id] = {};
        });

        if (compsToEnforce) {
            dataMap.dirty = _.clone(compsToEnforce);
            dataMap.changedCompsMap = _.pick(dataMap.flat, _.keys(compsToEnforce));
        }

        var hasAnchorsToStructure = enforceAnchorsOfMarkedDirty(ySortedIds, compIndexes, dataMap, rootAnchorsMap, skipEnforceAnchors, structure.id);

        dataPreparationsForAnchors.fixMeasureMap(measureMap, dataMap);

        if ((experiment.isOpen('sv_partialReLayout') || !hasAnchorsToStructure) && _.includes(PAGE_TYPES, structure.type)) {
            measureMap.height[structure.id] = dataPreparationsForAnchors.maxMeasureMapHeight(measureMap, 0, isMobileView, structure);
            dataMap.changedCompsMap[structure.id] = dataMap.flat[structure.id];
        }

        return dataMap.changedCompsMap;
    }


    return {
        enforceAnchors: enforceAnchors,
        HARD_WIRED_COMPS: HARD_WIRED_COMPS
    };
});
