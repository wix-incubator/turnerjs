define(['core', 'lodash'], function(core, _) {
    'use strict';
    var siteAspectsRegistry = core.siteAspectsRegistry;

    function DocumentServicesAspect(aspectSiteApi) {
        if (!aspectSiteApi) {
            // for testing purposes
            return;
        }

        this.siteAPI = aspectSiteApi;
        this.pageChangeCallbacks = [];

        this.siteAPI.registerToUrlPageChange(this.handlePageChange.bind(this));
    }

    DocumentServicesAspect.prototype = {
        handlePageChange: function(evt) {
            _.forEach(this.pageChangeCallbacks, function(callback) {
                callback(evt);
            });
            this.pageChangeCallbacks = [];
        },
        registerToUrlPageChange: function(callback) {
            this.pageChangeCallbacks.push(callback);
        }
    };

    siteAspectsRegistry.registerSiteAspect('DocumentServicesAspect', DocumentServicesAspect);
    return DocumentServicesAspect;
});