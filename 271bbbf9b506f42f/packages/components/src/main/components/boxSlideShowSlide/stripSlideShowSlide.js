define([
    'lodash',
    'balataCommon',
    'containerCommon'
    ],
function (_, balataCommon, containerCommon) {
    'use strict';

    var containerMixin = containerCommon.mixins.containerMixin;

    /**
     * @class components.StripContainerSlideShowSlide
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "stripSlideShowSlide",
        mixins: [containerMixin],

        getBackground: function () {
            return balataCommon.mubalat.createChildBalata(this);
        },

        getSkinProperties: function () {
            return {
                "": {
                    onMouseEnter: this.props.onMouseEnter,
                    onMouseLeave: this.props.onMouseLeave,
                    'data-flexibleboxheight': this.props.flexibleBoxHeight,
                    'data-parent-id': this.props.parentId,
                    'data-min-height': this.props.minHeight
                },
                background: this.getBackground(),
                inlineContent: {
                    children: this.props.children
                },
                inlineContentParent: {
                    style: {
                        overflowX: this.props.shouldHideOverflowContent ? 'hidden' : 'visible',
                        overflowY: this.props.shouldHideOverflowContent && !this.props.flexibleBoxHeight ? 'hidden' : 'visible'
                    }
                }
            };
        }
    };
});
