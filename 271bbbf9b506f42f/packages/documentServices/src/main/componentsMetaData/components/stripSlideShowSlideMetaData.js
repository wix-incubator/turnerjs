define(['documentServices/constants/constants', 'documentServices/componentsMetaData/metaDataUtils'], function (constants, metaDataUtils) {
    'use strict';

    function canContain(isByStructure, ps, componentPointer, potentialContainee){
        if (potentialContainee) {
            var containeeCompType = isByStructure ? potentialContainee.componentType : metaDataUtils.getComponentType(ps, potentialContainee);
            return metaDataUtils.isComponentSuitableForNonRenderingState(containeeCompType);
        }

        return false;
    }

    return {
        enforceContainerChildLimitsByWidth: false,
        enforceContainerChildLimitsByHeight: false,
        moveDirections: [constants.MOVE_DIRECTIONS.VERTICAL],
        resizableSides: [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.BOTTOM],
        fullWidth: true,
        fullWidthByStructure: true,
        canContain: canContain.bind(null, false),
        canContainByStructure: canContain.bind(null, true),
        mobileConversionConfig: {
            isScreenWidth: true,
            filterChildrenWhenHidden: true,
            preserveAspectRatio: false
        }
    };
});
