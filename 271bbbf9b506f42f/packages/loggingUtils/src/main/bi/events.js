define(['loggingUtils/bi/events.json', 'loggingUtils/logger/logger'], function(events, logger){
    'use strict';

    /**
     * Please ctrl/cmd + click on biEvents to see the schema :)
     * @type {Object.<String, biEvent>}
     */

    logger.register('utils', 'event', events);

    return events;
});
