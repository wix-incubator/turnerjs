'use strict';

import {errors} from 'documentServices/mobileConversion/bi/errors.json';
import * as _ from 'lodash';
import * as utils from 'utils';

var logger = utils.logger;


/**
 * Please ctrl/cmd + click on biError to see the schema :)
 * @type {Object.<String, biError>}
 */

_.forEach(errors, function (error: BIError, key: string) {
    error.errorName = key;
});

logger.register('documentServices/mobileConversion', 'error', errors);

export {
    errors
}
