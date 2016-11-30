define(['lodash', 'utils',
        'documentServices/dataModel/dataModel',
        'documentServices/actionsAndBehaviors/actionsAndBehaviors',
        'documentServices/component/componentStylesAndSkinsAPI'],
    function (_, utils, dataModel, actionsAndBehaviors, componentStylesAndSkinsAPI) {

        'use strict';

        var NOT_DISPLAYED_PROPERTY = 'isHiddenByModes';

        function getModeTypes() {
            return _.cloneDeep(utils.siteConstants.COMP_MODES_TYPES);
        }

        function getComponentModesDefinitions(ps, compPointer) {
            if (_.isEmpty(compPointer)) {
                return null;
            }
            var modesDefinitionsPointer = ps.pointers.componentStructure.getModesDefinitions(compPointer);
            return ps.dal.full.get(modesDefinitionsPointer);
        }

        /**
         *
         * @param {ps} ps
         * @param {Pointer} compPointer
         * @returns {*}
         */
        function getComponentModesAvailableInView(ps, compPointer) {
            return ps.pointers.components.isMobile(compPointer) ?
                [getCompMobileMode(ps, compPointer)] :
                getComponentModesDefinitions(ps, compPointer);
        }

        function getCompMobileMode(ps, compPointer) {
            if (!ps.pointers.components.isMobile(compPointer)) {
                return null;
            }
            var modeDefinitions = getComponentModesDefinitions(ps, compPointer);
            var desktopCompPointer = ps.pointers.full.components.getDesktopPointer(compPointer);
            var propertyPointer = dataModel.getPropertyItemPointer(ps, desktopCompPointer);
            if (propertyPointer) {
                var compProp = ps.dal.get(propertyPointer);
                if (compProp.mobileDisplayedModeId) {
                    return _.find(modeDefinitions, 'modeId', compProp.mobileDisplayedModeId);
                }
            }
            return _.find(modeDefinitions, 'type', utils.siteConstants.COMP_MODES_TYPES.HOVER);
        }

        function getComponentModesByType(ps, compPointer, type) {
            if (!type) {
                return null;
            }
            var allModes = getComponentModesDefinitions(ps, compPointer);
            return _.filter(allModes, 'type', type);
        }

        function getComponentModeById(ps, compPointer, modeId) {
            var allModes = getComponentModesDefinitions(ps, compPointer);
            if (allModes && modeId) {
                return _.find(allModes, 'modeId', modeId);
            }
            return null;
        }

        function getModeToAddId(ps, compPointer) {
            return createUniqueModeId(compPointer.id);
        }

        function addComponentModeDefinition(ps, modeId, compPointer, type, params) {
            if (!isValidModeToAdd(type)) {
                throw new Error('added component mode is invalid');
            }

            initializeModesObjectForComponentIfMissing(ps, compPointer);
            var modeToAdd = createModeDefToAdd(compPointer, type, params, modeId);
            var modesDefinitionsPointer = ps.pointers.componentStructure.getModesDefinitions(compPointer);
            ps.dal.full.push(modesDefinitionsPointer, modeToAdd);

            addDefaultModeIfMissing(ps, compPointer);
        }

        function initializeModesObjectForComponentIfMissing(ps, compPointer) {
            var modesPointer = ps.pointers.componentStructure.getModes(compPointer);
            var definitionsPointer = ps.pointers.componentStructure.getModesDefinitions(compPointer);
            var overridesPointer = ps.pointers.componentStructure.getModesOverrides(compPointer);
            if (!ps.dal.full.isExist(modesPointer)) {
                ps.dal.full.set(modesPointer, {
                    definitions: [],
                    overrides: []
                });
            } else {
                if (!ps.dal.full.isExist(overridesPointer)) {
                    ps.dal.full.set(overridesPointer, []);
                }
                if (!ps.dal.full.isExist(definitionsPointer)) {
                    ps.dal.full.set(definitionsPointer, []);
                }
            }
        }

        function addDefaultModeIfMissing(ps, compPointer) {
            var modesDefinitionsPointer = ps.pointers.componentStructure.getModesDefinitions(compPointer);
            var existingModesDefinitions = ps.dal.get(modesDefinitionsPointer);
            var existingDefaultMode = !!_.find(existingModesDefinitions, {type: utils.siteConstants.COMP_MODES_TYPES.DEFAULT});
            if (existingDefaultMode) {
                return;
            }
            var modeToAdd = createModeDefToAdd(compPointer, utils.siteConstants.COMP_MODES_TYPES.DEFAULT);
            ps.dal.full.push(modesDefinitionsPointer, modeToAdd);
        }


        function createModeDefToAdd(compPointer, modeType, params, modeId) {
            return {
                modeId: modeId || createUniqueModeId(compPointer.id),
                type: modeType,
                label: null,
                params: params || null
            };
        }

        function isValidModeToAdd(modeType) {
            return _.includes(_.values(utils.siteConstants.COMP_MODES_TYPES), modeType);
        }

        function createUniqueModeId(compId) {
            var prefix = (compId ? compId + '-' : '') + 'mode';
            var delim = '-';
            return utils.guidUtils.getUniqueId(prefix, delim);
        }

        function removeComponentMode(ps, compPointer, modeId) {
            var componentActiveModes = getComponentActiveModeIds(ps, compPointer);
            if (componentActiveModes[modeId]) {
                deactivateCompMode(ps, compPointer, modeId);
            }

            var modesDefinitionsPointer = ps.pointers.componentStructure.getModesDefinitions(compPointer);
            var modesDefinitions = ps.dal.full.get(modesDefinitionsPointer);
            var updatedModesDefinitions = _.reject(modesDefinitions, {modeId: modeId});
            ps.dal.full.set(modesDefinitionsPointer, updatedModesDefinitions);
        }

        function getComponentActiveModeIds(ps, compPointer) {
            var activeModes = getAllActiveModes(ps);
            var compModeDefinitions = getComponentModesDefinitions(ps, compPointer);

            return utils.modes.getActiveComponentModeIds(activeModes, compModeDefinitions);
        }

        function resetAllActiveModes(ps) {
            if (!ps.siteAPI.isMobileView()) {
                ps.siteAPI.resetAllActiveModes();
            }
        }

        function activateCompMode(ps, compPointer, modeIdToActivate) {
            ps.siteAPI.activateMode(compPointer, modeIdToActivate);
        }

        function deactivateCompMode(ps, compPointer, modeIdToDeactivate) {
            ps.siteAPI.deactivateMode(compPointer, modeIdToDeactivate);
        }

        function getAllActiveModes(ps) {
            var activeModes = ps.siteAPI.getActiveModes();
            var allActiveModes = _(activeModes)
                .values()
                .reduce(_.assign, {});

            return _.pick(allActiveModes, function (isActive) {
                return isActive;
            });
        }

        function getComponentOverrides(ps, compPointer) {
            return ps.dal.full.get(ps.pointers.componentStructure.getModesOverrides(compPointer));
        }

        function removeComponentOverrides(ps, compPointer) {
            var overridesPointer = ps.pointers.componentStructure.getModesOverrides(compPointer);
            if (ps.dal.full.isExist(overridesPointer)) {
                ps.dal.full.set(overridesPointer, []);
            }
        }

        function applyCurrentToAllModes(ps, compPointer) {
            var modesPointer = ps.pointers.componentStructure.getModes(compPointer);
            var compModes = ps.dal.full.get(modesPointer);
            var activeOverridesPointer = getOverridePointerByActiveModes(ps, compPointer);
            if (activeOverridesPointer) {

                var activeOverride = _.omit(ps.dal.full.get(activeOverridesPointer), ['isHiddenByModes', 'modeIds']);
                ps.dal.full.merge(compPointer, activeOverride);
            }
            removeSingleModeBehaviors(ps, compPointer);
            if (compModes) {
                ps.dal.full.set(modesPointer, _.assign(compModes, {
                    isHiddenByModes: false,
                    overrides: []
                }));
            }
        }

        function applyComponentToMode(ps, components, activeModeId) {
            _.forEach(components, function (component) {
                var compRef = component.compRef;
                removeSingleModeBehaviors(ps, compRef);
                var modesPointer = ps.pointers.componentStructure.getModes(compRef);
                var compModes = ps.dal.full.get(modesPointer);

                var hasTargetMode = _.some(compModes.overrides, function (override) {
                    return _.includes(override.modeIds, activeModeId);
                });

                if (hasTargetMode) {
                    compModes.overrides = compModes.overrides.map(function (override) {
                        if (_.includes(override.modeIds, activeModeId)) {
                            override.isHiddenByModes = false;
                        }
                        return override;
                    });
                } else {
                    compModes.overrides.push({modeIds: [activeModeId], isHiddenByModes: false});
                }

                ps.dal.full.set(modesPointer, compModes);

                var sourceOverride = _.find(component.compDefinition.modes.overrides, function (override) {
                    var sourceActiveModeId = _(component.compDefinition.activeModes).keys().first();
                    return _.includes(override.modeIds, sourceActiveModeId);
                });

                var sourceLayout = sourceOverride && sourceOverride.layout ? sourceOverride.layout : component.compDefinition.layout;
                var layoutPointer = ps.pointers.getInnerPointer(compRef, 'layout');
                ps.dal.set(layoutPointer, sourceLayout);

                var sourceProps = sourceOverride && sourceOverride.props ? sourceOverride.props : component.compDefinition.props;
                if (sourceProps) {
                    dataModel.updatePropertiesItem(ps, compRef, sourceProps);
                }

                if (sourceOverride && sourceOverride.style) {
                    componentStylesAndSkinsAPI.style.setId(ps, compRef, sourceOverride.previousStyleId);
                }
            });
        }

        /**
         *
         * @param {ps} ps
         * @param {Pointer} compPointer
         */
        function removeSingleModeBehaviors(ps, compPointer) {
            actionsAndBehaviors.removeComponentsBehaviorsWithFilter(ps, compPointer, {action: 'modeOut'});
            actionsAndBehaviors.removeComponentsBehaviorsWithFilter(ps, compPointer, {action: 'modeIn'});
        }

        function getFirstAncestorWithActiveModes(ps, compPointer) {
            var ancestorPointer = ps.pointers.full.components.getParent(compPointer);
            var compActiveModes = getComponentActiveModeIds(ps, ancestorPointer);
            while (ancestorPointer && _.isEmpty(compActiveModes)) {
                ancestorPointer = ps.pointers.components.getParent(ancestorPointer);
                compActiveModes = ancestorPointer ? getComponentActiveModeIds(ps, ancestorPointer) : null;
            }

            return ancestorPointer;
        }

        function showComponentOnlyInModesCombination(ps, compPointer, modeIdsCombination) {
            if (_.isEmpty(modeIdsCombination) || !compPointer) {
                return;
            }
            var compModesPointer = ps.pointers.componentStructure.getModes(compPointer);
            var compModes = ps.dal.full.get(compModesPointer) || {};
            compModes.isHiddenByModes = true;
            compModes.overrides = createMatchingOverridesToShowComp(compModes.overrides, modeIdsCombination);
            compModes.overrides = filterNonMatchingOverrides(compModes.overrides, modeIdsCombination);

            ps.dal.full.set(compModesPointer, compModes);
        }

        function filterNonMatchingOverrides(compModesOverrides, modeIdsToKeep) {
            return _.filter(compModesOverrides, function (override) {
                return areSetsEqual(override.modeIds, modeIdsToKeep);
            });
        }

        function createMatchingOverridesToShowComp(compModesOverrides, visibleModeIds) {
            compModesOverrides = compModesOverrides || [];
            var matchingOverride = _.find(compModesOverrides, function (override) {
                return areSetsEqual(override.modeIds, visibleModeIds);
            });
            if (!matchingOverride) {
                matchingOverride = {
                    modeIds: visibleModeIds
                };
                compModesOverrides.push(matchingOverride);
            }
            matchingOverride.isHiddenByModes = false;
            return compModesOverrides;
        }

        function areSetsEqual(array1, array2) {
            return array1.length === array2.length &&
                _.intersection(array1, array2).length === array1.length;
        }

        function getFirstAncestorActiveModes(ps, compPointer) {
            var ancestorWithActiveModes = getFirstAncestorWithActiveModes(ps, compPointer);
            if (ancestorWithActiveModes) {
                return getComponentActiveModeIds(ps, ancestorWithActiveModes);
            }

            return {};
        }

        function getOwnOrFirstAncestorActiveModes(ps, compPointer) {
            var activeModesIds = getComponentActiveModeIds(ps, compPointer);
            return !_.isEmpty(activeModesIds) ? activeModesIds : getFirstAncestorActiveModes(ps, compPointer);
        }

        function getOverridePointerByActiveModes(ps, compPointer) {
            var activeModesIds = getOwnOrFirstAncestorActiveModes(ps, compPointer);
            var compOverrides = getComponentOverrides(ps, compPointer);
            var compOverrideIndex = _.findIndex(compOverrides, function (modeOverride) {
                return _.every(modeOverride.modeIds, function (modeId) {
                    return activeModesIds[modeId];
                });
            });

            if (compOverrideIndex >= 0) {
                var compOverridesPointer = ps.pointers.componentStructure.getModesOverrides(compPointer);
                return ps.pointers.getInnerPointer(compOverridesPointer, compOverrideIndex);
            }
            return null;
        }

        function isComponentDisplayedByDefault(ps, compPointer) {
            var firstAncestorWithMode = getFirstAncestorWithActiveModes(ps, compPointer);
            if (firstAncestorWithMode) {
                var defaultMode = _.first(getComponentModesByType(ps, firstAncestorWithMode, utils.siteConstants.COMP_MODES_TYPES.DEFAULT));

                return isComponentDisplayedInModes(ps, compPointer, [defaultMode.modeId]);
            }
            return true;
        }

        function isComponentDisplayedInModes(ps, compPointer, modeIds) {
            if (!compPointer) {
                throw new Error('missing component pointer');
            }
            if (modeIds && !_.isArray(modeIds)) {
                modeIds = [modeIds];
            }
            var compOverrides = getComponentOverrides(ps, compPointer);
            var overrideInMode = _.find(compOverrides, function (override) {
                return _.isEqual(_.sortBy(override.modeIds), _.sortBy(modeIds));
            });
            if (overrideInMode && !_.isUndefined(overrideInMode[NOT_DISPLAYED_PROPERTY])) {
                return !overrideInMode[NOT_DISPLAYED_PROPERTY];
            }

            var compModes = ps.dal.full.get(ps.pointers.componentStructure.getModes(compPointer));
            if (compModes && !_.isUndefined(compModes[NOT_DISPLAYED_PROPERTY])) {
                return !compModes[NOT_DISPLAYED_PROPERTY];
            }

            return true;
        }

        function isComponentCurrentlyDisplayed(ps, compPointer) {
            return ps.dal.isExist(compPointer);
        }

        function shouldDeleteComponentFromFullJson(ps, compPointer) {
            var ancestorWithActiveModes = getFirstAncestorWithActiveModes(ps, compPointer);
            if (!ancestorWithActiveModes) {
                return true;
            }
            var activeModeId = _(getComponentActiveModeIds(ps, ancestorWithActiveModes)).keys().first();
            return !utils.modes.isCompVisibleAfterRemovalFromMode(ps.pointers, ps.dal.fullJsonDal, compPointer, ancestorWithActiveModes, activeModeId);
        }

        function removeDesignItemBehaviors(designItem, designParts) {
            if (_.get(designItem, 'background.mediaRef.type') === 'Image') {
                designItem.dataChangeBehaviors = _.reject(designItem.dataChangeBehaviors, function (designBehavior) {
                    return _.includes(designParts, designBehavior.part);
                });
                _.set(designItem, 'background.mediaTransforms', {scale: 1});
            } else if (_.get(designItem, 'background.mediaRef.type') === 'WixVideo') {
                _.set(designItem, 'background.mediaRef.autoplay', true);
            }
            return designItem;
        }

        function removeDesignBehaviorInModes(ps, componentPointer, modes, designParts) {
            var designItem = dataModel.getDesignItemByModes(ps, componentPointer, modes);
            var pageId = ps.pointers.components.getPageOfComponent(componentPointer).id;

            var updatedDesign = removeDesignItemBehaviors(designItem, designParts);

            dataModel.addSerializedDesignItemToPage(ps, pageId, updatedDesign, updatedDesign.id);
        }

        function removeDesignBehaviorsFromAllModes(ps, componentPointer, designParts) {
            var compModeDefinitions = getComponentModesDefinitions(ps, componentPointer);
            _.forEach(compModeDefinitions, function (modeDef) {
                removeDesignBehaviorInModes(ps, componentPointer, [modeDef.modeId], designParts);
            });
        }

        function getMobileActiveModesMap(/** ps*/ps, pageId) {
            var pagePointer = ps.pointers.components.getPage(pageId, utils.constants.VIEW_MODES.DESKTOP);
            var pageChildren = ps.pointers.components.getChildrenRecursively(pagePointer);
            return _.transform(pageChildren, function (res, compPointer) {
                var hoverMode = _.find(getComponentModesDefinitions(ps, compPointer), {type: utils.siteConstants.COMP_MODES_TYPES.HOVER});
                if (!_.has(hoverMode, 'modeId')) {
                    return;
                }
                var hoverModeId = hoverMode.modeId;
                var existsOnMobile = ps.dal.isExist(ps.pointers.components.getMobilePointer(compPointer));
                if (!existsOnMobile) {
                    res[hoverModeId] = true;
                    return;
                }
                var propertyPointer = dataModel.getPropertyItemPointer(ps, compPointer);
                var propItem = propertyPointer && ps.dal.get(propertyPointer);
                if (propItem && propItem.mobileDisplayedModeId) {
                    res[propItem.mobileDisplayedModeId] = true;
                    return;
                }
                res[hoverModeId] = true;
            }, {});
        }

        /**
         * @class componentModes
         */
        return {
            /**
             * Adds a new Mode to a component.
             *
             * @param {jsonDataPointer} compPointer A component pointer to match a corresponding Component.
             * @param {string} type A type of a certain mode.
             * @returns undefined
             *
             *      @exaample
             *      var myBoxRef = ...;
             *      documentServices.components.modes.add(myBoxRef, 'HOVER');
             */
            addComponentModeDefinition: addComponentModeDefinition,

            /**
             * @param {jsonDataPointer} compPointer A ComponentReference to match a corresponding Component.
             * @param {string} modeId an ID of a Mode defined on the Component.
             * @returns a mode object corresponding the component ref and mode id.
             */
            getComponentModeById: getComponentModeById,

            /**
             * @returns an array of all available modes to use on components.
             */
            getModeTypes: getModeTypes,

            /**
             * @param {jsonDataPointer} compPointer A component pointer to match a corresponding Component.
             * @returns an array of all possible modes on the matching component.
             */
            getComponentModes: getComponentModesDefinitions,

            /**
             * @param {jsonDataPointer} compPointer A ComponentReference to match a corresponding Component.
             * @param {jsonDataPointer} type the mode type to get.
             * @returns an array of all available modes to use on components of a certain type.
             */
            getComponentModesByType: getComponentModesByType,

            /**
             * Removes an existing mode of a component.
             *
             * @param {jsonDataPointer} compPointer A ComponentReference to match a corresponding Component.
             * @param {string} modeId a mode ID to remove.
             * @returns undefined
             *
             *      @example
             *      var myBoxRef = ...;
             *      documentServices.components.modes.remove(myBoxRef, 'compXYZ-hoverid-azxs14');
             */
            removeComponentMode: removeComponentMode,
            /**
             * @param {jsonDataPointer} compPointer A ComponentReference to match a corresponding Component.
             * @returns a map of all active modes IDs on the corresponding component (ref) keys are modeIds, values are booleans.
             */
            getComponentActiveModeIds: getComponentActiveModeIds,

            /**
             * Resets all active modes to non-active.
             */
            resetAllActiveModes: resetAllActiveModes,
            // TODO GuyR 24/04/2016 17:40 - rename to resetCompsToDefaultModes

            /**
             * @param {string} modeIdToActivate a mode ID to set as active.
             * @returns undefined
             */
            activateComponentMode: activateCompMode,

            /**
             * @param {jsonDataPointer} a compPointer to create a modeID for.
             * @returns a unique ID for a mode
             */
            createUniqueModeId: createUniqueModeId,

            overrides: {
                getAllOverrides: getComponentOverrides,
                removeAllOverrides: removeComponentOverrides,
                getOverridePointerByActiveModes: getOverridePointerByActiveModes,
                applyCurrentToAllModes: applyCurrentToAllModes,
                applyComponentToMode: applyComponentToMode,
                /**
                 * @param ps
                 * @param compPointer a component pointer corresponding a component to show only in a certain modes combination
                 * @param modeIdsCombination an array of mode Ids, whose combination (&&) determines when to show a component.
                 */
                showComponentOnlyInModesCombination: showComponentOnlyInModesCombination
            },

            /**
             * @param {jsonDataPointer} a compPointer
             * @returns the mode first parent pointer with active mode, or undefined if there isn't such parent.
             */
            getFirstAncestorActiveModes: getFirstAncestorActiveModes,

            getFirstAncestorWithActiveModes: getFirstAncestorWithActiveModes,

            isComponentDisplayedByDefault: isComponentDisplayedByDefault,

            isComponentDisplayedInModes: isComponentDisplayedInModes,

            isComponentCurrentlyDisplayed: isComponentCurrentlyDisplayed,

            shouldDeleteComponentFromFullJson: shouldDeleteComponentFromFullJson,

            getModeToAddId: getModeToAddId,

            getComponentModesAvailableInView: getComponentModesAvailableInView,

            getCompMobileMode: getCompMobileMode,

            removeDesignBehaviorsFromAllModes: removeDesignBehaviorsFromAllModes,

            getMobileActiveModesMap: getMobileActiveModesMap
        };
    });
