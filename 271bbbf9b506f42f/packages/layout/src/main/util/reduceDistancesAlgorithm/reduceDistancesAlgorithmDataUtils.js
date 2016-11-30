define([
    'lodash',
    'coreUtils',
    'utils',
    'layout/util/reduceDistancesAlgorithm/createAnchorsDataManager',
    'layout/util/reduceDistancesAlgorithm/createMeasureMapManager',
    'layout/util/reduceDistancesAlgorithm/createOriginalValuesManager'
], function (_, coreUtils, utils, createAnchorsDataManager, createMeasureMapManager, createOriginalValuesManager) {
    'use strict';

    var HARD_WIRED_HIERARCHY = {
        'ROOT': ['masterPage', 'SITE_BACKGROUND'],
        'masterPage': ['SITE_HEADER', 'PAGES_CONTAINER', 'SITE_FOOTER'],
        'PAGES_CONTAINER': ['SITE_PAGES']
    };

    function getFlatDataMap(structure, isMobileView, measureMap){
        var flatDataMap = {};

        function addCompToFlatDataMap(component){
            flatDataMap[component.id] = component;

            var isCollapsed = Boolean(measureMap.collapsed[component.id]);
            if (!isCollapsed){
                var children = coreUtils.dataUtils.getChildrenData(component, isMobileView);

                _.forEach(children, addCompToFlatDataMap);
            }
        }

        addCompToFlatDataMap(structure);

        return flatDataMap;
    }

    function pickHardWiredComps(structure, isMobileView){
        var hardWiredRoot = _.find(HARD_WIRED_HIERARCHY.ROOT, function(value){
            return (value === structure.id);
        });

        if (!hardWiredRoot){
            return null;
        }

        function pickHardWiredCompsRecursively(currentStructure){
            var childrenToPick = HARD_WIRED_HIERARCHY[currentStructure.id];
            var childrenKey = coreUtils.dataUtils.getChildrenKey(currentStructure, isMobileView);

            var componentOverrides = {};
            if (!childrenToPick){
                componentOverrides[childrenKey] = [];
            } else {
                componentOverrides[childrenKey] = _.reduce(currentStructure[childrenKey], function(result, component){
                    if (_.includes(childrenToPick, component.id)){
                        result.push(pickHardWiredCompsRecursively(component));
                    }

                    return result;
                }, []);
            }

            return _.assign({}, currentStructure, componentOverrides);
        }

        return pickHardWiredCompsRecursively(structure);
    }

    function getStructureToEnforce(structure, skipEnforceAnchors, isMobileView){
        if (skipEnforceAnchors){
            return pickHardWiredComps(structure, isMobileView);
        }

        return structure;
    }

    function getAnchorsDataManager(structure, anchorsMap, viewMode, skipEnforceAnchors, measureMap){
        var pageAnchorsMap = _.get(anchorsMap, [structure.id, viewMode]);
        pageAnchorsMap = _.merge({}, pageAnchorsMap, measureMap.injectedAnchors);

        return createAnchorsDataManager(pageAnchorsMap, skipEnforceAnchors, measureMap.shrinkableContainer);
    }

    function getOriginalValuesManager(structure, originalValuesMap, viewMode, flatDataMap){
        var pageOriginalValuesMap = _.get(originalValuesMap, [structure.id, viewMode]);

        return createOriginalValuesManager(pageOriginalValuesMap, flatDataMap);
    }

    function createLayoutMap(flatMap, measureMap) {
        return _.mapValues(flatMap, function (structure) {
            if (!structure.layout){
                return undefined;
            }

            var layout = _.cloneDeep(structure.layout);
            _.assign(layout, coreUtils.boundingLayout.getBoundingLayout(structure.layout));

            if (utils.layout.isVerticallyStretchedToScreen(layout)) {
                layout.isVerticallyStretchedToScreen = true;
                var screenDimensions = {width: measureMap.clientWidth, height: measureMap.clientHeight};
                layout.minHeight = utils.positionAndSize.getHeightInPixelsRounded(structure.layout, null, screenDimensions);
                delete layout.docked.top;
                delete layout.docked.bottom;
            }

            return layout;
        });
    }

    return {
        generateEnforceData: function(structure, measureMap, anchorsMap, originalValuesMap, isMobileView, skipEnforceAnchors, lockedCompsMap){
            var viewMode = isMobileView ? utils.constants.VIEW_MODES.MOBILE : utils.constants.VIEW_MODES.DESKTOP;
            var flatDataMap = getFlatDataMap(structure, isMobileView, measureMap);
            var structureToEnforce = getStructureToEnforce(structure, skipEnforceAnchors, isMobileView);

            return {
                structure: structureToEnforce,
                skipEnforce: !structureToEnforce,
                flatDataMap: flatDataMap,
                layoutsMap: createLayoutMap(flatDataMap, measureMap),
                measureMapManager: createMeasureMapManager(measureMap, flatDataMap),
                anchorsDataManager: getAnchorsDataManager(structure, anchorsMap, viewMode, skipEnforceAnchors, measureMap),
                originalValuesManager: getOriginalValuesManager(structure, originalValuesMap, viewMode, flatDataMap),
                isMobileView: isMobileView,
                lockedCompsMap: lockedCompsMap || {}
            };
        }
    };
});
