define(['lodash', 'coreUtils', 'dataFixer/helpers/behaviorsMigrationHelper'], function (_, coreUtils, behaviorsMigrationHelper) {
    'use strict';

    function fetchDesktopComponentsWithBehaviors(structure) {
        var flattenComponents = coreUtils.dataUtils.getAllCompsInStructure(structure, false);
        return _.pick(flattenComponents, function(comp){
            return comp.behaviors;
        });
    }

    function fetchCorrespondingMobileComponents(structure, desktopComponents) {
        var flattenMobileComponents = coreUtils.dataUtils.getAllCompsInStructure(structure, true);
        return _.pick(flattenMobileComponents, function(mobileComp) {
            return desktopComponents[mobileComp.id];
        });
    }

    function setBehaviorsQuery(compStructure, dataItem, mobileCompStructure) {
        compStructure.behaviorQuery = dataItem.id;
        if (mobileCompStructure) {
            mobileCompStructure.behaviorQuery = compStructure.behaviorQuery;
        }
    }

    function moveBehaviorsFromStructureToData(pageJson) {
        var pageData = _.get(pageJson, 'data');
        var pageStructure = _.get(pageJson, 'structure');
        pageData.behaviors_data = pageData.behaviors_data || {};
        var desktopComponents = fetchDesktopComponentsWithBehaviors(pageStructure);
        var mobileComponents = fetchCorrespondingMobileComponents(pageStructure, desktopComponents);

        _.forEach(desktopComponents, function(compStructure) {
            var dataItem = behaviorsMigrationHelper.createBehaviorsDataItem(compStructure.behaviors);
            setBehaviorsQuery(compStructure, dataItem, mobileComponents[compStructure.id]);
            delete compStructure.behaviors;
            _.set(pageData, ['behaviors_data', dataItem.id], dataItem);
        });
    }

    return {
        exec: moveBehaviorsFromStructureToData
    };
});
