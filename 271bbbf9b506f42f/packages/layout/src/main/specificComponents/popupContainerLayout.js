define([
    'lodash',
    'layout/util/layout',
    'layout/util/popupContainerDocking',
    'layout/specificComponents/containerAndScreenWidthLayout',
    'layout/specificComponents/balataLayout'
], function(
    _,
    /** layout.layout*/layout,
    popupContainerDocking,
    containerAndScreenWidthLayout,
    balataLayout
){
    'use strict';

    function measurePopupContainer(id, measureMap, nodesMap, siteData, structureInfo){
        containerAndScreenWidthLayout.measureContainer(id, measureMap, nodesMap, siteData, structureInfo);
        popupContainerDocking.measure(id, measureMap, nodesMap, siteData, structureInfo);

        //the size and position of the root
        var compProps = structureInfo.propertiesItem;
        measureMap.width['ROOT_' + structureInfo.rootId] = compProps.alignmentType === 'fullWidth' ?
            siteData.getSiteWidth() :
            measureMap.width[id];
        measureMap.left['ROOT_' + structureInfo.rootId] = Math.floor(measureMap.left[id] - siteData.getSiteX());
    }

    function patchPopupContainer(id, patchers, measureMap, structureInfo, siteData){
        popupContainerDocking.patch(id, patchers, measureMap, structureInfo, siteData);
    }

    layout.registerMeasureChildrenFirst("wysiwyg.viewer.components.PopupContainer", true);
    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.PopupContainer', [["inlineContent"]].concat(balataLayout.BALATA_PATHS_TO_REQUEST_MEASURE));
    layout.registerRequestToMeasureDom('wysiwyg.viewer.components.PopupContainer');
    layout.registerCustomMeasure('wysiwyg.viewer.components.PopupContainer', measurePopupContainer);
    layout.registerSAFEPatcher('wysiwyg.viewer.components.PopupContainer', patchPopupContainer);
});
