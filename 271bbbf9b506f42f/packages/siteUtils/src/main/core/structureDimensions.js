define(['lodash', 'siteUtils/core/positionAndSizeUtils'], function(_, positionAndSizeUtils) {
    'use strict';

    function getInitialDimensionsMap(rootStructure) {
        var dimensionsMap = {};
        dimensionsMap[rootStructure.id] = _.pick(rootStructure.layout, ['x', 'y', 'width', 'height']); //TODO: what if root is docked? i.e page is docked
        return dimensionsMap;
    }

    function addDimensionsRecursively(structure, dimensionsMap, clientSize, parentId, siteWidth) {
        var parentDimensions = dimensionsMap[parentId];

        var children = structure.components || structure.children;
        _.forEach(children, function(comp) {
            dimensionsMap[comp.id] = positionAndSizeUtils.getPositionAndSize(comp.layout, parentDimensions, clientSize, siteWidth);
            addDimensionsRecursively(comp, dimensionsMap, clientSize, structure.id, siteWidth);
        });
    }

    function createDesktopDimensionsMap(structure, clientSize, siteWidth) {
        var dimensionsMap = getInitialDimensionsMap(structure);

        addDimensionsRecursively(structure, dimensionsMap, clientSize, structure.id, siteWidth);

        return dimensionsMap;
    }

    function createMobileDimensionsMap(structure, clientSize, siteWidth) {
        var dimensionsMap = getInitialDimensionsMap(structure);
        var parentDimensions = dimensionsMap[structure.id];

        _.forEach(structure.mobileComponents, function(mobileComp) {
            dimensionsMap[mobileComp.id] = positionAndSizeUtils.getPositionAndSize(mobileComp.layout, parentDimensions, clientSize, siteWidth);
            addDimensionsRecursively(mobileComp, dimensionsMap, clientSize, mobileComp.id, siteWidth);
        });

        return dimensionsMap;
    }

    function createDimensionsMap(structure, clientSize, siteWidth, isMobileView) {
        return isMobileView ? createMobileDimensionsMap(structure, clientSize, siteWidth) : createDesktopDimensionsMap(structure, clientSize, siteWidth);

    }

    return {
        createDimensionsMap: createDimensionsMap
    };
});
