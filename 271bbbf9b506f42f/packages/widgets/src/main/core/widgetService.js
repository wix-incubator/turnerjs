define([
    'lodash',
    'utils',
    'widgets/core/widgetDataHelper',
    'widgets/core/RemoteWidgetHandlerProxy',
    'coreUtils',
    'wixCodeInit'
], function (_, utils, widgetDataHelper, RemoteWidgetHandlerProxy, coreUtils, wixCodeInit) {
    "use strict";

    // Utils

    function shouldActivateApps(siteData) {
        return !!siteData.renderFlags.initWixCode; // TODO: rename to widgetsActive ?
    }

    function createAndRegisterWidgetHandler(aspectSiteAPI, updateSite) {
        var widgetHandler = new RemoteWidgetHandlerProxy(aspectSiteAPI, updateSite);
        registerWidgetHandler(aspectSiteAPI, widgetHandler);
    }

    // Widget Model Updates

    function handleRuntimeDalCompChange(siteAPI, compId, changeObject) {
        var changeToValueKey = {
            dataChange: 'data',
            propsChange: 'props',
            stateChange: 'state',
            layoutChange: 'layout'
        };
        var compUpdates = _.zipObject([changeToValueKey[changeObject.type]], [changeObject.value]);
        var modelUpdates = _.zipObject([compId], [compUpdates]);

        getWidgetHandler(siteAPI).handleWidgetUpdate(modelUpdates);
    }

    function handleDisplayedJsonUpdate(siteAPI, pageId, rootCompId) {
        if (!_.includes(siteAPI.getAllRenderedRootIds(), pageId)) {
            return;
        }

        var runtimeDal = siteAPI.getRuntimeDal();
        var siteDataAPI = siteAPI.getSiteDataAPI();

        var allRelatedComps = siteDataAPI.document.getAllCompsUnderRoot(pageId, rootCompId);
        var modelUpdates = _(allRelatedComps)
            .omit(['masterPage'])
            .mapValues(function (compStructure) {
                return utils.widgetModel.getCompModel(runtimeDal, compStructure.id);
            })
            .value();

        getWidgetHandler(siteAPI).handleWidgetUpdate(modelUpdates);
    }

    // Widget Lifecycle

    function loadAppsInRootsIfNeeded(rootIds, loadedAppsRoots, siteAPI) {
        var rootsToActivate = _.difference(rootIds, _.map(loadedAppsRoots, 'rootId'));
        if (!_.isEmpty(rootsToActivate)) {
            loadedAppsRoots = loadApps(siteAPI, loadedAppsRoots, rootIds);
            initApps(siteAPI, rootsToActivate);
        }
        return loadedAppsRoots;
    }

    function markAppsAsStarted(loadedAppsRoots, appsRootsToStart) {
        return _.map(loadedAppsRoots, function (rootObj) {
            return _.includes(appsRootsToStart, rootObj.rootId) ? _.assign(rootObj, {started: true}) : rootObj;
        });
    }

    function updateAppsLifecycle(siteAPI, loadedAppsRoots, rootIds) {
        var siteData = siteAPI.getSiteData();
        var handler = getWidgetHandler(siteAPI);
        rootIds = _.without(rootIds, utils.siteConstants.MASTER_PAGE_ID);

        var applicationsToLoad = wixCodeInit.appsUtils.getApplications(siteData.getClientSpecMap(), rootIds, siteData);
        if (_.isEmpty(applicationsToLoad)) {
            return loadedAppsRoots;
        }

        loadedAppsRoots = loadAppsInRootsIfNeeded(rootIds, loadedAppsRoots, siteAPI);
        var appsRootsToStart = _(loadedAppsRoots)
            .reject({started: true})
            .map('rootId')
            .value();

        if (_.isEmpty(appsRootsToStart)) {
            return loadedAppsRoots;
        }

        handler.startWidgets(appsRootsToStart);
        loadedAppsRoots = markAppsAsStarted(loadedAppsRoots, appsRootsToStart);
        return loadedAppsRoots;
    }

    function getAppsRootIdsToStop(loadedAppsRoots, rootIds) {
        var appsRootsToStop = _.reject(loadedAppsRoots, function (rootObj) {
            return _.includes(rootIds, rootObj.rootId);
        });
        return _.map(appsRootsToStop, 'rootId');
    }

    function stopLoadedAppsInRoots(siteAPI, loadedAppsRoots, appsRootIdsToStop) {
        var handler = getWidgetHandler(siteAPI);
        if (_.isEmpty(appsRootIdsToStop) || _.isEmpty(loadedAppsRoots)) {
            return loadedAppsRoots;
        }
        handler.stopWidgets(appsRootIdsToStop);

        return _.reject(loadedAppsRoots, function(rootObj){
            return _.includes(appsRootIdsToStop, rootObj.rootId);
        });
    }

    function syncAppsState(siteAPI, loadedAppsRoots) {
        var renderedRootIds = _.without(siteAPI.getRootIdsWhichShouldBeRendered(), 'masterPage');
        if (shouldActivateApps(siteAPI.getSiteData())) {
            var rootIdsToStop = getAppsRootIdsToStop(loadedAppsRoots, renderedRootIds);
            loadedAppsRoots = stopLoadedAppsInRoots(siteAPI, loadedAppsRoots, rootIdsToStop);
            return updateAppsLifecycle(siteAPI, loadedAppsRoots, renderedRootIds);
        }
        return stopLoadedAppsInRoots(siteAPI, loadedAppsRoots, renderedRootIds);
    }

    function getRootPages(rootId, siteData) {
        var pageData = siteData.getPageData(rootId);
        var rootPages = [{id: rootId, json: pageData}];
        if (_.get(siteData.getDataByQuery(rootId), 'isPopup')) {
            return rootPages;
        }
        var masterPageId = utils.siteConstants.MASTER_PAGE_ID;
        return rootPages.concat({id: masterPageId, json: siteData.getPageData(masterPageId)});
    }

    function getConnections(pageJsons, siteData) {
        return _(pageJsons)
            .transform(function(acc, json) {
                _.assign(acc, _.get(json, 'data.connections_data'));
            }, {})
            .values()
            .map(function (connectionData) {
                var resolvedData = siteData.resolveData(connectionData, null, siteData.dataTypes.CONNECTIONS);
                return _.get(resolvedData, 'items');
            })
            .flatten()
            .groupBy('controllerId')
            .value();
    }

    function isController(compStructure){
        return compStructure.componentType === 'platform.components.AppController';
    }

    function buildControllerArray(pages, siteData) {
        var connections = getConnections(_.map(pages, 'json'), siteData);
        return _(pages)
            .map(function (page) {
                return {
                    rootId: page.id,
                    controllers: coreUtils.dataUtils.getAllCompsInStructure(_.get(page, 'json.structure'), false, isController)
                };
            })
            .map(function(controllersObj){
                return _.map(controllersObj.controllers, function (controller) {
                    var controllerDataQuery = controller.dataQuery.replace('#', '');
                    return _.merge({
                        controllerBehaviors: _.get(siteData.getDataByQuery(controller.behaviorQuery, controllersObj.rootId, siteData.dataTypes.BEHAVIORS), 'items', []),
                        controllerData: siteData.getDataByQuery(controllerDataQuery, controllersObj.rootId),
                        controllerId: controllerDataQuery,
                        compId: controller.id
                    }, {
                        connections: _.get(connections, controllerDataQuery)
                    });
                });
            })
            .flatten()
            .value();
    }

    function buildControllersToInitMap(controllerArray) {
        return _(controllerArray)
            .groupBy(function (controllerObj) {
                return _.get(controllerObj, 'controllerData.applicationId');
            })
            .mapValues(function(controllers){
                return _(controllers)
                    .groupBy('controllerId')
                    .mapValues(function (controllerObjArray) {
                        return _.pick(_.first(controllerObjArray), ['controllerData', 'controllerBehaviors', 'connections', 'compId']);
                    })
                    .value();
            })
            .value();
    }

    // Handlers
    function registerWidgetHandler(siteAPI, widgetHandler) {
        var widgetsStore = siteAPI.getSiteData().widgetsStore;
        widgetDataHelper.registerWidgetHandler(widgetsStore, widgetHandler);
    }

    function getWidgetHandler(siteAPI) {
        var widgetsStore = siteAPI.getSiteData().widgetsStore;
        return widgetDataHelper.getWidgetHandler(widgetsStore);
    }

    // Widgets
    function filterValidRootIds(rootIds, siteData) {
        return _(rootIds)
            .without(utils.siteConstants.MASTER_PAGE_ID)
            .filter(siteData.getPageTitle, siteData)
            .value();
    }

    function loadApps(siteAPI, loadedAppsRoots, rootIds) {
        var siteData = siteAPI.getSiteData();
        var rootIdsToLoad = filterValidRootIds(rootIds, siteData);
        var areAppsInRootLoaded = _(rootIdsToLoad)
            .difference(_.map(loadedAppsRoots, 'rootId'))
            .thru(_.isEmpty)
            .value();
        if (areAppsInRootLoaded) {
            return loadedAppsRoots;
        }
        var applicationsToLoad = wixCodeInit.appsUtils.getApplications(siteData.getClientSpecMap(), rootIdsToLoad, siteData);
        if (_.isEmpty(applicationsToLoad)) {
            return loadedAppsRoots;
        }
        var handler = getWidgetHandler(siteAPI);
        handler.loadWidgets(applicationsToLoad, rootIdsToLoad);
        var newLoadedRoots = _.map(rootIdsToLoad, function(rootId){
            return {rootId: rootId};
        });
        return loadedAppsRoots.concat(newLoadedRoots);
    }

    function getControllersToInit(siteData, rootId) {
        var pages = getRootPages(rootId, siteData);
        var controllerArray = buildControllerArray(pages, siteData);
        return buildControllersToInitMap(controllerArray);
    }

    function initApps(siteAPI, rootIds) {
        var siteData = siteAPI.getSiteData();
        var controllersToInit = _(rootIds)
            .without(utils.siteConstants.MASTER_PAGE_ID)
            .transform(function(acc, rootId){
                acc[rootId] = getControllersToInit(siteData, rootId);
            }, {})
            .omit(_.isEmpty)
            .value();

        if (_.isEmpty(controllersToInit)) {
            return;
        }
        var handler = getWidgetHandler(siteAPI);
        handler.initWidgets(controllersToInit);
    }

    function stopApps(siteAPI, loadedAppsRoots, rootIds) {
        var noAppsToStop = _(siteAPI.getAllRenderedRootIds())
            .intersection(rootIds)
            .thru(_.isEmpty)
            .value();
        if (noAppsToStop) {
            return loadedAppsRoots;
        }
        return stopLoadedAppsInRoots(siteAPI, loadedAppsRoots, rootIds);
    }

    function getWixCodeAppApi(siteAPI) {
        return siteAPI.getWixCodeAppApi();
    }

    function registerWidgetMessageHandler(siteAPI, handler) {
        var wixCodeAppApi = getWixCodeAppApi(siteAPI);
        wixCodeAppApi.registerMessageHandler(handler);
    }

    function registerWidgetMessageModifier(siteAPI, modifier) {
        var wixCodeAppApi = getWixCodeAppApi(siteAPI);

        wixCodeAppApi.registerMessageModifier(modifier);
    }

    function sendMessageToWidget(siteAPI, message) {
        var wixCodeAppApi = getWixCodeAppApi(siteAPI);

        wixCodeAppApi.sendMessage(message);
    }

    return {
        getWidgetHandler: getWidgetHandler,
        syncAppsState: syncAppsState,
        handleRuntimeDalCompChange: handleRuntimeDalCompChange,
        handleDisplayedJsonUpdate: handleDisplayedJsonUpdate,
        createAndRegisterWidgetHandler: createAndRegisterWidgetHandler,
        loadApps: loadApps,
        initApps: initApps,
        stopApps: stopApps,
        getControllersToInit: getControllersToInit,
        registerWidgetMessageHandler: registerWidgetMessageHandler,
        registerWidgetMessageModifier: registerWidgetMessageModifier,
        sendMessageToWidget: sendMessageToWidget
    };
});
