define(['lodash',
    'bluebird',
    'documentServices/wixCode/utils/utils',
    'documentServices/wixCode/utils/constants',
    'documentServices/wixCode/services/appWriteableState',
    'documentServices/wixCode/services/wixCodeModelService',
    'documentServices/siteMetadata/clientSpecMap',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/tpa/utils/provisionUtils',
    'documentServices/wixCode/services/kibanaReporterWrapper',
    'wixCode',
    'documentServices/wixCode/utils/traceUtils'
], function (
    _,
    Promise,
    wixCodeUtils,
    constants,
    appWriteableState,
    wixCodeModelService,
    clientSpecMap,
    clientSpecMapService,
    tpaProvisionUtils,
    kibana,
    wixCode,
    traceUtils) {

    'use strict';

    var wixCodeProvisionUrlTemplate = _.template('<%= baseUrl %>/api/apps');
    var wixCodeCloneAppUrlTemplate = _.template('<%= baseUrl %>/api/apps/<%= gridAppId %>/clone');
    var wixCodeMarkAppImmutableUrlTemplate = _.template('<%= baseUrl %>/api/apps/<%= gridAppId %>/save');
    var WIX_CODE_APP_STORE_ENDPOINT = '/appStore/wix-code/';
    var WIX_CODE_SAVE_ENDPOINT = 'save';
    var WIX_CODE_NOT_PROVISION_KEY = 'wixCodeNotProvisioned';

    function _extractPayload(response) {
        return response.payload;
    }

    function _registerApp(ps, createAppResult) {
        var currentLargestId = clientSpecMapService.getLargestApplicationId(ps);
        var appDefinition = {
            type: constants.WIX_CODE_SPEC_TYPE,
            appDefinitionId: createAppResult.codeAppId,
            extensionId: createAppResult.codeAppId,
            signature: createAppResult.si || createAppResult.dsi,
            instance: createAppResult.si || createAppResult.dsi,
            instanceId: createAppResult.instanceId,
            applicationId: tpaProvisionUtils.generateAppFlowsLargestAppId(currentLargestId)
        };
        appDefinition[WIX_CODE_NOT_PROVISION_KEY] = true;

        clientSpecMap.registerAppData(ps, appDefinition);

        return appDefinition;
    }

    function _updateWixCodeModel(ps, newAppResult) {
        wixCodeModelService.setScari(ps, newAppResult.scari || newAppResult.dscari);
        wixCodeModelService.setGridAppId(ps, newAppResult.gridAppId);

        return newAppResult;
    }

    function _getWixCodeServiceUrl(ps) {
        var pointer = ps.pointers.general.getServiceTopology();
        return ps.dal.get(ps.pointers.getInnerPointer(pointer, constants.WIX_CODE_SERVICE_URL_KEY));
    }

    function _getAppStoreBaseUrl(snapshot) {
        return wixCodeUtils.extractFromSnapshot(snapshot, ['serviceTopology', 'appStoreUrl']) + WIX_CODE_APP_STORE_ENDPOINT;
    }

    function _doProvision(ps) {
        var params = {
            baseUrl:  _getWixCodeServiceUrl(ps)
        };
        var url = wixCodeProvisionUrlTemplate(params);
        var data = {};

        return wixCodeUtils.sendRequest(url, wixCodeUtils.requestTypes.POST, data)
            .then(_extractPayload)
            .then(_.partial(_updateWixCodeModel, ps))
            .then(_.partial(_setAppWriteable, ps))
            .then(_.partial(_registerApp, ps));
    }

    function _doCloneApp(ps) {
        var params = {
            baseUrl:  _getWixCodeServiceUrl(ps),
            gridAppId: wixCodeModelService.getGridAppId(ps)
        };
        var url = wixCodeCloneAppUrlTemplate(params);
        var request = {
            url: url,
            type: wixCodeUtils.requestTypes.POST,
            contentType: 'application/json',
            headers: {
                'X-Wix-Si': getExistingWixCodeApp(ps).signature,
                'X-Wix-Scari': wixCodeModelService.getScari(ps)
            },
            timeout: 15000
        };

        return wixCodeUtils.sendRequestObj(request)
            .then(_extractPayload)
            .then(_.partial(_updateWixCodeModel, ps))
            .then(_.partial(_setAppWriteable, ps));
    }

    function getExistingWixCodeApp(ps) {
        return _.first(clientSpecMap.filterAppsDataByType(ps, constants.WIX_CODE_SPEC_TYPE));
    }

    function provision(ps) {
        var traceEnd = kibana.trace(ps, {action: 'provision'});
        var existingWixCodeApp = getExistingWixCodeApp(ps);

        if (existingWixCodeApp) {
            traceEnd({message: 'wix code is already provisioned'});

            return Promise.resolve(existingWixCodeApp);
        }

        return _doProvision(ps)
            .then(onProvisionSuccess)
            .catch(onProvisionError);

        function onProvisionSuccess(result) {
            traceEnd({message: result, appId: result.extensionId});
            return result;
        }

        function onProvisionError(error) {
            traceEnd({message: error, level: kibana.levels.ERROR});
            return Promise.reject(error);
        }
    }

    function getMetaSiteId(snapshot){
        return wixCodeUtils.extractFromSnapshot(snapshot, ['rendererModel', 'metaSiteId']);
    }

    function getClientSpecMap(snapshot){
        return wixCodeUtils.extractFromSnapshot(snapshot, ['rendererModel', 'clientSpecMap'], true);
    }

    function save(snapshot, resolve, reject) {
        var traceEnd = wixCode.log.trace(
            traceUtils.getParams(snapshot, 'saveWixCodeApps'),
            traceUtils.getBaseDomain(snapshot));

        var url = _getAppStoreBaseUrl(snapshot) + WIX_CODE_SAVE_ENDPOINT;
        var metaSiteId = getMetaSiteId(snapshot);
        var wixCodeApps = _(snapshot)
                            .thru(getClientSpecMap)
                            .filter(WIX_CODE_NOT_PROVISION_KEY)
                            .map(toRequestForm)
                            .value();

        if (wixCodeApps.length > 0) {
            var body = {
                metaSiteId: metaSiteId,
                codeAppSpec: wixCodeApps[0]
            };

            wixCodeUtils.sendRequest(url, wixCodeUtils.requestTypes.POST, body)
                .then(onSaveSuccess)
                .catch(onSaveError);
        } else {
            traceEnd({message: 'no wix code apps to save'});
            resolve();
        }

        function toRequestForm(appData) {
            return {
                codeAppId: appData.extensionId,
                applicationId: appData.applicationId.toString(),
                instanceId: appData.instanceId,
                signedInstance: appData.signature,
                signedCodeAppInfo: wixCodeUtils.extractFromSnapshot(snapshot, constants.paths.SCARI)
            };
        }

        function onSaveSuccess(serverResponse) {
            traceEnd();
            resolve(serverResponse);
        }

        function onSaveError(error) {
            traceEnd({level: kibana.levels.ERROR, message: error});
            reject(error);
        }
    }

    function _isAppWriteable(ps) {
        var pointer = ps.pointers.wixCode.getIsAppReadOnly();
        return !ps.dal.get(pointer);
    }

    function _setAppWriteable(ps, newAppResult) {
        var pointer = ps.pointers.wixCode.getIsAppReadOnly();
        ps.dal.set(pointer, false);

        return newAppResult;
    }

    function ensureAppIsWriteable(ps) {
        var wixCodeApp = getExistingWixCodeApp(ps);

        if (!wixCodeApp) {
            return Promise.reject(new Error('no wix code app'));
        }

        if (_isAppWriteable(ps)) {
            return Promise.resolve();
        }

        var traceEnd = kibana.trace(ps, {action: 'ensureAppIsWritable'});

        var cloneAppPromise = appWriteableState.getState();
        if (!cloneAppPromise) {
            cloneAppPromise = _doCloneApp(ps).finally(function() {
                appWriteableState.setState(null);
            });
            appWriteableState.setState(cloneAppPromise);
        }
        return cloneAppPromise
            .then(_.ary(traceEnd, 0))
            .catch(onCloneError);

        function onCloneError(error) {
            traceEnd({level: kibana.levels.ERROR, message: error});

            return Promise.reject(error);
        }
    }

    function markAppImmutable(snapshot) {
        var wixCodeApp = _.find(getClientSpecMap(snapshot), {type: constants.WIX_CODE_SPEC_TYPE});

        if (!wixCodeApp) {
            return Promise.reject(new Error('no wix code app'));
        }

        var params = {
            baseUrl: wixCodeUtils.extractFromSnapshot(snapshot, ['serviceTopology', constants.WIX_CODE_SERVICE_URL_KEY]),
            gridAppId: wixCodeUtils.extractFromSnapshot(snapshot, constants.paths.GRID_APP_ID)
        };
        var request = {
            url: wixCodeMarkAppImmutableUrlTemplate(params),
            type: wixCodeUtils.requestTypes.POST,
            headers: {
                'X-Wix-Si': wixCodeApp.signature,
                'X-Wix-Scari': wixCodeUtils.extractFromSnapshot(snapshot, constants.paths.SCARI)
            },
            timeout: 15000
        };

        return wixCodeUtils.sendRequestObj(request);
    }

    function isProvisioned(ps) {
        var existingWixCodeApp = getExistingWixCodeApp(ps);

        return !!existingWixCodeApp;
    }

    return {
        provision: provision,
        save: save,
        ensureAppIsWriteable: ensureAppIsWriteable,
        markAppImmutable: markAppImmutable,
        isProvisioned: isProvisioned
    };
});
