'use strict';

import * as _ from 'lodash';
import * as conversionUtils from 'documentServices/mobileConversion/modules/conversionUtils';
import {conversionConfig} from 'documentServices/mobileConversion/data/conversionConfig';

const virtualGroupHandler = {
    addVirtualGroupsToStructure: function (page: Component | MasterPageComponent, comps: Component[]): void {
        unifyTextBackgroundImageGroups(page, comps);
        replaceBackgroundGroupedComponentsToBackgroundVirtualGroups(page, comps);
        identifyOverlayingComponentsAsGroups(page, comps);
        replaceOverlayingGroupedComponentsToVirtualGroups(page, comps);
        cleanUpVirtualGroupsIdentifiers(page, comps);
    },

    createVirtualGroup,
    replaceBackGroupsToFlatComponents,

    flattenComponentsToInsertFromVirtualGroups: function (componentsToInsertMap: any[], componentIdsAddedToWebStructure: string[]): void {
        _.forEach(componentsToInsertMap, comp => {
            const firstCompToAdd = <Component> _.first(comp.componentToAdd);
            if (isVirtualGroup(firstCompToAdd, false)) {
                conversionUtils.translateComps(firstCompToAdd.components, firstCompToAdd.layout.x, firstCompToAdd.layout.y);
                comp.componentToAdd = firstCompToAdd.components;
            }
            replaceBackGroupsToFlatComponents(firstCompToAdd, firstCompToAdd.components);
        });

        //if virtual groups consisted present components -> remove them
        _.forEach(componentsToInsertMap, comp => {
            _.remove(comp.componentToAdd, (compToAdd: Component) => !_.includes(componentIdsAddedToWebStructure, compToAdd.id));
        });
    },

    isVirtualGroup: (component: Component | MasterPageComponent, includeMergeVirtualGroup?: boolean) => isVirtualGroup(component, includeMergeVirtualGroup === true)
};

function replaceBackGroupsToFlatComponents(parent: Component | MasterPageComponent, comps: Component[]): void {
    if (!comps) {
        return;
    }
    const virtualGroupsToRemove = [];
    let childIndex = 0;
    while (childIndex < comps.length) {
        const child = comps[childIndex];
        if (isVirtualGroup(child)) {
            conversionUtils.translateComps(child.components, child.layout.x, child.layout.y);
            conversionUtils.addComponentsTo(parent, child.components, childIndex + 1);
            virtualGroupsToRemove.push(child);
        }
        childIndex++;
    }
    conversionUtils.removeChildrenFrom(parent, virtualGroupsToRemove);
    _.forEach(comps, comp => replaceBackGroupsToFlatComponents(comp, comp.components));
}

function unifyTextBackgroundImageGroups(parent, comps) {
    if (!comps) {
        return;
    }
    parent.textBackgroundImageGroups = _(comps)
        .map((comp: Component, compIndex: number) => getTextBackgroundImageGroups(comp, <Component[]> _.slice(comps, compIndex + 1)))
        .flatten()
        .value();
    conversionUtils.unifyGroups(parent.textBackgroundImageGroups, 50);
    _.forEach(comps, comp => unifyTextBackgroundImageGroups(comp, comp.components));
}

function getTextBackgroundImageGroups(comp: Component, compSiblings: Component[]): string[][] {
    const groups: Component[] = _.filter(compSiblings, (sibling: Component) => areComponentsTextAndBackgroundImageGroup(comp, sibling));
    return _.map(groups, (sibling: Component) => [comp.id, sibling.id])
}

function areComponentsTextAndBackgroundImageGroup(comp1, comp2): boolean {
    const text = _.find([comp1, comp2], conversionUtils.isTextComponent);
    const image = _.find([comp1, comp2], conversionUtils.isImageComponent);
    return text && image && !isComponentSuitableForProportionGrouping(text) && isFirstRectCoveredBySecondRect(text.layout, image.layout);
}

function isFirstRectCoveredBySecondRect(rect1, rect2, xTightnessThreshold: number = 100) {
    return rect1.x >= rect2.x && rect1.x + rect1.width <= rect2.x + rect2.width &&
           rect1.x + rect1.width + xTightnessThreshold >= rect2.x + rect2.width && rect1.x - xTightnessThreshold <= rect2.x &&
           rect1.y >= rect2.y && rect1.y + rect1.height <= rect2.y + rect2.height;
}

function isComponentSuitableForProportionGrouping(comp: ComponentWithConversionData): boolean {
    return !conversionUtils.isBackgroundVirtualGroup(comp) &&
           _.get(comp, ['conversionData', 'textLength'], 0) <= conversionConfig.TEXT_MAX_LENGTH_FOR_RESCALING &&
           _.get(comp, ['conversionData', 'isSuitableForProportionGrouping'], false) &&
           _.every(comp.components, isComponentSuitableForProportionGrouping);
}

function replaceBackgroundGroupedComponentsToBackgroundVirtualGroups(parent, comps) {
    if (!comps || !parent.textBackgroundImageGroups) {
        return;
    }
    _.forEach(parent.textBackgroundImageGroups, curGroup => {
        const groupComps = <ComponentWithConversionData[]> conversionUtils.getComponentsByIds(parent, curGroup);
        const groupLayout = getBackgroundGroupLayout(groupComps);
        const virtualGroup: ComponentWithConversionData = {
            type: 'undefined',
            id: 'background_virtual_group_' + Math.random(),
            componentType: conversionConfig.VIRTUAL_GROUP_TYPES.BACKGROUND,
            components: groupComps,
            layout: groupLayout,
            skin: 'undefined',
            conversionData: {
                rescaleMethod: 'background'
            },
            styleId: 'undefined'
        };
        _.set(virtualGroup, 'originalLayout', groupLayout);
        setTextLayoutRelativeToImage(groupComps);
        conversionUtils.removeChildrenFrom(parent, groupComps);
        conversionUtils.addComponentsTo(parent, [virtualGroup]);
    });

    _.forEach(comps, comp => replaceBackgroundGroupedComponentsToBackgroundVirtualGroups(comp, comp.components));
}

function identifyOverlayingComponentsAsGroups(parent, comps) {
    if (!parent.components) {
        return;
    }
    parent.proportionGroups = parent.proportionGroups || [];
    const groups = [];
    const componentClone = _.cloneDeep(parent);
    const childrenClone = conversionUtils.getChildren(componentClone);

    while (childrenClone.length > 0) {
        let overlayingComponents = getCompsOverlayingWithComp(childrenClone[0], childrenClone);

        if (overlayingComponents.length === 0) {
            _.remove(conversionUtils.getChildren(componentClone), childrenClone[0]);
            continue;
        }

        conversionUtils.removeChildrenFrom(componentClone, overlayingComponents);
        let j = 0;
        while (j < overlayingComponents.length) {
            const moreOverlayingComponents = getCompsOverlayingWithComp(overlayingComponents[j], childrenClone);
            overlayingComponents = overlayingComponents.concat(moreOverlayingComponents);
            conversionUtils.removeChildrenFrom(componentClone, moreOverlayingComponents);
            j++;
        }

        if (overlayingComponents.length > 1) {
            groups.push(_.map(overlayingComponents, 'id'));
        }
    }

    parent.proportionGroups = parent.proportionGroups.concat(groups);
    _.forEach(comps, comp => identifyOverlayingComponentsAsGroups(comp, comp.components));
}

function replaceOverlayingGroupedComponentsToVirtualGroups(parent, comps) {
    _.forEach(parent.proportionGroups, groupCompIds => {
        const isValidGroup = _.every(groupCompIds, goupCompId => _.find(parent.components, {id: goupCompId}));
        if (!isValidGroup) {
            return;
        }
        const groupComps = conversionUtils.getComponentsByIds(parent, groupCompIds);
        const virtualGroup = createVirtualGroup(groupComps);
        conversionUtils.removeChildrenFrom(parent, groupComps);
        conversionUtils.addComponentsTo(parent, [virtualGroup]);
    });

    _.forEach(comps, comp => replaceOverlayingGroupedComponentsToVirtualGroups(comp, comp.components));
}

function cleanUpVirtualGroupsIdentifiers(parent, comps) {
    delete parent.proportionGroups;
    delete parent.textBackgroundImageGroups;
    _.forEach(comps, comp => cleanUpVirtualGroupsIdentifiers(comp, comp.components));
}

function setTextLayoutRelativeToImage(groupComps) {
    const lastImageComp = _.findLast(groupComps, conversionUtils.isImageComponent);
    if (lastImageComp) {
        conversionUtils.translateComps(groupComps, -lastImageComp.layout.x, -lastImageComp.layout.y);
    }
}

function getBackgroundGroupLayout(groupComps: ComponentWithConversionData[]): Layout {
    const imageComp = _.find(groupComps, conversionUtils.isImageComponent);
    return <Layout> _.pick(imageComp.layout, ['x', 'y', 'width', 'height']);
}

function getCompsOverlayingWithComp(comp, comps) {
    if (!isComponentSuitableForProportionGrouping(comp)) {
        return [];
    }
    return _.filter(comps, (comp2: ComponentWithConversionData) => isComponentSuitableForProportionGrouping(comp2) && conversionUtils.haveSufficientOverlap(comp, comp2, 0.25));
}

let nextGroupId = 1000;

function createVirtualGroup(groupComps, isMergeVirtualGroup?): Component {
    const groupLayout = conversionUtils.getSnugLayout(groupComps);
    const id = (isMergeVirtualGroup ? 'merge_virtual_group_' : 'virtual_group_') + (++nextGroupId);

    const groupData = {
        type: 'undefined',
        id: id,
        componentType: isMergeVirtualGroup ? conversionConfig.VIRTUAL_GROUP_TYPES.MERGE : conversionConfig.VIRTUAL_GROUP_TYPES.OVERLAP,
        conversionData: {
            rescaleMethod : isMergeVirtualGroup ? 'default' : 'proportional',
            isTightContainer: true
        },
        skin: 'undefined',
        layout: groupLayout,
        originalLayout: groupLayout,
        styleId: 'undefined',
        components: groupComps
    };

    conversionUtils.translateComps(groupComps, -groupLayout.x, -groupLayout.y);

    return groupData;
}

function isVirtualGroup(comp, includeMerge: boolean = true): boolean {
    return conversionUtils.isBackgroundVirtualGroup(comp) || conversionUtils.isOverlapVirtualGroup(comp) ||
            (includeMerge && conversionUtils.isMergeVirtualGroup(comp));
}

export {
    virtualGroupHandler
};