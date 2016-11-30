define([
    'lodash',
    'documentServices/componentsMetaData/metaDataUtils',
    'documentServices/constants/constants',
    'documentServices/page/popupUtils'
], function(
    _,
    metaDataUtils,
    constants,
    popupUtils
) {
    'use strict';

    var PAGE_COMP_TYPES = [
        'mobile.core.components.Page',
        'core.components.Page',
        'wixapps.integration.components.AppPage'
    ];

    function isContainable(ps, comp, containerPointer) {
        if (containerPointer) {
            var containerCompType = metaDataUtils.getComponentType(ps, containerPointer);
            var pagePointer;

            pagePointer = ps.pointers.components.getPageOfComponent(containerPointer);
            return _.includes(PAGE_COMP_TYPES, containerCompType) && !popupUtils.isPopup(ps, pagePointer.id);
        }

        return false;
    }

    var metaData = {
        resizableSides: [],
        moveDirections: [constants.MOVE_DIRECTIONS.VERTICAL],
        containable: isContainable,
        containableByStructure: isContainable,
        fullWidth: true,
        fullWidthByStructure: true,
        hiddenable: false,
        collapsible: false,
        mobileConversionConfig: {
            isInvisible: true
        }
    };

    return metaData;
});
