define(['formCommon/bi/events.json', 'utils'], function(events, utils){
    'use strict';

    /**
     * Please ctrl/cmd + click on biEvents to see the schema :)
     * @type {Object.<String, biEvent>}
     */

    utils.logger.register('components', 'event', events);

    return events;
});
