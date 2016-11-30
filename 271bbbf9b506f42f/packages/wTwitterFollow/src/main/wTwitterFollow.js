define(['lodash', 'core', 'utils', 'santaProps', 'socialCommon'], function (_, /** core */ core, utils, santaProps, socialCommon) {
    'use strict';

    function getScreenName(compData) {
        return compData.accountToFollow.replace('@', '');
    }

    /**
     * @class components.WTwitterFollow
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'WTwitterFollow',
        mixins: [core.compMixins.skinBasedComp, socialCommon.twitterComponentMixin],
        propTypes: {
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            id: santaProps.Types.Component.id.isRequired,
            origin: santaProps.Types.Location.origin,
            santaBase: santaProps.Types.santaBase.isRequired
        },
        statics: {
            useSantaTypes: true
        },
        getIFrameSrc: function () {
            var screenName = getScreenName(this.props.compData);

            var urlParams = {
                screen_name: screenName,
                href: 'https://twitter.com/' + screenName,
                show_count: this.props.compProp.showCount.toString(),
                show_screen_name: this.props.compProp.showScreenName.toString(),
                lang: this.getLanguage(),
                align: 'left',
                compId: this.props.id,
                origin: this.props.origin,
                widgetType: 'FOLLOW'
            };

            return this.props.santaBase + '/static/external/twitter.html?' + utils.urlUtils.toQueryString(urlParams);
        }
    };
});
