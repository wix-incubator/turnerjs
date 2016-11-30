define(['lodash',
    'utils',
    'documentServices/dataModel/dataModel',
    'documentServices/component/component',
    'documentServices/tpa/services/installedTpaAppsOnSiteService',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/tpa/services/tpaEventHandlersService'
], function(_, utils, dataModel, component, installedTpaAppsOnSiteService, clientSpecMapService, tpaEventHandlersService) {

    'use strict';

    var SCOPE = {
        APP: 'APP',
        COMPONENT: 'COMPONENT'
    };

    var MAX_SIZE_FOR_APP = 1000;
    var MAX_SIZE_FOR_COMP = 400;
    var MAX_SIZE_FOR_SUPER_APP_COMP = 2000;

    var PREFIX_TPA_DATA_ID = 'tpaData-';

    var setValue = function(ps, compPointer, key, value, scope, callback) {
        if (!isValidValue(value)) {
            handleFailure(callback, 'Invalid value: value should be of type: string, boolean, number or Json');
            return;
        }

        var compData = component.data.get(ps, compPointer);
        var componentTpaData = getCompTpaData(compData);

        var appTpaData = getAppTpaData(ps, compData.applicationId);

        if (isAppScope(scope)) {
            setAppValue(ps, appTpaData, componentTpaData, key, value, callback, compData.applicationId);
        } else {
            setComponentValue(ps, appTpaData, componentTpaData, compPointer, key, value, callback);
        }
    };


    // TODO : remove once santa-editor is deployed with new data api
    var getValueOldAPI = function(ps, compPointer, key, scope, callback) {
        var compData = component.data.get(ps, compPointer);
        var returnObj;

        if (isAppScope(scope)) {
            var appTpaData = getAppTpaData(ps, compData.applicationId);
            returnObj = appTpaData ? _.pick(appTpaData.content, key) : null;
        } else {
            var compTpaData = getCompTpaData(compData);
            returnObj = compTpaData ? _.pick(compTpaData.content, key) : null;
        }

        if (!_.isEmpty(returnObj)) {
            callback(returnObj);
        } else {
            handleFailure(callback, 'key ' + key + ' not found in ' + scope + ' scope');
        }
    };

    var getMulti = function(ps, compPointer, keys, scope, callback) {
        var compData = component.data.get(ps, compPointer);
        var result;

        keys = _.uniq(keys);

        if (isAppScope(scope)) {
            var appTpaData = getAppTpaData(ps, compData.applicationId);
            result = appTpaData ? _.pick(appTpaData.content, keys) : null;
        } else {
            var compTpaData = getCompTpaData(compData);
            result = compTpaData ? _.pick(compTpaData.content, keys) : null;
        }

        var keysString = _.map(keys, function(key) {return key + '';});
        if (!_.isEmpty(result) && _(result).keys().isEqual(keysString)) {
            callback(result);
        } else {
            var resultKeys = _.keys(result);
            var keysNotFound = _(resultKeys).xor(keys).intersection(keys).value();
            handleFailure(callback, 'keys ' + keysNotFound + ' not found in ' + scope + ' scope');
        }
    };



    var getCompTpaData = function(compData) {
        var componentTpaData = compData.tpaData;
        if (componentTpaData) {
            componentTpaData.content = componentTpaData.content ? JSON.parse(componentTpaData.content) : {};
        }

        return componentTpaData;
    };

    var setAppValue = function(ps, appTpaData, componentTpaData, key, value, callback, applicationId) {
        var pageId = 'masterPage';

        var tpaDataId = appTpaData ? appTpaData.id : PREFIX_TPA_DATA_ID + applicationId;
        var keyValueObj = addAndReturnKeyValueObj(ps, tpaDataId, appTpaData, pageId, key, value, MAX_SIZE_FOR_APP, 'TPAGlobalData');

        if (!keyValueObj) {
            handleFailure(callback, 'Your app has exceeded the provided ' + MAX_SIZE_FOR_APP + ' bytes storage space');
            return;
        }

        if (callback){
            callback(keyValueObj);
        }

        publicDataUpdated(ps, SCOPE.APP, applicationId, null, keyValueObj);
    };

    var publicDataUpdated = function (ps, scope, applicationId, compId, data) {
        if (scope === SCOPE.APP) {
            var comps = installedTpaAppsOnSiteService.getAllAppCompsByAppId(ps, applicationId);
            _.forEach(comps, function (comp) {
                tpaEventHandlersService.callPublicDataChangedCallback(comp.id, data);
            });
        } else {
            tpaEventHandlersService.callPublicDataChangedCallback(compId, data);
        }
    };

    var setComponentValue = function(ps, appTpaData, componentTpaData, compPointer, key, value, callback) {
        var pageId = ps.pointers.components.getPageOfComponent(compPointer).id;
        var compData = component.data.get(ps, compPointer);

        var tpaDataId = componentTpaData ? componentTpaData.id : utils.guidUtils.getUniqueId(PREFIX_TPA_DATA_ID);
        var appData = clientSpecMapService.getAppData(ps, compData.applicationId);
        var limit = MAX_SIZE_FOR_COMP;
        if (_.get(appData, 'isWixTPA')) {
            limit = MAX_SIZE_FOR_SUPER_APP_COMP;
        }

        var keyValueObj = addAndReturnKeyValueObj(ps, tpaDataId, componentTpaData, pageId, key, value, limit, 'TPAData');

        if (!keyValueObj) {
            handleFailure(callback, 'Your app has exceeded the provided ' + limit + ' chars storage space');
            return;
        }

        compData.tpaData = '#' + tpaDataId;
        component.data.update(ps, compPointer, compData);

        if (callback){
            callback(keyValueObj);
        }

        publicDataUpdated(ps, SCOPE.COMPONENT, compData.applicationId, compPointer.id, keyValueObj);
    };

    var getAppValue = function(ps, applicationId, key, callback) {
        var appTpaData = getAppTpaData(ps, applicationId);

        getValue(key, appTpaData, callback, SCOPE.APP);
    };

    var getComponentValue = function(ps, compPointer, key, callback) {
        var compData = component.data.get(ps, compPointer);
        var compTpaData = getCompTpaData(compData);

        getValue(key, compTpaData, callback, SCOPE.COMPONENT);
    };

    var getValue = function(key, tpaData, callback, scope) {
        var returnObj = tpaData ? _.pick(tpaData.content, key) : null;

        if (!_.isEmpty(returnObj)) {
            callback(returnObj);
        } else {
            handleFailure(callback, 'key ' + key + ' not found in ' + scope + ' scope');
        }
    };

    var getAppValues = function(ps, applicationId, keys, callback) {
        keys = _.uniq(keys);

        var appTpaData = getAppTpaData(ps, applicationId);
        var result = appTpaData ? _.pick(appTpaData.content, keys) : null;

        getValues(keys, result, callback, SCOPE.APP);
    };

    var getComponentValues = function(ps, compPointer, keys, callback) {
        var compData = component.data.get(ps, compPointer);
        keys = _.uniq(keys);

        var compTpaData = getCompTpaData(compData);
        var result = compTpaData ? _.pick(compTpaData.content, keys) : null;

        getValues(keys, result, callback, SCOPE.COMPONENT);
    };

    var removeValue = function(ps, compPointer, key, scope, callback) {
        var compData = component.data.get(ps, compPointer);

        if (isAppScope(scope)) {
            var appTpaData = getAppTpaData(ps, compData.applicationId);
            remove(ps, appTpaData, key, 'masterPage', callback, scope);
        } else {
            var pageId = ps.pointers.components.getPageOfComponent(compPointer).id;
            var compTpaData = getCompTpaData(compData);
            remove(ps, compTpaData, key, pageId, callback, scope);
        }
    };

    var remove = function(ps, tpaData, key, pageId, callback, scope) {
        if (isKeyExists(tpaData, key)) {
            var resultObj = _.pick(tpaData.content, key);
            tpaData.content = JSON.stringify(_.omit(tpaData.content, key));
            dataModel.addSerializedDataItemToPage(ps, pageId, tpaData, tpaData.id);
            callback(resultObj);
        } else {
            handleFailure(callback, 'key ' + key + ' not found in ' + scope + ' scope');
        }
    };

    var getValues = function(keys, result, callback, scope) {
        var keysString = _.map(keys, function(key) {return key + '';});
        if (!_.isEmpty(result) && _(result).keys().isEqual(keysString)) {
            callback(result);
        } else {
            var resultKeys = _.keys(result);
            var keysNotFound = _(resultKeys).xor(keys).intersection(keys).value();
            handleFailure(callback, 'keys ' + keysNotFound + ' not found in ' + scope + ' scope');
        }
    };

    var handleFailure = function(callback, message) {
        callback({
            error: {
                'message': message
            }
        });
    };

    var isAppScope = function(scope) {
        return scope === SCOPE.APP;
    };

    var isValidSize = function(tpaDataContent, maxSize) {
        try {
            if (tpaDataContent.length > maxSize) {
                return false;
            }

            return true;
        } catch (e) {
            return false;
        }
    };

    var isValidValue = function(value) {
        if (_.isBoolean(value) || _.isString(value) || _.isNumber(value) || _.isPlainObject(value)) {
            return true;
        }

        return false;

    };

    var isKeyExists = function(tpaData, key) {
        if (!tpaData) {
            return false;
        }

        return _(tpaData.content).keys().includes(key.toString());
    };

    var getAppTpaData = function(ps, applicationId) {
        var appTpaDataId = PREFIX_TPA_DATA_ID + applicationId;
        var dataPointer = ps.pointers.data.getDataItem(appTpaDataId, 'masterPage');
        var tpaData = ps.dal.get(dataPointer);
        if (tpaData) {
            tpaData.content = tpaData.content ? JSON.parse(tpaData.content) : {};
        }
        return tpaData;
    };

    var addAndReturnKeyValueObj = function(ps, tpaDataId, tpaData, pageId, key, value, maxSize, type) {
        if (!tpaData) {
            tpaData = {
                type: type,
                id: tpaDataId,
                content: {}
            };
        }

        tpaData.content[key] = value;
        var tpaDataContent = tpaData.content;

        var tpaDataContentAsString = JSON.stringify(tpaData.content);

        if (!isValidSize(tpaDataContentAsString, maxSize)){
            return null;
        }

        tpaData.content = tpaDataContentAsString;
        dataModel.addSerializedDataItemToPage(ps, pageId, tpaData, tpaData.id);
        return _.pick(tpaDataContent, key);
    };


    var isExistsAppTpaData = function(ps, tpaDataId) {
        var dataPointer = ps.pointers.data.getDataItem(tpaDataId, 'masterPage');
        if (ps.dal.isExist(dataPointer)) {
           return true;
        }
        return false;
    };

    // TODO: add test
    var getOrphanAppTpaData = function(ps) {
        var deletedAppsIds = installedTpaAppsOnSiteService.getDeletedAppsIds(ps);
        return _(deletedAppsIds).map(function(applicationId) {
            return PREFIX_TPA_DATA_ID + applicationId;
        }).filter(function(tpaDataId){
            return isExistsAppTpaData(ps, tpaDataId);
        }).value();
    };

    var runGarbageCollection = function(ps) {
        var orphanTpaData = getOrphanAppTpaData(ps);

        if (!_.isEmpty(orphanTpaData)) {
            var orphanDataNodes = ps.dal.get(ps.pointers.general.getOrphanPermanentDataNodes());
            orphanDataNodes = orphanDataNodes.concat(orphanTpaData);

            ps.dal.set(ps.pointers.general.getOrphanPermanentDataNodes(), orphanDataNodes);
            _.forEach(orphanTpaData, removeTpaData.bind(null, ps));
        }
    };

    var removeTpaData = function(ps, tpaDataId) {
        ps.dal.remove(ps.pointers.data.getDataItem(tpaDataId, 'masterPage'));
    };

    return {
        set: setValue,
        getAppValue: getAppValue,
        getAppValues: getAppValues,
        get: getValueOldAPI,
        getMulti: getMulti,
        remove: removeValue,
        getComponentValue: getComponentValue,
        getComponentValues: getComponentValues,
        runGarbageCollection: runGarbageCollection,
        SCOPE: SCOPE
    };

});
