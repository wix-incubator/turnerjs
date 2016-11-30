define(['lodash', 'utils', 'tpa/common/TPABaseUrlBuilder'], function(_, utils, TPABaseUrlBuilder) {
    'use strict';

    var urlUtils = utils.urlUtils;
    var throttledForEach = utils.throttleUtils.throttledForEach;
    var _aspectSiteAPI;

    var getPixelApps = function (specMap) {
        return _.filter(specMap, function(spec) {
            return _.isString(spec.pixelUrl) && spec.permissions && !spec.permissions.revoked;
        });
    };

    var sendRequest = function (url) {
        (new window.Image(0, 0)).src = url;
    };

    var sendRequestsIfNeeded = function () {
        var getCurrentPageUrl = _aspectSiteAPI.getPageUrl.bind(_aspectSiteAPI);
        var apps = getPixelApps(_aspectSiteAPI.getSiteData().getClientSpecMap());
        var urls = _.map(apps, function (app) {
            return new TPABaseUrlBuilder(app.pixelUrl)
                .addMultipleQueryParams({
                    instance: app.instance,
                    page: getCurrentPageUrl(),
                    ck: urlUtils.cacheKiller()
                }).build();
        });

        throttledForEach(
            urls,
            PixelTrackerSiteAspect.sendRequest,
            PixelTrackerSiteAspect.CHUNK_SIZE,
            PixelTrackerSiteAspect.CHUNK_INTERVAL
        );
    };

    function PixelTrackerSiteAspect(aspectSiteAPI) {
        _aspectSiteAPI = aspectSiteAPI;
        _aspectSiteAPI.registerToComponentDidMount(sendRequestsIfNeeded);
        _aspectSiteAPI.registerToUrlPageChange(sendRequestsIfNeeded);
    }

    PixelTrackerSiteAspect.prototype = {
        getReactComponents: function () {
            return null;
        }
    };

    PixelTrackerSiteAspect.sendRequest = sendRequest;
    PixelTrackerSiteAspect.CHUNK_SIZE = 1;
    PixelTrackerSiteAspect.CHUNK_INTERVAL = 100;

    return PixelTrackerSiteAspect;
});
