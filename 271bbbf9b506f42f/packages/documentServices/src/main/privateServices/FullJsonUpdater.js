define(['lodash',
    'utils',
    'documentServices/dataModel/dataIds',
    'documentServices/constants/constants',
    'documentServices/dataModel/DesignSchemas.json',
    'documentServices/dataModel/PropertiesSchemas.json'], function
    (_, utils, dataIds, constants, DesignSchemas, PropertiesSchemas) {
    'use strict';

    var OVERRIDING_TYPES = {
        PROPERTY: 'propertyQuery',
        DESIGN: 'designQuery'
    };

    var CHILDREN_PROPERTY_NAMES = ['mobileComponents', 'components', 'children'];
    var OVERRIDABLE_COMPONENT_FIELDS = ['layout', 'styleId', 'designQuery', 'propertyQuery'];
    var OWN_MODE_OVERRIDABLE_COMPONENT_FIELDS = ['styleId', 'designQuery', 'propertyQuery'];

    function createModesObjectForCompAddedInMode(activeModes, existingDefaultLayout) {
        var modes = createEmptyModesObject();
        modes.isHiddenByModes = true;
        modes.overrides.push({
            modeIds: activeModes,
            isHiddenByModes: false,
            layout: existingDefaultLayout
        });

        return modes;
    }


    function createEmptyModesObject() {
        return {
            isHiddenByModes: false,
            definitions: [],
            overrides: []
        };
    }

    function getCompDefinitions(compPointer) {
        var definitionsPointer = this.pointers.componentStructure.getModesDefinitions(compPointer);
        return this.fullJsonDal.get(definitionsPointer);
    }

    /**
     * FullJsonUpdater
     * @param fullJsonDal
     * @param pointers
     * @param displayedJsonDal
     * @constructor
     */
    var FullJsonUpdater = function (fullJsonDal, pointers, displayedJsonDal) {
        this.fullJsonDal = fullJsonDal;
        this.pointers = pointers;
        this.displayedJsonDal = displayedJsonDal;
    };

    function getActiveOverrideIndex(compOverrides, activeModeIds) {
        activeModeIds = [].concat(activeModeIds);
        return _.findIndex(compOverrides, function (override) { //eslint-disable-line lodash/matches-shorthand
            return override.modeIds.length >= 1 && _.isEqual(override.modeIds.sort(), activeModeIds.sort());
        });
    }

    function getComponentActiveModes(compPointer) {
        var containingRootPointer = this.pointers.components.getPageOfComponent(compPointer);
        if (containingRootPointer) {
            var rootActiveModes = getRootActiveModesSet.call(this, containingRootPointer.id);
            var compModesDefPointer = this.pointers.componentStructure.getModesDefinitions(compPointer);
            var compModeDefinitions = this.fullJsonDal.get(compModesDefPointer);

            return _.keys(utils.modes.getActiveComponentModeIds(rootActiveModes, compModeDefinitions));
        }

        return [];
    }

    function getFirstAncestorActiveMode(compPointer, isSelfIncluded) {
        var ancestorWithActiveModes = getFirstAncestorWithActiveModes.call(this, compPointer, isSelfIncluded);
        if (ancestorWithActiveModes) {
            var ancestorActiveModes = getComponentActiveModes.call(this, ancestorWithActiveModes);
            return _.first(ancestorActiveModes);
        }
        return null;
    }

    function getFirstAncestorWithActiveModes(compPointer, isSelfIncluded) {
        if (!compPointer) {
            return null;
        }
        var ancestorActiveModes = [];
        var ancestorPointer = isSelfIncluded ? compPointer : this.pointers.full.components.getParent(compPointer);
        while (ancestorPointer) {
            ancestorActiveModes = getComponentActiveModes.call(this, ancestorPointer);
            if (ancestorActiveModes.length) {
                return ancestorPointer;
            }
            ancestorPointer = this.pointers.components.getParent(ancestorPointer);
        }

        return null;
    }

    function getRootActiveModesSet(rootId) {
        var activeModesPointer = this.pointers.general.getActiveModes();
        var activeModes = this.displayedJsonDal.get(activeModesPointer);
        if (rootId && activeModes[rootId]) {
            return _.omit(activeModes[rootId], function (val) {
                return !val;
            });
        }
        return {};
    }

    function initializeCompModesIfNeeded(compPointer) {
        var modesPointer = this.pointers.componentStructure.getModes(compPointer);
        var compOverridesPointer = this.pointers.componentStructure.getModesOverrides(compPointer);
        if (!this.fullJsonDal.isExist(modesPointer)) {
            this.fullJsonDal.set(modesPointer, createEmptyModesObject());
        } else if (!this.fullJsonDal.isExist(compOverridesPointer)) {
            this.fullJsonDal.set(compOverridesPointer, []);
        }
    }

    function getOrCreateActiveOverride(compPointer, ancestorActiveModes) {
        ancestorActiveModes = [].concat(ancestorActiveModes);
        initializeCompModesIfNeeded.call(this, compPointer);
        var compOverridesPointer = this.pointers.componentStructure.getModesOverrides(compPointer);
        var compOverrides = this.fullJsonDal.get(compOverridesPointer);
        var compActiveOverrideIndex = getActiveOverrideIndex.call(this, compOverrides, ancestorActiveModes);
        if (compActiveOverrideIndex < 0) {
            this.fullJsonDal.push(compOverridesPointer, {
                modeIds: ancestorActiveModes
            });
            compActiveOverrideIndex = compOverrides.length;
        }
        return this.pointers.getInnerPointer(compOverridesPointer, compActiveOverrideIndex);
    }

    function getActiveOverridesPointer(compOverridesPointer, activeModeIds) {
        var compOverrides = this.fullJsonDal.get(compOverridesPointer);
        var compActiveOverrideIndex = getActiveOverrideIndex.call(this, compOverrides, activeModeIds);
        if (compActiveOverrideIndex < 0) {
            return null;
        }
        return this.pointers.getInnerPointer(compOverridesPointer, compActiveOverrideIndex);
    }

    function updateCompOverrideValue(compPointer, ancestorActiveMode, value, overrideProperty) {
        var compActiveOverridesPointer = getOrCreateActiveOverride.call(this, compPointer, ancestorActiveMode);
        var activeOverride = this.fullJsonDal.get(compActiveOverridesPointer);
        _.set(activeOverride, overrideProperty, value);

        this.fullJsonDal.set(compActiveOverridesPointer, activeOverride);
    }

    function mergeToCompOverrideValue(compPointer, ancestorActiveMode, value, overridePath) {
        var compActiveOverridesPointer = getOrCreateActiveOverride.call(this, compPointer, ancestorActiveMode);
        var activeOverride = this.fullJsonDal.get(compActiveOverridesPointer);

        if (_.includes(overridePath, 'layout')) {
            var fullLayoutToSet = getFullLayoutToMerge.call(this, compPointer, activeOverride, overridePath, value);
            _.set(activeOverride, overridePath, fullLayoutToSet);
        } else if (_.get(activeOverride, overridePath)) {
            _.assign(_.get(activeOverride, overridePath), value);
        } else {
            _.set(activeOverride, overridePath, value);
        }

        this.fullJsonDal.merge(compActiveOverridesPointer, activeOverride);
    }

    function getFullLayoutToMerge(compPointer, activeOverride, overridePath, value) {
        var fullLayoutWithMergedValue = getMergedStructureAndOverridesLayout.call(this, compPointer, activeOverride, overridePath);
        if (_.size(overridePath) > 1) {
            _.set(fullLayoutWithMergedValue, _.takeRight(overridePath, _.size(overridePath) - 1), value);
        } else {
            fullLayoutWithMergedValue = _.merge(fullLayoutWithMergedValue, value);
        }
        return fullLayoutWithMergedValue;
    }

    function getMergedStructureAndOverridesLayout(compPointer, activeOverride, overridePath) {
        var originalPointerFromInner = this.pointers.getOriginalPointerFromInner(compPointer);
        var structureLayout = this.fullJsonDal.get(this.pointers.getInnerPointer(originalPointerFromInner, 'layout'));
        var existingLayoutInOverridePath = _.get(activeOverride, overridePath);
        return _.merge({}, structureLayout, existingLayoutInOverridePath);
    }

    function hideCompInMode(childToHide, ancestorActiveMode) {
        childToHide.modes = childToHide.modes || createEmptyModesObject();
        childToHide.modes.overrides = childToHide.modes.overrides || [];
        var currentOverride = _.find(childToHide.modes.overrides, 'modeIds[0]', ancestorActiveMode);
        if (!currentOverride) {
            currentOverride = {modeIds: [ancestorActiveMode]};
            childToHide.modes.overrides.push(currentOverride);
        }
        currentOverride.isHiddenByModes = true;
        return childToHide;
    }

    function getUpdatedChildStructure(childStructure, parentPagePointer, parentPointer, ancestorActiveMode) {
        var childPointer = this.pointers.components.getComponent(childStructure.id, parentPagePointer);
        childPointer = childPointer || this.pointers.components.getUnattached(childStructure.id, parentPointer.type);
        return getUpdatedCompStructure.call(this, childPointer, parentPagePointer, childStructure, ancestorActiveMode);
    }

    function getOverriddenFieldsWithOriginalValues(overriddenFields, compPointer) {
        return _.mapValues(overriddenFields, function (value, key) {
            var fieldPointer = this.pointers.getInnerPointer(compPointer, key);
            return this.fullJsonDal.get(fieldPointer);
        }, this);
    }

    function updateChildrenStructure(updatedStructure, compPointer, compPagePointer, ancestorActiveMode) {
        var childrenKey;
        if (compPointer.type === 'MOBILE') {
            childrenKey = updatedStructure.mobileComponents ? 'mobileComponents' : 'components';
        } else {
            childrenKey = updatedStructure.children ? 'children' : 'components';
        }

        var displayedChildren = updatedStructure[childrenKey];
        if (displayedChildren && displayedChildren.length) {
            var fullJsonChildrenPointer = this.pointers.getInnerPointer(compPointer, childrenKey);
            var fullJsonChildren = this.fullJsonDal.get(fullJsonChildrenPointer);
            var hiddenChildrenIds = _(fullJsonChildren)
                .filter(function (child) {
                    return !_.find(updatedStructure[childrenKey], {id: child.id});
                })
                .map('id')
                .value();
            var allChildrenLength = hiddenChildrenIds.length + displayedChildren.length;
            var allChildren = [];

            for (var allChildrenIndex = 0, displayedChildrenIndex = 0; allChildrenIndex < allChildrenLength; allChildrenIndex++) {
                var fullJsonChild = fullJsonChildren[allChildrenIndex];
                if (fullJsonChild && _.includes(hiddenChildrenIds, fullJsonChild.id)) {
                    allChildren.push(fullJsonChild);
                } else {
                    allChildren.push(displayedChildren[displayedChildrenIndex]);
                    displayedChildrenIndex++;
                }
            }

            updatedStructure[childrenKey] = _.map(allChildren, function (child) {
                var isChildHidden = !_.find(updatedStructure[childrenKey], {id: child.id});
                if (isChildHidden) {
                    return hideCompInMode(child, ancestorActiveMode);
                }

                return getUpdatedChildStructure.call(this, child, compPagePointer, compPointer, ancestorActiveMode);
            }, this);
        }
    }

    function getUpdatedCompStructure(compPointer, compPagePointer, newStructure, ancestorActiveMode) {
        var ownActiveMode = _.first(getComponentActiveModes.call(this, compPointer));
        ancestorActiveMode = ancestorActiveMode || getFirstAncestorActiveMode.call(this, compPointer) || ownActiveMode;
        var fieldsToOverride = ownActiveMode === ancestorActiveMode ? OWN_MODE_OVERRIDABLE_COMPONENT_FIELDS : OVERRIDABLE_COMPONENT_FIELDS;
        var overriddenFields = _.pick(newStructure, fieldsToOverride);
        var updatedStructure = _.clone(newStructure);
        var compModesPointer = this.pointers.componentStructure.getModes(compPointer);
        var compModes = this.fullJsonDal.isExist(compModesPointer) ? this.fullJsonDal.get(compModesPointer) : null;
        var wasComponentAddedInMode = ancestorActiveMode && !this.fullJsonDal.isExist(compPointer);
        var wasComponentPotentiallyUpdatedInMode = ancestorActiveMode && this.fullJsonDal.isExist(compPointer);

        if (compModes) {
            updatedStructure.modes = compModes;
        }

        var existingDefaultLayout = null;
        if (wasComponentAddedInMode) {
            existingDefaultLayout = (newStructure && newStructure.layout) || existingDefaultLayout;
            return _.assign(updatedStructure, {
                modes: createModesObjectForCompAddedInMode([ancestorActiveMode], existingDefaultLayout)
            });
        }

        if (wasComponentPotentiallyUpdatedInMode) {
            var layoutPointer = this.pointers.getInnerPointer(compPointer, 'layout');
            existingDefaultLayout = this.fullJsonDal.get(layoutPointer) || existingDefaultLayout;
            if (overriddenFields.layout) {
                overriddenFields.layout = _.defaults(overriddenFields.layout, existingDefaultLayout);
            }
            var overriddenFieldsWithOriginalValues = getOverriddenFieldsWithOriginalValues.call(this, overriddenFields, compPointer);
            overriddenFields = _.omit(overriddenFields, function(val, key) {
                return _.isEqual(val, overriddenFieldsWithOriginalValues[key]);
            });
            var modesWithOverriddenFields = getModesWithOverrides(compModes, ancestorActiveMode, overriddenFields);
            if (modesWithOverriddenFields) {
                updatedStructure.modes = modesWithOverriddenFields;
            }
            _.assign(updatedStructure, overriddenFieldsWithOriginalValues);
        }

        updateChildrenStructure.call(this, updatedStructure, compPointer, compPagePointer, ancestorActiveMode);

        return updatedStructure;
    }

    function getModesWithOverrides(compModes, ancestorActiveMode, newStructureOverridableFields) {
        if (_.isEmpty(newStructureOverridableFields)) {
            return compModes;
        }
        compModes = (compModes && _.cloneDeep(compModes)) || createEmptyModesObject();
        var currentOverride = _.find(compModes.overrides, 'modeIds[0]', ancestorActiveMode);
        if (!currentOverride) {
            currentOverride = {
                modeIds: [ancestorActiveMode]
            };
            compModes.overrides.push(currentOverride);
        }
        _.merge(currentOverride, newStructureOverridableFields);
        return compModes;
    }

    function updateCompInnerField(compInnerPointer, value, overridePath) {
        var compPointer = this.pointers.getOriginalPointerFromInner(compInnerPointer);
        var ancestorActiveMode = getFirstAncestorActiveMode.call(this, compPointer);
        if (!ancestorActiveMode) {
            this.fullJsonDal.set(compInnerPointer, value);
            return;
        }
        if (_.first(overridePath) === 'layout' && _.size(overridePath) > 1) {
            var partialLayoutValue = _.set({}, _.takeRight(overridePath, overridePath.length - 1), value);
            overridePath = ['layout'];
            var compActiveOverridesPointer = getOrCreateActiveOverride.call(this, compPointer, ancestorActiveMode);
            var activeOverride = this.fullJsonDal.get(compActiveOverridesPointer);
            value = getFullLayoutToMerge.call(this, compPointer, activeOverride, overridePath, partialLayoutValue);
        }
        updateCompOverrideValue.call(this, compPointer, ancestorActiveMode, value, overridePath);
    }

    function mergeToCompInnerField(compInnerPointer, value, overridePath) {
        var compPointer = this.pointers.getOriginalPointerFromInner(compInnerPointer);
        var ancestorActiveMode = getFirstAncestorActiveMode.call(this, compPointer);
        if (!ancestorActiveMode) {
            this.fullJsonDal.merge(compInnerPointer, value);
            return;
        }
        mergeToCompOverrideValue.call(this, compPointer, ancestorActiveMode, value, overridePath);
    }

    function isPointerToPagesData(fullJsonDal, pointer) {
        var rootJson = fullJsonDal.getPointerJsonType(pointer);
        return rootJson === constants.JSON_TYPES.FULL;
    }

    function onRemoveComponent(compPointer) {
        var ancestorWithActiveMode = getFirstAncestorWithActiveModes.call(this, compPointer);
        var isVisibleAfterDeletion, modeIdToRemoveFrom;

        if (ancestorWithActiveMode) {
            modeIdToRemoveFrom = _.first(getComponentActiveModes.call(this, ancestorWithActiveMode));
            isVisibleAfterDeletion = utils.modes.isCompVisibleAfterRemovalFromMode(this.pointers, this.fullJsonDal, compPointer, ancestorWithActiveMode, modeIdToRemoveFrom);
        }

        if (!ancestorWithActiveMode || !isVisibleAfterDeletion) {
            this.fullJsonDal.remove(compPointer);
            return;
        }

        var activeAncestorMode = _.first(getComponentActiveModes.call(this, ancestorWithActiveMode));
        var overridePointer = getOrCreateActiveOverride.call(this, compPointer, activeAncestorMode);
        this.fullJsonDal.merge(overridePointer, {isHiddenByModes: true});
    }

    /**
     * @param dataPointer
     * @param value
     * @param overrideProperty
     * @param areComponentModesAffective Boolean flag - determines if the modes of the component, can cause creation of overrides.
     * i.e. - Can a HoverBox hover mode, create overrides, when changing background (which is a design item today 12.07.2016)?
     */
    function setCompOverridingItem(dataPointer, value, overrideProperty, areComponentModesAffective) {
        var pageId = this.pointers.data.getPageIdOfData(dataPointer);
        var compPointer = dataPointer.component;

        if (compPointer && _.includes(OVERRIDING_TYPES, overrideProperty)) {
            var activeModeIds = getFirstAncestorActiveMode.call(this, compPointer, areComponentModesAffective);
            if (activeModeIds) {
                var overridesPointer = getOrCreateActiveOverride.call(this, compPointer, activeModeIds);
                var overrides = this.fullJsonDal.get(overridesPointer);

                if (overrides[overrideProperty]) {
                    mergeOverridingToExistingItem.call(this, overrides, overrideProperty, pageId, value, dataPointer.refPath);
                } else {
                    createNewOverridingItem.call(this, compPointer, dataPointer, pageId, value, activeModeIds, overrideProperty);
                }
                return;
            }
        }
        this.fullJsonDal.set(dataPointer, value);
    }

    function mergeCompOverridingItem(dataPointer, overridingItem, propertyType, areComponentModesAffective) {
        var pageId = this.pointers.data.getPageIdOfData(dataPointer);
        var compPointer = dataPointer.component;

        if (compPointer) {
            var activeModeIds = getFirstAncestorActiveMode.call(this, compPointer, !!areComponentModesAffective);
            if (activeModeIds) {
                var compOverridesPointer = this.pointers.componentStructure.getModesOverrides(compPointer);
                var activeOverridesPointer = getActiveOverridesPointer.call(this, compOverridesPointer, activeModeIds);
                if (!activeOverridesPointer) {
                    stopWithNonExistingPartialsErrorForType(propertyType);
                }
                var overrides = this.fullJsonDal.get(activeOverridesPointer);
                if (overrides && overrides[propertyType]) {
                    mergeOverridingToExistingItem.call(this, overrides, propertyType, pageId, overridingItem, dataPointer.refPath);
                } else {
                    stopWithNonExistingPartialsErrorForType(propertyType);
                }
                return;
            }
        }
        this.fullJsonDal.merge(dataPointer, overridingItem);
    }

    function stopWithNonExistingPartialsErrorForType(type) {
        if (type === OVERRIDING_TYPES.PROPERTY) {
            throw new Error('Can\'t merge value to non-existent properties overrides.');
        } else if (type === OVERRIDING_TYPES.DESIGN) {
            throw new Error('Can\'t merge value to non-existent design overrides.');
        }
        throw new Error('Can\'t merge value to non-existent overrides.');
    }

    function createNewOverridingItem(compPointer, originalDataPointer, pageId, overridingItem, activeModes, overrideProperty) {
        updateItemQueryOnStructureWithNewReference.call(this, overrideProperty, pageId, originalDataPointer, compPointer);
        updateDalAndOverridesWithQuery.call(this, overridingItem, originalDataPointer, overrideProperty, compPointer, activeModes);
    }

    function updateItemQueryOnStructureWithNewReference(overrideProperty, pageId, originalDataPointer, compPointer) {
        // update item query on component structure with new id
        var structureQueryPointer = this.pointers.getInnerPointer(compPointer, overrideProperty);
        var uniqueItemId = generateUniqueOverridingItemQuery(overrideProperty);
        var uniqueItemQueryWithHash = (overrideProperty !== OVERRIDING_TYPES.PROPERTY ? '#' : '') + uniqueItemId;
        this.fullJsonDal.set(structureQueryPointer, uniqueItemQueryWithHash);

        cloneDataItemRecursivelyAndSetToDALWithId.call(this, originalDataPointer, uniqueItemId, pageId, overrideProperty);
    }

    function cloneDataItemRecursivelyAndSetToDALWithId(itemToClonePointer, idToSet, pageId, overridePropertyType) {
        if (!itemToClonePointer || !idToSet) {
            return;
        }
        var itemToClone = this.fullJsonDal.get(itemToClonePointer);
        if (itemToClone) {
            var schemaProperties = getItemSchemaProperties(itemToClone, overridePropertyType);
            cloneDataItemReferences.call(this, itemToClone, pageId, schemaProperties, overridePropertyType);
            itemToClone.id = idToSet;

            var newDataPointer = getDataPointerByType(this.pointers, overridePropertyType, idToSet, pageId);
            this.fullJsonDal.set(newDataPointer, itemToClone);
            this.displayedJsonDal.set(newDataPointer, itemToClone);
            return idToSet;
        }
        return null;
    }

    function cloneDataItemReferences(itemToClone, pageId, schemaProperties, overridePropertyType) {
        if (!schemaProperties) {
            return null;
        }
        _.forOwn(itemToClone, function (value, key) {
            if (isValueARef(key, value, schemaProperties)) {
                var newRefIdToSet = generateUniqueOverridingItemQuery(overridePropertyType);
                var refId = removeQueryHashIfExists(value);
                var refToClonePointer = getDataPointerByType(this.pointers, overridePropertyType, refId, pageId);
                var clonedRefNewId = cloneDataItemRecursivelyAndSetToDALWithId.call(this, refToClonePointer, newRefIdToSet, pageId, overridePropertyType);
                itemToClone[key] = clonedRefNewId ? '#' + clonedRefNewId : null;
            }
        }, this);
        return itemToClone;
    }

    function getItemSchemaProperties(dataItem, overridePropertyType) {
        var schema = null;
        switch (overridePropertyType) {
            case OVERRIDING_TYPES.PROPERTY: {
                schema = PropertiesSchemas[dataItem.type];
                break;
            }
            case OVERRIDING_TYPES.DESIGN: {
                schema = DesignSchemas[dataItem.type];
                break;
            }
        }
        return _.get(schema, 'properties') || _.get(schema, 'allOf.0.properties');
    }

    function getDataPointerByType(pointers, overrideProperty, id, pageId) {
        var newDataPointer;
        if (overrideProperty === OVERRIDING_TYPES.PROPERTY) {
            newDataPointer = pointers.data.getPropertyItem(id, pageId);
        } else if (overrideProperty === OVERRIDING_TYPES.DESIGN) {
            newDataPointer = pointers.data.getDesignItem(id, pageId);
        }
        return newDataPointer;
    }

    function updateDalAndOverridesWithQuery(overridingDataItem, dataPointer, overrideProperty, compPointer, activeModes) {
        overridingDataItem.id = dataPointer.id;
        this.fullJsonDal.set(dataPointer, overridingDataItem);
        var queryInOverrides = (overrideProperty !== OVERRIDING_TYPES.PROPERTY ? '#' : '') + dataPointer.id;
        updateCompOverrideValue.call(this, compPointer, activeModes, queryInOverrides, overrideProperty);
    }

    function isValueARef(key, value, schemaProperties) {
        if (value) {
            var keyPseudoTypes = _.get(schemaProperties[key], 'pseudoType') || [];
            var REF_TYPES = ['ref', 'refList'];
            return _.some(keyPseudoTypes, _.partial(_.includes, REF_TYPES));
        }
        return false;
    }

    function mergeOverridingToExistingItem(overrides, overrideProperty, pageId, itemToMerge, refPath) {
        var overridingItemQuery = overrides[overrideProperty];
        var overridingItemPointer = getNestedPointerByRefPath.call(this, overridingItemQuery, pageId, refPath, overrideProperty);
        if (overridingItemPointer) {
            var existingPartials = this.fullJsonDal.get(overridingItemPointer);
            var mergedItem = createMergedItem.call(this, existingPartials, itemToMerge, overrideProperty);
            this.fullJsonDal.set(overridingItemPointer, mergedItem);
        }
    }

    function getNestedPointerByRefPath(overridingItemQuery, pageId, refPath, overrideType) {
        var overridingItemPointer = getPointerToReferencedDataOnOverrides.call(this, overrideType, overridingItemQuery, pageId);
        var dataPointers = this.pointers.data;
        var dataPointerFunc = null;
        switch (overrideType) {
            case OVERRIDING_TYPES.DESIGN:
                dataPointerFunc = dataPointers.getDesignItem.bind(dataPointers);
                break;
            case OVERRIDING_TYPES.PROPERTY:
                dataPointerFunc = dataPointers.getPropertyItem.bind(dataPointers);
                break;
        }

        if (dataPointerFunc && refPath) {
            for (var i = 0; i < refPath.length; i++) {
                var item = this.fullJsonDal.get(overridingItemPointer);
                if (item) {
                    var sanitizedReference = removeQueryHashIfExists(item[refPath[i]]);
                    overridingItemPointer = dataPointerFunc(sanitizedReference, pageId);
                } else {
                    overridingItemPointer = null;
                    break;
                }
            }
        }
        return overridingItemPointer;
    }

    function getPointerToReferencedDataOnOverrides(overrideType, overridingItemQuery, pageId) {
        var sanitizedQuery = removeQueryHashIfExists(overridingItemQuery);
        var overridingItemPointer;
        if (overrideType === OVERRIDING_TYPES.PROPERTY) {
            overridingItemPointer = this.pointers.data.getPropertyItem(sanitizedQuery, pageId);
        } else if (overrideType === OVERRIDING_TYPES.DESIGN) {
            overridingItemPointer = this.pointers.data.getDesignItem(sanitizedQuery, pageId);
        }
        return overridingItemPointer;
    }

    function createMergedItem(oldItem, newItem, overridingType) {
        if (!oldItem) {
            return newItem;
        } else if (!newItem) {
            return oldItem;
        } else if (oldItem.type !== newItem.type) {
            return _.assign({}, newItem, {'id': oldItem.id});
        }
        var schemaProperties = getItemSchemaProperties(oldItem, overridingType);
        var overridingItem = _.omit(newItem, 'id');
        _.forOwn(newItem, function (value, key) {
            if (isValueARef(key, value, schemaProperties)) {
                if (oldItem[key] && newItem[key]) {
                    overridingItem = _.omit(overridingItem, key);
                }
            }
        });
        return _.assign({}, oldItem, overridingItem);
    }

    function removeQueryHashIfExists(query) {
        return _.isString(query) ? query.replace('#', '') : query;
    }

    function generateUniqueOverridingItemQuery(type) {
        var id;
        switch (type) {
            case OVERRIDING_TYPES.PROPERTY:
                id = dataIds.generateNewId('properties');
                break;
            case OVERRIDING_TYPES.DESIGN:
                id = dataIds.generateNewId('design');
                break;
            default:
                id = dataIds.generateNewId('');
                break;
        }
        return id;
    }

    function adjustModesToNewContainer(newContainerPointer, compStructure) {
        compStructure = removeUnusedOverridesInComponentTree.call(this, compStructure, newContainerPointer);
        var ancestorActiveMode = getFirstAncestorActiveMode.call(this, newContainerPointer) || _.first(getComponentActiveModes.call(this, newContainerPointer));
        if (ancestorActiveMode) {
            var initializedModes = createModesObjectForCompAddedInMode([ancestorActiveMode], compStructure.layout);
            if (compStructure.modes) {
                compStructure.modes.isHiddenByModes = true;
                compStructure.modes.overrides = compStructure.modes.overrides || [];
                var matchingOverride = _.find(compStructure.modes.overrides, function (override) {
                    return _.isEqual(override.modeIds, [ancestorActiveMode]);
                });
                if (matchingOverride) {
                    matchingOverride.isHiddenByModes = false;
                } else {
                    compStructure.modes.overrides.push(initializedModes.overrides[0]);
                }
            } else {
                compStructure.modes = initializedModes;
            }
        }
        return compStructure;
    }

    function removeUnusedOverridesInComponentTree(fullCompStructure, newParentPointer) {
        var res = utils.objectUtils.cloneDeep(fullCompStructure);
        var modeIds = getAllModeIdsOfAncestors.call(this, newParentPointer);

        var compsToScan = [res];
        while (!_.isEmpty(compsToScan)) {
            var comp = compsToScan.pop();
            var modes = _.get(comp, 'modes.definitions');
            var modeIdsInComp = _.map(modes, 'modeId');
            modeIds = _.merge(modeIds, _.zipObject(modeIdsInComp, modeIdsInComp));

            var overrides = _.get(comp, 'modes.overrides');
            if (overrides) {
                var affectiveOverrides = _.filter(overrides, _.partial(isModeOverrideAffective, modeIds));
                _.set(comp, 'modes.overrides', affectiveOverrides);
                if (_.isEmpty(affectiveOverrides)) {
                    delete comp.modes.isHiddenByModes;
                }
            }

            compsToScan = compsToScan.concat(comp.components || []);
        }

        return res;
    }

    function getAllModeIdsOfAncestors(currentAncestorPointer) {
        var modeIdsInAncestors = {};
        while (currentAncestorPointer !== null) {
            var modeDefinitions = getCompDefinitions.call(this, currentAncestorPointer);
            var modeIdsOfComp = _.map(modeDefinitions, 'modeId');
            modeIdsInAncestors = _.merge(modeIdsInAncestors, _.zipObject(modeIdsOfComp, modeIdsOfComp));
            currentAncestorPointer = this.pointers.components.getParent(currentAncestorPointer);
        }
        return modeIdsInAncestors;
    }

    function isModeOverrideAffective(supportedModeIds, override) {
        return _.every(override.modeIds, function (modeId) {
            return !!supportedModeIds[modeId];
        });
    }

    function onSet(pointer, value) {
        if (!isPointerToPagesData(this.fullJsonDal, pointer)) {
            throw 'updates outside of pagesData should be done only through full json DAL';
        }

        var pointerType = this.pointers.getPointerType(pointer);
        switch (pointerType) {
            case 'page':
                if (_.isEmpty(pointer.innerPath)) {
                    throw new Error('updating pages object should be done directly through full json DAL');
                }
                break;
            case 'component':
                var compPagePointer = this.pointers.components.getPageOfComponent(pointer);
                this.fullJsonDal.set(pointer, getUpdatedCompStructure.call(this, pointer, compPagePointer, value));
                return;
            case 'componentStructure':
                var innerPointerRootKey = this.pointers.getInnerPointerPathRoot(pointer);
                if (innerPointerRootKey && _.includes(OVERRIDABLE_COMPONENT_FIELDS, innerPointerRootKey)) {
                    updateCompInnerField.call(this, pointer, value, pointer.innerPath);
                    return;
                }
                break;
            case 'props':
                setCompOverridingItem.call(this, pointer, value, OVERRIDING_TYPES.PROPERTY);
                return;
            case 'design':
                setCompOverridingItem.call(this, pointer, value, OVERRIDING_TYPES.DESIGN, true);
                return;
        }

        this.fullJsonDal.set(pointer, value);
    }

    function onRemove(pointer) {
        if (!isPointerToPagesData(this.fullJsonDal, pointer)) {
            throw 'updates outside of pagesData should be done only through full json DAL';
        }

        var pointerType = this.pointers.getPointerType(pointer);
        switch (pointerType) {
            case 'page':
                if (_.isEmpty(pointer.innerPath)) {
                    throw new Error('updating pages object should be done directly through full json DAL');
                }
                break;
            case 'component':
                onRemoveComponent.call(this, pointer);
                return;
            case 'componentStructure':
                break;
        }
        this.fullJsonDal.remove(pointer);
    }

    function onPush(pointerToArray, value, pointerToPush, index) {
        if (!isPointerToPagesData(this.fullJsonDal, pointerToArray)) {
            throw 'updates outside of pagesData should be done only through full json DAL';
        }

        var structureToPush;
        var innerPointerRootKey = this.pointers.getInnerPointerPathRoot(pointerToArray);
        var isPushToChildrenArray = innerPointerRootKey && _.includes(CHILDREN_PROPERTY_NAMES, innerPointerRootKey);
        if (isPushToChildrenArray) {
            var containerPointer = this.pointers.getOriginalPointerFromInner(pointerToArray);
            structureToPush = adjustModesToNewContainer.call(this, containerPointer, value);
        }

        this.fullJsonDal.push(pointerToArray, structureToPush || value, pointerToPush, index);
    }

    function onMerge(pointer, value) {
        if (!isPointerToPagesData(this.fullJsonDal, pointer)) {
            throw 'updates outside of pagesData should be done only through full json DAL';
        }

        var pointerType = this.pointers.getPointerType(pointer);
        switch (pointerType) {
            case 'page':
                if (_.isEmpty(pointer.innerPath)) {
                    throw new Error('updating pages object should be done directly through full json DAL');
                }
                break;
            case 'component':
                var ancestorActiveMode = getFirstAncestorActiveMode.call(this, pointer) || _.first(getComponentActiveModes.call(this, pointer));
                if (!ancestorActiveMode) {
                    break;
                }
                var compPagePointer = this.pointers.components.getPageOfComponent(pointer);
                this.fullJsonDal.merge(pointer, getUpdatedCompStructure.call(this, pointer, compPagePointer, value, ancestorActiveMode));
                return;
            case 'componentStructure':
                var innerPointerRootKey = this.pointers.getInnerPointerPathRoot(pointer);
                if (innerPointerRootKey && _.includes(OVERRIDABLE_COMPONENT_FIELDS, innerPointerRootKey)) {
                    mergeToCompInnerField.call(this, pointer, value, pointer.innerPath);
                    return;
                }
                break;
            case 'props':
                mergeCompOverridingItem.call(this, pointer, value, OVERRIDING_TYPES.PROPERTY);
                return;
            case 'design':
                mergeCompOverridingItem.call(this, pointer, value, OVERRIDING_TYPES.DESIGN, true);
                return;
        }

        this.fullJsonDal.merge(pointer, value);
    }

    FullJsonUpdater.prototype = {
        'onSet': onSet,
        'onRemove': onRemove,
        'onPush': onPush,
        'onMerge': onMerge
    };

    return FullJsonUpdater;
});
