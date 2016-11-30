define([
    'lodash',
    'core',
    'widgets',
    'wixCode'
], function (_, core, widgets, wixCode) {
    'use strict';

    function createWixSitePseudoReactComponent(displayedSiteData, viewerPrivateServices, props, renderedRoots) {
        return {
            props: _.assign({}, props, {
                siteData: displayedSiteData,
                viewerPrivateServices: viewerPrivateServices
            }),
            siteAPI: null,
            forceUpdate: _.noop,
            setState: _.noop,
            getRootIdsWhichShouldBeRendered: function () {
                return renderedRoots;
            }
        };
    }

    function widgetReadyHandler(onReadyCallback, siteAPI, message) {
        if (onReadyCallback && message.intent === 'WIX_CODE' && message.type === 'widget_ready') {
            onReadyCallback();
        }
    }

    function render(displayedSiteData, viewerPrivateServices, props, renderedRoots, onReadyCallback) {
        var pseudoWixSiteReact = createWixSitePseudoReactComponent(displayedSiteData, viewerPrivateServices, props, renderedRoots);

        var siteAPI = new core.SiteAspectsSiteAPI(pseudoWixSiteReact);

        wixCode.wixCodePostMessageService.registerMessageHandler(siteAPI, _.partial(widgetReadyHandler, onReadyCallback));
        wixCode.wixCodePostMessageService.registerMessageHandler(siteAPI, wixCode.wixCodePostMessageService.handleMessage);
        wixCode.wixCodePostMessageService.registerMessageModifier(siteAPI, wixCode.wixCodePostMessageService.modifyPostMessage);
        widgets.widgetService.createAndRegisterWidgetHandler(siteAPI, _.noop);
        widgets.widgetService.syncAppsState(siteAPI, []);
    }

    return {
        render: render
    };
});
