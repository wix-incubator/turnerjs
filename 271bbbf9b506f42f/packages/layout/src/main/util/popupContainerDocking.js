define([
    'layout/specificComponents/containerAndScreenWidthLayout',
    'layout/specificComponents/balataLayout',
    'siteUtils'
], function(
    containerAndScreenWidthLayout,
    balataLayout,
    siteUtils
) {
    'use strict';

    /**
     * Do NOT use it and do NOT do something similar !!!
     * And DO NOT DO THIS AT HOME !!!
     *
     * This is temporary special ugly util created for the popups docking.
     * It should be replaced in future by verbs.
     *
     * Ask AlissaV for details.
     **/

    var ALIGNMENT_TYPES = {
        NINE_GRID: 'nineGrid',
        FULL_HEIGHT: 'fullHeight',
        FULL_WIDTH: 'fullWidth'
    };

    function getBalataDimensions(width, height) {
        return {
            top: 0,
            left: 0,
            width: width,
            height: height,
            absoluteLeft: 0
        };
    }

    return {
        measure: function(id, measureMap, nodesMap, siteData, structureInfo){
            // there is no sense to set measureMap.top[id] here,
            // because height could and probably will be changed by anchors
            // and therefore top calculation should be done afterwards
            var compProps = structureInfo.propertiesItem;
            var parentDimensions = {};


            if (compProps.alignmentType === ALIGNMENT_TYPES.FULL_WIDTH){
                containerAndScreenWidthLayout.measureStripContainer(id, measureMap, nodesMap, siteData, structureInfo);
                return;
            }

            if (compProps.alignmentType === ALIGNMENT_TYPES.FULL_HEIGHT){
                measureMap.minHeight[id] = measureMap.innerHeight.screen;
                measureMap.shrinkableContainer[id] = true;
            }

            parentDimensions.width = measureMap.width[id];

            measureMap.left[id] = siteUtils.compAlignmentUtils.getLeft(compProps, measureMap.width[id], measureMap.width.screen, siteData.getSiteWidth());
            //measureMap.left[id] = siteUtils.popupLayoutUtils.getLeft(compProps, id, measureMap, siteData, compProps.horizontalOffset);
            balataLayout.measure(id, measureMap, nodesMap, siteData, structureInfo, parentDimensions);
        },

        patch: function(id, patchers, measureMap, structureInfo, siteData){
            // YES, it violates common principle which is "do NOT write to measureMap on patching, you can only read".
            // This case is very specific for a popup container and you SHOULD NOT do the same or use this.
            // This temporary solution for the docking popup container to the screen and should be removed after verbs are ready.
            // In order for things to work, we need to have actual real position and height in measure map,
            // which can not be obtained before this phase.

            var compProps = structureInfo.propertiesItem;
            var newPageHeight;
            var popupPageId = siteData.getCurrentPopupId();

            var newTop = siteUtils.compAlignmentUtils.getTop(compProps, measureMap.height[id], measureMap.innerHeight.screen);


            measureMap.top[id] = newTop;
            newPageHeight = measureMap.height[popupPageId] = newTop + measureMap.height[id];
            patchers.css(popupPageId, {height: newPageHeight});

            patchers.css(id, {
                left: measureMap.left[id],
                top: newTop,
                width: measureMap.width[id],
                height: measureMap.height[id]
            });

            if (compProps.alignmentType === ALIGNMENT_TYPES.FULL_WIDTH) {
                containerAndScreenWidthLayout.patchStripContainer(id, patchers, measureMap, structureInfo, siteData, {
                    width: measureMap.width[id]
                });
            } else {
                balataLayout.patch(id, patchers, measureMap, structureInfo, siteData, getBalataDimensions(measureMap.width[id], measureMap.height[id]));
            }
        }
    };
});
