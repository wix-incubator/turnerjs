define(['core', 'santaProps'], function (/** core */ core, santaProps) {
    'use strict';

    var mixins = core.compMixins;

    function getAccountName(compData) {
        return compData.accountToFollow || 'wix';
    }

    /**
     * @class components.TwitterFeed
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @extends {core.skinInfo}
     * @property {comp.properties} props
     */
    return {
        displayName: 'TwitterFeed',
        mixins: [mixins.skinBasedComp, mixins.skinInfo],

        propTypes: {
            compData: santaProps.Types.Component.compData.isRequired
        },

        statics: {
            useSantaTypes: true
        },

        getSkinProperties: function () {
            var accountName = getAccountName(this.props.compData);

            return {
                'label': {
                    children: accountName
                },
                'link': {
                    href: 'https://twitter.com/intent/user?screen_name=' + accountName

                }
            };
        }
    };
});