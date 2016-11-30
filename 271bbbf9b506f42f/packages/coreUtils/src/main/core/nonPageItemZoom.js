define(['lodash'], function (_) {
    'use strict';

    function forceUpdate() {
        window.rendered.forceUpdate();
    }

    var data;

    return {
        addGalleryDataToImageData: function (imageData, galleryData, getImageDataFromGalleryByQuery) {
            // There's a problem with how imageZoom component works:
            // when the user clicks on the "next" button, imageZoom knows what's
            // the next image by examining the url, and accessing siteData
            // accordingly in order to retrieve the data.
            // In nonPageItemZoom's use case, we don't use the url nor the
            // siteData. So we have to save the gallery's data somehow so
            // imageZoom will be able to access it. So we save it in the
            // compData.
            galleryData = _.assign({
                getImageDataByQuery: getImageDataFromGalleryByQuery
            }, galleryData);
            return _.assign({galleryData: galleryData}, imageData);
        },
        zoom: function (zoomedImageData) {
            if (!zoomedImageData || zoomedImageData.type !== 'Image' || !zoomedImageData.galleryData) {
                throw 'nonPageItemZoom should be used only with Images which have been passed to nonPageItemZoom.addGalleryDataToImageData()';
            }
            data = zoomedImageData;
            forceUpdate();
        },
        unzoom: function () {
            data = undefined;
            forceUpdate();
        },
        getZoomedImageData: function () {
            return data;
        },
        getImageDataFromGalleryByQuery: function (itemId) {
            if (data && data.galleryData) {
                return _.find(data.galleryData.items, {id: itemId});
            }
        },
        shouldImageBeZoomedAsNonPageItem: function (imageData) {
            return imageData && imageData.galleryData !== undefined;
        }
    };
});
