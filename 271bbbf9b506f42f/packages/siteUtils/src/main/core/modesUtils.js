define(['lodash', 'coreUtils'], function(_, coreUtils){
    'use strict';


    function isAlwaysHiddenInModes(modeDefinitions, compModes){
        var hoverAndDefaultModes = [];
        var scrollModesIds = [];
        var widthModesIds = [];
        var otherModeIds = [];

        _.forEach(modeDefinitions, function (modeDef) {
            switch (modeDef.type) {
                case coreUtils.siteConstants.COMP_MODES_TYPES.DEFAULT:
                case coreUtils.siteConstants.COMP_MODES_TYPES.HOVER:
                    hoverAndDefaultModes.push(modeDef.modeId);
                    break;
                case coreUtils.siteConstants.COMP_MODES_TYPES.SCROLL:
                    scrollModesIds.push(modeDef.modeId);
                    break;
                case coreUtils.siteConstants.COMP_MODES_TYPES.WIDTH:
                    widthModesIds.push(modeDef.modeId);
                    break;
                default:
                    otherModeIds.push(modeDef.modeId);
            }
        });

        var isHiddenPredicate = _.partial(isHiddenInMode, compModes.overrides);
        var isExplicitlyDisplayedPredicate = _.partial(isExplicitlyDisplayedInMode, compModes.overrides);
        if (compModes.isHiddenByModes) {
            return (hoverAndDefaultModes.length && !_.some(hoverAndDefaultModes, isExplicitlyDisplayedPredicate)) ||
                (scrollModesIds.length && !_.some(scrollModesIds, isExplicitlyDisplayedPredicate)) ||
                (widthModesIds.length && !_.some(widthModesIds, isExplicitlyDisplayedPredicate)) ||
                (otherModeIds.length && !_.some(otherModeIds, isExplicitlyDisplayedPredicate));
        }

        return (hoverAndDefaultModes.length && _.every(hoverAndDefaultModes, isHiddenPredicate)) ||
            (scrollModesIds.length && _.every(scrollModesIds, isHiddenPredicate)) ||
            (widthModesIds.length && _.every(widthModesIds, isHiddenPredicate)) ||
            (otherModeIds.length && _.every(otherModeIds, isHiddenPredicate));
    }

    function isHiddenInMode(compOverrides, modeId) {
        var override = _.find(compOverrides, function (compOverride) {
            return _.isEqual([modeId], compOverride.modeIds);
        });
        return override && override.isHiddenByModes;
    }

    function isExplicitlyDisplayedInMode(compOverrides, modeId) {
        var override = _.find(compOverrides, function (compOverride) {
            return _.isEqual([modeId], compOverride.modeIds);
        });
        return override && override.isHiddenByModes === false;
    }

    function resolveCompActiveModes(comp, currentRootActiveModes) {
        var compModeDefinitions = _.get(comp, 'modes.definitions');
        if (_.isEmpty(compModeDefinitions)) {
            return {};
        }
        var componentModeDefinitionIds = _.pluck(compModeDefinitions, 'modeId');
        var currentCompActiveModes = _.pick(currentRootActiveModes, componentModeDefinitionIds);
        var res = currentCompActiveModes;
        var defaultModeDef = _.find(compModeDefinitions, {type: coreUtils.siteConstants.COMP_MODES_TYPES.DEFAULT});
        var hoverModeDef = _.find(compModeDefinitions, {type: coreUtils.siteConstants.COMP_MODES_TYPES.HOVER});
        var scrollModesDefs = _(compModeDefinitions)
            .filter({type: coreUtils.siteConstants.COMP_MODES_TYPES.SCROLL})
            .sortBy('params.scrollPos')
            .value();
        if (_.isEmpty(currentCompActiveModes) && defaultModeDef && hoverModeDef) {
            res[defaultModeDef.modeId] = true;
        }
        var anyScrollModeOn = _.some(scrollModesDefs, function(scrollMode) {
            return currentCompActiveModes[scrollMode.modeId];
        });
        if (scrollModesDefs.length && !anyScrollModeOn) {
            res[_.first(scrollModesDefs).modeId] = true;
        }

        return res;
    }

    function resolveCompActiveModesRecursive(fullCompStructure, currentRootActiveModes, isMobileView) {
        var activeModes = resolveCompActiveModes(fullCompStructure, currentRootActiveModes);
        var children = coreUtils.dataUtils.getChildrenData(fullCompStructure, isMobileView);
        _.reduce(children, function (result, child) {
            var childActiveModes = resolveCompActiveModesRecursive(child, currentRootActiveModes, isMobileView);
            return _.assign(result, childActiveModes);
        }, activeModes);
        return activeModes || {};
    }

    /**
     * @class modesUtils
     */
    return {
        getActiveComponentModeIds: function(activeModes, compModeDefinitions){
            var componentModeDefinitionIds = _.pluck(compModeDefinitions, 'modeId');
            return _.pick(activeModes, componentModeDefinitionIds);
        },

        getModeChanges: function(prevRootActiveModes, nextRootActiveModes){
            prevRootActiveModes = prevRootActiveModes || {};
            nextRootActiveModes = nextRootActiveModes || {};
            var allRootActiveModes = _({})
                .assign(prevRootActiveModes, nextRootActiveModes)
                .keys()
                .value();

            return _.transform(allRootActiveModes, function (accu, modeId) {
                var wasActive = prevRootActiveModes[modeId];
                var isActive = nextRootActiveModes[modeId];

                if (wasActive && !isActive) {
                    accu[modeId] = false;
                } else if (!wasActive && isActive) {
                    accu[modeId] = true;
                }
            }, {});
        },

        /**
         *
         * @param {ps.pointers} pointers
         * @param {ps.dal.full} fullJsonDal
         * @param {Pointer} compPointer
         * @param {Pointer} ancestorWithActiveMode
         * @param {string} modeIdToRemoveFrom
         * @returns {boolean}
         */
        isCompVisibleAfterRemovalFromMode: function (pointers, fullJsonDal, compPointer, ancestorWithActiveMode, modeIdToRemoveFrom) {
            var compModesPointer = pointers.componentStructure.getModes(compPointer);
            var compModes = fullJsonDal.isExist(compModesPointer) && fullJsonDal.get(compModesPointer);
            if (!compModes) {
                return true;
            }

            var ancestorModeDefinitionsPointer = pointers.componentStructure.getModesDefinitions(ancestorWithActiveMode);
            var ancestorModeDefinitions = fullJsonDal.get(ancestorModeDefinitionsPointer);

            var compModesAfterDeletion = coreUtils.objectUtils.cloneDeep(compModes);
            var relevantOverrideIndex = _.findIndex(compModes.overrides, function(override) {
                return _.isEqual(override.modeIds, [modeIdToRemoveFrom]);
            });
            compModesAfterDeletion.overrides = compModesAfterDeletion.overrides || [];
            if (relevantOverrideIndex >= 0) {
                compModesAfterDeletion.overrides[relevantOverrideIndex].isHiddenByModes = true;
            } else {
                compModesAfterDeletion.overrides.push({
                    modeIds: [modeIdToRemoveFrom],
                    isHiddenByModes: true
                });
            }

            return !isAlwaysHiddenInModes(ancestorModeDefinitions, compModesAfterDeletion);
        },

        resolveCompActiveModesRecursive: resolveCompActiveModesRecursive
    };
});
