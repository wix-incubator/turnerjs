define([
    'lodash',
    'documentServices/component/componentModes',
    'documentServices/dataModel/dataModel',
    'utils'
], function (_, componentModes, dataModel, utils) {
    'use strict';

    function activatePageMobileHoverModes(ps, pagePointer) {
        var pageComponentPointer = ps.pointers.components.getPage(pagePointer.id, utils.constants.VIEW_MODES.DESKTOP);
        var pageChildren = ps.pointers.components.getChildrenRecursively(pageComponentPointer);

        _(pageChildren)
            .filter(isHoverModeFoundOnComponent.bind(null, ps))
            .forEach(prepareComponentStructureForMobileAlgorithm.bind(null, ps)).value();
    }

    function prepareComponentStructureForMobileAlgorithm(ps, compPointer) {
        var mobilePointer = ps.pointers.components.getMobilePointer(compPointer);
        var hoverModeId = getComponentHoverMode(ps, compPointer).modeId;
        if (isComponentExistInMobileStructure(ps, compPointer)) {
            activateComponentModeAccordingToPropertiesData(ps, compPointer, hoverModeId);
            updateMobileStructureDesignQuery(ps, compPointer, mobilePointer);
        } else {
            componentModes.activateComponentMode(ps, compPointer, hoverModeId);
        }
    }

    function isComponentExistInMobileStructure(ps, compPointer) {
        var mobileCompPointer = ps.pointers.components.getMobilePointer(compPointer);
        return ps.dal.isExist(mobileCompPointer);
    }

    function activateComponentModeAccordingToPropertiesData(ps, compPointer, defaultModeId) {
        var propertyPointer = dataModel.getPropertyItemPointer(ps, compPointer);
        var propItem = propertyPointer && ps.dal.get(propertyPointer);
        if (propItem && propItem.mobileDisplayedModeId) {
            componentModes.activateComponentMode(ps, compPointer, propItem.mobileDisplayedModeId);
        } else {
            componentModes.activateComponentMode(ps, compPointer, defaultModeId);
        }
    }

    function isHoverModeFoundOnComponent(ps, componentPointer) {
        return !!getComponentHoverMode(ps, componentPointer);
    }

    function getComponentHoverMode(ps, componentPointer) {
        var compModeDefinitions = componentModes.getComponentModes(ps, componentPointer);
        return _.find(compModeDefinitions, 'type', 'HOVER');
    }

    function updateMobileStructureDesignQuery(ps, compPointer, mobilePointer) {
        var designQueryInDesktop = ps.dal.get(ps.pointers.getInnerPointer(compPointer, 'designQuery'));
        ps.dal.set(ps.pointers.getInnerPointer(mobilePointer, 'designQuery'), designQueryInDesktop);
    }

    return {
        activatePageMobileHoverModes: activatePageMobileHoverModes
    };
});
