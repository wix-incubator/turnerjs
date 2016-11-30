define(['wixCode/aspects/wixCodePostMessageService'], function(wixCodePostMessageService) {
    'use strict';

    /**
     *
     * @constructor
     * @param {core.SiteAspectsSiteAPI} siteAPI
     */
    return function WixCodePostMessageAspect(siteAPI) {
        this.siteAPI = siteAPI;
        wixCodePostMessageService.registerMessageHandler(this.siteAPI, wixCodePostMessageService.handleMessage);
        wixCodePostMessageService.registerMessageModifier(this.siteAPI, wixCodePostMessageService.modifyPostMessage);
    };
});
