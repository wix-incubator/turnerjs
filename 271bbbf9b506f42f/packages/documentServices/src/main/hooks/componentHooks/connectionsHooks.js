define([
    'lodash',
    'utils',
    'experiment',
    'documentServices/constants/constants',
    'documentServices/connections/connections',
    'documentServices/component/component',
    'documentServices/dataModel/dataModel',
    'documentServices/componentDetectorAPI/componentDetectorAPI'
], function (_,
             utils,
             experiment,
             constants,
             connections,
             component,
             dataModel,
             componentDetectorAPI) {
    'use strict';

    var controllerCompType = 'platform.components.AppController';

    function getConnectionsWhoseControllersExist(ps, controllerRefs, oldToNewIdMap, connection){
        var controllerDataId = _.get(connection, 'controllerId');
        return _(controllerRefs)
            .map(function(controllerRef){
                return _.get(dataModel.getDataItem(ps, controllerRef), 'id');
            })
            .includes(_.get(oldToNewIdMap, controllerDataId, controllerDataId));
    }

    function getExistingControllerRefs(ps, containerRef) {
        var compPageId = ps.pointers.components.getPageOfComponent(containerRef).id;
        return componentDetectorAPI.getAllComponents(ps, compPageId, function (compRef) {
            return component.getType(ps, compRef) === controllerCompType;
        });
    }

    function updateControllerIds(oldToNewIdMap, compConnections) {
        return _.map(compConnections, function (connection) {
            var currentControllerId = _.get(connection, 'controllerId');
            var newControllerId = _.get(oldToNewIdMap, currentControllerId, currentControllerId);
            return _.assign({}, connection, {controllerId: newControllerId});
        });
    }

    function getUpdatedConnections(ps, containerRef, componentConnections, oldToNewIdMap) {
        var existingControllerIds = getExistingControllerRefs(ps, containerRef);
        return _(componentConnections)
            .filter(_.partial(getConnectionsWhoseControllersExist, ps, existingControllerIds, oldToNewIdMap))
            .thru(_.partial(updateControllerIds, oldToNewIdMap))
            .value();
    }

    function updateSerializedConnectionsData(ps, componentRef, containerRef, compDefinition, optionalCustomId, isPage, oldToNewIdMap) {
        var componentConnections = _.get(compDefinition, 'connections.items');
        var nonWixCodeConnections = _.reject(componentConnections, {type: 'WixCodeConnectionItem'});
        if (_.isEmpty(nonWixCodeConnections)) {
            return;
        }
        var newConnections = getUpdatedConnections(ps, containerRef, nonWixCodeConnections, oldToNewIdMap);
        var wixCodeConnections = _.difference(componentConnections, nonWixCodeConnections);
        _.set(compDefinition, 'connections.items', wixCodeConnections.concat(newConnections));
    }

    function removeInvalidConnections(ps, compRef, newParentPointer) {
        var oldPageId = component.getPage(ps, compRef).id;
        var newPageId = component.getPage(ps, newParentPointer).id;
        if (oldPageId === utils.siteConstants.MASTER_PAGE_ID || oldPageId === newPageId) {
            return;
        }
        _.forEach(ps.pointers.components.getChildrenRecursivelyRightLeftRootIncludingRoot(compRef), function (comp) {
            var compConnections = connections.getPlatformAppConnections(ps, comp);
            _.forEach(compConnections, function (connection) {
                var controllerRef = _.get(connection, 'controllerRef');
                var controllerPage = component.getPage(ps, controllerRef);
                if (controllerPage.id !== newPageId) {
                    connections.disconnect(ps, comp, controllerRef);
                }
            });
        });

    }

    return {
        //Before Add
        updateSerializedConnectionsData: updateSerializedConnectionsData,
        //Before change parent
        removeInvalidConnections: removeInvalidConnections
    };
});
