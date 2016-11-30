'use strict';

import * as _ from 'lodash';
import * as hooks from 'documentServices/hooks/hooks';

const pointersWithMobilePresetStructure = {};

function afterAddHook(ps, compPointer, structure) {
    if (structure.mobileStructure) {
        pointersWithMobilePresetStructure[compPointer.id] = compPointer;
    }
}

function afterAddRootHook(ps: ps, compPointer) {
    var desktopStructure = ps.dal.get(compPointer);
    handleMobileStructure(ps, desktopStructure);
}

function handleMobileStructure(ps, desktopStructure) {
    if (!desktopStructure.mobileStructure) {
        _.forEach(desktopStructure.components, (comp) => handleMobileStructure(ps, comp));
        return;
    }

    var mobilePresetStructure = getMobilePresetStructure(desktopStructure);
    addMobilePresetStructureToMap(ps, mobilePresetStructure);
    deleteMobilePresetStructureFromActualComps(ps);
}

function addMobilePresetStructureToMap(ps, structure) {
    var mobilePresetStructuresPointer = ps.pointers.general.getMobileStructuresPointer();
    var mobilePresetStructures = ps.dal.get(mobilePresetStructuresPointer);
    if (!mobilePresetStructures) {
        ps.dal.set(mobilePresetStructuresPointer, {});
    }
    var compMobilePresetStructurePointer = ps.pointers.getInnerPointer(mobilePresetStructuresPointer, structure.id);
    ps.dal.set(compMobilePresetStructurePointer, structure);
}

function getMobilePresetStructure(desktopStructure) {
    var mobilePresetStructure;
    if (desktopStructure.mobileStructure) {
        mobilePresetStructure = _.merge({}, desktopStructure, _.pick(desktopStructure.mobileStructure, 'layout'));
        delete mobilePresetStructure.mobileStructure;
    }
    if (desktopStructure.components && mobilePresetStructure) {
        mobilePresetStructure.components = _(desktopStructure.components).map(getMobilePresetStructure).compact().value();
    }
    return mobilePresetStructure;
}

function deleteMobilePresetStructureFromActualComps(ps) {
    _.forOwn(pointersWithMobilePresetStructure, function (compPointer, compId) {
        var compMobilePresetStructurePointer = ps.pointers.getInnerPointer(compPointer, 'mobileStructure');
        ps.dal.remove(compMobilePresetStructurePointer);
        delete pointersWithMobilePresetStructure[compId];
    });
}

function registerHooks(): void {
    hooks.registerHook(hooks.HOOKS.ADD.AFTER, afterAddHook);
    hooks.registerHook(hooks.HOOKS.ADD_ROOT.AFTER, afterAddRootHook);
}

registerHooks();

export {registerHooks};