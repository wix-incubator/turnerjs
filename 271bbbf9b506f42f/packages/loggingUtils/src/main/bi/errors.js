define(['loggingUtils/bi/errors.json', 'lodash', 'loggingUtils/logger/logger'], function(errors, _, logger){
    'use strict';

    /**
     * Please ctrl/cmd + click on biError to see the schema :)
     * @type {Object.<String, biError>}
     */

    _.forEach(errors, function(error, key) {
        error.errorName = key;
    });

    logger.register('utils', 'error', errors);

    return errors;
});
