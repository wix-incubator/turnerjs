define(['lodash', 'core/core/siteAspectsRegistry'], function(_, siteAspectsRegistry) {
    "use strict";

    var isBrowser = typeof window !== 'undefined';

    function getDynamicApiUrl(siteBaseUrl) {
        var url = siteBaseUrl.replace(/\/$/, '') + '/_api/dynamicmodel';
        if (isBrowser) {
            url = url.replace(/^[^:]+:/, window.location.protocol);
        }
        return url;
    }

    var cache = true;
    function reloadClientSpecMap(siteData, callback, force) {
        var status = 'error';
        var reqDesc = {
            url: getDynamicApiUrl(siteData.getExternalBaseUrl()),
            destination: ['dynamicClientSpecMapLoaded'],
            force: force,
            cache: cache,
            syncCache: true,
            transformFunc: function() {
                return true;
            },
            callback: function(val, response) {
                status = 'success';
                if (response.clientSpecMap) {
                    siteData.rendererModel.clientSpecMap = response.clientSpecMap;
                }
                if (response.svSession) {
                    siteData.pubSvSession(response.svSession);
                }
                if (response.hs) {
                    siteData.setHubSecurityToken(response.hs);
                }
                if (response.ctToken) {
                    siteData.setCTToken(response.ctToken);
                }
                if (callback) {
                    callback(response);
                }
            }
        };
        siteData.store.loadBatch([reqDesc], function () {
            if (status === 'error') {
                callback({status: status});
            }
        });
        cache = false;
    }

    /**
     *
     * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
     * @constructor
     */
    function DynamicClientSpecMapAspect(aspectSiteAPI) {
        var siteData = aspectSiteAPI.getSiteData();

        this.reloadClientSpecMap = function (callback, force) {
            if (siteData && siteData.isViewerMode()) {
                reloadClientSpecMap(siteData, callback, force);
            }
        };
    }

    siteAspectsRegistry.registerSiteAspect('dynamicClientSpecMap', DynamicClientSpecMapAspect);
});
