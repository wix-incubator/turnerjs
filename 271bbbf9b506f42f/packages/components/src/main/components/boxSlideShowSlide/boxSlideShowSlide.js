define(['lodash', 'balataCommon', 'containerCommon'], function (_, balataCommon, containerCommon) {
    'use strict';

    var containerMixin = containerCommon.mixins.containerMixin;

    /**
     * @class components.boxSlideShowSlide
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "boxSlideShowSlide",
        mixins: [containerMixin],
        getSkinProperties: function () {
            var refData = {
                "": {
                    'data-shouldhideoverflowcontent': this.props.shouldHideOverflowContent && !this.props.flexibleBoxHeight,
                    onMouseEnter: this.props.onMouseEnter,
                    onMouseLeave: this.props.onMouseLeave,
                    'data-flexibleboxheight': this.props.flexibleBoxHeight,
                    'data-parent-id': this.props.parentId,
                    'data-min-height': this.props.minHeight
                },
                "inlineContent": {
                    children: this.props.children
                }
            };

            refData.background = balataCommon.mubalat.createChildBalata(this);
            return refData;
        }
    };
});
