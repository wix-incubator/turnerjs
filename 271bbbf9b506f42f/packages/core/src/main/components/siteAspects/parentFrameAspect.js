define(['core/core/siteAspectsRegistry', 'lodash'], function (/** core.siteAspectsRegistry */ siteAspectsRegistry, _) {
    "use strict";

    /**
     * Notify parent frame (e.g. template viewer) of the new site height.
     * This is used when previewing a template in mobile view, in order to
     * set the custom scroll in the templates viewer.
     */
    function notifySiteHeight() {
        var measureMap = this.aspectSiteApi.getSiteAPI().getSiteData().measureMap;
        var currSiteHeight = _.get(measureMap, 'height.masterPage', 0);

        if (!currSiteHeight || currSiteHeight === this.storedHeight) {
            return;
        }

        this.storedHeight = currSiteHeight;

        var target;
        if (window.parent.postMessage) {
            target = window.parent;
        } else if (window.parent.document.postMessage) {
            target = window.parent.document;
        }

        if (target && typeof target !== "undefined") {
            target.postMessage(currSiteHeight, "*");
        }
    }

    /**
     *
     * @param {core.SiteAspectsSiteAPI} aspectSiteApi
     * @implements {core.SiteAspectInterface}
     * @constructor
     */
    function ParentFrameAspect(aspectSiteApi) {
        /** @type core.SiteAspectsSiteAPI */
        this.aspectSiteApi = aspectSiteApi;
        this.storedHeight = 0;

        aspectSiteApi.registerToDidLayout(notifySiteHeight.bind(this));
    }

    siteAspectsRegistry.registerSiteAspect('parentFrame', ParentFrameAspect);
    return ParentFrameAspect;
});
