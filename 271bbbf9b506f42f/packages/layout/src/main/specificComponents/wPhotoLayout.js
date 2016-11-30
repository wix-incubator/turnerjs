define(['zepto', 'lodash', 'layout/util/layout', 'layout/specificComponents/imageLayout', 'utils', 'imageClientApi'], function ($, _, /** layout.layout */ layout, imageLayout, /** utils */ utils, imageClientApi) {
    'use strict';

    var convertedDisplayModes = {
        'fitWidthStrict': imageClientApi.fittingTypes.LEGACY_FIT_WIDTH,
        'fitHeightStrict': imageClientApi.fittingTypes.LEGACY_FIT_HEIGHT
    };

    function getConvertedDisplayMode(originalDisplayMode) {
        if (originalDisplayMode === imageClientApi.fittingTypes.LEGACY_FIT_WIDTH) {
            return imageClientApi.fittingTypes.LEGACY_FIT_HEIGHT;
        }
        return convertedDisplayModes[originalDisplayMode] || originalDisplayMode;
    }

    function getContainerOriginalSize(id, measureMap, displayMode) {
        var height = measureMap.height[id] - (measureMap.custom[id].marginHeight || 0);
        var width = measureMap.width[id] - (measureMap.custom[id].marginWidth || 0);
        var containerMeasuredSize = {
            width: width > 0 ? width : measureMap.width[id],
            height: height > 0 ? height : measureMap.height[id]
        };
        var exactHeight = measureMap.custom[id].exactHeight - (measureMap.custom[id].marginHeight || 0);

        if (displayMode === imageClientApi.fittingTypes.LEGACY_FIT_HEIGHT && Math.ceil(exactHeight) === containerMeasuredSize.height) {
            containerMeasuredSize.height = exactHeight;
        }

        return containerMeasuredSize;
    }

    //we have to calculate the margins in this stage, because during the patch the anchors might have change the height of the comp.
    function measurePhoto(id, measureMap, nodesMap) {
        var $node = $(nodesMap[id]);
        var contentPaddingHorizontal = parseInt($node.data('content-padding-horizontal'), 10);
        var contentPaddingVertical = parseInt($node.data('content-padding-vertical'), 10);
        var exactHeight = parseFloat($node.data('exact-height'));
        //the very ugly thisIsMyHeight field is here so that we won't override the wixapps comp height :`(
        //this is here because the image has to be proportional even if the server (structure data) thought otherwise
        measureMap.height[id] = measureMap.custom[id] && measureMap.custom[id].thisIsMyHeight || nodesMap[id].offsetHeight;


        measureMap.custom[id] = {
            marginWidth: contentPaddingHorizontal,
            marginHeight: contentPaddingVertical,
            exactHeight: exactHeight
        };
    }

    /**
     *
     * @param id
     * @param patchers
     * @param measureMap
     * @param {core.SiteData} siteData
     * @param {layout.structureInfo} structureInfo
     */
    function patchNodePhoto(id, patchers, measureMap, structureInfo, siteData) {
        var imgId = id + "img";
        var linkId = id + "link";
        var compData = structureInfo.dataItem;
        var compProp = structureInfo.propertiesItem;
        var displayMode = (compProp && compProp.displayMode) || 'fill';
        var convertedDisplayMode = getConvertedDisplayMode(displayMode);

        var containerSize = utils.imageUtils.getContainerSize(
            getContainerOriginalSize(id, measureMap, convertedDisplayMode),
            {width: compData.width, height: compData.height},
            convertedDisplayMode);

        var isVerticallyStretched = utils.layout.isVerticallyStretched(structureInfo.layout);
        var isHorizontallyStretched = utils.layout.isHorizontallyStretched(structureInfo.layout);

        var compSize = {
            width: !isHorizontallyStretched ? containerSize.width + measureMap.custom[id].marginWidth : '',
            height: !isVerticallyStretched ? containerSize.height + measureMap.custom[id].marginHeight : ''
        };

        var imageData = {
            width: compData.width,
            height: compData.height,
            displayMode: convertedDisplayMode, // This doesn't really matter in case of fit, but I think this should change with the container converted display mode
            uri: compData.uri
        };
        _.assign(imageData, _.pick(compData, ['crop', 'quality']));
        imageLayout.patchNodeImage(imgId, patchers, measureMap, siteData, imageData, containerSize);

        patchers.css(id, compSize);
        patchers.css(linkId, containerSize);
    }


    var childImageComponent = {pathArray: ['img'], type: 'core.components.Image'};

    layout.registerRequestToMeasureDom('wysiwyg.viewer.components.WPhoto');
    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.WPhoto', [childImageComponent, ['link']]);
    layout.registerSAFEPatcher('wysiwyg.viewer.components.WPhoto', patchNodePhoto);
    layout.registerCustomMeasure('wysiwyg.viewer.components.WPhoto', measurePhoto);

	layout.registerRequestToMeasureDom('wysiwyg.viewer.components.ClipArt');
    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.ClipArt', [childImageComponent, ['link']]);
    layout.registerSAFEPatcher('wysiwyg.viewer.components.ClipArt', patchNodePhoto);
    layout.registerCustomMeasure('wysiwyg.viewer.components.ClipArt', measurePhoto);

});
