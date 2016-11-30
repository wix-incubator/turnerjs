define(['lodash', 'santaProps', 'utils', 'experiment'], function (_, santaProps, utils, experiment) {
    'use strict';

    var compType = 'wysiwyg.viewer.components.MobileAppBanner';

    function getBannerStructure() {
        return {
            id: 'MOBILE_APP_BANNER',
            skin: 'wysiwyg.viewer.skins.MobileAppBannerBasicSkin',
            componentType: compType,
            styleId: 'mobileAppBanner',
            layout: {
                position: 'static'
            }
        };
    }

    function removeTrailingSlashes(str) {
      if (!_.isString(str)) {
        return str;
      }
      return str.replace(/\/+$/, '');
    }

    // contract: download url is on the site at http://site.com/app
    var generateAppDownloadUrl = function (siteData) {
        return removeTrailingSlashes(siteData.getExternalBaseUrl()) + '/app';
    };

    var COOKIE_NAME = 'wixMobileAppBanner';
    var COOKIE_TIMEOUT_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

    var cookieUtils = utils.cookieUtils;

    function hasStringValue(str) {
        return _.isString(str) && !_.isEmpty(str);
    }

    return {

        shouldShowMobileAppBanner: function (siteData) {
            var experimentOpenOnMobile = experiment.isOpen('mobileAppBannerOnMobile');
            var experimentOpenOnDesktop = experiment.isOpen('mobileAppBannerOnDesktop');

            if (this.isHidden || !experimentOpenOnMobile && !experimentOpenOnDesktop) {
                return false;
            }

            // bugfix, when shown in our native apps, forceLandingPage=1 and we don't want to show the banner
            if (siteData.isPageLandingPage(siteData.getPrimaryPageId())) {
                return false;
            }

            if (!this.getMobileAppBannerModel(siteData)) {
                return false;
            }
            if (this.doesHideBannerCookieExist()) {
                return false;
            }

            if (siteData.isMobileView() && experimentOpenOnMobile) {
                return true;
            }
            if (!siteData.isMobileView() && experimentOpenOnDesktop) {
                return true;
            }

            return false;
        },

        // returns null if model not found
        getMobileAppBannerModel: function (siteData) {
            /* example model:
             return {
             appName: "Toxic Void",
             iconUrl: "https://static.wixstatic.com/media/6083e67e999345c5aa1aafc7db76022b.jpg_256"
             };
             */
            var app = siteData.getClientSpecMapEntriesByType('mobileapp')[0];
            if (!app || !hasStringValue(app.name) || !hasStringValue(app.iconUrl)) {
                return null;
            }
            return {
                appName: app.name,
                iconUrl: app.iconUrl
            };
        },

        setHideBannerCookie: function (siteData) {
            var cookieValue = new Date().toGMTString();
            cookieUtils.setCookie(COOKIE_NAME, cookieValue, COOKIE_TIMEOUT_MS, siteData.currentUrl.hostname, siteData.getMainPagePath(), false);
            // bufix, some times (IE11), the cookie might now be saved due to unexplained path issues, let's try to read it
            if (!cookieUtils.getCookie(COOKIE_NAME)) {
                cookieUtils.setCookie(COOKIE_NAME, cookieValue, COOKIE_TIMEOUT_MS, siteData.currentUrl.hostname, undefined, false);
            }
        },

        doesHideBannerCookieExist: function () {
            return !_.isUndefined(cookieUtils.getCookie(COOKIE_NAME));
        },

        closeBanner: function(siteAPI){
            var siteData = siteAPI.getSiteData();
            this.isHidden = true; //should be moved to runtimeDal / displayedJSON once their experiments are merged. currently this is a singleton for all sites
            this.setHideBannerCookie(siteData);
            siteAPI.forceUpdate();
        },

        getMobileAppBannerComponent: function (siteAPI) {
            var siteData = siteAPI.getSiteData();
            if (!this.shouldShowMobileAppBanner(siteData)) {
                return undefined;
            }

            var props = santaProps.componentPropsBuilder.getCompProps(getBannerStructure(), siteAPI);
            props.siteData = siteData;
            props.bannerModel = this.getMobileAppBannerModel(siteData);
            props.appDownloadUrl = generateAppDownloadUrl(siteData);
            props.closeBanner = this.closeBanner.bind(this, siteAPI);
            var mobileAppBannerConstructor = utils.compFactory.getCompClass(compType);
            return mobileAppBannerConstructor(props);
        }

    };

});
