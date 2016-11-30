define(['lodash'], function(_){
    'use strict';

    function mockAppWidgetDef(id, url){
        return {
            type: 'Application',
            id: id, //applicationId from clientSpecMap
            url: url //app url from clientSpecMap
        };
    }

    function mockWixCodeWidgetDef(type, id) {
        return {
            type: type, //'Page'/'Popup'
            id: id
        };
    }

    function mockLoadMessage(widgets, routersMap, rootIds){
        return {
            type: 'load_widgets',
            intent: 'WIX_CODE',
            widgets: widgets,
            rootIds: rootIds,
            routersMap: routersMap || {}
        };
    }

    function mockInitMessage(controllers){
        return {
            type: 'init_widgets',
            intent: 'WIX_CODE',
            controllers: controllers
        };
    }

    function mockStartMessage(contextIdToModelMap, siteInfo) {
        return {
            type: 'start_widgets',
            contexts: contextIdToModelMap,
            siteInfo: siteInfo,
            intent: 'WIX_CODE'
        };
    }

    function mockLoadWidgetInfo(type, id, displayName, url, appInnerId) {
        var infoObject = {
            id: id,
            type: type
        };
        if (displayName) {
            infoObject.displayName = displayName;
        }
        if (url) {
            infoObject.url = url;
        }
        if (appInnerId) {
            infoObject.appInnerId = appInnerId;
        }
        return infoObject;
    }

    function mockLoadDataBindingInfo(siteData) {
        return {
            type: 'Application',
            id: 'dataBinding',
            url: siteData.serviceTopology.scriptsLocationMap['dbsm-viewer-app'] + '/app.js',
            displayName: 'Data Binding'
        };
    }

    function getCompModel(runtimeDal, compId) {
        return {
            data: runtimeDal.getCompData(compId) || {},
            design: runtimeDal.getCompDesign(compId) || {},
            isDisplayed: runtimeDal.isDisplayed(compId),
            layout: runtimeDal.getCompLayout(compId) || {},
            parent: runtimeDal.getParentId(compId),
            props: runtimeDal.getCompProps(compId) || {},
            state: runtimeDal.getCompState(compId) || {},
            type: runtimeDal.getCompType(compId),
            id: runtimeDal.getCompName(compId),
            events: []
        };
    }

    function getConnections(compIds, runtimeDal) {
        var contextId = _(compIds)
            .map(runtimeDal.getPageId, runtimeDal)
            .find(function(pageId){
                return pageId !== 'masterPage';
            });
        return _(compIds)
            .chain()
            .reduce(function(result, compId) {
                var compConnections = runtimeDal.getCompConnections(compId);
                var compConnectionsWithIds = _.map(compConnections, function (connection) {
                    var newConnection = _.clone(connection);
                    if (newConnection.type === 'WixCodeConnectionItem') {
                        newConnection.controllerId = contextId;
                    }
                    return {connection: newConnection, compId: compId};
                });
                return result.concat(compConnectionsWithIds);
            }, [])
            .groupBy('connections.controllerId')
            .mapValues(function(connectionsByController){
                return _(connectionsByController)
                    .groupBy('connections.role')
                    .mapValues(function(connectionsByRole){
                        return _(connectionsByRole)
                            .indexBy('compId')
                            .mapValues('connections.config')
                            .value();
                    })
                    .value();
            })
            .value();
    }

    function rmi(compIds, runtimeDal, EventTypes) {
        return {
            components: _.zipObject(compIds, _.map(compIds, getCompModel.bind(null, runtimeDal))),
            connections: getConnections(compIds, runtimeDal),
            pages: _.pick(runtimeDal._siteData.getPagesDataForRmi(), ['pagesData', 'currentPageId', 'baseUrl']),
            eventHandlers: {},
            EventTypes: EventTypes || {}
        };
    }

    return {
        messages: {
            mockAppWidgetDef: mockAppWidgetDef,
            mockWixCodeWidgetDef: mockWixCodeWidgetDef,
            mockLoadMessage: mockLoadMessage,
            mockInitMessage: mockInitMessage,
            mockStartMessage: mockStartMessage,
            mockLoadWidgetInfo: mockLoadWidgetInfo,
            mockLoadDataBindingInfo: mockLoadDataBindingInfo
        },
        rmi: rmi
    };
});
