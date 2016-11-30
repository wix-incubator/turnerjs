define(['lodash'], function (_) {
    'use strict';

    function runMultiple(callbacks) {
        return function () {
            var args = arguments;
            var self = this;
            _.forEach(callbacks, function (callback) {
                callback.apply(self, args);
            });
        };
    }

    return {
        runMultiple: runMultiple
    };

});
