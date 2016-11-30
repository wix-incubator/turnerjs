'use strict';

import * as _ from 'lodash';
import * as theme from 'documentServices/theme/theme';
import * as conversionUtils from 'documentServices/mobileConversion/modules/conversionUtils';
import {tinyMenuLayoutHandler as tinyMenuLayoutHandlerDefinition} from 'documentServices/mobileConversion/modules/tinyMenuLayoutHandler';
import {backToTopLayoutHandler as backToTopLayoutHandlerDefinition} from 'documentServices/mobileConversion/modules/backToTopLayoutHandler';

const MOBILE_ONLY_COMPS_ID_LIST = <string[]> _.map(getMobileOnlyComponentsHandlers(), 'DEFAULT_COMP_DATA.id');

function removeMobileOnlyComponentsFromComponentIdList(componentIdList: string[]): void {
    _.remove(componentIdList, id => _.includes(MOBILE_ONLY_COMPS_ID_LIST, id));
}

function addMobileOnlyComponentIfNeeded(compId: string, structure: Component | MasterPageComponent): boolean {
    var compHandler = _.find(getMobileOnlyComponentsHandlers(), {DEFAULT_COMP_DATA: {id: compId}});
    var compContainerId = compHandler.DEFAULT_CONTAINER_ID;

    if (compContainerId === 'masterPage' || conversionUtils.getComponentByIdFromStructure(compContainerId, structure) && !conversionUtils.getComponentByIdFromStructure(compHandler.DEFAULT_COMP_DATA.id, structure)) {
        compHandler.addToStructure(structure);
        return true;
    }

    return false;
}

function addMobileOnlyComponentsOnMerge(hiddenList: string[], mobileSiteStructure: Component | MasterPageComponent): string[] {
    const compsToAdd =  _.filter(MOBILE_ONLY_COMPS_ID_LIST, compId => isOnHiddenListWhenNotExist(compId) && !_.includes(hiddenList, compId));
    return _.filter(compsToAdd, compId => addMobileOnlyComponentIfNeeded(compId, mobileSiteStructure));
}

function getHiddenMobileOnlyComponentIds(structure: Component | MasterPageComponent): string[] {
    return <string[]> _(getMobileOnlyComponentsHandlers())
        .filter(function (compHandler) {
            return !conversionUtils.getComponentByIdFromStructure(compHandler.DEFAULT_COMP_DATA.id, structure) &&
                conversionUtils.getComponentByIdFromStructure(compHandler.DEFAULT_CONTAINER_ID, structure) &&
                compHandler.ON_HIDDEN_LIST_WHEN_NOT_EXIST;
        })
        .map('DEFAULT_COMP_DATA.id')
        .value();
}

function isOnHiddenListWhenNotExist(compId: string): boolean {
    const compHandler = _.find(getMobileOnlyComponentsHandlers(), {DEFAULT_COMP_DATA: {id: compId}});
    return compHandler.ON_HIDDEN_LIST_WHEN_NOT_EXIST;
}

function addMobileOnlyComponentsOnConversion(structure: Component | MasterPageComponent) {
    _.forEach(getMobileOnlyComponentsHandlers(), function (compHandler) {
        if (compHandler.ADD_BY_DEFAULT) {
            addMobileOnlyComponentIfNeeded(compHandler.DEFAULT_COMP_DATA.id, structure);
        }
    });
}

function isMobileOnlyComponent(compId: string): boolean {
    return _.includes(MOBILE_ONLY_COMPS_ID_LIST, compId);
}

function getMobileOnlyComponentsHandlers(): MobileOnlyComponentHandler[] {
    return [
        tinyMenuLayoutHandlerDefinition(),
        backToTopLayoutHandlerDefinition()
    ];
}

function createAdditionalStylesIfNeeded(ps: ps): void {
    _.forEach(getMobileOnlyComponentsHandlers(), function (compHandler) {
        if (!compHandler.ADD_BY_DEFAULT) {
            return;
        }

        _.forOwn(compHandler.getAdditionalStyles(), (styleProps, styleId) => {
            let style = theme.styles.get(ps, styleId);

            if (style) {
                return;
            }

            style = _.assign({type: 'TopLevelStyle', styleType: 'system', 'id': styleId, metaData: {isHidden: false, isPreset: false}}, styleProps);
            theme.styles.createItem(ps, style, styleId);
        });
    });
}

export {
    addMobileOnlyComponentIfNeeded,
    addMobileOnlyComponentsOnConversion,
    addMobileOnlyComponentsOnMerge,
    getHiddenMobileOnlyComponentIds,
    isMobileOnlyComponent,
    removeMobileOnlyComponentsFromComponentIdList,
    createAdditionalStylesIfNeeded
}
