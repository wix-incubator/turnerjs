define(['lodash',
    'utils',
    'documentServices/tpa/utils/ProvisionUrlBuilder',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/tpa/utils/tpaUtils',
    'documentServices/tpa/services/pendingAppsService',
    'documentServices/tpa/services/installedTpaAppsOnSiteService',
    'documentServices/tpa/utils/provisionUtils'
], function (_, utils, ProvisionUrlBuilder, clientSpecMapService, metaData, tpaUtils, pendingAppsService, installedTpaAppsOnSiteService, provisionUtils) {

    'use strict';

    //site not save support multiple apps if needed
    var preSaveAddAppsInTemplate = _.template('<%= provisionServerBaseUrl %>/editor/pre-save-add-apps/template/<%= metaSiteId %>?');

    //user site - before save
    var preSaveAddAppInUserSite = _.template('<%= provisionServerBaseUrl %>/editor/pre-save-add-app/<%= metaSiteId %>?appDefId=<%= appDefinitionId %>');

    var settleTemplate = _.template('<%= provisionServerBaseUrl %>/editor/settle/<%= metaSiteId %>?context=<%= context %>&editorSessionId=<%= editorSessionId %>');

    var provisionAppFromSourceTemplateUrlTemplate = _.template('<%= provisionServerBaseUrl %>/editor/provision-from-source-template/<%= metaSiteId %>?appDefId=<%= appDefinitionId %>&sourceTemplateId=<%= sourceTemplateId %>');

    var context = {
        save: 'save',
        load: 'load',
        firstSave: 'firstSave'
    };

    var handleServerResponse = function (ps, response, onSuccess) {
        var newAppsData = response.payload;
        _.forEach(newAppsData, function(newAppData) {
            onProvisionComplete(ps, newAppData);
            if (onSuccess) {
                onSuccess(newAppData);
            }
        });
    };

    var preSaveAddApp = function (ps, appDefinitionId, onSuccess, onError) {
        if (!tpaUtils.isSiteSaved(ps)) {
            var onComplete = function(response) {
                if (response && response.success) {
                    handleServerResponse(ps, response, onSuccess);
                } else {
                    //TODO - report BI?
                }
            };

            preSaveAddApps(ps, [appDefinitionId], onComplete, onError);
        } else {
            var metaSiteId = metaData.getProperty(ps, metaData.PROPERTY_NAMES.META_SITE_ID);
            var baseUrl = buildProvisionUrl(ps, preSaveAddAppInUserSite, appDefinitionId, metaSiteId);

            var url = new ProvisionUrlBuilder(baseUrl)
                .addAcceptJson()
                .build();

            doRequest(ps, url, 'GET', {}, onSuccess, onError);
        }
    };

    var provisionAppFromSourceTemplate = function (ps, appDefinitionId, sourceTemplateId, onSuccess, onError) {
        if (!tpaUtils.isSiteSaved(ps)) {
            onError({success : false});
        } else {
            provisionAppFromSourceTemplateImp(ps, appDefinitionId, sourceTemplateId, onSuccess, onError);
        }
    };

    var provisionAppFromSourceTemplateImp = function (ps, appDefinitionId, sourceTemplateId, onSuccess, onError) {
        var metaSiteId = metaData.getProperty(ps, metaData.PROPERTY_NAMES.META_SITE_ID);
        var pointer = ps.pointers.general.getServiceTopology();
        var provisionServerTopology = ps.dal.get(ps.pointers.getInnerPointer(pointer, 'appStoreUrl'));

        var baseUrl = provisionAppFromSourceTemplateUrlTemplate({
            provisionServerBaseUrl: provisionServerTopology,
            metaSiteId: metaSiteId,
            appDefinitionId: appDefinitionId,
            sourceTemplateId: sourceTemplateId
        });

        var url = new ProvisionUrlBuilder(baseUrl)
            .addAcceptJson()
            .build();

        doRequest(ps, url, 'POST', {}, onSuccess, onError);
    };

    var preSaveAddApps = function(ps, appDefinitionIds, onSuccess, onError) {
        var metaSiteId = metaData.getProperty(ps, metaData.PROPERTY_NAMES.META_SITE_ID);

        var pointer = ps.pointers.general.getServiceTopology();
        var provisionServerTopology = ps.dal.get(ps.pointers.getInnerPointer(pointer, 'appStoreUrl'));

        var baseUrl = preSaveAddAppsInTemplate({
            provisionServerBaseUrl: provisionServerTopology,
            metaSiteId: metaSiteId
        });

        var url = new ProvisionUrlBuilder(baseUrl)
            .addAcceptJson()
            .build();

        var data = {
            guids: appDefinitionIds
        };


        doRequest(undefined, url, 'POST', data, onSuccess, onError);
    };

    var preSaveAddAppsOnLoad = function(ps) {
        if (tpaUtils.isSiteSaved(ps)) {
            return;
        }

        var onComplete = function(response) {
            if (response && response.success) {
                handleServerResponse(ps, response);
            } else {
                //TODO - report BI?
            }
        };

        var onError = function() {
            //TODO - report BI?
        };

        var appsDefIdToProvisionOnSaveSite = installedTpaAppsOnSiteService.getAppsDefIdToProvisionOnSiteLoad(ps);
        if (!_.isEmpty(appsDefIdToProvisionOnSaveSite)) {
            preSaveAddApps(ps, appsDefIdToProvisionOnSaveSite, onComplete, onError);
        }
    };

    var getLastPagesDataThatWereUpdated = function(lastImmutablePagesData, updatedPages) {
        var pageIds = _.keys(updatedPages);
        return lastImmutablePagesData
            .filter(function(immutablePageData) {
                var lastPageId = immutablePageData.getIn(['structure', 'id']);
                return _.includes(pageIds, lastPageId);
            })
            .toJS();
    };

    var settleOnSave = function (lastImmutableSnapshot, currentImmutableSnapshot, firstSave, onSuccess, onError) {
        var saveContext = context.save;
        var currentImmutablePagesData = currentImmutableSnapshot.get('pagesData');
        var updatedPages, areTpaCompsWereUnInstalled = false;

        if (firstSave) {
            saveContext = context.firstSave;
        } else {
            var lastImmutablePagesData = lastImmutableSnapshot.get('pagesData');
            updatedPages = extractUpdatedPages(lastImmutablePagesData, currentImmutablePagesData);
            var deletedPages = extractDeletedPages(lastImmutablePagesData, currentImmutablePagesData);
            var lastPagesDataThatWereUpdated = getLastPagesDataThatWereUpdated(lastImmutablePagesData, updatedPages);

            areTpaCompsWereUnInstalled = installedTpaAppsOnSiteService.areTpaCompsWereUnInstalled(lastPagesDataThatWereUpdated, updatedPages, deletedPages);
        }

        // on first save we need to go over all pages
        if (firstSave || areTpaCompsWereUnInstalled) {
            settleImpForAllPages(currentImmutableSnapshot, currentImmutablePagesData.toJS(), saveContext, onSuccess, onError);
        } else {
            settleImpForUpdatedPages(currentImmutableSnapshot, updatedPages, saveContext, onSuccess, onError);
        }
    };


    var settleImpForUpdatedPages = function(currentImmutableSnapshot, updatedPages, saveContext, onSuccess, onError) {
        var url = buildBaseUrl(currentImmutableSnapshot, saveContext);
        var clientSpecMap = currentImmutableSnapshot.getIn(['rendererModel', 'clientSpecMap']).toJS();
        clientSpecMap = clientSpecMapService.filterApps(clientSpecMap);

        var appIdsInstalledOnUpdatedPages = installedTpaAppsOnSiteService.getAllAppIdsInstalledOnPages(updatedPages);
        var appsToGrant = installedTpaAppsOnSiteService.getAppsToGrantPermissions(clientSpecMap, appIdsInstalledOnUpdatedPages);

        appsToGrant = _.union(_.filter(clientSpecMap, 'notProvisioned'), pendingAppsService.getAppsToAdd(), appsToGrant);

        var appsToAdd = _.reduce(appsToGrant, function(result, value) {
            if (_.includes(appIdsInstalledOnUpdatedPages, value.applicationId.toString()) ||
                clientSpecMapService.isDemoAppAfterProvision(value)) {
                return result.concat([{
                    type: 'add',
                    appDefId: value.appDefinitionId,
                    applicationId: value.applicationId.toString(),
                    instanceId: value.instanceId
                }]);
            }
            return result;
        }, []);

        var appsToDismiss = _.map(pendingAppsService.getAppsToDismiss(), function(appDefId) {
            return {
                type: 'dismiss',
                appDefId: appDefId
            };
        });

        var data = {
            actions: _.union(appsToAdd, appsToDismiss)
        };

        if (_.size(data.actions) > 0 || saveContext === context.firstSave) {
            doRequest(undefined, url, 'POST', data, onSuccess, onError);
        } else {
            onSuccess();
        }
    };



    var pageStructureChanged = function(lastImmutablePagesData, currentImmutablePage, pageId) {
        var currentImmutablePageStructure = currentImmutablePage.get('structure');
        return !lastImmutablePagesData && currentImmutablePageStructure || !currentImmutablePageStructure.equals(lastImmutablePagesData.getIn([pageId, 'structure']));
    };

    var extractUpdatedPages = function(lastImmutablePagesData, currentImmutablePagesData) {
        return currentImmutablePagesData
            .filter(pageStructureChanged.bind(null, lastImmutablePagesData))
            .toJS();
    };

    var extractDeletedPages = function(lastImmutablePagesData, currentImmutablePagesData) {
        return lastImmutablePagesData
            .filter(pageDeleted.bind(null, currentImmutablePagesData))
            .toJS();
    };

    var pageDeleted = function(currentImmutablePagesData, lastImmutablePage, pageId) {
        return !currentImmutablePagesData.getIn([pageId, 'structure']);
    };


    var settleOnLoad = function (ps) {
        var onSuccess = function(response) {
            if (response && response.success) {
                clientSpecMapService.setAppsData(ps, response.payload.clientSpecMap);
            } else {
                //TODO - report BI?
            }
        };

        var onError = function () {
            //TODO - report BI?
        };

        var immutableSiteData = ps.dal.full.immutable.getInitialSnapshot();
        var pagesData = immutableSiteData.get('pagesData').toJS();

        settleImpForAllPages(immutableSiteData, pagesData, context.load, onSuccess, onError);
    };

    var buildBaseUrl = function(immutableSiteData, settleContext) {
        var provisionBaseUrl = immutableSiteData.getIn(['serviceTopology', 'appStoreUrl']);
        var metaSiteId = immutableSiteData.getIn(['rendererModel', 'metaSiteId']);
        var editorSessionId = immutableSiteData.getIn(['documentServicesModel', 'editorSessionId']);

        var baseUrl = buildSettleUrl(provisionBaseUrl, settleTemplate, metaSiteId, editorSessionId, settleContext);

        return new ProvisionUrlBuilder(baseUrl)
            .addAcceptJson()
            .build();
    };


    var settleImpForAllPages = function (immutableSiteData, pagesData, settleContext, onSuccess, onError) {
        var url = buildBaseUrl(immutableSiteData, settleContext);
        var clientSpecMap = immutableSiteData.getIn(['rendererModel', 'clientSpecMap']).toJS();
        clientSpecMap = clientSpecMapService.filterApps(clientSpecMap);

        var options = {};
        if (settleContext === context.load) {
            options.excludeHybrid = true;
        }

        var appsToGrantAndRevoke = installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(clientSpecMap, pagesData, options);
        var appsToGrant = appsToGrantAndRevoke.grant;
        var appsToRevoke = appsToGrantAndRevoke.revoke;

        if (settleContext !== context.load) {
            appsToGrant = _.union(_.filter(clientSpecMap, 'notProvisioned'), pendingAppsService.getAppsToAdd(), appsToGrant);
        }

        var appsToAdd = _.reduce(appsToGrant, function(result, value) {
            if (!_.find(appsToRevoke, {applicationId: value.applicationId})) {
                return result.concat([{
                    type: 'add',
                    appDefId: value.appDefinitionId,
                    applicationId: value.applicationId.toString(),
                    instanceId: value.instanceId
                }]);
            }
            return result;
        }, []);

        var appsToRemove = _.reduce(appsToRevoke, function(result, value) {
            if (!_.find(appsToGrant, {applicationId: value.applicationId})) {
                return result.concat([{
                    type: 'remove',
                    applicationId: value.applicationId.toString()
                }]);
            }
            return result;
        }, []);

        var appsToDismiss = _.map(pendingAppsService.getAppsToDismiss(), function(appDefId) {
            return {
                type: 'dismiss',
                appDefId: appDefId
            };
        });

        var data = {
            actions: _.union(appsToAdd, appsToRemove, appsToDismiss)
        };

        if (_.size(data.actions) > 0 || settleContext === context.firstSave) {
            doRequest(undefined, url, 'POST', data, onSuccess, onError);
        } else if (settleContext !== context.load) {
            onSuccess();
        }
    };

    var onProvisionComplete = function(ps, resultAppDefinitionData) {
        var resultHasNoApplicationId = _.includes([undefined, -1], resultAppDefinitionData.applicationId);

        if (resultHasNoApplicationId) {
            resultAppDefinitionData.applicationId = getNewApplicationIdStartingFrom1k(ps);
            resultAppDefinitionData.notProvisioned = true;
        } else {
            var existingAppData = clientSpecMapService.getAppDataByAppDefinitionId(ps, resultAppDefinitionData.appDefinitionId);
            var isConvertedFromTemplate = existingAppData && existingAppData.demoMode && !resultAppDefinitionData.demoMode;
            if (pendingAppsService.isPremiumPendingApp(ps, resultAppDefinitionData.applicationId)) {
                pendingAppsService.add(resultAppDefinitionData);
            } else if (isConvertedFromTemplate || !existingAppData) {
                resultAppDefinitionData.notProvisioned = true;
            }
        }

        clientSpecMapService.registerAppData(ps, resultAppDefinitionData);
        ps.setOperationsQueue.executeAfterCurrentOperationDone(function () {
            if (tpaUtils.isTpaByAppType(resultAppDefinitionData.type)) {
                provisionUtils.cacheAppMarketDataAfterProvision(ps, resultAppDefinitionData);
            }
        });
    };

    var onProvisionCallback = function (ps, onSuccess, result) {
        var resultAppDefinitionData = result.payload;
        onProvisionComplete(ps, resultAppDefinitionData);
        onSuccess(resultAppDefinitionData);
    };

    var getNewApplicationIdStartingFrom1k = function (ps) {
        var currentLargestId = clientSpecMapService.getLargestApplicationId(ps);
        var newGeneratedApplicationId = provisionUtils.generateAppFlowsLargestAppId(currentLargestId);
        return newGeneratedApplicationId;
    };

    var buildProvisionUrl = function (ps, template, appDefinitionId, metaSiteId) {
        var pointer = ps.pointers.general.getServiceTopology();
        var provisionServerTopology = ps.dal.get(ps.pointers.getInnerPointer(pointer, 'appStoreUrl'));

        return template({
            provisionServerBaseUrl: provisionServerTopology,
            metaSiteId: metaSiteId,
            appDefinitionId: appDefinitionId
        });
    };

    var buildSettleUrl = function (provisionBaseUrl, template, metaSiteId, editorSessionId, settleContext) {
        return template({
            provisionServerBaseUrl: provisionBaseUrl,
            metaSiteId: metaSiteId,
            editorSessionId: editorSessionId,
            context: settleContext
        });
    };

    var doRequest = function (ps, url, type, data, onSuccess, onError) {
        var params = {
            type: type,
            url: url,
            dataType: 'json',
            contentType: 'application/json',
            success: function(response){
                if (ps) {
                    onProvisionCallback(ps, onSuccess, response);
                } else {
                    onSuccess(response);
                }
            },
            error: onError
        };


        if (data && !_.isEmpty(data)) {
            params.data = JSON.stringify(data);
        }

        utils.ajaxLibrary.ajax(params);
    };

    return {
        preSaveAddApp: preSaveAddApp,
        settleOnSave: settleOnSave,
        settleOnLoad: settleOnLoad,
        preSaveAddAppsOnLoad: preSaveAddAppsOnLoad,
        provisionAppFromSourceTemplate: provisionAppFromSourceTemplate
    };
});
