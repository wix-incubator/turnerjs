/**
 * Created by eitanr on 6/24/14.
 */
define(['layout/util/layout', 
    'zepto', 
    'utils', 
    'imageClientApi', 
    'lodash',
    'galleriesCommon',
    'layout/specificComponents/imageLayout'], function (/** layout.layout */ layout, $, utils, imageClientApi, _, galleriesCommon, imageLayout) {
    "use strict";

    var matrixScalingCalculations = galleriesCommon.utils.matrixScalingCalculations;
    var galleriesCommonLayout = utils.galleriesCommonLayout;


    function getSizeAfterScaling(displayerData, galleryHeight, galleryWidth, props, displayerNode) {
        var $displayer = $(displayerNode);
        return matrixScalingCalculations.getSizeAfterScaling({
            itemHeight: galleryHeight,
            itemWidth: galleryWidth,
            displayerData: displayerData,
            imageMode: props.imageMode,
            heightDiff: parseInt($displayer.data('height-diff'), 10) || 0,
            widthDiff: parseInt($displayer.data('width-diff'), 10) || 0,
            bottomGap: parseInt($displayer.data('bottom-gap'), 10) || 0
        });
    }

    function measureDisplayer(compId, galleryHeight, galleryWidth, props, imageItems, displayerNode){
        var $displayer = $(displayerNode);
        var imageIndex = $displayer.data('image-index');
        var imageData = _.defaults({displayMode: imageClientApi.fittingTypes.SCALE_TO_FILL}, imageItems[imageIndex]);

        var sizeAfterScaling = getSizeAfterScaling(imageData, galleryHeight, galleryWidth, props, $displayer);
        var containerSize = galleriesCommonLayout.getContainerSize(sizeAfterScaling.imageWrapperSize, $displayer);

        return {
            id: compId + displayerNode.id,
            imageData: imageData,
            imageNodeId: compId + displayerNode.id + 'image',
            imageWrapperId: compId + displayerNode.id + 'imageWrapper',
            containerSize: containerSize,
            sizeAfterScaling: sizeAfterScaling
        };
    }

    function measureSlideShow(id, measureMap, nodesMap, siteData, structureInfo) {
        galleriesCommonLayout.measureFlexibleHeightGallery(id, measureMap, nodesMap);
        var itemsContainer = nodesMap[id + 'itemsContainer'];
        var displayers = $(itemsContainer).children();
        var $gallery = $(nodesMap[id]);
        var galleryHeight = measureMap.height[id] - parseInt($gallery.data('height-diff'), 10) || 0;
        var galleryWidth = measureMap.width[id] - parseInt($gallery.data('height-diff'), 10) || 0;
        var imageItems = structureInfo.dataItem.items;
        measureMap.custom[id] = {
            displayers: _.map(displayers, _.partial(measureDisplayer, id, galleryHeight, galleryWidth, structureInfo.propertiesItem, imageItems))
        };
    }


    function patchSlideShow(id, patchers, measureMap, structureInfo, siteData) {
        var props = structureInfo.propertiesItem;
        var galleryHeight = measureMap.height[id];
        var galleryWidth = measureMap.width[id];
        var isMobile = siteData.isMobileDevice() || siteData.isMobileView();
        var galleryDisplayers = measureMap.custom[id].displayers;
        if (_.isEmpty(galleryDisplayers)){
            return;
        }
        if (props.imageMode === 'flexibleHeight') {
            var lastDisplayer = _.last(galleryDisplayers);
            galleryHeight = lastDisplayer.sizeAfterScaling.displayerSize.height;
        }
        patchers.css(id, {
            height: galleryHeight,
            width: galleryWidth
        });

        _.forEach(galleryDisplayers, function(displayer) {
            patchers.css(displayer.id, {
                height: galleryHeight,
                width: galleryWidth
            });
            galleriesCommonLayout.updateImageWrapperSizes(patchers, displayer.imageWrapperId, displayer.sizeAfterScaling);
            imageLayout.patchNodeImage(displayer.imageNodeId, patchers, measureMap, siteData, displayer.imageData, displayer.containerSize, isMobile);
        });
    }

    function getChildrenIdToMeasure(siteData, id) {
        var res = [
            ["itemsContainer"]
        ];
        var displayers = $('#' + id + "itemsContainer").children();
        _.forEach(displayers, function (displayer) {
            var childImageComponent = {pathArray: [displayer.id, 'image'], type: 'core.components.Image'};
            var imageWrapper = [displayer.id, 'imageWrapper'];
            var displayerPath = [displayer.id];
            res.push(childImageComponent, imageWrapper, displayerPath);
        });
        return res;
    }

    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.SlideShowGallery");
    layout.registerCustomMeasure('wysiwyg.viewer.components.SlideShowGallery', measureSlideShow);
    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.SlideShowGallery", getChildrenIdToMeasure);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.SlideShowGallery", patchSlideShow);


    return {};
});
