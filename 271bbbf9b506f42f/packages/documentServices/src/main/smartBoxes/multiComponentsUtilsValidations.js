/**
 * Created by alexandreroitman on 24/01/2016.
 */
define(['lodash', 'documentServices/structure/structure', 'documentServices/componentsMetaData/componentsMetaData', 'documentServices/constants/constants'], function (_, structure, componentsMetaData, constants) {
    'use strict';

    var filterComponentsByAction = {};

    filterComponentsByAction[constants.COMP_MATCH_SIZE_OPTIONS.WIDTH] = filterStretchedComponents;
    filterComponentsByAction[constants.COMP_MATCH_SIZE_OPTIONS.BOTH] = filterStretchedComponents;

    filterComponentsByAction[constants.COMP_ALIGNMENT_OPTIONS.LEFT] = filterForAlignment;
    filterComponentsByAction[constants.COMP_ALIGNMENT_OPTIONS.RIGHT] = filterForAlignment;
    filterComponentsByAction[constants.COMP_ALIGNMENT_OPTIONS.CENTER] = filterForAlignment;
    filterComponentsByAction[constants.COMP_ALIGNMENT_OPTIONS.TOP] = filterForAlignment;
    filterComponentsByAction[constants.COMP_ALIGNMENT_OPTIONS.BOTTOM] = filterForAlignment;
    filterComponentsByAction[constants.COMP_ALIGNMENT_OPTIONS.MIDDLE] = filterForAlignment;

    filterComponentsByAction[constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL] = filterStretchedComponents;
    filterComponentsByAction[constants.COMP_DISTRIBUTION_OPTIONS.BOTH] = filterStretchedComponents;

    function filterStretchedComponents(ps, compPointerArray) {
        return _.filter(compPointerArray, function (compPointer) {
            return !structure.isHorizontallyStretchedToScreen(ps, compPointer);
        });
    }

    function filterComponentsForHorizontalAlignment(ps, compPointerArray) {
        if (_.size(compPointerArray) === 1) {
            return _.filter(compPointerArray, isAlignableToParent.bind(this, ps));
        }

        var compsToAlign = filterStretchedComponents(ps, compPointerArray);

        if (compsToAlign.length === 1) {
            compsToAlign = [];
        }

        return compsToAlign;
    }

    function filterForAlignment(ps, compPointerArray, direction) {
        if (isHorizontalAxis(direction)) {
            return filterComponentsForHorizontalAlignment(ps, compPointerArray);
        }
        return compPointerArray;
    }

    function getFilteredComponentsToApplyAction(ps, compPointerArray, action) {
        if (_.isFunction(filterComponentsByAction[action])) {
            return filterComponentsByAction[action](ps, compPointerArray, action);
        }
        return compPointerArray;
    }

    function isHorizontalAxis(direction) {
        return _.includes([
            constants.COMP_ALIGNMENT_OPTIONS.LEFT,
            constants.COMP_ALIGNMENT_OPTIONS.RIGHT,
            constants.COMP_ALIGNMENT_OPTIONS.CENTER,
            constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL,
            constants.COMP_DISTRIBUTION_OPTIONS.BOTH,
            constants.COMP_MATCH_SIZE_OPTIONS.WIDTH,
            constants.COMP_MATCH_SIZE_OPTIONS.BOTH
        ], direction);
    }

    function isAlignableToParent(ps, compPointer) {
        return componentsMetaData.public.isAlignable(ps, compPointer);
    }

    return {
        canAlign: function (ps, compPointers, direction) {
            if (!direction || !_.size(compPointers)) {
                return false;
            }

            var compsToBeAligned = getFilteredComponentsToApplyAction(ps, compPointers, direction);

            return _.size(compsToBeAligned) > 0;
        },
        canDistribute: function (ps, compPointers, distribution) {
            return distribution && _.size(getFilteredComponentsToApplyAction(ps, compPointers, distribution)) > 1;
        },
        canMatchSize: function (ps, compPointers, dimension) {
            return dimension && _.size(getFilteredComponentsToApplyAction(ps, compPointers, dimension)) > 1;
        },

        isHorizontalAxis: isHorizontalAxis,
        getFilteredComponentsToApplyAction: getFilteredComponentsToApplyAction
    };
});
