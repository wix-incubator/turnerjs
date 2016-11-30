define([
    'lodash',
    'siteUtils',
    'utils',
    'documentServices/dataModel/dataModel',
    'documentServices/component/componentData',
    'documentServices/hooks/hooks',
    'documentServices/anchors/anchors',
    'documentServices/theme/theme',
    'documentServices/component/componentValidations',
    'documentServices/component/componentSerialization',
    'documentServices/componentsMetaData/componentsMetaData',
    'documentServices/component/componentStylesAndSkinsAPI',
    'documentServices/component/componentModes',
    'documentServices/tpa/services/tpaEventHandlersService',
    'documentServices/tpa/utils/tpaUtils',
    'documentServices/structure/structureUtils',
    'documentServices/component/componentStructureInfo',
    'documentServices/structure/structure',
    'documentServices/structure/utils/arrangement',
    'experiment'
], function (_,
             siteUtils,
             utils,
             dataModel,
             componentData,
             hooks,
             anchors,
             theme,
             componentValidations,
             componentSerialization,
             componentsMetaData,
             componentStylesAndSkinsAPI,
             componentModes,
             tpaEventHandlersService,
             tpaUtils,
             structureUtils,
             componentStructureInfo,
             structure,
             arrangement,
             experiment) {
    'use strict';

    var SERIALIZED_PROPERTIES_TO_OMIT = ['custom', 'data', 'props', 'style', 'design', 'connections', 'activeModes', 'behaviors'];

    var MOBILE_COMP_DATA_PREFIX = 'mobile_';

    var CONTAINER_TYPES = [
        'wysiwyg.viewer.components.SiteSegmentContainer',
        'wysiwyg.viewer.components.FooterContainer',
        'wysiwyg.viewer.components.HeaderContainer',
        'wysiwyg.viewer.components.PagesContainer',
        'wysiwyg.viewer.components.PageGroup',
        'wysiwyg.viewer.components.ScreenWidthContainer',
        'wysiwyg.viewer.components.StripContainer',
        'wysiwyg.viewer.components.StripColumnsContainer',
        'wysiwyg.viewer.components.Column',
        'core.components.Container',
        'core.components.ContainerOBC',
        'wysiwyg.viewer.components.PopupContainer',
        'mobile.core.components.Container',
        'wysiwyg.viewer.components.Group',
        'wixapps.integration.components.common.formcontainer.viewer.FormContainer',
        'wixapps.integration.components.Area',
        'wysiwyg.viewer.components.BoxSlideShow',
        'wysiwyg.viewer.components.BoxSlideShowSlide',
        'wysiwyg.viewer.components.StripContainerSlideShow',
        'wysiwyg.viewer.components.StripContainerSlideShowSlide'
    ];

    var PAGE_TYPES = [
        'mobile.core.components.Page',
        'core.components.Page',
        'wixapps.integration.components.AppPage'
    ];

    var onAsyncSetOperationComplete = function (ps, err) {
        ps.setOperationsQueue.asyncSetOperationComplete(err);
    };

    function getComponentToAddRef(ps, containerReference, componentDefinition, optionalCustomId) {
        var id = optionalCustomId || generateNewComponentId();
        var viewMode = ps.pointers.components.getViewMode(containerReference);
        return ps.pointers.components.getUnattached(id, viewMode);
    }

    function validateConstraintsFormat(constraints) {

        if (_.isNull(constraints) || (_.isPlainObject(constraints) && _.isEmpty(constraints))) {
            return true;
        }

        if (!_.isObject(constraints)) {
            throw new Error('Non valid constraints value. Expected null or object');
        }

        var ownPropertiesArr = Object.getOwnPropertyNames(constraints);
        var numOfOwnProperties = ownPropertiesArr.length;

        if (numOfOwnProperties !== 1 || _.isUndefined(constraints.under)) {
            throw new Error('Constrains should be empty {} or have only property "under"');
        }

        if (!_.isPlainObject(constraints.under)) {
            throw new Error('Constrains "under" property should have plain object value');
        }

        ownPropertiesArr = Object.getOwnPropertyNames(constraints.under);

        if (ownPropertiesArr.length !== 2 || _.isUndefined(constraints.under.margin) || _.isUndefined(constraints.under.comp)) {
            throw new Error('Constraints "under" property should has the schema {comp: compRef, margin: number}');
        }

        if (!_.isNumber(constraints.under.margin)) {
            throw new Error('Constrains "margin" should be a number');
        }
    }


    function getLayoutByConstraints(ps, constraints) {
        var compAbovePointer = constraints.under.comp;
        var compAboveLayout = getComponentLayout(ps, compAbovePointer);
        var compAboveBottom = compAboveLayout.y + compAboveLayout.height;
        var compTop = compAboveBottom + constraints.under.margin;
        return {y: compTop};
    }

    function addWithConstraints(ps, componentToAddPointer, pagePointer, componentDefinition, constraints, optionalCustomId) {
        validateConstraintsFormat(constraints);
        if (!ps.pointers.components.isPage(pagePointer)) {
            throw new Error('this API works only for page parent for now');
        }
        if (!structure.isSimpleLayout(componentDefinition.layout)) {
            throw new Error('the layout of the added comp should be simple, no fixed, docked, rotated and such');
        }

        var compDef = componentDefinition;
        if (!_.isEmpty(constraints)) {
            var compAboveLayout = ps.dal.get(ps.pointers.getInnerPointer(constraints.under.comp, 'layout'));
            if (!structure.isSimpleLayout(compAboveLayout)) {
                throw new Error('you cannot place a component below a fixed, rotated, docked and such comps.');
            }
            compDef = _.clone(componentDefinition);
            compDef.layout = _.assign({}, compDef.layout, getLayoutByConstraints(ps, constraints));
        }

        addComponentToContainer(ps, componentToAddPointer, pagePointer, compDef, optionalCustomId);
    }

    /**
     * @param ps
     * @param containerPointer
     * @param {Object} componentDefinition - {componentType: String, styleId: String, data: String|Object, properties: String|Object}
     * @param {string} [optionalCustomId]
     * @param {Int} [optionalIndex]
     * @returns {*}
     * @param componentToAddPointer  - passed automatically from Site
     */
    function addComponentToContainer(ps, componentToAddPointer, containerPointer, componentDefinition, optionalCustomId, optionalIndex) {
        addComponent(ps, componentToAddPointer, containerPointer, componentDefinition, optionalCustomId, optionalIndex);
        updateAnchorsAfterOperationDone(ps, componentToAddPointer);
    }

    /**
     * @param ps
     * @param containerReference
     * @param {Object} componentDefinition - {componentType: String, styleId: String, data: String|Object, properties: String|Object}
     * @param {string} [optionalCustomId]
     * @returns {*}
     * @param componentToAddRef  - passed automatically from Site
     */
    function addComponent(ps, componentToAddRef, containerReference, componentDefinition, optionalCustomId, optionalIndex) {
        var containerToAddTo = componentStructureInfo.getContainerToAddComponentTo(ps, containerReference);
        var validationResult = componentValidations.validateComponentToAdd(ps, componentToAddRef, componentDefinition, containerToAddTo, optionalIndex);

        if (!validationResult.success) {
            throw new Error(validationResult.error);
        }

        hooks.executeHook(hooks.HOOKS.ADD_ROOT.BEFORE, componentDefinition.componentType, arguments);
        setComponent(ps, componentToAddRef, containerReference, componentDefinition, optionalCustomId);

        //TODO: we can change it to just change the definition, if we can extract the getAdjustedLayout from the updateAdjustedLayout..
        if (!_.isEqual(containerToAddTo, containerReference)) {
            structure.adjustCompLayoutToNewContainer(ps, componentToAddRef, containerToAddTo);
            structure.addCompToContainer(ps, componentToAddRef, containerToAddTo, optionalIndex);
        } else if (_.isFinite(optionalIndex)) {
            arrangement.moveToIndex(ps, componentToAddRef, optionalIndex);
        }

        hooks.executeHook(hooks.HOOKS.ADD_ROOT.AFTER, componentDefinition.componentType, arguments);
    }

    function addComponentDefinitionData(ps, data, pageId, customId) {
        var dataQuery = null;
        if (data) {
            if (_.isObject(data)) {
                dataQuery = dataModel.addSerializedDataItemToPage(ps, pageId, data, customId);
            } else if (_.isString(data)) {
                var defaultDataItem = dataModel.createDataItemByType(ps, data);
                dataQuery = dataModel.addSerializedDataItemToPage(ps, pageId, defaultDataItem, customId);
            }
            if (dataQuery && !_.startsWith(dataQuery, '#')) {
                dataQuery = '#' + dataQuery;
            }
        }
        return dataQuery;
    }

    function addComponentDefinitionBehaviors(ps, behaviors, pageId, customId) {
        if (!behaviors) {
            return null;
        }
        return dataModel.addSerializedBehaviorsItemToPage(ps, pageId, behaviors, customId);
    }

    function addComponentDefinitionConnections(ps, serializedConnections, pageId, customId) {
        if (!serializedConnections) {
            return null;
        }
        return dataModel.addSerializedConnectionsItemToPage(ps, pageId, serializedConnections, customId);
    }

    function addComponentDefinitionDesign(ps, design, pageId, customId) {
        var designQuery = null;
        if (design) {
            if (_.isObject(design)) {
                designQuery = dataModel.addSerializedDesignItemToPage(ps, pageId, design, customId);
            } else if (_.isString(design)) {
                var defaultDesignItem = dataModel.createDataItemByType(ps, design);
                designQuery = dataModel.addSerializedDesignItemToPage(ps, pageId, defaultDesignItem, customId);
            }
            if (designQuery && !_.startsWith(designQuery, '#')) {
                designQuery = '#' + designQuery;
            }
        }
        return designQuery;
    }

    function updateLayoutPropsForDockedComponent(componentLayout) {
        if (componentLayout.docked.right || componentLayout.docked.left || componentLayout.docked.hCenter) {
            if (componentLayout.docked.right && componentLayout.docked.left) {
                delete componentLayout.width;
            }

            delete componentLayout.x;
        }
        if (componentLayout.docked.top || componentLayout.docked.bottom || componentLayout.docked.vCenter) {
            if (componentLayout.docked.top && componentLayout.docked.bottom) {
                delete componentLayout.height;
            }

            delete componentLayout.y;
        }
    }

    function sanitizeCompLayout(componentDefinition, oldToNewIdMap) {
        componentDefinition.layout = componentDefinition.layout || {};
        var defaultLayout = {
            x: 0,
            y: 0,
            fixedPosition: false,
            width: 160,
            height: 90,
            scale: 1.0,
            rotationInDegrees: 0.0
        };
        if (!experiment.isOpen('removeJsonAnchors')) {
            defaultLayout.anchors = [];
        }
        var sanitizedComponentDefLayout = {};
        var allowedLayoutParams = componentValidations.ALLOWED_LAYOUT_PARAMS;

        _.forEach(allowedLayoutParams, function (layoutParam) {
            var value = componentDefinition.layout[layoutParam];
            if (value) {
                var validationResult = componentValidations.validateLayoutParam(layoutParam, value);
                if (!validationResult.success) {
                    throw new Error(validationResult.error);
                }
                sanitizedComponentDefLayout[layoutParam] = value;
            }
        });
        if (experiment.isOpen('removeJsonAnchors')) {
            delete sanitizedComponentDefLayout.anchors;
        } else if (oldToNewIdMap) {
            sanitizedComponentDefLayout.anchors = componentDefinition.layout.anchors;
        }

        componentDefinition.layout = _.assign(defaultLayout, sanitizedComponentDefLayout);

        if (componentDefinition.layout.docked) {
            updateLayoutPropsForDockedComponent(componentDefinition.layout);
        }
    }

    function omitPropertiesFromSerializedComp(compDefinition) {
        return _.omit(compDefinition, SERIALIZED_PROPERTIES_TO_OMIT);
    }

    /**
     * @param ps {ps}
     * @param compToAddPointer
     * @param containerPointer if is null it means that we add a page
     * @param serializedComp
     * @param optionalCustomId
     * @param isPage
     * @param oldToNewIdMap
     * @param modeIdsInHierarchy
     * @returns {*}
     */
    function setComponent(ps, compToAddPointer, containerPointer, serializedComp, optionalCustomId, isPage, oldToNewIdMap, modeIdsInHierarchy) {
        var validationResult = componentValidations.validateComponentToSet(ps, compToAddPointer, serializedComp, optionalCustomId, containerPointer, isPage);
        if (!validationResult.success) {
            throw new Error(validationResult.error);
        }

        if (experiment.isOpen('removeJsonAnchors') && serializedComp.layout) {
            delete serializedComp.layout.anchors;
        }

        hooks.executeHook(hooks.HOOKS.ADD.BEFORE, serializedComp.componentType, arguments);

        var clonedSerializedComp = utils.objectUtils.cloneDeep(serializedComp);

        if (oldToNewIdMap) {
            oldToNewIdMap[serializedComp.id] = compToAddPointer.id;
        }
        clonedSerializedComp.id = compToAddPointer.id;

        if (!clonedSerializedComp.type) {
            updateDefinitionTypeByComponentType(clonedSerializedComp);
        }
        sanitizeCompLayout(clonedSerializedComp, oldToNewIdMap);

        modeIdsInHierarchy = modeIdsInHierarchy || {
                ancestorsModes: collectAncestorsModeIds(ps, containerPointer, {}),
                oldModeIdsToNew: {}
            };
        modeIdsInHierarchy.ancestorsModes = _.merge(modeIdsInHierarchy.ancestorsModes, getComponentModeIdsFromStructure(clonedSerializedComp));
        clonedSerializedComp = sanitizeComponentModes(ps, clonedSerializedComp, compToAddPointer, modeIdsInHierarchy);
        updateComponentModesIdsInStructure(clonedSerializedComp, modeIdsInHierarchy);

        var pageId = isPage ? compToAddPointer.id : ps.pointers.components.getPageOfComponent(containerPointer).id;
        deserializeComponentData(ps, clonedSerializedComp, pageId, optionalCustomId, isPage, oldToNewIdMap, modeIdsInHierarchy);

        var children = serializedComp.components;
        if (children) {
            clonedSerializedComp.components = [];
        }

        var mobileChildren = serializedComp.mobileComponents;
        if (mobileChildren) {
            clonedSerializedComp.mobileComponents = [];
        }

        var structureToAdd = omitPropertiesFromSerializedComp(clonedSerializedComp);
        if (!isPage) {
            var childrenPointer = ps.pointers.components.getChildrenContainer(containerPointer);
            ps.dal.full.push(childrenPointer, structureToAdd, compToAddPointer);
        } else {
            ps.dal.full.set(compToAddPointer, structureToAdd);
        }

        setComponentChildrenDefinition(ps, children, compToAddPointer, oldToNewIdMap, modeIdsInHierarchy, clonedSerializedComp.activeModes);

        if (mobileChildren) {
            var mobilePageComponentPointer = ps.pointers.components.getPage(pageId, 'MOBILE');
            setComponentChildrenDefinition(ps, mobileChildren, mobilePageComponentPointer, oldToNewIdMap, modeIdsInHierarchy, clonedSerializedComp.activeModes);
        }

        // send the actual compDefinition, instead of its prototype)
        var afterArgs = [ps, compToAddPointer, clonedSerializedComp, optionalCustomId, oldToNewIdMap, containerPointer];
        hooks.executeHook(hooks.HOOKS.ADD.AFTER, clonedSerializedComp.componentType, afterArgs);

        return compToAddPointer;
    }

    function updateComponentModesIdsInStructure(serializedComp, oldModeIdsToNew) {
        _.assign(oldModeIdsToNew, createNewModeIds(serializedComp));
        updateCompDefinitionModes(serializedComp, oldModeIdsToNew);
        updateCompOverrideModes(serializedComp, oldModeIdsToNew);
    }

    function deserializeComponentData(ps, serializedComp, pageId, optionalCustomId, isPage, oldToNewIdMap, modeIdsInHierarchy) {
        updateComponentDataDefinition(ps, pageId, optionalCustomId, isPage, oldToNewIdMap, serializedComp);
        updateComponentPropsDefinition(ps, pageId, optionalCustomId, oldToNewIdMap, serializedComp);
        updateComponentDesignDefinition(ps, pageId, optionalCustomId, oldToNewIdMap, serializedComp);
        updateComponentBehaviorsDefinition(ps, pageId, optionalCustomId, oldToNewIdMap, modeIdsInHierarchy, serializedComp);
        setComponentDefinitionStyle(ps, serializedComp);
        deserializeComponentOverridesData(ps, serializedComp, pageId, optionalCustomId, oldToNewIdMap);
        updateComponentConnectionsDefinition(serializedComp, ps, pageId, optionalCustomId, oldToNewIdMap);
    }

    /**
     * Check if compStructure contains modes that are still relevant under the new container.
     * If no relevant modes, return the displayed json of the component, under the modes that were active when the component was serialized
     * If there are relevant modes, remove only those that are no longer relevant.
     */
    function sanitizeComponentModes(ps, compStructure, compToAddPointer, modeIdsInHierarchy) {
        // all potential active modes and component's definition modes Ids.
        var potentialModesToAffectComponentInContainer = modeIdsInHierarchy.ancestorsModes;

        var shouldCreateDisplayedStructure = _.isEmpty(potentialModesToAffectComponentInContainer);
        if (shouldCreateDisplayedStructure) {
            return createDisplayedComponentStructure(ps, compToAddPointer, compStructure);
        }
        return removeAllUnusedOverrides(compStructure, potentialModesToAffectComponentInContainer);
    }

    function getComponentModeIdsFromStructure(compStructure) {
        var modeIdsMap = {};
        _.forEach(_.get(compStructure, 'modes.definitions'), function (modeDefinition) {
            modeIdsMap[modeDefinition.modeId] = true;
        });
        return modeIdsMap;
    }

    function createDisplayedComponentStructure(ps, compToAddPointer, compStructure) {
        var activeModes = compStructure.activeModes;
        var displayedComp = utils.siteRenderPrivateStuff.fullToDisplayedJson.applyModesOnSerializedStructure(compStructure, activeModes);
        if (!_.isEmpty(activeModes)) {
            updateLayoutXYOnStructure(displayedComp, compStructure.layout);
        }
        return displayedComp;
    }

    function updateLayoutXYOnStructure(structureToUpdate, layout) {
        structureToUpdate.layout.x = _.get(layout, 'x') || _.get(structureToUpdate, 'layout.x');
        structureToUpdate.layout.y = _.get(layout, 'y') || _.get(structureToUpdate, 'layout.y');
    }

    function collectAncestorsModeIds(ps, componentPointer, newModeIdsToOld) {
        var collectedModeIds = [];
        while (componentPointer) {
            var ancestorModeIds = getOldComponentModesIds(ps, componentPointer, newModeIdsToOld);
            collectedModeIds = collectedModeIds.concat(ancestorModeIds);
            componentPointer = ps.pointers.full.components.getParent(componentPointer);
        }

        return _(collectedModeIds)
            .groupBy(_.identity) //eslint-disable-line lodash/identity-shorthand
            .mapValues(Boolean)
            .value();
    }

    function getOldComponentModesIds(ps, component, newModeIdsToOld) {
        var componentModesIds = [];
        var compModes = componentModes.getComponentModes(ps, component);
        _.forEach(compModes, function (compMode) {
            var oldComponentModeID = newModeIdsToOld[compMode.modeId];
            if (oldComponentModeID) {
                componentModesIds.push(oldComponentModeID);
            } else {
                componentModesIds.push(compMode.modeId);
            }
        });
        return componentModesIds;
    }

    function removeAllUnusedOverrides(compDefinition, modesToMaintain) {
        if (compDefinition && modesToMaintain) {
            var compOverrides = _.get(compDefinition, 'modes.overrides');
            if (compOverrides) {
                compOverrides = _.filter(compOverrides, function (override) {
                    return _.every(override.modeIds, function (modeId) {
                        return modesToMaintain[modeId];
                    });
                });
                compDefinition.modes.overrides = compOverrides;
            }
        }
        return compDefinition;
    }

    function updateDefinitionTypeByComponentType(serializedComp) {
        if (_.includes(CONTAINER_TYPES, serializedComp.componentType)) {
            serializedComp.type = 'Container';
        } else if (_.includes(PAGE_TYPES, serializedComp.componentType)) {
            serializedComp.type = 'Page';
        } else {
            serializedComp.type = 'Component';
        }
    }

    function setComponentDefinitionProps(ps, props, pageId, customId) {
        var propertyQuery = null;
        if (props) {
            if (_.isObject(props)) {
                propertyQuery = dataModel.addSerializedPropertyItemToPage(ps, pageId, props, customId);
            } else if (_.isString(props)) {
                var defaultPropsItem = dataModel.createPropertiesItemByType(ps, props);
                propertyQuery = dataModel.addSerializedPropertyItemToPage(ps, pageId, defaultPropsItem, customId);
            }
        }
        return propertyQuery;
    }

    function setComponentDefinitionStyle(ps, serializedComp) {
        return setStructureDefinitionStyle(ps, serializedComp.componentType, serializedComp);
    }

    function setStructureDefinitionStyle(ps, componentTypeForSystemStyle, serializedComp) {
        if (serializedComp.style) {
            if (_.isObject(serializedComp.style)) {
                var styleId = dataModel.addSerializedStyleItemToPage(ps, serializedComp.style);
                serializedComp.styleId = styleId;
            } else {
                if (!theme.styles.get(ps, serializedComp.style)) {
                    componentStylesAndSkinsAPI.style.createSystemStyle(ps, serializedComp.style, componentTypeForSystemStyle);
                }
                serializedComp.styleId = serializedComp.style;
            }
        }
    }


    function updateAnchorsAfterOperationDone(ps, compPointer) {
        anchors.updateAnchors(ps, compPointer);
    }


    function setComponentChildrenDefinition(ps, children, containerRef, idMap, oldModeIdsToNew, activeModes) {
        if (children && containerRef) {
            // TODO when merging removeJsonAnchors refactor this form map to forEach
            var childrenWithAnchorsToUpdate = _.map(children, function (componentDef) {
                var newId = idMap && idMap[componentDef.id];
                var childCompRef = getComponentToAddRef(ps, containerRef, componentDef, newId);
                componentDef.activeModes = activeModes;
                setComponent(ps, childCompRef, containerRef, componentDef, newId, false, idMap, oldModeIdsToNew);
                if (experiment.isOpen('removeJsonAnchors') || _.isEmpty(componentDef.layout.anchors) || !idMap) {
                    updateAnchorsAfterOperationDone(ps, childCompRef);
                }
                return {ref: childCompRef, layout: componentDef.layout};
            });
            if (idMap && !experiment.isOpen('removeJsonAnchors')) {
                updateChildrenAnchorIds(children, idMap);
                updateComponentsLayout(ps, childrenWithAnchorsToUpdate);
            }
        }
    }

    function updateComponentsLayout(ps, childrenWithAnchorsToUpdate) {
        _.forEach(childrenWithAnchorsToUpdate, function (updatedChild) {
            var layoutPointer = ps.pointers.getInnerPointer(updatedChild.ref, 'layout');
            ps.dal.full.merge(layoutPointer, updatedChild.layout);
        });
    }

    function updateChildrenAnchorIds(children, idMap) {
        _.forEach(children, function (componentDef) {
            _.forEach(componentDef.layout.anchors, function (anchorData) {
                var anchorDataWithNewIds = {
                    fromComp: idMap[anchorData.fromComp] || anchorData.fromComp,
                    targetComponent: idMap[anchorData.targetComponent] || anchorData.targetComponent
                };
                _.assign(anchorData, anchorDataWithNewIds);
            });
        });
    }


    function updateComponentDataDefinition(ps, pageId, optionalCustomId, isPage, oldToNewIdMap, compDefinition) {
        if (isPage) {
            compDefinition.dataQuery = '#' + pageId;
        } else {
            optionalCustomId = getCustomId(oldToNewIdMap, compDefinition.data, optionalCustomId);
            var dataQuery = addComponentDefinitionData(ps, compDefinition.data, pageId, optionalCustomId);
            if (dataQuery) {
                compDefinition.dataQuery = dataQuery;
                addIdToMap(compDefinition.data, dataQuery, oldToNewIdMap);
            }
        }
    }

    function updateComponentDesignDefinition(ps, pageId, optionalCustomId, oldToNewIdMap, serializedCompOrModeOverride) {
        optionalCustomId = getCustomId(oldToNewIdMap, serializedCompOrModeOverride.design, optionalCustomId);
        var designQuery = addComponentDefinitionDesign(ps, serializedCompOrModeOverride.design, pageId, optionalCustomId);
        if (designQuery) {
            serializedCompOrModeOverride.designQuery = designQuery;
            addIdToMap(serializedCompOrModeOverride.design, designQuery, oldToNewIdMap);
        }
    }

    function updateComponentBehaviorsDefinition(ps, pageId, optionalCustomId, oldToNewIdMap, modeIdsInHierarchy, compDefinition) {
        if (!compDefinition.behaviors) {
            return;
        }
        if (_.isString(compDefinition.behaviors)) {//supporting old add panel data
            compDefinition.behaviors = dataModel.createBehaviorsItem(compDefinition.behaviors);
        }
        compDefinition.behaviors = fixBehaviorsModeIds(compDefinition.behaviors, modeIdsInHierarchy);
        optionalCustomId = getCustomId(oldToNewIdMap, compDefinition.behaviors, optionalCustomId);
        var behaviorQuery = addComponentDefinitionBehaviors(ps, compDefinition.behaviors, pageId, optionalCustomId);
        if (behaviorQuery) {
            compDefinition.behaviorQuery = behaviorQuery;
            addIdToMap(compDefinition.behaviors, behaviorQuery, oldToNewIdMap);
        }
    }

    function fixBehaviorsModeIds(behaviors, modeIdsInHierarchy) {
        if (behaviors && behaviors.items) {
            var behaviorsItems = behaviors.items;
            if (_.isString(behaviorsItems)) {
                behaviorsItems = JSON.parse(behaviorsItems);
            }
            var fixedBehaviorItems = _.map(behaviorsItems, function (behaviorItem) {
                var behaviorItemModeIds = _.get(behaviorItem, 'params.modeIds');
                if (behaviorItemModeIds) {
                    _.set(behaviorItem, 'params.modeIds', _.map(behaviorItemModeIds, function (modeId) {
                        return modeIdsInHierarchy[modeId];
                    }));
                }
                return behaviorItem;
            });
            var behaviorResult = _.omit(behaviors, 'items');
            behaviorResult.items = JSON.stringify(fixedBehaviorItems);
            return behaviorResult;
        }
        return behaviors;
    }

    function updateComponentConnectionsDefinition(compDefinition, ps, pageId, optionalCustomId, oldToNewIdMap) {
        optionalCustomId = getCustomId(oldToNewIdMap, compDefinition.connections, optionalCustomId);
        var connectionQuery = addComponentDefinitionConnections(ps, compDefinition.connections, pageId, optionalCustomId);
        if (connectionQuery) {
            compDefinition.connectionQuery = connectionQuery;
            addIdToMap(compDefinition.connections, connectionQuery, oldToNewIdMap);
        }
    }

    function updateComponentPropsDefinition(ps, pageId, optionalCustomId, oldToNewIdMap, serializedCompOrModeOverride) {
        optionalCustomId = getCustomId(oldToNewIdMap, serializedCompOrModeOverride.props, optionalCustomId);
        var propertyQuery = setComponentDefinitionProps(ps, serializedCompOrModeOverride.props, pageId, optionalCustomId);
        if (propertyQuery) {
            serializedCompOrModeOverride.propertyQuery = propertyQuery;
            addIdToMap(serializedCompOrModeOverride.props, propertyQuery, oldToNewIdMap);
        }
    }

    function createNewModeIds(compDefinition) {
        var modeDefinitions = _.get(compDefinition, 'modes.definitions');
        if (modeDefinitions) {
            var compId = compDefinition.id;
            return _.reduce(modeDefinitions, function (result, modeDef) {
                result[modeDef.modeId] = componentModes.createUniqueModeId(compId);
                return result;
            }, {});
        }
        return {};
    }

    function updateCompDefinitionModes(serializedComp, oldModeIdsToNew) {
        if (serializedComp.modes && serializedComp.modes.definitions) {
            serializedComp.modes.definitions = _.map(serializedComp.modes.definitions, function (modeDef) {
                return _.defaults({
                    modeId: oldModeIdsToNew[modeDef.modeId]
                }, modeDef);
            });
        }
    }

    function updateCompOverrideModes(serializedComp, oldModeIdsToNew) {
        if (_.get(serializedComp, 'modes.overrides')) {
            serializedComp.modes.overrides = _.map(serializedComp.modes.overrides, function (modeOverride) {
                var newModeIds = _.map(modeOverride.modeIds, function (oldModeId) {
                    return oldModeIdsToNew[oldModeId] || oldModeId;
                });
                return _.defaults({
                    modeIds: newModeIds
                }, modeOverride);
            });
        }
    }

    function deserializeComponentOverridesData(ps, serializedComponent, pageId, optionalCustomId, oldToNewIdMap) {
        var overrides = _.get(serializedComponent, 'modes.overrides');
        if (!_.isEmpty(overrides)) {
            _.forEach(overrides, function (override) {
                setStructureDefinitionStyle(ps, serializedComponent.componentType, override);
                updateComponentDesignDefinition(ps, pageId, optionalCustomId, oldToNewIdMap, override);
                updateComponentPropsDefinition(ps, pageId, optionalCustomId, oldToNewIdMap, override);
            });
            overrides = _.map(overrides, omitPropertiesFromSerializedComp);
            _.set(serializedComponent, 'modes.overrides', overrides);
        }
    }

    function getCustomId(oldToNewIdMap, dataObject, customId) {
        var newId = customId;
        if (!oldToNewIdMap || !dataObject) {
            return newId;
        }
        var serializedDataId = stripHashIfExist(dataObject.id);
        if (oldToNewIdMap[serializedDataId]) {
            newId = oldToNewIdMap[serializedDataId];
        } else if (_.startsWith(serializedDataId, MOBILE_COMP_DATA_PREFIX)) {
            var idSuffix = serializedDataId.substring(MOBILE_COMP_DATA_PREFIX.length);
            var mobilePropsMappedId = oldToNewIdMap[idSuffix];
            if (mobilePropsMappedId) {
                newId = MOBILE_COMP_DATA_PREFIX + mobilePropsMappedId;
            }
        }
        return newId;
    }

    function addIdToMap(dataObject, newId, oldToNewIdMap) {
        if (!oldToNewIdMap) {
            return;
        }
        var serializedDataId = stripHashIfExist(dataObject.id);
        newId = stripHashIfExist(newId);
        if (dataObject.id && oldToNewIdMap && !oldToNewIdMap[serializedDataId]) {
            oldToNewIdMap[serializedDataId] = newId;
        }
    }

    function deleteDesktopComponentAndCallAsyncOperationComplete(ps, componentPointer, completeCallback, removeArgs) {
        var externalCallback = !completeCallback ? onAsyncSetOperationComplete : function () {
            onAsyncSetOperationComplete(ps);
            completeCallback();
        };
        deleteDesktopComponent(ps, componentPointer, externalCallback, removeArgs);
    }

    function deleteDesktopComponent(ps, componentPointer, completeCallback, removeArgs) {
        if (!componentModes.shouldDeleteComponentFromFullJson(ps, componentPointer)) {
            deleteCompFromDisplayedJson(ps, componentPointer, completeCallback);
            return;
        }

        if (ps.pointers.components.isMobile(componentPointer)) {
            throw new Error(componentValidations.ERRORS.CANNOT_DELETE_MOBILE_COMPONENT);
        }

        completeCallback = completeCallback || onAsyncSetOperationComplete;
        deleteComponentAsync(ps, componentPointer, completeCallback, removeArgs);
    }

    function deleteCompFromDisplayedJson(ps, compPointer, completeCallback) {
        ps.dal.remove(compPointer);
        if (completeCallback) {
            completeCallback(ps);
        }
    }

    function getAllTpaComps(ps, componentPointer) {
        var tpaChildRefs = componentStructureInfo.getTpaChildren(ps, componentPointer);

        if (tpaUtils.isTpaByCompType(componentStructureInfo.getType(ps, componentPointer))) {
            tpaChildRefs.push(componentPointer);
        }
        return tpaChildRefs;
    }

    function executeAllTpaDeleteHandlers(ps, componentPointer) {
        var tpaChildRefs = getAllTpaComps(ps, componentPointer);

        _.forEach(tpaChildRefs, function (childRef) {
            if (tpaEventHandlersService.isDeleteHandlerExists(childRef.id)) {
                tpaEventHandlersService.executeDeleteHandler(childRef.id);
            }
        });
    }

    function shouldDelayDeletionTpa(ps, componentPointer) {
        var tpaChildRefs = getAllTpaComps(ps, componentPointer);

        return _.some(tpaChildRefs, function (childRef) {
            return tpaEventHandlersService.isDeleteHandlerExists(childRef.id);
        });
    }

    //TODO: pass the delay delete (isOperationAsync) as param from Q
    function deleteComponentAsync(ps, componentPointer, completeCallback, removeArgs) {
        var delayDelete = shouldDelayDeletionTpa(ps, componentPointer);

        if (delayDelete) {
            executeAllTpaDeleteHandlers(ps, componentPointer);

            _.delay(function () {
                actualDelete(ps, componentPointer, false, removeArgs, completeCallback);
            }, 500);
        } else {
            actualDelete(ps, componentPointer, false, removeArgs, completeCallback);
        }
    }

    function actualDelete(ps, componentPointer, deletingParent, removeArgs, completeCallback) {
        deleteComponent(ps, componentPointer, deletingParent, removeArgs);
        tpaEventHandlersService.unRegisterHandlers(ps, componentPointer.id);
        completeCallback(ps);
    }

    /**
     * Removes a component from a given defined path in the document.
     * @param {ps} ps
     * @param {Pointer} componentPointer
     * @param {Boolean} deletingParent is this component is deleted as part of deletion of it's parent
     * @param {Object} removeArgs - additional deletion arguments
     * @returns {boolean} true iff the component was removed successfully.
     */
    function deleteComponent(ps, componentPointer, deletingParent, removeArgs, deletedParentFromFull) {
        var shouldDeleteComponentFromFullJson = deletedParentFromFull || componentModes.shouldDeleteComponentFromFullJson(ps, componentPointer);
        if (!shouldDeleteComponentFromFullJson) {
            deleteCompFromDisplayedJson(ps, componentPointer);
            return;
        }

        var validationResult = componentValidations.validateComponentToDelete(ps, componentPointer);
        if (!validationResult.success) {
            throw new Error(validationResult.error);
        }
        var parentPointer = ps.pointers.components.getParent(componentPointer);
        var compType = componentStructureInfo.getType(ps, componentPointer);

        //TODO: check hooks pointers
        hooks.executeHook(hooks.HOOKS.REMOVE.BEFORE, compType, arguments);

        var childrenRefs = ps.pointers.components.getChildren(componentPointer);
        _.forEachRight(childrenRefs, function (child) {
            return deleteComponent(ps, child, true, removeArgs, shouldDeleteComponentFromFullJson);
        });

        var copyDataItem = dataModel.getDataItem(ps, componentPointer);
        if (!ps.pointers.components.isPage(componentPointer)) { //TODO: remove the !isPage and make the page delete flow work better. I will fix this. -Etai
            var isDesktop = !ps.pointers.components.isMobile(componentPointer);

            var desktopPointer = isDesktop ? componentPointer : ps.pointers.components.getDesktopPointer(componentPointer);
            var mobilePointer = isDesktop ? ps.pointers.components.getMobilePointer(componentPointer) : componentPointer;
            var mobileCompExists = ps.dal.isExist(mobilePointer);

            if (isDesktop) {
                // Data is never forked
                dataModel.deleteDataItem(ps, desktopPointer);
                dataModel.removeBehaviorsItem(ps, desktopPointer);

                dataModel.deleteDesignItem(ps, desktopPointer);
                dataModel.deletePropertiesItem(ps, desktopPointer);
            }

            if (mobileCompExists) {
                var isDesignForked = !_.isEqual(dataModel.getDesignItemPointer(ps, desktopPointer), dataModel.getDesignItemPointer(ps, mobilePointer));
                var arePropsForked = componentData.isMobileComponentPropertiesSplit(ps, mobilePointer);
                if (isDesignForked) {
                    dataModel.deleteDesignItem(ps, mobilePointer);
                }
                if (arePropsForked) {
                    dataModel.deletePropertiesItem(ps, mobilePointer);
                }
            }
        }

        var argsForHooks = _.toArray(arguments);

        argsForHooks[5] = copyDataItem; // Keep order if some arguments not passed
        argsForHooks.push(parentPointer);

        ps.dal.remove(componentPointer);

        //TODO: check hooks pointers
        hooks.executeHook(hooks.HOOKS.REMOVE.AFTER, compType, argsForHooks);

        if (anchors && parentPointer && !deletingParent && ps.dal.get(parentPointer)) {
            anchors.updateAnchors(ps, parentPointer);
        }
    }

    function stripHashIfExist(str) {
        return _.isString(str) ? str.replace('#', '') : null;
    }

    function getComponentToDuplicateRef(ps, componentPointer, newContainerPointer, customId) {
        var id = customId || generateNewComponentId();
        var viewMode = ps.pointers.components.getViewMode(newContainerPointer);
        return ps.pointers.components.getUnattached(id, viewMode);
    }

    /**
     * Duplicate a component and place it under a given path.
     * This method duplicates child components recursively.
     * @param ps privateServices
     * @param componentPointer the component to be duplicated
     * @param newContainerPointer the path for the duplicated component
     * @param {String=} customId
     * @returns {*} the duplicated component
     * @param compRefToAdd
     */
    function duplicateComponent(ps, compRefToAdd, componentPointer, newContainerPointer, customId) {
        var serializedComponent = componentSerialization.serializeComponent(ps, componentPointer);
        addComponentToContainer(ps, compRefToAdd, newContainerPointer, serializedComponent, customId);
    }

    function isComponentRemovable(ps, compPointer) {
        var isRemovable = componentsMetaData.public.isRemovable(ps, compPointer);
        if (!isRemovable) {
            return false;
        }
        var compType = componentStructureInfo.getType(ps, compPointer);
        return hooks.executeHook(hooks.HOOKS.REMOVE.IS_OPERATION_ALLOWED, compType, arguments, function (isAllowed) {
            return isAllowed === false;
        });
    }

    function isComponentDuplicatable(ps, compPointer, potentialParentPointer) {
        var isDuplicatable = componentsMetaData.public.isDuplicatable(ps, compPointer, potentialParentPointer);
        if (!isDuplicatable) {
            return false;
        }
        var compType = componentStructureInfo.getType(ps, compPointer);
        return hooks.executeHook(hooks.HOOKS.DUPLICATE.IS_OPERATION_ALLOWED, compType, arguments, function (isAllowed) {
            return isAllowed === false;
        });
    }

    function getComponentLayout(privateServices, compPointer) {
        return structureUtils.getComponentLayout(privateServices, compPointer);
    }

    function isComponentVisible(ps, compPointer) {
        var renderFlagsPointer = ps.pointers.general.getRenderFlags();
        var renderFlags = ps.dal.get(renderFlagsPointer);
        var argsObj = {
            compId: compPointer.id,
            compType: componentStructureInfo.getType(ps, compPointer),
            compProperties: componentStructureInfo.getPropertiesItem(ps, compPointer),
            compLayout: structureUtils.getComponentLayout(ps, compPointer),
            renderFlags: renderFlags
        };
        return siteUtils.componentVisibility.isComponentVisible(argsObj);
    }


    /**
     * Generates a new random component Id to be used under a parent's path.
     * @returns {*}
     */
    function generateNewComponentId() {
        return utils.guidUtils.getUniqueId("comp", "-");
    }

    function isComponentModal(ps, compPointer) {
        return componentsMetaData.public.isModal(ps, compPointer);
    }

    function isComponentUsingLegacyAppPartSchema(ps, compPointer) {
        return componentsMetaData.public.isUsingLegacyAppPartSchema(ps, compPointer);
    }

    /** @class documentServices.components */

    return _.merge({
        /**
         * returns true if one of the component offspring type included in supplied types.
         *
         * @param {jsonDataPointer} parentCompReference a ComponentReference of a corresponding Component containing children.
         * @param {string/array} {types} component types to check against.
         * taken from the parent's reference or from the current view mode of the document.
         * @returns {boolean} true if one of the component offspring type included in supplied types.
         *
         *      @example
         *      var types = ['wysiwyg.viewer.components.tpapps.TPASection', 'wysiwyg.viewer.components.tpapps.TPAMultiSection'];
         *      var isContainTPASection = documentServices.components.isContainsCompWithType(mainPageRef, types);
         */
        isContainsCompWithType: componentStructureInfo.isContainsCompWithType,
        isRenderedOnSite: componentStructureInfo.isRenderedOnSite,
        getComponentToAddRef: getComponentToAddRef,
        getComponentToDuplicateRef: getComponentToDuplicateRef,
        /**
         * Add a component to a container in the document.
         *
         * @param {jsonDataPointer} containerPointer of the container to add the component to.
         * @param {Object} componentDefinition - {componentType: String, styleId: String, data: String|Object, properties: String|Object}<br>
         * componentDefinition is a javascript object containing data such as:
         * 'componentType', 'skin', 'style', 'layout', 'components'(children components), 'data' & 'props'.<br>
         * Notice that the 'componentDefinition' object may or may not contain 'layout' object.<br>
         * Notice that the 'componentDefinition' object must contain 'data' & 'props' either being of a 'string'
         * type matching the componentType, or a dataItem/propertiesItem matching the componentType.
         * These can be created by the documentServices.data.createItem("MyDataItemType") and
         * the documentServices.properties.. respectively;
         * @param {string} [optionalCustomId] An optional ID to give the component which will be added. in case
         * componentDefinition holds 'components' (holding componentDefinitions recursively), the 'id' key, will be
         * passed recursively as the childrens' Ids.
         * @returns the added component Reference, or 'null' if failed.
         * @throws an exception in case the parent container isn't a valid one.
         *
         *      @example
         *      var mainPageRef = documentServices.pages.getReference('mainPage');
         *      var photoCompDef = {
             *          "style": "wp1",
             *          "componentType": "wysiwyg.viewer.components.WPhoto",
             *          "data": "Image",
             *          "props": "WPhotoProperties"
             *      };
         *
         *      var addedPhotoRef = documentServices.components.add(mainPageRef, photoCompDef);
         *      documentServices.components.data.update(addedPhotoRef, {"uri": "http://www.company.domain/path-to/image.png"});
         */
        add: addComponentToContainer,

        addWithConstraints: addWithConstraints,
        /**
         * Add a component to a container in the document.
         *
         * @param {jsonDataPointer} containerReference of the container to add the component to.
         * @param {Object} componentDefinition - {componentType: String, styleId: String, data: String|Object, properties: String|Object}<br>
         * componentDefinition is a javascript object containing data such as:
         * 'componentType', 'skin', 'style', 'layout', 'components'(children components), 'data' & 'props'.<br>
         * Notice that the 'componentDefinition' object may or may not contain 'layout' object.<br>
         * Notice that the 'componentDefinition' object must contain 'data' & 'props' either being of a 'string'
         * type matching the componentType, or a dataItem/propertiesItem matching the componentType.
         * These can be created by the documentServices.data.createItem("MyDataItemType") and
         * the documentServices.properties.. respectively;
         * @param {string} [optionalCustomId] An optional ID to give the component which will be added. in case
         * componentDefinition holds 'components' (holding componentDefinitions recursively), the 'id' key, will be
         * passed recursively as the childrens' Ids.
         * @returns the added component Reference, or 'null' if failed.
         * @throws an exception in case the parent container isn't a valid one.
         *
         *      @example
         *      var mainPageRef = documentServices.pages.getReference('mainPage');
         *      var photoCompDef = {
             *          "style": "wp1",
             *          "componentType": "wysiwyg.viewer.components.WPhoto",
             *          "data": "Image",
             *          "props": "WPhotoProperties"
             *      };
         *
         *      var addedPhotoRef = documentServices.components.add(mainPageRef, photoCompDef);
         *      documentServices.components.data.update(addedPhotoRef, {"uri": "http://www.company.domain/path-to/image.png"});
         */
        addAndAdjustLayout: addComponent,
        /**
         * Duplicate a component and place it under a given path.<br>
         * This method duplicates child components recursively.
         * @param {jsonDataPointer} componentReference the reference to the component to duplicate.
         * @param {jsonDataPointer} newContainerReference the reference to the container to contain the new duplicated component.
         * @param {string} [customId] an optional specific custom ID to be given to the duplicated component.
         * @returns the added component Reference, or 'null' if failed.
         * @throws an exception in case the parent container isn't a valid one.
         *
         *      @example
         *      var duplicatedComponent = documentServices.components.duplicate(compReference, targetContainerReference, "compDouble");
         */
        duplicate: duplicateComponent,
        /**
         * @see componentSerialization.serializeComponent
         */
        serialize: componentSerialization.serializeComponent,
        /**
         * Deletes a component from the Document.
         *
         * @param {jsonDataPointer} componentReference the reference to the component to delete.
         * @param {Function} completeCallback - callback to be called when done
         * @param {Object} removeArgs - additional deletion arguments
         * @returns true iff the component was deleted successfully from the document.
         * @throws an exception in case ComponentReference view mode is NOT 'Desktop'.
         *
         *      @example
         *      var compReference = ...;
         *      var removeArgs = {isReplacingComp: true}
         *      var isDeleted = documentServices.components.remove(compReference, callBack, removeArgs);
         */
        remove: deleteDesktopComponent,
        shouldDelayDeletion: shouldDelayDeletionTpa,
        /**
         * Deletes a component from the Document.
         *
         * @param {jsonDataPointer} componentReference the reference to the component to delete.
         * @param {Function} completeCallback - callback to be called when done
         * @param {Object} removeArgs - additional deletion arguments
         * @returns true iff the component was deleted successfully from the document.
         * @throws an exception in case ComponentReference view mode is NOT 'Desktop'.
         *
         *      @example
         *      var compReference = ...;
         *      var removeArgs = {isReplacingComp: true}
         *      var isDeleted = documentServices.components.remove(compReference, callBack, removeArgs);
         */
        externalRemove: deleteDesktopComponentAndCallAsyncOperationComplete,

        /**
         * Returns the parent Component of a component.
         *
         * @param {jsonDataPointer} componentReference a Component Reference corresponding a Component in the document.
         * @returns {jsonDataPointer} the Component Reference of the parent component, or null if no parent component (example - for page)
         * @throws an error in case the '<i>componentReference</i>' is invalid.
         *
         *      @example
         *      var buttonContainerCompRef = documentServices.components.layout.getParent(buttonComponentRef);
         */
        getContainer: componentStructureInfo.getContainer,
        /**
         * Returns the parent Component of a component.
         *
         * @returns {jsonDataPointer} the page the the component is in
         * @throws an error in case the '<i>componentReference</i>' is invalid.
         *
         *      @example
         *      var buttonContainerCompRef = documentServices.components.layout.getParent(buttonComponentRef);
         * @param {jsonDataPointer} compPointer
         */
        getPage: componentStructureInfo.getPage,
        /**
         * Returns the Siblings array of a component.
         *
         * @param {jsonDataPointer} compReference a Component Reference corresponding a component in the document.
         * @returns {jsonDataPointer[]} an array of <i>'ComponentReference'</i>s of the Component's siblings.
         * @throws an Error in case the compReference isn't valid.
         */
        getSiblings: componentStructureInfo.getSiblings,
        /**
         * returns the children components of a parent component, that should be displayed on render.
         * If a site exists, these are the currently rendered children.
         *
         * @param {jsonDataPointer} parentCompReference a ComponentReference of a corresponding Component containing children.
         * taken from the parent's reference or from the current view mode of the document.
         * @param {boolean} [isRecursive] if true, will return all parentCompReference descendants (recursively)
         * @returns {jsonDataPointer[]} an array of the Component's Children (Component) References.
         * @throws an error in case the <i>parentCompReference</i> is invalid.
         *
         *      @example
         *      var mainPageChildren = documentServices.components.getChildren(mainPageRef);
         */
        getChildren: componentStructureInfo.getChildren,

        /**
         * returns the children components of a parent component.
         *
         * @param {jsonDataPointer} parentCompReference a ComponentReference of a corresponding Component containing children.
         * taken from the parent's reference or from the current view mode of the document.
         * @returns {jsonDataPointer[]} an array of the Component's Children (Component) References.
         * @throws an error in case the <i>parentCompReference</i> is invalid.
         *
         *      @example
         *      var mainPageChildren = documentServices.components.getAllJsonChildren(mainPageRef);
         */
        getAllJsonChildren: componentStructureInfo.getAllJsonChildren,

        /**
         * returns the children tpa components recurse of a parent component.
         *
         * @param {jsonDataPointer} parentCompReference a ComponentReference of a corresponding Component containing children.
         * @param {string} [viewMode] is the view mode of the document (DESKTOP|MOBILE), if not specified will be
         * taken from the parent's reference or from the current view mode of the document.
         * @returns {jsonDataPointer[]} an array of the Component's Children (Component) References.
         * @throws an error in case the <i>parentCompReference</i> is invalid.
         *
         *      @example
         *      var viewMode = 'DESKTOP'; // This is optional
         *      var mainPageChildren = documentServices.components.layout.getChildComponents(mainPageRef, viewMode);
         */
        getTpaChildren: componentStructureInfo.getTpaChildren,
        getBlogChildren: componentStructureInfo.getBlogChildren,
        /**
         * returns the type/"class" of a component.
         *
         * @function
         * @memberof documentServices.components.component
         *
         * @param {jsonDataPointer} componentReference the reference to the component to get its type.
         * @returns {string} the name of the component Type/"class". 'null' if no corresponding component was found.
         *
         *      @example
         *      var photoType = documentServices.components.getType(myPhotoReference);
         */
        getType: componentStructureInfo.getType,
        setComponent: setComponent,
        isComponentRemovable: isComponentRemovable,
        isComponentVisible: isComponentVisible,
        isComponentModal: isComponentModal,
        isComponentUsingLegacyAppPartSchema: isComponentUsingLegacyAppPartSchema,
        isComponentDuplicatable: isComponentDuplicatable,
        getChildrenArrayKey: componentStructureInfo.getChildrenArrayKey,
        isPageComponent: componentStructureInfo.isPageComponent,
        deleteComponent: deleteComponent,
        generateNewComponentId: generateNewComponentId,

        /** @class documentServices.components.properties*/
        properties: {
            /**
             * Updates component's Properties (Data)Item.
             * @param {jsonDataPointer} componentRef A ComponentReference to match a corresponding Component in the document.
             * @param {Object} propertiesItem A partial Properties (Data)Item corresponding the properties type of the
             * Component's Data to update.
             *
             *      @example
             *      var myPhotoRef = ...;
             *      documentServices.components.properties.update(myPhotoRef, {displayMode: "full"});
             */
            update: dataModel.updatePropertiesItem,
            /**
             * Gets a Properties(Data)Item instance corresponding a Component Reference from the document.
             *
             * @param {jsonDataPointer} componentReference a reference of a component in the document.
             * @returns {Object} a Properties (Data)Item corresponding the componentReference. 'null' if not found.
             */
            get: dataModel.getPropertiesItem,
            /** @class documentServices.components.properties.mobile*/
            mobile: {
                /**
                 * Creates a copy of the desktop component properties and set it to the mobile component
                 * @param {jsonDataPointer} mobileCompRef
                 */
                fork: componentData.splitMobileComponentProperties,
                /**
                 * Returns the mobile component properties to their default mode.<br>
                 * In most cases it means that the mobile and desktop component properties will point to the same object.
                 * @param {jsonDataPointer} mobileCompRef
                 */
                join: componentData.resetMobileComponentProperties,
                /**
                 * Checks if component has split properties - mobile and desktop.
                 * @param {jsonDataPointer} mobileCompRef
                 * @returns {boolean} true if component has split properties
                 */
                isForked: componentData.isMobileComponentPropertiesSplit
            }
        },
        /** @class documentServices.components.data*/
        data: {
            /**
             * Gets a DataItem instance corresponding a Component Reference from the document.
             *
             * @param {jsonDataPointer} componentReference a reference of a component in the document.
             * @returns {Object} a Data Item corresponding the componentReference. 'null' if not found.
             */
            get: dataModel.getDataItem,
            /**
             * Merges the given data item to the component data item
             *
             * @param {jsonDataPointer} componentRef A ComponentReference to match a corresponding Component.
             * @param {Object} dataItem A partial DataItem corresponding the type of the Component's Data to update.
             * @returns undefined
             *
             *      @example
             *      var myPhotoRef = ...;
             *      documentServices.components.data.update(myPhotoRef, {uri: "http://static.host.com/images/image-B.png"});
             */
            update: dataModel.updateDataItem
        },
        /** @class documentServices.components.layout*/
        layout: {
            /**
             * Returns the Layout Object of a Component.
             *
             * @param {jsonDataPointer} compReference a Component Reference matching a component in the document.
             * @returns {Object} a Layout object of the corresponding Component.
             * @throws an exception in case the compReference doesn't correspond any component in the document.
             *
             *      @example
             *      var myPhotoLayout = documentServices.components.layout.get(myPhotoRef);
             *      // perform some changes on the layout
             *      myPhotoLayout.x += 20;
             *      ...
             *      // update the document.
             *      documentServices.components.layout.update(myPhotoRef, myPhotoLayout);
             */
            get: getComponentLayout
        },

        isExist: componentStructureInfo.isExist,
        /**
         * this should be used in every method that adds a component to a container,
         * some containers have other containers in them that the component should be added to
         * @param {privateServices} privateServices
         * @param {jsonDataPointer} containerPointer the container that we want to add a component to
         * @returns {jsonDataPointer} a pointer to the container
         */
        getContainerToAddComponentTo: componentStructureInfo.getContainerToAddComponentTo
    }, {
        'modes': componentModes
    });
});
