'use strict';
import * as _ from 'lodash';
import * as conversionUtils from 'documentServices/mobileConversion/modules/conversionUtils';
import {virtualGroupHandler} from 'documentServices/mobileConversion/modules/virtualGroupHandler';
import {removeMobileOnlyComponentsFromComponentIdList} from 'documentServices/mobileConversion/modules/mobileOnlyComponentsHandler';
import {dataUtils} from 'coreUtils';
import * as componentsMetaData from 'documentServices/componentsMetaData/componentsMetaData';
import * as constants from 'documentServices/constants/constants';

function getComponentIdToItsContainerIdMap(component: Component | MasterPageComponent) {
    var ret = {};
    var children = conversionUtils.getChildren(component);
    if (children) {
        for (var i = 0; i < children.length; i++) {
            var curChild = children[i];
            ret[curChild.id] = component.id;
            ret = _.merge(ret, getComponentIdToItsContainerIdMap(curChild));
        }
    }
    return ret;
}

function getComponentsExistingInWebsiteButNotInMobile(ps: ps): ArraysMap<string> {
    if (!hasMobileStructure(ps)) {
        return {};
    }
    const componentsExistingInWebsiteButInMobile = {};
    const pageList = ps.dal.getKeys(ps.pointers.general.getPagesData());
    _.forEach(pageList, function (pageId: string) {
        const page = ps.dal.get(ps.pointers.components.getPage(pageId, constants.VIEW_MODES.MOBILE));
        if (!page.mobileComponents) {
            return;
        }
        const comps = dataUtils.getAllCompsInStructure(page, false, comp => !_.get(componentsMetaData.public.getMobileConversionConfig(ps, comp, pageId), 'desktopOnly', false));
        const mobileComponents = dataUtils.getAllCompsInStructure(page, true);
        componentsExistingInWebsiteButInMobile[pageId] = getComponentIdsAddedToWebStructure(comps, mobileComponents, []);
    });
    return componentsExistingInWebsiteButInMobile;
}

function getReplacedCompIds(webComponents, mobileComponents) {
    return _.reduce(mobileComponents, function (result, mobileComp:any, compId) {
        if (webComponents[compId] && mobileComp.componentType && webComponents[compId].componentType !== mobileComp.componentType) {
            result.push(compId);
        }
        return result;
    }, []);
}


function getComponentIdsDeletedFromWebStructure(webComponents: Map<Component>, mobileComponents: Map<Component>): string[] {
    var componentsNewlyDeletedFromWeb = _.difference(_.keys(mobileComponents), _.keys(webComponents));
    removeMobileOnlyComponentsFromComponentIdList(componentsNewlyDeletedFromWeb);


    var replacedComps = getReplacedCompIds(webComponents, mobileComponents);

    componentsNewlyDeletedFromWeb.push.apply(componentsNewlyDeletedFromWeb, replacedComps);

    return componentsNewlyDeletedFromWeb;
}

function getComponentIdsAddedToWebStructure(webComponents: Map<Component>, mobileComponents: Map<Component>, componentIdsExplicitlyDeletedFromMobileSite: string[]): string[] {
    var componentsAppearingInWebButNotInMobile = _.difference(_.keys(webComponents), _.keys(mobileComponents));

    var replacedComps = getReplacedCompIds(webComponents, mobileComponents);

    componentsAppearingInWebButNotInMobile.push.apply(componentsAppearingInWebButNotInMobile, replacedComps);

    return _.difference(componentsAppearingInWebButNotInMobile, componentIdsExplicitlyDeletedFromMobileSite);
}

function getPreviousComponentIdThatAlsoExistInMobile(websiteComponent: Component | MasterPageComponent, websiteStructure: Component, componentId: string, mobileSiteStructure: Component): string | null {

    if (virtualGroupHandler.isVirtualGroup(websiteComponent)) {
        return getPreviousComponentIdThatAlsoExistInMobile(
            <ComponentWithConversionData | MasterPageComponent> conversionUtils.getParent(websiteComponent.id, websiteStructure),
            websiteStructure,
            websiteComponent.id,
            mobileSiteStructure
        );
    }

    const componentsOrder = <string[]> _.get(<ComponentWithConversionData> websiteComponent, ['conversionData', 'componentsOrder'], []);
    var componentIndexInOrder = componentsOrder.indexOf(componentId);
    for (var i = componentIndexInOrder - 1; i >= 0; i--) {
        var curComponentId = componentsOrder[i];

        if (curComponentId === 'PAGES_CONTAINER') {
            continue;
        }

        var curComponent = _.find(conversionUtils.getChildren(websiteComponent), {id: curComponentId});

        if (conversionUtils.getComponentByIdFromStructure(curComponentId, mobileSiteStructure)) {
            return curComponentId;
        } else if (virtualGroupHandler.isVirtualGroup(curComponent)) {
            for (var j = 0; j < curComponent.components.length; j++) {
                const componentOrder = <string> _.get(curComponent, ['conversionData', 'componentsOrder', j]);
                if (conversionUtils.getComponentByIdFromStructure(componentOrder, mobileSiteStructure)) {
                    return componentOrder;
                }
            }
        }
    }

    return null;
}

function hasMobileStructure(ps: ps): boolean {
    var masterPagePointer = ps.pointers.components.getMasterPage(constants.VIEW_MODES.MOBILE);
    return !_.isEmpty(ps.pointers.components.getChildren(masterPagePointer));
}

function getAncestorContainerExistingInMobile(componentId: string, websiteStructure: Component | MasterPageComponent, mobileSiteStructure: Component | MasterPageComponent): Component | MasterPageComponent {
    var componentIdToItsContainerIdMap = getComponentIdToItsContainerIdMap(websiteStructure);
    var currentParentId = componentIdToItsContainerIdMap[componentId];
    var parent = conversionUtils.getComponentByIdFromStructure(currentParentId, mobileSiteStructure);
    while (!parent) {
        currentParentId = componentIdToItsContainerIdMap[currentParentId];
        parent = conversionUtils.getComponentByIdFromStructure(currentParentId, mobileSiteStructure);
    }
    return parent;
}

export {
    getComponentsExistingInWebsiteButNotInMobile,
    getComponentIdsDeletedFromWebStructure,
    getComponentIdsAddedToWebStructure,
    getPreviousComponentIdThatAlsoExistInMobile,
    getAncestorContainerExistingInMobile,
    hasMobileStructure
}
