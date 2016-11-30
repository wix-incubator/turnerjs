define(['lodash',
    'documentServices/constants/constants',
    'documentServices/dataModel/dataModel',
    'documentServices/hooks/hooks',
    'documentServices/component/componentStructureInfo',
    'documentServices/component/componentModes',
    'documentServices/structure/structureUtils',
    'documentServices/dataModel/BehaviorsSchemas.json',
    'documentServices/dataModel/ConnectionSchemas.json',
    'documentServices/dataModel/DataSchemas.json',
    'documentServices/dataModel/PropertiesSchemas.json',
    'documentServices/dataModel/DesignSchemas.json',
    'experiment'], function (_, constants, dataModel, hooks, componentStructureInfo, componentModes, structureUtils,
                             behaviorsSchemas, connectionsSchemas, dataSchemas, propertiesSchemas, designSchemas, experiment) {
    'use strict';

    var CUSTOM_COMP_DEFINITION_ATTRIBUTE = 'custom';

    function serializeComponent(ps, componentPointer, dataItemPointer, ignoreChildren, maintainIdentifiers, flatMobileStructuresMap, structureEnricher) {
        structureEnricher = structureEnricher || _.noop;

        var serializedComponent = serializeComponentStructureAndData(ps, componentPointer, dataItemPointer, ignoreChildren,
            maintainIdentifiers, flatMobileStructuresMap, structureEnricher);
        if (serializedComponent) {
            serializedComponent.activeModes = getActiveModesOfComponentAncestors(ps, componentPointer);
        }
        return serializedComponent;
    }

    function getActiveModesOfComponentAncestors(ps, componentPointer) {
        var activeModesThatCanAffectSerializedComp = {};

        var componentAncestor = ps.pointers.full.components.getParent(componentPointer);
        while (componentAncestor) {
            var compActiveModesInPage = componentModes.getComponentActiveModeIds(ps, componentAncestor);
            _.merge(activeModesThatCanAffectSerializedComp, compActiveModesInPage);
            componentAncestor = ps.pointers.full.components.getParent(componentAncestor);
        }
        return activeModesThatCanAffectSerializedComp;
    }

    function serializeComponentStructureAndData(ps, componentPointer, dataItemPointer, ignoreChildren, maintainIdentifiers,
                                                flatMobileStructuresMap, structureEnricher) {
        flatMobileStructuresMap = flatMobileStructuresMap || getFlatMobileStructuresMap(ps);
        var compStructure = ps.dal.full.get(componentPointer);
        if (!compStructure) {
            return null;
        }

        var pagePointer = ps.pointers.full.components.getPageOfComponent(componentPointer);
        var pageId = pagePointer.id;

        resolveDataItems(ps, compStructure, dataItemPointer, maintainIdentifiers, pageId, structureEnricher);
        if (!ignoreChildren) {
            serializeChildren(ps, compStructure, componentPointer, pagePointer, maintainIdentifiers, flatMobileStructuresMap, structureEnricher);
            serializeMobileChildren(ps, compStructure, pageId, maintainIdentifiers, flatMobileStructuresMap, structureEnricher);
        } else {
            delete compStructure.components;
        }

        if (!maintainIdentifiers) {
            delete compStructure.mobileComponents;
            delete compStructure.id;
        }

        var customStructureData = {};
        var hookArguments = [ps, componentPointer, customStructureData];
        hooks.executeHook(hooks.HOOKS.SERIALIZE.SET_CUSTOM, compStructure.componentType, hookArguments);
        if (!_.isEmpty(customStructureData)) {
            compStructure[CUSTOM_COMP_DEFINITION_ATTRIBUTE] = _.defaults(compStructure[CUSTOM_COMP_DEFINITION_ATTRIBUTE] || {}, customStructureData);
        }
        // TODO: should a failed hook fail the whole serialization process ?

        if (componentPointer.type === constants.VIEW_MODES.DESKTOP) {
            serializeMobileStructure(ps, componentPointer, compStructure, maintainIdentifiers, pageId, flatMobileStructuresMap, structureEnricher);
        }

        return compStructure;
    }

    function serializeChildren(/** ps */ ps, compStructure, componentPointer, pagePointer, maintainIdentifiers, flatMobileStructuresMap, structureEnricher) {
        var childrenPointers = ps.pointers.full.components.getChildren(componentPointer);
        if (childrenPointers.length) {
            compStructure.components = _.map(childrenPointers, function (childPointer) {
                return serializeComponentStructureAndData(ps, childPointer, null, false, maintainIdentifiers, flatMobileStructuresMap, structureEnricher);
            });
        }
    }

    function serializeMobileChildren(ps, compStructure, pageId, maintainIdentifiers, flatMobileStructuresMap, structureEnricher) {
        if (compStructure.mobileComponents) {
            var mobilePagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.MOBILE);
            var mobileChildrenPointers = ps.pointers.full.components.getChildren(mobilePagePointer);
            compStructure.mobileComponents = _.map(mobileChildrenPointers, function (mobileChildPointer) {
                return serializeComponentStructureAndData(ps, mobileChildPointer, null, false, maintainIdentifiers, flatMobileStructuresMap, structureEnricher);
            });
        }
    }

    function getFlatMobileStructuresMap(ps) {
        var mobileStructuresPointer = ps.pointers.general.getMobileStructuresPointer();
        var mobileStructures = ps.dal.get(mobileStructuresPointer);
        var map = {};

        function populateMap(component) {
            map[component.id] = _.omit(_.clone(component), 'components');
            _.forEach(component.components, populateMap);
        }

        _.forOwn(mobileStructures, populateMap);

        return map;
    }

    function resolveDataItems(ps, compStructure, dataItemPointer, maintainIdentifiers, pageId, structureEnricher) {
        structureEnricher(compStructure);
        serializeDataOnStructure(ps, maintainIdentifiers, compStructure, pageId, dataItemPointer);
        serializePropertiesOnStructure(ps, maintainIdentifiers, compStructure, pageId);
        serializeDesignOnStructure(ps, maintainIdentifiers, compStructure, pageId);
        serializeStyleOnStructure(ps, maintainIdentifiers, compStructure);
        serializeBehaviorOnStructure(ps, maintainIdentifiers, compStructure, pageId);
        serializeConnectionDataOnStructure(ps, maintainIdentifiers, compStructure, pageId);

        if (_.get(compStructure, 'modes.overrides')) {
            resolveDataItemsInOverrides(ps, compStructure.modes.overrides, maintainIdentifiers, pageId, structureEnricher);
        }
    }

    function stripHashIfExist(str) {
        return _.isString(str) ? str.replace('#', '') : null;
    }

    function resolveDataItemsInOverrides(ps, componentModesOverrides, maintainIdentifiers, pageId, structureEnricher) {
        _.forEach(componentModesOverrides, function (override) {
            structureEnricher(override);
            serializeStyleOnStructure(ps, maintainIdentifiers, override);
            serializeDesignOnStructure(ps, maintainIdentifiers, override, pageId);
            serializePropertiesOnStructure(ps, maintainIdentifiers, override, pageId);
        });
    }

    function serializeDataOnStructure(ps, maintainIdentifiers, compStructure, pageId, dataItemPointer) {
        if (compStructure.dataQuery) {
            var dataPointer = dataItemPointer || ps.pointers.data.getDataItem(stripHashIfExist(compStructure.dataQuery), pageId);
            compStructure.data = dataModel.serializeDataItem(ps, dataSchemas, dataPointer, true);
            if (maintainIdentifiers && compStructure.data) {
                compStructure.data.id = stripHashIfExist(compStructure.dataQuery);
            }
            delete compStructure.dataQuery;
        }
    }

    function serializePropertiesOnStructure(ps, maintainIdentifiers, structureWithProperties, pageId) {
        if (structureWithProperties.propertyQuery) {
            var sanitiziedPropertyQuery = stripHashIfExist(structureWithProperties.propertyQuery);
            var propsPointer = ps.pointers.data.getPropertyItem(sanitiziedPropertyQuery, pageId);
            structureWithProperties.props = dataModel.serializeDataItem(ps, propertiesSchemas, propsPointer, !maintainIdentifiers);
            if (maintainIdentifiers && structureWithProperties.props) {
                structureWithProperties.props.id = sanitiziedPropertyQuery;
            }
            delete structureWithProperties.propertyQuery;
        }
    }

    function serializeDesignOnStructure(ps, maintainIdentifiers, structureWithDesign, pageId) {
        if (structureWithDesign.designQuery) {
            var designPointer = ps.pointers.data.getDesignItem(stripHashIfExist(structureWithDesign.designQuery), pageId);
            structureWithDesign.design = dataModel.serializeDataItem(ps, designSchemas, designPointer, true);
            if (maintainIdentifiers && structureWithDesign.design) {
                structureWithDesign.design.id = stripHashIfExist(structureWithDesign.designQuery);
            }
            delete structureWithDesign.designQuery;
        }
    }

    function serializeBehaviorOnStructure(ps, maintainIdentifiers, compStructure, pageId) {
        if (compStructure.behaviorQuery) {
            var behaviorsPointer = ps.pointers.data.getBehaviorsItem(stripHashIfExist(compStructure.behaviorQuery), pageId);
            compStructure.behaviors = dataModel.serializeDataItem(ps, behaviorsSchemas, behaviorsPointer, true);
            if (maintainIdentifiers && compStructure.behaviors) {
                compStructure.behaviors.id = compStructure.behaviorQuery;
            }
            delete compStructure.behaviorQuery;
        }
    }

    function serializeConnectionDataOnStructure(ps, maintainIdentifiers, compStructure, pageId) {
        if (compStructure.connectionQuery) {
            var connectionsPointer = ps.pointers.data.getConnectionsItem(stripHashIfExist(compStructure.connectionQuery), pageId);
            compStructure.connections = dataModel.serializeDataItem(ps, connectionsSchemas, connectionsPointer, true);
            if (maintainIdentifiers && compStructure.connections) {
                compStructure.connections.id = compStructure.connectionQuery;
            }
            delete compStructure.connectionQuery;
        }
    }

    function serializeStyleOnStructure(ps, maintainIdentifiers, structureWithStyle) {
        if (structureWithStyle.styleId) {
            var stylePointer = ps.pointers.data.getThemeItem(stripHashIfExist(structureWithStyle.styleId));
            var styleType = ps.dal.get(ps.pointers.getInnerPointer(stylePointer, 'styleType'));
            if (styleType === 'custom') {
                structureWithStyle.style = dataModel.serializeDataItem(ps, null, stylePointer, true);
                if (maintainIdentifiers) {
                    structureWithStyle.style.id = structureWithStyle.styleId;
                }
            } else {
                structureWithStyle.style = structureWithStyle.styleId;
            }

            delete structureWithStyle.styleId;
        }
    }

    function serializeMobileStructure(ps, componentPointer, compStructure, maintainIdentifiers, pageId, flatMobileStructuresMap, structureEnricher) {
        var mobileComponentPointer = ps.pointers.components.getMobilePointer(componentPointer);
        if (componentStructureInfo.isExist(ps, mobileComponentPointer)) {//if this comp already has a mobile instance, simply serialize it but without its children
            if (experiment.isOpen('presetUploaderAddOn')) {
                compStructure.mobileStructure = serializeComponentStructureAndData(ps, mobileComponentPointer, null, true, false, null, structureEnricher);
            }
        } else {//otherwise, check if the comp being serialized has a mobileStructure preset saved for later when switching to mobile mode, and if so then take it
            var mobileStructure = flatMobileStructuresMap[componentPointer.id];
            if (mobileStructure) {
                resolveDataItems(ps, mobileStructure, undefined, maintainIdentifiers, pageId, structureEnricher);
                compStructure.mobileStructure = _.omit(mobileStructure, 'components', 'id', 'dataQuery', 'propertyQuery', 'styleId');
            }
        }
    }

    return {
        /**
         * Returns the Component as a Serialized ComponentDefinition Object.
         * @param {ps} ps
         * @param {Pointer} componentPointer - The component Reference to serialize the corresponding Component.
         * @param dataItemPointer
         * @param ignoreChildren
         * @param maintainIdentifiers
         * @param flatMobileStructuresMap
         * @returns a fully serialized   with its Data & Properties from the document. null is returned
         * in case no corresponding component is found.
         *
         *      @example
         *      var myPhotoReference = ...;
         *      ...
         *      var serializedComp = documentServices.components.serialize(myPhotoReference);
         */
        serializeComponent: serializeComponent
    };
});
