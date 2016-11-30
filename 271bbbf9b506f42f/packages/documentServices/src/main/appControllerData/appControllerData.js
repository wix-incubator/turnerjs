define([
    'lodash',
    'documentServices/dataModel/dataModel',
    'documentServices/platform/common/constants',
    'documentServices/utils/utils'
], function(_, dataModel, constants, dsUtils){
    'use strict';

    var CONTROLLER_TYPE = 'platform.components.AppController';

    function getControllerDataItem(ps, controllerRef) {
        if (dsUtils.getComponentType(ps, controllerRef) !== CONTROLLER_TYPE) {
            throw new Error('controllerRef component type is invalid - should be an AppController');
        }
        return dataModel.getDataItem(ps, controllerRef);
    }

    function getSettings(ps, controllerRef){
        var controllerData = getControllerDataItem(ps, controllerRef);
        return controllerData.settings ? JSON.parse(controllerData.settings) : {};
    }

    function getSettingsIn(ps, controllerRef, path) {
        var settings = getSettings(ps, controllerRef);
        return _.get(settings, path);
    }

    function getName(ps, controllerRef) {
        return _.get(getControllerDataItem(ps, controllerRef), 'name');
    }

    function setControllerDataItem(ps, controllerRef, dataItem) {
        if (dsUtils.getComponentType(ps, controllerRef) !== CONTROLLER_TYPE) {
            throw new Error('controllerRef component type is invalid - should be an AppController');
        }
        dataModel.updateDataItem(ps, controllerRef, dataItem);
    }

    function setSettings(ps, controllerRef, settingsItem) {
        var stringifiedSettings;
        try {
            stringifiedSettings = JSON.stringify(settingsItem);
        } catch (e) {
            throw new Error('Invalid settings item - should be JSON stringifiable');
        }
        setControllerDataItem(ps, controllerRef, {settings: stringifiedSettings});
    }

    function setSettingsIn(ps, controllerRef, path, settingsItem) {
        var settings = getSettings(ps, controllerRef);
        _.set(settings, path, settingsItem);
        setSettings(ps, controllerRef, settings);
    }

    function setName(ps, controllerRef, controllerName) {
        setControllerDataItem(ps, controllerRef, {name: controllerName});
    }

    function setState(ps, stateMap) {
        var appStatePointer = ps.pointers.platform.getAppStatePointer();
        _.forEach(stateMap, function(controllerRefs, state) {
            _.forEach(controllerRefs, function(controllerRef) {
                ps.dal.full.set(ps.pointers.getInnerPointer(appStatePointer, controllerRef.id), state);
            });
        });
    }

    function getState(ps, controllerId) {
        var appStatePointer = ps.pointers.platform.getAppStatePointer();
        return ps.dal.get(ps.pointers.getInnerPointer(appStatePointer, controllerId)) || constants.Controller.DEFAULT_STATE;
    }

    return {
        setSettings: setSettings,
        getSettings: getSettings,
        setSettingsIn: setSettingsIn,
        getSettingsIn: getSettingsIn,
        getName: getName,
        setName: setName,
        setState: setState,
        getState: getState
    };
});
