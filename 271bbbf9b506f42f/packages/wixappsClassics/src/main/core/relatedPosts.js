define([
    'lodash',
    'utils',
    'wixappsCore',
    'wixappsClassics/core/timeout',
    'wixappsClassics/core/transformAndSetMetaData',
    'wixappsClassics/core/transformMediaItemsResponse'
], function (
    _,
    utils,
    wixappsCore,
    TIMEOUT,
    transformAndSetMetaData,
    transformMediaItemsResponse
) {
    'use strict';

    var urlUtils = utils.urlUtils;
    var wixappsDataHandler = wixappsCore.wixappsDataHandler;

    function getEncodedPermalink(permalink) {
        if (_.includes(permalink, '/')) {
            var permalinkChunks = permalink.split('/');
            var encodedTitle = encodeURIComponent(_.last(permalinkChunks));

            //get permalink without last chunk(title) and add encodedTitle
            return _(permalinkChunks).slice(0, -1).concat(encodedTitle).join('/');
        }

        return permalink;
    }

    function getRelatedPostsUrl(baseUrl, permalink, storeId) {
        var encodedPermalink = getEncodedPermalink(permalink);

        encodedPermalink += encodedPermalink ? '/' : '';

        return baseUrl + '/apps/lists/1/posts/' + encodedPermalink + 'related?storeId=' + storeId;
    }

    function wrappedTransformItemsFn(compData, params, lang, responseData, currentValue) {
        transformMediaItemsResponse(compData.id, params.collectionId, {payload: responseData}, currentValue, lang);
    }

    function readRelatedPosts(siteData, compData, appService, params, urlData, lang) {
        var primaryRootInfo = siteData.getExistingRootNavigationInfo(siteData.getPrimaryPageId());
        var pageInfo = urlData ? _.assign(primaryRootInfo, urlData) : primaryRootInfo;
        var permalink = (pageInfo && pageInfo.pageAdditionalData) || '';
        var transformFn = _.partial(wrappedTransformItemsFn, compData, params, lang);

        return [{
            force: true,
            destination: wixappsDataHandler.getSiteDataDestination(appService.packageName),
            url: getRelatedPostsUrl(urlUtils.baseUrl(siteData.getExternalBaseUrl()), permalink, appService.datastoreId),
            transformFunc: transformAndSetMetaData.bind(this, transformFn, siteData, appService.packageName, compData.id),
            timeout: TIMEOUT
        }];
    }

    return {
        readRelatedPosts: readRelatedPosts
    };
});
