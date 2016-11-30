define(['core'], function (/** core */ core) {
    'use strict';

    /**
     *
     * @constructor
     * @param {core.SiteAspectsSiteAPI} siteAPI
     */
    var PinterestWidgetAspect = function (siteAPI){
        siteAPI.registerToMessage(this.handlePostMessage.bind(this));
        this.siteAPI = siteAPI;
        this.dimensions = {};
        this.shouldShowError = {};
    };

    PinterestWidgetAspect.prototype = {
        handlePostMessage: function (event) {
            var msg;
            try {
                msg = JSON.parse(event.data);
                if (msg.type !== 'pinterest'){
                    return;
                }
                if (msg.showError){
                    this.shouldShowError[msg.compId] = 'error';
                    this.siteAPI.forceUpdate();
                    return;
                }
                this.shouldShowError[msg.compId] = 'noError';
                this.dimensions[msg.compId] = {height: msg.height, width: msg.width};
                this.siteAPI.forceUpdate();
            } catch (e) {
                return;
            }
        },

        getIframeDimensions: function(compId) {
            return this.dimensions[compId];
        },

        shouldPresentErrorMessage : function(compId){
          return this.shouldShowError[compId];
        }
    };

    core.siteAspectsRegistry.registerSiteAspect('PinterestWidgetPostMessageAspect', PinterestWidgetAspect);
    return PinterestWidgetAspect;
});
