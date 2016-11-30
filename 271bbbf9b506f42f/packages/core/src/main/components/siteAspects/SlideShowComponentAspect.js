define(['lodash', 'core/core/siteAspectsRegistry'], function (_, siteAspectsRegistry) {
    'use strict';

    /**
     *
     * @param {SiteAspectSiteAPI} aspectSiteAPI
     * @constructor
     */
    function SlideShowComponentAspect(aspectSiteAPI) {
        this._aspectSiteAPI = aspectSiteAPI;
        this.callbacks = [];
    }

    SlideShowComponentAspect.prototype = {

        /**
         * reports that the particular slide show component has switched to another slide
         *
         * @param {string} listenerId
         */
        reportSlideChange: function(slideShowCompId){
            this._aspectSiteAPI.notifyAspects('slideChange', slideShowCompId);
            var onCompleteCallback = this.callbacks.shift();
            if (onCompleteCallback) {
                onCompleteCallback();
            }
        },

        registerOnSlideChangeComplete: function(callback) {
            if (callback) {
                this.callbacks.push(callback);
            }
        }
    };

    siteAspectsRegistry.registerSiteAspect('SlideShowComponentAspect', SlideShowComponentAspect);
    return SlideShowComponentAspect;
});
