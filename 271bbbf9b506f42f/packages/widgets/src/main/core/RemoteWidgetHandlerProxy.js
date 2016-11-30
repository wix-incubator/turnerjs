define([
    'lodash',
    'core',
    'widgets/core/dataResolvers/widgetDataResolvers',
    'widgets/core/modelBuilder',
    'widgets/messages/messageBuilder'
], function(_, core, widgetDataResolvers, modelBuilder, messageBuilder) {
    'use strict';

    var CommandTypes = {
        State: 'stateChanged',
        Data: 'dataChanged',
        Design: 'designChanged',
        Props: 'propsChanged',
        EventRegister: 'registerEvent',
        EventUnregisterAll: 'unregisterAll',
        Layout: 'layoutChanged',
        Behavior: 'executeBehavior'
    };
    var MessageTypes = {
        WidgetReady: 'widget_ready'
    };

    function onRemoteModelInterfaceUpdate(compId, type, changes, cb) {
        var typeToMethod = {
            data: this._runtimeDal.setCompData.bind(this._runtimeDal),
            design: this._runtimeDal.setCompDesign.bind(this._runtimeDal),
            props: this._runtimeDal.setCompProps.bind(this._runtimeDal),
            layout: this._runtimeDal.updateCompLayout.bind(this._runtimeDal),
            registerEvent: registerComponentEvent.bind(this),
            unregisterAll: unregisterAllEventHandlers.bind(this)
        };

        typeToMethod[type](compId, changes);

        if (_.isFunction(this._onUpdateCallback)) {
            this._onUpdateCallback(cb);
        }
    }

    function registerComponentEvent(compId, newEventData) {
        var actionBehavior = {
            action: {
                type: 'comp',
                name: newEventData.eventType,
                sourceId: compId
            },
            behavior: {
                type: 'widget',
                targetId: newEventData.contextId,
                params: {
                    callbackId: newEventData.callbackId,
                    compId: compId
                },
                name: 'runCode'
            }
        };

        this._runtimeDal.addActionsAndBehaviors(compId, actionBehavior);
    }

    function unregisterAllEventHandlers (compId, data) {
        this._runtimeDal.removeActionsAndBehaviors(compId, {action: {name: data.eventType}});
    }

    function buildContextModels(contextIds) {
        var siteDataDocumentAPI = this._siteAPI.getSiteDataAPI().document;
        var componentsFetcher = siteDataDocumentAPI.getAllCompsUnderRoot.bind(siteDataDocumentAPI);
        return modelBuilder.build(this._siteAPI.getRuntimeDal(), this._siteAPI.getSiteData(), contextIds, onRemoteModelInterfaceUpdate.bind(this), componentsFetcher);
    }

    function createSiteInfo() {
        var siteData = this._siteAPI.getSiteData();
        return {
            deviceType: siteData.isMobileView() ? 'mobile' : 'desktop'
        };
    }


    function RemoteWidgetHandlerProxy(siteAPI, onUpdateCallback) {
        this._runtimeDal = siteAPI.getRuntimeDal();
        this._siteAPI = siteAPI;
        this._remoteModelInterfaces = {};
        this._onUpdateCallback = onUpdateCallback;
        this._updatingWidget = false;
        this._readyWidgets = {};
    }

    function getActiveWidget(widgetId) {
        return this._remoteModelInterfaces[widgetId];
    }

    function getEvent(event) {
        var result = _.pick(event, _.negate(_.isObject));
        result.nativeEvent = _.pick(event.nativeEvent, _.negate(_.isObject));
        return result;
    }

    RemoteWidgetHandlerProxy.prototype.initWidgets = function(controllers) {
        var message = messageBuilder.initWidgetsMessage(controllers);
        this._sendMessage(message);
    };

    RemoteWidgetHandlerProxy.prototype.startWidgets = function(contextIds) {
        if (_.isEmpty(contextIds)) {
            return;
        }
        _.assign(this._remoteModelInterfaces, buildContextModels.call(this, contextIds));
        _.forEach(contextIds, function(contextId) {//why is this needed??
            this._readyWidgets[contextId] = false;
        }, this);
        var contextIdToModelMap = _.mapValues(this._remoteModelInterfaces, function(contextRMI){
            return contextRMI.toJson();
        });
        var siteInfo = createSiteInfo.call(this);
        var message = messageBuilder.startWidgetsMessage(contextIdToModelMap, siteInfo);
        this._sendMessage(message);
    };

    /**
     * @param widgetsIdAndType {{id: string, type: string}[]} an array of widgets' id & type
     * @param rootIds
     */
    RemoteWidgetHandlerProxy.prototype.loadWidgets = function(widgetsIdAndType, rootIds) {
        var message = messageBuilder.loadWidgetsMessage(widgetsIdAndType, this._siteAPI.getSiteData().getRouters(), rootIds);
        this._sendMessage(message);
        _.forEach(widgetsIdAndType, function(widgetInfo) {
            this._readyWidgets[widgetInfo.id] = false;
            delete this._remoteModelInterfaces[widgetInfo.id];
        }, this);
    };

    RemoteWidgetHandlerProxy.prototype.getActiveWidgetIds = function() {
        return _.keys(this._remoteModelInterfaces);
    };

    RemoteWidgetHandlerProxy.prototype.stopWidgets = function(contextIds) {
        if (_.isEmpty(contextIds)) {
            return;
        }
        _.forEach(contextIds, function(contexId){
            delete this._remoteModelInterfaces[contexId];
            this._readyWidgets[contexId] = false;
        }, this);
        var message = messageBuilder.stopWidgetsMessage(contextIds);
        this._sendMessage(message);
    };

    RemoteWidgetHandlerProxy.prototype.stopAllWidgets = function() {
        this.stopWidgets(_.keys(this._remoteModelInterfaces));
    };

    RemoteWidgetHandlerProxy.prototype.updateComponent = function(message) {
        this._sendMessage(message);
    };

    RemoteWidgetHandlerProxy.prototype.handleWidgetUpdate = function(compUpdates) {
        var compId = _(compUpdates).keys().first();//is it possible to update more than one component at a time?
        var contextToRmi = _.pick(this._remoteModelInterfaces, function(rmi){
            return _.has(rmi.toJson(), ['components', compId]);
        });
        if (!_.isEmpty(contextToRmi) && !this._updatingWidget) {
            var contextId = _(contextToRmi).keys().first();
            contextToRmi[contextId].updateModel(compUpdates);
            var message = messageBuilder.updateWidgetMessage(contextId, compUpdates);
            this._sendMessage(message);
        }
    };

    function resolveData(siteAPI, Dal, compId, data) {
        var siteData = siteAPI.getSiteData();
        var dataToResolve = _.assign({}, Dal.getCompData(compId), data);
        var compProps = Dal.getCompProps(compId);
        dataToResolve = widgetDataResolvers.resolve(dataToResolve, siteAPI, compProps);
        return siteData.resolveData(dataToResolve, siteData.getPrimaryPageId(), siteData.dataTypes.DATA);
    }

    RemoteWidgetHandlerProxy.prototype.handleRemoteMessage = function(message) {
        switch (message.type) {
            case MessageTypes.WidgetReady:
                if (getActiveWidget.call(this, message.widgetId)) {
                    this._readyWidgets[message.widgetId] = true;
                    this._onUpdateCallback();
                }
                break;
        }
    };

    // TODO: move onCommand to be a private function that is called from inside handleRemoteMessage
    RemoteWidgetHandlerProxy.prototype.onCommand = function (message, callback) {
        this._updatingWidget = true;
        var RMI = this._remoteModelInterfaces[message.contextId];
        if (!RMI) {
            return;
        }
        switch (message.command) {
            case CommandTypes.State:
                RMI.setState(message.compId, message.data);
                break;
            case CommandTypes.Data:
                message.data = resolveData(this._siteAPI, this._runtimeDal, message.compId, message.data);
                RMI.setData(message.compId, message.data);
                break;
            case CommandTypes.Design:
                RMI.setDesign(message.compId, message.data);
                break;
            case CommandTypes.Layout:
                RMI.setLayout(message.compId, message.data);
                break;
            case CommandTypes.Props:
                RMI.setProps(message.compId, message.data, callback);
                break;
            case CommandTypes.EventRegister:
                RMI.registerEvent(message.contextId, message.compId, message.data.eventType, message.data.callbackId);
                break;
            case CommandTypes.EventUnregisterAll:
                RMI.unregisterAll(message.compId, message.data.eventType);
                break;
            case CommandTypes.Behavior:
                var behavior = message.data;
                var event = {group: 'command', callback: callback};
                core.behaviorsService.handleBehaviors(this._siteAPI, [behavior], event, behavior.type);
                if (this._onUpdateCallback) {
                    this._onUpdateCallback(callback);
                }
                break;
        }
        this._updatingWidget = false;
    };

    RemoteWidgetHandlerProxy.prototype.handleEvent = function(contextId, name, params, event) {
        var message;
        switch (name) {
            case 'runCode' :
                message = {
                    intent: 'WIX_CODE',
                    type: 'wix_code_run_user_function',
                    contextId: contextId,
                    callbackId: params.callbackId,
                    compId: params.compId,
                    event: getEvent(event)
                };
                break;
            default:
                break;
        }
        this._sendMessage(message);
    };

    RemoteWidgetHandlerProxy.prototype.isWidgetReady = function (widgetId) {
        return !!this._readyWidgets[widgetId];
    };

    RemoteWidgetHandlerProxy.prototype._sendMessage = function(message) {
        var wixCodeAppApi = this._siteAPI.getWixCodeAppApi();

        wixCodeAppApi.sendMessage(message);
    };

    return RemoteWidgetHandlerProxy;
});
