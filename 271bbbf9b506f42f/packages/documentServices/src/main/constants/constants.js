define(['utils'], function (utils) {
    'use strict';

    /**
     *  @exports documentServices/constants/constants
     */
    return {
        /**
         * @enum {string} documentServices.viewMode.VIEW_MODES
         */
        VIEW_MODES: {
            /**
             * @property {string}
             */
            DESKTOP: 'DESKTOP',
            /**
             * @property {string}
             */
            MOBILE: 'MOBILE'
        },
        ANCHORS: {
            LOCK_THRESHOLD: 70,
            LOCK_CONDITION: {
                ALWAYS: 'always',
                NEVER: 'never',
                THRESHOLD: 'threshold'
            }
        },
        DOM_ID_PREFIX: {
            DESKTOP: '',
            MOBILE: 'mobile_'
        },
        RESIZE_SIDES: {
            TOP: 'RESIZE_TOP',
            LEFT: 'RESIZE_LEFT',
            BOTTOM: 'RESIZE_BOTTOM',
            RIGHT: 'RESIZE_RIGHT'
        },
        MOVE_DIRECTIONS: {
            HORIZONTAL: 'HORIZONTAL_MOVE',
            VERTICAL: 'VERTICAL_MOVE',
            UP: 'MOVE_UP'
        },
        COMP_TYPES: {
            PAGE: 'Page',
            MASTER_PAGE: 'Document',
            HEADER: 'wysiwyg.viewer.components.HeaderContainer',
            FOOTER: 'wysiwyg.viewer.components.FooterContainer'
        },
        COMP_IDS: {
            PAGE_GROUP: 'SITE_PAGES',
            PAGES_CONTAINER: 'PAGES_CONTAINER',
            HEADER: 'SITE_HEADER',
            FOOTER: 'SITE_FOOTER',
            BACKGROUND: 'SITE_BACKGROUND'
        },
        PERMISSIONS: {
            EDIT_REVISIONS: 'html-editor.edit-revisions',
            EDIT: 'html-editor.edit',
            SAVE: 'html-editor.save',
            PREVIEW: 'html-editor.preview',
            PUBLISH: 'html-editor.publish',
            UNPUBLISH:'html-editor.unpublish',
            VIEW_REVISIONS: 'html-editor.view-revisions'
        },
        POPUPS: {
            DEFAULT_DELAY: 2
        },
        HERO_IMAGE: {
          MIN_HEIGHT: 7
        },
        /**
         * @class documentServices.mainMenu.ITEM_TYPES
         * @enum {string} item types enum
         */
        MENU_ITEM_TYPES: {
            /** @property {string}*/
            PAGE: 'page',
            /** @property {string}*/
            LINK: 'link',
            /** @property {string}*/
            HEADER: 'header'
        },
        SITE_STRUCTURE: utils.siteConstants.MASTER_PAGE_ID,
        MASTER_PAGE_ID: utils.siteConstants.MASTER_PAGE_ID,
        SITE_SEGMENTS_GAP_THRESHOLD: 20,
        JSON_TYPES: {
            FULL: 'fullJson',
            DISPLAYED: 'siteData'
        },
        COMP_ALIGNMENT_OPTIONS: {
            LEFT: 'left',
            RIGHT: 'right',
            CENTER: 'center',
            TOP: 'top',
            BOTTOM: 'bottom',
            MIDDLE: 'middle'
        },
        COMP_DISTRIBUTION_OPTIONS: {
            BOTH: 'verticalAndHorizontal',
            VERTICAL: 'vertical',
            HORIZONTAL: 'horizontal'
        },
        COMP_MATCH_SIZE_OPTIONS: {
            WIDTH: 'width',
            HEIGHT: 'height',
            BOTH: 'heightAndWidth'
        },
        URLS: {
            MAX_LENGTH: 40
        }
    };
});
