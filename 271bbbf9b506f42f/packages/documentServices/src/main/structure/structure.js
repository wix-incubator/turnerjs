/*eslint max-statements:0*/
define([
    'lodash',
    'utils',
    'documentServices/anchors/anchors',
    'documentServices/componentsMetaData/componentsMetaData',
    'documentServices/component/componentStructureInfo',
    'documentServices/component/componentModes',
    'documentServices/measure/fixedComponentMeasuring',
    'documentServices/structure/structureUtils',
    'documentServices/constants/constants',
    'documentServices/structure/relativeToScreenPlugins/relativeToScreenPlugins',
    'documentServices/dataModel/dataModel',
    'documentServices/dataModel/DataSchemas.json',
    'documentServices/dataModel/PropertiesSchemas.json',
    'documentServices/dataModel/DesignSchemas.json',
    'documentServices/dataModel/BehaviorsSchemas.json',
    'documentServices/measure/textMeasuring',
    'documentServices/dataModel/ConnectionSchemas.json',
    'documentServices/structure/utils/layoutConstraintsUtils',
    'documentServices/hooks/hooks',
    'documentServices/documentMode/documentModeInfo',
    'documentServices/smartBoxes/groupingUtils',
    'documentServices/structure/utils/windowScroll',
    'documentServices/structure/utils/componentLayout',
    'documentServices/structure/utils/layoutValidation',
    'documentServices/structure/siteGapMap',
    'documentServices/bi/events.json',
    'documentServices/page/popupUtils',
    'documentServices/actionsAndBehaviors/actionsAndBehaviors',
    'animations',
    'experiment'
], function (_,
             utils,
             anchors,
             componentsMetaData,
             componentStructureInfo,
             componentModes,
             fixedComponentMeasuring,
             structureUtils,
             constants,
             relativeToScreenPlugins,
             dataModel,
             dataSchemas,
             propertiesSchemas,
             designSchemas,
             behaviorsSchemas,
             textMeasuring,
             connectionSchemas,
             layoutConstraintsUtils,
             hooks,
             documentModeInfo,
             groupingUtils,
             windowScroll,
             componentLayout,
             layoutValidation,
             siteGapMap,
             biEvents,
             popupUtils,
             actionsAndBehaviors,
             animations,
             experiment) {
    'use strict';


    /**
     * @typedef {Object} layoutObject
     * @property {number} x
     * @property {number} y
     * @property {number} width
     * @property {number} height
     * @property {Object} [docked]
     * @property {number} rotationInDegrees
     * @property {boolean} fixedPosition
     * @property {number} scale
     */

    /**
     * @typedef {Object} proportionStructure
     * @property {Object} component
     * @property {layoutObject} proportions
     * @property {layoutObject} minLayout
     * @property {layoutObject} maxLayout
     * @property {Array<proportionStructure>} children
     */

    var VALID_PROPS_FOR_LAYOUT_UPDATE = ['x', 'y', 'width', 'height', 'rotationInDegrees', 'scale', 'fixedPosition', 'aspectRatio'];
    var LAYOUT_UPDATE_PROPS_TO_IGNORE = ['bounding', 'anchors'];
    var ANY = 'ANY';
    var simpleLayout = {
        x: ANY,
        y: ANY,
        width: ANY,
        height: ANY,
        anchors: ANY,
        bounding: ANY,
        rotationInDegrees: 0,
        scale: 1,
        fixedPosition: false
    };
    var LAYOUT_UPDATE_COMP_TYPES_TO_NOT_UPDATE_SINGLE_COMP = {
        'wysiwyg.viewer.components.StripColumnsContainer': true,
        'wysiwyg.viewer.components.Column': true
    };

    var DATA_TYPES_TO_SCHEMAS = {
        data: dataSchemas,
        prop: propertiesSchemas,
        design: designSchemas,
        behaviors: behaviorsSchemas,
        connections: connectionSchemas
    };

    function validateLayoutForLayoutUpdate(compLayout) {
        var unsupportedProperties = _.omit(compLayout, VALID_PROPS_FOR_LAYOUT_UPDATE);
        if (!_.isEmpty(unsupportedProperties)) {
            throw new Error('updateCompLayout: new layout properties are not supported');
        }
    }

    function getSanitizedLayoutForUpdate(compLayout) {
        return _.omit(compLayout, LAYOUT_UPDATE_PROPS_TO_IGNORE);
    }

    function isSimpleLayout(layout) {
        if (!layout) {
            return true;
        }
        var isSimple = true;
        _.forOwn(layout, function (value, key) {
            var valueInSimple = simpleLayout[key];
            /*eslint eqeqeq:0*/ //I don't know if fixedPosition can be null as well..
            if (_.isUndefined(valueInSimple) || (valueInSimple !== ANY && value != valueInSimple)) {
                isSimple = false;
                return false;
            }
        });
        return isSimple;
    }

    function getCoordinatesRelativeToContainer(ps, compPointer, containerPointer) {
        var compLayout = getCompLayoutRelativeToStructure(ps, compPointer);
        var pageLayout = getCompLayoutRelativeToStructure(ps, containerPointer);

        var relativeToContainerPosition = _.pick(compLayout, ['x', 'y']);
        relativeToContainerPosition.y -= pageLayout.y;

        return relativeToContainerPosition;
    }

    function reparentComponentToPage(ps, compPointer, keepPosition) {
        var currentContainer = ps.pointers.components.getParent(compPointer);
        if (!ps.pointers.components.isPage(currentContainer)) {
            var newContainerPointer = componentStructureInfo.getPage(ps, compPointer);
            newContainerPointer = componentStructureInfo.getContainerToAddComponentTo(ps, newContainerPointer);
            var relativeToPageCoordinates = keepPosition ? getCoordinatesRelativeToContainer(ps, compPointer, newContainerPointer) : null;

            addCompToContainer(ps, compPointer, newContainerPointer);

            if (keepPosition) {
                updateCompLayout(ps, compPointer, relativeToPageCoordinates);
            }
        }
    }

    function adjustLayoutForFixedPositionUpdate(ps, compPointer, isFixed, compLayout) {
        var adjustedLayout = {fixedPosition: isFixed};

        if (isFixed) {
            var compLayoutRelativeToScreen = getCompLayoutRelativeToScreen(ps, compPointer);

            _.assign(adjustedLayout, _.pick(compLayoutRelativeToScreen, ['x', 'y']));
            adjustedLayout.y -= windowScroll.getScroll(ps).y;
        } else {
            var parentPointer = ps.pointers.components.getParent(compPointer);
            var parentLayoutRelativeToScreen = getCompLayoutRelativeToScreen(ps, parentPointer, true);

            _.assign(adjustedLayout, {
                y: compLayout.y - parentLayoutRelativeToScreen.y + windowScroll.getScroll(ps).y,
                x: compLayout.x - parentLayoutRelativeToScreen.x
            });
        }

        updateCompLayout(ps, compPointer, adjustedLayout);
    }

    function updateAspectRatio(ps, compPointer, layout) {
        var layoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
        layout = layout || ps.dal.get(layoutPointer);

        var positionAndSize = structureUtils.getPositionAndSize(ps, compPointer, _.omit(layout, 'aspectRatio'));
        var newAspectRatio = utils.layout.calcAspectRatio(positionAndSize.width, positionAndSize.height);
        var aspectRatioPointer = ps.pointers.getInnerPointer(layoutPointer, 'aspectRatio');
        ps.dal.set(aspectRatioPointer, newAspectRatio);
    }

    function removeAspectRatio(ps, compPointer) {
        var layoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
        var layout = ps.dal.get(layoutPointer);

        if (!_.isUndefined(layout.aspectRatio)) {
            delete layout.aspectRatio;
            ps.dal.set(layoutPointer, layout);
        }
    }

    function isAspectRatioOn(ps, compPointer) {
        var layoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
        var layout = ps.dal.get(layoutPointer);

        return utils.layout.isAspectRatioOn(layout);
    }

    function updateFixedPosition(ps, compPointer, isFixed) {
        var layoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
        var layout = ps.dal.get(layoutPointer);

        if (isFixed === layout.fixedPosition) {
            return;
        }

        adjustLayoutForFixedPositionUpdate(ps, compPointer, isFixed, layout);

        if (isFixed) {
            reparentComponentToPage(ps, compPointer);
        }
    }

    function didCompResizeFromLeft(oldPositionAndSize, newPositionAndSize) {
        return newPositionAndSize.width !== oldPositionAndSize.width && newPositionAndSize.x !== oldPositionAndSize.x;
    }

    function didCompResizeFromTop(oldPositionAndSize, newPositionAndSize) {
        return newPositionAndSize.height !== oldPositionAndSize.height && newPositionAndSize.y !== oldPositionAndSize.y;
    }

    function keepChildrenInPlace(ps, compPointer, oldCompLayout, newCompLayout) {
        var childrenPointers = ps.pointers.components.getChildren(compPointer);

        var diffX = (newCompLayout.x || 0) - (oldCompLayout.x || 0);
        var diffY = (newCompLayout.y || 0) - (oldCompLayout.y || 0);
        _.forEach(childrenPointers, function (childPointer) {
            var childLayoutPointer = ps.pointers.getInnerPointer(childPointer, 'layout');
            var childLayout = ps.dal.get(childLayoutPointer);
            if (!structureUtils.isHorizontallyDocked(childLayout)) {
                childLayout.x -= diffX;
            }
            if (!structureUtils.isVerticallyDocked(childLayout)) {
                childLayout.y -= diffY;
            }
            ps.dal.merge(childLayoutPointer, childLayout);
        });
    }

    function getUpdateCompLayoutCallbackForHooks(isCallerFuncUpdateCompLayoutAndAdjustLayout) {
        var updateFunc = isCallerFuncUpdateCompLayoutAndAdjustLayout ? updateCompLayoutAndAdjustLayout : updateCompLayout;

        return function updateCompLayoutCallbackForHooks(ps, compPtr, newLayout) {
            updateFunc(ps, compPtr, newLayout, true);
        };
    }

    /**
     * updates the component layout and the anchors. The layout object can be a subset of {x, y, width, height, rotationInDegrees}
     * @param ps
     * @param compPointer
     * @param newLayout
     */
    function changeCompPositionAndSize(ps, compPointer, /** layoutObject */ newLayout, isCallerFuncUpdateCompLayoutAndAdjustLayout, isTriggeredByHook) {
        var compType = componentStructureInfo.getType(ps, compPointer);
        var updateCompLayoutCallbackForHooks = getUpdateCompLayoutCallbackForHooks(isCallerFuncUpdateCompLayoutAndAdjustLayout);

        hooks.executeHook(hooks.HOOKS.LAYOUT.UPDATE_BEFORE, compType, [ps, compPointer, newLayout, updateCompLayoutCallbackForHooks, isTriggeredByHook]);

        var updatedLayout = layoutValidation.getValidLayoutToUpdate(ps, compPointer, newLayout);

        layoutConstraintsUtils.constrainByDimensionsLimits(ps, compPointer, updatedLayout);
        layoutConstraintsUtils.constrainByDockingLimits(updatedLayout);

        if (componentsMetaData.public.isContainer(ps, compPointer) && componentsMetaData.public.isEnforcingContainerChildLimitations(ps, compPointer)) {
            var isEnforcingByWidth = componentsMetaData.public.isEnforcingContainerChildLimitationsByWidth(ps, compPointer);
            var isEnforcingByHeight = componentsMetaData.public.isEnforcingContainerChildLimitationsByHeight(ps, compPointer);

            layoutConstraintsUtils.constrainByChildrenLayout(ps, compPointer, updatedLayout, !isEnforcingByWidth, !isEnforcingByHeight);
        }
        layoutConstraintsUtils.constrainBySpecificType(ps, compPointer, updatedLayout);

        var layoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');

        var currentPositionAndSize = structureUtils.getPositionAndSize(ps, compPointer);

        ps.dal.set(layoutPointer, updatedLayout);

        if (_.has(updatedLayout, 'aspectRatio')) {
            updateAspectRatio(ps, compPointer, updatedLayout);
        }

        var newPositionAndSize = structureUtils.getPositionAndSize(ps, compPointer);

        if (didCompResizeFromLeft(currentPositionAndSize, newPositionAndSize) || didCompResizeFromTop(currentPositionAndSize, newPositionAndSize)) {
            keepChildrenInPlace(ps, compPointer, currentPositionAndSize, newPositionAndSize);
        }

        hooks.executeHook(hooks.HOOKS.LAYOUT.UPDATE_AFTER, compType, [ps, compPointer, updatedLayout, updateCompLayoutCallbackForHooks, isTriggeredByHook]);
    }

    function changeCompPositionAndSizeAndPreserveProportion(ps, compPointer, /**layoutObject*/newLayout) {
        newLayout = getLayoutForUpdateOnCurrentSchema(ps, compPointer, newLayout);
        var compType = componentStructureInfo.getType(ps, compPointer);
        hooks.executeHook(hooks.HOOKS.LAYOUT.UPDATE_BEFORE, compType, [ps, compPointer, newLayout]);

        var updatedLayout = layoutValidation.getValidLayoutToUpdate(ps, compPointer, newLayout);

        var layoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
        ps.dal.set(layoutPointer, updatedLayout);

        hooks.executeHook(hooks.HOOKS.LAYOUT.UPDATE_AFTER, compType, [ps, compPointer, updatedLayout]);
    }

    /**
     * Update component layout and preserve its aspect ratio and child parent proportions
     * @param ps
     * @param newLayout
     * @param proportionStructure
     * @param isRoot
     */
    function updateCompLayoutAndPreserveProportions(ps, newLayout, proportionStructure, isRoot) {
        layoutConstraintsUtils.constrainProportionalResize(ps, proportionStructure, newLayout, isRoot);

        _.forEach(proportionStructure.children, function updateChildLayoutAndPreserveProportions(childProportionStructure) {
            var newChildLayout = calcLayoutFromLayoutAndRatios(newLayout, childProportionStructure.proportions);
            updateCompLayoutAndPreserveProportions(ps, newChildLayout, childProportionStructure, false);

        });
        newLayout = _.pick(newLayout, ['x', 'y', 'width', 'height']);
        changeCompPositionAndSizeAndPreserveProportion(ps, proportionStructure.component, newLayout);
        updateAnchorsAfterOperation(ps, proportionStructure.component);
    }

    function getChildParentLayoutRatio(childLayout, parentLayout) {
        return {
            x: childLayout.x / parentLayout.width,
            y: childLayout.y / parentLayout.height,
            width: childLayout.width / parentLayout.width,
            height: childLayout.height / parentLayout.height
        };
    }

    function calcLayoutFromLayoutAndRatios(layout, layoutRatios) {
        var calculatedLayout = {
            x: layout.width * layoutRatios.x,
            y: layout.height * layoutRatios.y,
            width: layout.width * layoutRatios.width,
            height: layout.height * layoutRatios.height
        };

        calculatedLayout = _(calculatedLayout).pick(_.isFinite).mapValues(Math.round).value();
        return calculatedLayout;
    }

    function getLayoutForUpdateOnCurrentSchema(ps, compPointer, newLayout) {
        if (isDocked(ps, compPointer)) {
            var updatedLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, newLayout);
            return _.assign(updatedLayout, newLayout);
        }

        return newLayout;
    }

    function updateAnchorsAfterOperation(ps, compPointer) {
        if (groupingUtils.isGroupedComponent(ps, compPointer)) {
            var groupComp = componentStructureInfo.getContainer(ps, compPointer);
            anchors.updateAnchors(ps, compPointer, groupComp);
        } else {
            anchors.updateAnchors(ps, compPointer);
        }
    }

    function validateAndUpdateLayout(ps, compPointer, newLayout, isCallerFuncUpdateCompLayoutAndAdjustLayout, isTriggeredByHook) {
        var sanitizedLayout = getSanitizedLayoutForUpdate(newLayout);
        if (!_.isEmpty(sanitizedLayout)) {
            validateLayoutForLayoutUpdate(sanitizedLayout);
            changeCompPositionAndSize(ps, compPointer, getLayoutForUpdateOnCurrentSchema(ps, compPointer, sanitizedLayout), isCallerFuncUpdateCompLayoutAndAdjustLayout, isTriggeredByHook);
        }
    }

    function updateCompLayout(ps, compPointer, newLayout, isTriggeredByHook) {
        validateAndUpdateLayout(ps, compPointer, newLayout, false, isTriggeredByHook);
        updateAnchorsAfterOperation(ps, compPointer);
    }

    function updateCompLayoutAndAdjustLayout(ps, compPointer, newLayout, isTriggeredByHook) {
        validateAndUpdateLayout(ps, compPointer, newLayout, true, isTriggeredByHook);
        ps.setOperationsQueue.executeAfterCurrentOperationDone(anchors.updateAnchorsForCompChildren.bind(null, ps, compPointer));
    }

    function getNewComponentPointerAfterReparent(ps, compPointer) {
        return compPointer;
    }

    function isScopeChange(ps, componentPointer, newContainerPointer) {
        var oldContainerPointer = ps.pointers.components.getParent(componentPointer);

        return (ps.pointers.components.isPage(oldContainerPointer) && ps.pointers.components.isMasterPage(newContainerPointer)) ||
            (ps.pointers.components.isPage(newContainerPointer) && ps.pointers.components.isMasterPage(oldContainerPointer));
    }

    function updateFixedPositionForReparent(ps, componentPointer, newContainerPointer) {
        if (isFixedPosition(ps, componentPointer) && !isScopeChange(ps, componentPointer, newContainerPointer)) {
            var fixedPositionPointer = ps.pointers.getInnerPointer(componentPointer, 'layout.fixedPosition');
            ps.dal.set(fixedPositionPointer, false);
        }
    }

    function getBehaviorsToRemove(ps, componentPointer) {
        var compBehaviors = actionsAndBehaviors.getComponentBehaviors(ps, componentPointer);
        var actionsToRemove = ['modeChange', 'modeIn', 'modeOut'];
        return _.filter(compBehaviors, function (behavior) {
            return _.includes(actionsToRemove, behavior.action);
        });
    }

    function resetModes(ps, containerPointer, componentPointer) {
        var containerModes = componentModes.getComponentModes(ps, containerPointer);
        if (!containerModes || containerModes.length === 0) {
            var behaviorsToRemove = getBehaviorsToRemove(ps, componentPointer);
            _.forEach(behaviorsToRemove, function (behavior) {
                actionsAndBehaviors.removeComponentSingleBehavior(ps, componentPointer, behavior.name, behavior.action);
            });
        }

        var compPage = ps.pointers.full.components.getPageOfComponent(componentPointer);
        var containerPage = ps.pointers.full.components.getPageOfComponent(containerPointer);
        if (!_.isEqual(compPage, containerPage)) {
            deactivateAllComponentAndChildrenModes(ps, componentPointer);
        }
    }

    function deactivateAllComponentAndChildrenModes(ps, componentPointer) {
        var componentsToCheck = [componentPointer];
        while (!_.isEmpty(componentsToCheck)) {
            var compPointer = componentsToCheck.pop();
            deactivateAllCompModes(ps, compPointer);
            var compChildren = ps.pointers.full.components.getChildren(compPointer);
            componentsToCheck = componentsToCheck.concat(compChildren);
        }
    }

    function deactivateAllCompModes(ps, compPointer) {
        var compModes = componentModes.getComponentModes(ps, compPointer);
        _.forEach(compModes, function (mode) {
            ps.siteAPI.deactivateMode(compPointer, mode.modeId);
        });
    }

    function changeParent(ps, pointerToReturn, componentPointer, newContainerPointer) {
        validateSetContainer(ps, componentPointer, newContainerPointer);
        var actualNewContainerPointer = componentStructureInfo.getContainerToAddComponentTo(ps, newContainerPointer);
        adjustCompLayoutToNewContainer(ps, componentPointer, actualNewContainerPointer);
        updateFixedPositionForReparent(ps, componentPointer, actualNewContainerPointer);
        var oldParentPointer = ps.pointers.components.getParent(componentPointer);

        var compType = componentStructureInfo.getType(ps, componentPointer);
        hooks.executeHook(hooks.HOOKS.CHANGE_PARENT.BEFORE, compType, [ps, componentPointer, newContainerPointer]);

        resetModes(ps, newContainerPointer, componentPointer);

        addCompToContainer(ps, componentPointer, actualNewContainerPointer);
        hooks.executeHook(hooks.HOOKS.CHANGE_PARENT.AFTER, compType, [ps, componentPointer, newContainerPointer]);
        anchors.updateAnchors(ps, componentPointer, oldParentPointer);

        return pointerToReturn;
    }

    /**
     * Checks if component is set to show on all pages (=in master page)
     * @member documentServices.components
     * @param {ps} ps
     * @param {Pointer} compPointer
     * @returns {boolean} true iff component is shown on all pages
     */
    function isShowOnAllPages(ps, compPointer) {
        return ps.pointers.components.isInMasterPage(compPointer);
    }

    function validateSetContainer(ps, compPointer, newContainerPointer) {
        if (!ps.dal.isExist(compPointer) || !ps.dal.isExist(newContainerPointer)) {
            throw new Error("invalid component ref or new parent container ref");
        }

        if (!componentsMetaData.public.isContainable(ps, compPointer, newContainerPointer)) {
            throw new Error("component isn't containable in container: " + newContainerPointer.id);
        }

        return true;
    }

    function getSiteX(ps) {
        var siteWidth = ps.siteAPI.getSiteWidth();
        var measureMap = ps.siteAPI.getSiteMeasureMap();
        return measureMap.clientWidth > siteWidth ? 0.5 * (measureMap.clientWidth - siteWidth) : 0;
    }

    function adjustCompLayoutToNewContainer(ps, compPointer, newParentPointer) {
        if (isFixedPosition(ps, compPointer) && isScopeChange(ps, compPointer, newParentPointer)) {
            return;
        }

        var isHorizontallyStretched = isHorizontallyStretchedToScreen(ps, compPointer);
        if (!isHorizontallyStretched) {
            unDock(ps, compPointer);
        }

        var layoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
        var compRelativeToScreenLayout = getCompLayoutRelativeToScreenConsideringScroll(ps, compPointer, true);
        var parentRelativeToScreenLayout = getCompLayoutRelativeToScreenConsideringScroll(ps, newParentPointer, true);

        var adjustedCoords = {
            x: compRelativeToScreenLayout.x - parentRelativeToScreenLayout.x,
            y: compRelativeToScreenLayout.y - parentRelativeToScreenLayout.y
        };

        if (isHorizontallyStretched) {
            delete adjustedCoords.x;
        }

        ps.dal.merge(layoutPointer, adjustedCoords);
    }

    /**
     *
     * @param {ps} ps
     * @param {Pointer} compPointer
     * @param {Pointer} newParentPointer
     * @param {number} optionalIndex
     */
    function addCompToContainer(ps, compPointer, newParentPointer, optionalIndex) {
        var oldPagePointer = ps.pointers.components.getPageOfComponent(compPointer);
        var newPagePointer = ps.pointers.components.getPageOfComponent(newParentPointer);

        if (oldPagePointer.id !== newPagePointer.id) {
            moveDataAndPropertiesToNewPage(ps, compPointer, newPagePointer, oldPagePointer);
        }

        var displayedChildrenPointers = ps.pointers.components.getChildrenRecursively(compPointer);
        var fullComp = ps.dal.full.get(compPointer);

        var displayedStructures = _(displayedChildrenPointers)
            .concat([compPointer])
            .map(ps.dal.get)
            .map(_.partialRight(_.omit, ['components', 'modes']))
            .indexBy('id')
            .value();

        ps.dal.full.remove(compPointer);
        var childrenPointer = ps.pointers.components.getChildrenContainer(newParentPointer);
        ps.dal.push(childrenPointer, fullComp, compPointer, optionalIndex);
        displayedChildrenPointers = ps.pointers.components.getChildrenRecursively(compPointer);

        ps.dal.merge(compPointer, displayedStructures[compPointer.id]);
        _.forEach(displayedChildrenPointers, function (childPointer) {
            if (displayedStructures[childPointer.id]) {
                ps.dal.merge(childPointer, displayedStructures[childPointer.id]);
            }
        });

        ps.siteAPI.createDisplayedNode(newParentPointer);
    }

    function moveDataAndPropertiesToNewPage(/**ps */ ps, /** Pointer */compPointer, newPagePointer, oldPagePointer) {
        var DATA_TYPES = utils.constants.DATA_TYPES;
        var DATA_QUERY_KEYS = utils.constants.COMP_DATA_QUERY_KEYS;

        function moveDataItemToNewPage(structurePointer, dataQueryKey, dataItemTypeName) {
            var dataItemType = DATA_TYPES[dataItemTypeName];
            if (!experiment.isOpen('connectionsData') && dataItemType === DATA_TYPES.connections) {
                return;
            }
            var queryPointer = ps.pointers.getInnerPointer(structurePointer, dataQueryKey);
            if (ps.dal.full.isExist(queryPointer)) {
                var query = ps.dal.full.get(queryPointer);
                var itemId = query.replace('#', '');
                var itemPointer = ps.pointers.data.getItem(dataItemType, itemId, oldPagePointer.id);
                var schemas = DATA_TYPES_TO_SCHEMAS[dataItemTypeName];
                moveDataItemToAnotherPage(ps, schemas, itemPointer, newPagePointer.id, dataItemType);
            }
        }

        _.forEach(DATA_QUERY_KEYS, function (dataQueryKey, dataItemType) {
            moveDataItemToNewPage(compPointer, dataQueryKey, dataItemType);
        });

        function moveOverridesDataItemsToNewPage() {
            var componentOverridesPointer = ps.pointers.componentStructure.getModesOverrides(compPointer);
            if (componentOverridesPointer && ps.dal.full.isExist(componentOverridesPointer)) {
                var componentOverrides = ps.dal.full.get(componentOverridesPointer);
                _.forEach(componentOverrides, function (override, index) {
                    var overridePointer = ps.pointers.getInnerPointer(componentOverridesPointer, index);
                    moveDataItemToNewPage(overridePointer, DATA_QUERY_KEYS.design, DATA_TYPES.design);
                    moveDataItemToNewPage(overridePointer, DATA_QUERY_KEYS.prop, 'prop');
                });
            }
        }

        moveOverridesDataItemsToNewPage();

        var childrenPointers = ps.pointers.full.components.getChildren(compPointer);

        _.forEach(childrenPointers, function (containedCompPointer) {
            moveDataAndPropertiesToNewPage(ps, containedCompPointer, newPagePointer, oldPagePointer);
        });
    }

    function moveDataItemToAnotherPage(ps, schemas, dataPointer, newPageId, dataType) {
        var dataItem = dataPointer && ps.dal.full.get(dataPointer);
        //TODO: what will happen if cannot move data..?
        if (dataItem && structureUtils.canMoveDataItemToAnotherPage(dataItem.id)) {
            //removing the data item itself should be after traversing the children, otherwise we want find the children'
            var oldPageId = ps.pointers.data.getPageIdOfData(dataPointer);
            dataModel.executeForDataItemRefs(schemas, dataItem, function (dataId) {
                if (!_.isString(dataId)) {
                    return;
                }
                var childDataPointer = ps.pointers.data.getItem(dataType, dataId.replace('#', ''), oldPageId);
                moveDataItemToAnotherPage(ps, schemas, childDataPointer, newPageId, dataType);
            });

            ps.dal.full.remove(dataPointer);
            var newDataPointer = ps.pointers.data.getItem(dataType, dataPointer.id, newPageId);
            ps.dal.full.set(newDataPointer, dataItem);
        }
    }

    function getFixedCompXYCoordinates(compStyle, windowWidth, windowHeight, siteMarginBottom) {
        return {
            y: _.isNumber(compStyle.top) ? compStyle.top : windowHeight - compStyle.height - siteMarginBottom,
            x: _.isNumber(compStyle.left) ? compStyle.left : windowWidth - compStyle.width
        };
    }

    function buildComponentMeasuringInfo(ps, compPointer) {
        var compLayoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');

        return {
            data: dataModel.getDataItem(ps, compPointer),
            props: dataModel.getPropertiesItem(ps, compPointer),
            layout: ps.dal.get(compLayoutPointer)
        };
    }

    function isFixedPosition(ps, compPointer) {
        var compFixedPositionPointer = ps.pointers.getInnerPointer(compPointer, ['layout', 'fixedPosition']);
        return ps.dal.get(compFixedPositionPointer);
    }

    function isAncestorFixedPosition(ps, compPointer) {
        var parentCompPointer = compPointer;
        do {
            parentCompPointer = ps.pointers.components.getParent(parentCompPointer);
            if (!parentCompPointer) {
                return false;
            }
        } while (!isFixedPosition(ps, parentCompPointer));
        return true;
    }

    var FIXED_POSITION_COMPS_WHICH_HAVE_RENDER_PLUGIN = {
        'wysiwyg.viewer.components.HeaderContainer': true,
        'wysiwyg.viewer.components.FooterContainer': true,
        'wysiwyg.viewer.components.mobile.TinyMenu': true
    };

    function isRenderedInFixedPosition(ps, compPointer) {
        if (!isFixedPosition(ps, compPointer)) {
            return false;
        }

        var renderFlagPointer = ps.pointers.general.getRenderFlag('renderFixedPositionContainers');
        if (ps.dal.get(renderFlagPointer)) {
            return true;
        }

        var compType = componentStructureInfo.getType(ps, compPointer);
        return !FIXED_POSITION_COMPS_WHICH_HAVE_RENDER_PLUGIN[compType];
    }

    function isScrollingEnabled(ps) {
        var blocker = ps.siteAPI.getSiteAspect('siteScrollingBlocker');
        return !blocker || !blocker.isSiteScrollingBlocked();
    }

    function isAncestorRenderedInFixedPosition(ps, compPointer) {
        var parentCompPointer = compPointer;
        do {
            parentCompPointer = ps.pointers.components.getParent(parentCompPointer);
            if (!parentCompPointer) {
                return false;
            }
        } while (!isRenderedInFixedPosition(ps, parentCompPointer));
        return true;
    }

    function isShowOnFixedPosition(ps, compPointer) {
        return isRenderedInFixedPosition(ps, compPointer) || isAncestorRenderedInFixedPosition(ps, compPointer);
    }

    function isDocked(ps, compPointer) {
        var compDockedPointer = ps.pointers.getInnerPointer(compPointer, ['layout', 'docked']);
        return ps.dal.get(compDockedPointer);
    }

    function isRotated(ps, compPointer) {
        var compRotationPointer = ps.pointers.getInnerPointer(compPointer, ['layout', 'rotationInDegrees']);
        return ps.dal.get(compRotationPointer) !== 0;
    }

    function getFixedCompCoordinatesRelativeToStructure(ps, compPointer) {
        var relativeToStructureCoordinates = getXYInPixels(ps, compPointer);
        relativeToStructureCoordinates.x -= getSiteX(ps);

        return relativeToStructureCoordinates;
    }

    function sumCoordinates(coordinate1, coordinate2) {
        return {
            x: coordinate1.x + coordinate2.x,
            y: coordinate1.y + coordinate2.y
        };
    }

    /*
     Relative to structure
     */
    function getXYInPixels(ps, compPointer) {
        if (ps.pointers.components.isPage(compPointer)) {
            return {
                x: 0,
                y: 0
            };
        }

        return _.pick(structureUtils.getPositionAndSize(ps, compPointer), ['x', 'y']);
    }

    function isHorizontallyStretchedToScreen(ps, compPointer) {
        return utils.dockUtils.isHorizontalDockToScreen(ps.dal.get(ps.pointers.getInnerPointer(compPointer, ['layout'])));
    }

    function isHorizontallyStretchedToScreenByStructure(ps, compStructure) {
        return utils.dockUtils.isHorizontalDockToScreen(compStructure.layout);
    }

    function getCoordinatesRelativeToStructure(ps, compPointer) {
        if (isRenderedInFixedPosition(ps, compPointer)) {
            return getFixedCompCoordinatesRelativeToStructure(ps, compPointer);
        }

        var parentCompPointer = ps.pointers.components.getParent(compPointer);
        var coordinates = getXYInPixels(ps, compPointer);

        if (parentCompPointer) {
            var parentCoordinates = getCoordinatesRelativeToStructure(ps, parentCompPointer);
            return sumCoordinates(coordinates, parentCoordinates);
        }

        if (!ps.pointers.components.isInMasterPage(compPointer)) {
            var pageCoordinates = getPageCoordinates(ps, ps.pointers.components.getViewMode(compPointer), compPointer.id);
            return sumCoordinates(coordinates, pageCoordinates);
        }

        return coordinates;
    }

    function getCompLayoutRelativeToStructure(ps, compPointer) {
        var relativeToStructureCoordinates = getCoordinatesRelativeToStructure(ps, compPointer);
        var compLayout = ps.dal.get(ps.pointers.getInnerPointer(compPointer, 'layout'));
        var actualPositionAndSize = structureUtils.getPositionAndSize(ps, compPointer, compLayout);

        compLayout = _.defaults(compLayout, actualPositionAndSize);
        var relativeToStructureLayout = _.assign(compLayout, relativeToStructureCoordinates);
        relativeToStructureLayout.bounding = structureUtils.getBoundingLayout(ps, relativeToStructureLayout);
        return relativeToStructureLayout;
    }

    function getLayoutRelativeToScreenWithMeasurer(ps, compPointer, measurer) {
        var compLayoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
        var compLayout = ps.dal.get(compLayoutPointer);
        var screenSize = ps.siteAPI.getScreenSize();
        var measureMap = ps.siteAPI.getSiteMeasureMap();
        var compMeasuringInfo = buildComponentMeasuringInfo(ps, compPointer);
        var compMeasurements = fixedComponentMeasuring.getFixedComponentMeasurements(measurer, compMeasuringInfo, screenSize, measureMap.siteMarginBottom);
        compMeasurements = getFixedCompXYCoordinates(compMeasurements, screenSize.width, screenSize.height, measureMap.siteMarginBottom);

        return _.assign(compLayout, compMeasurements);
    }

    function getCompLayoutRelativeToScreen(ps, compPointer, ignorePlugins) {
        var compLayoutRelativeToScreen;
        var compType = componentStructureInfo.getType(ps, compPointer);

        var measurer = fixedComponentMeasuring.getMeasuringByType(compType);
        if (measurer) {
            compLayoutRelativeToScreen = getLayoutRelativeToScreenWithMeasurer(ps, compPointer, measurer);
        } else {
            compLayoutRelativeToScreen = getCompLayoutRelativeToStructure(ps, compPointer);

            compLayoutRelativeToScreen.x += getSiteX(ps);

            if (!ignorePlugins) {
                var relativeToScreenPlugin = relativeToScreenPlugins.getPlugin(ps, compPointer);
                if (relativeToScreenPlugin) {
                    var compProperties = dataModel.getPropertiesItem(ps, compPointer);
                    _.assign(compLayoutRelativeToScreen, relativeToScreenPlugin(ps.siteAPI, compLayoutRelativeToScreen, compProperties, compPointer));
                }
            }
        }

        compLayoutRelativeToScreen.bounding = structureUtils.getBoundingLayout(ps, compLayoutRelativeToScreen);
        return compLayoutRelativeToScreen;
    }

    function getCompLayoutRelativeToScreenConsideringScroll(ps, compPointer, ignorePlugins) {
        var compLayoutRelativeToScreen = getCompLayoutRelativeToScreen(ps, compPointer, ignorePlugins);

        if (!isShowOnFixedPosition(ps, compPointer)) {
            var scrollY = windowScroll.getScroll(ps).y;
            compLayoutRelativeToScreen.y -= scrollY;
            compLayoutRelativeToScreen.bounding.y -= scrollY;
        }

        return compLayoutRelativeToScreen;
    }

    function getEffectiveTextDimensions(ps, compPointer) {
        var textRuntimeOverallBorders = ps.pointers.general.getTextRuntimeOverallBorders();
        var textRuntimeOverallBordersPointer = ps.pointers.getInnerPointer(textRuntimeOverallBorders, compPointer.id);
        if (textRuntimeOverallBordersPointer) {
            return ps.dal.get(textRuntimeOverallBordersPointer);
        }
        return undefined;
    }


    /**
     *
     * @param ps
     * @returns {{x: number, y: number}} the coordinates of the pagesContainer relative to masterPage
     */
    function getPageCoordinates(ps, viewMode, pageId) {
        var pagesContainer = ps.pointers.components.getPagesContainer(viewMode);

        return {
            x: getComponentLayoutProp(ps, pagesContainer, 'x'),
            y: popupUtils.isPopup(ps, pageId) ? 0 : getComponentLayoutProp(ps, pagesContainer, 'y')
        };
    }

    function getComponentLayoutProp(ps, compPointer, propName) {
        var propPointer = ps.pointers.getInnerPointer(compPointer, ['layout', propName]);
        return ps.dal.get(propPointer) || 0;
    }

    function getMinDimensions(ps, compPointer) {
        var measureMap = ps.siteAPI.getSiteMeasureMap();

        return {
            width: measureMap.minWidth[compPointer.id] || 0,
            height: measureMap.minHeight[compPointer.id] || 0
        };
    }

    function getSiteHeight(ps) {
        var measureMap = ps.siteAPI.getSiteMeasureMap();

        if (measureMap) {
            var currentPopupId = ps.siteAPI.getCurrentPopupId();

            if (currentPopupId) {
                return measureMap.height[currentPopupId];
            }

            var renderFlagPointer = ps.pointers.general.getRenderFlag('extraSiteHeight');

            return measureMap.height[utils.siteConstants.MASTER_PAGE_ID] + (ps.dal.get(renderFlagPointer) || 0);
        }

        return 0;
    }

    function getDock(ps, compPointer) {
        var dockedLayoutPointer = ps.pointers.getInnerPointer(compPointer, ['layout', 'docked']);
        return ps.dal.get(dockedLayoutPointer);
    }

    function getDockedStylePublic(ps, dockedLayout) {
        return utils.dockUtils.applyDockedStyle(dockedLayout, {
            width: dockedLayout.width,
            height: dockedLayout.height
        }, ps.siteAPI.getPageBottomMargin(), ps.siteAPI.getScreenWidth(), ps.siteAPI.getSiteWidth(), ps.siteAPI.getSiteX());
    }

    function unDockAndUpdateAnchors(ps, compPointer) {
        unDock(ps, compPointer);
        updateAnchorsAfterOperation(ps, compPointer);
    }

    function unDock(ps, compPointer) {
        if (!isDocked(ps, compPointer)) {
            return;
        }

        var positionAndSize = componentLayout.getPositionAndSize(ps, compPointer);
        var layoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
        var layout = ps.dal.get(layoutPointer);

        _.assign(layout, positionAndSize);
        delete layout.docked;

        ps.dal.set(layoutPointer, layout);
    }

    function updateDock(ps, compPointer, dockData) {
        var layoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
        var layout = layoutValidation.getValidLayoutToUpdate(ps, compPointer, {docked: dockData});
        var compType = componentStructureInfo.getType(ps, compPointer);

        hooks.executeHook(hooks.HOOKS.LAYOUT.UPDATE_BEFORE, compType, [ps, compPointer, layout, updateCompLayout]);

        layoutConstraintsUtils.constrainByDockingLimits(layout);
        ps.dal.set(layoutPointer, layout);

        if (isAspectRatioOn(ps, compPointer)) {
            updateAspectRatio(ps, compPointer);
        }

        hooks.executeHook(hooks.HOOKS.LAYOUT.UPDATE_AFTER, compType, [ps, compPointer, layout, updateCompLayout]);
        updateAnchorsAfterOperation(ps, compPointer);
    }

    function setDock(ps, compPointer, dockData) {
        unDock(ps, compPointer);
        updateDock(ps, compPointer, dockData);
    }

    function getRatioStructure(ps, compPointer) {
        var compChildren = ps.pointers.components.getChildren(compPointer);
        var compContainer = ps.pointers.components.getParent(compPointer);
        var containerLayout = structureUtils.getComponentLayout(ps, compContainer);
        var compLayout = structureUtils.getComponentLayout(ps, compPointer);
        var layoutProportions = getChildParentLayoutRatio(compLayout, containerLayout);

        var proportionStructure = {
            component: compPointer,
            proportions: layoutProportions,
            children: _.map(compChildren, function getChildProportionStructure(childPointer) {
                return getRatioStructure(ps, childPointer, compLayout);
            }, this)
        };

        return proportionStructure;
    }

    /**
     * @param ps
     * @param compPointer
     * @param resizeDirection
     * @returns {proportionStructure}
     */
    function getProportionStructure(ps, compPointer, resizeDirection) {
        var proportionStructure = getRatioStructure(ps, compPointer);

        layoutConstraintsUtils.addCompMinLayout(ps, proportionStructure, resizeDirection);

        return proportionStructure;
    }

    function initialize(ps) {
        var gapMap = siteGapMap.createInitialGapMap(ps);
        var siteHasGaps = _.some(gapMap, function (gapVal) {
            return gapVal > 0;
        });

        if (siteHasGaps) {
            ps.siteAPI.reportBI(biEvents.SITE_GAPS_MAP, {
                above_header: gapMap.aboveHeader,
                above_page: gapMap.abovePagesContainer,
                above_footer: gapMap.aboveFooter
            });
        }

        textMeasuring.initialize(ps);
    }

    function shouldUpdateSingleComp(ps, compPointer) {
        var compType = componentsMetaData.getComponentType(ps, compPointer);
        return !LAYOUT_UPDATE_COMP_TYPES_TO_NOT_UPDATE_SINGLE_COMP[compType];
    }

    return {
        initialize: initialize,
        getDockedStyle: getDockedStylePublic,

        /**
         * Removes docked property from component layout
         *
         * @member documentServices.components.layout
         * @param {AbstractComponent} compPointer Pointer to the component.
         */
        unDock: unDockAndUpdateAnchors,

        /**
         * Updates docked value in layout
         *
         * @member documentServices.components.layout
         * @param {AbstractComponent} compPointer Pointer to the component.
         * @param {Object} a the docked data to be updated.
         */
        updateDock: updateDock,

        /**
         * Sets (overriding) docked value in layout
         *
         * @member documentServices.components.layout
         * @param {AbstractComponent} compPointer Pointer to the component.
         * @param {Object} a the docked data to be set.
         */
        setDock: setDock,

        /**
         * Gets docked value for component
         *
         * @member documentServices.components.layout
         * @param {AbstractComponent} compPointer Pointer to the component.
         * @returns {Object} the docked data.
         *      @example
         *      documentServices.components.getDock(componentPointer);
         */
        getDock: getDock,

        /**
         * Returns true if the component is docked left and right in unit vw
         *
         * @member documentServices.components.layout
         * @param {AbstractComponent} compPointer Pointer to the component.
         * @returns {Boolean} component is stretched to screen.
         *      @example
         *      documentServices.components.getDock(componentPointer);
         */
        isHorizontallyStretchedToScreen: isHorizontallyStretchedToScreen,

        /**
         * Returns true if the component is docked left and right in unit vw
         *
         * @member documentServices.components.layout
         * @param {Object} compStructure The component's structure.
         * @returns {Boolean} component is stretched to screen.
         *      @example
         *      documentServices.components.getDock(componentStructure);
         */
        isHorizontallyStretchedToScreenByStructure: isHorizontallyStretchedToScreenByStructure,

        updateCompLayout: updateCompLayout,

        getProportionStructure: getProportionStructure,

        updateCompLayoutAndAdjustLayout: updateCompLayoutAndAdjustLayout,

        updateAndPreserveProportions: updateCompLayoutAndPreserveProportions,

        /**
         * Set the component container to be the one referenced by newContainerRef
         * @member documentServices.components
         * @param {AbstractComponent} compPointer
         * @param {AbstractComponent} newContainerRef
         */
        setContainer: changeParent,
        /**
         * @ignore
         */
        getNewComponentPointerAfterReparent: getNewComponentPointerAfterReparent,

        /**
         * Check if a component is shown on all pages
         *
         * @function
         * @memberof documentServices.structure.structure
         * @param {AbstractComponent} compPointer pointer to the component to check.
         * @returns {boolean}
         *      @example
         *      documentServices.components.isShowOnAllPages(componentPointer);
         *
         */
        isShowOnAllPages: isShowOnAllPages,

        /**
         * Calculates the coordinates of a component in the viewer relative to the masterPage
         * This is the site, not the window.
         *
         * @member documentServices.components.layout
         * @param {AbstractComponent} compPointer Pointer to the component.
         * @returns {Object} a coordinates object of the corresponding Component, with x and y properties.
         *      @example
         *      var compAbsPosition = documentServices.components.layout.getCompLayoutRelativeToStructure(componentPointer);
         *
         */
        getCompLayoutRelativeToStructure: getCompLayoutRelativeToStructure,

        /**
         * Calculates the coordinates of a component in the viewer relative to the masterPage
         * This is the site, not the window.
         *
         * @member documentServices.components.layout
         * @param {AbstractComponent} compPointer Pointer to the component.
         * @returns {Object} a Layout object of the corresponding Component.
         *      @example
         *      var compLayoutRelativeToScreen = documentServices.components.layout.getCompLayoutRelativeToScreen(componentPointer);
         *
         */
        getCompLayoutRelativeToScreen: getCompLayoutRelativeToScreen,

        getCompLayoutRelativeToScreenConsideringScroll: getCompLayoutRelativeToScreenConsideringScroll,

        addCompToContainer: addCompToContainer,

        /**
         * Determines if a component has fixed position or not.
         *
         * @member documentServices.components.layout
         * @param {AbstractComponent} compPointer Pointer to the component.
         * @returns {boolean} true iff the component has fixed position
         *      @example
         *      var compAbsPosition = documentServices.components.layout.isFixedPosition(componentPointer);
         *
         */
        isFixedPosition: isFixedPosition,

        isAncestorFixedPosition: isAncestorFixedPosition,

        /**
         * Determines if a component is currently rendered in fix position
         *
         * @member documentServices.components.layout
         * @param {AbstractComponent} compLayout pointer to the component.
         * @returns {boolean} true iff the component is currently rendered in fix position
         *      @example
         *      var compAbsPosition = documentServices.components.layout.isRenderedInFixedPosition(componentPointer);
         *
         */
        isRenderedInFixedPosition: isRenderedInFixedPosition,

        isAncestorRenderedInFixedPosition: isAncestorRenderedInFixedPosition,

        isShowOnFixedPosition: isShowOnFixedPosition,

        isDocked: isDocked,

        isRotated: isRotated,

        /**
         * Returns the minimum width / height of a component
         *
         * @member documentServices.components.layout
         * @param {AbstractComponent} compPointer Pointer to the component.
         * @returns {{width: number, height: number}} an object that represents the minimum dimensions for the given component
         *      @example
         *      var minDimensions = documentServices.components.layout.getMinDimensions(componentPointer);
         */
        getMinDimensions: getMinDimensions,

        /**
         * @returns the height of the site
         */
        getSiteHeight: getSiteHeight,

        setScroll: windowScroll.setScroll,
        isScrollingEnabled: isScrollingEnabled,

        getScroll: windowScroll.getScroll,

        setScrollAndScale: function (ps, x, y, scale, duration, originLeft) {
            var renderFlagPointer = ps.pointers.general.getRenderFlag('siteScale');
            ps.dal.set(renderFlagPointer, scale);

            windowScroll.setScrollAndScale(x, y, scale, duration, originLeft);
        },

        updateFixedPosition: updateFixedPosition,

        reparentComponentToPage: reparentComponentToPage,

        getEffectiveTextDimensions: getEffectiveTextDimensions,

        updateAspectRatio: updateAspectRatio,

        removeAspectRatio: removeAspectRatio,

        getSiteX: getSiteX,

        isAspectRatioOn: isAspectRatioOn,

        shouldUpdateSingleComp: shouldUpdateSingleComp,

        adjustCompLayoutToNewContainer: adjustCompLayoutToNewContainer,

        isSimpleLayout: isSimpleLayout
    };
});
