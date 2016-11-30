define([], function () {
    'use strict';

    return {

        GLOBAL_IMAGE_QUALITY: 'IMAGE_QUALITY',
        GLOBAL_IMAGE_QUALITY_PROPERTIES: ['quality', 'unsharpMask'],
        MASTER_PAGE_ID: 'masterPage',
        HEADER_ID: 'SITE_HEADER',
        FOOTER_ID: 'SITE_FOOTER',
        SITE_STRUCTURE_ID: 'masterPage',
        SAME_PAGE_SCROLL_ANCHORS: ["SCROLL_TO_TOP", "SCROLL_TO_BOTTOM"],
        PAGES_CONTAINER_ID: 'PAGES_CONTAINER',
        SITE_PAGES_ID: 'SITE_PAGES',
        COMP_SIZE: {
            MIN_WIDTH: 5,
            MIN_HEIGHT: 5,
            MAX_WIDTH: 2500,
            MAX_HEIGHT: 15000
        },
        COMP_MODES_TYPES: {
            'HOVER': 'HOVER',
            'SCROLL': 'SCROLL',
            'WIDTH': 'WIDTH',
            'DEFAULT': 'DEFAULT'
        },
        URL_FORMATS: {
            SLASH: 'slash',
            HASH_BANG: 'hashBang'
        },
        DEFAULT_PAGE_URI_SEO: 'untitled',
        DEFAULT_POPUP_URI_SEO_PREFIX: 'popup-',
        BRIGHTNESS_DIFF_THRESHOLD: 20,
        FREE_DOMAIN: {
            WIXSITE: 'wixsite.com',
            WIX: 'wix.com'
        },
        Animations: {
            Modes: {
                AnimationType: {
                    ENTER: 'enter',
                    LEAVE: 'leave',
                    TRANSITION: 'transition'
                }
            },
            TimingFunctions: {
                EaseInOut: 'cubic-bezier(0.420, 0.000, 0.580, 1.000)'
            },
            TransitionType: {
                SCALE: 'Scale',
                NO_SCALE: 'NoScale',
                NO_DIMESIONS: 'NoDimensions'
            }
        }
    };
});
