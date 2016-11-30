define(['lodash',
    'documentServices/editorData/editorData',
    'documentServices/page/page',
    'documentServices/dataModel/dataModel',
    'documentServices/component/component',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/tpa/services/pendingAppsService',
    'documentServices/tpa/services/appInstallationAndDeletionEvents',
    'documentServices/tpa/constants',
    'documentServices/tpa/utils/tpaUtils'
], function(
    _,
    editorData,
    page,
    dataModel,
    component,
    clientSpecMapService,
    pendingAppsService,
    appInstallationAndDeletionEvents,
    tpaConstants,
    tpaUtils
) {

    'use strict';

    var getAppsToRevokePermissions = function (clientSpecMap, appIdsInstalledOnSite, options) {

        var appsToRevokePermissions = _.filter(clientSpecMap, function (app) {
            return isAppPermissionGranted(app, appIdsInstalledOnSite) && !isAppPreInstalled(app) && !pendingAppsService.isPending(undefined, app);
        });

        if (options && _.isBoolean(options.excludeHybrid) && options.excludeHybrid) {
            return _.filter(appsToRevokePermissions, function (app) {
                return clientSpecMapService.isHybridAppAndEditorPartNotDismissed(app);
            });
        }

        return appsToRevokePermissions;
    };

    var getDeletedAppsIds = function(ps) {
        var clientSpecMap = clientSpecMapService.getAppsData(ps);
        return _(clientSpecMap).filter(function (app) {
            return !isApplicationIdExists(ps, app.applicationId) &&
                   clientSpecMapService.isEditorOrHybridApp(app);
        }).pluck('applicationId').value();
    };

    var getAppsToGrantPermissions = function (clientSpecMap, appIdsInstalledOnSite) {
        return _.filter(clientSpecMap, function (app) {
            return isAppPermissionRevoked(app, appIdsInstalledOnSite);
        });
    };

    var getAppsToGrantAndRevoke = function (clientSpecMap, pagesData, options) {
        var appIdsInstalledOnSite = getAllAppIdsInstalledOnPages(pagesData);

        return {
            revoke: getAppsToRevokePermissions(clientSpecMap, appIdsInstalledOnSite, options),
            grant: getAppsToGrantPermissions(clientSpecMap, appIdsInstalledOnSite)
        };
    };

    var isAppPermissionGranted = function(app, appIdsInstalledOnSite) {
        return clientSpecMapService.isEditorOrHybridApp(app) &&
            clientSpecMapService.isAppPermissionsIsGranted(app) &&
            !_.includes(appIdsInstalledOnSite, app.applicationId.toString());
    };

    var isAppPermissionRevoked = function(app, appIdsInstalledOnSite) {
        return clientSpecMapService.isEditorOrHybridApp(app) &&
            clientSpecMapService.isAppPermissionsIsRevoked(app) &&
            _.includes(appIdsInstalledOnSite, app.applicationId.toString());
    };

    var isAppPreInstalled = function (app) {
        return _.isBoolean(app.preInstalled) && app.preInstalled;
    };

    var getInstalledAppsOnPage = function(ps, pageId) {
        var compsOnPage = getAllTpaCompsOnPage(ps, pageId);
        var applicationIds = _.pluck(compsOnPage, 'applicationId');
        var clientSpecMap = clientSpecMapService.getAppsData(ps);
        return _(clientSpecMap).pick(applicationIds).values().value();
    };

    var getFirstMainSectionInstalledData = function (ps, applicationId) {
        return getFirstCompData(ps, applicationId, function(dataType) {
            return dataType === tpaConstants.DATA_TYPE.TPA_SECTION;
        });
    };

    var getFirstCompData = function(ps, applicationId, predicateFunc) {
        var pagesIds = page.getPageIdList(ps, true, true);
        var comp;
        var pageIdWithComp = _.find(pagesIds, function (pageId) {
            var tpaCompsOnPage = getAllTpaCompsOnPage(ps, pageId);
            comp = _.find(tpaCompsOnPage, function(tpaComp) {
                return tpaComp.applicationId.toString() === applicationId.toString() &&
                    predicateFunc(tpaComp.type);
            });
            return !_.isUndefined(comp);
        });

        return pageIdWithComp ? {pageId: pageIdWithComp, compId: comp.id} : null;
    };

    var getFirstAppCompPageId = function(ps, appDefinitionId) {
        var tpaApp = clientSpecMapService.getAppDataByAppDefinitionId(ps, appDefinitionId);
        var applicationId = tpaApp && tpaApp.applicationId;
        var data = applicationId && getFirstMainSectionInstalledData(ps, applicationId);
        data = applicationId && (data || getFirstCompData(ps, applicationId, function() { return true;}));

        return data;
    };

    var isMainSectionInstalled = function (ps, applicationId) {
        var pagesIds = page.getPageIdList(ps, true);
        return _.some(pagesIds, function (pageId) {
            var tpaCompsOnPage = getAllTpaCompsOnPage(ps, pageId);
            return _.some(tpaCompsOnPage, function(tpaComp) {
                return tpaComp.applicationId.toString() === applicationId.toString() &&
                    tpaComp.type === tpaConstants.DATA_TYPE.TPA_SECTION;
            });
        });
    };

    var getHiddenSections = function(ps, applicationId) {
        var hiddenSections = [];
        var pagesIds = page.getPageIdList(ps, true);
        _.forEach(pagesIds, function(pageId) {
            var tpaCompsOnPage = getAllTpaCompsOnPage(ps, pageId);
            hiddenSections = _.union(hiddenSections, _.filter(tpaCompsOnPage, function(tpaComp) {
                return tpaComp.applicationId.toString() === applicationId.toString() &&
                    tpaComp.type === tpaConstants.DATA_TYPE.TPA_MULTI_SECTION;
            }));
        });

        return _.isEmpty(hiddenSections) ? null : hiddenSections;
    };

    var getWidgetsByAppId = function(ps, applicationId) {
        var widgets = [];
        var pagesIds = page.getPageIdList(ps, true, true);
        _.forEach(pagesIds, function(pageId) {
            var tpaCompsOnPage = getAllTpaCompsOnPage(ps, pageId);
            widgets = _.union(widgets, _.filter(tpaCompsOnPage, function(tpaComp) {
                return tpaComp.applicationId.toString() === applicationId.toString() &&
                    tpaComp.type === tpaConstants.DATA_TYPE.TPA_WIDGET;
            }));
        });

        return _.isEmpty(widgets) ? null : widgets;
    };

    var getAllAppCompsByAppId = function (ps, applicationId) {
        var tpaComps = [];
        applicationId = applicationId || -1;
        var pagesIds = page.getPageIdList(ps, true, true);
        _.forEach(pagesIds, function(pageId) {
            var tpaCompsOnPage = getAllTpaCompsOnPage(ps, pageId);
            tpaComps = _.union(tpaComps, _.filter(tpaCompsOnPage, function(tpaComp) {
                return tpaComp && tpaComp.applicationId && tpaComp.applicationId.toString() === applicationId.toString();
            }));
        });

        return _.isEmpty(tpaComps) ? null : tpaComps;
    };

    var isMultiSectionInstalled = function(ps, applicationId) {
        var mainSections = [];
        applicationId = applicationId || -1;
        var pagesIds = page.getPageIdList(ps, true);
        _.forEach(pagesIds, function(pageId) {
            var tpaCompsOnPage = getAllTpaCompsOnPage(ps, pageId);
            mainSections = _.union(mainSections, _.filter(tpaCompsOnPage, function(tpaComp) {
                return tpaComp && tpaComp.applicationId && tpaComp.applicationId.toString() === applicationId.toString() &&
                    tpaComp.type === tpaConstants.DATA_TYPE.TPA_SECTION;
            }));
        });

        return _.size(mainSections) > 1;
    };

    var isAppInstalledBy = function(ps, appDefinitionId, filterOutDemoMode) {
        var tpaApp = clientSpecMapService.getAppDataByAppDefinitionId(ps, appDefinitionId);

        if (tpaApp) {
            var applicationIdExists = isApplicationIdExists(ps, tpaApp.applicationId);
            if (filterOutDemoMode) {
                return applicationIdExists && !tpaApp.demoMode;
            }
            return applicationIdExists;
        }

        return false;
    };

    var isApplicationIdExists = function(ps, applicationId) {
        applicationId = applicationId || -1;
        var pagesIds = page.getPageIdList(ps, true, true);
        return _.some(pagesIds, function(pageId) {
            var tpaCompsOnPage = getAllTpaCompsOnPage(ps, pageId);
            return _.some(tpaCompsOnPage, function(tpaComp) {
                return tpaComp.applicationId.toString() === applicationId.toString();
            });
        });
    };

    var getAppIdsInstalledOnPage = function(pageData) {
        if (_.isEmpty(pageData)) {
            return null;
        }

        var compsData = pageData.data.document_data;

        return _(compsData).filter(function(compData) {
            return tpaUtils.isTpaByDataType(compData.type);
        }).pluck('applicationId').uniq().value();
    };

    var getAllAppIdsInstalledOnPages = function(pagesData) {

        return _.reduce(pagesData, function(result, pageData) {
            return _.union(result, getAppIdsInstalledOnPage(pageData));
        }, []);
    };

    var getAllTpaCompsOnPage = function (ps, pageId) {
        var pagePointer = page.getPage(ps, pageId);
        var tpaCompPointers = component.getTpaChildren(ps, pagePointer);

        return _.map(tpaCompPointers, function(tpaCompPointer){
            return _.assign(component.data.get(ps, tpaCompPointer), {id: tpaCompPointer.id, pageId: pageId});
        });
    };

    var getTPACompsFromContainer = function (tpaComps, comps){
        _.forEach(comps, function(comp) {
            if (comp.type === "Container") {
                tpaComps.concat(getTPACompsFromContainer(tpaComps, comp.components));
            } else if (tpaUtils.isTpaByCompType(comp.componentType)) {
                tpaComps.push(comp);
            }
        });

        return tpaComps;
    };

    var isTpaCompsInstalledOnPages = function(pagesData) {
        return _.some(pagesData, function(pageData) {
            return isTpaCompsInstalledOnPage(pageData);
        });
    };

    var isTpaCompsInstalledOnPage = function(pageData) {
        if (_.isEmpty(pageData)) {
            return false;
        }

        var compsData = pageData.data.document_data;

        return _.some(compsData, function(compData) {
            return tpaUtils.isTpaByDataType(compData.type);
        });
    };

    var getRenderedReactCompsByApplicationId = function (ps, siteAPI, applicationId) {
        var comps = [];
        var compsData = getAllAppCompsByAppId(ps, applicationId);
        _.forEach(compsData, function (compData) {
            var renderedComp = siteAPI.getComponentById(compData.id);
            if (renderedComp) {
                comps.push(renderedComp);
            }
        });
        return comps;
    };

    var getAppsDefIdToProvisionOnSiteLoad = function(ps) {
        var clientSpecMap = clientSpecMapService.getAppsData(ps);
        return _(clientSpecMap).filter(function(appData){
            return appData.provisionOnSaveSite && appData.demoMode && isApplicationIdExists(ps, appData.applicationId);
        }).pluck('appDefinitionId').value();
    };

    var areTpaCompsWereUnInstalled = function(lastPagesData, updatedPagesData, deletedPages) {

        if (isTpaCompsInstalledOnPages(deletedPages)) {
            return true;
        }

        var tpaCompsOnLastPages = getAllAppIdsInstalledOnPages(lastPagesData) || [];
        var tpaCompsOnUpdatedPages = getAllAppIdsInstalledOnPages(updatedPagesData) || [];

        return (tpaCompsOnLastPages.length > tpaCompsOnUpdatedPages.length) ||
        (tpaCompsOnLastPages.length === tpaCompsOnUpdatedPages.length && !_.isEqual(tpaCompsOnLastPages, tpaCompsOnUpdatedPages));

    };

    var getAppPages = function(ps, applicationId) {
        var pagesIds = page.getPageIdList(ps, false, false);
        return _(pagesIds)
            .map(function (pageId) {
                return _.merge(page.data.get(ps, pageId), {pageId: pageId});
            })
            .filter({'tpaApplicationId': parseInt(applicationId, 10)})
            .value();
    };

    return {
        getInstalledAppsOnPage: getInstalledAppsOnPage,
        isMainSectionInstalled: isMainSectionInstalled,
        getWidgetsByAppId: getWidgetsByAppId,
        getAllAppCompsByAppId: getAllAppCompsByAppId,
        isMultiSectionInstalled: isMultiSectionInstalled,
        getHiddenSections: getHiddenSections,
        getFirstAppCompPageId: getFirstAppCompPageId,
        isApplicationIdExists: isApplicationIdExists,
        isAppInstalledBy: isAppInstalledBy,
        getRenderedReactCompsByApplicationId: getRenderedReactCompsByApplicationId,
        getDeletedAppsIds: getDeletedAppsIds,
        getAppsDefIdToProvisionOnSiteLoad: getAppsDefIdToProvisionOnSiteLoad,
        getAppsToGrantAndRevoke: getAppsToGrantAndRevoke,
        getAllAppIdsInstalledOnPages: getAllAppIdsInstalledOnPages,
        areTpaCompsWereUnInstalled: areTpaCompsWereUnInstalled,
        getAppsToGrantPermissions: getAppsToGrantPermissions,
        getAppPages: getAppPages
    };
});
