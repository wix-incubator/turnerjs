'use strict';

import * as _ from 'lodash';
import * as dataModel from 'documentServices/dataModel/dataModel';
import * as hooks from 'documentServices/hooks/hooks';
import * as conversionUtils from 'documentServices/mobileConversion/modules/conversionUtils';
import {runMobileMergeAlgorithm, applyConversion} from 'documentServices/mobileConversion/mobileConversionFacade';

const preprocessorSettings: StructurePreprocessorSettings = {
    keepOccludedAndEmptyBackgrounds: true,
    keepNotRecommendedMobileComponents: false,
    keepEmptyTextComponents: false,
    keepOutOfScreenComponents: true
};

function updateHiddenComponentsList(ps: ps, pageId: string, desktopCompPointer: Pointer): Map<string[]> {
    const childrenPointers = ps.pointers.components.getChildren(desktopCompPointer);

    const hiddenCompsPointer = ps.pointers.general.getDeletedMobileComps();
    const hiddenComps = ps.dal.get(hiddenCompsPointer) || {};

    hiddenComps[pageId] = _.reject(hiddenComps[pageId] || [], hiddenCompId => _.find(childrenPointers, 'id', hiddenCompId));
    ps.dal.set(hiddenCompsPointer, hiddenComps);
    return hiddenComps;
}

function canSwitchDisplayMode(ps: ps, desktopCompPointer: Pointer): boolean {
    const compModeDefinitions =  ps.dal.full.get(ps.pointers.componentStructure.getModesDefinitions(desktopCompPointer));
    return _.size(compModeDefinitions) > 1;
}

function removeComponent(components: Component[], predicate: Object): boolean {
    const removedChildren = _.remove(components, predicate);
    if (!_.isEmpty(removedChildren)) {
        return true;
    }
    return _.some(components, child => removeComponent(child.components, predicate));
}

function setComponentDisplayMode(ps: ps, compPointer: Pointer, mobileDisplayedModeId: string): Component[] | null {
    const desktopCompPointer = ps.pointers.components.getDesktopPointer(compPointer);
    if (!canSwitchDisplayMode(ps, desktopCompPointer)) {
        return null;
    }
    const pageId = ps.pointers.components.getPageOfComponent(compPointer).id;
    const hiddenComps = updateHiddenComponentsList(ps, pageId, desktopCompPointer);

    const pagePointer = ps.pointers.page.getPagePointer(pageId);
    dataModel.updatePropertiesItem(ps, desktopCompPointer, {mobileDisplayedModeId});
    const type = ps.dal.get(ps.pointers.getInnerPointer(pagePointer, 'componentType'));
    hooks.executeHook(hooks.HOOKS.MOBILE_CONVERSION.BEFORE, type, [ps, pagePointer]);

    const pagesInfo = {};
    pagesInfo[pageId] = ps.dal.get(pagePointer);
    const mobilePagesData = conversionUtils.extractMobileStructure(pagesInfo);
    const mobilePageComp = mobilePagesData[pageId].structure;
    removeComponent(conversionUtils.getChildren(mobilePageComp), {id: compPointer.id});

    return runMobileMergeAlgorithm(ps, pagesInfo, mobilePagesData, hiddenComps, preprocessorSettings)[pageId];
}

export {
    setComponentDisplayMode
};