define([
    'lodash',
    'siteUtils',
    'documentServices/dataModel/dataModel',
    'documentServices/component/component'
], function(_, siteUtils, dataModel, component){
    'use strict';

    var CONTROLLER_TYPE = 'platform.components.AppController';

    function connect(ps, compRef, controllerRef, role, connectionConfig) {
        if (component.getType(ps, controllerRef) !== CONTROLLER_TYPE) {
            throw new Error('controllerRef component type is invalid - should be a controller or current context');
        }
        var newConnectionItem = {
            type: 'ConnectionItem',
            controllerRef: controllerRef,
            role: role
        };
        if (connectionConfig) {
            newConnectionItem.config = connectionConfig;
        }
        var existingConnections = getConnections(ps, compRef);

        var isConnectionExist = _.some(existingConnections, function(connection){
            return _.isEqual(connection, newConnectionItem);
        });
        if (!isConnectionExist) {
            var newConnections = _.reject(existingConnections, {controllerRef: controllerRef, role: role});
            dataModel.updateConnectionsItem(ps, compRef, newConnections.concat(newConnectionItem));
        }
    }

    function disconnect(ps, compRef, controllerRef, role) {
        var existingConnections = getConnections(ps, compRef);
        var filter = {controllerRef: controllerRef};
        if (role) {
            filter.role = role;
        }
        var newConnections = _.reject(existingConnections, filter);
        if (_.isEmpty(newConnections)) {
            dataModel.removeConnectionsItem(ps, compRef);
        } else {
            dataModel.updateConnectionsItem(ps, compRef, newConnections);
        }
    }

    function getConnections(ps, compRef) {
        var connections = dataModel.getConnectionsItem(ps, compRef);
        return connections || [];
    }

    function getPlatformAppConnections(ps, compRef) {
        return _.reject(getConnections(ps, compRef), {type: 'WixCodeConnectionItem'});
    }

    return {
        connect: connect,
        disconnect: disconnect,
        get: getConnections,
        getPlatformAppConnections: getPlatformAppConnections
    };
});
