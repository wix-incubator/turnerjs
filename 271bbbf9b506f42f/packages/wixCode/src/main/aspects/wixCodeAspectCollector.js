define([
    'core',
    'wixCode/aspects/WixCodeWidgetAspect',
    'wixCode/aspects/WixCodePostMessageAspect'
], function (core, WixCodeWidgetAspect, wixCodePostMessageAspect) {
    'use strict';

    var siteAspectsRegistry = core.siteAspectsRegistry;

    siteAspectsRegistry.registerSiteAspect('wixCodeWidgetAspect', WixCodeWidgetAspect);
    siteAspectsRegistry.registerSiteAspect('wixCodePostMessageAspect', wixCodePostMessageAspect);
});
