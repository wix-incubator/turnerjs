define(['wixCodeInit/utils/appsUtils'], function(appsUtils) {
    'use strict';

    function cloneObject(original) {
        if (original === null || typeof original !== 'object') {
            return original;
        }
        var cloned = {};
        for (var key in original) {
            if (original.hasOwnProperty(key)) {
                cloned[key] = original[key];
            }
        }
        return cloned;
    }

    function asyncGetMessage(currentUrl, buildMessageFunc, callback, getSiteDataFunc) {
        requirejs(['utils', 'widgets', 'wixCode'], function (utils, widgets, wixCode) {
            /*
             TODO:
             utils package is currently required so we don't duplicate the code for url parsing.
             widgets package is currently required so we don't duplicate the code that knows how to build a load_widgets message.
             wixCode package is currently required so we don't duplicate the code for extending message with wix code specific data.
             these requirements postpone the pre-loading of widgets by a few seconds.
             we should refactor the code in such a way that will allow us to only load very small packages to make pre-loading relevant.
             */
            var siteData = getSiteDataFunc(utils);
            var parsedUrl = utils.wixUrlParser.parseUrl(siteData, currentUrl);
            var currentPageId = parsedUrl && parsedUrl.pageId;
            if (!currentPageId) {
                return;
            }
            var message = buildMessageFunc(widgets, siteData, currentPageId);
            var wixCodeSpec = wixCode.wixCodeWidgetService.getWixCodeSpec(siteData.rendererModel.clientSpecMap);
            var extendedLoadMessage = wixCode.messageBuilder.getExtendedMessage(message, siteData.rendererModel.wixCodeModel || {}, wixCodeSpec, siteData);
            callback(extendedLoadMessage);
        });
    }

    function asyncGetPreLoadMessage(siteModel, currentUrl, callback) {
        var buildLoadMessage = function(widgets, dummySiteData, currentPageId) {
            var widgetDefs = appsUtils.getApplications(siteModel.rendererModel.clientSpecMap, [currentPageId], dummySiteData);
            var routers = siteModel.rendererModel.routers || {};
            return widgets.messageBuilder.loadWidgetsMessage(widgetDefs, routers.configMap, [currentPageId]);
        };
        var getSiteData = function(utils) {
            return new utils.SiteData(siteModel, function () {}); // dummy site data as a hack for using wixUrlParser
        };
        asyncGetMessage(currentUrl, buildLoadMessage, callback, getSiteData);
    }

    function asyncGetPreInitMessage(siteData, currentUrl, callback) {
        var buildInitMessage = function(widgets, dummySiteData, currentPageId) {
            var controllerToInit = {};
            controllerToInit[currentPageId] = widgets.widgetService.getControllersToInit(dummySiteData, currentPageId);
            return widgets.messageBuilder.initWidgetsMessage(controllerToInit);
        };
        var getSiteData = function() {
            return siteData;
        };
        asyncGetMessage(currentUrl, buildInitMessage, callback, getSiteData);
    }

    function filterPreLoadedWidgets(preLoadMessage, message) {
        if (message.type === 'load_widgets') {
            var preLoadedWidgetIds = preLoadMessage.widgets.map(function(widgetInfo) {
                return widgetInfo.id;
            });
            if (preLoadedWidgetIds.length > 0) {
                message = cloneObject(message);
                message.widgets = message.widgets.filter(function (widgetInfo) {
                    return preLoadedWidgetIds.indexOf(widgetInfo.id) === -1; //eslint-disable-line lodash/prefer-includes
                });
                if (message.widgets.length === 0) {
                    return null;
                }
            }
        }
        return message;
    }

    return {
        asyncGetPreLoadMessage: asyncGetPreLoadMessage,
        asyncGetPreInitMessage: asyncGetPreInitMessage,
        filterPreLoadedWidgets: filterPreLoadedWidgets
    };
});
