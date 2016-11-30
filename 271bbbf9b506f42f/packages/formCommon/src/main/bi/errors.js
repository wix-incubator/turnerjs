define(['formCommon/bi/errors.json', 'lodash', 'utils'], function(errors, _, utils){
    'use strict';

    /**
     * Please ctrl/cmd + click on biError to see the schema :)
     * @type {Object.<String, biError>}
     */

    _.forEach(errors, function(error, key) {
        error.errorName = key;
    });

    utils.logger.register('forms', 'error', errors);

    return errors;
});
