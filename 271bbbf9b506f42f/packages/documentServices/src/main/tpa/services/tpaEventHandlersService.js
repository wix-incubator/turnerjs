define(['lodash',
    'documentServices/theme/theme'], function(_, theme) {

    'use strict';

    var editModeChangeCallbacks = {};
    var settingsUpdatedCallbacks = {};
    var windowPlacementChangedCallbacks = {};
    var sitePublishedCallbacks = {};
    var deviceTypeChangeCallbacks = {};
    var themeChangeCallbacks = {};
    var siteSavedCallbacks = {};
    var deleteHandlers = {};
    var publicDataChangedCallbacks = {};

    var registerDeleteCompHandler = function (compId, callback) {
        deleteHandlers[compId] = callback;
    };

    var executeDeleteHandler = function(compId) {
        if (isDeleteHandlerExists(compId)) {
            deleteHandlers[compId]();
            delete deleteHandlers[compId];
        }
    };

    var isDeleteHandlerExists = function(compId) {
        return !_.isUndefined(deleteHandlers[compId]);
    };

    var unRegisterHandlers = function(ps, compId) {
        editModeChangeCallbacks = _.omit(editModeChangeCallbacks, compId);
        settingsUpdatedCallbacks = _.omit(settingsUpdatedCallbacks, compId);
        windowPlacementChangedCallbacks = _.omit(windowPlacementChangedCallbacks, compId);
        sitePublishedCallbacks = _.omit(sitePublishedCallbacks, compId);
        deviceTypeChangeCallbacks = _.omit(deviceTypeChangeCallbacks, compId);
        siteSavedCallbacks = _.omit(siteSavedCallbacks, compId);
        deleteHandlers = _.omit(deleteHandlers, compId);

        if (!_.isUndefined(themeChangeCallbacks[compId])) {
            theme.events.onChange.removeListener(ps, themeChangeCallbacks[compId]);
            themeChangeCallbacks = _.omit(themeChangeCallbacks, compId);
        }
    };

    var registerEditModeChangeHandler = function (compId, callback) {
        editModeChangeCallbacks[compId] = callback;
    };

    var registerSitePublishedHandler = function (compId, callback) {
        sitePublishedCallbacks[compId] = callback;
    };

    var registerThemeChangeHandler = function (ps, compId, callback) {
        if (_.isUndefined(themeChangeCallbacks[compId])) {
            var listenerId = theme.events.onChange.addListener(ps, callback);
            themeChangeCallbacks[compId] = listenerId;
        }
    };

    var registerPublicDataChangedHandler = function (compId, callback) {
        publicDataChangedCallbacks[compId] = callback;
    };

    var registerSettingsUpdatedHandler = function (compId, callback) {
        settingsUpdatedCallbacks[compId] = callback;
    };

    var registerWindowPlacementChangedHandler = function (compId, callback) {
        windowPlacementChangedCallbacks[compId] = callback;
    };

    var registerDeviceTypeChangeHandler = function (compId, callback) {
        deviceTypeChangeCallbacks[compId] = callback;
    };

    var registerSiteSavedHandler = function (compId, callback) {
        siteSavedCallbacks[compId] = callback;
    };

    var editModeChange = function (editorMode) {
        _.forEach(editModeChangeCallbacks, function (callback) {
            callback(editorMode);
        });
    };

    var sitePublished = function () {
        _.forEach(sitePublishedCallbacks, function (callback) {
            callback();
        });
    };

    var siteSaved = function () {
        _.forEach(siteSavedCallbacks, function (callback) {
            callback();
        });
    };

    var deviceTypeChange = function(deviceType) {
        _.forEach(deviceTypeChangeCallbacks, function (callback) {
            callback(deviceType);
        });
    };

    var triggerOnWindowPlacementChanged = function (msg) {
        var placement = msg.data.placement;
        var compId = msg.compId;
        var callback = windowPlacementChangedCallbacks[compId];
        if (callback) {
            callback(placement);
        }
    };

    var callSettingsUpdateCallback = function (compId, message) {
        var callback = settingsUpdatedCallbacks[compId];
        if (callback) {
            callback(message);
        }
    };

    var callPublicDataChangedCallback = function (compId, data) {
        var callback = publicDataChangedCallbacks[compId];
        if (callback) {
            callback(data);
        }
    };

    return {
        unRegisterHandlers: unRegisterHandlers,
        registerEditModeChangeHandler: registerEditModeChangeHandler,
        registerSettingsUpdatedHandler: registerSettingsUpdatedHandler,
        registerWindowPlacementChangedHandler: registerWindowPlacementChangedHandler,
        registerSitePublishedHandler: registerSitePublishedHandler,
        registerDeviceTypeChangeHandler: registerDeviceTypeChangeHandler,
        registerSiteSavedHandler: registerSiteSavedHandler,
        editModeChange: editModeChange,
        sitePublished: sitePublished,
        siteSaved: siteSaved,
        deviceTypeChange: deviceTypeChange,
        triggerOnWindowPlacementChanged: triggerOnWindowPlacementChanged,
        registerThemeChangeHandler: registerThemeChangeHandler,
        callSettingsUpdateCallback: callSettingsUpdateCallback,
        registerDeleteCompHandler: registerDeleteCompHandler,
        executeDeleteHandler: executeDeleteHandler,
        isDeleteHandlerExists: isDeleteHandlerExists,
        registerPublicDataChangedHandler: registerPublicDataChangedHandler,
        callPublicDataChangedCallback: callPublicDataChangedCallback
    };
});
