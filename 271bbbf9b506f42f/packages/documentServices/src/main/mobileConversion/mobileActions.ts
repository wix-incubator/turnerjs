'use strict';

import * as _ from 'lodash';
import * as mobileConversion from 'documentServices/mobileConversion/mobileConversionFacade';
import * as conversionUtils from 'documentServices/mobileConversion/modules/conversionUtils';
import {getChangedPagesPointers} from 'documentServices/mobileConversion/modules/mergeAggregator';
import {setComponentDisplayMode} from 'documentServices/mobileConversion/displayModeUtils';
import * as structuresComparer from 'documentServices/mobileConversion/modules/structuresComparer';
import * as component from 'documentServices/component/component';
import * as structure from 'documentServices/structure/structure';
import * as constants from 'documentServices/constants/constants';
import * as componentsMetaData from 'documentServices/componentsMetaData/componentsMetaData';
import * as utils from 'utils';
import * as experiment from 'experiment';
import * as hooks from 'documentServices/hooks/hooks';

const mobileToggledComps = {
    BACK_TO_TOP_BUTTON: 'BACK_TO_TOP_BUTTON'
};

const mobileOnlyComps = {
    BACK_TO_TOP_BUTTON: 'BACK_TO_TOP_BUTTON',
    TINY_MENU: 'TINY_MENU'
};

/**
 * return map with structure differences between mobile structure and website structure
 * @param {PrivateDocumentServices} ps
 * @param {boolean} onMerge
 */
function populateMapWithStructureDifferences(ps, onMerge:boolean) {
    const removedCompsMap = structuresComparer.getComponentsExistingInWebsiteButNotInMobile(ps);
    _.forOwn(removedCompsMap, (removedComps, pageId) => {
        const page = ps.dal.get(ps.pointers.components.getPage(pageId, constants.VIEW_MODES.MOBILE));
        const mobileRemovedComps = mobileConversion.getHiddenMobileOnlyComponentIds(ps, page);
        populateListByPageWithStructureDifferences(ps, pageId, removedComps, mobileRemovedComps, onMerge);
    });
}

/**
 * return map with structure differences between mobile structure and website structure for the pageId passed
 * @param {PrivateDocumentServices} ps
 * @param {string} pageId to run the differences on
 * @param {array<string>} removedComps -array of components id's that exist in website structure but not in mobile
 * @param {array<string>} mobileRemovedComps array of mobile only components id's that was removed from mobile structure
 * @param {boolean} onMerge
 */
function populateListByPageWithStructureDifferences(ps, pageId, removedComps, mobileRemovedComps, onMerge) {
    var hiddenCompsList;

    if (onMerge) {
        hiddenCompsList = _.union(removedComps, mobileRemovedComps);
        setDeletedListByPage(ps, pageId, hiddenCompsList);
    } else {
        setDeletedListByPage(ps, pageId, removedComps);
    }
}


/**
 * remove component from mobile deleted components list
 * @param {PrivateDocumentServices} ps
 * @param {array<string>} componentIdList - component id to remove from list
 * @param {pageId} pageId of the component
 */
function removeFromListByPage(ps, componentIdList, pageId) {
    var compDeletedMap = getMobileDeletedCompMap(ps);
    var pageDeletedCompsArr = compDeletedMap[pageId];
    var lengthBefore = compDeletedMap[pageId].length;
    compDeletedMap[pageId] = _.difference(pageDeletedCompsArr, componentIdList);
    if (lengthBefore !== compDeletedMap[pageId].length) {
        setMobileDeletedCompMap(ps, compDeletedMap);
        return true;
    }
    return false;
}

/**
 * update deleted components for a specific pageId
 * @param {PrivateDocumentServices} ps
 * @param {string} pageId to update the array for
 * @param {array<string>}  compIdList of components id's - contains the deleted components for the given page
 */
function setDeletedListByPage(ps, pageId, compIdList) {
    var compDeletedMap = getMobileDeletedCompMap(ps);
    if (!compDeletedMap) {
        compDeletedMap = {};
    }
    if (_.isEqual(compDeletedMap[pageId], compIdList)) {
        return;
    }
    compDeletedMap[pageId] = compIdList;
    setMobileDeletedCompMap(ps, compDeletedMap);
}

/**
 * update the dal with the new deleted components map
 * @param {PrivateDocumentServices} ps
 * @param {object.<string,array<string>>} deletedCompList of array contain array with deleted components id's for each page
 */
function setMobileDeletedCompMap(ps, deletedCompList) {
    var deletedMobileCompsPointer = ps.pointers.general.getDeletedMobileComps();
    ps.dal.set(deletedMobileCompsPointer, deletedCompList);
}

function getMobileComponentReference(ps, compId) {
    var masterPointer = ps.pointers.components.getMasterPage(constants.VIEW_MODES.MOBILE);
    return ps.pointers.components.getComponent(compId, masterPointer);
}

function validateIfCanHideComponent(compPointer) {
    if (compPointer.type !== constants.VIEW_MODES.MOBILE) {
        throw new Error('need to pass mobile component path');
    }
}


/**
 * add mobile only component to mobile structure
 * @param {PrivateDocumentServices} ps
 * @param {String} compId of mobile only component
 */
function addMobileOnlyComponent(ps, compId) {
    if (isMobileOnlyComponentExistOnStructure(ps, compId)) {
        throw new Error('component already exist in mobile structure');
    }
    var masterPageStructurePointer = ps.pointers.components.getMasterPage(constants.VIEW_MODES.MOBILE);
    var masterPageStructure = ps.dal.get(masterPageStructurePointer);
    mobileConversion.addMobileOnlyComponentToStructure(ps, compId, masterPageStructure);
    ps.dal.set(masterPageStructurePointer, masterPageStructure);
}

/**
 * removes mobile only component from mobile structure
 * @param {PrivateDocumentServices} ps
 * @param {String} compId of mobile only component
 */
function removeMobileOnlyComponent(ps, compId) {
    if (!isMobileOnlyComponentExistOnStructure(ps, compId)) {
        throw new Error("component doesn't exist in mobile structure");
    }
    var compRef = getMobileComponentReference(ps, compId);
    component.deleteComponent(ps, compRef);
}

function runHoverBoxHooksIfNeeded(ps: ps): void {
    if (!experiment.isOpen('sv_hoverBox')) {
        return;
    }
    _.forEach(getChangedPagesPointers(ps), pagePointer => {
        const type = ps.dal.get(ps.pointers.getInnerPointer(pagePointer, 'componentType'));
        hooks.executeHook(hooks.HOOKS.MOBILE_CONVERSION.BEFORE, type, [ps, pagePointer]);
    });
}

/***********************PUBLIC FUNCTIONS *************************************/

function initialize(ps) {
    hooks.registerHook(hooks.HOOKS.SWITCH_VIEW_MODE.MOBILE, function () {
        runHoverBoxHooksIfNeeded(ps);
        mobileConversion.convertMobileStructure(ps);
        populateMapWithStructureDifferences(ps, true);
    });
    if (!getMobileDeletedCompMap(ps)) {
        populateMapWithStructureDifferences(ps, true);
    }
}

function reLayoutPage(ps, pageId) {
    pageId = pageId || ps.siteAPI.getCurrentUrlPageId();
    var currPageData = ps.dal.get(ps.pointers.components.getPage(pageId, constants.VIEW_MODES.MOBILE));
    var deletedCompsMap = getMobileDeletedCompMap(ps);
    var deletedCompsByPage = deletedCompsMap ? deletedCompsMap[pageId] || [] : [];
    var mobileComps = mobileConversion.runMobileConversionAlgorithm(ps, currPageData, deletedCompsByPage);
    applyMergeResults(ps, pageId, mobileComps);
}


function reAddDeletedMobileComponent(ps: ps, compToReAddRef: Pointer, compId: string, pageId: string): void {
    if (!compId || !pageId) {
        throw new Error('function must receive component id and page id');
    }
    const existsOnList = removeFromListByPage(ps, [compId], pageId);
    if (!existsOnList) {
        throw new Error("component isn't hidden");
    }
    const pagesInfo = <Map<PageData>> _.set({}, pageId, ps.dal.get(ps.pointers.page.getPagePointer(pageId)));
    const settings = {keepInvisibleComponents: true};
    const mobilePagesData = conversionUtils.extractMobileStructure(pagesInfo);
    const mobileComps = mobileConversion.runMobileMergeAlgorithm(ps, pagesInfo, mobilePagesData, getMobileDeletedCompMap(ps), settings)[pageId];
    applyMergeResults(ps, pageId, mobileComps);
}

function applyMergeResults(ps: ps, pageId: string, mergeResults: Component[]): void {
    const mobilePageComp = ps.dal.get(ps.pointers.page.getPagePointer(pageId)).structure;
    _.set(mobilePageComp, conversionUtils.isMasterPage(mobilePageComp) ? 'children' : 'components', mergeResults);
    const conversionResults = _.set({}, pageId, mobilePageComp);
    mobileConversion.applyConversion(ps, <Map<ComponentWithConversionData|MasterPageComponent>>conversionResults);
    populateMapWithStructureDifferences(ps, true);
}

function getMobileComponentToShow(ps, compId, pageId) {
    var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.MOBILE);
    return ps.pointers.components.getComponent(compId, pagePointer);
}

function setBackToTopButton(ps, enable) {
    var compId = mobileToggledComps.BACK_TO_TOP_BUTTON;
    if (typeof enable !== 'boolean') {
        throw new Error('invalid parameter type');
    }
    if (enable) {
        addMobileOnlyComponent(ps, compId);
    } else {
        removeMobileOnlyComponent(ps, compId);
    }
}

function filterOutChildrenIfParentIsInTheList(ps, deletedCompList, pageId) {
    var componentsToFilter = _(deletedCompList)
        .map(function (deletedCompId) {
            if (_.includes(mobileOnlyComps, deletedCompId)) {
                return [];
            }

            var desktopPage = ps.pointers.components.getPage(pageId, utils.constants.VIEW_MODES.DESKTOP);
            var deletedCompPointer = ps.pointers.components.getComponent(deletedCompId, desktopPage);
            var deletedComp = ps.dal.get(deletedCompPointer);
            if (_.get(componentsMetaData.public.getMobileConversionConfig(ps, deletedComp, pageId), 'filterChildrenWhenHidden')) {
                return _.map(ps.pointers.components.getChildrenRecursively(deletedCompPointer), 'id');
            }

            return [];
        })
        .flatten()
        .value();

    return _.difference(deletedCompList, componentsToFilter);
}

function getFilteredMobileDeletedCompMap(ps, pageId) {
    var mobileDeletedCompMap = getMobileDeletedCompMap(ps, pageId);
    if (_.isArray(mobileDeletedCompMap)) {
        mobileDeletedCompMap = filterOutChildrenIfParentIsInTheList(ps, mobileDeletedCompMap, pageId);
    } else {
        _.forEach(mobileDeletedCompMap, function (deletedCompList, pageID) {
            mobileDeletedCompMap[pageID] = filterOutChildrenIfParentIsInTheList(ps, deletedCompList, pageID);
        });
    }

    return mobileDeletedCompMap;
}


function getMobileDeletedCompMap(ps, pageId?) {
    var deletedMobileCompsPointer = ps.pointers.general.getDeletedMobileComps();
    var deletedMap = ps.dal.get(deletedMobileCompsPointer);
    if (!pageId) {
        return deletedMap;
    }
    return deletedMap ? deletedMap[pageId] : [];
}

function getWithAllPointersInside(ps, componentPointer) {
    var childrenPointers = ps.pointers.components.getChildren(componentPointer);

    return childrenPointers.reduce(function (arr, childPointer) {
        return arr.concat(getWithAllPointersInside(ps, childPointer));
    }, [componentPointer]);
}

function hideMobileComponent(ps, compPointer) {
    validateIfCanHideComponent(compPointer);
    var pageId = ps.pointers.components.getPageOfComponent(compPointer).id;
    var deletedCompsMap = getMobileDeletedCompMap(ps);
    var currPageDeletedArr = deletedCompsMap[pageId] || [];
    var newPageDeletedArr = _.pluck(getWithAllPointersInside(ps, compPointer), 'id');
    setDeletedListByPage(ps, pageId, newPageDeletedArr.concat(currPageDeletedArr));
    deleteComponentAndAdjustPageComponentsToFillDeletedComponentSpace(ps, compPointer);
}

function deleteComponentAndAdjustPageComponentsToFillDeletedComponentSpace(ps, deletedCompRef) {
    var oldParentComp = component.getContainer(ps, deletedCompRef);
    var deletedComponentLayoutData = component.layout.get(ps, deletedCompRef);
    var deletedComponentSiblings = component.getSiblings(ps, deletedCompRef);

    component.deleteComponent(ps, deletedCompRef, false);
    if (oldParentComp.id !== constants.MASTER_PAGE_ID) {
        adjustPageComponentsToFillDeletedComponentSpace(ps, oldParentComp, deletedComponentLayoutData, deletedComponentSiblings);
    }
}

function adjustPageComponentsToFillDeletedComponentSpace(ps, oldParentComp, deletedComponentLayoutData, deletedComponentSiblings) {
    var deletedCompTopY = deletedComponentLayoutData.y;
    var lengthToPullUpLowerComponents = deletedComponentLayoutData.height;
    var deletedCompBottomY = deletedCompTopY + deletedComponentLayoutData.height - 1;
    var yOverlappingDeletedComponentSiblings = _.filter(deletedComponentSiblings, function (compRef: Pointer) {
        var compLayout = component.layout.get(ps, compRef);
        var curCompTopY = compLayout.y;
        var curCompBottomY = curCompTopY + compLayout.height - 1;
        return inCompRange(curCompTopY, deletedCompTopY, deletedCompBottomY) || inCompRange(deletedCompTopY, curCompTopY, curCompBottomY);
    });

    //check if to shrink the gap of the deleted component with extra COMPONENT_MOBILE_MARGIN_X
    var COMPONENT_MOBILE_MARGIN_X = 10;
    var isMarginAboveDeletedComponentClearOfOtherComponentsRes = isMarginAboveDeletedComponentClearOfOtherComponents(ps, deletedCompTopY, COMPONENT_MOBILE_MARGIN_X, deletedComponentSiblings);
    if (isMarginAboveDeletedComponentClearOfOtherComponentsRes) {
        lengthToPullUpLowerComponents += COMPONENT_MOBILE_MARGIN_X;
    }


    //in case the deleted component exceeded the container:
    var oldParentExists = ps.dal.get(oldParentComp);
    var oldParentCompLayout;
    if (oldParentExists) {
        oldParentCompLayout = component.layout.get(ps, <Pointer> oldParentComp);
        if (deletedCompBottomY > oldParentCompLayout.height) {
            var lengthOfDeletedComponentExceededParent = deletedCompBottomY - oldParentCompLayout.height;
            lengthToPullUpLowerComponents -= lengthOfDeletedComponentExceededParent;
        }
    }

    _.forEach(yOverlappingDeletedComponentSiblings, function (curSibling) {
        var curSiblingLayout = component.layout.get(ps, curSibling);
        var curSiblingBottomY = curSiblingLayout.y + curSiblingLayout.height - 1;
        if (curSiblingBottomY > deletedCompBottomY) {
            lengthToPullUpLowerComponents = 0;
        } else {
            lengthToPullUpLowerComponents = Math.min(lengthToPullUpLowerComponents, deletedCompBottomY - curSiblingBottomY);
        }
    });

    var affectedComponents = [];
    _.forEach(deletedComponentSiblings, function (curSibling) {
        var curSiblingLayout = component.layout.get(ps, curSibling);
        if (lengthToPullUpLowerComponents && curSiblingLayout.y > deletedComponentLayoutData.y + deletedComponentLayoutData.height - 1) {
            structure.updateCompLayout(ps, curSibling, {y: curSiblingLayout.y - lengthToPullUpLowerComponents});
            affectedComponents.push(curSibling);
        }
    });

    if (oldParentExists && affectedComponents.length === 0 && lengthToPullUpLowerComponents > 0) {
        var oldParentCompChildren = component.getChildren(ps, oldParentComp);
        if (oldParentCompChildren.length > 0) {
            structure.updateCompLayout(ps, oldParentComp, {height: oldParentCompLayout.height - lengthToPullUpLowerComponents});
        } else {
            var CONTAINER_HEIGHT_IF_HAS_NO_CHILDREN = 50;
            structure.updateCompLayout(ps, oldParentComp, {height: CONTAINER_HEIGHT_IF_HAS_NO_CHILDREN});
        }
    }
}

function isMarginAboveDeletedComponentClearOfOtherComponents(ps, deletedCompTopY, COMPONENT_MOBILE_MARGIN_X, deletedComponentSiblings) {
    var isTopMarginExist = true;
    if (deletedCompTopY < COMPONENT_MOBILE_MARGIN_X) {
        isTopMarginExist = false;
    } else {
        for (var i = 0; i < deletedComponentSiblings.length; i++) {
            var curSiblingLayout = component.layout.get(ps, deletedComponentSiblings[i]);
            var curSiblingTopY = curSiblingLayout.y;
            var curSiblingBottomY = curSiblingTopY + curSiblingLayout.height - 1;
            if (inCompRange(deletedCompTopY - 1, curSiblingTopY, curSiblingBottomY) || inCompRange(deletedCompTopY - COMPONENT_MOBILE_MARGIN_X, curSiblingTopY, curSiblingBottomY)) {
                isTopMarginExist = false;
                break;
            }
        }
    }
    return isTopMarginExist;
}

function inCompRange(number, lowerBound, higherBound) {
    return (number >= lowerBound && number <= higherBound);
}

function isMobileOnlyComponentExistOnStructure(ps, compId) {
    var compRef = getMobileComponentReference(ps, compId);
    if (!compRef) {
        return false;
    }
    return component.isExist(ps, compRef);
}

var mobileActions = {
    initialize: initialize,
    /**
     * clears all changes preformed by user on mobile structure and runs the mobile algorithm again for the given page. If a page is not given
     * the algorithm we run on the current page.
     * @member documentServices.mobile
     * @param {string} [pageId] pageId to relayout - runs mobile conversion on the page - if null relayout current page.
     */
    reLayoutPage: reLayoutPage,
    /**
     * show or hide back to top button based on enable parameter
     * @member documentServices.mobile
     * @param {boolean} enable - enable or disable to add to top button
     *
     */
    enableBackToTopButton: setBackToTopButton,

    /**
     * updates display mode of component in the mobile view and page layout when needed
     * @member documentServices.mobile
     * @param compPointer pointer of component in mobile
     * @param mobileDisplayedModeId display mode of component
     *
     */
    setComponentDisplayMode: function (ps: ps, compPointer: Pointer, mobileDisplayedModeId: string) {
        const mergeResults = setComponentDisplayMode(ps, compPointer, mobileDisplayedModeId);
        if (mergeResults) {
            applyMergeResults(ps, ps.pointers.components.getPageOfComponent(compPointer).id, mergeResults);
        }
    },

    /**
     * Return the default position of tinyMenu, to be used when
     * setting tinyMenu as fixedPosition while tinyMenu is outside the 'green zone'
     *
     * @returns {{x: number, y: number}}
     */
    getTinyMenuDefaultPosition: conversionUtils.getTinyMenuDefaultPosition,
    /**
     * @class documentServices.mobile.hiddenComponents
     */
    hiddenComponents: {
        /**
         * returns all components deleted for mobile structure - if page id is passed an array with comps for the page will be returned
         * @param {string} [pageId] -  deleted comps of the page id. if not passed return deleted comps for all pages.
         */
        get: getMobileDeletedCompMap,

        /**
         * returns a subset of components deleted for mobile structure - if page id is passed an array with comps for the page will be returned
         * the filter will return only components that their parent on desktop is not presented on the list. That way a child can be hidden and appear in the list
         * only if its parent is not also hidden (if the parent is hidden, only the parent will appear in the list)
         * @param {string} [pageId] -  deleted comps of the page id. if not passed return deleted comps for all pages.
         */
        getFiltered: getFilteredMobileDeletedCompMap,
        /**
         * hides the component from mobile structure
         * @param {object} compPointer - pathAbstraction of the comp we want to hide
         * @param {string} compPointer.id - id of component
         * @param {string} compPointer.type - DESKTOP/MOBILE
         *
         */
        hide: hideMobileComponent,
        /**
         * allows to re add component to mobile structure. You can re add only components that were hidden before.
         * @param {string} compId to show
         * @param {string} pageId the component was deleted from
         */
        show: reAddDeletedMobileComponent,

        //should not be exposed in public API
        set: setDeletedListByPage
    },
    /**
     * Checks if a component is only mobile component
     *
     * @param {PrivateDocumentServices} ps - private document services
     * @param {string} compId
     *
     * @returns {boolean}
     */
    isMobileOnlyComponent: function (ps: ps, compId) {
        return mobileConversion.isMobileOnlyComponent(ps, compId);
    },
    /**
     * Checks if a component that is only mobile exist on mobile structure
     *
     * @param {PrivateDocumentServices} ps - private document services
     * @param {string} compId
     *
     * @returns {boolean}
     */
    isMobileOnlyComponentExistOnStructure: isMobileOnlyComponentExistOnStructure,
    /**
     * return object with mobile Only components and their ids
     *
     * @returns {object}
     */
    mobileOnlyComps: mobileOnlyComps,
    /**
     * return compRef for mobile component to be shown (re-added)
     *
     * @returns {object}
     */
    getMobileComponentToShow: getMobileComponentToShow,
    /**
     * populates maps with removed items in mobile
     *
     * @param {PrivateDocumentServices} ps - private document services
     * @param {boolean} onMerge
     */
    populateMapWithStructureDifferences: populateMapWithStructureDifferences
};

export = mobileActions;
