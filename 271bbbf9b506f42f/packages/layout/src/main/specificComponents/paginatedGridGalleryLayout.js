/**
 * Created by eitanr on 6/24/14.
 */
define(["layout/util/layout", 'zepto', 'lodash', 'imageClientApi', 'galleriesCommon', 'layout/specificComponents/imageLayout'], function (/** layout.layout */ layout, $, _, imageClientApi, galleriesCommon, imageLayout) {
    "use strict";

    var matrixCalculations = galleriesCommon.utils.matrixCalculations;

    function calculatePosition(itemsDataArr, itemWidth, itemHeight, props, siteData, patchers, measureMap, galleryId, structureInfo) {
        _.forEach(itemsDataArr, function (imageItemData, index) {
            var wrapperPosition = matrixCalculations.getItemPosition(index, itemWidth, itemHeight, props.margin, props.numCols);

            patchers.css(galleryId + imageItemData.imageItemId, {
                width: itemWidth,
                height: itemHeight,
                left: wrapperPosition.left,
                top: wrapperPosition.top
            });

            var imageData = _.assign({}, structureInfo.dataItem.items[imageItemData.imageIndex], {displayMode: imageClientApi.fittingTypes.SCALE_TO_FILL});
            imageLayout.patchNodeImage(galleryId + imageItemData.imageItemId, patchers, measureMap, siteData, imageData, {width: itemWidth, height: itemHeight});
        });
    }

    function getChildrenIdToMeasure(siteData, id) {
        var res = [
            ["itemsContainer"]
        ];
        var images = $('#' + id + "itemsContainer").children();
        _.forEach(images, function (image) {
            res.push({pathArray: [image.id], type: 'core.components.Image'});
        });
        return res;
    }

    function getItemsData(itemsArr) {
        return _.map(itemsArr, function (imageItem) {
            return {
                imageItemId: imageItem.id,
                imageIndex: $(imageItem).data('image-index')
            };
        });
    }

    function customMeasurePaginatedGridGalleryLayout(id, measureMap, nodesMap) {
        var customMeasure = measureMap.custom[id] = {};
        var $node = $(nodesMap[id]);
        customMeasure.heightDiff = parseInt($node.data('height-diff'), 10);
        customMeasure.widthDiff = parseInt($node.data('width-diff'), 10);

        var itemsContainer = $(nodesMap[id + "itemsContainer"]);

        customMeasure.nextItemsData = getItemsData(itemsContainer.children('div[data-page-desc="next"]'));
        customMeasure.prevItemsData = getItemsData(itemsContainer.children('div[data-page-desc="prev"]'));
        customMeasure.currItemsData = getItemsData(itemsContainer.children('div[data-page-desc="curr"]'));
    }

    function patchPaginatedGridGallery(id, patchers, measureMap, structureInfo, siteData) {
        var galleryHeight = measureMap.height[id];
        var galleryWidth = measureMap.width[id];

        var customMeasure = measureMap.custom[id];

        var props = structureInfo.propertiesItem;

        patchers.css(id + "itemsContainer", {
            width: galleryWidth - customMeasure.widthDiff,
            height: galleryHeight - customMeasure.heightDiff
        });

        var itemWidth = matrixCalculations.getItemWidth(props.margin, props.numCols, galleryWidth, customMeasure.widthDiff);
        var rowNum = matrixCalculations.getAvailableRowsNumber(props.maxRows, props.numCols, structureInfo.dataItem.items.length);
        var itemHeight = matrixCalculations.getItemHeight(props.margin, galleryHeight, rowNum, customMeasure.heightDiff);
        calculatePosition(customMeasure.nextItemsData, itemWidth, itemHeight, props, siteData, patchers, measureMap, id, structureInfo);
        calculatePosition(customMeasure.prevItemsData, itemWidth, itemHeight, props, siteData, patchers, measureMap, id, structureInfo);
        calculatePosition(customMeasure.currItemsData, itemWidth, itemHeight, props, siteData, patchers, measureMap, id, structureInfo);
    }

    layout.registerSAFEPatcher('wysiwyg.viewer.components.PaginatedGridGallery', patchPaginatedGridGallery);
    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.PaginatedGridGallery', getChildrenIdToMeasure);
    layout.registerCustomMeasure("wysiwyg.viewer.components.PaginatedGridGallery", customMeasurePaginatedGridGalleryLayout);

    return {};
});
