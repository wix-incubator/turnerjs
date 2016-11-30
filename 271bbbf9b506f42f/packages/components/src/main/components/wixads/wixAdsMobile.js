define(['lodash', 'utils', 'core'], function (_, utils, /** core */ core) {
    'use strict';

    /**
     * @class components.WixAdsMobile
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */
    return {
        displayName: "WixAdsMobile",
        mixins: [core.compMixins.skinBasedComp],

        getInitialState: function () {
            this._onClickHandler = this.onClickOverridenHandler || this.onAdClick;
            return {
                $viewerState: "mobile"
            };
        },

        shouldShowMobileWixAds: function(){
            var siteData = this.props.siteData;

            // ==========================================
            // for automation team only! (show mobile ads on landscape desktop view with mocked mobile mode activated)
            // ==========================================

            var showMobileViewQueryParam = _(siteData.currentUrl.query).keys().find(function(key){
                return key.toLowerCase() === 'showmobileview';
            });
            var showMobileViewForceFromUrl = utils.stringUtils.isTrue(siteData.currentUrl.query[showMobileViewQueryParam]);
            // ==========================================

            var isWixAdsAllowed = this.props.siteData.renderFlags.isWixAdsAllowed;

            var isZoomOpen = this.props.siteAPI.isZoomOpened();

            var isPortrait = siteData.isMobileDevice() ? siteData.mobile.isPortrait() : true;

            var isPremium = siteData.isPremiumUser();

            var showWixAds = !isPremium && isWixAdsAllowed && isPortrait && !isZoomOpen;

            return showMobileViewForceFromUrl || showWixAds;
        },

        getSkinProperties: function () {
            var showWixAds = this.shouldShowMobileWixAds();
            var generalStyles = {display: showWixAds ? "block" : "none"};

            return {
                "": {
                    style: {
                        height: showWixAds ? 30 : 0
                    }
                },
                mobileAd: {
                    onClick: this._onClickHandler,
                    style: generalStyles
                },
                mobileAdLink: {},
                mobileAdImg: {
                    style: {
                        height: showWixAds ? 30 : 0
                    },
                    src: this.props.siteData.serviceTopology.staticMediaUrl + '/' + this.props.adData.footerLabel
                }
            };
        },

        onAdClick: function () {
            window.location.href = this.props.adData.adUrl;
        }
    };
});
