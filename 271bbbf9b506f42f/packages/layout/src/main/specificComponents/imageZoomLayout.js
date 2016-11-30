define(['lodash', 'zepto', 'layout/util/layout', 'layout/specificComponents/imageLayout', 'utils', 'imageClientApi'], function(_, $, /** layout.layout*/ layout, imageLayout, utils, imageClientApi){
    "use strict";

    var mediaZoomCalculations = utils.mediaZoomCalculations;


    function getImageCompDataFromStructure(structureInfo) {
        return structureInfo.dataItem || structureInfo.structure.compData;
    }

    function getImageCompData(siteData, imageId) {
        return utils.nonPageItemZoom.getZoomedImageData() || siteData.getDataByQuery(imageId);
    }

    function getImageId(siteData) {
        var zoomedImageData = utils.nonPageItemZoom.getZoomedImageData();
        return siteData.getExistingRootNavigationInfo(siteData.getFocusedRootId()).pageItemId || (zoomedImageData && zoomedImageData.id);
    }

    /*The update of  Dialog box Layout is on componentDidLayout of mediaZoom.js*/
    function patchMediaZoomImage(id, patchers, measureMap, structureInfo, siteData){
        var imageId = getImageId(siteData);
        var isNonOptimizedView = !siteData.isMobileView() && siteData.isMobileDevice() || siteData.isTabletDevice();
        var compData = getImageCompData(siteData, imageId);

        var imageData = _.defaults({displayMode: imageClientApi.fittingTypes.LEGACY_FULL}, compData);
        imageData.quality = _.defaults({quality: 90}, imageData.quality || {});
        var zoomDimensions = measureMap.custom[id];
        var containerSize = {width: zoomDimensions.imageContainerWidth, height: zoomDimensions.imageContainerHeight};

        imageLayout.patchNodeImage(id + imageId + 'image', patchers, measureMap, siteData, imageData, containerSize);
        // patch panel.
        if (measureMap.custom[id].hasPanel) {
            var panelWidth = isNonOptimizedView ? zoomDimensions.dialogBoxWidth : containerSize.width;
            patchers.css(id + compData.id + 'panel', {width: panelWidth});
        }
    }


    function patchMobileViewMediaZoom(mediaZoomId, patchers, measureMap, structureInfo, siteData) {
        var zoomMeasure = measureMap.custom[mediaZoomId];

        patchers.css(mediaZoomId + 'dialogBox', {
            width: zoomMeasure.imageContainerWidth,
            minHeight: zoomMeasure.dialogBoxHeight,
            paddingTop: zoomMeasure.paddingTop
        });

        patchMediaZoomImage(mediaZoomId, patchers, measureMap, structureInfo, siteData);

        var imageId = getImageId(siteData);

        // handle the ellipsis ( we show an ellipsis when the text is bigger than 2 or 3 lines )
        if (zoomMeasure.showDescription && zoomMeasure.descriptionHeight > zoomMeasure.descriptionHeightLimit) {
            var descriptionId = mediaZoomId + imageId + 'description';
            patchers.css(descriptionId, {height: zoomMeasure.descriptionHeightLimit});
            patchers.data(descriptionId, {expandable: 'true'});
            patchers.css(descriptionId, {height: zoomMeasure.descriptionHeightLimit});
            patchers.css(mediaZoomId + imageId + 'ellipsis', {display: ''}); //equivalent to $(node).show()
        }
    }

    function measureMediaZoom(id, measureMap, nodesMap, siteData){
        var imageId = getImageId(siteData);
        var compData = getImageCompData(siteData, imageId);
        var isNonOptimizedView = !siteData.isMobileView() && siteData.isMobileDevice() || siteData.isTabletDevice();
        var getDimensionsFunc = isNonOptimizedView ?
            mediaZoomCalculations.getNonOptimizedViewDimensions : mediaZoomCalculations.getDesktopViewDimensions;

        var $mediaZoomContainer = $(nodesMap[id]);
        var $dialogBoxContainer = $(nodesMap[id + 'dialogBox']);
        var dialogBoxPadding = getNodePadding($dialogBoxContainer);

        var panelId = id + imageId + 'panel';
        measureMap.custom[id] = getDimensionsFunc(compData, siteData, measureMap,
            parseInt($mediaZoomContainer.data('width-spacer'), 10), parseInt($mediaZoomContainer.data('height-spacer'), 10),
            measureMap.height[panelId], dialogBoxPadding);
        measureMap.custom[id].hasPanel = Boolean(nodesMap[panelId]);
    }

    function getNodePadding(dialogBoxContainer) {
        var dialogBoxPaddingVertical = getNumericCSSPropValue(dialogBoxContainer, 'padding-bottom') +
            getNumericCSSPropValue(dialogBoxContainer, 'padding-top');
        var dialogBoxPaddingHorizontal = getNumericCSSPropValue(dialogBoxContainer, 'padding-right') +
            getNumericCSSPropValue(dialogBoxContainer, 'padding-left');
        return {horizontal: dialogBoxPaddingHorizontal, vertical: dialogBoxPaddingVertical};
    }

    function getNumericCSSPropValue($node, cssProperty) {
        if ($node && cssProperty) {
            return parseInt($node.css(cssProperty), 10) || 0;
        }
        return 0;
    }

    function addMobileZoomDescriptionToMeasure(customMeasure, descriptionNode){
        var $description = $(descriptionNode);
        if ($description.css('display') !== 'none') {
            var lineHeight = parseInt($description.css('line-height'), 10);
            customMeasure.showDescription = true;
            customMeasure.descriptionHeight = $description.height();
            customMeasure.descriptionHeightLimit = Math.floor(lineHeight * 3);
        }
    }

    function measureMobileViewMediaZoom(mediaZoomId, measureMap, nodesMap, siteData, isMobileZoom){
        var imageId = getImageId(siteData);
        var compData = getImageCompData(siteData, imageId);

        var customMeasure = mediaZoomCalculations.getMobileViewDimensions(compData, siteData, measureMap);
        var descriptionNode = nodesMap[mediaZoomId + imageId + 'description'];
        addMobileZoomDescriptionToMeasure(customMeasure, descriptionNode);
        customMeasure.isMobileZoom = isMobileZoom;
        measureMap.custom[mediaZoomId] = customMeasure;
    }

    var IMAGE_ZOOM_COMP_CLASSNAME = 'wysiwyg.components.imageZoom';

    layout.registerCustomMeasure(IMAGE_ZOOM_COMP_CLASSNAME, function (id, measureMap, nodesMap, siteData, structureInfo) {
        var mediaZoomId = getImageCompDataFromStructure(structureInfo).id;
        var measureFunction = siteData.isMobileView() ? measureMobileViewMediaZoom : measureMediaZoom;
        measureFunction(id + mediaZoomId, measureMap, nodesMap, siteData);
    });

    layout.registerSAFEPatcher(IMAGE_ZOOM_COMP_CLASSNAME, function(id, patchers, measureMap, structureInfo, siteData){
        var mediaZoomId = getImageCompDataFromStructure(structureInfo).id;
        var patchFunction = siteData.isMobileView() ? patchMobileViewMediaZoom : patchMediaZoomImage;
        patchFunction(id + mediaZoomId, patchers, measureMap, structureInfo, siteData);
    });

    layout.registerRequestToMeasureChildren(IMAGE_ZOOM_COMP_CLASSNAME, function(siteData, id, nodesMap, structureInfo){
        var mediaZoomId = getImageCompDataFromStructure(structureInfo).id;
        var imageId = getImageId(siteData);
        var childImageComponent = {pathArray: [mediaZoomId, imageId, 'image'], type: 'core.components.Image'};
        if (siteData.isMobileView()){
            return [[mediaZoomId], childImageComponent, [mediaZoomId, 'dialogBox'], [mediaZoomId, imageId, 'description'], [mediaZoomId, imageId, 'ellipsis']];
        }
        return [[mediaZoomId], childImageComponent, [mediaZoomId, 'dialogBox'], [mediaZoomId, 'buttonPrev'], [mediaZoomId, 'buttonNext'], [mediaZoomId, imageId, 'panel']];
    });
});
