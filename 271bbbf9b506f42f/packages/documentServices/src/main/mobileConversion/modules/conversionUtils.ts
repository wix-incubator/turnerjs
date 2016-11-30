'use strict';

import * as _ from 'lodash';
import * as core from 'core';
import {objectUtils} from 'coreUtils';
import * as constants from 'documentServices/constants/constants';
import {conversionConfig} from 'documentServices/mobileConversion/data/conversionConfig';

function isMergeVirtualGroup(comp):boolean {
    return _.get(comp, 'componentType') === conversionConfig.VIRTUAL_GROUP_TYPES.MERGE;
}

function isBackgroundVirtualGroup(comp):boolean {
    return _.get(comp, 'componentType') === conversionConfig.VIRTUAL_GROUP_TYPES.BACKGROUND;
}

function isOverlapVirtualGroup(comp):boolean {
    return _.get(comp, 'componentType') === conversionConfig.VIRTUAL_GROUP_TYPES.OVERLAP;
}

function isDesktopOnlyComponent(component:ComponentWithConversionData):boolean {
    return _.get(component, ['conversionData', 'desktopOnly'], false);
}

function isTextComponent(component:ComponentWithConversionData):boolean {
    return _.get(component, ['conversionData', 'category']) === 'text';
}

function isPopupContainer(component:Component):boolean {
    return component && (component.componentType === 'wysiwyg.viewer.components.PopupContainer');
}

function isGroupComponent(component:Component):boolean {
    return component && (component.componentType === 'wysiwyg.viewer.components.Group');
}

function isSlideShowComponent(component:Component):boolean {
    return component && core.componentUtils.boxSlideShowCommon.isBoxOrStripSlideShowComponent(component.componentType);
}

function isSlideShowSlideComponent(component:Component):boolean {
    return component && core.componentUtils.boxSlideShowCommon.isBoxOrStripSlideShowSlideComponent(component.componentType);
}

function isHoverBox(component:Component):boolean {
    return component && component.componentType === 'wysiwyg.viewer.components.HoverBox';
}

function isColumnsContainerComponent(component:ComponentWithConversionData):boolean {
    return _.get(component, ['conversionData', 'category']) === 'columns';
}

function isVisualComponent(component:ComponentWithConversionData):boolean {
    return _.get(component, ['conversionData', 'category']) === 'visual';
}

function isImageComponent(component:ComponentWithConversionData):boolean {
    return _.get(component, ['conversionData', 'category']) === 'photo';
}

function getComponentCategory(component:ComponentWithConversionData):string {
    return _.get(component, ['conversionData', 'category'], '');
}

function isMasterPage(component:Component | MasterPageComponent):component is MasterPageComponent {
    return _.get(component, 'id') === 'masterPage';
}

function canBeNestedTo(component):boolean {
    return component &&
        !isGroupComponent(component) &&
        !isSlideShowComponent(component) &&
        !isSlideShowSlideComponent(component) &&
        !(isColumnsContainerComponent(component) && _.size(component.components) !== 1) &&
        !(isHoverBox(component));

}

function isContainer(component:Component | MasterPageComponent):boolean {
    return _.includes(conversionConfig.CONTAINER_TYPES, component.type);
}

function shouldStretchToScreenWidth(component:ComponentWithConversionData):boolean {
    const shouldStretchHorizontally = (comp) => _.get(comp.conversionData, 'stretchHorizontally', false) || _.some(comp.components, shouldStretchHorizontally);
    return shouldStretchHorizontally(component) || _.get(component.conversionData, 'isScreenWidth', false) || isSiteSegmentOrPage(component);
}

function isScreenWidthComponent(component:ComponentWithConversionData):boolean {
    return _.get(component.conversionData, 'isScreenWidth', false) || _.some(component.components, isScreenWidthComponent);
}

function translateComps(comps:Component[], x:number = 0, y:number = 0):void {
    _.forEach(comps, function (comp) {
        comp.layout.x += x;
        comp.layout.y += y;
    });
}

function reparentComponent(parent:Component | MasterPageComponent, newChild:Component, index?:number):void {
    addComponentsTo(parent, [newChild], index);
    translateComps([newChild], -parent.layout.x, -parent.layout.y);
}

function addComponentsTo(container:Component | MasterPageComponent, components:Component[], index?:number):void {
    const children = getChildren(container);

    if (components.length && children) {
        index = index !== undefined ? index : children.length;
        children.splice.apply(children, (<any[]> [index, 0]).concat(<any[]> components));
    }
}

function removeChildrenFrom(container:Component | MasterPageComponent, componentsToRemove:Component[]):void {
    const children = getChildren(container);
    _.remove(children, child => _.includes(componentsToRemove, child));
}

function removeGroup(group:Component, groupParent:Component) {
    if (!isGroupComponent(group)) {
        return;
    }

    const groupIndex = _.findIndex(groupParent.components, {id: group.id});

    _.forEach(group.components.reverse(), function (curGroupedComponent) {
        addComponentsTo(groupParent, [curGroupedComponent], groupIndex);
        translateComps([curGroupedComponent], group.layout.x, group.layout.y);
    });
    _.remove(groupParent.components, group);
}

function shouldHaveTightYMargin(container) {
    if (_.get(container.conversionData, 'isTightContainer')) {
        return true;
    }

    if (_.isEmpty(getChildren(container))) {
        return true;
    }

    return _.get(container.conversionData, 'isTransparentContainer') && (container.conversionData.siblingCount === 0 || _.get(container.conversionData, 'category') !== 'column');
}

function getHeightAccordingToChildren(container:ComponentWithConversionData, children?:Component[], enforceShrinkEvenWithNoChildren?:boolean):number|undefined {
    let bottomMargin = 0;

    if (isMasterPage(container)) {
        return;
    }

    if (!children || (!enforceShrinkEvenWithNoChildren && _.isEmpty(children))) {
        return;
    }

    const lowestChildBottom = _(children)
        .reject(isInvisibleComponent)
        .reduce((lowest, child) => Math.max(lowest, child.layout.y + child.layout.height), 0);

    if (!shouldHaveTightYMargin(container) && !_.get(container.conversionData, 'tightBottomMargin')) {
        bottomMargin = shouldStretchToScreenWidth(container) ? conversionConfig.SECTION_MOBILE_MARGIN_Y : conversionConfig.COMPONENT_MOBILE_MARGIN_Y + _.get(container.conversionData, 'borderWidth', 0);
    }

    return lowestChildBottom + bottomMargin;
}

function ensureContainerTightlyWrapsChildren(container:Component, children?:Component[], enforceShrinkEvenWithNoChildren?:boolean, defaultMinHeight:number = 0):void {
    const heightByChildren = getHeightAccordingToChildren(<ComponentWithConversionData>container, children, enforceShrinkEvenWithNoChildren);
    if (_.isNumber(heightByChildren)) {
        const minHeight = _.get(container, ['conversionData', 'minHeight'], defaultMinHeight);
        container.layout.height = Math.max(minHeight, heightByChildren);
    }
}

function isSiteSegmentOrPage(component:ComponentWithConversionData):boolean {
    return isPageComponent(component) || isSiteSegment(component);
}

function isInvisibleComponent(component:Component):boolean {
    return _.get(component, 'componentType') === 'wysiwyg.common.components.anchor.viewer.Anchor';
}

function isPageComponent(component:Component):boolean {
    return component.type === 'Page';
}

function isSiteSegment(component:ComponentWithConversionData):boolean {
    return _.get(component.conversionData, 'category') === 'siteSegments';
}

function extractMobileStructure(pagesData:Map<PageData>):Map<PageData> {
    const mobilePagesData = objectUtils.cloneDeep(pagesData);
    _.forOwn(mobilePagesData, (mobilePageData, pageId) => {
        const page = pagesData[pageId].structure;
        const mobilePage = mobilePageData.structure;
        const childrenPropertyName = mobilePage.components ? 'components' : 'children';
        _.set(mobilePage, childrenPropertyName, page.mobileComponents || []);
    });
    return mobilePagesData;
}

function getComponentByIdFromStructure(componentId:string, component:Component | MasterPageComponent):Component | MasterPageComponent | null {
    if (component.id === componentId) {
        return <Component>component;
    }
    let res = null;
    _.find(getChildren(component), (comp) => {
        res = getComponentByIdFromStructure(componentId, comp);
        return res;
    });
    return res;
}

function unifyGroups(groups:string[][], groupOverflowThreshold?:number):void {
    if (groups.length > groupOverflowThreshold) {
        groups.length = 0;
        return;
    }
    const haveCommonElements = (arr1, arr2) => _.size(_.intersection(arr1, arr2)) > 0;
    for (let i = groups.length - 1; i >= 0; i--) {
        let j = _.findLastIndex(groups, (group, index) => index < i && haveCommonElements(groups[i], group));
        if (j !== -1) {
            groups[j] = groups[j].concat(_.difference(groups[i], groups[j]));
            groups.splice(i, 1);
        }
    }
}

function getComponentsByIds(container:Component | MasterPageComponent, compIds:string[]):Component[] {
    const children = getChildren(container);
    return _.map(compIds, id => _.find(children, {id}) || null);
}

function getParent(componentId:string, root:Component | MasterPageComponent):Component | MasterPageComponent | null {
    const children = getChildren(root);
    if (_.find(children, {id: componentId})) {
        return root;
    }
    let parent = null;
    _.find(children, child => {
        parent = getParent(componentId, child);
        return parent;
    });
    return parent;
}

function getSnugLayout(components:Component[]):Layout {
    if (!components || components.length === 0) {
        return undefined;
    }
    const mostLeft = <number> _.min(_.map(components, 'layout.x'));
    const mostTop = <number> _.min(_.map(components, 'layout.y'));
    const mostRight = _.max(_.map(components, c => c.layout.x + c.layout.width));
    const mostBottom = _.max(_.map(components, c => c.layout.y + c.layout.height));
    return {
        x: mostLeft,
        y: mostTop,
        width: mostRight - mostLeft,
        height: mostBottom - mostTop,
        rotationInDegrees: 0
    };
}

function getTinyMenuDefaultPosition():{ x:number; y:number; rotationInDegrees:number; } {
    return {
        x: conversionConfig.MOBILE_WIDTH - (conversionConfig.TINY_MENU_SIZE + conversionConfig.SITE_SEGMENT_PADDING_X),
        y: conversionConfig.SECTION_MOBILE_MARGIN_Y,
        rotationInDegrees: 0
    };
}

function getChildren(comp:Component | MasterPageComponent):Component[] {
    return (<Component> comp).components || (<MasterPageComponent> comp).children;
}

function getRangesOverlap(range1:number[] = [], range2:number[] = []) {
    const getSortedRangesOverlap = (r1, r2) => Math.min(r1[1], r2[1]) - r2[0];
    return range1[0] <= range2[0] ? getSortedRangesOverlap(range1, range2) : getSortedRangesOverlap(range2, range1);
}

function getYOverlap(comp1:Component, comp2:Component):number {
    const getYProjection = (comp) => [comp.layout.y, comp.layout.height + comp.layout.y];
    return getRangesOverlap(getYProjection(comp1), getYProjection(comp2));
}

function getXOverlap(comp1:ComponentWithConversionData, comp2:ComponentWithConversionData):number {
    if (isScreenWidthComponent(comp1)) {
        return comp2.layout.width;
    }
    if (isScreenWidthComponent(comp2)) {
        return comp1.layout.width;
    }
    const getXProjection = (comp) => [comp.layout.x, comp.layout.width + comp.layout.x];
    return getRangesOverlap(getXProjection(comp1), getXProjection(comp2));
}

const getArea = (component:Component) => component.layout.width * component.layout.height;

function hasGreaterArea(comp1, comp2) {
    if (isScreenWidthComponent(comp1)) {
        return comp1.layout.height >= comp2.layout.height || getArea(comp1) > getArea(comp2);
    }
    if (isScreenWidthComponent(comp2)) {
        return false;
    }
    return getArea(comp1) > getArea(comp2);
}

function haveSufficientOverlap(comp1:ComponentWithConversionData, comp2:ComponentWithConversionData, overlapToMinAreaRationThreshold?):boolean {
    const xOverlap = getXOverlap(comp1, comp2);
    const yOverlap = getYOverlap(comp1, comp2);
    if (xOverlap <= 0 || yOverlap <= 0) {
        return false;
    }
    const overlapArea = xOverlap * yOverlap;
    const minCompArea = Math.min(getArea(comp1), getArea(comp2));
    return overlapArea > 0 && overlapArea / minCompArea >= overlapToMinAreaRationThreshold;
}

export {
    isDesktopOnlyComponent,
    isTextComponent,
    isPopupContainer,
    isGroupComponent,
    isSlideShowComponent,
    isSlideShowSlideComponent,
    isColumnsContainerComponent,
    isVisualComponent,
    isImageComponent,
    isMasterPage,
    canBeNestedTo,
    getChildren,
    isContainer,
    isScreenWidthComponent,
    reparentComponent,
    shouldStretchToScreenWidth,
    addComponentsTo,
    removeChildrenFrom,
    removeGroup,
    ensureContainerTightlyWrapsChildren,
    isSiteSegmentOrPage,
    isInvisibleComponent,
    isPageComponent,
    isSiteSegment,
    extractMobileStructure,
    getComponentByIdFromStructure,
    unifyGroups,
    getComponentsByIds,
    getParent,
    shouldHaveTightYMargin,
    getSnugLayout,
    getTinyMenuDefaultPosition,
    getHeightAccordingToChildren,
    getComponentCategory,
    isMergeVirtualGroup,
    isOverlapVirtualGroup,
    isBackgroundVirtualGroup,

    translateComps,
    hasGreaterArea,
    haveSufficientOverlap,
    getYOverlap,
    getXOverlap
}
