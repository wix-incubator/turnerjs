define(['lodash', 'documentServices/documentMode/documentModeInfo'], function (_, documentModeInfo) {
    "use strict";

    var BLOG_APP_PAGE_ID = {
        SINGLE_POST: '7326bfbb-4b10-4a8e-84c1-73f776051e10',
        FEED: '79f391eb-7dfc-4adf-be6e-64434c4838d9'
    };

    function isBlogPage(ps, pageId) {
        var viewMode = documentModeInfo.getViewMode(ps);
        var pageCompPointer = ps.pointers.components.getPage(pageId, viewMode);
        var compTypePointer = ps.pointers.getInnerPointer(pageCompPointer, 'componentType');
        var componentType = ps.dal.get(compTypePointer);

        return componentType === 'wixapps.integration.components.AppPage';
    }

    function isAppPageWithId(ps, pageId, appPageId) {
        var pageDataItem = _(pageId)
            .thru(ps.pointers.data.getDataItem)
            .thru(ps.dal.get)
            .value();
        return pageDataItem && pageDataItem.type === 'AppPage' &&
            pageDataItem.appPageType === 'AppPage' &&
            pageDataItem.appPageId === appPageId;
    }

    function isBlogSinglePostPage(ps, pageId) {
        return isAppPageWithId(ps, pageId, BLOG_APP_PAGE_ID.SINGLE_POST);
    }

    function isBlogFeedPage(ps, pageId) {
        return isAppPageWithId(ps, pageId, BLOG_APP_PAGE_ID.FEED);
    }

    return {
        isSinglePost: isBlogSinglePostPage,
        isFeed: isBlogFeedPage,
        isBlogPage: isBlogPage
    };
});
