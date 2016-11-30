define(['lodash', 'react', 'core', 'socialCommon'], function (_, React, core, socialCommon) {
    'use strict';

    var mixins = core.compMixins;

    /**
     * @class components.FacebookShare
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'FacebookShare',
        mixins: [mixins.skinBasedComp, socialCommon.socialCompMixin],
        getUrlToBeShared: function () {
            var isSiteUrl = this.props.compData.urlChoice.toLowerCase() === 'site';
            var urlToBeShared = this.getSocialUrl(isSiteUrl);
            return encodeURIComponent(urlToBeShared);
        },
        getFacebookSharer: function () {
            return 'http://www.facebook.com/sharer.php?u=';
        },
        openSharePopup: function () {
            var name = 'wix_share_to_facebook';
            var params = 'width = 635, height = 346, scrollbars = no, status = no, toolbar = no, menubar = no, location = no';
            this.props.siteAPI.openPopup(this.getFacebookSharer() + this.getUrlToBeShared(), name, params);
        },
        getSkinProperties: function () {
            var measureMap = this.props.siteData.measureMap;

            return {
                "": {
                    style: {
                        height: measureMap && measureMap.height[this.props.id] ? measureMap.height[this.props.id] : this.props.style.height,
                        width: measureMap && measureMap.width[this.props.id] ? measureMap.width[this.props.id] : this.props.style.width
                    }
                },
                facebookShareButton: {
                    parentConst: React.DOM.a,
                    onClick: this.openSharePopup
                },
                label: {
                    children: [this.props.compData.label]
                },
                shareButton: {},
                icon: {}
            };
        }
    };
});
