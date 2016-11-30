define(['lodash', 'coreUtils'], function (_, coreUtils) {
    'use strict';

    function migrateNicknames(pageJson) {
        if (_.get(pageJson, 'structure.id') === coreUtils.siteConstants.MASTER_PAGE_ID) {
            delete pageJson.structure.nickname;
        }
        var pageStructure = _.get(pageJson, 'structure');
        var desktopComponents = fetchComponentsWithNicknames(pageStructure);
        var mobileComponents = fetchComponentsWithNicknames(pageStructure, true);

        function updateCompStructure(compStructure, mobileCompStructure) {
            var connectionItem = createConnectionItem(compStructure);
            var connectionQuery = _.get(compStructure, 'connectionQuery');
            var dataItem;
            if (connectionQuery) {
                dataItem = pageJson.data.connections_data[connectionQuery];
                dataItem.items = [connectionItem].concat(dataItem.items);
            } else {
                dataItem = createConnectionsDataItem([connectionItem]);
                setConnectionQuery(compStructure, dataItem, mobileCompStructure);
                _.set(pageJson.data, ['connections_data', dataItem.id], dataItem);
            }

            deleteNickname(compStructure, mobileCompStructure);
        }

        _.forEach(desktopComponents, function (compStructure) {
            updateCompStructure(compStructure, mobileComponents[compStructure.id]);
            delete mobileComponents[compStructure.id];
        });

        _.forEach(mobileComponents, function (compStructure) {
            updateCompStructure(compStructure);
        });
    }

    function deleteNickname(desktopStructure, mobileStructure) {
        delete desktopStructure.nickname;
        if (mobileStructure) {
            delete mobileStructure.nickname;
        }
    }

    function setConnectionQuery(compStructure, dataItem, mobileCompStructure) {
        compStructure.connectionQuery = dataItem.id;

        if (mobileCompStructure) {
            mobileCompStructure.connectionQuery = compStructure.connectionQuery;
        }
    }

    function fetchComponentsWithNicknames(structure, isMobile) {
        return coreUtils.dataUtils.getAllCompsInStructure(structure, isMobile, function (comp) {
            return comp.nickname;
        });
    }

    function createConnectionsDataItem(connections) {
        return {
            id: coreUtils.guidUtils.getUniqueId('connection', '-'),
            type: 'ConnectionList',
            items: connections
        };
    }

    function createConnectionItem(compStructure) {
        var nickname = _.get(compStructure, 'nickname');
        return {
            type: 'WixCodeConnectionItem',
            role: nickname
        };
    }

    return {
        exec: migrateNicknames
    };
});
