define([
    'lodash',
    'coreUtils',
    'widgets/core/widgetDataHelper',
    'widgets/core/widgetService',
    'widgets/core/modelBuilderDataHelper',
    'experiment'
], function (_, utils, widgetDataHelper, widgetService, modelBuilderDataHelper, experiment) {
    "use strict";

    // WidgetAspect
    function WidgetAspect(aspectSiteAPI) {
        this._siteAPI = aspectSiteAPI;
        this._loadedAppsRoots = [];
        widgetService.createAndRegisterWidgetHandler(aspectSiteAPI, this.updateSite);
        if (experiment.isOpen('sv_platform1')) {
            this._siteAPI.registerToSiteWillMount(syncAppsState.bind(this));
            this._siteAPI.registerToSiteWillUpdate(syncAppsState.bind(this));
        }

        this._siteAPI.getRuntimeDal().registerChangeListener(_.partial(widgetService.handleRuntimeDalCompChange, this._siteAPI));
        if (experiment.isOpen('sv_hoverBox')) {
            this._siteAPI.getSiteDataAPI().registerDisplayedJsonUpdateCallback(_.partial(widgetService.handleDisplayedJsonUpdate, this._siteAPI));
        }

        this.getWidgetHandler = _.partial(widgetService.getWidgetHandler, this._siteAPI);
    }

    // Widget Lifecycle

    function syncAppsState() {
        this._loadedAppsRoots = widgetService.syncAppsState(this._siteAPI, this._loadedAppsRoots);
    }

    WidgetAspect.prototype.updateSite = function(cb) {
        if (!this._updating) {
            this._updating = true;
            var self = this;
            utils.animationFrame.request(function () {
                self._updating = false;
                self._siteAPI.forceUpdate(_.isFunction(cb) ? cb : _.noop);
            });
        }
    };

    // Readiness

    function getAppsContextId(rootId, loadedAppsRootIds, siteData) {
        if (rootId !== 'masterPage') {
            return rootId;
        }
        return _.find(loadedAppsRootIds, function(widgetId) {
            var rootData = siteData.getDataByQuery(widgetId);
            return modelBuilderDataHelper.getWidgetType(rootData) === modelBuilderDataHelper.WIDGET_TYPES.PAGE;
        });
    }

	WidgetAspect.prototype.allContextsReady = function () {
        return _(this._loadedAppsRoots).map('rootId').every(this.isContextReady, this);
    };

    WidgetAspect.prototype.isContextReady = function(rootId) {
        var siteData = this._siteAPI.getSiteData();
        var widgetsStore = siteData.widgetsStore;
        var handler = widgetDataHelper.getWidgetHandler(widgetsStore);
        var loadedAppsRootIds = _.map(this._loadedAppsRoots, 'rootId');
        var appsContextId = getAppsContextId(rootId, loadedAppsRootIds, siteData);
        if (_.isEmpty(this._loadedAppsRoots)) {
            return true;
        }
        return _.includes(loadedAppsRootIds, appsContextId) && handler.isWidgetReady(appsContextId);
    };

    WidgetAspect.prototype.loadApps = function(rootIds) {
        if (!this._siteAPI.getSiteData().renderFlags.initWixCode) {
            return;
        }
        this._loadedAppsRoots = widgetService.loadApps(this._siteAPI, this._loadedAppsRoots, rootIds);
    };

    WidgetAspect.prototype.initApps = function(rootIds) {
        if (!this._siteAPI.getSiteData().renderFlags.initWixCode) {
            return;
        }
        widgetService.initApps(this._siteAPI, rootIds);
    };

    WidgetAspect.prototype.stopApps = function(rootIds) {
        this._loadedAppsRoots = widgetService.stopApps(this._siteAPI, this._loadedAppsRoots, rootIds);
    };

    WidgetAspect.prototype.restartApps = function () {
        if (_.isEmpty(this._loadedAppsRoots)) {
            return;
        }

	    var rootIds = _.map(this._loadedAppsRoots, 'rootId');
        this.stopApps(rootIds);
        this.loadApps(rootIds);
        this.initApps(rootIds);
    };

    return WidgetAspect;
});
