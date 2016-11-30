define(["wixappsCore"], function (wixapps) {
    "use strict";

    var logicFactory = wixapps.logicFactory;

    /**
     * @class wixappsClassics.TwoLevelCategoryLogic
     * @param partApi
     * @constructor
     */
    function TwoLevelCategoryLogic (partApi) {
        this.partApi = partApi;
    }

    TwoLevelCategoryLogic.prototype = {
        getViewVars: function () {
            return {
                toggleState: 'off'
            };
        }
    };

    // Register for FAQ part
    logicFactory.register("f2c4fc13-e24d-4e99-aadf-4cff71092b88", TwoLevelCategoryLogic);
});
