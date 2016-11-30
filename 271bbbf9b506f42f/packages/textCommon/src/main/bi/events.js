define(['utils', 'textCommon/bi/events.json'], function(utils, events){
    'use strict';
    var logger = utils.logger;


    /**
     * Please ctrl/cmd + click on biEvents to see the schema :)
     * @type {Object.<String, biEvent>}
     */

    logger.register('core', 'event', events);

    return events;
});
