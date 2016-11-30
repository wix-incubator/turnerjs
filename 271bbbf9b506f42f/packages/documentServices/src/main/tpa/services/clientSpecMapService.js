define(['lodash',
        'documentServices/siteMetadata/siteMetadata',
        'documentServices/siteMetadata/clientSpecMap',
        'documentServices/tpa/utils/tpaUtils'],
    function (_, metaData, clientSpecMapDS, tpaUtils) {

    'use strict';

    var isDevMode = false;

    var isPremiumApp = function(privateServices, applicationId) {
        var appData = clientSpecMapDS.getAppData(privateServices, applicationId);
        return !!appData && !!appData.vendorProductId;
    };

    var hasPremiumOffering = function(privateServices, applicationId) {
        var appData = clientSpecMapDS.getAppData(privateServices, applicationId);
        return !!appData && _.size(appData.vendorProducts) > 0;
    };

    var setAppsData = function(privateServices, newClientSpecMap) {
        metaData.setProperty(privateServices, metaData.PROPERTY_NAMES.CLIENT_SPEC_MAP, newClientSpecMap);
    };

    var getLargestApplicationId = function (privateServices) {
        var appsData = clientSpecMapDS.getAppsData(privateServices);
        var toInt = function(x) {
            return parseInt(x, 10);
        };

        return _(appsData).keys().map(toInt).filter().concat(0).max();
    };

    var filterApps = function (csm) {
        return _.pick(csm, function (appData) {
            return tpaUtils.isTpaByAppType(appData.type) && (_.isUndefined(appData.appType) || isEditorOrHybridApp(appData));
        });
    };

    var getWidgetData = function (privateServices, applicationId, widgetId) {
        var widgets = clientSpecMapDS.getAppData(privateServices, applicationId).widgets || {};
        return widgets[widgetId] || null;
    };

    var isWidgetPublished = function (widget) {
        var isPublishedInNewAndOldEditor = widget.published;
        var isPublishedOnlyInNewEditor = widget.santaEditorPublished;
        return isPublishedInNewAndOldEditor || isPublishedOnlyInNewEditor;
    };

    var getExtensionsWidgets = function(privateServices, appData) {
        var widgets = appData && appData.widgets;
        widgets = _.filter(widgets, function(widget) {
            return _.isNull(widget.appPage) || _.isUndefined(widget.appPage);
        });

        if (!isDevMode) {
            widgets = _.filter(widgets, isWidgetPublished);
        }
        return widgets;
    };

    var getAppSections = function(privateServices, appData) {
        var widgets = appData && appData.widgets;
        widgets = _.filter(widgets, function(widget) {
            return !_.isNull(widget.appPage) && !_.isUndefined(widget.appPage);
        });

        if (!isDevMode) {
            widgets = _.filter(widgets, isWidgetPublished);
        }
        return widgets;
    };

    var hasSections = function (privateServices, appData) {
        var appSections = getAppSections(privateServices, appData);
        return !_.isEmpty(appSections);
    };

    var isHybridApp = function (privateServices, applicationId) {
        var appData = applicationId && clientSpecMapDS.getAppData(privateServices, applicationId);
        return isHybridAppFromAppData(appData);
    };

    var isHybridAppFromAppData = function (appData) {
        if (_.isUndefined(appData) || _.isUndefined(appData.appType)) {
            return false;
        }

        return appData.appType === 'Hybrid';
    };

    var isHybridAppAndEditorPartNotDismissed = function (appData) {
        var isHybrid = isHybridAppFromAppData(appData);
        return isHybrid && (_.isUndefined(appData.editorPartDismissed) || appData.editorPartDismissed === false);
    };

    var isDashboardAppOnly = function (appData) {
        if (_.isUndefined(appData) || _.isUndefined(appData.appType)) {
            return false;
        }

        return appData.appType === 'Dashboard';
    };

    var isEditorOrHybridApp = function (appData) {
        if (_.isUndefined(appData) || _.isUndefined(appData.appType)) {
            return false;
        }
        return appData.appType === 'Hybrid' || appData.appType === 'Editor';
    };

    var isAppPermissionsIsRevoked = function(appData) {
        return (appData.permissions && _.isBoolean(appData.permissions.revoked) && appData.permissions.revoked);
    };

    var isAppPermissionsIsGranted = function(appData) {
        return (appData.permissions && _.isBoolean(appData.permissions.revoked) && !appData.permissions.revoked);
    };

    var hasHiddenPages = function (ps, applicationId) {
        var appData = clientSpecMapDS.getAppData(ps, applicationId);
        var sections = getAppSections(ps, appData);
        var hiddenSection = _.filter(sections, 'appPage.hidden');
        return _.size(hiddenSection) > 0;
    };

    var hasMainSection = function(ps, appData) {
        var sections = getAppSections(ps, appData);
        return _.some(sections, function (app) {
            return !app.appPage.hidden;
        });
    };

    var getMainSectionWidgetData = function(ps, appData) {
        var sections = getAppSections(ps, appData);
        return _.find(sections, function (app) {
            return !app.appPage.hidden;
        });
    };

    var getMainSectionWidgetDataFromApplicationId = function (ps, applicationId) {
        return getMainSectionWidgetData(ps, clientSpecMapDS.getAppData(ps, applicationId));
    };

    var widgetsToAutoAddToSite = function (ps, appData) {
        var widgets = getExtensionsWidgets(ps, appData);
        return _.filter(widgets, 'autoAddToSite');
    };

    var getWidgetDataFromTPAPageId = function (ps, appDefinitionId, pageId) {
        var sections = getAppSections(ps, clientSpecMapDS.getAppDataByAppDefinitionId(ps, appDefinitionId));
        return _.find(sections, {appPage: {id: pageId}});
    };

    var getWidgetDataFromTPAWidgetId = function (ps, appDefinitionId, tpaWidgetId) {
        var widgets = getExtensionsWidgets(ps, clientSpecMapDS.getAppDataByAppDefinitionId(ps, appDefinitionId));
        return _.find(widgets, {tpaWidgetId: tpaWidgetId});
    };

    var setIsInDevMode = function(isInDevMode) {
        isDevMode = isInDevMode;
    };

    var isWidgetHasMobileUrl = function(ps, applicationId, widgetId) {
        if (!applicationId || !widgetId){
            return false;
        }

        var widgetData = getWidgetData(ps, applicationId, widgetId);
        if (widgetData && widgetData.mobileUrl){
            var mobileUrl = widgetData.mobileUrl;
            var isPublished = widgetData.mobilePublished && _.isBoolean(widgetData.mobilePublished) && widgetData.mobilePublished;
            return !_.isEmpty(mobileUrl) && (isDevMode || isPublished);
        }

        return false;
    };

    var isAppProvisionedOnServer = function(ps, applicationId) {
        var appData = clientSpecMapDS.getAppData(ps, applicationId);

        return !(appData.notProvisioned);
    };

    var getSectionsWidgetIdsToPreFetch = function(appData) {
        return _(appData.widgets)
            .filter('preFetch')
            .filter('appPage')
            .filter(isWidgetPublished)
            .map('widgetId')
            .value();
    };

    var isDemoAppAfterProvision = function(appData) {
        var instance = _.get(appData, 'instance');
        if (!_.isEmpty(instance)) {
            var instanceParts = appData.instance.split('.');
            var instanceValues = JSON.parse(atob(instanceParts[1]));
            return !_.isEmpty(instanceValues.originInstanceId);
        }
    };

    var isSuperAppByCompId = function(ps, siteAPI, compId) {
        var comp = siteAPI.getComponentById(compId);
        var applicationId = _.get(comp, 'props.compData.applicationId');
        var appData = clientSpecMapDS.getAppData(ps, applicationId);
        return appData.isWixTPA;
    };

    return {
        // TODO: remove duplicates of clientSpecMapDS methods
        registerAppData: clientSpecMapDS.registerAppData,
        getAppData: clientSpecMapDS.getAppData,
        getAppDataByAppDefinitionId: clientSpecMapDS.getAppDataByAppDefinitionId,
        getAppsData: clientSpecMapDS.getAppsData,
        filterApps: filterApps,
        getLargestApplicationId: getLargestApplicationId,
        getWidgetData: getWidgetData,
        getExtensionsWidgets: getExtensionsWidgets,
        isHybridAppAndEditorPartNotDismissed: isHybridAppAndEditorPartNotDismissed,
        isHybridApp: isHybridApp,
        isHybridAppFromAppData: isHybridAppFromAppData,
        isDashboardAppOnly: isDashboardAppOnly,
        isEditorOrHybridApp: isEditorOrHybridApp,
        setAppsData: setAppsData,
        isAppPermissionsIsRevoked: isAppPermissionsIsRevoked,
        isPremiumApp: isPremiumApp,
        hasPremiumOffering: hasPremiumOffering,
        hasHiddenPages: hasHiddenPages,
        getAppSections: getAppSections,
        widgetsToAutoAddToSite: widgetsToAutoAddToSite,
        getWidgetDataFromTPAPageId: getWidgetDataFromTPAPageId,
        getWidgetDataFromTPAWidgetId: getWidgetDataFromTPAWidgetId,
        setIsInDevMode : setIsInDevMode,
        isWidgetHasMobileUrl: isWidgetHasMobileUrl,
        isAppPermissionsIsGranted: isAppPermissionsIsGranted,
        hasSections: hasSections,
        isAppProvisionedOnServer: isAppProvisionedOnServer,
        hasMainSection: hasMainSection,
        getMainSectionWidgetData: getMainSectionWidgetData,
        getMainSectionWidgetDataFromApplicationId: getMainSectionWidgetDataFromApplicationId,
        getSectionsWidgetIdsToPreFetch: getSectionsWidgetIdsToPreFetch,
        isDemoAppAfterProvision: isDemoAppAfterProvision,
        isSuperAppByCompId: isSuperAppByCompId
    };
});
