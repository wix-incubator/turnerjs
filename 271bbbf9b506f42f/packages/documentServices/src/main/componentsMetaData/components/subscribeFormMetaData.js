define(['documentServices/constants/constants'], function(constants) {
    'use strict';

    var layoutLimitsMap = {
        'wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormBoxLayoutEnvelope': {
            minWidth: 505,
            maxWidth: 980,
            minHeight: 126,
            maxHeight: 1024
        },
        'wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormBoxLayoutFlat': {
            minWidth: 505,
            maxWidth: 980,
            minHeight: 98,
            maxHeight: 1024
        },
        'wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormBoxLayoutShiny': {
            minWidth: 505,
            maxWidth: 980,
            minHeight: 98,
            maxHeight: 1024
        },
        'wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormLineLayoutFlat': {
            minWidth: 724,
            maxWidth: 1000,
            minHeight: 85,
            maxHeight: 300
        },
        'wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormLineLayoutTransparentWithIcon': {
            minWidth: 800,
            maxWidth: 1000,
            minHeight: 81,
            maxHeight: 300
        },
        'wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormPlaceholderSkin': {
            minWidth: 235,
            maxWidth: 980,
            maxHeight: 1024
        }
    };

    var DEFAULT_LAYOUT_LIMITS = {
        minWidth: 235,
        maxWidth: 980,
        minHeight: 120,
        maxHeight: 1024
    };

    return {
        resizableSides: [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT],
        styleCanBeApplied:true,
        layoutLimits: function(ps, compPointer) {
            var skinName = ps.dal.get(ps.pointers.getInnerPointer(compPointer, 'skin'));
            return layoutLimitsMap[skinName] || DEFAULT_LAYOUT_LIMITS;
        }
    };
});
