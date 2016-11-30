define(['lodash'], function (_) {
    'use strict';

    function injectRouterPayload(siteData, platformApps, rootIds) {
        if (!siteData) {
            return;
        }
        var dynamicData = siteData.getDynamicPageData();
        if (!dynamicData) {
            return;
        }

        var routerData = dynamicData.routerData;
        var routerDefinition = dynamicData.routerDefinition;
        if (!routerData || !routerDefinition) {
            return;
        }
        var isWixCode = routerDefinition.appDefinitionId === 'wix-code';
        if (isWixCode) {
            _.forEach(rootIds, function (rootId) {
                _.forEach(platformApps, function (platformApp) {
                    if (platformApp.id === rootId) {
                        platformApp.routerData = routerData;
                    }
                });
            });
        } else {
            var appDefinition = _.find(platformApps, {'id': routerDefinition.appDefinitionId});
            if (appDefinition) {
                appDefinition.routerData = routerData;
            }
        }
    }

    function filterWixCode(specs) {
        var isWixCodeSpec = {displayName: 'siteextension'};
        return _(specs)
            .reject(isWixCodeSpec)
            .map(function (spec) {
                return _.assign({type: 'Application'}, spec);
            })
            .value();
    }

    function addWixCodeDef(specs, isWixCodeSpec, rootIds, siteData, platformApps) {
        if (_.find(specs, isWixCodeSpec)) {
            var shouldLoadMasterPage = siteData.isPlatformAppOnPage('masterPage', 'wixCode');
            _.forEach(rootIds, function (rootId) {
                var shouldLoadPageCode = siteData.isPlatformAppOnPage(rootId, 'wixCode');
                var pageData = siteData.getDataByQuery(rootId);
                var isPopup = pageData.isPopup;
                if (shouldLoadPageCode) {
                    platformApps.push({
                        id: rootId,
                        type: isPopup ? 'Popup' : 'Page',
                        displayName: siteData.getPageTitle(rootId)
                    });
                }
                if (!isPopup && shouldLoadMasterPage) {
                    platformApps.push({
                        id: rootId,
                        type: 'masterPage'
                    });
                }
            });
        }
    }

    function getApplicationsToLoad(rootIds, siteData, specs) {//TODO Shahar - move to plugin
        rootIds = _.without(rootIds, 'masterPage');
        var isWixCodeSpec = {displayName: 'siteextension'};
        var platformApps = filterWixCode(specs);
        addWixCodeDef(specs, isWixCodeSpec, rootIds, siteData, platformApps);
        injectRouterPayload(siteData, platformApps, rootIds);
        return platformApps;
    }

    function joinURL() {
        /*eslint strict:0 */
        var url = arguments[0];
        for (var i = 1; i < arguments.length; ++i) {
            url = url.replace(/\/$/, '') + '/' + arguments[i].replace(/^\//, '');
        }
        return url;
    }


    function getArtifactUrl(serviceTopology, artifactName, version) {
        var artifactPath = joinURL(serviceTopology.scriptsDomainUrl, 'services', artifactName);
        if (version) {
            return joinURL(artifactPath, version);
        }

        return serviceTopology.scriptsLocationMap[artifactName];
    }


    function addLocalApps(viewerPlatformAppVersions, applications) {
        var viewerLocalApp = 'http://localhost:' + viewerPlatformAppVersions.port + '/' + viewerPlatformAppVersions.path;
        var localAppId = viewerPlatformAppVersions.id;

        if (localAppId) {
            applications.push({
                type: 'Application',
                id: localAppId,
                url: viewerLocalApp,
                displayName: localAppId
            });
        }
    }

    function addSiteExtensionsApps(clientSpecMap, applications, serviceTopology, viewerPlatformAppVersions) {
        if (_.find(clientSpecMap, {type: 'siteextension'}) && !_.find(applications, {id: 'dataBinding'})) {
            applications.push({
                type: 'Application',
                id: 'dataBinding',
                url: joinURL(getArtifactUrl(serviceTopology, 'dbsm-viewer-app', viewerPlatformAppVersions.dataBinding), '/app.js'),
                displayName: 'Data Binding'
            });
        }
    }

    function getApplicationsFromClientSpecMap(clientSpecMap) {
        return _(clientSpecMap)
            .filter(function (clientSpec) {
                return clientSpec.type === 'siteextension' || _.get(clientSpec, 'platformApp.viewerUrl');
            })
            .map(function (clientSpec) {
                var applicationData = {
                    id: clientSpec.appDefinitionId,
                    displayName: clientSpec.type,
                    appInnerId: clientSpec.applicationId
                };
                var appViewerUrl = _.get(clientSpec, 'platformApp.viewerUrl');
                if (appViewerUrl) {
                    applicationData.url = appViewerUrl;
                }
                return applicationData;
            })
            .value();
    }

    function getAllApps(clientSpecMap, viewerPlatformAppSources, serviceTopology) {
        var applications = getApplicationsFromClientSpecMap(clientSpecMap);
        var viewerPlatformAppVersions = parseAppSources(viewerPlatformAppSources);
        addLocalApps(viewerPlatformAppVersions, applications);
        addSiteExtensionsApps(clientSpecMap, applications, serviceTopology, viewerPlatformAppVersions);
        return applications;
    }

    function getAppsBaseInfo(clientSpecMap, serviceTopology, viewerPlatformAppSources) {
        var applications = getAllApps(clientSpecMap, viewerPlatformAppSources, serviceTopology);
        return _.filter(filterWixCode(applications), 'url');
    }

    function getApplications(clientSpecMap, rootIds, siteData) {
        var viewerPlatformAppSources = _.get(siteData, ['currentUrl', 'query', 'viewerPlatformAppSources']);
        var applications = getAllApps(clientSpecMap, viewerPlatformAppSources, siteData.serviceTopology);
        return getApplicationsToLoad(rootIds, siteData, applications);
    }

    function parseAppSources(appSources) {
        return _(appSources || '')
            .split(',')
            .map(function (appSource) {
                return appSource.split(':');
            })
            .zipObject()
            .value();
    }

    return {
        getApplications: getApplications,
        getAppsBaseInfo: getAppsBaseInfo
    };
});
