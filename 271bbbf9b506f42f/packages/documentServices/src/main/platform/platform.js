define([
    'lodash',
    'documentServices/siteMetadata/clientSpecMap',
    'documentServices/platform/services/workerService',
    'documentServices/platform/services/sdkAPIService',
    'documentServices/wixCode/services/wixCodeModelService',
    'documentServices/platform/services/platformAppDataGetter',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/tpa/utils/provisionUtils',
    'documentServices/platform/common/constants'
], function (_,
             clientSpecMap,
             workerService,
             sdkAPIService,
             wixCodeModelService,
             platformAppDataGetter,
             clientSpecMapService,
             provisionUtils,
             constants) {
    'use strict';

    function init(ps, api) {
        initBasePaths(ps);
        workerService.init(ps, api);
    }

    function initBasePaths(ps) {
        var platformPointer = ps.pointers.platform.getPlatformPointer();
        var pagesPlatformApplicationsPointer = ps.pointers.platform.getPagesPlatformApplicationsPointer();

        ps.dal.full.set(platformPointer, {
            appState: {},
            appManifest: {}
        });

        if (!ps.dal.full.isExist(pagesPlatformApplicationsPointer)) {
            ps.dal.full.set(pagesPlatformApplicationsPointer, {});
        }
    }

    function getInstalledAppsData(ps) { // later - change to getConnectableAppIds(compRef) which will query the worker about apps that the comp can connect to (according to their manifests)
        var dataBindingAppData = platformAppDataGetter.getAppDataByAppDefId(ps, constants.APPS.DATA_BINDING.appDefId);
        return [dataBindingAppData];
    }

    // TODO: remove temp functions once platform apps provision flow has been decided
    function _tempInitApp(ps, appDefinition) {
        var appData = registerApp(ps, appDefinition);
        workerService.addApp(appData);
        var localApp = _tempGetLocalAppResources(ps);
        if (localApp) {
            workerService.addApp(localApp);
        }
    }

    function registerApp(ps, appDefinition) {
        var currentLargestId = clientSpecMapService.getLargestApplicationId(ps);
        var newId = provisionUtils.generateAppFlowsLargestAppId(currentLargestId);
        var appData = {
            type: 'Application',
            displayName: appDefinition.appDefinitionId,
            appDefinitionId: appDefinition.appDefinitionId,
            applicationId: newId,
            editorUrl: appDefinition.editorUrl,
            platformApp: {
                viewerUrl: appDefinition.viewerUrl
            }
        };
        clientSpecMap.registerAppData(ps, appData);
        return appData;
    }

    function _tempGetLocalAppResources(ps) {
        function parseAppSources(appSources) {
            return _(appSources || '')
                .split(',')
                .map(function (appSource) {
                    return appSource.split(':');
                })
                .zipObject()
                .value();
        }

        var editorLocalApp = 'http://localhost:' +
            parseAppSources(ps.dal.getByPath(['currentUrl', 'query', 'editorPlatformAppSources'])).port + '/' +
            parseAppSources(ps.dal.getByPath(['currentUrl', 'query', 'editorPlatformAppSources'])).path;
        var appId = parseAppSources(ps.dal.getByPath(['currentUrl', 'query', 'editorPlatformAppSources'])).id;

        if (appId) {
            return {
                id: appId,
                url: editorLocalApp
            };
        }
    }

    function notifyApplication(ps, applicationId, options) {
        if (toAddScari(ps, applicationId, options)) {
            options.eventPayload.scari = wixCodeModelService.getScari(ps);
        }

        workerService.triggerEvent(applicationId, options);
    }

    function toAddScari(ps, appId, event) {
        // TODO where do we get these constants?
        var appDefinitionId = _.get(platformAppDataGetter.getAppDataByApplicationId(ps, appId), 'appDefinitionId');
        return appDefinitionId === 'dataBinding' && _.get(event, 'eventType') === 'treeItemSelected';
    }

    function getAPIForSDK(ps, api) {
        return sdkAPIService.getAPIForSDK(api);
    }

    function getAppManifest(ps, applicationId) {
        var appManifestPointer = ps.pointers.platform.getAppManifestPointer(applicationId);
        return ps.dal.get(appManifestPointer);
    }

    function updatePagePlatformApp(ps, pageRef, applicationId, value) {
        var pageId = pageRef.id;
        var pagesPlatformApplicationPointer = ps.pointers.platform.getPagesPlatformApplicationPointer(applicationId);
        var applicationPages = ps.dal.full.get(pagesPlatformApplicationPointer) || {};
        delete applicationPages[pageId];
        if (value) {
            _.set(applicationPages, pageId, true);
        }
        ps.dal.full.set(pagesPlatformApplicationPointer, applicationPages);
    }

    return {
        init: init,
        initApp: _tempInitApp,
        notifyApplication: notifyApplication,
        getAPIForSDK: getAPIForSDK,
        getInstalledAppsData: getInstalledAppsData,
        updatePagePlatformApp: updatePagePlatformApp,
        getAppManifest: getAppManifest,
        getAppDataByAppDefId: platformAppDataGetter.getAppDataByAppDefId,
        getAppDataByApplicationId: platformAppDataGetter.getAppDataByApplicationId
    };
});
