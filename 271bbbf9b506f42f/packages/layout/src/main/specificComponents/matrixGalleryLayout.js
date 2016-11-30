/**
 * Created by eitanr on 6/24/14.
 */
define(["layout/util/layout", 'zepto', 'utils', 'imageClientApi', 'lodash', 'galleriesCommon', 'layout/specificComponents/imageLayout'], function (/** layout.layout */ layout, $, utils, imageClientApi, _, galleriesCommon, imageLayout) {
    "use strict";

    var matrixCalculations = galleriesCommon.utils.matrixCalculations;
    var galleriesCommonLayout = utils.galleriesCommonLayout;
    var matrixScalingCalculations = galleriesCommon.utils.matrixScalingCalculations;

    var MIN_HEIGHT = 70;
    var MIN_WIDTH = 45;

    function getSizeAfterScaling(displayerData, itemHeight, itemWidth, props, $node) {
        return matrixScalingCalculations.getSizeAfterScaling({
            itemHeight: itemHeight,
            itemWidth: itemWidth,
            displayerData: displayerData,
            imageMode: props.imageMode,
            heightDiff: parseInt($node.data('height-diff'), 10) || 0,
            widthDiff: parseInt($node.data('width-diff'), 10) || 0,
            bottomGap: parseInt($node.data('bottom-gap'), 10) || 0
        });
    }

    function measureDisplayer(compId, itemWidth, itemHeight, props, imageItems, displayer, index){
        var $displayer = $(displayer);
        var imageIndex = $displayer.data('image-index');
        var imageData = _.defaults({displayMode: imageClientApi.fittingTypes.SCALE_TO_FILL}, imageItems[imageIndex]);

        var sizeAfterScaling = getSizeAfterScaling(imageData, itemHeight, itemWidth, props, $displayer);
        var containerSize = galleriesCommonLayout.getContainerSize(sizeAfterScaling.imageWrapperSize, $displayer);
        var displayerPosition = matrixCalculations.getItemPosition(index, itemWidth, itemHeight, props.margin, props.numCols);

        return {
            id: compId + displayer.id,
            imageData: imageData,
            imageNodeId: compId + displayer.id + 'image',
            imageWrapperId: compId + displayer.id + 'imageWrapper',
            containerSize: containerSize,
            sizeAfterScaling: sizeAfterScaling,
            position: displayerPosition
        };
    }

    function measureMatrixGallery(id, measureMap, nodesMap, siteData, structureInfo) {
        galleriesCommonLayout.measureFlexibleHeightGallery(id, measureMap, nodesMap);
        var $node = $(nodesMap[id]);
        var itemsContainer = nodesMap[id + 'itemsContainer'];
        var displayers = $(itemsContainer).children();
        var imageItems = structureInfo.dataItem.items;

        measureMap.width[id] = Math.max(MIN_WIDTH, measureMap.width[id]);
        measureMap.height[id] = Math.max(MIN_HEIGHT, measureMap.height[id]);
        var heightDiff = parseInt($node.data('height-diff'), 10) || 0;
        var widthDiff = parseInt($node.data('width-diff'), 10) || 0;
        var numPresentedRows = parseInt($node.data('presented-row'), 10) || 0;

        var props = structureInfo.propertiesItem;
        var itemWidth = matrixCalculations.getItemWidth(props.margin, props.numCols, measureMap.width[id], widthDiff);
        var itemHeight = matrixCalculations.getItemHeight(props.margin, measureMap.height[id], numPresentedRows, heightDiff);

        measureMap.custom[id] = {
            displayers: _.map(displayers, _.partial(measureDisplayer, id, itemWidth, itemHeight, structureInfo.propertiesItem, imageItems))
        };
    }

    function patchMatrixGallery(id, patchers, measureMap, structureInfo, siteData) {
        var galleryHeight = measureMap.height[id];
        var galleryWidth = measureMap.width[id];
        var customMeasure = measureMap.custom[id];


        patchers.css(id + 'itemsContainer', {
            height: galleryHeight,
            width: galleryWidth
        });
        patchers.css(id, {
            height: galleryHeight,
            width: galleryWidth
        });

        _.forEach(customMeasure.displayers, function(displayer){
            var sizeAfterScaling = displayer.sizeAfterScaling;
            patchers.css(displayer.id, {
                height: sizeAfterScaling.displayerSize.height,
                width: sizeAfterScaling.displayerSize.width,
                left: displayer.position.left,
                top: displayer.position.top
            });

            galleriesCommonLayout.updateImageWrapperSizes(patchers, displayer.imageWrapperId, sizeAfterScaling);

            imageLayout.patchNodeImage(displayer.imageNodeId, patchers, measureMap, siteData, displayer.imageData, displayer.containerSize);

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

    layout.registerRequestToMeasureDom('wysiwyg.viewer.components.MatrixGallery');
    layout.registerCustomMeasure('wysiwyg.viewer.components.MatrixGallery', measureMatrixGallery);
    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.MatrixGallery", getChildrenIdToMeasure);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.MatrixGallery", patchMatrixGallery);


    return {};
});
