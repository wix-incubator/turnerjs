define([
    'zepto',
    'coreUtils',
    'layout/util/layout',
    'layout/specificComponents/balataLayout'
], function ($, utils, /** layout.layout */ layout, balataLayout) {
    'use strict';

    var MIN_HEIGHT = 50;
    var balataConsts = utils.balataConsts;

    function measureBoxSlideShow(id, measureMap) {
        measureMap.height[id] = Math.max(MIN_HEIGHT, measureMap.height[id]);
        measureMap.minHeight[id] = MIN_HEIGHT;
    }

    function measureBoxSlideShowSlide(id, measureMap, nodesMap, siteData, structureInfo) {
        measureMap.top[id] = 0;
        measureMap.left[id] = 0;

        var slideNode = $(nodesMap[id]);
        var slideParentId = slideNode.data('parent-id');
        measureMap.minHeight[id] = slideNode.data('min-height');
        measureMap.height[id] = measureMap.height[slideParentId];

        if (!structureInfo.designDataItem.background){
            return;
        }

        var balataId = id + balataConsts.BALATA;
        measureMap.width[balataId] = measureMap.width[id];
        measureMap.height[balataId] = measureMap.height[id];
        measureMap.left[balataId] = measureMap.left[id];
        var clientRect = nodesMap[id].getBoundingClientRect();
        measureMap.custom[id] = {absoluteLeft: clientRect.left};
        balataLayout.measure(id, measureMap, nodesMap, siteData, structureInfo);
    }

    function patchBoxSlideShowSlide(id, patchers, measureMap, structureInfo, siteData) {
        if (!structureInfo.designDataItem.background) {
            return;
        }

        var parentDim = {
            top: measureMap.top[id],
            left: measureMap.left[id],
            width: measureMap.width[id],
            height: measureMap.height[id],
            absoluteLeft: measureMap.custom[id].absoluteLeft
        };
        balataLayout.patch(id, patchers, measureMap, structureInfo, siteData, parentDim);
    }

    //the default flow is that the parent is measured first
    layout.registerCustomMeasure("wysiwyg.viewer.components.BoxSlideShow", measureBoxSlideShow);
    layout.registerCustomMeasure("wysiwyg.viewer.components.BoxSlideShowSlide", measureBoxSlideShowSlide);


    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.BoxSlideShow");
    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.BoxSlideShowSlide");
    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.BoxSlideShowSlide", [["inlineContentParent"], ["inlineContent"]].concat(balataLayout.BALATA_PATHS_TO_REQUEST_MEASURE));
    layout.registerSAFEPatcher("wysiwyg.viewer.components.BoxSlideShowSlide", patchBoxSlideShowSlide);
});
