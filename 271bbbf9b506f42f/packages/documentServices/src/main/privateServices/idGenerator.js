define(['utils'], function(utils){
    "use strict";

    return {
        getStyleIdToAdd: function (ps, componentReference, optionalSkinName, optionalStyleProperties, optionalStyleId){
            return optionalStyleId || utils.guidUtils.getUniqueId("style", "-");
        }
    };
});