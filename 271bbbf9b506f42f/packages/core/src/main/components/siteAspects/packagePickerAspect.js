/**
 * Created by alexandergonchar on 8/11/14.
 */
define(['core/core/siteAspectsRegistry', 'utils'], function (/** core.siteAspectsRegistry */ siteAspectsRegistry, utils) {
    'use strict';

    function getFrameTarget (event) {
        var frames = window.document.getElementsByTagName('iframe');
        var frameId = 0;
        var framesLength = frames.length;

        for (; frameId < framesLength; frameId++) {
            if (frames[frameId].src.indexOf(event.origin) === 0) {
                return frames[frameId];
            }
        }

        return null;
    }

    function sendHashDataToPremium(event){
        var frameSource = getFrameTarget(event);
        if (frameSource !== null){
            frameSource.contentWindow.postMessage(window.location.hash, "*");
        } else {
            utils.log.error("Unable to find premium packagePicker iframe source");
        }
    }

    function handlePostMessage(event) {
        event = event.data ? event : event.originalEvent; // race condition with jQuery event wrapper
        switch (event.data) {
            case "openUserLoginMessage":
                this.siteAPI.getSiteAspect('LoginToWix').openLoginToWixForm("https://users.wix.com/wix-users/login/form?postLogin=/upgrade/website", false);
                break;
            case "sendHashDataToPremium":
                sendHashDataToPremium(event);
                break;
        }
    }

    /**
     * @constructor
     * @param {core.SiteAspectsSiteAPI} aspectSiteApi
     *
     */
    function PackagePickerAspect(aspectSiteApi) {
        this.siteAPI = aspectSiteApi;
        aspectSiteApi.registerToMessage(handlePostMessage.bind(this));
    }

    PackagePickerAspect.prototype = {
        setSelected: function (ppComp) {
            this.selectedPackagePickerId = ppComp.props.id;
            this.siteAPI.forceUpdate();
        },
        isPackagePickerSelected: function (ppComp) {
            return this.selectedPackagePickerId && ppComp.props.id === this.selectedPackagePickerId;
        }
    };

    siteAspectsRegistry.registerSiteAspect('PackagePickerAspect', PackagePickerAspect);
});
