/**
 * @author andreys (Andrew Shustariov)
 */
define(['zepto', 'lodash', 'layout/util/layout', 'imageClientApi', 'layout/specificComponents/imageLayout'], function ($, _, /** layout.layout */ layout, imageClientApi, imageLayout) {
    'use strict';

    /**
     *
     * Since image is not only element in component's container - we need to update
     * its size after other elements (only label) will be rendered
     *
     * @param id
     * @param nodesMap
     * @param measureMap
     * @param {core.SiteData} siteData
     * @param {layout.structureInfo} structureInfo
     */
    function documentMediaPatcher(id, patchers, measureMap, structureInfo, siteData) {
        var compData = _.defaults({displayMode: imageClientApi.fittingTypes.LEGACY_FULL}, structureInfo.dataItem);
        imageLayout.patchNodeImage(id + 'img', patchers, measureMap, siteData, compData, measureMap.custom[id].containerSize);

        // Ensure, that container's width won't be smaller, then the title
        patchers.css(id, {width: measureMap.width[id]});
    }

    function documentMediaMeasure(id, measureMap, nodesMap /**, siteData, parentStructureInfo **/) {
        var $wrapper = $(nodesMap[id]);
        var labelId = id + 'label';
        var labelWidth = measureMap.width[labelId];
        var labelHeight = measureMap.height[labelId];
        var wrapperWidth = Math.max(measureMap.width[id], labelWidth);
        var paddingLeft = $wrapper.data('content-padding-left');
        var paddingRight = $wrapper.data('content-padding-right');
        var paddingTop = $wrapper.data('content-padding-top');
        var imageHeight = $wrapper.data('content-image-height');

        var containerSize = {
            width: wrapperWidth - paddingLeft - paddingRight,
            height: Math.max(imageHeight - paddingTop - labelHeight, 1)
        };

        measureMap.custom[id] = {
            containerSize: containerSize
        };
        measureMap.width[id] = wrapperWidth;

        measureMap.minWidth[id] = labelWidth;
    }

    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.documentmedia.DocumentMedia', [
        ['label'],
        {pathArray: ['img'], type: 'core.components.Image'},
        ['link']
    ]);

    layout.registerCustomMeasure('wysiwyg.viewer.components.documentmedia.DocumentMedia', documentMediaMeasure);

    layout.registerSAFEPatcher('wysiwyg.viewer.components.documentmedia.DocumentMedia', documentMediaPatcher);

});
