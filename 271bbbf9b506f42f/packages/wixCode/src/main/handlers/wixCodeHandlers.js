define(['lodash', 'utils', 'experiment'], function (_, utils, experiment) {
    'use strict';

    var _getMenuItemType = function(pageData) {
        switch (pageData.link.type) {
            case 'PageLink':
                return 'PAGE';
            case 'ExternalLink':
            case 'EmailLink':
            case 'AnchorLink':
            case 'DocumentLink':
                return 'LINK';
        }
    };

    var _getMenuItemUrl = function(pageData) {
        switch (pageData.link.type) {
            case 'PageLink':
                return '/' + pageData.link.pageId.pageUriSEO;
            case 'ExternalLink':
                return pageData.link.url;
            case 'AnchorLink':
                var getAnchor = function(anchorData) {
                    switch (anchorData) {
                        case 'SCROLL_TO_BOTTOM':
                            return '#bottom';
                        case 'SCROLL_TO_TOP':
                            return '#top';
                        default:
                            return _.isObject(anchorData) ? '#' + anchorData.id : anchorData;
                    }
                };
                var pageUrl = pageData.link.pageId.pageUriSEO ? '/' + pageData.link.pageId.pageUriSEO : '';
                var anchor = pageData.link.anchorDataId ? getAnchor(pageData.link.anchorDataId) : '';
                return pageUrl + anchor;
            case 'DocumentLink':
                return 'document://' + pageData.link.docId;
            case 'EmailLink':
                return 'mailto:' + pageData.link.recipient;
        }
    };

    var _getMenuJSON = function(menuItems) {
        return _.map(menuItems, function(itemData) {

            var item = {
                $type: 'HEADER',
                title: itemData.label || '',
                children: _getMenuJSON(itemData.items)
            };

            if (itemData.link) {
                _.assign(item, {
                    $type: _getMenuItemType(itemData),
                    url: _getMenuItemUrl(itemData)
                });
            }

            return item;
        });
    };

    var getSiteMenu = function(siteAPI, msg, callback) {
        var siteMenuItems = utils.menuUtils.getSiteMenuWithoutRenderedLinks(siteAPI.getSiteData(), false);
        callback(_getMenuJSON(siteMenuItems));
    };

    var getFullPageUrl = function (siteAPI, msg, callback) {
        callback(siteAPI.getSiteData().getCurrentUrl());
    };


    var _extractPageByURI = function (siteAPI, pageId) {
        return siteAPI.getSiteData().findDataOnMasterPageByPredicate(function (pageData) {
            return pageData.pageUriSEO === pageId || pageData.id === pageId;
        });
    };

    var _handleExternalNavigation = function (siteAPI, url) {
        var siteData = siteAPI.getSiteData();
        var isExternalNavigationAllowed = siteData.renderFlags.isExternalNavigationAllowed;
        if (!url || !isExternalNavigationAllowed) {
            var previewTooltipCallback = siteData.renderRealtimeConfig.previewTooltipCallback;
            previewTooltipCallback(_getCenterScreenCoordinates(50, 20), 'text_editor_inactive_link_on_preview');
            return;
        }
        window.location.href = url;
    };
    var _getCenterScreenCoordinates = function (popupWidth, popupHeight) {
        // Fixes dual-screen position                         Most browsers      Firefox
        var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screen.left;
        var dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screen.top;
        var width;
        var height;
        if (window.innerWidth) {
            width = window.innerWidth;
        } else {
            width = window.document.documentElement.clientWidth ? window.document.documentElement.clientWidth : window.screen.width;
        }
        if (window.innerHeight) {
            height = window.innerHeight;
        } else {
            height = window.document.documentElement.clientHeight ? window.document.documentElement.clientHeight : window.screen.height;
        }
        var left = ((width / 2) - (popupWidth / 2)) + dualScreenLeft;
        var top = ((height / 2) - (popupHeight / 2)) + dualScreenTop;

        return {top: top, left: left};
    };

    var navigateTo = function (siteAPI, msg) {
        if (msg.data.type === 'ExternalLink') {
            _handleExternalNavigation(siteAPI, msg.data.url);
        }
        var navigationInfo = {
            pageId: siteAPI.getSiteData().getPrimaryPageId()
        };

        if (msg.data.pageId) {
            if (msg.data.pageId === '#') {
                _.assign(navigationInfo, {
                    pageId: siteAPI.getSiteData().getMainPageId()
                });
            } else {
                var pageData = _extractPageByURI(siteAPI, msg.data.pageId);
                if (experiment.isOpen('sv_dpages') && !pageData) {
                    var pathParts = msg.data.pageId.split('/');
                    var dynamicRouter = _.find(_.get(siteAPI.getSiteData(), 'rendererModel.routers.configMap'), {prefix: _.first(pathParts)});
                    if (dynamicRouter) {
                        navigationInfo = {
                            routerDefinition: dynamicRouter,
                            innerRoute: _.drop(pathParts).join('/'),
                            pageAdditionalData: msg.data.pageId
                        };
                    }
                } else {
                    _.assign(navigationInfo, {
                        pageId: pageData.id === 'masterPage' ? navigationInfo.pageId : pageData.id
                    });
                }
            }
        }
        if (msg.data.anchorDataId) {
            _.assign(navigationInfo, {
                anchorData: msg.data.anchorDataId
            });
        }

        siteAPI.handleNavigation(navigationInfo, '#', true);
    };

    var windowBoundingRect = function (siteAPI, msg, callback) {
        callback({
            window: siteAPI.getWindowSize(),
            scroll: siteAPI.getSiteScroll(),
            document: siteAPI.getDocumentSize()
        });
    };

    return {
        windowBoundingRect: windowBoundingRect,
        navigateTo: navigateTo,
        getSiteMenu: getSiteMenu,
        getFullPageUrl: getFullPageUrl
    };
});
