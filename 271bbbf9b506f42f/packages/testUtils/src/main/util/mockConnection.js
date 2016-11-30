define(['lodash'], function (_) {
    "use strict";

    /**
     * @lends SiteDataMockData
     */
    var connectionMocks = {
        connectionItem: function (controllerDataId, role, connectionConfig) {
            var connectionItem = {
                type: 'ConnectionItem',
                controllerId: controllerDataId,
                role: role
            };
            if (connectionConfig) {
                connectionItem.config = connectionConfig;
            }
            return connectionItem;
        },
        dsConnectionItem: function (controllerRef, role, connectionConfig) {
            var connectionItem = {
                type: 'ConnectionItem',
                controllerRef: controllerRef,
                role: role
            };
            if (connectionConfig) {
                connectionItem.config = connectionConfig;
            }
            return connectionItem;
        },
        wixCodeConnectionItem: function (nickname) {
            return {
                type: 'WixCodeConnectionItem',
                role: nickname
            };
        },
        connectionList: function (items, id) {
            return {
                type: 'ConnectionList',
                items: items,
                id: id || _.uniqueId('mock_connections')
            };
        },
        isValidConnectionItem: function (item) {
            return (item.type === connectionMocks.connectionItem().type || item.type === connectionMocks.wixCodeConnectionItem().type) && item.role;
        },
        isValidConnectionList: function (item) {
            return item && item.type === connectionMocks.connectionList().type &&
                _.has(item, 'items') &&
                _.every(item.items, connectionMocks.isValidConnectionItem);
        }
    };

    return connectionMocks;
});
