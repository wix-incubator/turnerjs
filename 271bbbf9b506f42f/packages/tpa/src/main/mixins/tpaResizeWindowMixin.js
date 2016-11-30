define(['lodash'], function(_){
    'use strict';

    function isPercentValue(measurement) {
        return _.isString(measurement) && /^[0-9]+%$/.test(measurement);
    }

    function isValidValue(measurement) {
        return (_.isNumber(measurement) && measurement >= 0) || isPercentValue(measurement);
    }

    /**
     * @class tpa.mixins.tpaResizeWindowMixin
     */
    return {
        resizeWindow: function(width, height, callback) {
            var newState = {};
            this.registerReLayout();

            if (isValidValue(height)) {
                newState.height = height;
            }

            if (isValidValue(width)) {
                newState.width = width;
            }

            this.setState(newState, callback);
        }
    };
});
