define([], function () {
    "use strict";

    var shouldApplyAutomationAttributes = false;

    /**
     * @class wixappsCore.wixappsConfiguration
     */
    return {
        shouldApplyAutomationAttributes: function () {
            return shouldApplyAutomationAttributes;
        },

        applyAutomationAttributes: function () {
            shouldApplyAutomationAttributes = true;
        }
    };
});
