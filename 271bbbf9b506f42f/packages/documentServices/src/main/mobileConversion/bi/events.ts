'use strict';

import {events} from 'documentServices/mobileConversion/bi/events.json';
import * as utils from 'utils';

var logger = utils.logger;

/**
 * Please ctrl/cmd + click on biEvents to see the schema :)
 * @type {Object.<String, biEvent>}
 */
logger.register('documentServices/mobileConversion', 'event', events);

export {
    events
}
