'use strict';

import * as _ from 'lodash';
import {dataUtils} from 'coreUtils';
import * as conversionUtils from 'documentServices/mobileConversion/modules/conversionUtils';
import * as metaDataUtils from 'documentServices/componentsMetaData/metaDataUtils';


function convertFixedPositionCompsToAbsolute(allComps) {
    _.forEach(allComps, function (comp) {
        if (comp.layout) {
            comp.layout.fixedPosition = false;
        }
    });
}

/**
 * Prepares structure to the mobile conversion
 *
 * @param {Object} page - page structure
 * @param {Array} comps - components list
 *
 */
function preProcessStructure(page, comps: ComponentWithConversionData[], sets: StructurePreprocessorSettings = {}, deletedCompIds: string[] = []) {
    const allComps = dataUtils.getAllCompsInStructure(page);

    if (!sets.keepEmptyTextComponents) {
        clearFromEmptyText(comps);
    }

    removeOccludedBackgroundStrips(comps);

    convertFixedPositionCompsToAbsolute(allComps);
    _.forEach(comps, packTextWidth);
    removeHiddenComponentsFrom(page, comps, deletedCompIds);
    removeNonMobileComponentsFrom(page, comps, sets.keepNotRecommendedMobileComponents);

    if (!sets.keepOutOfScreenComponents) {
        removeOutOfScreenComponentsFrom(page, comps, 0, 0);
    }

    nestOverlayingComponents(comps);

    if (!sets.keepOccludedAndEmptyBackgrounds) {
        removeEmptyBackgroundStrips(comps);
    }

    if (conversionUtils.isMasterPage(page)) {
        handleMasterPageComponents(comps);
    }

    if (!sets.keepInvisibleComponents) {
        removeInvisibleComponents(comps, deletedCompIds);
    }

    return page;
}

/**
 * Moves all other components in the master page to header footer or pages container
 *
 * @private
 *
 * @param {Array} comps - master page components list
 */
function handleMasterPageComponents(comps) {
    var header = <Component> _.find(comps, {id: 'SITE_HEADER'});
    var footer = <Component> _.find(comps, {id: 'SITE_FOOTER'});
    var pagesContainer = _.find(comps, {id: 'PAGES_CONTAINER'});
    _(comps)
        .remove((comp) => comp !== header && comp !== footer && comp !== pagesContainer)
        .forEach(function (comp: Component) {
            const container = getClosestComp(comp, [header, footer]);
            conversionUtils.reparentComponent(container, comp);
        })
        .commit();
}
/**
 * Removes empty text components from the passed components structure
 *
 * @private
 *
 * @param {Array} comps - the components list
 */
function clearFromEmptyText(comps: ComponentWithConversionData[]) {
    var i;
    var child;

    if (comps) {
        for (i = comps.length - 1; i >= 0; i--) {
            child = comps[i];

            if (conversionUtils.isTextComponent(child)) {
                if (_.get(child.conversionData, 'textLength', 0) === 0) {
                    comps.splice(i, 1);
                }
            } else {
                clearFromEmptyText(child.components);
            }
        }
    }
}

function packTextWidth(component: ComponentWithConversionData) {
    _.forEach(component.components, packTextWidth);
    const actualTextWidth : number = _.get<number>(component, ['conversionData', 'actualTextWidth']);
    if (_.isUndefined(actualTextWidth) || actualTextWidth >= component.layout.width) {
        return;
    }

    if (actualTextWidth === 0) {
        component.layout.width = 0;
        return;
    }

    const alignments = _.get(component, ['conversionData', 'textAlignments'], ['left']);
    if (_.size(alignments) !== 1) {
        return;
    }

    switch (_.first(alignments)) {
        case 'center':
            component.layout.x += (component.layout.width - actualTextWidth) / 2;
            break;
        case 'right':
            component.layout.x += (component.layout.width - actualTextWidth);
            break;
    }

    component.layout.width = actualTextWidth;
}

/**
 * Removes explicitly hidden components
 *
 * @private
 *
 * @param {Object} parent - parent component's parent
 * @param {Array} comps - children components list
 */
function removeHiddenComponentsFrom(parent, comps: Component[], deletedCompIds: string[] = []) {
    var i = 0;
    var child;
    var childComps;

    if (comps && deletedCompIds && deletedCompIds.length !== 0) {
        while (i < comps.length) {
            child = comps[i];

            if (_.includes(deletedCompIds, child.id)) {
                if (conversionUtils.isContainer(child)) {
                    childComps = child.components;

                    while (childComps.length) {
                        conversionUtils.reparentComponent(parent, childComps[0]);
                        childComps.splice(0, 1);
                    }
                }

                comps.splice(i, 1);
            } else {
                removeHiddenComponentsFrom(child, child.components, deletedCompIds);
                i++;
            }
        }
    }
}

/**
 * Removes non mobile and not recommended components from the structure
 *
 * @private
 *
 *@param {Object} parent - parent component's parent
 * @param {Array} comps - children components list
 * @param {Object} keepNotRecommendedComps - should it keep not recommended for the mobile view components
 *
 * @returns {Object} parent - parent component's modified structure
 */
function removeNonMobileComponentsFrom(parent, comps, keepNotRecommendedComps: boolean) {
    if (conversionUtils.isMergeVirtualGroup(parent)) {
        return;
    }
    _.remove(comps, function (child:ComponentWithConversionData) {
        const desktopOnly = _.get(child, ['conversionData', 'desktopOnly']);
        if (desktopOnly || (!keepNotRecommendedComps && _.get(child, ['conversionData', 'hideByDefault']))) {
            return true;
        }
        removeNonMobileComponentsFrom(child, child.components, keepNotRecommendedComps);
    });
}

/**
 * Removes from the components structure components which are out of screen
 *
 * @private
 *
 * @param {Object} comp - component's structure
 * @param {Array} comps - children components list
 * @param {Number} x - horizontal coordinate
 * @param {Number} y - vertical coordinate
 *
 * @returns {Object} comp - component's structure
 */
function removeOutOfScreenComponentsFrom(comp: Component, comps: Component[], x, y) {
    var i = 0;
    var child;
    var childBottom;
    var childRight;
    var isOutOfScreen;

    if (comps) {
        while (i < comps.length) {
            child = comps[i];
            childBottom = child.layout.y + child.layout.height;
            childRight = child.layout.x + child.layout.width;
            isOutOfScreen = (childBottom + y < 0) || (child.layout.x > 1500) || (childRight + x < -500);

            if (isOutOfScreen) {
                comps.splice(i, 1);
            } else {
                removeOutOfScreenComponentsFrom(child, child.components, x + child.layout.x, y + child.layout.y);
                i++;
            }
        }
    }

    return comp;
}

const isOldStrip = comp => comp.componentType === "wysiwyg.viewer.components.StripContainer";

function removeEmptyBackgroundStrips(comps: ComponentWithConversionData[]) {
    _.remove(comps, (comp: ComponentWithConversionData) => {
        let compsToCheck = isOldStrip(comp) ? [comp] : comp.components;
        if (_.get(comp, ['conversionData', 'isSolidColorBackground'], false) && _.isEmpty(compsToCheck[0].components)) {
            return true;
        }
        removeEmptyBackgroundStrips(<ComponentWithConversionData[]> comp.components);
        return false;
    });
}

function removeOccludedBackgroundStrips(comps: ComponentWithConversionData[]) {
    const isOccludedBySibling = (comp, siblings: ComponentWithConversionData[]) => {
        return _.find(siblings, sibling => conversionUtils.isScreenWidthComponent(sibling) && comp.layout.y === sibling.layout.y && comp.layout.height === sibling.layout.height);
    };
    _.remove(comps, (comp: ComponentWithConversionData, compIndex) => {
        if (conversionUtils.isScreenWidthComponent(comp) && _.get(comp, ['conversionData', 'isSolidColorBackground']) &&
            isOccludedBySibling(comp, _.slice(comps, compIndex + 1))) {
            return true;
        }
        removeOccludedBackgroundStrips(<ComponentWithConversionData[]> comp.components);
        return false;
    });
}


function nestOverlayingComponents(comps: Component[]) {
    _.forEachRight(comps, function (child, i) {
        const isSemiTransparentContainer = (comp) => _.get(comp, ['conversionData', 'isSemiTransparentContainer'], false);
        let overlayingSibling = getOverlayingSiblingOf(child, _.slice(comps, 0, i)) ||  getOverlayingSiblingOf(child, _.slice(comps, i), isSemiTransparentContainer);
        if (conversionUtils.canBeNestedTo(overlayingSibling) && !metaDataUtils.isNonContainableFullWidth(child.componentType)) {
            let yOffset = 0;
            if (conversionUtils.isColumnsContainerComponent(overlayingSibling)) {
                yOffset = overlayingSibling.layout.y;
                overlayingSibling = _.first(overlayingSibling.components);
            }
            conversionUtils.reparentComponent(overlayingSibling, child);
            child.layout.y -= yOffset;
            comps.splice(i, 1);
        } else {
            nestOverlayingComponents(child.components);
        }
    });

    return comps;
}

function removeInvisibleComponents(comps: ComponentWithConversionData[], deletedCompIds: string[]): void {
    _.forEachRight(comps, function (child, childIndex) {
        const siblings = _.slice(comps, childIndex + 1);
        const isSemiTransparentContainer = (comp) => _.get(comp, ['conversionData', 'isSemiTransparentContainer'], false);
        const hidingSibling = getOverlayingSiblingOf(child, siblings, _.negate(isSemiTransparentContainer), 1);
        if (hidingSibling) {
            deletedCompIds.push(child.id);
            comps.splice(childIndex, 1);
        } else {
            removeInvisibleComponents(<ComponentWithConversionData[]> child.components, deletedCompIds);
        }
    });
}


function getOverlayingSiblingOf(comp, siblings, siblingFilter?: Function, overlappingAreaToMinAreaRatioThreshold: number = 0.75) {
    if (conversionUtils.isSiteSegmentOrPage(comp)) {
        return null;
    }
    return _.find(siblings, (sibling: any) =>
            sibling.id !== comp.id && sibling.id !== 'PAGES_CONTAINER' && (!siblingFilter || siblingFilter(sibling)) &&
            conversionUtils.isContainer(sibling) && conversionUtils.haveSufficientOverlap(sibling, comp, overlappingAreaToMinAreaRatioThreshold) &&
            conversionUtils.hasGreaterArea(sibling, comp));
}

function getClosestComp(comp: Component, comps: Component[]): Component {
    const getCenterY = (c) => c.layout.y + (c.layout.height || 0) / 2;
    const compCenterY = getCenterY(comp);
    return _.min(comps, (c) => Math.abs(compCenterY - getCenterY(c)));
}

export {
    convertFixedPositionCompsToAbsolute,
    preProcessStructure,
    handleMasterPageComponents
}