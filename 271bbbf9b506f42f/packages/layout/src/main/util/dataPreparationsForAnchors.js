define([
    'lodash',
    'utils',
    'experiment'
], function (
    _,
    utils,
    experiment
) {
    "use strict";

    // NMO 11/5/14 12:19 PM - I am not sure, if we should keep this min value like our old viewer.
    var STRUCTURE_IDS_TO_IGNORE_MIN_HEIGHT = ['WIX_ADS'];
    var MIN_COMPONENT_HEIGHT_IN_PX = 5; // CLNT-1851: This was changed back to 0 due to a scrollbar that showed cause of 5px comp. min height.

    function getEmptyDataMap(){
        return {
            flat: {},
            sortingY: {},
            minHeight: {},
            shrinkableContainer: {},
            ignoreOriginalValue: {},
            noHeightChange: {},
            containerHeightMargin: {},
            currentHeight: {},
            currentY: {},
            heightDiff: {},
            topDiff: {},
            locked: {},
            valueForFirstLockedAnchor: {}
        };
    }

    function shouldIgnoreOriginalValue(structure) {
        return structure.type === "Document" ||
               structure.componentType === "wysiwyg.viewer.components.PagesContainer";
    }

    function addSpecialStuffToMap(structure, dataMap, measureMap){
        var compId = structure.id;
        if (structure.layout && structure.layout.rotationInDegrees){
            dataMap.noHeightChange[compId] = true;
        }
        if (measureMap.shrinkableContainer[compId]) {
            dataMap.shrinkableContainer[compId] = true;
        } else if (shouldIgnoreOriginalValue(structure, measureMap)) {
            dataMap.ignoreOriginalValue[compId] = true;
        }
    }

    function getRotatedHeight(height, width, angleInDegrees){
        return utils.boundingLayout.getBoundingHeight({height: height, width: width, rotationInDegrees: angleInDegrees});
    }

    function getRotatedY(y, height, width, angleInDegrees){
        return utils.boundingLayout.getBoundingY({y: y, height: height, width: width, rotationInDegrees: angleInDegrees});
    }

    function prepareHeightAndTop(structure, dataMap, measureMap){
        var compId = structure.id;
        var rotation = structure.layout ? structure.layout.rotationInDegrees : 0;
        var originalHeight = measureMap.height[compId];
        var originalTop;
        if (experiment.isOpen('sv_partialReLayout') || experiment.isOpen('layout_verbs_with_anchors')) {
            originalTop = measureMap.top[compId];
        } else {
            originalTop = (measureMap.top && measureMap.top[compId] !== undefined) ? measureMap.top[compId] : (structure.layout && structure.layout.y) || 0;
        }

        dataMap.currentHeight[structure.id] = rotation ? getRotatedHeight(originalHeight, measureMap.width[compId], rotation) : originalHeight;
        dataMap.heightDiff[compId] = dataMap.currentHeight[structure.id] - originalHeight;
        dataMap.currentY[compId] = rotation ? getRotatedY(originalTop, originalHeight, measureMap.width[compId], rotation) : originalTop;
        dataMap.topDiff[compId] = originalTop - dataMap.currentY[compId];
    }

    function addStructureToMap(structure, dataMap, measureMap, parentOffset, parentHeight, isMobileView) {
        if (!_.has(measureMap.height, structure.id)) {
            return;
        }

        addSpecialStuffToMap(structure, dataMap, measureMap);
        prepareHeightAndTop(structure, dataMap, measureMap);

        dataMap.minHeight[structure.id] = getStructureMinHeight(structure, dataMap);
        dataMap.currentHeight[structure.id] = Math.max(dataMap.currentHeight[structure.id], dataMap.minHeight[structure.id]);
        if (dataMap.collapsed[structure.id]){
            dataMap.currentHeight[structure.id] = 0;
        }
        dataMap.flat[structure.id] = structure;
        var currentY = dataMap.currentY[structure.id];
        var offset = parentOffset + currentY - parentHeight;
        var height = dataMap.currentHeight[structure.id];
        dataMap.sortingY[structure.id] = offset;
        dataMap.valueForFirstLockedAnchor[structure.id] = {pusherId: null, value: -Number.MAX_VALUE};


        if (!dataMap.collapsed[structure.id]){
            var children = utils.dataUtils.getChildrenData(structure, isMobileView);

            _.forEach(children, function (child) {
                //if 0 we add 5000  so that the children will be before the parent (site structure)
                addStructureToMap(child, dataMap, measureMap, offset, ( height || 5000), isMobileView);
            });
        }
    }

    function getStructureMinHeight(structure, dataMap) {
        var structureId = structure.id;
        if (structureId && !isStructureMinHeightIgnored(structureId)) {
            return Math.max(dataMap.minHeight[structureId] || 0, MIN_COMPONENT_HEIGHT_IN_PX);
        }
        return dataMap.minHeight[structureId] || 0;
    }

    function isStructureMinHeightIgnored(structureId) {
        return structureId && _.includes(STRUCTURE_IDS_TO_IGNORE_MIN_HEIGHT, structureId);
    }

    function prepareDataMap(structure, dataMap, measureMap, isMobileView){
        addStructureToMap(structure, dataMap, measureMap, 0, 0, isMobileView);
    }

    function get2WayAnchors(type, target, distance){
        return {
            distance: distance,
            type: type,
            targetComponent: target,
            locked: true,
            notEnforcingMinValue: true
        };
    }

    function cloneStructureAndAddAnchors(structure, target, top, bottom){
        var clonedStructure = structure;
        if (!structure.$cloned){
            clonedStructure = _.clone(clonedStructure);
            clonedStructure.layout = _.clone(clonedStructure.layout);
            clonedStructure.layout.anchors = _.clone(clonedStructure.layout.anchors);
            clonedStructure.$cloned = true;
        }
        var anchors = clonedStructure.layout.anchors;
        anchors.push(get2WayAnchors('TOP_TOP', target, top), get2WayAnchors('BOTTOM_BOTTOM', target, bottom));
        return clonedStructure;
    }

    function translateLockBottomAnchors(flatStructure) {
        _.forEach(flatStructure, function(structure, compId){
            if (!structure.layout || !structure.layout.anchors){
                return;
            }
            var lockBottomAnchors = _.filter(structure.layout.anchors, {'type': 'LOCK_BOTTOM'});
            if (_.isEmpty(lockBottomAnchors)){
                return;
            }
            //this will clone the anchors once as well
            _.forEach(lockBottomAnchors, function(anchor){
                flatStructure[compId] = cloneStructureAndAddAnchors(flatStructure[compId], anchor.targetComponent, anchor.topToTop, anchor.distance);
                flatStructure[anchor.targetComponent] = cloneStructureAndAddAnchors(flatStructure[anchor.targetComponent], compId, -1 * anchor.topToTop, -1 * anchor.distance);
            });
            _.remove(flatStructure[compId].layout.anchors, {'type': 'LOCK_BOTTOM'});
        });
    }

function isStructurePopup(structure){
    var firstPageChildType = _.get(structure, 'components[0].componentType');
    return firstPageChildType === 'wysiwyg.viewer.components.PopupContainer';
}

    /**
     * @typedef {{
     *      flat: Object.<string, Object>
     *      changedCompsMap: Object.<string, Object>
     *      minHeight: Object.<string, number>
     *      shrinkableContainer: Object.<string, boolean>
     *      ignoreOriginalValue:  Object.<string, boolean>,
     *      noHeightChange: Object.<string, boolean>,
     *      containerHeightMargin: Object.<string, number>,
     *      currentHeight: Object.<string, number>,
     *      currentY: Object.<string, number>,
     *      locked: Object.<string, boolean>
     * }} layout.structureDataMap
     */

    /**
     *
     * @param {data.compStructure} structure
     * @param {core.SiteData} siteData
     * @returns {{structureData: layout.structureDataMap, sortedIds: string[]}}
     * @param {layout.measureMap} measureMap
     */
    function getDataForAnchorsAndSort(structure, measureMap, isMobileView){
        var dataMap = getEmptyDataMap();
        dataMap.containerHeightMargin = measureMap.containerHeightMargin || {};
        dataMap.minHeight = _.clone(measureMap.minHeight || {});
        dataMap.collapsed = _.clone(measureMap.collapsed || {});
        dataMap.injectedAnchors = measureMap.injectedAnchors || {};

        //we add this because there is a bug in the enforce anchors which we fix only for popups for now :(
        dataMap.__isPopup = isStructurePopup(structure);

        prepareDataMap(structure, dataMap, measureMap, isMobileView);
        translateLockBottomAnchors(dataMap.flat);

        var ySortedIds = _.sortBy(_.keys(dataMap.flat), function (id) {
            return dataMap.sortingY[id];
        });
        delete dataMap.sortingY;
        return {
            structureData: dataMap,
            sortedIds: ySortedIds
        };
    }

    function fixMeasureMap(measureMap, dataMap){
        _.forEach(dataMap.flat, function(structure, compId){
            measureMap.height[compId] = dataMap.currentHeight[compId] - dataMap.heightDiff[compId];
            measureMap.top[compId] = dataMap.currentY[compId] + dataMap.topDiff[compId];
        });
    }

    function maxMeasureMapHeight(measureMap, offsetY, isMobileView, structure) {
        if (!_.has(measureMap.height, structure.id)) {
            return 0;
        }
        offsetY = offsetY || 0;
        offsetY += measureMap.top[structure.id];
        var children = utils.dataUtils.getChildrenData(structure, isMobileView);
        children = _.reject(children, {layout: {fixedPosition: true}});

        return Math.max(offsetY + measureMap.height[structure.id],
            Math.max.apply(null, _.map(children, _.partial(maxMeasureMapHeight, measureMap, offsetY, isMobileView))));
    }

    return {
        getDataForAnchorsAndSort: getDataForAnchorsAndSort,
        fixMeasureMap: fixMeasureMap,
        maxMeasureMapHeight: maxMeasureMapHeight
    };
});
