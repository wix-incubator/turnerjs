define(['lodash', 'siteUtils'], function (_, siteUtils) {
    'use strict';

    var nativeGalleryTypes = _.map(['SlideShow', 'Slider', 'PaginatedGrid', 'Matrix'], function (type) {
        return 'wysiwyg.viewer.components.' + type + 'Gallery';
    });

    function createEvent(expandedImageId) {
        return {
            id: expandedImageId,
            timeStamp: window.performance ? window.performance.now() : window.Date.now(),
            name: 'imageExpanded'
        };
    }

    function findNativeGalleriesOnPage(pageStructure, nativeGalleries) {
        nativeGalleries = nativeGalleries || [];
        if (!pageStructure) {
            return nativeGalleries;
        }
        if (_.includes(nativeGalleryTypes, pageStructure.componentType)) {
            nativeGalleries.push(pageStructure);
        }
        _.forEach(pageStructure.components, function (node) {
            findNativeGalleriesOnPage(node, nativeGalleries);
        });
        return nativeGalleries;
    }

    function getGalleryItemsList(siteData, pageId, gallerySructure) {
        var galleryData = siteData.getDataByQuery(gallerySructure.dataQuery, pageId);
        return _.get(galleryData, 'items');
    }

    function findItemListContaingItemWithId(itemId, itemsLists) {
        return _.findIndex(itemsLists, function (itemsList) {
            return _.some(itemsList, {id: itemId});
        });
    }

    return {

        handleImageExpandedAction: function () {
            var siteData = this.props.siteData;
            var currentPageId = this.props.pageId;
            var expandedImageId = _.get(this.props, 'compData.id') || this.props.id;
            var nativeGalleries = findNativeGalleriesOnPage(siteData.pagesData[currentPageId].structure);
            var galleriesItemsLists = _.map(nativeGalleries, getGalleryItemsList.bind(null, siteData, currentPageId));
            var wrappingGalleryIndex = findItemListContaingItemWithId(expandedImageId, galleriesItemsLists);
            if (wrappingGalleryIndex !== -1) {
                var behaviorsAspect = this.props.siteAPI.getSiteAspect('behaviorsAspect');

                var actions = [{
                    name: siteUtils.constants.ACTION_TYPES.ITEM_CLICKED,
                    pageId: currentPageId,
                    sourceId: nativeGalleries[wrappingGalleryIndex].id,
                    type: 'comp'
                }, {
                    name: siteUtils.constants.ACTION_TYPES.IMAGE_EXPANDED,
                    pageId: currentPageId,
                    sourceId: nativeGalleries[wrappingGalleryIndex].id,
                    type: 'comp'
                }];

                _.map(actions, function (action) { behaviorsAspect.handleAction(action, createEvent(expandedImageId)); return; });
            }
        }
    };
});
