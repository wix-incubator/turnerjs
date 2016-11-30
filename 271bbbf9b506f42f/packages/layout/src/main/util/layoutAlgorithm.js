define([
    'lodash',
    'experiment',
    'utils',
    'layout/util/anchors',
    'layout/util/reduceDistancesAlgorithm/reduceDistancesAlgorithmDataUtils',
    'layout/util/reduceDistancesAlgorithm/reduceDistancesAlgorithm'],
    function (_, experiment, utils, anchors, reduceDistancesAlgorithmDataUtils, reduceDistancesAlgorithm) {
    'use strict';

    return {
        enforceStructure: function (structure, measureMap, anchorsMap, originalValuesMap, isMobileView, skipEnforceAnchors, lockedCompsMap, renderedCompsMap, ignoreBottomBottom){
            var viewMode = isMobileView ? utils.constants.VIEW_MODES.MOBILE : utils.constants.VIEW_MODES.DESKTOP;
            var rootAnchorsMap = _.get(anchorsMap, [structure.id, viewMode]);

            if (experiment.isOpen('layout_verbs_with_anchors')){
                var reduceDistancesAlgorithmData = reduceDistancesAlgorithmDataUtils.generateEnforceData(structure,
                    measureMap, anchorsMap, originalValuesMap, isMobileView, skipEnforceAnchors, lockedCompsMap);

                return reduceDistancesAlgorithm.enforce(reduceDistancesAlgorithmData);
            }

            return anchors.enforceAnchors(structure, measureMap, rootAnchorsMap, isMobileView, skipEnforceAnchors, lockedCompsMap, renderedCompsMap, ignoreBottomBottom);
        }
    };
});
