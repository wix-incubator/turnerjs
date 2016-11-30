define(['lodash', 'core', 'utils', 'socialCommon'], function (_, /** core */core, utils, socialCommon) {
    'use strict';

    var mixins = core.compMixins;
    var urlUtils = utils.urlUtils;

    /**
     * @class components.WTwitterTweet
     * @extends {core.skinBasedComp}
     */
    return {

        displayName: "WTwitterTweet",
        mixins: [mixins.skinBasedComp, socialCommon.twitterComponentMixin, socialCommon.socialCompMixin],
        getIFrameSrc: function () {
            var urlParams = {
                href: 'https://twitter.com/share',
                lang: this.getLanguage(),
                url: this.getSocialUrl(this.props.rootId === 'masterPage'),
                text: this.props.compData.defaultText,
                related: this.props.compData.accountToFollow,
                compId: this.props.id,
                origin: utils.urlUtils.origin(),
                widgetType: 'TWEET'
            };

            if (this.props.siteData.isMobileView()) {
                urlParams.size = 'l';
            }

            return this.props.siteData.santaBase + "/static/external/twitter.html?" + urlUtils.toQueryString(urlParams);
        }
    };
});
