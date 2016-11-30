define(['lodash', 'siteUtils'], function(_, siteUtils) {
    'use strict';

    function getInitialState(propsInfo, compType) {
        var compClass = siteUtils.compFactory.getCompReactClass(compType);
        if (compClass && compClass.publicState) {
            return compClass.publicState(null, propsInfo);
        }

        return {};
    }

    function getCompModel(runtimeDal, compId) {
        var compType = runtimeDal.getCompType(compId);
        var baseModel = {
            data: runtimeDal.getCompData(compId),
            props: runtimeDal.getCompProps(compId)
        };

        var compState = runtimeDal.getCompState(compId) || getInitialState(baseModel, compType);

        return _.assign(baseModel, {
            parent: runtimeDal.getParentId(compId),
            type: compType,
            state: compState,
            layout: runtimeDal.getCompLayout(compId),
            design: runtimeDal.getCompDesign(compId),
            isDisplayed: runtimeDal.isDisplayed(compId),
            id: runtimeDal.getCompName(compId),
            events: [] // TODO: remove ?
        });
    }

    function getAllCompsConnections(compIds, runtimeDal, contextId) {
        var connections = _.reduce(compIds, function(result, compId) {
            var compConnections = runtimeDal.getCompConnections(compId);
            var compConnectionsWithIds = _.map(compConnections, function (connection) {
                var newConnection;
                if (connection.type === 'WixCodeConnectionItem') {
                    newConnection = _.assign({}, connection, {controllerId: contextId, config: null});
                } else {
                    newConnection = _.defaults({}, connection, {config: null});
                }
                return {connection: newConnection, compId: compId};
            });
            return result.concat(compConnectionsWithIds);
        }, []);
        return connections;
    }

    function getConnectionsModel(runtimeDal, compIds, contextId) {
        var connections = getAllCompsConnections(compIds, runtimeDal, contextId);
        return _(connections)
            .groupBy('connection.controllerId')
            .mapValues(function(connectionsByController){
                return _(connectionsByController)
                    .groupBy('connection.role')
                    .mapValues(function(connectionsByRole){
                        return _(connectionsByRole)
                            .indexBy('compId')
                            .mapValues('connection.config')
                            .value();
                    })
                    .value();
            })
            .value();
    }

    return {
        getCompModel: getCompModel,
        getConnectionsModel: getConnectionsModel
    };


});
