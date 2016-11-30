/**
 * Created by eitanr on 6/24/14.
 */
define(['layout/util/layout', 'utils', 'imageClientApi', 'zepto', 'lodash', 'galleriesCommon', 'layout/specificComponents/imageLayout'], function (/** layout.layout */ layout, utils, imageClientApi, $, _, galleriesCommon, imageLayout) {
    "use strict";

    var matrixScalingCalculations = galleriesCommon.utils.matrixScalingCalculations;
    var galleriesCommonLayout = utils.galleriesCommonLayout;

    function getSizeAfterScaling(additionalHeight, galleryHeight, displayerData, displayerMeasure, props) {
        var totalItemContainerHeight = Math.floor(galleryHeight + additionalHeight);

        return matrixScalingCalculations.getSizeAfterScaling({
            itemHeight: totalItemContainerHeight,
            itemWidth: Math.floor(totalItemContainerHeight * (props && props.aspectRatio ? props.aspectRatio : 1.0)),
            displayerData: displayerData,
            imageMode: props ? props.imageMode : 'clipImage',
            heightDiff: displayerMeasure.heightDiff,
            widthDiff: displayerMeasure.widthDiff,
            bottomGap: displayerMeasure.bottomGap
        });
    }

    /**
     *
     * @param compId
     * @param galleryHeight
     * @param additionalHeight
     * @param imageItems
     * @param structureInfo
     * @param displayerNode
     * @param index
     * @returns {{node: *, data: {imageIndex: *, width: *, height: *, uri: *}}}
     */
    function getDisplayerCustomData(compId, galleryHeight, additionalHeight, structureInfo, imageItems, displayerNode, index){
        var $displayer = $(displayerNode);

        var displayerData = {
            imageIndex: $displayer.data('image-index'),
            //todo: CLNT-5323 , wixapp sildergallery temporary workaround
            //todo: remove (width/height/uri) when wixapps sliderGalleryProxy will implement structureInfo-> dataItem-> items for the images
            width: $displayer.data('displayer-width'),
            height: $displayer.data('displayer-height'),
            uri: $displayer.data('displayer-uri')
        };

        var displayerMeasure = {
            heightDiff: parseInt($displayer.data('height-diff'), 10) || 0,
            widthDiff: parseInt($displayer.data('width-diff'), 10) || 0,
            bottomGap: parseInt($displayer.data('bottom-gap'), 10) || 0
        };
        
        var imageData = imageItems && imageItems[displayerData.imageIndex] ? imageItems[displayerData.imageIndex] : displayerData;
        imageData = _.assign(imageData, {displayMode: imageClientApi.fittingTypes.SCALE_TO_FILL});

        var sizeAfterScaling = getSizeAfterScaling(additionalHeight, galleryHeight, imageData, displayerMeasure, structureInfo.propertiesItem);
        var containerSize = galleriesCommonLayout.getContainerSize(sizeAfterScaling.imageWrapperSize, $displayer);

        return {
            imageData: imageData,
            imageNodeId: compId + compId + index + 'image',
            imageWrapperId: compId + compId + index + 'imageWrapper',
            containerSize: containerSize,
            sizeAfterScaling: sizeAfterScaling
        };
    }

    function measureSliderGalleryLayout(id, measureMap, nodesMap, siteData, structureInfo) {
        var itemsContainer = nodesMap[id + 'images'];
        var displayers = $(itemsContainer).children();
        var imageItems = _.get(structureInfo, 'dataItem.items');

        var additionalHeight = parseInt($(nodesMap[id]).data('additional-height'), 10) || 0;
        measureMap.custom[id] = {
            displayers: _.map(displayers, _.partial(getDisplayerCustomData, id, measureMap.height[id], additionalHeight, structureInfo, imageItems)),
            additionalHeight: additionalHeight
        };
    }

    function patchSliderGalleryLayout(id, patchers, measureMap, structureInfo, siteData) {
        var galleryHeight = measureMap.height[id];
        var galleryWidth = measureMap.width[id];
        patchers.css(id, {
            height: galleryHeight, 
            width: galleryWidth
        });
        var galleryCustomMeasure = measureMap.custom[id];
        _.forEach(galleryCustomMeasure.displayers, function(displayer){
            galleriesCommonLayout.updateImageWrapperSizes(patchers, displayer.imageWrapperId, displayer.sizeAfterScaling);
            imageLayout.patchNodeImage(displayer.imageNodeId, patchers, measureMap, siteData, displayer.imageData, displayer.containerSize);
        });

    }

    function getChildrenIdToMeasure(siteData, id) {
        var res = [
            ["images"],
            ["itemsContainer"]
        ];
        var displayers = $('#' + id + "images").children();
        _.forEach(displayers, function (displayer) {
            var childImageComponent = {pathArray: [displayer.id, 'image'], type: 'core.components.Image'};
            var imageWrapper = [displayer.id, 'imageWrapper'];
            res.push(childImageComponent, imageWrapper);
        });
        return res;
    }

    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.SliderGallery", getChildrenIdToMeasure);
    layout.registerCustomMeasure('wysiwyg.viewer.components.SliderGallery', measureSliderGalleryLayout);
    layout.registerSAFEPatcher('wysiwyg.viewer.components.SliderGallery', patchSliderGalleryLayout);

    return {};
});
