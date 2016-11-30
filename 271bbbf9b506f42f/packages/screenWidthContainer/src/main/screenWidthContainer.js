/**
 * Created by eitanr on 8/20/14.
 */
define(['lodash', 'core', 'santaProps'], function (_, /** core */ core, santaProps) {
    'use strict';
    var mixins = core.compMixins;

    /**
     * @class components.WixScreenWidthContainer
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "WixScreenWidthContainer",

        mixins: [mixins.skinBasedComp],

        propTypes: {
            isMobileView: santaProps.Types.isMobileView
        },

        statics: {
            useSantaTypes: true
        },

        getInitialState: function () {
            return {
                $displayDevice: this.props.isMobileView ? "mobileView" : ""
            };
        },

        getSkinProperties: function () {
            return {
                "inlineContent": {
                    children: this.props.children
                }
            };
        }
    };
});