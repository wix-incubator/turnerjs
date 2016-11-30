define(['lodash', 'zepto', 'layout/util/layout', 'layout/specificComponents/balataLayout', 'experiment'], function (_, $, /** layout.layout */ layout, balataLayout, experiment) {
    'use strict';

    //To Use mediaContainer with background register you component here
    var registeredComponentTypes = ['wysiwyg.viewer.components.HoverBox'];
    var CONTAINER_POSTFIX = 'container';

    function measureMediaContainer(id, measureMap, nodesMap, siteData, structureInfo) {
        if (!structureInfo.designDataItem.background){
            return;
        }

        balataLayout.measure(id, measureMap, nodesMap, siteData, structureInfo);
        var clientRect = nodesMap[id].getBoundingClientRect();
        measureMap.absoluteLeft[id] = clientRect.left;
        if (experiment.isOpen('sv_cssDesignData')) {
            var containerId = id + CONTAINER_POSTFIX;
            nodesMap[containerId] = nodesMap[containerId] || $(nodesMap[id]).find('#' + containerId)[0];
            var computedStyle = window.getComputedStyle(nodesMap[containerId]);
            var borderWidth = parseInt(computedStyle.getPropertyValue('border-left-width'), 10);
            if (_.isUndefined(measureMap.borderWidth)) {
                measureMap.borderWidth = {};
            }
            measureMap.borderWidth[id] = borderWidth;

            measureMap.width[id] = measureMap.innerWidth[id];
        }
    }

    function patchMediaContainer(id, patchers, measureMap, structureInfo, siteData) {
        if (!structureInfo.designDataItem.background) {
            return;
        }

        if (experiment.isOpen('sv_cssDesignData')) {
            patchers.css(id + CONTAINER_POSTFIX, {
                left: -measureMap.borderWidth[id],
                top: -measureMap.borderWidth[id]
            });
        }

        var parentDimensions = {
            top: 0,
            left: 0,
            width: measureMap.width[id],
            height: measureMap.height[id],
            absoluteLeft: measureMap.absoluteLeft[id]
        };

        balataLayout.patch(id, patchers, measureMap, structureInfo, siteData, parentDimensions);
    }

    _.forEach(registeredComponentTypes, function (compType) {
        layout.registerCustomMeasure(compType, measureMediaContainer);
        layout.registerRequestToMeasureChildren(compType, balataLayout.BALATA_PATHS_TO_REQUEST_MEASURE);
        layout.registerSAFEPatcher(compType, patchMediaContainer);
    });
});
