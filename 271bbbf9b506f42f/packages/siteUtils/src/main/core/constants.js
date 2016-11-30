define([], function() {
    'use strict';
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

        DATA_TYPES: {
            data: 'data',
            prop: 'props',
            design: 'design',
            theme: 'style',
            behaviors: 'behaviors',
            connections: 'connections'
        },

        COMP_DATA_QUERY_KEYS: {
            data: 'dataQuery',
            prop: 'propertyQuery',
            design: 'designQuery',
            behaviors: 'behaviorQuery',
            connections: 'connectionQuery'
        },

        ACTION_TYPES: {
            CLICK: 'click',
            DBL_CLICK: 'dblclick',
            MOUSE_IN: 'mouseenter',
            MOUSE_OUT: 'mouseleave',
            CHANGE: 'change',
            BLUR: 'blur',
            FOCUS: 'focus',
            IMAGE_CHANGED: 'imageChanged',
            IMAGE_EXPANDED: 'imageExpanded',
            ITEM_CLICKED : 'itemClicked',
            CELL_SELECT: 'cellSelect',
            CELL_EDIT: 'cellEdit',
            ROW_SELECT: 'rowSelect',
            AUTOPLAY_OFF: 'autoplayOff',
            AUTOPLAY_ON: 'autoplayOn',
            KEY_PRESS: 'keyPress',
            SCREEN_IN: 'screenIn',
            SCROLL: 'scroll',
            VALIDATE: 'validate'
        },

        BASE_PROPS_SCHEMA_TYPE: 'DefaultProperties',

        COMP_IDS: {
            PAGE_GROUP: 'SITE_PAGES',
            PAGES_CONTAINER: 'PAGES_CONTAINER',
            HEADER: 'SITE_HEADER',
            FOOTER: 'SITE_FOOTER',
            BACKGROUND: 'SITE_BACKGROUND'
        },

        POPUP: {
            POPUP_OVERLAY_CONTAINER: {
                STYLE_ID: 'strc1',
                SKINPART_ID: 'popupOverlayContainer',
                COMPONENT_TYPE: 'wysiwyg.viewer.components.StripContainer',
                SKIN: 'wysiwyg.viewer.skins.stripContainer.DefaultStripContainer',
                TYPE: 'StripContainer'
            },
            POPUP_CONTAINER: {
                COMPONENT_TYPE: 'wysiwyg.viewer.components.PopupContainer'
            }
        },

        ACTIVE_ANCHOR: {
            DELAY_TO_END_SCROLL: 50
        },

        CURRENT_CONTEXT: 'CURRENT_CONTEXT',

        ANCHORS: {
            LOCK_THRESHOLD: 70,
            LOCK_CONDITION: {
                ALWAYS: 'always',
                NEVER: 'never',
                THRESHOLD: 'threshold'
            }
        }
    };
});
