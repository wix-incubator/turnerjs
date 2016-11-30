define(['lodash', 'utils'], function(_, utils) {
    'use strict';

    var createWorkerIframe = function(id, src, handler) {
        var _appsContainer = window.document.createElement('iframe');
        _appsContainer.id = id;
        _appsContainer.src = src;
        _appsContainer.onload = function() {
            window.addEventListener('message', handler);
        };
        _appsContainer = window.document.body.appendChild(_appsContainer);
        return _appsContainer;
    };

    function parseAppSources(appSources) {
        return _(appSources || '')
            .split(',')
            .map(function(appSource) {
                return appSource.split(':');
            })
            .zipObject()
            .value();
    }


    var getAppsContainerUrl = function(ps) {
        var hasDebugQueryParam = ps.siteAPI.hasDebugQueryParam();
	    var reactSource = utils.urlUtils.parseUrlParams(window.location.search).ReactSource;
        var isLocal = reactSource === 'http://localhost';
        var versionFromUrl = parseAppSources(ps.dal.getByPath(['currentUrl', 'query', 'editorPlatformAppSources'])).iframeVersion;
        versionFromUrl = versionFromUrl || reactSource;
        var serviceTopology = ps.pointers.general.getServiceTopology();
        var scriptsLocationMap = ps.dal.get(ps.pointers.getInnerPointer(serviceTopology, 'scriptsLocationMap'));
        var baseUrl = isLocal ? 'http://localhost/' : getUrlVersionOrLatest(versionFromUrl, _.get(scriptsLocationMap, 'santa'));

        var appsContainerUrl = utils.urlUtils.joinURL(baseUrl, '/static/platform/target/index' + (hasDebugQueryParam ? '.debug' : '') + '.html');
        return appsContainerUrl;
    };

    var getUrlVersionOrLatest = function (version, latestFullUrl) {
        if (version) {
            var regex = /\/([\d\.]*)$/;
            return latestFullUrl.replace(regex, '/' + version);
        }
        return latestFullUrl;

    };

    return {
        createWorkerIframe: createWorkerIframe,
        getAppsContainerUrl: getAppsContainerUrl
    };
});
