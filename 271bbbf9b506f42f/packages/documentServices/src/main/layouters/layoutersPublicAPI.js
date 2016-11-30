define(['documentServices/layouters/layouters',
        'documentServices/utils/utils'], function(layouters, dsUtils){
    "use strict";
    return {
        methods: {
            layouters: {
                getMasterChildren: layouters.getMasterChildren,
                getNonMasterChildren: layouters.getNonMasterChildren,
                isMasterChild: layouters.isMasterChild,
                canBeMasterChild: layouters.canBeMasterChild,
                getParentCompWithOverflowHidden: layouters.getParentCompWithOverflowHidden,
                toggleMasterChild: {dataManipulation: layouters.toggleMasterChild, isUpdatingAnchors: dsUtils.YES}
            }
        }
    };
});

