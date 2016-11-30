/**
 * This is the description for the tpa namespace.
 * @memberof documentServices
 * @namespace documentServices.tpa
 */
/*eslint-disable */
define([
    'lodash',
    'documentServices/hooks/hooks',
    'core',
    'utils',
    'tpa',
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/component/component',
    'documentServices/structure/structure',
    'documentServices/page/page',
    'documentServices/privateServices/idGenerator',
    'documentServices/measure/fixedComponentMeasuring',
    'documentServices/theme/theme',
    'documentServices/tpa/services/tpaComponentService',
    'documentServices/tpa/services/tpaComponentCommonService',
    'documentServices/tpa/services/tpaWidgetService',
    'documentServices/tpa/services/tpaSectionService',
    'documentServices/tpa/services/installedTpaAppsOnSiteService',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/tpa/services/appMarketService',
    'documentServices/tpa/services/provisionService',
    'documentServices/tpa/services/appStoreService',
    'documentServices/tpa/data/componentDefinition',
    'documentServices/tpa/services/pendingAppsService',
    'documentServices/tpa/constants',
    'documentServices/tpa/services/tpaSettingsService',
    'documentServices/tpa/utils/tpaUtils',
    'documentServices/tpa/services/tpaEventHandlersService',
    'documentServices/tpa/services/appInstallationAndDeletionEvents',
    'documentServices/tpa/bi/errors',
    'documentServices/tpa/services/billingService',
    'documentServices/tpa/services/experimentService',
    'documentServices/tpa/services/tpaDataService',
    'documentServices/tpa/services/tpaPostMessageService',
    'documentServices/tpa/services/tpaStyleService',
    'documentServices/tpa/handlers/tpaHandlers',
    'documentServices/utils/utils'
], function (
    _,
    hooks,
    core,
    utils,
    tpa,
    siteMetadata,
    component,
    structure,
    page,
    idGenerator,
    fixedComponentMeasuring,
    theme,
    tpaComponentService,
    tpaComponentCommonService,
    tpaWidgetService,
    tpaSectionService,
    installedTpaAppsOnSiteService,
    clientSpecMapService,
    appMarketService,
    provisionService,
    appStoreService,
    componentDefinitionService,
    pendingAppsService,
    tpaConstants,
    tpaSettingsService,
    tpaUtils,
    tpaEventHandlersService,
    appInstallationAndDeletionEvents,
    errors,
    billingService,
    experimentService,
    tpaDataService,
    tpaPostMessageService,
    tpaStyleService,
    tpaHandlers,
    dsUtils)
    /*eslint-enable */ {

    'use strict';

    var siteAPI;

    var _dsHandlersReady = false;

    var tpaDSAspect = function (aspectSiteAPI) {
        siteAPI = aspectSiteAPI;
    };

    core.siteAspectsRegistry.registerSiteAspect('tpaDSAspect', tpaDSAspect);

    var initialize = function (ps, params) {
        if (params && params.runStylesGC){
            tpaDataService.runGarbageCollection(ps);
        }
        var clientSpecMap = ps.dal.get(ps.pointers.general.getClientSpecMap());
        fixedComponentMeasuring.setMeasuringForType('wysiwyg.viewer.components.tpapps.TPAGluedWidget', tpa.gluedWidgetMeasuringUtils.getGluedWidgetMeasurements.bind(null, clientSpecMap));

        tpaPostMessageService.init(ps, siteAPI);
        tpaHandlers.settpads(_.get(this, 'methods.tpa') || this);
        markDocumentServicesHandlersAreReady(true);

        appStoreService.settleOnLoad(ps);
        appStoreService.preSaveAddAppsOnLoad(ps);

        fixPageUriSEOIfNeeded(ps);
    };

    var onAsyncSetOperationComplete = function (ps, err) {
        ps.setOperationsQueue.asyncSetOperationComplete(err);
    };

    var addWidget = function (ps, componentToAddRef, appDefinitionId, options) {
        var onError = function() {
            if (options.onError) {
                options.onError();
            }
            onAsyncSetOperationComplete(ps, new Error('addWidget - provision failed'));
        };
        tpaComponentService.provisionApp(ps, componentToAddRef, tpaConstants.TYPE.TPA_WIDGET, appDefinitionId, options, onAsyncSetOperationComplete, onError);
    };

    var addSection = function (ps, pageToAddRef, appDefinitionId, options, onError) {
        var sectionId = tpaConstants.TYPE.TPA_SECTION + "_" + utils.guidUtils.getUniqueId();
        options = options || {};
        options.sectionId = sectionId;
        var completeOnError = function() {
            if (onError) {
                onError();
            }
            onAsyncSetOperationComplete(ps);
        };
        tpaComponentService.provisionApp(ps, pageToAddRef, tpaConstants.TYPE.TPA_SECTION, appDefinitionId, options, onAsyncSetOperationComplete, completeOnError);
        return _.assign(pageToAddRef, {
            sectionId: sectionId
        });
    };

    var isMultiSectionInstanceEnabled = function (appData, widgetId) {
        if (!widgetId) {
            return false;
        }
        var widgetData = appData.widgets && appData.widgets[widgetId];

        return _.get(widgetData, 'appPage.multiInstanceEnabled');
    };

    var addMultiSection = function (ps, pageToAddRef, appDefinitionId, options) {
        if (tpaSectionService.alreadyInstalled(ps, appDefinitionId)) {
            var sectionId = tpaConstants.TYPE.TPA_SECTION + "_" + utils.guidUtils.getUniqueId();
            options.sectionId = sectionId;
            var widgetData = clientSpecMapService.getWidgetDataFromTPAPageId(ps, appDefinitionId, options.pageId);
            var appData = clientSpecMapService.getAppDataByAppDefinitionId(ps, appDefinitionId);
            if (widgetData && isMultiSectionInstanceEnabled(appData, widgetData.widgetId)) {
                options.applicationId = appData.applicationId;
                options.widgetData = widgetData;

                if (appData.demoMode) {
                    provisionAppDemoSave(ps, appData.applicationId, function () {
                        tpaSectionService.addMultiSection(ps, pageToAddRef, options, onAsyncSetOperationComplete);
                    });
                } else {
                    tpaSectionService.addMultiSection(ps, pageToAddRef, options, onAsyncSetOperationComplete);
                }

                return _.assign(pageToAddRef, {
                    sectionId: sectionId
                });
            }
            return onAsyncSetOperationComplete(ps, new Error('Creating this section is not allowed'));
        }
        return onAsyncSetOperationComplete(ps, new Error('Main section is not installed'));
    };

    var sectionAlreadyInstalled = function (ps, appDefinitionId) {
        return tpaSectionService.alreadyInstalled(ps, appDefinitionId);
    };

    var getPageData = function (ps, pageId) {
        var pageData = page.data.get(ps, pageId);
        var hasSection = pageData.tpaApplicationId > 0;
        var appData;
        if (hasSection) {
            appData = clientSpecMapService.getAppData(ps, pageData.tpaApplicationId);
        }
        return {
            title: pageData.title,
            hasSection: hasSection,
            appData: appData
        };
    };

    var deleteWidget = function (ps, compPointer) {
        var compNode = component.data.get(ps, compPointer);
        var applicationId = compNode.applicationId;
        tpaWidgetService.deleteWidget(ps, compPointer, applicationId, deleteTpaCompleteCallback.bind(null, applicationId));
    };

    var deleteTpaCompleteCallback = function(applicationId, ps, err) {
        if (!installedTpaAppsOnSiteService.isApplicationIdExists(ps, applicationId)) {
            var appData = clientSpecMapService.getAppData(ps, applicationId);
            appInstallationAndDeletionEvents.invokeDeleteAppCallbacks(appData.appDefinitionId);
        }
        onAsyncSetOperationComplete(ps, err);
    };

    var deleteSection = function (ps, pageId, options) {
        options = options || {};
        var pageData = page.data.get(ps, pageId);
        var applicationId = pageData.tpaApplicationId;
        tpaSectionService.deleteSection(ps, pageId, options, deleteTpaCompleteCallback.bind(null, applicationId));
    };

    var getComponentDefinition = function(ps, params) {
        return componentDefinitionService.getComponentDefinition(params);

    };

    var isPremiumApp = function(ps, applicationId) {
        return clientSpecMapService.isPremiumApp(ps, applicationId);
    };

    var hasPremiumOffering = function (ps, applicationId) {
        return clientSpecMapService.hasPremiumOffering(ps, applicationId);
    };

    var isPremiumByAppDefinitionId = function (ps, appDefinitionId) {
        var app = clientSpecMapService.getAppDataByAppDefinitionId(ps, appDefinitionId);
        if (app) {
            return isPremiumApp(ps, app.applicationId);
        }
        return false;
    };

    var getWidgetDataFromTPAPageId = function (ps, appDefinitionId, tpaPageId) {
        return clientSpecMapService.getWidgetDataFromTPAPageId(ps, appDefinitionId, tpaPageId);
    };

    var getWidgetDataFromTPAWidgetId = function (ps, appDefinitionId, tpaWidgetId) {
        return clientSpecMapService.getWidgetDataFromTPAWidgetId(ps, appDefinitionId, tpaWidgetId);
    };

    var registerOnAppInstalled = function (ps, appDefinitionId, cb) {
        appInstallationAndDeletionEvents.registerOnAppInstalled(appDefinitionId, cb);
    };

    var registerOnAppDeleted = function (ps, appDefinitionId, cb) {
        appInstallationAndDeletionEvents.registerOnAppDeleted(appDefinitionId, cb);
    };

    var getExtensionsWidgets = function(ps, appData) {
        return clientSpecMapService.getExtensionsWidgets(ps, appData);
    };

    var isHybridApp = function (ps, applicationId) {
        return clientSpecMapService.isHybridApp(ps, applicationId);
    };

    var getFirstAppCompPageId = function (ps, appDefinitionId) {
        return installedTpaAppsOnSiteService.getFirstAppCompPageId(ps, appDefinitionId);
    };

    var duplicateWidget = function(ps, compPointer, pageId) {
        tpaWidgetService.duplicateWidget(ps, compPointer, pageId);
    };

    var registerDeleteCompHandler = function (ps, compId, handler) {
        tpaEventHandlersService.registerDeleteCompHandler(compId, handler);
    };

    var registerEditModeChangeHandler = function (ps, compId, handler) {
        tpaEventHandlersService.registerEditModeChangeHandler(compId, handler);
    };

    var registerThemeChangeHandler = function (ps, compId, handler) {
        tpaEventHandlersService.registerThemeChangeHandler(ps, compId, handler);
    };

    var registerSettingsUpdatedHandler = function (ps, compId, handler) {
        tpaEventHandlersService.registerSettingsUpdatedHandler(compId, handler);
    };

    var registerPublicDataChangedHandler = function (ps, compId, handler) {
        tpaEventHandlersService.registerPublicDataChangedHandler(compId, handler);
    };

    var registerSitePublishedHandler = function (ps, compId, handler) {
        tpaEventHandlersService.registerSitePublishedHandler(compId, handler);
    };

    var registerDeviceTypeChangeHandler = function(ps, compId, handler) {
        tpaEventHandlersService.registerDeviceTypeChangeHandler(compId, handler);
    };

    var registerWindowPlacementChangedHandler = function (ps, compId, handler) {
        tpaEventHandlersService.registerWindowPlacementChangedHandler(compId, handler);
    };

    var editModeChange = function (ps, editorMode) {
        tpaEventHandlersService.editModeChange(editorMode);
    };

    var registerSiteSavedHandler = function (ps, compId, handler) {
        tpaEventHandlersService.registerSiteSavedHandler(compId, handler);
    };

    var resizeComponent = function (ps, compPointer, width, height, callback) {
        var isStretched = structure.isHorizontallyStretchedToScreen(ps, compPointer);
        if (isStretched) {
            callback({onError: 'component is already set to full width'});
        } else {
            var layout = component.layout.get(ps, compPointer);
            structure.updateCompLayout(ps, compPointer, _.defaults({
                    width: width,
                    height: height
                },
                {
                    width: layout.width,
                    height: layout.height
                }));
            ps.siteAPI.forceUpdate();
            layout = component.layout.get(ps, compPointer);
            callback({
                width: layout.width,
                height: layout.height
            });
        }
    };

    var setExternalId = function (ps, componentPointer, referenceId, callback) {
        tpaComponentService.setExternalId(ps, componentPointer, referenceId, callback);
    };

    var getExternalId = function (ps, componentPointer) {
        return tpaComponentService.getExternalId(ps, componentPointer);
    };

    var sitePublished = function() {
        tpaEventHandlersService.sitePublished();
    };

    var siteSaved = function() {
        tpaEventHandlersService.siteSaved();
    };

    var deviceTypeChange = function(ps, deviceType) {
        tpaEventHandlersService.deviceTypeChange(deviceType);
    };

    var triggerSettingsUpdated = function (ps, applicationId, targetCompId, message) {
        tpaComponentService.settingsUpdated(ps, applicationId, targetCompId, message);
    };

    var refreshApp = function (ps, comps, queryParams) {
        tpaComponentService.refreshApp(comps, queryParams);
    };

    var getAppData = function (ps, applicationId) {
        return clientSpecMapService.getAppData(ps, applicationId);
    };

    var setStyleParam = function(ps, styleId, compId) {
        registerThemeChangeHandler(ps, compId, function (changedData) {
            tpaComponentService.postBackThemeData(ps, siteAPI, compId, changedData);
        });
    };

    var getSettingsModalParams = function(ps, urlParams, panelParams){
        return tpaSettingsService.getSettingsModalParams(ps, urlParams, panelParams);
    };

    var triggerOnWindowPlacementChanged = function(ps, msg){
        tpaEventHandlersService.triggerOnWindowPlacementChanged(msg);
    };

    var getStyleDataToPassIntoApp = function(ps, compId, shouldAddWixHelveticaFonts) {
        var comp = siteAPI.getComponentById(compId);
        return tpa.common.styleUtils.getStyleDataToPassIntoApp(siteAPI, comp, shouldAddWixHelveticaFonts);
    };

    var getNameToFontsKeyMap = function() {
        return tpa.common.styleUtils.getNameToFontsKeyMap();
    };

    var isAppInstalledBy = function(ps, appDefinitionId, filterDemoMode) {
        return installedTpaAppsOnSiteService.isAppInstalledBy(ps, appDefinitionId, filterDemoMode);
    };

    var isLastAppComp = function(ps, applicationId) {
        var comps = installedTpaAppsOnSiteService.getAllAppCompsByAppId(ps, applicationId);
        return comps && comps.length === 1;
    };

    var provisionAppDemoSave = function(ps, applicationId, callback, onError) {
        var onSuccess = function() {
            ps.setOperationsQueue.executeAfterCurrentOperationDone(function () {
                var comps = installedTpaAppsOnSiteService.getRenderedReactCompsByApplicationId(ps, siteAPI, applicationId);
                tpaComponentService.refreshApp(comps);
            });

            if (callback) {
                callback();
            }

            onAsyncSetOperationComplete(ps);
        };

        var completeOnError = function() {
            if (onError) {
                onError();
            }

            onAsyncSetOperationComplete(ps);
        };

        var appData = getAppData(ps, applicationId) || {};

        appStoreService.preSaveAddApp(ps, appData.appDefinitionId, onSuccess, completeOnError);
    };

    /**
     * @class documentServices.tpa
     */
    var getAppByAppDefId = function(ps, appDefId) {
        return clientSpecMapService.getAppDataByAppDefinitionId(ps, appDefId);
    };

    var getSectionRefByPageId = function(ps, pageId){
        return tpaComponentService.getSectionRefByPageId(ps, pageId);
    };

    var isContainerContainsPremiumTpa = function(ps, containerPointer) {
        var tpaPremiumComps = getPremiumTpaRecursive(ps, containerPointer);

        return !_.isEmpty(tpaPremiumComps);
    };

    var getPremiumTpaRecursive = function (ps, containerPointers) {
        var premiumTPAs = _(getTpaPointersRecursive(ps, containerPointers)).map(function (compPointer) {
            return component.data.get(ps, compPointer);
        }).filter(function (tpaCompData) {
            return clientSpecMapService.isPremiumApp(ps, tpaCompData.applicationId);
        }).map(function (tpaPremiumCompData) {
            return clientSpecMapService.getAppData(ps, tpaPremiumCompData.applicationId);
        }).value();

        return _.uniq(premiumTPAs, 'applicationId');
    };

    var getTpaPointersRecursive = function (ps, componentPointers) {
        componentPointers = _.isArray(componentPointers) ? componentPointers : [componentPointers];
        var tpaPointers = [];

        _.forEach(componentPointers, function (componentPointer) {
            var compType = component.getType(ps, componentPointer);
            var isTPA = tpaUtils.isTpaByCompType(compType);

            if (isTPA) {
                tpaPointers.push(componentPointer);
            }
            tpaPointers = tpaPointers.concat(component.getTpaChildren(ps, componentPointer));
        });

        return tpaPointers;
    };

    var getPremiumTpaChildrenOnPage = function(ps, pagePointer, tpaApplicationId, filterSubComponents) {
        var premiumTpaChildren = getPremiumTpaRecursive(ps, pagePointer);

        if (filterSubComponents) {
            return _.reject(premiumTpaChildren, function(tpaPremiumAppData){
                if (!tpaApplicationId || tpaApplicationId !== tpaPremiumAppData.applicationId) {
                    return hasSections(ps, tpaPremiumAppData);
                }
            });
        }

        return premiumTpaChildren;
    };

    var isMultiSectionInstalled = function (ps, applicationId) {
        return installedTpaAppsOnSiteService.isMultiSectionInstalled(ps, applicationId);
    };

    var getRenderedReactCompsByApplicationId = function(ps, applicationId) {
        return installedTpaAppsOnSiteService.getRenderedReactCompsByApplicationId(ps, siteAPI, applicationId);
    };

    var getAllCompsByApplicationId = function (ps, applicationId) {
        return installedTpaAppsOnSiteService.getAllAppCompsByAppId(ps, applicationId);
    };

    var hasSections = function (ps, appData) {
        return clientSpecMapService.hasSections(ps, appData);
    };

    var closePopupsAndModal = function() {
        siteAPI.getSiteAspect('tpaPopupAspect').removeAllPopups();
        siteAPI.getSiteAspect('tpaModalAspect').removeModal();
    };

    var isTpaByCompType = function(ps, compType) {
        return tpaUtils.isTpaByCompType(compType);
    };

    var getSections = function(ps, applicationId) {
        var appComps = getAllCompsByApplicationId(ps, applicationId);
        return _.filter(appComps, function(appComp) {
            return appComp.type === tpaConstants.DATA_TYPE.TPA_SECTION ||
                appComp.type === tpaConstants.DATA_TYPE.TPA_MULTI_SECTION;
        });
    };

    var isAppPermissionsIsRevoked = function(ps, appData) {
        return clientSpecMapService.isAppPermissionsIsRevoked(appData);
    };

    var fixEcomIfNeeded = function (ps, pageToAddRef) {
        var clientSpecMap = clientSpecMapService.getAppsData(ps);
        var eComAppDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';

        var eComData = _.find(clientSpecMap, {appDefinitionId: eComAppDefId});
        if (eComData && installedTpaAppsOnSiteService.isAppInstalledBy(ps, eComAppDefId)) {
            var eComPagesData = ps.pointers.data.getDataItemsWithPredicate({tpaApplicationId: eComData.applicationId}, 'masterPage');
            var eComPages = eComPagesData.map(ps.dal.get);
            var clientSpecMapPages = clientSpecMapService.getAppSections(undefined, eComData);

            var pageIdsFromCSM = _(clientSpecMapPages).pluck('appPage').pluck('id').value();
            var pageIdFromEComPagesData = _.pluck(eComPages, 'tpaPageId');

            var mainSectionWidgetData = clientSpecMapService.getMainSectionWidgetData(undefined, eComData);
            var mainSectionId = mainSectionWidgetData.appPage.id;
            var intersection, subPageIdsFromCSM;

            var mainSectionInstalled = _.some(eComPages, function(eComPage) {
                return _.startsWith(eComPage.tpaPageId, mainSectionId);
            });

            if (mainSectionInstalled) {
                subPageIdsFromCSM = _.reject(pageIdsFromCSM, function(id) {
                    return _.startsWith(id, mainSectionId);
                });
                var subPageIdFromEComPagesData = _.reject(pageIdFromEComPagesData, function(id) {
                    return _.startsWith(id, mainSectionId);
                });
                intersection = _.intersection(subPageIdsFromCSM, subPageIdFromEComPagesData);
            }

            if (mainSectionInstalled) {
                if (!_.isEqual(intersection, subPageIdsFromCSM)) {
                    tpaComponentCommonService.addHiddenPages(ps, eComData);
                }
            } else if (!_.isEqual(intersection, subPageIdsFromCSM) || _.size(eComPages) === 0) {
                addSection(ps, pageToAddRef, eComAppDefId);
            }
        }
    };

    var fixPageUriSEOIfNeeded = function (ps) {
        var pagesIds = page.getPageIdList(ps, false, false);
        var pagesWithoutPageUriSEO = _(pagesIds)
            .map(function (pageId) {
                return page.data.get(ps, pageId);
            })
            .filter('tpaApplicationId')
            .reject('pageUriSEO')
            .value();

        _.forEach(pagesWithoutPageUriSEO, function (pageData) {
            var appData = clientSpecMapService.getAppData(ps, pageData.tpaApplicationId);
            var widgetData = getWidgetDataFromTPAPageId(ps, appData.appDefinitionId, pageData.tpaPageId);
            if (widgetData) {
                var pageUriSEO = tpaComponentCommonService.getPageUriSEO(ps, _.get(widgetData, 'appPage.name'));
                page.data.set(ps, pageData.id, {'pageUriSEO': pageUriSEO});

            }
        });
    };

    var areDocumentServicesHandlersReady = function() {
        return _dsHandlersReady;
    };

    var markDocumentServicesHandlersAreReady = function(isDsHandlersInit) {
        _dsHandlersReady = isDsHandlersInit;
    };

    var isPageMarkedAsHideFromMenu = function (ps, applicationId, tpaPageId) {
        var appData = getAppData(ps, applicationId);
        return tpa.common.utils.isPageMarkedAsHideFromMenu(appData, tpaPageId);
    };

    var sendBIEvent = function(ps, msg, origin) {
        tpa.common.bi.sendBIEvent(msg, siteAPI, origin);
    };


    return {
        initialize: initialize,
        /**
         *
         * @return if a component type is a tpa
         */
        isTpaByCompType: isTpaByCompType,

        /**
         * @return if a page hideFromMenu flag is true in the client spec map
         */
        isPageMarkedAsHideFromMenu: isPageMarkedAsHideFromMenu,

        /**
         * return if the container contains at least one premium tpa app
         *
         * @param {Object} containerPointer - container reference
         * @return return if the container contains at least on premium tpa app
         * @example documentServices.tpa.isContainerContainsPremiumTpa(containerPointer)
         */
        isContainerContainsPremiumTpa: isContainerContainsPremiumTpa,

        /**
         * return all premium TPA child components of a given component ref.
         *
         * @param {Object} containerPointer - container reference
         * @return all container's premium TPA child components
         * @example documentServices.tpa.getPremiumTpaChildren(componentsPointers)
         */
        getPremiumTpaChildren: getPremiumTpaRecursive,

        /**
         * recursively searches for tpa components among the given components and returns their pointers
         *
         * @param {Object} componentPointers - pointers of components
         * @return pointers for all TPA components that were found
         * @example documentServices.tpa.getTpaPointersRecursive(componentPointers)
         */
        getTpaPointersRecursive: getTpaPointersRecursive,

        /**
         * filter out from tpa app premiums comps that are sub components.
         * for example: sub component of hotels section
         *
         * @param {Object} containerPointer - container reference
         * @param tpaApplicationId {String} - tpaApplicationId on page
         * @param filterSubComponents {Boolean} - indicate if to filter sub components
         * @return all container's TPA premium child components filtering out the sub components if required
         * @example documentServices.tpa.getPremiumTpaChildrenOnPage(pagePointer, tpaApplicationId, filterSubComponents)
         */
        getPremiumTpaChildrenOnPage: getPremiumTpaChildrenOnPage,

        /**
         * close all opened popups and modal
         *
         * @example documentServices.tpa.closePopupsAndModal()
         */
        closePopupsAndModal: closePopupsAndModal,

        /**
         * widget
         * @member documentServices.tpa.widget
         * @namespace documentServices.tpa.widget
         */
        widget: {
            /**
             * Add widget to the document
             * For displaying the new widget refresh the site
             *
             * @param {string} appDefinitionId of the widget being added
             * @param {Object} [options]
             * {String} [widgetId] of the widget being added
             * {Object} [Layout] object describes the app width, height, x and y location - if no layout is given a default one will be taken
             * {String} [pageId] Wix pageId that the widget should be added to
             * @example documentServices.tpa.widget.add('135aad86-9125-6074-7346-29dc6a3c9bcf',
             * { widgetId: '135aae78-42c9-63b5-d09a-77233cebc1c4', pageId: 'mainPage', layout: {"width": 300, "height": 200, "x": 200, "y": 200 } });
             */
            add: {dataManipulation: addWidget, isUpdatingAnchors: dsUtils.YES, isAsyncOperation: true, getReturnValue: component.getComponentToAddRef},

            /**
             * Removes a tpa widget from a given compId.
             * @param {Object} compPointer of the widget
             *
             * @example
             * documentServices.tpa.widget.delete(compPointer, onSuccess, onError)
             */
            delete: {dataManipulation: deleteWidget, isUpdatingAnchors: dsUtils.YES, isAsyncOperation: true},

            /**
             * Duplicates the given widget into the given page.
             *
             * @param {object} compPointer of the Widget id in query
             * @param {string} pageId of the page to paste in
             * @example
             * documentServices.tpa.widget.duplicate(compPointer,'c1qpo')
             */
            duplicate: {dataManipulation:duplicateWidget, isUpdatingAnchors: dsUtils.YES}
        },

        /**
         * section
         * @member documentServices.tpa.section
         * @namespace documentServices.tpa.section
         */
        section: {
            /**
             * Add section to the document and navigate to it
             *
             * @param {string} appDefinitionId of the widget being added
             * @param {Object} [options]
             * {String} [widgetId] of the multi multi section being added
             * @return an object contains the new added page id that contains the new section and the section id
             * @example
             * documentServices.tpa.section.add("135aad86-9125-6074-7346-29dc6a3c9bcf");
             */
            add: {dataManipulation: addSection, isUpdatingAnchors: dsUtils.YES, isAsyncOperation: true, getReturnValue: page.getPageIdToAdd},

            /**
             * Add section to the document and navigate to it
             *
             * @param {string} appDefinitionId of the widget being added
             * @param {Object} options
             * @param {String} {pageId} of the multi multi section being added
             * @param {String} [title] of the new page
             * @example
             * var options = {
             *   pageId: 'tpaPageId',
             *   title: 'title'
             * };
             * documentServices.tpa.section.addMultiSection('appDef', options);
             */
            addMultiSection: {dataManipulation: addMultiSection, isUpdatingAnchors: dsUtils.YES, isAsyncOperation: true, getReturnValue: page.getPageIdToAdd},

            /**
             * Removes a section for a given page id.
             *
             * @param {string} pageId of the tpa section
             * @param {Object} [options]
             * @example
             * documentServices.tpa.deleteSection("k66c")
             */
            delete: {dataManipulation: deleteSection, isAsyncOperation: true, isUpdatingAnchors: dsUtils.YES},


            /**
             * check if the section is already installed in the site
             *
             * @param {string} appDefinitionId of the app
             *
             * @example
             * documentServices.tpa.section.alreadyInstalled("135aad86-9125-6074-7346-29dc6a3c9bcf");
             */
            alreadyInstalled: sectionAlreadyInstalled,

            /**
             * check if the a given page id has a section installed on it.
             *
             * @param {string} pageId
             *
             * @example
             * documentServices.tpa.section.getPageData("pageId");
             */
            getPageData: getPageData,

            /**
             * Gets the section ref on a given page
             * @param {string} pageId
             * @return the section on the given page or undefined if none exists
             */
            getSectionRefByPageId: getSectionRefByPageId
        },

        /**
         * app
         * @member documentServices.tpa.app
         * @namespace documentServices.tpa.app
         */
        app: {
            /**
             * Gets the app data by application id
             *
             * @param {string} applicationId of the application
             * @return the application data from the client spec map
             *
             * @example
             * documentServices.tpa.app.getData(16);
             */
            getData: getAppData,

            /**
             * Gets the application data by app definition id
             *
             * @param {string} appDefinitionId of the application in query
             *
             * @example
             * documentServices.tpa.app.getDataByAppDefId('1363adbc-c783-b1e0-d8ef-4a661300ac8c')
             * */

            getDataByAppDefId: getAppByAppDefId,

            /**
             * Checks if this application is hybrid
             *
             * @param {string} applicationId of the application in query
             * @example
             * documentServices.tpa.app.isHybrid(16)
             */
            isHybrid: isHybridApp,

            /**
             * Checks if this application was upgraded to premium
             *
             * @param {string} applicationId of the application in query
             * @example
             * documentServices.tpa.app.isPremium(16)
             */
            isPremium: isPremiumApp,

            /**
             * Checks if an application has premium offering
             *
             * @param {string} applicationId of the application in query
             * @example
             * documentServices.tpa.app.hasPremiumOffering(16)
             */
            hasPremiumOffering: hasPremiumOffering,

            /**
             * Checks if this appDefinitionId was upgraded to premium
             *
             * @param {string} appDefinitionId of the application in query
             * @example
             * documentServices.tpa.app.isPremium('1380b703-ce81-ff05-f115-39571d94dfcd')
             */
            isPremiumByAppDefinitionId: isPremiumByAppDefinitionId,

            /**
             * Checks if this application has only one component
             *
             * @param {string} applicationId of the application in query
             * @example
             * documentServices.tpa.app.isLastAppComp(16)
             */
            isLastAppComp: isLastAppComp,

            /**
             * Returns true if and only if the application has been installed in the site
             *
             * @param {string} appDefinitionId of the application
             * @params {boolean} [filterDemoMode] filter out demo mode app
             * @return {boolean} application was installed
             *
             * @example
             * documentServices.tpa.app.isInstalled('13016589-a9eb-424a-8a69-46cb05ce0b2c');
             */
            isInstalled: isAppInstalledBy,

            /**
             * Returns widget data from pageId
             *
             * @param {string} applicationId of the application in query
             * @param {string} tpaPageId of the app widget
             * @example
             * documentServices.tpa.getWidgetDataFromTPAPageId('appDefId', 'page_id');
             */
            getWidgetDataFromTPAPageId: getWidgetDataFromTPAPageId,

            /**
             * Returns widget data from tpaWidgetId
             *
             * @param {string} applicationId of the application in query
             * @param {string} tpaPageId of the app widget
             * @example
             * documentServices.tpa.getWidgetDataFromTPAWidgetId('appDefId', 'tpa_widget_id');
             */
            getWidgetDataFromTPAWidgetId: getWidgetDataFromTPAWidgetId,


            /**
             * Register a callback to be called when an app is installed
             *
             * @param {string} appDefinitionId of the application
             * @return {function} callback when the app was installed
             *
             * @example
             * documentServices.tpa.app.registerOnAppInstalled('13016589-a9eb-424a-8a69-46cb05ce0b2c', function () {]);
             */
            registerOnInstalled: registerOnAppInstalled,

            /**
             * Register a callback to be called when an app is removed
             *
             * @param {string} appDefinitionId of the application
             * @return {function} callback when the app was installed
             *
             * @example
             * documentServices.tpa.app.registerOnAppDeleted('13016589-a9eb-424a-8a69-46cb05ce0b2c', function () {]);
             */
            registerOnDeleted: registerOnAppDeleted,

            /**
             * Get all rendered react comp on site by Application Id
             *
             * @param {string} applicationIdId of the application
             *
             * @example
             * documentServices.tpa.app.getRenderedReactCompsByApplicationId('18');
             */
            getRenderedReactCompsByApplicationId: getRenderedReactCompsByApplicationId,


            /**
             * Get all comps on site by Application Id
             *
             * @param {string} applicationIdId of the application
             *
             * @example
             * documentServices.tpa.app.getAllCompsByApplicationId('18');
             */
            getAllCompsByApplicationId: getAllCompsByApplicationId,

            /**
             * Returns true if and only if a given app has at least one section.
             *
             * @example
             * documentServices.tpa.app.hasSections(appData);
             */
            hasSections: hasSections,

            getDefaultLayout: tpaComponentService.getDefaultLayout,

            /**
             * url
             * @member documentServices.tpa.app.url
             * @namespace documentServices.tpa.app.url
             */
            url: {
                /**
                 * Gets the settings url of the app
                 *
                 * @param {string} applicationId of the application
                 * @param {string} [widgetId] of the application
                 * @return {string} the settings url
                 *
                 * @example
                 * documentServices.tpa.app.url.getSettingsUrl(16, '135aae78-42c9-63b5-d09a-77233cebc1c4', 'comp-1234')
                 */
                getSettingsUrl: tpaSettingsService.getSettingsUrl
            },

            /**
             * Returns this application extensions' widgets
             *
             * @param {Object} appData the application data
             * @example
             * documentServices.tpa.app.getExtensionsWidgets({})
             */
            getExtensionsWidgets: getExtensionsWidgets,

            /**
             * Gets the first application component's page id and comp id. In case the application has a section and
             * a widget - the section's page id anc comp id are returned.
             *
             * @param {string} applicationId of the application in query
             * @example
             * documentServices.tpa.getFirstAppCompPageId("1363adbc-c783-b1e0-d8ef-4a661300ac8c")
             */
            getFirstAppCompPageId: getFirstAppCompPageId,

            refreshApp: refreshApp,

            /**
             * Returns true iff multi section installed (has more than one main section).
             *
             * @param {string} applicationId The application ID of the app
             * @example
             * documentServices.tpa.section.isMultiSectionInstalled("20")
             */
            isMultiSectionInstalled: isMultiSectionInstalled,

            /**
             * Returns the app sections
             *
             * @param {string} applicationId The application ID of the app
             * @example
             * documentServices.tpa.app.getSections("20")
             */
            getSections: getSections,

            /**
             * Returns true if app is proviosned on server and false otherwise
             *
             * @param {string} applicationId The application ID of the app
             * @example
             * documentServices.tpa.app.isAppProvisionedOnServer("20")
             */
            isAppProvisionedOnServer: clientSpecMapService.isAppProvisionedOnServer,

            /**
             * Returns true if app's permissions are revoked
             *
             * @param {string} applicationId The application ID of the app
             * @example
             * documentServices.tpa.app.isPermissionsRevoked("20")
             */
            isPermissionsRevoked: isAppPermissionsIsRevoked,

            /**
             * Returns the widget data of the main section
             *
             * @param {string} applicationId The application ID of the app
             * @example
             * documentServices.tpa.app.getMainSectionWidgetData("20")
             */
            getMainSectionWidgetDataFromApplicationId: clientSpecMapService.getMainSectionWidgetDataFromApplicationId,

            /**
             * Returns the widget data of the main section
             *
             * @param {object} appData The data of the app
             * @example
             * documentServices.tpa.app.getMainSectionWidgetData(appData)
             */
            getMainSectionWidgetData: clientSpecMapService.getMainSectionWidgetData,

            /**
             * Returns true if the app has a main section
             *
             * @param {object} appData The data of the app
             * @example
             * documentServices.tpa.app.hasMainSection(appData)
             */
            hasMainSection: clientSpecMapService.hasMainSection,

            /**
             *  Returns true if the app is a super app (an app Developed internally by Wix)
             *  @param {string} compId a component ID the app is from
             */
            isSuperAppByCompId: function (ps, compId) {
                return clientSpecMapService.isSuperAppByCompId(ps, siteAPI, compId);
            }
        },

        /**
         * change
         * @member documentServices.tpa.change
         * @namespace documentServices.tpa.change
         */
        change: {

            /**
             * Notify the ds the editor mode has changed
             *
             * @param {string} editorMode the editor new mode
             *
             * @example
             * documentServices.tpa.change.editMode('preview');
             */
            editMode: editModeChange,

            /**
             * Notify the ds the site was published
             *
             *
             * @example
             * documentServices.tpa.change.sitePublished();
             */
            siteSaved: siteSaved,

            /**
             * Notify the ds the site was published
             *
             *
             * @example
             * documentServices.tpa.change.sitePublished();
             */
            sitePublished: sitePublished,

            /**
             * Notify the ds the editor switch from mobile to desktop or vice versa
             *
             *
             * @example
             * documentServices.tpa.change.deviceType();
             */
            deviceType: deviceTypeChange,

            /**
             * register
             * @member documentServices.tpa.change.register
             * @namespace documentServices.tpa.change.register
             */
            register: {

                /**
                 * Register for component delete handler.
                 *
                 * @param {String} compId of the component
                 * @param {function} handler A callback function that will get called once a delete comp event happens.
                 */
                deleteCompHandler: registerDeleteCompHandler,

                /**
                 * Register for editor mode change handler.
                 *
                 * @param {String} compId of the component
                 * @param {function} handler A callback function that will get called once the editor mode has changed.
                 */
                editModeChangeHandler: registerEditModeChangeHandler,

                /**
                 * Register for device type change handler.
                 *
                 * @param {String} compId of the component
                 * @param {function} handler A callback function that will get called once the device type has changed.
                 */
                deviceTypeChangeHandler: registerDeviceTypeChangeHandler,

                /**
                 * Register for editor theme change handler.
                 *
                 * @param {String} compId of the component
                 * @param {function} handler A callback function that will get called once the editor theme has changed.
                 */
                themeChangeHandler: registerThemeChangeHandler,

                /**
                 * Register for window placement  change handler.
                 *
                 * @param {String} compId of the component
                 * @param {function} handler A callback function that will get called once the editor mode has changed.
                 */
                windowPlacementChangedHandler: registerWindowPlacementChangedHandler,

                /**
                 * Register for settings update change handler.
                 *
                 * @param {String} compId of the component
                 * @param {function} handler A callback function that will get called once the editor mode has changed.
                 */
                settingsUpdatedHandler: registerSettingsUpdatedHandler,

                /**
                 * Register for set public data change handler.
                 *
                 * @param {String} compId of the component
                 * @param {function} handler A callback function that will get called once the editor mode has changed.
                 */
                registerPublicDataChangedHandler: registerPublicDataChangedHandler,

                /**
                 * Register for site published handler.
                 *
                 * @param {String} compId of the component
                 * @param {function} handler A callback function that will get called once the site is published
                 */
                sitePublishedHandler: registerSitePublishedHandler,

                /**
                 * Register a handler for site saved event.
                 *
                 * @param {String} compId - id of the component
                 * @param {function} handler A callback function that will get called once the site is saved
                 */
                siteSavedHandler: registerSiteSavedHandler
            },

            /**
             * trigger
             * @member documentServices.tpa.change.trigger
             * @namespace documentServices.tpa.change.trigger
             */
            trigger: {

                /**
                 * Tell the ds that the window placement was changed
                 * @param  {String} placement of the glued widget
                 */
                windowPlacement: triggerOnWindowPlacementChanged,

                /**
                 * Tell the ds that the setting app triggered an update
                 *
                 * @param {String} applicationId the app application id
                 * @param {String} targetCompId the target comp id or * to broadcast the data to all the app components
                 * @param {Object} message the data to broadcast
                 *
                 * @example
                 * var applicationId = 16;
                 * var targetCompIds = 'compId';
                 * var message = {
                 *      data: 'show-all'
                 * };
                 * documentServices.tpa.triggerSettingsUpdated(applicationId, targetCompId, message);
                 */
                settingsUpdated: triggerSettingsUpdated
            }
        },

        getComponentDefinition: getComponentDefinition,

        getSettingsModalParams: getSettingsModalParams,

        pending: {
            /**
             * Add a pending app
             * @param appDefId
             * @example
             * documentServices.tpa.pending.add('appDefId');
             */
            add: pendingAppsService.addPendingDashboardApp,
            /**
             * Dismiss a pending app from the meta-site
             * @param appDefId
             * @example
             * documentServices.tpa.pending.dismiss('appDefId');
             */
            dismiss: pendingAppsService.dismiss,
            /**
             * Returns premium pending applications
             *
             * @return {Array} list of pending applications
             *
             * @example
             * documentServices.tpa.pending.getPendingApps()
             */
            getPendingApps: pendingAppsService.getPendingAppsFromSiteMetaData
        },

        /**
         * Returns hybrid pending applications
         *
         * @return {Array} list of pending applications
         * @deprecated
         *
         * @example
         * documentServices.tpa.getPendingApps()
         */
        getPendingApps: pendingAppsService.getPendingApps,

        /**
         * Returns premium pending applications
         *
         * @return {Array} list of pending applications
         * @deprecated
         * @example
         * documentServices.tpa.getPendingApps()
         */
        getPremiumPendingApps: pendingAppsService.getPremiumPendingApps,

        /**
         * AppMarket
         * @member documentServices.tpa.appMarket
         * @namespace documentServices.tpa.appMarket
         */
        appMarket: {
            /**
             * Returns app market data for the given appDefinitionId
             *
             * @param {String} appDefinitionId
             * @returns {Object} app market data
             */
            getData: appMarketService.getAppMarketData,

            /**
             * Returns app market data for the given pageId
             *
             * @param {String} pageId
             * @returns {Object} app market data
             */
            getDataForPage: appMarketService.getAppMarketDataForPage,

            /**
             * Returns app market data for the given appDefinitionId or retrieves it async
             *
             * @param {String} appDefinitionId
             * @returns Promise
             */
            getDataAsync: appMarketService.getAppMarketDataAsync,

            /**
             * Returns app market URL which is its iframe src
             *
             * @param {Object} editorParams Set of parameters from editor
             * @returns String
             * @example
             * documentServices.tpa.appMarket.getUrl({
             *  openAppDefId: '1234',
             *  experiments: 'exp1',
             *  query: 'tag1',
             *  origin: 'http://editor.wix.com',
             *  appDefinitionId: '1234'
             * });
             */
            getUrl: appMarketService.getAppMarketUrl,

            /**
             * Returns app market info URL which is its iframe src
             *
             * @param {Object} editorParams Set of parameters from editor
             * @returns String
             * @example
             * documentServices.tpa.appMarket.getInfoUrl({
             *  openAppDefId: '1234',
             *  experiments: 'exp1',
             *  query: 'tag1',
             *  origin: 'http://editor.wix.com',
             *  appDefinitionId: '1234'
             * });
             */
            getInfoUrl: appMarketService.getAppMarketInfoUrl,

            /**
             * Returns the app info URL, on the reviews tab
             *
             * @param {Object} editorParams Set of parameters from editor:
             * origin (mandatory) ,
             * openMarketOrigin (mandatory),
             * test (optional)
             * @returns String
             * @example
             * documentServices.tpa.appMarket.getAppReviewsUrl({
             *  origin: 'http://editor.wix.com',
             *  openMarketOrigin: 'settings_panel,
             *  tests: 'exp1'
             * });
             */
            getAppReviewsUrl: appMarketService.getAppReviewsUrl,

            /**
             * Returns app market permissions URL which is its iframe src
             *
             * @param {Object} editorParams Set of parameters from editor
             * @returns String
             * @example
             * documentServices.tpa.appMarket.getPermissionsUrl({
             *  openAppDefId: '1234',
             *  experiments: 'exp1',
             *  query: 'tag1',
             *  origin: 'http://editor.wix.com',
             *  appDefinitionId: '1234'
             * });
             */
            getPermissionsUrl: appMarketService.getAppMarketPermissionsUrl,

            /**
             * Returns app market related apps
             * @returns Array
             * @example
             * documentServices.tpa.appMarket.getRelatedApps(function(apps){console.log(apps)});
             */
            getRelatedApps: appMarketService.getRelatedApps,

            /**
             * Returns app market packages with purchase url and currency info for the given appDefinitionId and instanceId
             *
             * @param {String} appDefinitionId
             * @param {String} instanceId
             * @returns Promise
             * @example
             * documentServices.tpa.appMarket.getPackages('appDefId','instanceId');
             */
            getPackages: appMarketService.getPackages

        },

        billing: {
            /**
             * Returns premium apps
             * @returns Array containing appDefinitionIds of upgraded apps
             * @example
             * documentServices.tpa.billing.getPremiumApps(function(appDefIds){console.log(appDefIds)});
             */
            getPremiumApps: appMarketService.getPremiumApps,

            /**
             * Returns the meta site upgrade url
             * @param {Object} url params referralAdditionalInfo
             * @returns String
             * @example
             * documentServices.tpa.billing.getSiteUpgradeUrl({referralAdditionalInfo : 'gfpp'});
             */
            getSiteUpgradeUrl: billingService.getSiteUpgradeUrl,

            /**
             * Gets upgrade to premium url for an app.
             *
             * @function
             * @memberof documentServices.tpa
             * @param {string} applicationId
             * @param {string} vendorProductId
             * @param {string} paymentCycle could be 'YEARLY' or 'MONTHLY', default: 'MONTHLY'
             * @parma {Object} options param like pp_type and referralAdditionalInfo
             * @return {string} upgrade page payment url
             *
             * @example
             * documentServices.tpa.billing.getAppUpgradeUrl(16, 'Premium1', 'MONTHLY', options);
             */
            getAppUpgradeUrl: billingService.getAppUpgradeUrl
        },

        /**
         * style
         * @member documentServices.tpa.style
         * @namespace documentServices.tpa.style
         */
        style: {

            /**
             * Set style param handler for SDK 1.22.0-1.24.0.
             *
             * @param {String} compId the component id
             * @param {Object} data the style param data.
             */
            setParamOldSDK: {dataManipulation: setStyleParam, getReturnValue: idGenerator.getStyleIdToAdd},

            setStyleParam: {dataManipulation: tpaStyleService.setStyleParam},

            mapWixParamsToCssValues: tpaStyleService.mapWixParamsToCssValues,

            /**
             * Returns theme and style data to the given component
             *
             * @param {String} component id
             * @returns Object style data
             */
            get: getStyleDataToPassIntoApp,

            postBackThemeData: tpaComponentService.postBackThemeData,

            /**
             * Returns Name To FontsKey Map
             *
             * @returns Returns Name To FontsKey Map
             */
            getNameToFontsKeyMap: getNameToFontsKeyMap,

            /**
             * Returns a map of tpa colors to site colors
             *
             * @returns Returns Name To FontsKey Map
             */
            getTpaColorsToSiteColors: tpaStyleService.getTpaColorsToSiteColors
        },

        provision: {
            /**
             * Provision application in demo mode
             *
             * @param {String} applicationId the application id to provision
             */
            provisionAppDemoSave: {dataManipulation: provisionAppDemoSave, isAsyncOperation: true},
            refreshAppSpecMap: provisionService.refreshSpecMap
        },

        /**
         * Tpa constants
         *
         * Constants Definitions for tpa components:
         * TYPE: Describe the tpa type constants: TPASection, TPAMultiSection and etc
         * @example documentServices.tpa.constants.TYPE.TPA_WIDGET
         *
         * COMP_TYPES: Describes tpa component types: 'wysiwyg.viewer.components.tpapps.TPASection', 'wysiwyg.viewer.components.tpapps.TPAMultiSection'
         * @example documentServices.tpa.constants.COMP_TYPE.TPA_WIDGET
         *
         * TPA_COMP_TYPES: Deprecated - Describes tpa component types: 'tpa.viewer.components.tpapps.TPASection', 'tpa.viewer.components.tpapps.TPAMultiSection'
         * @example documentServices.tpa.constants.TPA_COMP_TYPE.TPA_WIDGET
         *
         * SKINS: Describes tpa component skins: 'wysiwyg.viewer.skins.TPASectionSkin', 'wysiwyg.viewer.skins.TPAWidgetSkin'
         * @example documentServices.tpa.constants.SKINS.TPA_WIDGET
         *
         * APP_MARKET: Describes App Market Urls
         * @example documentServices.tpa.constants.APP_MARKET.EDITOR_BASE_URL
         */
        constants: tpaConstants,

        /**
         * Tpa BI error and events constants
         *
         */
        bi: {
            /*
             * TPA Bi errors constants
             *
             * @example documentServices.tpa.bi.errors.EVENT_TYPE_NOT_SUPPORTED
             */
            errors: errors,

            /*
             * Send a BI event for a message to the SDK endpoint from a specified origin
             *
             * @example documentServices.tpa.bi.sendBIEvent(msg, 'editor');
             */
            sendBIEvent: sendBIEvent
        },

        comp: {
            /*
             * resize a comp
             *
             * @example documentServices.tpa.comp.resize(compPointer, {width: 100, height: 100});
             */
            resize: resizeComponent,

            /*
             * set a comp externalId
             *
             * @example documentServices.tpa.comp.setExternalId(compPointer, '123-456-789');
             */
            setExternalId: setExternalId,

            /*
             * get a comp externalId if one is set
             *
             * @example documentServices.tpa.comp.getExternalId(compPointer);
             */
            getExternalId: getExternalId,

            /*
             * post message back to the comp iframe
             */
            postMessageBackToApp: tpaComponentService.postMessageBackToApp
        },

        data: {
            set: {dataManipulation: tpaDataService.set, isUpdatingAnchors: dsUtils.DONT_CARE},
            app: {
                get: tpaDataService.getAppValue,
                getMulti: tpaDataService.getAppValues
            },
            comp: {
                get: tpaDataService.getComponentValue,
                getMulti: tpaDataService.getComponentValues
            },
            remove: tpaDataService.remove,
            SCOPE: tpaDataService.SCOPE,

            // TODO: remove once santa-editor version is deployed
            get: tpaDataService.get,
            getMulti: tpaDataService.getMulti
        },

        __privates: {
            fixEcomIfNeeded: {dataManipulation: fixEcomIfNeeded, isUpdatingAnchors: dsUtils.YES, getReturnValue: page.getPageIdToAdd},
            areDocumentServicesHandlersReady: areDocumentServicesHandlersReady

        }
    };
});
