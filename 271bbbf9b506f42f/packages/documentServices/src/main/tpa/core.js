define(['core',
    'documentServices/tpa/services/tpaPostMessageService',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/tpa/utils/tpaUtils',
    'documentServices/tpa/services/experimentService'], function (core, tpaPostMessageService, clientSpecMapService, tpaUtils, experimentService) {

    'use strict';

    var siteAPI;
    var siteAspectsRegistry = core.siteAspectsRegistry;

    var tpaCoreDSAspect = function (aspectSiteAPI) {
        siteAPI = aspectSiteAPI;
    };

    siteAspectsRegistry.registerSiteAspect('tpaCoreDSAspect', tpaCoreDSAspect);

    var handlers = function (ps, msg, callback) {
        tpaPostMessageService.callHandler(ps, siteAPI, msg, callback);
    };

    var initEditor = function (ps, isInDevMode, experiments) {
        clientSpecMapService.setIsInDevMode(isInDevMode);
        experimentService.setExperiments(experiments);
    };

    return {
        handlers: handlers,
        initEditor: initEditor
    };
});
