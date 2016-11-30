define([], function() {
    'use strict';

    function joinURL() {
        var url = arguments[0];
        for (var i = 1; i < arguments.length; ++i) {
            url = url.replace(/\/$/, '') + '/' + arguments[i].replace(/^\//, '');
        }
        return url;
    }

    function isLocalhost(urlBase) {
        return /^https?:\/\/localhost\/?$/.test(urlBase);
    }

    function isValidVersionString(version) {
        return /^\d+\.\d+\.\d+$/.test(version);
    }

    function replaceSantaVersionInRelativePath(santaRelativePath, runtimeSource) {
        var lastSlashIndex = santaRelativePath.lastIndexOf('/');
        return isValidVersionString(runtimeSource) ?
            santaRelativePath.substring(0, lastSlashIndex + 1) + runtimeSource :
            santaRelativePath;
    }

    function getSantaPath(siteModel, runtimeSource) {
        var topology = siteModel.serviceTopology;
        // loading the iframe from localhost is not supported - fallback to production version
        var santaScriptLocation = isLocalhost(siteModel.santaBase) ?
            topology.scriptsLocationMap.santa :
            siteModel.santaBase;
        santaScriptLocation = replaceSantaVersionInRelativePath(santaScriptLocation, runtimeSource);
        return santaScriptLocation.replace(topology.scriptsDomainUrl + 'services/', '');
    }

    function getBaseUrl(siteModel, appDef, debug, runtimeSource) {
        var extensionId = appDef.extensionId;
        var subDomainPrefix = '//' + extensionId + '.';
        var cloudBaseDomain = siteModel.serviceTopology.wixCloudBaseDomain;
        var indexName = debug ? 'index.debug.html' : 'index.html';
        var indexPath = 'static/wixcode/target/' + indexName;
        var santaRelativePath = getSantaPath(siteModel, runtimeSource);
        return subDomainPrefix + joinURL(cloudBaseDomain, '_partials', santaRelativePath, indexPath);
    }

    function toQueryString(queryParams) {
        return Object.keys(queryParams).map(function(queryKey) {
            return encodeURIComponent(queryKey) + '=' + encodeURIComponent(queryParams[queryKey]);
        }).join('&');
    }

    function buildUrl(siteModel, appDef, options) {
        options = options || {};
        var baseUrl = getBaseUrl(siteModel, appDef, options.debug, options.runtimeSource);
        var isViewerMode = !!siteModel.publicModel;
        var queryParams = {
            compId: 'wixCode_' + appDef.appDefinitionId,
            deviceType: options.isMobileView ? 'mobile' : 'desktop',
            viewMode: isViewerMode ? 'site' : siteModel.renderFlags.componentViewMode || 'preview',
            instance: appDef.signature,
            locale: siteModel.rendererModel.languageCode
        };
        if (options.sdkSource) {
            queryParams.sdkSource = options.sdkSource;
        }
        if (options.applications) {
            queryParams.applications = JSON.stringify(options.applications);
        }
        var queryString = toQueryString(queryParams);
        return baseUrl + '?' + queryString;
    }

    return {
        buildUrl: buildUrl
    };
});
