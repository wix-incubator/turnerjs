define(['previewExtensionsCore/bi/events.json', 'lodash', 'utils'], function(events, _, utils){
    'use strict';
    var logger = utils.logger;

    /**
     * Please ctrl/cmd + click on biEvents to see the schema :)
     * @type {Object.<String, biEvent>}
     */

    logger.register('previewExtensionsCore', 'event', events);

    return events;
});
