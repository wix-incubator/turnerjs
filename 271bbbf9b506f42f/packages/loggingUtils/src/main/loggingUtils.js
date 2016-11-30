define([
    'loggingUtils/bi/errors',
    'loggingUtils/logger/logger',
    'loggingUtils/log/log',
    'loggingUtils/logger/performance',
    'loggingUtils/logger/newrelic'
], function (biErrors, logger, log, performance, newrelic) {
    'use strict';

    /**
     * @exports loggerUtils
     */
    var exports = {
        bi: {
            errors: biErrors
        },
        logger: logger,
        log: log,
        performance: performance,
        newrelic: newrelic
    };
    return exports;
});
