define(['lodash', 'utils'], function (_, utils) {
    'use strict';

    var handlers = {};
    var preprocessors = {};

    var EMPTY_HANDLER = {
        handle: _.noop
    };

    function getHandler(type) {
        if (!_.has(handlers, type)) {
            utils.log.warn('there is no behavior handler for type ' + type);
            return EMPTY_HANDLER;
        }

        return handlers[type];
    }

    function registerHandler(type, handler) {
        handlers[type] = handler;
    }

    function registerBehaviorPreprocessor(type, preprocessor) {
        preprocessors[type] = preprocessor;
    }

    function getBehaviorPreprocessor(type) {
        return preprocessors[type] || _.identity;
    }

    return {
        getHandler: getHandler,
        registerHandler: registerHandler,
        registerBehaviorPreprocessor: registerBehaviorPreprocessor,
        getBehaviorPreprocessor: getBehaviorPreprocessor
    };
});
