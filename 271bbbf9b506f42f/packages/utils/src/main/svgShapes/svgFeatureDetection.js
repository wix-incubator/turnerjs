define(['lodash'], function (_) {
    'use strict';

    var flags = {
        /**
         * checks if the browser supports vector-effect attribute
         * @type {boolean}
         */
        isVectorEffect: false
    };

    /**
     * Check once for browser support and store on global features support object
     */
    function checkWEBPSupport(featureSupportObj) {
        featureSupportObj.isVectorEffect = 'vectorEffect' in window.document.documentElement.style;
    }

    if (typeof document !== 'undefined') {
        checkWEBPSupport(flags);
    }

    function getFlags() {
        return _.clone(flags);
    }

    return {
        flags: getFlags
    };

});
