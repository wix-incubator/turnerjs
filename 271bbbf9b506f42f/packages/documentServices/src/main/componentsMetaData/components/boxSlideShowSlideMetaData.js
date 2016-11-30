/**
 * Created by talm on 17/08/15.
 */
define(['documentServices/componentsMetaData/metaDataUtils'], function (metaDataUtils) {
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
        canContain: canContain.bind(null, false),
        canContainByStructure: canContain.bind(null, true)
    };
});
