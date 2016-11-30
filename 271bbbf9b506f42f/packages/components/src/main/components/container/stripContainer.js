define([
    'core',
    'balataCommon',
    'backgroundCommon'
],
function (/** core **/ core, balataCommon, backgroundCommon) {
    'use strict';
    var mixins = core.compMixins;

    /**
     * @class components.StripContainer
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "StripContainer",
        mixins: [mixins.skinBasedComp, backgroundCommon.mixins.backgroundDetectionMixin],

        getDefaultSkinName: function () {
            return 'wysiwyg.viewer.skins.stripContainer.DefaultStripContainer';
        },

        getBackground: function () {
            return balataCommon.mubalat.createChildBalata(this);
        },

        getSkinProperties: function () {
            return {
                '': {
                    onClick: this.props.onClick
                },
                background: this.getBackground(),
                inlineContent: {
                    children: this.props.children
                }
            };
        }
    };
});
