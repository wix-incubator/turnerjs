define(['lodash', 'containerCommon'], function (_, containerCommon) {
    'use strict';

    var containerMixin = containerCommon.mixins.containerMixin;

    /**
     * @class components.WixContainer
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "WixContainer",

        mixins: [containerMixin],

        statics: {
            useSantaTypes: true
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
