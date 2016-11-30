define(['lodash', 'react', 'core', 'utils', 'components/bi/events'], function (_, React, /** core */ core, utils, biEvents) {
    'use strict';

    var logger = utils.logger;

    /**
     * @class components.mobileAppBanner
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "MobileAppBanner",
        mixins: [core.compMixins.skinBasedComp],

        propTypes: {
            siteData: React.PropTypes.object.isRequired,
            bannerModel: React.PropTypes.object.isRequired,
            appDownloadUrl: React.PropTypes.string.isRequired,
            closeBanner: React.PropTypes.func.isRequired
        },

        componentDidMount: function () {
            var siteData = this.props.siteData;
            // report bi
            logger.reportBI(siteData, biEvents.MOBILE_APP_BANNER_SHOWN, {
                metaSiteId: siteData.getMetaSiteId(),
                type: 'MobileAppBannerBasicSkin'
            });
        },

        getSkinProperties: function () {
            var skinProps = {
                "": {
                    id: this.props.id,
                    key: this.props.key,
                    ref: this.props.id
                },
                "container": {
                    "data-device": this.getDevice(this.props.siteData)
                },
                "close": {
                    onClick: this.closeBannerClicked
                },
                "appname": {
                    children: [this.props.bannerModel.appName]
                },
                "getlink": {
                    href: this.props.appDownloadUrl,
                    onClick: this.getAppClicked
                },
                "iconbody": {
                    style: {
                        backgroundImage: "url(" + this.props.bannerModel.iconUrl + ")"
                    }
                }
            };
            return skinProps;
        },

        getAppClicked: function () {
            var siteData = this.props.siteData;
            // report bi
            logger.reportBI(siteData, biEvents.MOBILE_APP_BANNER_GET_CLICKED, {
                metaSiteId: siteData.getMetaSiteId(),
                link: this.props.appDownloadUrl
            });
        },

        closeBannerClicked: function () {
            // set the cookie to make sure we don't display the banner next time
            var siteData = this.props.siteData;
            this.props.closeBanner();
            // report bi
            logger.reportBI(siteData, biEvents.MOBILE_APP_BANNER_CLOSE_CLICKED, {
                metaSiteId: siteData.getMetaSiteId()
            });
        },

        getDevice: function (siteData) {
            if (siteData.mobile.isAppleMobileDevice()) {
                return "apple";
            }
            if (siteData.mobile.isAndroidMobileDevice()) {
                return "android";
            }
            return "other";
        }

    };
});
