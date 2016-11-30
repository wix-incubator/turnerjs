define(['coreUtils'], function (coreUtils) {
    'use strict';

    var balataConsts = coreUtils.balataConsts;

    return {
        createChildBalataSkinData: function(parentStyleId){
            return {
                skin: 'skins.viewer.balata.balataBaseSkin',
                styleId: parentStyleId + balataConsts.BALATA
            };
        },
        createChildBalataProps: function(parentId, parentBehaviors, parentCompDesign, compActions){
            return {
                ref: balataConsts.BALATA,
                id: parentId + balataConsts.BALATA,
                structureComponentId: parentId,
                behaviors: parentBehaviors,
                structure: {behaviors: parentBehaviors},
                compDesign: parentCompDesign,
                compActions: compActions
            };
        }
    };
});
