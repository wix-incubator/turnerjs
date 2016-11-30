define([
    'lodash',
    'documentServices/componentsMetaData/metaDataUtils',
    'documentServices/appControllerData/appControllerData',
    'documentServices/dataModel/dataModel'
], function (_, metaDataUtils, appControllerData, dataModel) {
    'use strict';

    var ALLOWED_PAGE_TYPES = [
        'core.components.Page',
        'mobile.core.components.Page',
        'wixapps.integration.components.AppPage'
    ];

    function isContainableByRef(ps, controllerRef, containerPointer) {
        var controllerData = dataModel.getDataItem(ps, controllerRef);
        var enableShowOnAllPages = getControllerStageData(ps, controllerRef.id, controllerData, 'enableShowOnAllPages') !== false;
        return isContainable(ps, containerPointer, enableShowOnAllPages);
    }

    function isContainableByStructure(ps, controllerStructure, containerPointer) {
        return isContainable(ps, containerPointer, true);
    }

    function isContainable(ps, containerPointer, enableShowOnAllPages) {
        var potentialContainerCompType = metaDataUtils.getComponentType(ps, containerPointer);
        var showOnAllPages = enableShowOnAllPages && metaDataUtils.isHeaderOrFooterOrPageOrMasterPage(potentialContainerCompType);
        return showOnAllPages || _.includes(ALLOWED_PAGE_TYPES, potentialContainerCompType) || metaDataUtils.isPopupPageOrPopupContainer(ps, containerPointer);
    }

    function isRemovable(ps, controllerRef) {
        var controllerData = dataModel.getDataItem(ps, controllerRef);
        return getControllerStageData(ps, controllerRef.id, controllerData, 'removable') !== false;
    }

    function isDuplicatable(ps, controllerRef) {
        var controllerData = dataModel.getDataItem(ps, controllerRef);
        return getControllerStageData(ps, controllerRef.id, controllerData, 'duplicatable') !== false;
    }

    function getControllerStageData(ps, controllerId, controllerData, path) {
        var controllerState = appControllerData.getState(ps, controllerId);
        var controllerStageDataPointer = ps.pointers.platform.getControllerStageDataPointer(controllerData.applicationId, controllerData.controllerType, controllerState);
        return ps.dal.get(ps.pointers.getInnerPointer(controllerStageDataPointer, path));
    }

    return {
        containable: isContainableByRef,
        containableByStructure: isContainableByStructure,
        container: false,
        canContain: false,
        canContainByStructure: false,
        resizableSides: [],
        alignable: false,
        hiddenable: false,
        collapsible: false,
        fullWidth: false,
        fullWidthByStructure: false,
        canBeFixedPosition: false,
        groupable: false,
        mobileConversionConfig: {
            desktopOnly: true
        },
        removable: isRemovable,
        duplicatable: isDuplicatable
    };
});
