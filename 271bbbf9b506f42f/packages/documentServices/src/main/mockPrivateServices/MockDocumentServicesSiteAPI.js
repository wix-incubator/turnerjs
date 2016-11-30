/*eslint santa/no-getSiteData:0 */
define(['lodash', 'documentServices/siteAccessLayer/DocumentServicesSiteAPINoSite'], function (_, DocumentServicesSiteAPINoSite) {
    'use strict';

    /**
     * @ignore
     * @typedef {MockDocumentServicesSiteAPI} ds.MockDocumentServicesSiteAPI
     */


    /**
     * @ignore
     * @constructor
     * @extends {core.SiteAPI}
     * @param siteData
     * @param siteDataAPI
     */
    function MockDocumentServicesSiteAPI(siteData, siteDataAPI) {
        this.__isBusy = false;
        this.__callbacks = [];
        if (!siteData) {
            return;
        }
        DocumentServicesSiteAPINoSite.call(this, siteData, siteDataAPI, true);
    }

    MockDocumentServicesSiteAPI.prototype = _.create(DocumentServicesSiteAPINoSite.prototype, {
        'constructor': MockDocumentServicesSiteAPI,


        /**
         *
         * @param {function()} callback
         */
        registerToDidLayout: function (callback) {
            this.__callbacks.push(callback);
        },

        unRegisterFromDidLayout: function () {
            this.__callbacks = [];
        },

        didLayoutCallback: function () {
            _.forEach(this.__callbacks, function (callback) {
                callback();
            });
        },

        makeForceUpdateAsync: function () {
            this.isAsyncUpdate = true;
        },

        //forceUpdate is sync in reality
        forceUpdate: function () {
            var self = this;
            this.__isBusy = true;
            function update(){
                self.__isBusy = false;
                _.forEach(self.__callbacks, function (callback) {
                    callback();
                });
            }

            if (this.isAsyncUpdate){
                _.defer(update);
            } else {
                update();
            }
        },

        isSiteBusy: function () {
            return this.__isBusy;
        },

        isSiteBusyIncludingTransition: function () {
            return this.__isBusy;
        },

        isComponentRenderedOnSite: function(){
            return true;
        },
        getSiteAspect: _.noop,
        scrollToAnchor: _.noop,
        registerNavigationComplete: _.noop

    });

    return MockDocumentServicesSiteAPI;
});
