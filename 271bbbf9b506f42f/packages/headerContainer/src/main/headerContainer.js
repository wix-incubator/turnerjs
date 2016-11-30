/**
 * Created by eitanr on 8/20/14.
 */
//TODO: move position: 'fixed' conditional styling to skin, and merge footerContainer with headerContainer
define(['lodash', 'core', 'containerCommon'], function (_, /** core */ core, containerCommon) {
    'use strict';
    var mixins = core.compMixins;
    var fixedPositionContainerMixin = containerCommon.mixins.fixedPositionContainerMixin;

    /**
     * @class components.HeaderContainer
     * @extends {components.WixScreenWidthContainer}
     * @type {{displayName: string, mixins: *[], getSkinProperties: getSkinProperties}}
     */
    return {
        displayName: "HeaderContainer",

        mixins: [mixins.skinBasedComp, fixedPositionContainerMixin],

        statics: {
            useSantaTypes: true
        },

        getSkinProperties: function () { //NOTE: see screenWidthBase.scss to see where this gets fixed/absolute position overrides from
            return {
                "": {
                    style: this.getRootStyle(this.props.style)
                },
                "inlineContent": {
                    children: this.props.children
                }
            };
        }
    };
});
