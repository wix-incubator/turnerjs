define(['lodash',
    'utils',
    'documentServices/tpa/utils/ProvisionUrlBuilder',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/tpa/services/experimentService',
    'documentServices/tpa/services/appStoreService',
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/tpa/utils/tpaUtils',
    'documentServices/tpa/utils/provisionUtils'
], function (_, utils, ProvisionUrlBuilder, clientSpecMapService, experimentService, appStoreService, metaData, tpaUtils, provisionUtils) {

    'use strict';

    //site not save
    var demoPreSaveProvision = _.template('<%= provisionServerBaseUrl %>/appStore/demo/pre-save-provision/<%= metaSiteId %>/<%= applicationId %>');
    var preSaveProvision = _.template('<%= provisionServerBaseUrl %>/appStore/pre-save-provision/<%= appDefinitionId %>');

    //site first save
    var completeSaveProvision = _.template('<%= provisionServerBaseUrl %>/appStore/post-save-complete-provision?metaSiteId=<%= metaSiteId %>&editorSessionId=<%= editorSessionId %>');

    //site already saved i.e, real provision
    var postSaveProvision = _.template('<%= provisionServerBaseUrl %>/appStore/provision/<%= appDefinitionId %>');

    //client spec map
    var clientSpecMapTemplate = _.template('<%= provisionServerBaseUrl %>/appStore/spec/<%= metaSiteId %>/<%= applicationId %>');

    var onProvisionCallback = function (ps, onSuccess, result) {
        var resultAppDefinitionData = result.payload;
        var resultHasNoApplicationId = _.includes([undefined, -1], resultAppDefinitionData.applicationId);

        if (resultHasNoApplicationId) {
            resultAppDefinitionData.applicationId = clientSpecMapService.getLargestApplicationId(ps) + 1;
            resultAppDefinitionData.notProvisioned = true;
        } else {
            var existingAppData = clientSpecMapService.getAppDataByAppDefinitionId(ps, resultAppDefinitionData.appDefinitionId);
            var isConvertedFromTemplate = !tpaUtils.isSiteSaved(ps) && existingAppData && existingAppData.demoMode && !resultAppDefinitionData.demoMode;
            if (isConvertedFromTemplate) {
                resultAppDefinitionData.notProvisioned = true;
            }
        }

        clientSpecMapService.registerAppData(ps, resultAppDefinitionData);
        ps.setOperationsQueue.executeAfterCurrentOperationDone(function () {
            if (tpaUtils.isTpaByAppType(resultAppDefinitionData.type)) {
                provisionUtils.cacheAppMarketDataAfterProvision(ps, resultAppDefinitionData);
            }
        });
        onSuccess(resultAppDefinitionData);
    };

    var buildProvisionUrl = function (ps, template, appDefinitionId, applicationId, metaSiteId) {
        var pointer = ps.pointers.general.getServiceTopology();
        var provisionServerTopology = ps.dal.get(ps.pointers.getInnerPointer(pointer, 'appStoreUrl'));

        return template({
            provisionServerBaseUrl: provisionServerTopology,
            appDefinitionId: appDefinitionId,
            applicationId: applicationId,
            metaSiteId: metaSiteId
        });
    };

    var provisionAppAfterSave = function (ps, appDefinitionId, onSuccess, onError) {
        var baseUrl = buildProvisionUrl(ps, postSaveProvision, appDefinitionId);
        var metaSiteId = metaData.getProperty(ps, metaData.PROPERTY_NAMES.META_SITE_ID);

        var url = new ProvisionUrlBuilder(baseUrl)
            .addMetaSiteId(metaSiteId)
            //.addEditorSessionId() //TODO
            .addAcceptJson()
            .build();

        doRequest(ps, url, 'POST', {}, onSuccess, onError);
    };

    //Demo provision post save is a normal post save provision
    var provisionAppDemoAfterSave = function (ps, appDefinitionId, onSuccess, onError) {
        provisionAppAfterSave(ps, appDefinitionId, onSuccess, onError);
    };

    var provisionAppDemoBeforeSave = function (ps, applicationId, onSuccess, onError) {
        var metaSiteId = metaData.getProperty(ps, metaData.PROPERTY_NAMES.META_SITE_ID);
        var baseUrl = buildProvisionUrl(ps, demoPreSaveProvision, null, applicationId, metaSiteId);

        var url = new ProvisionUrlBuilder(baseUrl)
            .addAcceptJson()
            .build();

        doRequest(ps, url, 'POST', {}, onSuccess, onError);
    };

    var provisionAppBeforeSave = function (ps, appDefinitionId, onSuccess, onError) {
        var baseUrl = buildProvisionUrl(ps, preSaveProvision, appDefinitionId);

        var url = new ProvisionUrlBuilder(baseUrl)
            .addAcceptJson()
            .build();

        doRequest(ps, url, 'POST', {}, onSuccess, onError);
    };

    var refreshSpecMap = function (ps, applicationId, metaSiteId, onSuccess, onError) {
        var baseUrl = buildProvisionUrl(ps, clientSpecMapTemplate, null, applicationId, metaSiteId);

        var url = new ProvisionUrlBuilder(baseUrl)
            .addAcceptJson()
            .build();

        doRequest(ps, url, 'GET', undefined, onSuccess, onError);
    };

    var completeProvisionAppsAfterSave = function(provisionBaseUrl, metaSiteId, editorSessionId, clientSpecMap, onSuccess, onError) {
        var baseUrl = completeSaveProvision({
            provisionServerBaseUrl: provisionBaseUrl,
            metaSiteId: metaSiteId,
            editorSessionId: editorSessionId
        });

        var url = new ProvisionUrlBuilder(baseUrl)
            .addAcceptJson()
            .build();

        var appsDataToSend = _.filter(clientSpecMap, 'notProvisioned');

        appsDataToSend = _.filter(appsDataToSend, function(app){
            return !tpaUtils.isTpaByAppType(app.type);
        });

        var apps = _.map(appsDataToSend, function(appData) {
            return {
                appDefinitionId: appData.appDefinitionId,
                applicationId: appData.applicationId.toString(),
                instanceId: appData.instanceId
            };
        });

        if (!_.isEmpty(apps)) {
            var data = {
                apps: apps,
                metaSiteId: metaSiteId
            };

            doRequest(undefined, url, 'POST', data, onSuccess, onError);
        } else {
            onSuccess();
        }
    };

    var provisionAppFromSourceTemplate = function (ps, appDefinitionId, sourceTemplateId, onSuccess, onError) {
        appStoreService.provisionAppFromSourceTemplate(ps, appDefinitionId, sourceTemplateId, onSuccess, onError);
    };

    var doRequest = function (ps, url, type, data, onSuccess, onError) {
        utils.ajaxLibrary.ajax({
            type: type || 'GET',
            url: url,
            data: JSON.stringify(data),
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
        });
    };

    return {
        provisionAppAfterSave: provisionAppAfterSave,
        provisionAppBeforeSave: provisionAppBeforeSave,
        provisionAppDemoAfterSave: provisionAppDemoAfterSave,
        provisionAppDemoBeforeSave: provisionAppDemoBeforeSave,
        completeProvisionAppsAfterSave: completeProvisionAppsAfterSave,
        refreshSpecMap: refreshSpecMap,
        provisionAppFromSourceTemplate: provisionAppFromSourceTemplate
    };
});
