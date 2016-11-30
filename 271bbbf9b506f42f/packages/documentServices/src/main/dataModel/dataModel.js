define(['lodash', 'utils',
    'documentServices/dataModel/dataValidators',
    'documentServices/dataModel/dataSerialization',
    'documentServices/dataModel/dataIds',
    'documentServices/dataModel/persistentDataItemsValidation',
    'documentServices/dataModel/DataSchemas.json',
    'documentServices/dataModel/DesignSchemas.json',
    'documentServices/dataModel/PropertiesSchemas.json',
    'documentServices/dataModel/BehaviorsSchemas.json',
    'documentServices/dataModel/ConnectionSchemas.json',
    'documentServices/component/componentsDefinitionsMap',
    'documentServices/hooks/hooks',
/*eslint max-statements:0*/
    'documentServices/utils/utils'], function
    (_,
     utils,
     dataValidators,
     dataSerialization,
     dataIds,
     persistentDataItemsValidation,
     dataSchemas,
     designSchemas,
     propertiesSchemas,
     behaviorsSchemas,
     connectionsSchemas,
     componentsDefinitionsMap,
     hooks,
     dsUtils) {

    //eslint-disable-line max-statements
    'use strict';

    var STYLED_TEXT = {
        DATA_TYPE: 'StyledText',
        DATA_PROPERTY: 'text'
    };

    var PERSISTENT_DATA_ITEMS = {
        data: ['MAIN_MENU', 'CUSTOM_MENUS', 'CUSTOM_MAIN_MENU'],
        props: [],
        style: []
    };

    var DATA_TYPES_TO_UPDATE_ALL_COMPS = {
        VerticalAnchorsMenu: 'VerticalAnchorsMenu',
        Anchor: 'Anchor'
    };

    var PROPERTIES_TYPES_TO_UPDATE_ALL_COMPS = {
        StripColumnsContainerProperties: true,
        ColumnProperties: true
    };

    var COMPS_TO_UPDATE_ANCHORS_AFTER_PROPERTIES_CHANGE = {
        'wysiwyg.viewer.components.StripColumnsContainer': function (ps, compPtr, newPropItem) {
            return !_.isUndefined(newPropItem.fullWidth);
        }
    };

    var BASE_PROPS_SCHEMA_TYPE = utils.constants.BASE_PROPS_SCHEMA_TYPE;

    var DATA_TYPES = utils.constants.DATA_TYPES;

    function isItemPersistent(type, id) {
        return _.includes(PERSISTENT_DATA_ITEMS[type], id);
    }

    function addLink(privateServices, linkType, optionalLinkData, optionalPageId) {
        var linkDataItem = createDataItemByType(privateServices, linkType);
        if (linkDataItem) {
            if (optionalLinkData) {
                _.assign(linkDataItem, optionalLinkData);
                dataValidators.validateDataBySchema(linkDataItem, 'data');
            }

            var pageId = optionalPageId || 'masterPage';
            return addDataItem(privateServices, linkDataItem, pageId);
        }
        return null;
    }

    /**
     * Creates a Data Item corresponding a data type.
     * @param privateServices
     * @param dataType a type of data to create corresponding data item. {String}
     */
    function createDataItemByType(privateServices, dataType) {
        var itemWithDefaults = null;
        if (dataSchemas[dataType]) {
            itemWithDefaults = createItemAccordingToSchema(dataType);
        }
        return itemWithDefaults;
    }

    /**
     * Creates a Design Item corresponding a data type.
     * @param privateServices
     * @param dataType a type of data to create corresponding data item. {String}
     */
    function createDesignItemByType(privateServices, dataType) {
        var itemWithDefaults = null;
        if (designSchemas[dataType]) {
            itemWithDefaults = createItemAccordingToSchema(dataType);
        }
        return itemWithDefaults;
    }

    function createBehaviorsItem(behaviors) {
        var behaviorsDataItem = createItemAccordingToSchema('ObsoleteBehaviorsList');
        if (behaviors) {
            _.assign(behaviorsDataItem, {items: behaviors});
        }
        return behaviorsDataItem;
    }

    function createConnectionsItem(connections) {
        var connectionsDataItem = createItemAccordingToSchema('ConnectionList');
        if (connectionsDataItem) {
            _.assign(connectionsDataItem, {items: connections});
        }
        return connectionsDataItem;
    }

    function createItemAccordingToSchema(schemaName) {
        if (schemaName) {
            var item = {type: schemaName};
            dataValidators.resolveDefaultItem(schemaName, item);
            return item;
        }
        return null;
    }

    /**
     * Creates a Properties Item according to a given type.
     * @param privateServices
     * @param propertiesType
     * @returns {*}
     */
    function createPropertiesItemByType(privateServices, propertiesType) {
        var itemWithDefaults = null;
        if (propertiesSchemas[propertiesType]) {
            itemWithDefaults = createItemAccordingToSchema(propertiesType);
        }
        return itemWithDefaults;
    }

    function addDataItem(privateServices, dataItem, pageId) {
        if (privateServices && dataItem && pageId) {
            return dataSerialization.addSerializedDataItemToPage(privateServices, pageId, dataItem);
        }
        return null;
    }

    function getComponentDataItemId(ps, componentPointer, propName) {
        if (!ps || !componentPointer) {
            return null;
        }
        var dataQueryPointer = ps.pointers.getInnerPointer(componentPointer, propName);
        var dataQuery = ps.dal.get(dataQueryPointer);
        if (!dataQuery) {
            return null;
        }
        return dataQuery.replace('#', '');
    }

    /**
     * links the component's dataQuery to the given ID. It adds the '#' to the dataQuery, which is necessary.
     * @param privateServices
     * @param componentPointer
     * @param dataItemId
     */
    function linkComponentToDataItem(privateServices, componentPointer, dataItemId) {
        var compDataPointer = privateServices.pointers.getInnerPointer(componentPointer, 'dataQuery');
        privateServices.dal.set(compDataPointer, '#' + dataItemId);
    }

    /**
     * links the component's designQuery to the given ID. It adds the '#' to the designQuery, which is necessary.
     * @param {ps} ps
     * @param {Pointer} componentPointer
     * @param dataItemId
     */
    function linkComponentToDesignItem(ps, componentPointer, dataItemId) {
        var compDataPointer = ps.pointers.getInnerPointer(componentPointer, 'designQuery');
        ps.dal.set(compDataPointer, '#' + dataItemId);
    }

    /**
     *
     * @param {ps} ps
     * @param {Pointer} compPointer
     * @param dataItemId
     */
    function linkMobileComponentToDesktopDesignItem(ps, compPointer, designId) {
        if (compPointer.type === utils.constants.VIEW_MODES.MOBILE) {
            return;
        }
        var compDesktopDesignQueries = getCompDesktopDesignQueries(ps, compPointer);

        var mobileCompPointer = ps.pointers.components.getMobilePointer(compPointer);
        if (ps.dal.isExist(mobileCompPointer)) {
            var mobileDesignPointer = ps.pointers.getInnerPointer(mobileCompPointer, 'designQuery');
            var mobileDesignQuery = ps.dal.get(mobileDesignPointer);
            if (!_.includes(compDesktopDesignQueries, mobileDesignQuery)) {
                ps.dal.set(mobileDesignPointer, '#' + designId);
            }
        }
    }

    /**
     *
     * @param {ps} ps
     * @param compPointer
     */
    function getCompDesktopDesignQueries(ps, compPointer) {
        var overridesPointer = ps.pointers.componentStructure.getModesOverrides(compPointer);
        var overrides = ps.dal.full.isExist(overridesPointer) && ps.dal.full.get(overridesPointer);
        var queriesFromOverrides = _.map(overrides, 'designQuery');
        var designQueryPointer = ps.pointers.getInnerPointer(compPointer, 'designQuery');
        var structureDesignQuery = ps.dal.full.get(designQueryPointer);
        return queriesFromOverrides.concat(structureDesignQuery);
    }

    function linkComponentToBehaviorsItem(privateServices, componentPointer, dataItemId) {
        var compDataPointer = privateServices.pointers.getInnerPointer(componentPointer, 'behaviorQuery');
        privateServices.dal.set(compDataPointer, dataItemId);
    }

    function linkComponentToConnectionsItem(privateServices, componentPointer, dataItemId) {
        var compDataPointer = privateServices.pointers.getInnerPointer(componentPointer, 'connectionQuery');
        privateServices.dal.set(compDataPointer, dataItemId);
    }

    /**
     * links the component's propertyQuery to the given ID. It DOES NOT add the '#' to the propertyQuery, since nothing is consistent and it sucks but that's how it needs to be saved..
     * @param privateServices
     * @param componentPointer
     * @param propertyItemId
     */
    function linkComponentToPropertiesItem(privateServices, componentPointer, propertyItemId) {
        var compDataPointer = privateServices.pointers.getInnerPointer(componentPointer, 'propertyQuery');
        privateServices.dal.set(compDataPointer, propertyItemId);
    }

    function getItemOfComponent(privateServices, componentPointer, propName, getDataPointerFunction) {
        var dataId = getComponentDataItemId(privateServices, componentPointer, propName);
        if (!dataId) {
            return null;
        }
        var pagePointer;
        pagePointer = privateServices.pointers.full.components.getPageOfComponent(componentPointer);
        var dataPointer = getDataPointerFunction(dataId, pagePointer.id);
        return dataPointer;
    }

    function getDataItemPointer(privateServices, componentPointer) {
        return getItemOfComponent(privateServices, componentPointer, 'dataQuery', privateServices.pointers.data.getDataItem);
    }

    function getDesignItemPointer(privateServices, componentPointer) {
        return getItemOfComponent(privateServices, componentPointer, 'designQuery', privateServices.pointers.data.getDesignItem);
    }

    function getPropertyItemPointer(privateServices, componentPointer) {
        return getItemOfComponent(privateServices, componentPointer, 'propertyQuery', privateServices.pointers.data.getPropertyItem);
    }

    function getBehaviorsItemPointer(privateServices, componentPointer) {
        return getItemOfComponent(privateServices, componentPointer, 'behaviorQuery', privateServices.pointers.data.getBehaviorsItem);
    }

    function getConnectionsItemPointer(privateServices, componentPointer) {
        return getItemOfComponent(privateServices, componentPointer, 'connectionQuery', privateServices.pointers.data.getConnectionsItem);
    }

    function getDataItem(privateServices, componentPointer) {
        var dataPointer = getDataItemPointer(privateServices, componentPointer);
        return getDataByPointer(privateServices, dataSchemas, dataPointer);
    }

    function getDesignItem(privateServices, componentPointer) {
        var dataPointer = getDesignItemPointer(privateServices, componentPointer);
        return getDataByPointer(privateServices, designSchemas, dataPointer);
    }

    function getDesignPointerInModes(privateServices, componentPointer, modes) {
        if (componentPointer) {
            var overrides = privateServices.dal.full.get(privateServices.pointers.componentStructure.getModesOverrides(componentPointer));
            var overrideInMode = _.find(overrides, function (override) { //eslint-disable-line lodash/matches-shorthand
                return modes && override.modeIds.length === modes.length &&
                    _.intersection(override.modeIds, modes).length === override.modeIds.length;
            });
            var designQuery = _.get(overrideInMode, 'designQuery');
            if (!designQuery) {
                var designQueryPointer = privateServices.pointers.getInnerPointer(componentPointer, 'designQuery');
                designQuery = privateServices.dal.full.get(designQueryPointer);
            }
            if (designQuery) {
                var page = privateServices.pointers.components.getPageOfComponent(componentPointer);
                return privateServices.pointers.data.getDesignItem(designQuery.replace('#', ''), page.id);
            }
        }
        return null;
    }

    function getDesignItemByModes(privateServices, componentPointer, modes) {
        if (componentPointer) {
            var designPointer = getDesignPointerInModes(privateServices, componentPointer, modes);
            return getDataByPointer(privateServices, designSchemas, designPointer, true);
        }
        return null;
    }

    function getPropertiesItem(privateServices, componentPointer) {
        var dataPointer = getPropertyItemPointer(privateServices, componentPointer);
        return getDataByPointer(privateServices, propertiesSchemas, dataPointer);
    }

    function getDataByPointer(privateServices, schemas, dataItemPointer, isFromFull) {
        if (privateServices && dataItemPointer) {
            var dataItem = isFromFull ? privateServices.dal.full.get(dataItemPointer) : privateServices.dal.get(dataItemPointer);
            if (dataItem && schemas[dataItem.type]) {
                var serializedDataItem = dataSerialization.serializeDataItem(privateServices, schemas, dataItemPointer, false, isFromFull);
                hooks.executeHook(hooks.HOOKS.DATA.AFTER_GET, dataItem.type, [privateServices, serializedDataItem]);
                return serializedDataItem;
            }
        }
        return null;
    }

    /**
     * Retrieves a data item according to its unique id, and the page containing it (assuming the page was loaded)
     * if no page was specified, the searched page will be master page
     * @param privateServices
     * @param {string} dataItemId
     * @param {string} [pageId] optional parameter,
     */
    function getDataItemById(privateServices, dataItemId, pageId) {
        if (privateServices && dataItemId) {
            var dataPointer = privateServices.pointers.data.getDataItem(dataItemId, pageId || 'masterPage');
            return getDataByPointer(privateServices, dataSchemas, dataPointer);
        }
        return null;
    }

    function getDesignItemById(privateServices, dataItemId, pageId) {
        if (privateServices && dataItemId) {
            var designPointer = privateServices.pointers.data.getDesignItem(dataItemId, pageId || 'masterPage');
            return getDataByPointer(privateServices, designSchemas, designPointer);
        }
        return null;
    }

    function getPropertiesItemById(privateServices, dataItemId, pageId) {
        if (privateServices && dataItemId) {
            var propertiesPointer = privateServices.pointers.data.getPropertyItem(dataItemId, pageId || 'masterPage');
            return getDataByPointer(privateServices, propertiesSchemas, propertiesPointer);
        }
        return null;
    }

    function updateDataItem(ps, componentPointer, dataItem) {
        if (!ps || !componentPointer) {
            throw new Error("invalid args");
        }

        var compType = dsUtils.getComponentType(ps, componentPointer);
        hooks.executeHook(hooks.HOOKS.DATA.UPDATE_BEFORE, compType, [ps, componentPointer, dataItem]);

        var dataId = getComponentDataItemId(ps, componentPointer, 'dataQuery');
        var pageId = ps.pointers.components.getPageOfComponent(componentPointer).id;

        var doesComponentHaveData = Boolean(dataId);
        dataId = dataSerialization.addSerializedDataItemToPage(ps, pageId, dataItem, dataId);

        if (!doesComponentHaveData) {
            linkComponentToDataItem(ps, componentPointer, dataId);
        }
        return dataId;
    }

    function areBehaviorsEqual(behavior1, behavior2) {
        var BEHAVIOR_PROPS_TO_COMPARE = ['trigger', 'type', 'part', 'name'];
        return _.isEqual(
            _.pick(behavior1, BEHAVIOR_PROPS_TO_COMPARE),
            _.pick(behavior2, BEHAVIOR_PROPS_TO_COMPARE)
        );
    }

    function getUpdatedBehaviors(oldBehaviors, behaviorsToUpdate, shouldRemove) {
        var isEqualToUpdatedBehaviorObjects = _.map(behaviorsToUpdate, function (behavior) {
            return {
                isEqualFunc: _.partial(areBehaviorsEqual, behavior),
                behavior: behavior
            };
        });

        var updatedBehaviors = oldBehaviors;

        _.forEach(isEqualToUpdatedBehaviorObjects, function (isEqualToUpdatedBehaviorObject) {
            updatedBehaviors = _.reject(updatedBehaviors, isEqualToUpdatedBehaviorObject.isEqualFunc);
            if (!shouldRemove) {
                updatedBehaviors = updatedBehaviors.concat(isEqualToUpdatedBehaviorObject.behavior);
            }
        });

        return updatedBehaviors;
    }

    function updateDesignItemBehaviors(ps, componentPointer, newBehaviors) {
        if (!ps || !componentPointer) {
            throw new Error("invalid args");
        }

        var designItem = getDesignItem(ps, componentPointer);

        designItem.dataChangeBehaviors = getUpdatedBehaviors(designItem.dataChangeBehaviors, newBehaviors, false);

        return updateDesignItem(ps, componentPointer, designItem);
    }

    function removeDesignItemBehaviors(ps, componentPointer, behaviorsToRemove) {
        if (!ps || !componentPointer) {
            throw new Error("invalid args");
        }

        var designItem = getDesignItem(ps, componentPointer);

        designItem.dataChangeBehaviors = getUpdatedBehaviors(designItem.dataChangeBehaviors, behaviorsToRemove, true);

        return updateDesignItem(ps, componentPointer, designItem);
    }

    function updateDesignItem(ps, componentPointer, designItem, retainCharas) {
        if (!ps || !componentPointer) {
            throw new Error("invalid args");
        }

        var compType = dsUtils.getComponentType(ps, componentPointer);
        hooks.executeHook(hooks.HOOKS.DATA.UPDATE_BEFORE, compType, [ps, componentPointer, designItem]);

        if (!retainCharas) {
            designItem.charas = dataIds.generateNewDesignId();
        }

        var designId = getComponentDataItemId(ps, componentPointer, 'designQuery');
        var pageId = ps.pointers.components.getPageOfComponent(componentPointer).id;

        var doesComponentHaveDesignData = Boolean(designId);
        designId = dataSerialization.addSerializedDesignItemToPage(ps, pageId, designItem, designId, componentPointer);

        if (!doesComponentHaveDesignData) {
            linkComponentToDesignItem(ps, componentPointer, designId);
        }
        linkMobileComponentToDesktopDesignItem(ps, componentPointer, designId);

        return designId;
    }

    function updateBehaviorsItem(ps, componentPointer, behaviorsItem) {
        var behaviorsId = getComponentDataItemId(ps, componentPointer, 'behaviorQuery');
        var pageId = ps.pointers.components.getPageOfComponent(componentPointer).id;

        var doesComponentHaveBehaviorsData = Boolean(behaviorsId);
        var itemToUpdate = createBehaviorsItem(behaviorsItem);
        behaviorsId = dataSerialization.addSerializedBehaviorsItemToPage(ps, pageId, itemToUpdate, behaviorsId);

        if (!doesComponentHaveBehaviorsData) {
            linkComponentToBehaviorsItem(ps, componentPointer, behaviorsId);
        }

        return behaviorsId;
    }

    function updateConnectionsItem(ps, componentPointer, connectionsItem) {
        var connectionsId = getComponentDataItemId(ps, componentPointer, 'connectionQuery');
        var pageId = ps.pointers.components.getPageOfComponent(componentPointer).id;

        var doesComponentHaveConnectionsData = Boolean(connectionsId);
        var newConnectionsItem = serializeConnectionsItem(ps, connectionsItem);
        var itemToUpdate = createConnectionsItem(newConnectionsItem);
        connectionsId = dataSerialization.addSerializedConnectionsItemToPage(ps, pageId, itemToUpdate, connectionsId);

        if (!doesComponentHaveConnectionsData) {
            linkComponentToConnectionsItem(ps, componentPointer, connectionsId);
        }

        return connectionsId;
    }

    function serializeConnectionsItem(ps, connectionsItem) {
        return _.map(connectionsItem, function (connectionItem) {
            if (connectionItem.type === 'WixCodeConnectionItem') {
                return connectionItem;
            }

            var controllerDataItemId = getComponentDataItemId(ps, connectionItem.controllerRef, 'dataQuery');
            var newConnectionItem = _.assign({}, _.omit(connectionItem, 'controllerRef'), {controllerId: controllerDataItemId});
            if (!_.has(newConnectionItem, 'config')) {
                return newConnectionItem;
            }
            try {
                newConnectionItem.config = JSON.stringify(newConnectionItem.config);
            } catch (e) {
                throw new Error('Invalid connection configuration - should be JSON stringifiable');
            }
            return newConnectionItem;
        });
    }

    function getConnectionsItem(ps, componentPointer) {
        var dataPointer = getConnectionsItemPointer(ps, componentPointer);
        var connectionsItem = _.get(getDataByPointer(ps, connectionsSchemas, dataPointer), 'items');
        connectionsItem = deserializeConnectionsItem(ps, componentPointer, connectionsItem);
        return _.isEmpty(connectionsItem) ? null : connectionsItem;
    }

    function findControllerInPageByDataId(ps, pagePointer, controllerDataId) {
        var page = ps.dal.get(pagePointer);
        return utils.dataUtils.findCompInStructure(page, false, function (comp) {
            var dataQuery = _.get(comp, 'dataQuery', '');
            return dataQuery.replace('#', '') === controllerDataId;
        });
    }

    function getControllerRefFromId(ps, controllerDataId, compPointer) {
        var componentPagePointer = ps.pointers.components.getPageOfComponent(compPointer);
        var pagePointer = ps.pointers.components.getPage(componentPagePointer.id, utils.constants.VIEW_MODES.DESKTOP);
        var masterPagePointer = ps.pointers.components.getMasterPage(utils.constants.VIEW_MODES.DESKTOP);

        var controller = findControllerInPageByDataId(ps, pagePointer, controllerDataId);
        if (controller) {
            return ps.pointers.components.getComponent(controller.id, pagePointer);
        }

        if (_.isEqual(pagePointer, masterPagePointer)) {
            return;
        }

        controller = findControllerInPageByDataId(ps, masterPagePointer, controllerDataId);
        return controller ? ps.pointers.components.getComponent(controller.id, masterPagePointer) : null;
    }

    function deserializeConnectionsItem(ps, componentPointer, connectionsItem) {
        return _.map(connectionsItem, function (connectionItem) {
            if (connectionItem.type === 'WixCodeConnectionItem') {
                return connectionItem;
            }

            var controllerRef = getControllerRefFromId(ps, connectionItem.controllerId, componentPointer);
            var newConnectionItem = _.assign({}, _.omit(connectionItem, 'controllerId'), {controllerRef: controllerRef});
            if (!_.has(newConnectionItem, 'config')) {
                return newConnectionItem;
            }
            newConnectionItem.config = JSON.parse(newConnectionItem.config);
            return newConnectionItem;
        });
    }

    function getBehaviorsItem(ps, componentPointer) {
        var dataPointer = getBehaviorsItemPointer(ps, componentPointer);
        return _.get(getDataByPointer(ps, behaviorsSchemas, dataPointer), 'items');
    }

    function setDataItemByPointer(ps, dataItemPointer, dataItem, schemaOrigin) {
        _.set(dataItem, 'metaData.isPreset', false);
        dataValidators.validateDataBySchema(dataItem, schemaOrigin);
        ps.dal.set(dataItemPointer, dataItem);
    }

    function updatePropertiesItem(ps, componentPointer, propertiesItem) {
        setPropertiesItem(ps, componentPointer, propertiesItem);
    }

    function isPropertiesItemAutoGenerated(propertiesItem) {
        return Boolean(_.get(propertiesItem, 'metaData.autoGenerated'));
    }

    function setPropertiesItem(ps, componentPointer, propertiesItem, propertiesId) {
        if (!ps || !componentPointer) {
            throw new Error("invalid args");
        }
        var dataId = getComponentDataItemId(ps, componentPointer, 'propertyQuery');
        var pageId = ps.pointers.components.getPageOfComponent(componentPointer).id;

        var compType = dsUtils.getComponentType(ps, componentPointer);
        hooks.executeHook(hooks.HOOKS.PROPERTIES.UPDATE_BEFORE, compType, [ps, componentPointer, propertiesItem]);

        propertiesItem.type = propertiesItem.type || getPropertyTypeByCompType(compType);

        if (isPropertiesItemAutoGenerated(propertiesItem)) {
            propertiesItem.metaData.autoGenerated = false;
        }

        var doesComponentHaveProp = Boolean(dataId);
        dataId = dataSerialization.addSerializedPropertyItemToPage(ps, pageId, propertiesItem, propertiesId || dataId, componentPointer);

        if (!doesComponentHaveProp) {
            linkComponentToPropertiesItem(ps, componentPointer, dataId);
        }
        return dataId;
    }

    function getPropertyTypeByCompType(compType) {
        return componentsDefinitionsMap[compType].propertyType || _.find(componentsDefinitionsMap[compType].propertyTypes) || BASE_PROPS_SCHEMA_TYPE;
    }

    function deleteDataItem(privateServices, componentPointer) {
        if (privateServices && componentPointer) {
            var dataId = getComponentDataItemId(privateServices, componentPointer, 'dataQuery');
            if (!dataId) {
                return null;
            }
            var pageId = privateServices.pointers.components.getPageOfComponent(componentPointer).id;
            var dataPointer = privateServices.pointers.data.getDataItem(dataId, pageId);

            removeDataItemRecursively(privateServices, dataPointer);
        }
    }

    function deletePropertiesItem(privateServices, componentPointer) {
        if (privateServices && componentPointer) {
            var propertiesId = getComponentDataItemId(privateServices, componentPointer, 'propertyQuery');
            if (!propertiesId) {
                return null;
            }
            var pageId = privateServices.pointers.components.getPageOfComponent(componentPointer).id;
            var propertiesPointer = privateServices.pointers.data.getPropertyItem(propertiesId, pageId);

            removeItemRecursively(privateServices, DATA_TYPES.prop, propertiesPointer, pageId);
        }
    }

    function deleteDesignItem(privateServices, componentPointer) {
        if (privateServices && componentPointer) {
            var designId = getComponentDataItemId(privateServices, componentPointer, 'designQuery');
            if (!designId) {
                return null;
            }
            var pageId = privateServices.pointers.components.getPageOfComponent(componentPointer).id;
            var designPointer = privateServices.pointers.data.getDesignItem(designId, pageId);

            removeItemRecursively(privateServices, DATA_TYPES.design, designPointer, pageId);
        }
    }

    function removeBehaviorsItem(privateServices, componentPointer) {
        var behaviorsId = getComponentDataItemId(privateServices, componentPointer, 'behaviorQuery');
        if (!behaviorsId) {
            return;
        }
        var pageId = privateServices.pointers.components.getPageOfComponent(componentPointer).id;
        var behaviorsPointer = privateServices.pointers.data.getBehaviorsItem(behaviorsId, pageId);

        removeItemRecursively(privateServices, DATA_TYPES.behaviors, behaviorsPointer, pageId);
        var behaviorsQueryPointer = privateServices.pointers.getInnerPointer(componentPointer, 'behaviorQuery');
        privateServices.dal.remove(behaviorsQueryPointer);
    }

    function removeConnectionsItem(privateServices, componentPointer) {
        var propName = 'connectionQuery';
        var connectionsId = getComponentDataItemId(privateServices, componentPointer, propName);
        if (!connectionsId) {
            return;
        }
        var pageId = privateServices.pointers.components.getPageOfComponent(componentPointer).id;
        var connectionsPointer = privateServices.pointers.data.getConnectionsItem(connectionsId, pageId);

        removeItemRecursively(privateServices, DATA_TYPES.connections, connectionsPointer, pageId);
        var connectionQueryPointer = privateServices.pointers.getInnerPointer(componentPointer, propName);
        privateServices.dal.remove(connectionQueryPointer);
    }

    function removeComponentDataItem(ps, componentPointer) {
        if (!ps || !componentPointer) {
            throw new Error("invalid args");
        }
        var compsDefinition = componentsDefinitionsMap[dsUtils.getComponentType(ps, componentPointer)];

        if (compsDefinition.dataTypes && !_.includes(compsDefinition.dataTypes, '')) {
            throw new Error("component's data can't be deleted");
        }
        var dataQueryPointer = ps.pointers.getInnerPointer(componentPointer, 'dataQuery');

        //do not handle deleting of data items themselves (e.g deleteDataItem),
        //can be risky and will be handled via garbage collection
        ps.dal.remove(dataQueryPointer);
    }

    function removeComponentDesignItem(ps, componentPointer) {
        if (!ps || !componentPointer) {
            throw new Error("invalid args");
        }
        var compsDefinition = componentsDefinitionsMap[dsUtils.getComponentType(ps, componentPointer)];

        if (compsDefinition.dataTypes && !_.includes(compsDefinition.dataTypes, '')) {
            throw new Error("component's design can't be deleted");
        }
        var designQueryPointer = ps.pointers.getInnerPointer(componentPointer, 'designQuery');

        //do not handle deleting of data items themselves (e.g deleteDataItem),
        //can be risky and will be handled via garbage collection
        ps.dal.remove(designQueryPointer);
    }

    function removeComponentPropertyItem(ps, componentPointer) {
        if (!ps || !componentPointer) {
            throw new Error("invalid args");
        }

        var compsDefinition = componentsDefinitionsMap[dsUtils.getComponentType(ps, componentPointer)];

        if (compsDefinition.propertyType && compsDefinition.propertyType !== '') {
            throw new Error("component's property can't be deleted");
        }
        var propertyQueryPointer = ps.pointers.getInnerPointer(componentPointer, 'propertyQuery');
        ps.dal.remove(propertyQueryPointer);
    }

    function getPropertiesItemFields(propertiesItem) {
        if (propertiesItem) {
            return _.keys(propertiesItem);
        }
        return [];
    }

    /***
     * @param privateServices
     * @param dataSchemaType
     * @returns {*}
     */
    function getDataSchemaByType(privateServices, dataSchemaType) {
        if (dataSchemaType) {
            var dataSchema = dataSchemas[dataSchemaType];
            return dataSchema && dataSchema.properties;
        }
        return null;
    }

    /**
     * @param privateServices
     * @param propertiesSchemaType
     * @returns {*}
     */
    function getPropertiesSchemaByType(privateServices, propertiesSchemaType) {
        if (propertiesSchemaType) {
            var propertiesSchema = _.get(propertiesSchemas, [propertiesSchemaType, 'allOf', 0]);
            return propertiesSchema || propertiesSchemas[propertiesSchemaType];
        }
        return null;
    }

    function removeItemRecursively(privateServices, dataType, dataItemPointer, pageId) {
        if (!privateServices.dal.isExist(dataItemPointer)) {
            return;
        }
        var dataItem = privateServices.dal.get(dataItemPointer);
        if (isItemPersistent(dataType, dataItemPointer.id)) {
            return;
        }
        dataSerialization.executeForDataItemRefs(dataSchemas, dataItem, function (dataId) {
            if (dataId) {
                var innerDataPointer = privateServices.pointers.data.getItem(dataType, dataId.replace('#', ''), pageId);
                removeDataItemRecursively(privateServices, innerDataPointer);
            }
        });
        privateServices.dal.remove(dataItemPointer);
    }

    /**
     *
     * @param privateServices
     * @param dataPointer
     */
    function removeDataItemRecursively(privateServices, dataPointer) {
        if (!privateServices.dal.isExist(dataPointer) || persistentDataItemsValidation.isDataItemPersistent(privateServices, dataPointer)) {
            return;
        }
        var pageId = privateServices.pointers.data.getPageIdOfData(dataPointer);
        removeItemRecursively(privateServices, DATA_TYPES.data, dataPointer, pageId);
    }

    function isDataItemValid(privateServices, dataItem, fieldName, fieldValue) {
        var deserializedDataItem = dataSerialization.deserializeDataItem(privateServices, dataItem, 'data');
        return dataValidators.isItemValid(privateServices, deserializedDataItem, fieldName, fieldValue, 'data');
    }

    function shouldUpdateDataWithSingleComp(privateServices, componentPointer) {
        var dataItem = getDataItem(privateServices, componentPointer);
        if (!dataItem) {
            return true;
        }

        if (STYLED_TEXT.DATA_TYPE === dataItem.type) {
            return !utils.fonts.uploadedFontsUtils.doesDataContainNewUploadedFonts(dataItem[STYLED_TEXT.DATA_PROPERTY]);
        }

        return !DATA_TYPES_TO_UPDATE_ALL_COMPS[dataItem.type];
    }

    function shouldUpdatePropertiesWithSingleComp(privateServices, componentPointer) {
        var propertiesItem = getPropertiesItem(privateServices, componentPointer);
        if (propertiesItem) {
            return !PROPERTIES_TYPES_TO_UPDATE_ALL_COMPS[propertiesItem.type];
        }

        return true;
    }

    function shouldUpdateAnchorsAfterPropertiesUpdate(ps, compPtr, methodArgs) {
        var compType = dsUtils.getComponentType(ps, compPtr);
        var shouldUpdateAnchors = COMPS_TO_UPDATE_ANCHORS_AFTER_PROPERTIES_CHANGE[compType];
        if (_.isFunction(shouldUpdateAnchors)) {
            shouldUpdateAnchors = shouldUpdateAnchors.apply(this, methodArgs);
        }
        if (_.isString(shouldUpdateAnchors)) {
            return shouldUpdateAnchors;
        }
        return shouldUpdateAnchors ? dsUtils.YES : dsUtils.NO;
    }

    return {
        shouldUpdateDataWithSingleComp: shouldUpdateDataWithSingleComp,
        shouldUpdatePropertiesWithSingleComp: shouldUpdatePropertiesWithSingleComp,
        shouldUpdateAnchorsAfterPropertiesUpdate: shouldUpdateAnchorsAfterPropertiesUpdate,
        /**
         * Creates a link and adds it to the data of the Master Page.
         * @param {string} linkType the type of the link to create.
         * @param {Object} optionalLinkData optional data to set upon creation.
         * @returns {Object} a reference to the Link Data Item.
         */
        addLink: addLink,
        /**
         * Creates a Data Item for a given type.
         *
         * @function
         * @memberof documentServices.dataModel
         *
         * @param {string} dataType the name of the Data Type to create a suiting instance.
         * @returns {Object} a DataItem corresponding the given <i>dataType</i>.
         */
        createDataItemByType: createDataItemByType,
        createDesignItemByType: createDesignItemByType,
        createBehaviorsItem: createBehaviorsItem,
        addDataItem: addDataItem,
        /**
         * Gets a DataItem instance corresponding a Component Reference from the document.
         *
         * @param {AbstractComponent} componentReference a reference of a component in the document.
         * @returns {Object} a Data Item corresponding the componentReference. 'null' if not found.
         */
        getDataItem: getDataItem,
        updateDesignItem: updateDesignItem,
        updateDesignItemBehaviors: updateDesignItemBehaviors,
        removeDesignItemBehaviors: removeDesignItemBehaviors,
        /**
         * Gets a DesignItem instance corresponding a Component Reference from the document.
         *
         * @param {AbstractComponent} componentReference a reference of a component in the document.
         * @returns {Object} a Design Data Item corresponding the componentReference. 'null' if not found.
         */
        getDesignItem: getDesignItem,
        /**
         * Gets a DesignItem instance corresponding a Component Reference in certain modes from the document.
         *
         * @param {AbstractComponent} componentReference a reference of a component in the document.
         * @param {Array} array of mode ids
         * @returns {Object} a Design Data Item corresponding the componentReference. 'null' if not found.
         */
        getDesignItemByModes: getDesignItemByModes,
        /**
         * Gets a DataItem from the Document's MasterPage corresponding an ID.
         *
         * @param {string} dataItemId an ID of a DataItem.
         */
        getDataItemById: getDataItemById,
        getDesignItemById: getDesignItemById,
        getPropertiesItemById: getPropertiesItemById,
        getDataItemPointer: getDataItemPointer,
        getPropertyItemPointer: getPropertyItemPointer,
        getDesignItemPointer: getDesignItemPointer,
        getBehaviorsItemPointer: getBehaviorsItemPointer,
        getConnectionsItemPointer: getConnectionsItemPointer,
        /**
         * Merges the given data item to the component data item
         *
         * @param {AbstractComponent} componentRef A ComponentReference to match a corresponding Component.
         * @param {Object} dataItem A partial DataItem corresponding the type of the Component's Data to update.
         * @returns undefined
         *
         *      @example
         *      var myPhotoRef = ...;
         *      documentServices.components.data.update(myPhotoRef, {uri: "http://static.host.com/images/image-B.png"});
         */
        updateDataItem: updateDataItem,
        /**
         * Deletes the reference from the component to the data item it's pointing at
         *
         * @param {AbstractComponent} componentRef A ComponentReference to match a corresponding Component.
         */
        removeComponentDataItem: removeComponentDataItem,
        /**
         * Deletes the reference from the component to the design data item it's pointing at
         *
         * @param {AbstractComponent} componentRef A ComponentReference to match a corresponding Component.
         */
        removeComponentDesignItem: removeComponentDesignItem,
        /**
         * Deletes the reference from the component to the property item it's pointing at
         *
         * @param {AbstractComponent} componentRef A ComponentReference to match a corresponding Component.
         */
        removeComponentPropertyItem: removeComponentPropertyItem,
        setDataItemByPointer: setDataItemByPointer,
        deleteDataItem: deleteDataItem,
        deleteDesignItem: deleteDesignItem,

        /**
         * recursively removes from the dal the data item and all data items it points to
         * @param dataPointer
         */
        removeDataItemRecursively: removeDataItemRecursively,
        /**
         * Returns a DataSchema (DataItem description object) given a type.
         *
         * @function
         * @memberof documentServices.dataModel
         *
         * @param {string} dataSchemaType a name of a DataSchema Type.
         * @returns {Object} a DataSchema instance corresponding the data schema type.
         *
         *      @example
         *      var imageDataSchema = documentServices.data.getSchema("Image");
         */
        getDataSchemaByType: getDataSchemaByType,

        /**
         * Creates a Properties (Data) Item for a given type.
         *
         * @function
         * @memberof documentServices.dataModel
         *
         * @param {string} propertiesType the name of the Properties (Data) Type to create a suiting instance.
         * @returns {Object} a Properties (Data) Item corresponding the <i>propertiesType</i>.
         */
        createPropertiesItemByType: createPropertiesItemByType,
        /**
         * Gets a Properties(Data)Item instance corresponding a Component Reference from the document.
         *
         * @param {AbstractComponent} componentReference a reference of a component in the document.
         * @returns {Object} a Properties (Data)Item corresponding the componentReference. 'null' if not found.
         */
        getPropertiesItem: getPropertiesItem,
        getPropertiesItemFields: getPropertiesItemFields,
        /**
         * Updates component's Properties (Data)Item.
         *
         * @function
         * @memberof documentServices.dataModel
         *
         * @param {Object} componentRef A ComponentReference to match a corresponding Component in the document.
         * @param {Object} propertiesItem A partial Properties (Data)Item corresponding the properties type of the
         * Component's Data to update.
         * @returns undefined
         *
         *
         *      @example
         *      var myPhotoRef = ...;
         *      documentServices.components.properties.update(myPhotoRef, {displayMode: "full"});
         */
        updatePropertiesItem: updatePropertiesItem,
        setPropertiesItem: setPropertiesItem,
        deletePropertiesItem: deletePropertiesItem,
        /**
         * Returns a PropertiesSchema (Properties Data Item description object) given a type.
         *
         * @function
         * @memberof documentServices.dataModel
         *
         * @param {string} propertiesSchemaType a name of a PropertiesSchema Type.
         * @returns {Object} a PropertiesSchema instance corresponding the <i>propertiesSchemaType</i>. 'undefined' otherwise.
         *
         *      @example
         *      var photoPropertiesSchema = documentServices.properties.getSchema("WPhotoProperties");
         */
        getPropertiesSchemaByType: getPropertiesSchemaByType,

        updateBehaviorsItem: updateBehaviorsItem,
        getBehaviorsItem: getBehaviorsItem,
        removeBehaviorsItem: removeBehaviorsItem,

        updateConnectionsItem: updateConnectionsItem,
        getConnectionsItem: getConnectionsItem,
        removeConnectionsItem: removeConnectionsItem,

        /*dataIds*/
        generateNewDataItemId: dataIds.generateNewDataItemId,
        generateNewPropertiesItemId: dataIds.generateNewPropertiesItemId,

        /*dataSerialization*/
        addSerializedStyleItemToPage: dataSerialization.addSerializedStyleItemToPage,
        addSerializedDataItemToPage: dataSerialization.addSerializedDataItemToPage,
        addSerializedDesignItemToPage: dataSerialization.addSerializedDesignItemToPage,
        addSerializedBehaviorsItemToPage: dataSerialization.addSerializedBehaviorsItemToPage,
        addSerializedConnectionsItemToPage: dataSerialization.addSerializedConnectionsItemToPage,
        addSerializedPropertyItemToPage: dataSerialization.addSerializedPropertyItemToPage,
        serializeDataItem: dataSerialization.serializeDataItem,
        /**
         * Executes callback for all refs in data item
         *
         * @param {object} schema - the actual schema to check
         * @param {string} dataItem
         * @param {function} callback
         */
        executeForDataItemRefs: dataSerialization.executeForDataItemRefs,
        isPropertiesItemValid: _.partialRight(dataValidators.isItemValid, 'properties'),
        isDataItemValid: isDataItemValid
    };
});
