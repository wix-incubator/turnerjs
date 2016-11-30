define([
        'core',
        'tpa/aspects/TPAWorkerAspect',
        'tpa/aspects/TPAPostMessageAspect',
        'tpa/aspects/TPAPopupAspect',
        'tpa/aspects/TPAPubSubAspect',
        'tpa/aspects/TPAPixelTrackerAspect',
        'tpa/aspects/TPAPageNavigationAspect',
        'tpa/aspects/TPAModalAspect'

    ],

    function (
        core
    ) {
        "use strict";

        var siteAspectsRegistry = core.siteAspectsRegistry;

        siteAspectsRegistry.registerSiteAspect('tpaWorkerAspect', arguments[1]);
        siteAspectsRegistry.registerSiteAspect('tpaPostMessageAspect', arguments[2]);
        siteAspectsRegistry.registerSiteAspect('tpaPopupAspect', arguments[3]);
        siteAspectsRegistry.registerSiteAspect('tpaPubSubAspect', arguments[4]);
        siteAspectsRegistry.registerSiteAspect('tpaPixelTrackerAspect', arguments[5]);
        siteAspectsRegistry.registerSiteAspect('tpaPageNavigationAspect', arguments[6]);
        siteAspectsRegistry.registerSiteAspect('tpaModalAspect', arguments[7]);
    });