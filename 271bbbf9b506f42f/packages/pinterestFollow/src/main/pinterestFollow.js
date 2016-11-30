define(['core', 'lodash', 'santaProps'], function (/** core */core, _, santaProps) {
    'use strict';

    var mixins = core.compMixins;
    var getPinterestUrl = function (urlChoice) {
        var protocols = ['https://', 'http://', '//'];
        var hasProtocol = _.some(protocols, _.contains.bind(null, urlChoice));
        return hasProtocol ? urlChoice : _.last(protocols) + urlChoice;
    };

    /**
     * @class components.PinterestFollow
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'PinterestFollow',
        mixins: [mixins.skinBasedComp],

        propTypes: {
            compData: santaProps.Types.Component.compData.isRequired
        },

        statics: {
            useSantaTypes: true
        },

        getSkinProperties: function () {
            return {
                followButtonTag: {
                    children: [this.props.compData.label],
                    style: {'display': 'inline-block'}
                },
                followButton: {
                    href: getPinterestUrl(this.props.compData.urlChoice),
                    target: '_blank'
                }
            };
        }
    };
});
