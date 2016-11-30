define(['lodash',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/siteMetadata/siteMetadata'
], function (_,
             clientSpecMapService,
             siteMetadata) {

    'use strict';

    var dismissAppDefIds = [];
    var appsDataToAdd = [];
    var newPendingApps = [];

    var getPendingApps = function (ps) {
        var appsData = clientSpecMapService.getAppsData(ps);

        return _.filter(appsData, function (appData) {
            return isPending(ps, appData) && appWasNotDismissed(appData) && appWasNotAddedFromPendingList(appData);
        });
    };

    var appWasNotDismissed = function (appData) {
        if (_.has(appData, 'appDefId')) {
            return !_.includes(dismissAppDefIds, appData.appDefId);
        }
        return !_.includes(dismissAppDefIds, appData.appDefinitionId);
    };

    var appWasNotAddedFromPendingList = function (appData) {
        if (_.has(appData, 'appDefId')) {
            return !_.some(appsDataToAdd, {appDefinitionId: appData.appDefId});
        }
        return !_.some(appsDataToAdd, {appDefinitionId: appData.appDefinitionId});
    };

    var getPendingAppsCount = function (ps) {
        var pending = getPendingApps(ps);

        return _.size(pending);
    };

    var isPending = function (ps, appData) {
        if (ps && appData) {
            return appData.requiresEditorComponent && clientSpecMapService.isHybridApp(ps, appData.applicationId);
        } else if (_.isUndefined(ps) && appData) {
            return appData.requiresEditorComponent && clientSpecMapService.isHybridAppFromAppData(appData);
        }
        return false;
    };

    var isPremiumPendingApp = function (ps, applicationId) {
        var premiumPendingApps = siteMetadata.getProperty(ps, siteMetadata.PROPERTY_NAMES.PENDING_APPS) || [];
        return _.some(premiumPendingApps, function (app) {
            return _.has(app, 'appDefId') && _.has(app, 'reason') && app.reason === 'Premium' && app.applicationId === applicationId;
        });
    };

    var getPremiumPendingApps = function (ps) {
        var appsData = clientSpecMapService.getAppsData(ps);
        var appDefsInSpecMap = _.pluck(appsData, 'appDefinitionId');
        var premiumPendingApps = siteMetadata.getProperty(ps, siteMetadata.PROPERTY_NAMES.PENDING_APPS) || [];
        var premiumPendingAppsAfterValidation = _.filter(premiumPendingApps, function (app) {
            return _.has(app, 'appDefId') && _.has(app, 'vendorProductId');
        });

        return _.filter(premiumPendingAppsAfterValidation, function (app) {
            return !_.includes(appDefsInSpecMap, app.appDefId);
        });
    };

    var getPendingAppsFromSiteMetaData = function (ps) {
        var pendingAppsFromMetaSite = siteMetadata.getProperty(ps, siteMetadata.PROPERTY_NAMES.PENDING_APPS) || [];
        var allPendingApps = pendingAppsFromMetaSite.slice(0).concat(newPendingApps);
        var uniqueAppList = _.uniq(allPendingApps, 'appDefId');

        return _.filter(uniqueAppList, function (appData) {
            return appWasNotDismissed(appData) && appWasNotAddedFromPendingList(appData);
        });
    };

    var dismiss = function (ps, appDefId) {
        if (_.find(appsDataToAdd, {
                appDefinitionId: appDefId
            })) {
            return;
        }
        if (!_.includes(dismissAppDefIds, appDefId)){
            dismissAppDefIds.push(appDefId);
        }
        newPendingApps = newPendingApps.filter(function (app) {
            return app.appDefId !== appDefId;
        });
    };

    var add = function (appData) {
        appsDataToAdd.push(appData);
        if (_.includes(dismissAppDefIds, appData.appDefinitionId)){
            dismissAppDefIds = _.without(dismissAppDefIds, appData.appDefinitionId);
        }
    };

    var addPendingDashboardApp = function (ps, appDefId) {
        if (_.isEmpty(appDefId)){
            return;
        }
        var app = {
            appDefId: appDefId
        };
        newPendingApps.push(app);

        dismissAppDefIds = dismissAppDefIds.filter(function (defId) {
            return defId !== appDefId;
        });
    };

    var getAppsToDismiss = function () {
        return dismissAppDefIds;
    };

    var getAppsToAdd = function () {
        return appsDataToAdd;
    };

    var onSave = function () {
        dismissAppDefIds = [];
        appsDataToAdd = [];
    };

    return {
        //@deprecated
        getPendingApps: getPendingApps,
        getPendingAppsFromSiteMetaData: getPendingAppsFromSiteMetaData,
        getPendingAppsCount: getPendingAppsCount,
        getPremiumPendingApps: getPremiumPendingApps,
        isPending: isPending,
        dismiss: dismiss,
        add: add,
        addPendingDashboardApp: addPendingDashboardApp,
        getAppsToDismiss: getAppsToDismiss,
        getAppsToAdd: getAppsToAdd,
        isPremiumPendingApp: isPremiumPendingApp,
        onSave: onSave
    };
});
