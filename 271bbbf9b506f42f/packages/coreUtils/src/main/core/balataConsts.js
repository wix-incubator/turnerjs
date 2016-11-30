define([], function () {
    'use strict';

    return {
        BALATA: 'balata',
        MEDIA: 'media',
        IMAGE: 'image',
        BG_IMAGE: 'bgimage',
        VIDEO: 'video',
        OVERLAY: 'overlay',
        UNDERLAY: 'underlay',
        BG_COLOR: 'bgcolor',
        ZOOM_SELECTORS: ['.bgImage', '.bgVideo'],
        PARALLAX_SELECTORS: ['.bgImage', '.bgVideo'],
        REVEAL_SELECTORS: ['.bgImage', '.bgVideo'],
        BLUR_SELECTORS: ['.bgImage', '.bgVideo'],
        FADE_SELECTORS: ['.bgImage', '.bgVideo', '.bgColor', '.bgOverlay'],
        overlay: 'overlayTransforms',
        media: 'mediaTransforms'
    };
});
