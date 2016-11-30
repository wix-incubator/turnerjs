/**
 * Created by bogdanl on 8/12/16.
 */


define([
    'lodash',
    'wixappsClassics/core/data/converters/mediaPostConverter'
], function (
    _,
    mediaPostConverter
) {
    'use strict';

    function transformMediaItemsResponse(compId, collectionId, responseData, currentValue, lang) {
        currentValue[compId + '_extraData'] = _.omit(responseData.payload, ['items', 'referencedItems', 'unreferencedItems']);
        currentValue[compId] = _.map(responseData.payload.items, function (item) {
            return mediaPostConverter.getMediaPostCollection(item, collectionId);
        });

        currentValue.items = currentValue.items || {};
        currentValue.items[collectionId] = currentValue.items[collectionId] || {};
        currentValue.items.converted = currentValue.items.converted || {};
        currentValue.items.converted[collectionId] = currentValue.items.converted[collectionId] || {};

        _.forEach(responseData.payload.items, function (item) {
            var fixedItem = mediaPostConverter.fixMediaPostDataRefs(item);
            fixedItem = mediaPostConverter.translateDefaultPosts(fixedItem, lang);

            fixedItem = mediaPostConverter.getPostWithoutCertainExcerptStyling(fixedItem);

            var currentItem = currentValue.items[collectionId][item._iid] || {};
            fixedItem = _.assign(currentItem, fixedItem);

            fixedItem = mediaPostConverter.addAuthorFieldWhenMissing(fixedItem);
            fixedItem = mediaPostConverter.getPostWithConvertedMobileTitle(fixedItem);

            mediaPostConverter.fixMasterPageIdInLinksInside(fixedItem);

            currentValue.items[collectionId][item._iid] = fixedItem;
            mediaPostConverter.resolveCategories(currentValue, fixedItem);


            if (fixedItem._type === 'MediaPost') {
                var convertedItem = mediaPostConverter.convertMediaPost(fixedItem);
                currentValue.items.converted[collectionId][convertedItem._iid] = convertedItem;
                mediaPostConverter.resolveCategories(currentValue, convertedItem);
            }
        });

        _.forEach(responseData.payload.referencedItems, function (refItem, refItemKey) {
            var colId = refItemKey.split("/")[0];
            var iid = refItemKey.split("/")[1];
            currentValue.items[colId] = currentValue.items[colId] || {};
            currentValue.items[colId][iid] = refItem;
        });

        return currentValue;
    }

    return transformMediaItemsResponse;
});
