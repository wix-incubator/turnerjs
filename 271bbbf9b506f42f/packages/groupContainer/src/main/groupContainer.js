define(['lodash', 'containerCommon'], function (_, containerCommon) {
    'use strict';

    var containerMixin = containerCommon.mixins.containerMixin;

    function getGroupStyle() {
        if (!('pointerEvents' in _.get(window, 'document.body.style'))) {
            return {
                'max-width': 0,
                'max-height': 0
            };
        }

        return {};
    }

    /**
     * @class components.WixGroupContainer
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "WixGroupContainer",
        mixins: [containerMixin],
        statics: {
            useSantaTypes: true
        },
        getSkinProperties: function () {
            return {
                "": {
                  style: getGroupStyle()
                },
                "inlineContent": {
                    children: this.props.children
                }
            };
        }
    };
});
