define([], function () {
    "use strict";

    var measureMap = {};

    /**
     * @class layout.proxyLayoutRegistrar
     */
    return {

        /**
         * registers a request to measure the dom for the given proxy name.
         * The measurement's calculation result will be applied on the dom on the patch phase
         * @param proxyName - proxy name to apply patches upon
         * @param measureFunction - function which measures the dom, calculates what ever it needs and returns an array
         * of objects. Each object holds the node to patch, patch function and parameters to it
         *
         */
        registerCustomMeasure: function(proxyName, measureFunction) {
            measureMap[proxyName] = measureFunction;
        },

        /**
         * @returns {object} a map with proxy names to measure
         */
        getProxiesToMeasure: function() {
            return measureMap;
        }
    };
});
