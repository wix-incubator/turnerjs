define(['lodash'], function(_) {
    'use strict';

    function doModesExistOnAncestor(ps, modesToFind, componentPointer) {
        modesToFind = [].concat(modesToFind);
        var componentParent = getParent(ps, componentPointer);
        var areAllModesFound = _.isEmpty(modesToFind);
        while (componentParent !== null && !areAllModesFound) {
            modesToFind = removeComponentModesFromModesToFind(ps, modesToFind, componentParent);

            areAllModesFound = _.isEmpty(modesToFind);
            componentParent = getParent(ps, componentParent);
        }
        return areAllModesFound;
    }

    function removeComponentModesFromModesToFind(ps, modesToFind, component) {
        var compModeIds = _.pluck(getComponentModes(ps, component), 'modeId');
        return _.difference(modesToFind, compModeIds);
    }

    function getParent(ps, component) {
        return ps.pointers.components.getParent(component);
    }

    function getComponentModes(ps, componentPointer) {
        var componentModesPointer = ps.pointers.componentStructure.getModesDefinitions(componentPointer);
        return ps.dal.full.get(componentModesPointer);
    }

    return {
        doModesExistOnAncestor: doModesExistOnAncestor
    };
});
