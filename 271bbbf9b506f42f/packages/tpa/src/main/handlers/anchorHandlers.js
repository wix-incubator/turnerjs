define(['lodash', 'utils', 'tpa/utils/tpaUtils'], function (_, utils, tpaUtils) {
    'use strict';

    var getAnchorData = function(anchorInfo){
        return {
            id: anchorInfo.compId,
            title: anchorInfo.name
        };
    };

    var getCurrentPageAnchors = function(siteAPI, msg, callback){
        callback(getCurrentPageAnchorsInfo(siteAPI));
    };

    var getCurrentPageAnchorsInfo = function(siteAPI){
        var pageId = siteAPI.getSiteData().getCurrentUrlPageId();
        var topPageAnchorName = tpaUtils.Constants.TOP_PAGE_ANCHOR_PREFIX + pageId;
        var anchors = utils.scrollAnchors.getPageAnchors(siteAPI.getSiteData(), pageId, topPageAnchorName);
        return _.map(anchors, getAnchorData);
    };

    var navigateToAnchor = function(siteAPI, msg, onFailure){
        var anchorCompId = msg.data.anchorId;
        var urlPageId = siteAPI.getSiteData().getCurrentUrlPageId();
        if (isPageTopAnchor(anchorCompId, urlPageId)) {
            var topPageAnchor = utils.scrollAnchors.getPageTopAnchor(urlPageId);
            siteAPI.scrollToAnchor(topPageAnchor.id);
        } else if (isAnchorExistsOnPage(siteAPI, anchorCompId)) {
            var anchorDataId = getAnchorDataId(siteAPI, anchorCompId);
            if (anchorDataId) {
                siteAPI.scrollToAnchor(anchorDataId);
            }
        } else if (onFailure) {
            onFailure({
                error: {
                    message: 'anchor with id "' + anchorCompId + '" was not found on the current page.'
                }
            });
        }
    };

    var isAnchorExistsOnPage = function(siteAPI, anchorCompId){
        var currentPageAnchors = getCurrentPageAnchorsInfo(siteAPI);
        return _.some(currentPageAnchors, {id: anchorCompId});
    };

    function getAnchorDataId(siteAPI, anchorCompId) {
        var anchorComp = siteAPI.getComponentById(anchorCompId);
        var compData = anchorComp.props.compData;
        return compData && compData.id;
    }

    function isPageTopAnchor(anchorCompId, pageId) {
        var topPageAnchor = utils.scrollAnchors.getPageTopAnchor(pageId);
        return anchorCompId === topPageAnchor.compId;
    }

    return {
        getCurrentPageAnchors: getCurrentPageAnchors,
        navigateToAnchor: navigateToAnchor
    };
});
