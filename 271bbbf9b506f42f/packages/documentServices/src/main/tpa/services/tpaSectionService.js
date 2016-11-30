define(['lodash',
        'bluebird',
        'documentServices/page/page',
        'documentServices/component/component',
        'documentServices/tpa/services/appInstallationAndDeletionEvents',
        'documentServices/tpa/services/installedTpaAppsOnSiteService',
        'documentServices/tpa/services/clientSpecMapService',
        'documentServices/tpa/services/tpaWidgetService',
        'documentServices/tpa/services/tpaComponentCommonService',
        'documentServices/tpa/compStructure',
        'documentServices/tpa/constants'
    ], function(_, Promise, page, component, appInstallationAndDeletionEvents, installedTpaAppsOnSiteService, clientSpecMapService, tpaWidgetService, tpaComponentCommonService, compStructure, tpaConstants) {

    'use strict';

    var getSectionAppPageFrom = function (ps, appData) {
        var data = {
            name: appData.appDefinitionName
        };
        if (appData.widgets) {
            _.forEach(appData.widgets, function (widget) {
                if (widget.appPage && widget.appPage && widget.appPage.name && !widget.appPage.hidden) {
                    data = widget.appPage;
                    data.pageUriSEO = tpaComponentCommonService.getPageUriSEO(ps, data.name);
                    data = _.merge(data, widget);
                }
            });
        }
        return data;
    };

    //multi-multi section
    var addMultiSection = function (ps, pageToAddPointer, options, completeCallback) {
        var sectionId = options.sectionId;
        options.widgetData.applicationId = options.applicationId;
        var pageTitle = options.title || options.widgetData.appPage.name;
        options.widgetData.name = pageTitle;
        var pageUriSEO = tpaComponentCommonService.getPageUriSEO(ps, pageTitle);

        var serializedPage = compStructure.getMultiSectionStructure(ps, options.widgetData, sectionId, pageUriSEO);

        tpaComponentCommonService.addPageAndSection(ps, pageToAddPointer, sectionId, options.applicationId, options.widgetData, serializedPage, null, tpaConstants.COMP_TYPES.TPA_SECTION, tpaConstants.DATA_TYPE.TPA_SECTION, options.styleId);

        ps.setOperationsQueue.executeAfterCurrentOperationDone(function () {
            if (options.callback) {
                options.callback({
                    page: pageToAddPointer
                });
            }
        });

        completeCallback(ps);
    };

    var addSectionAfterProvision = function (ps, pageToAddPointer, options, appData, completeCallback) {
        if (!canAddSection(ps, appData)) {
            completeCallback(ps, new Error('section already installed'));
            return;
        }
        var appPage = getSectionAppPageFrom(ps, appData);
        var sectionId = options.sectionId;
        var serializedPage = compStructure.getSectionStructure(ps, appData, sectionId, appPage.id, false, appPage.indexable, appPage.fullPage, appPage.pageUriSEO);
        var firstAdd = !installedTpaAppsOnSiteService.isApplicationIdExists(ps, appData.applicationId);

        var sectionPointer = tpaComponentCommonService.addPageAndSection(ps, pageToAddPointer, sectionId, appData.applicationId, appPage, serializedPage, null, tpaConstants.COMP_TYPES.TPA_SECTION, tpaConstants.DATA_TYPE.TPA_SECTION, options.styleId);
        tpaComponentCommonService.addHiddenPages(ps, appData);
        addWidgets(ps, appData, pageToAddPointer);

        if (firstAdd) {
            appInstallationAndDeletionEvents.invokeAddAppCallbacks(appData.appDefinitionId);
        }

        tpaComponentCommonService.setPrefetchPageBehaviorIfNeeded(ps, sectionPointer, appData);

        ps.setOperationsQueue.executeAfterCurrentOperationDone(function () {
            if (options.callback) {
                options.callback({
                    page: pageToAddPointer,
                    sectionId: sectionId
                });
            }
        });

        completeCallback(ps);
    };

    var addWidgets = function (ps, appData, pageToAddPointer) {
        var widgets = clientSpecMapService.widgetsToAutoAddToSite(ps, appData);
        _.forEach(widgets, function (widget) {
            var compPointer = component.getComponentToAddRef(ps, pageToAddPointer);
            tpaWidgetService.addWidgetAfterProvision(ps, compPointer, {
                widgetId: widget.widgetId
            }, appData);
        });
    };

    var deleteWidgetPromise = function (ps, compPointer, applicationId) {
        return new Promise(function (resolve, reject) {
            tpaWidgetService.deleteWidget(ps, compPointer, applicationId, function (privateServices, err) {
                if (err) {
                    reject(ps, err);
                } else {
                    resolve(ps);
                }
            });
        });
    };

    var deleteSection = function (ps, pageId, options, completeCallback) {
        var data = page.data.get(ps, pageId);
        var applicationId = data.tpaApplicationId;
        var pageIdsToBeDeleted = [pageId];
        pageIdsToBeDeleted = _.union(pageIdsToBeDeleted, _.pluck(installedTpaAppsOnSiteService.getHiddenSections(ps, applicationId), 'pageId'));
        var promises = returnDeleteAppWidgetsPromisesIfHaveAny(ps, applicationId, pageIdsToBeDeleted);
        var isMultiSectionInstalled = installedTpaAppsOnSiteService.isMultiSectionInstalled(ps, applicationId);

        Promise.all(promises).then(function() {
            page.remove(ps, pageId, function(privateServices, error) {
                if (!error) {
                    if (!isMultiSectionInstalled &&
                        clientSpecMapService.hasHiddenPages(ps, applicationId)) {
                        tpaComponentCommonService.deleteHiddenSections(ps, applicationId, function(psInner, err) {
                            completeCallback(psInner, err);
                        });
                    } else {
                        completeCallback(ps);
                    }
                } else {
                    completeCallback(ps, error);
                }
            });
        }, function() {
            completeCallback(ps, new Error("couldn't delete widgets - " + applicationId));
        });
    };

    var returnDeleteAppWidgetsPromisesIfHaveAny = function(ps, applicationId, pageIdsToBeDeleted) {
        if (!installedTpaAppsOnSiteService.isMultiSectionInstalled(ps, applicationId)) {
            var appWidgetComps = installedTpaAppsOnSiteService.getWidgetsByAppId(ps, applicationId);

            appWidgetComps = _.reject(appWidgetComps, function(comp) {
               return _.includes(pageIdsToBeDeleted, comp.pageId);
            });

            return _.map(appWidgetComps, function (comp) {
                var pagePointer = page.getPage(ps, comp.pageId);
                var compPointer = ps.pointers.components.getComponent(comp.id, pagePointer);
                return deleteWidgetPromise(ps, compPointer, applicationId);
            });
        }

        return [];
    };


    var canAddSection = function (ps, appData) {
        return !installedTpaAppsOnSiteService.isMainSectionInstalled(ps, appData.applicationId);
    };

    var alreadyInstalled = function (ps, appDefinitionId) {
        return installedTpaAppsOnSiteService.isAppInstalledBy(ps, appDefinitionId);
    };

    return {
        addSectionAfterProvision: addSectionAfterProvision,
        addMultiSection: addMultiSection,
        deleteSection: deleteSection,
        alreadyInstalled: alreadyInstalled
    };
});
