define([
    'lodash',
    'utils',
    'documentServices/connections/connections',
    'documentServices/component/component',
    'documentServices/dataModel/dataModel',
    'documentServices/platform/platform',
    'documentServices/appControllerData/appControllerData',
    'documentServices/componentDetectorAPI/componentDetectorAPI'
], function (_,
             utils,
             connections,
             component,
             dataModel,
             platform,
             appControllerData,
             componentDetectorAPI) {
    'use strict';

    function getComponentsConnectedToController(ps, controllerRef) {
        var controllerPageId = component.getPage(ps, controllerRef).id;
        var pageToGetCompsFrom = controllerPageId === utils.siteConstants.MASTER_PAGE_ID ? null : controllerPageId;

        var connectedComponents = componentDetectorAPI.getAllComponents(ps, pageToGetCompsFrom, function (comp) {
            return _.find(connections.get(ps, comp), {controllerRef: controllerRef});
        });
        return connectedComponents;
    }

    function removeControllerConnections(ps, controllerRef) {
        var connectedComponents = getComponentsConnectedToController(ps, controllerRef);

        _.forEach(connectedComponents, function (comp) {
            connections.disconnect(ps, comp, controllerRef);
        });
    }

    function removePlatformApplicationIfNeeded(ps, controllerRef) {
        var controllerPageRef = component.getPage(ps, controllerRef);
        var controllerApplicationId = dataModel.getDataItem(ps, controllerRef).applicationId;
        var appControllersInPage = ps.pointers.data.getDataItemsWithPredicate({applicationId: controllerApplicationId}, controllerPageRef.id);
        platform.updatePagePlatformApp(ps, controllerPageRef, controllerApplicationId, appControllersInPage.length > 1);
    }

    function removeControllerFromStateMap(ps, controllerRef) {
        var controllerStatePointer = ps.pointers.platform.getControllerStatePointer(controllerRef.id);
        if (ps.dal.isExist(controllerStatePointer)) {
            ps.dal.remove(controllerStatePointer);
        }
    }

    function handleControllerDeletion(ps, controllerRef) {
        removeControllerConnections(ps, controllerRef);
        removePlatformApplicationIfNeeded(ps, controllerRef);
        removeControllerFromStateMap(ps, controllerRef);
    }

    function addRelatedConnections(ps, controllerRef, customStructureData){
        var connectedComponents = getComponentsConnectedToController(ps, controllerRef);
        if (_.isEmpty(connectedComponents)) {
            return;
        }
        var relatedConnections = _.transform(connectedComponents, function(acc, compRef){
            acc[compRef.id] = _.filter(connections.get(ps, compRef), {controllerRef: controllerRef});
        }, {});
        _.set(customStructureData, 'relatedConnections', relatedConnections);
    }

    function addControllerState(ps, controllerRef, customStructureData) {
        var controllerState = ps.dal.get(ps.pointers.platform.getControllerStatePointer(controllerRef.id));
        if (typeof controllerState !== 'undefined') {
            customStructureData.state = controllerState;
        }
    }

    function handleControllerSerialization(ps, controllerRef, customStructureData) {
        addRelatedConnections(ps, controllerRef, customStructureData);
        addControllerState(ps, controllerRef, customStructureData);
    }

    function getRelatedConnections(controllerDefinition, oldToNewIdMap) {
        return _(controllerDefinition).chain()
            .get('custom.relatedConnections')
            .transform(function (acc, compConnections, compId) {
                acc[_.get(oldToNewIdMap, compId, compId)] = compConnections;
            }, {})
            .value();
    }

    function reconnectComponentsToController(componentsToReconnect, relatedConnections, ps, controllerRef) {
        _.forEach(componentsToReconnect, function (compRef) {
            var compConnections = _.get(relatedConnections, compRef.id, []);
            _.forEach(compConnections, function (connectionItem) {
                connections.connect(ps, compRef, controllerRef, connectionItem.role, connectionItem.config);
            });
        });
    }

    function reconnectComponents(ps, controllerRef, controllerDefinition, optionalCustomId, oldToNewIdMap) {
        var relatedConnections = getRelatedConnections(controllerDefinition, oldToNewIdMap);
        var connectedComponentIds = _.keys(relatedConnections);
        var controllerPageId = component.getPage(ps, controllerRef).id;
        var pageToGetCompsFrom = controllerPageId === utils.siteConstants.MASTER_PAGE_ID ? null : controllerPageId;
        var componentsToReconnect = componentDetectorAPI.getAllComponents(ps, pageToGetCompsFrom, function(compRef){
            return _.includes(connectedComponentIds, compRef.id);
        });

        reconnectComponentsToController(componentsToReconnect, relatedConnections, ps, controllerRef);
    }

    function setControllerState(ps, controllerRef, controllerDefinition) {
        if (_.has(controllerDefinition, 'custom.state')) {
            appControllerData.setState(ps, _.set({}, _.get(controllerDefinition, 'custom.state'), [controllerRef]));
        }
    }

    function setPagePlatformApp(ps, controllerRef, applicationId, controllerPageRef) {
        controllerPageRef = controllerPageRef || component.getPage(ps, controllerRef);
        platform.updatePagePlatformApp(ps, controllerPageRef, applicationId, true);
    }

    function handleControllerAddition(ps, controllerRef, controllerDefinition, optionalCustomId, oldToNewIdMap) {
        reconnectComponents(ps, controllerRef, controllerDefinition, optionalCustomId, oldToNewIdMap);
        setControllerState(ps, controllerRef, controllerDefinition);
        setPagePlatformApp(ps, controllerRef, controllerDefinition.data.applicationId);
    }

    function removeInvalidConnections(ps, controllerRef, newParentPointer) {
        var newPageId = component.getPage(ps, newParentPointer).id;
        if (newPageId === utils.siteConstants.MASTER_PAGE_ID) {
            return;
        }
        var connectedComponents = getComponentsConnectedToController(ps, controllerRef);
        _(connectedComponents)
            .reject(function (comp) {
                return component.getPage(ps, comp).id === newPageId;
            })
            .forEach(function (comp) {
                connections.disconnect(ps, comp, controllerRef);
            }).value();
    }

    function handleControllerParentChange(ps, controllerRef, newParentPointer) {
        var applicationId = dataModel.getDataItem(ps, controllerRef).applicationId;
        removeInvalidConnections(ps, controllerRef, newParentPointer);
        removePlatformApplicationIfNeeded(ps, controllerRef);
        setPagePlatformApp(ps, controllerRef, applicationId, component.getPage(ps, newParentPointer));
    }

    return {
        //Before Remove
        handleControllerDeletion: handleControllerDeletion,
        //Custom Serialize
        handleControllerSerialization: handleControllerSerialization,
        //After Add
        handleControllerAddition: handleControllerAddition,
        //Change Parent
        handleControllerParentChange: handleControllerParentChange
    };
});
