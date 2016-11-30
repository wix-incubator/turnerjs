define([
    'core',
    'balataCommon'
], function (core, balataCommon) {
    'use strict';

    var mixins = core.compMixins;

    return {
        displayName: "PopupContainer",
        mixins: [mixins.skinBasedComp],

        forceRedrawOnAnimationEnded: true,

        getDefaultSkinName: function () {
            return 'wysiwyg.viewer.skins.stripContainer.DefaultStripContainer';
        },

        getBackground: function () {
            return balataCommon.mubalat.createChildBalata(this, {
                compData: {
                    id: this.props.compDesign.id
                }
            });
        },

        componentWillMount: function () {
            var windowKeyboardEvent = this.props.siteAPI.getSiteAspect('windowKeyboardEvent');
            if (windowKeyboardEvent) {
                windowKeyboardEvent.registerToEscapeKey(this);
            }
        },

        componentWillUnmount: function () {
            var windowKeyboardEvent = this.props.siteAPI.getSiteAspect('windowKeyboardEvent');
            if (windowKeyboardEvent) {
                windowKeyboardEvent.unRegisterKeys(this);
            }
            this.forceRedrawOnAnimationEnded = false;
        },

        onEscapeKey: function () {
            this.props.siteAPI.closePopupPage();
        },

        getSkinProperties: function () {
            return {
                '': {
                    style: {
                        //restore pointer events after inlineContent of page component, a parent of popupContainer,
                        //got pointerEvents none to make possible click events on overlay
                        pointerEvents: 'auto'
                    }
                },
                background: this.getBackground(),
                inlineContent: {
                    children: this.props.children
                }
            };
        }
    };
});
