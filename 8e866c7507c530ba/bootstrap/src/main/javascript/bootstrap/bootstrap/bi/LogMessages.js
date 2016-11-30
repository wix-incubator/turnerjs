(function (window, undefined) {
    window.wixLogLegend = (function () {
        var pk = function () {
        };

        // Set legend categories
        var categories = {};
        categories.type = {'error': 10, 'timing': 20, 'funnel': 30, 'userAction': 40};
        categories.category = {'editor': 1, 'viewer': 2, 'core': 3, 'server': 4};
        categories.issue = {'defaultVal': 0, 'components': 1, 'managers': 2, 'modal': 4, 'timing': 5, 'skins': 6};
        categories.severity = {'recoverable': 10, 'warning': 20, 'error': 30, 'fatal': 40};

        // Copy categories to pk
        for (var cat in categories) {
            pk[cat] = categories[cat];
        }

        // return the label of a param according to the value
        pk.getKey = function (category, value) {
            category = categories[category] || {};
            for (var item in category) {
                if (value == category[item]) {
                    return item;
                }
            }
            return '';
        };

        return pk;
    })();

// Set shortcut for wixLogLegend
    var l = wixLogLegend;

    window.wixEvents = {
        // Editor funnel
        EDITOR_FLOW_OPEN_NEW: {
            'desc': 'FLOW: Mobile editor launch with new site',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 100,
            'timerId': 'main',
            'callLimit': 1
        },
        EDITOR_FLOW_OPEN_EDIT: {
            'desc': 'FLOW: Mobile editor launch with existing site',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 107,
            'timerId': 'main',
            'callLimit': 1
        },
        EDITOR_FLOW_TEMPLATE_CHOSEN: {
            'desc': 'FLOW: Mobile editor template chosen',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 102,
            'timerId': 'main',
            'callLimit': 1
        },
        EDITOR_FLOW_CATEGORY_CHOSEN: {
            'desc': 'FLOW: Mobile editor category chosen',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 103,
            'timerId': 'main',
            'callLimit': 1
        },
        EDITOR_FLOW_EDIT_PAGE: {
            'desc': 'FLOW: Mobile editor edit page step from new site',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 105,
            'timerId': 'main',
            'callLimit': 1
        },
        EDITOR_FLOW_PUBLISH_PAGE: {
            'desc': 'FLOW: Mobile editor publish page step',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 104,
            'timerId': 'main',
            'callLimit': 1
        },
        EDITOR_FLOW_CONGRATS_PAGE: {
            'desc': 'FLOW: Mobile editor congrats page step',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 101,
            'timerId': 'main',
            'callLimit': 1
        },

        EDITOR_SWITCH_TO_MOBILE_MODE: {
            'desc': 'FLOW: Editor switched to Mobile mode.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 401,
            'biAdapter': 'hed'
        },

        EDITOR_SWITCH_TO_DESKTOP_MODE: {
            'desc': 'FLOW: Editor switched to Desktop mode.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 402,
            'biAdapter': 'hed'
        },

        MOBILE_EDITOR_RESET_LAYOUT_CLICKED: {
            'desc': 'FLOW: Mobile editor reset layout button clicked',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 411,
            'biAdapter': 'hed'
        },

        MOBILE_EDITOR_RESET_LAYOUT_CONFIRM: {
            'desc': 'FLOW: Mobile editor reset layout action confirmed',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 412,
            'biAdapter': 'hed'
        },

        MOBILE_EDITOR_RESET_LAYOUT_CANCELED: {
            'desc': 'FLOW: Mobile editor reset layout action canceled',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 413,
            'biAdapter': 'hed'
        },

        MOBILE_EDITOR_MOBILE_VIEW_PANEL_SHOW: {
            'params': {'p1': 'params.src'},
            'desc': 'FLOW: Mobile editor shows Mobile View panel.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 421,
            'biAdapter': 'hed'
        },

        MOBILE_EDITOR_MOBILE_VIEW_ON: {
            'desc': 'FLOW: Mobile editor, Mobile View is optimized (On).',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 422,
            'biAdapter': 'hed'
        },

        MOBILE_EDITOR_MOBILE_VIEW_OFF: {
            'desc': 'FLOW: Mobile editor, Mobile View is not-optimized (Off).',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 423,
            'biAdapter': 'hed'
        },

        MOBILE_EDITOR_REORDER_LAYOUT: {
            'desc': 'FLOW: Mobile editor re-ordering the mobile page layout.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 431,
            'biAdapter': 'hed'
        },

        MOBILE_EDITOR_RESTORE_DELETED_COMPONENT: {
            'params': {'c1': 'params.id'},
            'desc': 'FLOW: Mobile editor restoring/reshowing removed/hidden component from the stage.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 441,
            'biAdapter': 'hed'
        },

        MOBILE_EDITOR_HIDE_COMPONENT: {
            'desc': 'FLOW: Mobile editor hide component from the stage.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 442,
            'biAdapter': 'hed'
        },

        MOBILE_FIRST_PROPS_SPLIT_DIALOG_APPROVED: {
            'desc': 'Mobile editor property split panel - approved',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 100,
            'biAdapter': 'hed-mobile'
        },

        MOBILE_FIRST_PROPS_SPLIT_DIALOG_CANCEL: {
            'desc': 'Mobile editor property split panel - canceled',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 101,
            'biAdapter': 'hed-mobile'
        },

        MOBILE_FIRST_PROPS_RESET_DIALOG_APPROVED: {
            'desc': 'Mobile editor property reset panel - approved',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 102,
            'biAdapter': 'hed-mobile'
        },

        MOBILE_FIRST_PROPS_RESET_DIALOG_CANCEL: {
            'desc': 'Mobile editor property reset panel - canceled',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 103,
            'biAdapter': 'hed-mobile'
        },

        MOBILE_PROPS_SPLIT: {
            'desc': 'Mobile editor property split',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 104,
            'biAdapter': 'hed-mobile'
        },

        MOBILE_PROPS_RESET: {
            'desc': 'Mobile editor reset item button clicked',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 105,
            'biAdapter': 'hed-mobile'
        },

        MOBILE_TEXT_SCALING_CHANGED: {
            'params': {'c1': 'params && params.data && params.data.value +px'},
            'desc': 'Mobile editor text scaling changed via slider',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 113,
            'biAdapter': 'hed-mobile'
        },

        MOBILE_TEXT_BRIGHTNESS_CHANGED: {
            'params': {'c1': 'params && params.data && params.data.value + %'},
            'desc': 'Mobile editor text brightness changed via slider',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 114,
            'biAdapter': 'hed-mobile'
        },

        TINY_MENU_FIXED_POSITION: {
            'params': {'i1': 'Number(evt.value)'},
            'desc': 'Mobile editor tiny menu fixed position changed',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 449,
            'biAdapter': 'hed'
        },

        TINY_MENU_UNCHECK_FIXED: {
            'desc': 'Mobile editor tiny menu fixed position unchecked from popup',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 450,
            'biAdapter': 'hed'
        },

        NO_INDEX_FOR_PAGE: {
            'params': {'c1': 'pageId', 'i1':'boolean (checked/unchecked)'},
            'desc': ' User checked the the noindex checkbox for a specific page.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 522,
            'biAdapter': 'hed'
        },

        SEND_NEWSLETTER_PRESSED: {
            'desc': 'User pressed Send Newsletters button in SubscribeForm settings panel',
            'biEventId': 109,
            'biAdapter': 'hed-misc'
        },

        // Editor general actions
        ADD_PAGE: {
            'Owners': ['yotama'],
            'params': {'label':'page.name'},
            'desc': 'user selected to add a page, page not necessarily added, see --> PAGE_ADDED',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 116,
            'biAdapter': 'hed-comp'
        },
        ADD_LINK_TO_MENU: {
            'desc': 'Link added to menu',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 110,
            'biAdapter': 'hed-comp'
        },
        ADD_HEADER_TO_MENU: {
            'desc': 'Header added to menu',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId' : 111,
            'biAdapter' : 'hed-comp'
        },
        REMOVE_PAGE: {
            'params': {'i1': '1 if it is a TPA page, 0 otherwise', 'c1':'the page Id'},
            'desc': 'Page removed.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 285,
            'biAdapter': 'hed'
        },
        REMOVE_LINK_FROM_MENU: {
            'desc': 'Link removed from menu',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId' : 112,
            'biAdapter' : 'hed-comp'
        },
        REMOVE_HEADER_FROM_MENU: {
            'desc': 'Header removed from menu',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId' : 113,
            'biAdapter' : 'hed-comp'
        },
        USER_REQUESTED_PAGE_DUPLICATE: {
            'desc': 'User initiated duplicate page.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 284,
            'biAdapter': 'hed'
        },
        ADD_COMPONENT: {
            'Owners': ['yotama'],
            'desc': 'user selected to add a component, component not necessarily added, see -->COMPONENT_ADDED',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 114,
            'biAdapter': 'hed-comp'
        },
        REMOVE_COMPONENT: {
            'Owners': ['yotama'],
            'desc': 'user selected to remove component, component not necessarily removed, see --> COMPONENT_REMOVED',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 115,
            'biAdapter': 'hed-comp'
        },
        // Load times
        SITE_READY: {
            'params': {'c1': 'isNewPublishSite', 'c2':'state hash'},
            'desc': 'site ready - viewer or preview.',
            'type': l.type.timing,
            'category': l.category.viewer,
            'timerId': 'load',
            'thresholdTime': 10000,
            'thresholdError': 'SITE_READY_DELAY',
            'biEventId': 303,
            'biAdapter': 'mlt',
            "sampleRatio": 10
        },
        // Load times
        LOADING_STEPS: {
            'params': {'c1': 'id +veiwMode+ message'},
            'desc': 'loading steps(LOGGER STARTED/SITE LOADED/START LOAD SITE)',
            'type': l.type.timing,
            'category': l.category.editor,
            'timerId': 'load',
            'thresholdTime': 25000,
            'thresholdError': 'LOADING_STEPS_DELAY',
            'biEventId': 304,
            'biAdapter': 'hed'
        },

        SITE_DOM_LOADED: {
            'Owners': ['alissa'],
            'params': {'c1': 'isNewPublishSite'},
            'desc': 'Mobile site DOM loaded',
            'type': l.type.timing,
            'category': l.category.viewer,
            'timerId': 'load',
            'thresholdTime': 10000,
            'thresholdError': 'SITE_DOM_DELAY',
            'biEventId': 301,
            'biAdapter': 'mlt',
            "sampleRatio": 10
        },
        PREVIEW_READY: {
            'Owners': ['yotama'],
            'desc': 'preview ready',
            'type': l.type.timing,
            'category': l.category.viewer,
            'timerId': 'load',
            'thresholdTime': 10000,
            'thresholdError': 'PREVIEW_READY_DELAY',
            'biEventId': 121,
            'biAdapter': 'hed-mobile'
        },
        MOBILE_PREVIEW_DOM_LOADED: {
            'Owners': ['yotama'],
            'desc': 'Mobile preview DOM loaded',
            'type': l.type.timing,
            'category': l.category.viewer,
            'timerId': 'load',
            'thresholdTime': 3000,
            'thresholdError': 'MOBILE_PREVIEW_DOM_DELAY',
            'biEventId': 120,
            'biAdapter': 'hed-mobile',
            "sampleRatio": 10
        },
        EDITOR_READY: {
            'params': {'g1': 'runningExperiments', 'c2':'state hash'},
            'desc': 'Editor ready, finished loading ',
            'type': l.type.timing,
            'category': l.category.editor,
            'timerId': 'load',
            'thresholdTime': 8000,
            'thresholdError': 'EDITOR_READY_DELAY',
            'biEventId': 302,
            'biAdapter': 'mlt'
        },
        EDITOR_DOM_LOADED: {
            'params': {'g1': 'list of running experiments'},
            'desc': 'editor DOM loaded ',
            'type': l.type.timing,
            'category': l.category.editor,
            'timerId': 'load',
            'thresholdTime': 10000,
            'thresholdError': 'EDITOR_DOM_DELAY',
            'biEventId': 300,
            'biAdapter': 'mlt'
        },

        SUSPECTED_MALWARE: {
            'params': {'g1': 'hostname', 'c1':'suspicious url','c2': 'tag (img/script/link)','i1': 'num of loaded phases (should be 9)'},
            'desc': 'One of the source URLs for an img/script/link(css) object in the DOM is not in our whitelist.',
            'type': l.type.error,
            'category': l.category.editor,
            'biEventId': 106,
            'biAdapter': 'hed-misc'
        },

        RT_COLOR_CLICKED: {
            'desc': 'click more color in rich text color selector',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 199,
            'biAdapter': 'hed'
        },
        MORE_COLOR_CLICKED: {
            'desc': 'click more color in rich text color selector',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 200,
            'biAdapter': 'hed'
        },
        SAVE_BUTTON_CLICKED_IN_MAIN_WINDOW: {
            'params': {'g1': 'template ID (GUID)'},
            'desc': 'Save button was clicked in main window.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'timerId': 'load',
            'biEventId': 201,
            'biAdapter': 'hed'
        },
        CLOSE_SAVE_DIALOG_CLICKED: {
            'desc': 'click close in save dialog',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 202,
            'biAdapter': 'hed'
        },
        SAVE_CLICKED_IN_SAVE_DIALOG: {
            'desc': 'click save in save dialog',
            'type': l.type.userAction,
            'category': l.category.editor,
            'timerId': 'load',
            'biEventId': 203,
            'biAdapter': 'hed'
        },
        SAVE_START: {
            'params': {'i1': ' 0 when first save, 1 when other save', 'i2':'true when coming from publish (always ? on first save!)','c1': 'site lable, when this is a first save'},
            'desc': 'starting the actual save process with the server',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 270,
            'biAdapter': 'hed',
            'timerId': 'save'
        },
        SAVE_SUCCESS: {
            'params': {'c1': 'site lable, when this is a first save', 'i1':'0 when first save, 1 when other save','i2': 'true when coming from publish'},
            'desc': 'successfuly saved document',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 271,
            'biAdapter': 'hed',
            'timerId': 'save'
        },
        PROVISION_START: {
            'desc': 'starting the provision process, which is part of the save process (both metasite and wixapps together)',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 228,
            'biAdapter': 'hed'
        },
        PROVISION_SUCCESS: {
            'desc': 'successfuly completed the provisioning process',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 229,
            'biAdapter': 'hed'
        },
        PUBLISH_BUTTON_CLICKED_IN_MAIN_WINDOW: {
            'desc': 'click on publish button in main window',
            'type': l.type.userAction,
            'category': l.category.editor,
            'timerId': 'load',
            'biEventId': 204,
            'biAdapter': 'hed'
        },
        PUBLISH_BUTTON_CLICKED_IN_PUBLISH_DIALOG: {
            'desc': 'click publish in first publish dialog',
            'type': l.type.userAction,
            'category': l.category.editor,
            'timerId': 'load',
            'biEventId': 207,
            'biAdapter': 'hed'
        },
        UPDATE_BUTTON_CLICKED_IN_PUBLISH_DIALOG: {
            'desc': 'click update in publish dialog',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 208,
            'biAdapter': 'hed'
        },
        POST_IN_FB_CLICKED_IN_PUBLISH_SHARE_DIALOG: {
            'desc': 'click on post to FB in publish dialog',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 209,
            'biAdapter': 'hed'
        },
        POST_IN_TWITTER_CLICKED_IN_PUBLISH_SHARE_DIALOG: {
            'desc': 'click on post to FB in publish dialog',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 210,
            'biAdapter': 'hed'
        },
        SHOUTOUT_CLICKED_PROMOTE_DIALOG: {
            'desc': 'User clicked on shoutout button in promote dialog',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 146,
            'biAdapter': 'hed-misc'
        },
        DONT_SHOW_THIS_AGAIN_PROMOTE_DIALOG: {
            'desc': 'User checked "dont show this again" in promote dialog',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 147,
            'biAdapter': 'hed-misc'
        },
        PROMOTE_DIALOG_CLOSED: {
            'params': {'c1': 'x-button or esc key'},
            'desc': 'User closed promote dialog.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 148,
            'biAdapter': 'hed-misc'
        },
        PROMOTE_DIALOG_CLOSED_MAYBE_LATER: {
            'desc': 'User clicked on maybe later button in promote dialog',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 149,
            'biAdapter': 'hed-misc'
        },
        PREVIEW_BUTTON_CLICKED_IN_MAIN_WINDOW: {
            'params': {'g1': 'template ID (GUID)'},
            'desc': 'click on preview button in main window.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 211,
            'biAdapter': 'hed'
        },
        BACK_TO_EDITOR_MODE_BUTTON_CLICKED: {
            'desc': 'click on "back to editor mode" button from preview mode in main window',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 212,
            'biAdapter': 'hed'
        },
        COMPONENT_ADDED: {
            'desc': 'a component was successfully added',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 214,
            'biAdapter': 'hed'
        },
        COMPONENT_REMOVED: {
            'desc': 'component successfully removed',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 215,
            'biAdapter': 'hed'
        },
        BACKGROUND_CHANGED: {
            'desc': 'some change was made in the background ',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 219,
            'biAdapter': 'hed'
        },
        COLOR_PRESET_CHANGED: {
            'desc': 'a color preset was selected',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 220,
            'biAdapter': 'hed'
        },
        FONT_PRESET_CHANGED: {
            'desc': 'a font preset was selected',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 221,
            'biAdapter': 'hed'
        },
        ADVANCED_SEO_SETTINGS_OPENED: {
            'desc': 'Advanced SEO settings was opened',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 194,
            'biAdapter': 'hed'
        },
        PAGE_SETTINGS_VIEW_PAGE_CLICKED: {
            'desc': 'User clicked on the View Page link in the Page Settings Panel',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 107,
            'biAdapter': 'hed-misc'
        },
        PAGE_SETTINGS_TOGGLE_SEO_GROUP: {
            'params': {'i1': ' toggleOn/Off'},
            'desc': 'User clicked on SEO settings in the Page Settings Panel to toggle it open/closed.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 108,
            'biAdapter': 'hed-misc'
        },
        REDIRECT_301_OPENED_CLOSED: {
            'params': {'i1': '1 if opened, else 0'},
            'desc': 'Redirect 301 panel was opened or closed',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 130,
            'biAdapter': 'hed-misc'
        },
        REDIRECT_301_LEARN_MORE: {
            'desc': 'Redirect 301 - learn more link was clicked',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 131,
            'biAdapter': 'hed-misc'
        },
        REDIRECT_301_DOMAIN: {
            'Owners': ['Leonid'],
            'params': {'i1': '1 if premium, else 0'},
            'desc': 'Redirect 301 - Bi event sent when user selects link in editor SEO window, depending on if premium or not.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 132,
            'biAdapter': 'hed-misc'
        },
        REDIRECT_301_INVALID_CHAR: {
            'desc': 'Redirect 301 - user insert invalid char',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 133,
            'biAdapter': 'hed-misc'
        },
        REDIRECT_301_INVALID_CHAR_LEARN_MORE_CLICKED: {
            'desc': 'Redirect 301 - user clicked on learn more link when he get invalid char error',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 134,
            'biAdapter': 'hed-misc'
        },
        REDIRECT_301_ADD_NEW_ROW: {
            'params': {'c1': 'the destination page id'},
            'desc': 'Redirect 301 - added new row',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 135,
            'biAdapter': 'hed-misc'
        },
        REDIRECT_301_DELETE_ROW: {
            'desc': 'Redirect 301 - delete existed row',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 136,
            'biAdapter': 'hed-misc'
        },
        REDIRECT_301_EDIT_ROW: {
            'desc': 'Redirect 301 - edit row',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 137,
            'biAdapter': 'hed-misc'
        },
        REDIRECT_301_APPLY_EDITED_ROW: {
            'params': {'c1': 'destination page id'},
            'desc': 'Redirect 301 - apply edited row.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 138,
            'biAdapter': 'hed-misc'
        },
        REDIRECT_301_APPLY_CHANGES: {
            'params': {'i1': 'count of defined redirect pairs'},
            'desc': 'Redirect 301 - apply changes',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 139,
            'biAdapter': 'hed-misc'
        },
        USER_HEADER_METATAGS_APPLIED: {
            'desc': 'User header meta tags was applied',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 195,
            'biAdapter': 'hed'
        },
        LOCK_COMPONENT: {
            'desc': 'Click on lock/unlock component/s',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 191,
            'biAdapter': 'hed'
        },
        ADD_IMAGE_BUTTON_CLICK: {
            'desc': 'Click on add image button',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 500,
            'biAdapter': 'hed'
        },
        IMAGE_ADDED_VIA_MEDIA_GALLERY: {
            'desc': 'Image successfully added after user chooses it via Media Gallery',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 501,
            'biAdapter': 'hed'
        },
        CHANGE_IMAGE_CLICK: {
            'desc': 'Change Image click from the Image (all of the ways this can happen: FPP, Settings, Double Click)',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 502,
            'biAdapter': 'hed'
        },
        CHANGE_IMAGE_CLICK_SUCCESS: {
            'desc': 'Event when Image is successfully Changed after clicking Change Image',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 503,
            'biAdapter': 'hed'
        },
        CUSTOMIZE_BACKGROUND_OPENED: {
            'desc': 'customize background panel was opened',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 292,
            'biAdapter': 'hed'
        },
        CUSTOMIZE_FONTS_OPENED: {
            'desc': 'customize font panel was opened',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 223,
            'biAdapter': 'hed'
        },
        CUSTOMIZE_COLORS_OPENED: {
            'desc': 'customize colors panel was opened',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 224,
            'biAdapter': 'hed'
        },
        COLOR_PALETTE_INVERTED: {
            'desc': 'User initiated color palette invert.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 283,
            'biAdapter': 'hed'
        },
        PAGE_ADDED: {
            'params': {'c1': 'name of the page type. e.g. services1', 'c2':'page type group. e.g. SERVICES','g1': 'ugc page name', 'i1':'true if this is a sub page, false if not'},
            'desc': 'a page was successfully added by the user ',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 222,
            'biAdapter': 'hed'
        },
        SEO_PANEL_OPENED: {
            'desc': 'seo panel was opened',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 225,
            'biAdapter': 'hed'
        },
        SEO_WIZARD_LINK: {
            'desc': 'seo wizard was clicked',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 145,
            'biAdapter': 'hed-misc'
        },
        SEO_CHECKED_IN_SEO_PANEL: {
            'params': {'c1': 'source', 'i1':'boolean value'},
            'desc': '"allow search engines to find my site" was selected in either SEO panel or Publish dialog.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 226,
            'biAdapter': 'hed'
        },
        SHOW_IN_ALL_PAGES_SELECTED: {
            'desc': '"show in all pages" was selected',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 227,
            'biAdapter': 'hed'
        },
        HELP_CENTER_CLOSED: {
            'desc': 'help center popup closed',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 230,
            'biAdapter': 'hed'
        },
        INTRO_VIDEO_CLOSED: {
            'desc': 'user closed intro video',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 217,
            'biAdapter': 'hed'
        },
        FROM_INTRO_VIDEO_TO_HELP_CENTER: {
            'desc': 'user pressed link to help center from intro video',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 218,
            'biAdapter': 'hed'
        },
        UNDO_REDO: {
            'params': {'c1': 'action', 'c2':'source'},
            'desc': 'undo clicked.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 310,
            'biAdapter': 'hed'
        },
        MOVE_FORWARD_BACK_TOP_BOTTOM: {
            'params': {'c1': 'action', 'c2':'source'},
            'desc': 'move forward/back/top/bottom was clicked.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 311,
            'biAdapter': 'hed'
        },

        APPS_FLOW_APP_BUTTON_CLICKED: {
            'desc': 'FLOW: Apps - TPA Application button clicked',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 232,
            'timerId': 'main',
            'biAdapter': 'hed'
        },

        APPS_FLOW_SLIDESHOW_INTERACTION: {
            'desc': 'FLOW: Apps - TPA Add dialog - interaction with slideshow',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 233,
            'timerId': 'main',
            'biAdapter': 'hed'
        },

        APPS_FLOW_ADD_AS_TO_PAGE_BUTTON: {
            'desc': 'FLOW: Apps - TPA Add dialog - Add as/to page clicked',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 234,
            'timerId': 'main',
            'biAdapter': 'hed'
        },

        APPS_FLOW_ADD_DIALOG_CANCELED: {
            'desc': 'FLOW: Apps - TPA Add dialog - Add dialog canceled',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 235,
            'timerId': 'main',
            'biAdapter': 'hed'
        },

        APPS_FLOW_APP_ADDED_TO_STAGE: {
            'desc': 'FLOW: Apps - TPA Add dialog - App added to stage',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 236,
            'timerId': 'main',
            'biAdapter': 'hed'
        },

        APPS_FLOW_APP_REMOVED_FROM_STAGE: {
            'desc': 'FLOW: Apps - TPA - App removed from stage',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 231,
            'timerId': 'main',
            'biAdapter': 'hed'
        },

        APPS_FLOW_APP_SETTINGS_OPEN: {
            'desc': 'FLOW: Apps - TPA App settings opened',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 237,
            'timerId': 'main',
            'biAdapter': 'hed'
        },

        APPS_FLOW_APP_SETTINGS_CLOSE: {
            'desc': 'FLOW: Apps - TPA App settings closed',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 238,
            'timerId': 'main',
            'biAdapter': 'hed'
        },

        APPS_FLOW_APP_LOADED_ON_VIEWER: {
            'desc': 'FLOW: Apps - TPA App loaded on viewer',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 239,
            'timerId': 'main',
            'biAdapter': 'hed'
        },

        EU_COOKIE_CHECKBOX_CLICKED: {
            'desc': 'eu cookie checkbox clicked',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 240,
            'biAdapter': 'hed'
        },

        CONCURRENT_EDITING_MESSAGE_SHOWN: {
            'params': { 'c1': 'message type', 'c2': 'number of users logged in the editor', 'roles': 'user role',
                        'i1': 'number of seconds passed from editor load until message was shown', 'i2': 'true if it is the first time the message is shown'},
            'desc': 'Concurrent editing session message was shown to a user',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 306,
            'biAdapter': 'hed'
        },

        WALK_ME_LOADED: {
            'desc': 'WalkMe loaded',
            'type': l.type.timing,
            'category': l.category.editor,
            'biEventId': 241,
            'biAdapter': 'hed'
        },

        FIRST_TIME_WALK_ME_PRESENTED: {
            'desc': 'Splash screen for first time WalkMe shown to user',
            'type': l.type.timing,
            'category': l.category.editor,
            'biEventId': 242,
            'biAdapter': 'hed'
        },

        WALK_ME_BUTTON_CLICKED: {
            'desc': 'WalkMe button was clicked',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 243,
            'biAdapter': 'hed'
        },

        WALK_ME_CLOSED: {
            'desc': 'WalkThru closed by user',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 244,
            'biAdapter': 'hed'
        },

        WALK_ME_STEP_BEGUN: {
            'desc': 'WalkThru step was begun by user',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 245,
            'biAdapter': 'hed'
        },

        WALK_ME_STEP_SHOWN: {
            'desc': 'WalkThru step is shown',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 247,
            'biAdapter': 'hed'
        },

        WALK_ME_HELP_CLICKED: {
            'desc': 'User closed walkme by clicking "help"',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 248,
            'biAdapter': 'hed'
        },

        WALK_ME_MENU_CLOSED: {
            'desc': 'WalkMe main menu closed by user',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 249,
            'biAdapter': 'hed'
        },

        WELCOME_SCREEN_HELP_CENTER_CLOSED: {
            'desc': 'first time welcome screen help center closed',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 246,
            'biAdapter': 'hed'
        },
        WIXADS_CLICKED_IN_PREVIEW: {
            'desc': 'user clicked the wix ad in preview',
            'type': l.type.userAction,
            'category': l.category.viewer,
            'biEventId': 250,
            'biAdapter': 'hed'
        },
        UPGRADE_BUTTON_CLICKED: {
            'params': {'c1': 'which actual button (top bar, publish dialog, favicon, statistics)', 'i1':'1 if the site has been saved before, else 0'},
            'desc': 'The Upgrade button was clicked.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'timerId': 'load',
            'biEventId': 251,
            'biAdapter': 'hed'
        },
        TPA_UPGRADE_BUTTON_CLICKED: {
            'desc': 'user clicked the TPA upgrade button',
            'type': l.type.userAction,
            'category': l.category.viewer,
            'biEventId': 252,
            'biAdapter': 'hed'
        },
        SETTINGS_CONNECT_DOMAIN_CLICKED: {
            'params': {'i1': '0 if the site is unsaved, 1 if it is, 2 if premium'},
            'desc': 'The "Connect a domain to this Wix site" ad on the "Site address" tab in settings was clicked',
            'type': l.type.userAction,
            'category': l.category.editor,
            'timerId': 'load',
            'biEventId': 253,
            'biAdapter': 'hed'
        },
        BI_USER_COOKIES_INITIALIZED: {
            'params': {'i1': 'firstTime. i.e., it will be 1 if there we no cookies, and 0 if there was either of them (session or persistent)'},
            'desc': 'User cookies were initialized.',
            'type': l.type.funnel,
            'category': l.category.core,
            'biEventId': 254,
            'biAdapter': 'hed'
        },

        ADD_COMPONENT_CATEGORY_CLICKED: {
            'desc': 'Clicked a Component Category from the Add Component menu',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 255,
            'timerId': 'main',
            'biAdapter': 'hed'
        },

        //report every completed phase to BI
        DEPLOY_PHASE_COMPLETE: {
            'desc': 'Fired for each deployment phase that completes loading',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 331,
            'timerId': 'main',
            'biAdapter': 'mlt',
            'sampleRatio': 10
        },
        //since BI had a problem with the above generic log that only changed in the i1 and c1 arguments, the following are individual logs for each phase. hoping to remove this later on.
        DEPLOY_PHASE_COMPLETE_BOOTSTRAP: {
            'desc': 'Fired for each deployment phase that completes loading',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 332,
            'timerId': 'main',
            'biAdapter': 'mlt',
            'sampleRatio': 10
        },
        DEPLOY_PHASE_COMPLETE_LIBS: {
            'desc': 'Fired for each deployment phase that completes loading',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 333,
            'timerId': 'main',
            'biAdapter': 'mlt',
            'sampleRatio': 10
        },
        DEPLOY_PHASE_COMPLETE_CLASSMANAGER: {
            'desc': 'Fired for each deployment phase that completes loading',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 334,
            'timerId': 'main',
            'biAdapter': 'mlt',
            'sampleRatio': 10
        },
        DEPLOY_PHASE_COMPLETE_UTILS: {
            'desc': 'Fired for each deployment phase that completes loading',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 335,
            'timerId': 'main',
            'biAdapter': 'mlt',
            'sampleRatio': 10
        },
        DEPLOY_PHASE_COMPLETE_MANAGERS: {
            'desc': 'Fired for each deployment phase that completes loading',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 336,
            'timerId': 'main',
            'biAdapter': 'mlt',
            'sampleRatio': 10
        },
        DEPLOY_PHASE_COMPLETE_INIT: {
            'desc': 'Fired for each deployment phase that completes loading',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 337,
            'timerId': 'main',
            'biAdapter': 'mlt',
            'sampleRatio': 10
        },
        DEPLOY_PHASE_COMPLETE_POST_DEPLOY: {
            'desc': 'Fired for each deployment phase that completes loading',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 338,
            'timerId': 'main',
            'biAdapter': 'mlt',
            'sampleRatio': 10
        },
        DEPLOY_PHASE_COMPLETE_TEST: {
            'desc': 'Fired for each deployment phase that completes loading',
            'type': l.type.funnel,
            'category': l.category.editor,
            'biEventId': 339,
            'timerId': 'main',
            'biAdapter': 'mlt',
            'sampleRatio': 10
        },
        LOAD_PAGE_DATA: {
            'params': {'c1': 'the data as a json', 'c2':'the 10 files that took longest to load (download and parse)','i1': 'number of seconds (10 or 20)'},
            'desc': 'page loading data after 10 and 20 seconds.',
            'type': l.type.timing,
            'category': l.category.viewer,
            'biEventId': 340,
            'biAdapter': 'mlt',
            'sampleRatio': 10
        },
        LOAD_IMAGES_DATA: {
            'params': {'c1': 'json string with extra data'},
            'desc': 'images loading data after 10 seconds.',
            'type': l.type.timing,
            'category': l.category.viewer,
            'biEventId': 341,
            'biAdapter': 'mlt',
            'sampleRatio': 10
        },
        FAKE_PREMIUM: {
            'desc': 'Site removed the wix ads manually, this is a fake premium. {uid: userId, did: siteId, g1: siteLocationUrl}',
            'type': l.type.error,
            'category': l.category.viewer,
            'biEventId': 342,
            'biAdapter': 'mlt'
        },
        EMBEDDED_SITE: {
            'desc': 'This site is embedded, and does not have premium domain rights. {uid: userId, did: siteId, g1: siteLocationUrl}',
            'type': l.type.error,
            'category': l.category.viewer,
            'biEventId': 343,
            'biAdapter': 'mlt'
        },
        USER_MOVED_BETWEEN_PAGES: {
            'params': {'c1': 'page URL'},
            'desc': 'User initiated page transition, by clicking the menu in the preview, or moving to another page in the editor.',
            'type': l.type.userAction,
            'category': l.category.core,
            'biEventId': 257,
            'biAdapter': 'hed'
        },
        OPEN_HELP_CENTER_FRAME: {
            'params': {'c1': 'the origin. E.g.: TopBar, COMPONENT_PANEL_PagesContainer'},
            'desc': 'Open help center popup (either initiated by the user, or for example in FirstTimeInEditor)',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 258,
            'biAdapter': 'hed'
        },
        PERSONALIZE_COMP_STYLE_CLICK: {
            'params': {'c1': 'comp class name'},
            'desc': "User clicked on 'Personalize this <component>' in the Change Style dialog box.",
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 259,
            'biAdapter': 'hed'
        },
        EDIT_PRESET_STYLE_CLICK: {
            'params': {'c1': 'comp class name'},
            'desc': "User clicked on 'Edit Style' on one of the preset styles in the Change Style dialog box.",
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 256,
            'biAdapter': 'hed'
        },

        EDITOR_QUICK_ACTIONS_MODIFIED: {
            'params': {'c1': 'new value', 'c2':'old value','g1': 'modified field'},
            'desc': "User modified QuickActions data.",
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 260,
            'biAdapter': 'hed'
        },

        EDITOR_CONTACT_INFORMATION_MODIFIED: {
            'params': {'c1': 'new value', 'c2':'old value','g1': 'modified field'},
            'desc': "User modified ContactInformation data.",
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 261,
            'biAdapter': 'hed'
        },

        EDITOR_SOCIAL_LINKS_MODIFIED: {
            'params': {'c1': 'new value', 'c2':'old value','g1': 'modified field'},
            'desc': "User modified SocialLinks data.",
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 262,
            'biAdapter': 'hed'
        },

        EDITOR_PUBLISH_EDIT_SEO_CLICKED: {
            'desc': "In publish dialog, user clicked the 'edit seo' link",
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 268,
            'biAdapter': 'hed'
        },

        EDITOR_PUBLISH_EDIT_CONTACT_INFORMATION_CLICKED: {
            'desc': "In publish dialog, user clicked the 'edit contact information' link",
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 269,
            'biAdapter': 'hed'
        },

        EDITOR_PUBLISH_EDIT_QUICK_ACTIONS_CLICKED: {
            'desc': "In publish dialog, user clicked the 'simplify usage for mobile visitors' link",
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 272,
            'biAdapter': 'hed'
        },

        AVIARY_EDIT_IMAGE: {
            'desc': 'Report that the user clicked on "Edit Image" in the image Property Panel.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 1,
            'biAdapter': 'aviary'
        },

        AVIARY_SAVE_CHANGES: {
            'desc': 'Report that the user clicked the Save button after making some changes to the image, should be followed by an image upload.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 2,
            'biAdapter': 'aviary'
        },

        AVIARY_SAVE_NO_CHANGE: {
            'desc': 'Report that the user clicked the Save button without making changes to the image, there should be no upload afterwards.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 3,
            'biAdapter': 'aviary'
        },

        AVIARY_SAVE_SUCCESS: {
            'desc': 'Report that a full cycle of image upload the statics and to the private media was completed successfully.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 4,
            'biAdapter': 'aviary'
        },

        AVIARY_CANCEL: {
            'desc': 'Report that the user closed the aviary dialog without saving his work.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 5,
            'biAdapter': 'aviary'
        },

        AVIARY_REVERT_IMAGE: {
            'desc': 'Report that the user clicked on "Revert" in the image Property Panel.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 6,
            'biAdapter': 'aviary'
        },

        AVIARY_CANCEL_WHILE_SAVE: {
            'desc': 'Report that the user closed the aviary dialog after clicking save, while aviary saves his work.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 7,
            'biAdapter': 'aviary'
        },
        MEDIA_DIALOG_OPEN: {
            'desc': 'Media dialog opened',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 263,
            'biAdapter': 'hed'
        },
        MEDIA_DIALOG_CANCEL: {
            'desc': 'Media dialog canceled ci: selected file name, c2: selected tab id ==> list id, c3: selected file type',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 264,
            'biAdapter': 'hed'
        },
        MEDIA_DIALOG_OK: {
            'params': {'c1': 'selected file name', 'c2':'selected tab id ==> list id','c3': 'selected file type'},
            'desc': 'Media dialog closed with ok',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 265,
            'biAdapter': 'hed'
        },
        DIALOG_CLOSED: {
            'params': {'c1': 'dialogId or dialog name', 'c2':'if dialog is help dialog it should be URL of help','c3': 'reason that user closed dialog, cancel for example'},
            'desc': 'Dialog closed',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 280,
            'biAdapter': 'hed'
        },
        UPLOAD_BUTTON_PRESSED: {
            'desc': 'User pressed the upload button',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 266,
            'biAdapter': 'hed'
        },
        UPLOAD_SELECTED_FILES: {
            'params': {'c1': 'first file name', 'c2':'first file extension','i1': 'number of files to upload'},
            'desc': 'Files selected for upload',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 267,
            'biAdapter': 'hed'
        },
        MOVED_PAGE_TO_BE_SUB_PAGE: {
            'desc': 'User dragged a page to be a subpage of another page',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 273,
            'biAdapter': 'hed'
        },
        RULERS_TURNED_ON: {
            'desc': 'User clicked on the rulers toggle button to turn them on',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 274,
            'biAdapter': 'hed'
        },
        RULERS_TURNED_OFF: {
            'desc': 'User clicked on the rulers toggle button to turn them off',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 275,
            'biAdapter': 'hed'
        },
        RULERS_GUIDE_ADDED: {
            'params': {'c1': 'left if its a vertical guide and top if its a horizontal one', 'i1':'value'},
            'desc': "User added a guide on a ruler",
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 276,
            'biAdapter': 'hed'
        },
        RULERS_GUIDE_DELETED: {
            'desc': 'User deleted a guide',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 277,
            'biAdapter': 'hed'
        },
        RULERS_GUIDE_DRAGGED: {
            'desc': 'User dragged a guide on the ruler',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 278,
            'biAdapter': 'hed'
        },
        RULERS_GUIDE_CLICKED: {
            'desc': 'User clicked on a guide handle and got the popup about the delete',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 279,
            'biAdapter': 'hed'
        },
        MEDIA_GALLERY_OPEN: {
            'desc': 'User triggered MediaGallery',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 281,
            'biAdapter': 'hed'
        },
        MEDIA_GALLERY_CLOSE: {
            'desc': 'User closed MediaGallery',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 282,
            'biAdapter': 'hed'
        },
        MEDIA_GALLERY_SUCCESSFULLY_OPENED: {
            'desc': 'User closed MediaGallery',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 290,
            'biAdapter': 'hed'
        },
        CHARACTER_SET_ADDED: {
            'params': {'c1': 'the added language'},
            'desc': 'User added character set to site.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 293,
            'biAdapter': 'hed'
        },
        CHARACTER_SET_REMOVED: {
            'params': {'c1': 'the removed language'},
            'desc': 'User removed character set from site.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 294,
            'biAdapter': 'hed'
        },
        LANGUAGE_SUPPORT_OPENED: {
            'params': {'c1': 'source'},
            'desc': 'Opened language support panel.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 100,
            'biAdapter': 'hed-fonts'
        },
        FONTS_USED_ON_SITE: {
            'desc': 'Fonts used on site',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 198,
            'biAdapter': 'hed'
        },
        RENAME_PAGES_FROM_FPP: {
            'desc': 'BI event that will be sent upon clicking on the rename pages link, from Floating PP',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 197,
            'biAdapter': 'hed'
        },
        FIXED_POSITION_TOGGLED: {
            'params': {'c1': 'componentType', 'i1':'value'},
            'desc': 'BI event that will be sent upon toggling the fixed position for components that allow it',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 196,
            'biAdapter': 'hed'
        },
        TPA_UPGRADE_MODAL_OPENED: {
            'desc': 'user clicked the TPA upgrade button from TPA settings',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 286,
            'biAdapter': 'hed'
        },
        APP_MARKET_OPENED: {
            'desc': 'The app market was opened',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 287,
            'biAdapter': 'hed'
        },
        COMPONENT_ROTATED: {
            'params': {'c1': 'componentType', 'c2':'page_id'},
            'desc': 'Rotated a component with mouse.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 296,
            'biAdapter': 'hed'
        },
        ROTATION_RESET: {
            'params': {'c1': 'componentType', 'c2':'page_id'},
            'desc': 'Reset rotation angle of component.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 297,
            'biAdapter': 'hed'
        },
        CHANGE_ANGLE_THROUGH_PANEL: {
            'params': {'c1': 'componentType', 'c2':'page_id','il':'angle'},
            'desc': 'User change component angle through panel.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 298,
            'biAdapter': 'hed'
        },
        EFFECTS_MENU_OPEN: {
            'desc': 'rich text effect menu opened',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 192,
            'biAdapter': 'hed'
        },
        TEXT_EFFECT_SELECT: {
            'desc': 'rich text effect was selected',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 193,
            'biAdapter': 'hed'
        },
        SNAP_TO_TOGGLE: {
            'desc': 'snap to toggle button',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 190,
            'biAdapter': 'hed'
        },
        ANIMATIONS_DIALOG_OPENED: {
            'params': {'c1': 'compType', 'c2':'Animation Type '},
            'desc': 'Animation dialog opened.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 100,
            'biAdapter': 'ants'
        },
        ANIMATIONS_GALLERY_ANIMATION_SELECTED: {
            'params': {'c1': 'compType', 'c2':'Animation Type '},
            'desc': 'Animation dialog - animation selected',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 101,
            'biAdapter': 'ants'
        },
        ANIMATIONS_DIALOG_SAVED: {
            'params': {'c1': 'compType', 'c2':'Animation Type '},
            'desc': 'Animation dialog - animation saved',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 102,
            'biAdapter': 'ants'
        },
        ANIMATIONS_GALLERY_ANIMATION_DELETED: {
            'params': {'c1': 'compType', 'c2':'Animation Type '},
            'desc': 'Animation dialog - animation deleted )',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 103,
            'biAdapter': 'ants'
        },
        ANIMATIONS_GALLERY_QUICK_PREVIEW_BUTTON: {
            'params': {'c1': 'compType', 'c2':'Animation Type '},
            'desc': 'Animation dialog - preview button clicked',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 104,
            'biAdapter': 'ants'
        },
        OPEN_FEEDBACK_PANEL: {
            'desc': 'Click on feedback Icon',
            'type': l.type.userAction,
            'biEventId': 100,
            'biAdapter': 'fdbk'
        },
        CLOSE_FEEDBACK_PANEL: {
            'desc': 'close feedback panel',
            'type': l.type.userAction,
            'biEventId': 101,
            'biAdapter': 'fdbk'
        },
        SHARE_BUTTON_CLICKED: {
            'desc': 'Click on share feedback button',
            'type': l.type.userAction,
            'biEventId': 102,
            'biAdapter': 'fdbk'
        },
        EXIT_COMMENTS_VIEW_MODE: {
            'desc': 'Hide comments button in editor',
            'type': l.type.userAction,
            'biEventId': 103,
            'biAdapter': 'fdbk'
        },
        FEEDBACK_COMMENT_SELECTED_EDITOR: {
            'params': {'c1': 'origin of selection- comment or panel'},
            'desc': 'Comment selected in editor.',
            'type': l.type.userAction,
            'biEventId': 104,
            'biAdapter': 'fdbk'
        },
        FEEDBACK_COMMENT_DELETED_EDITOR: {
            'desc': 'Comment deleted in editor',
            'type': l.type.userAction,
            'biEventId': 105,
            'biAdapter': 'fdbk'
        },
        FEEDBACK_SHOW_COMMENTS_COMBO_PRESSED: {
            'params': {'i1': '1 if set to show, 0 otherwise'},
            'desc': 'User pressed the comments show or hide combo box.',
            'type': l.type.userAction,
            'biEventId': 106,
            'biAdapter': 'fdbk'
        },
        FEEDBACK_ADD_COMMENT_PREVIEW: {
            'desc': 'user click on add comment in preview',
            'type': l.type.userAction,
            'biEventId': 201,
            'biAdapter': 'fdbk'
        },
        FEEDBACK_COMMENT_DELETED_PREVIEW: {
            'desc': 'Comment deleted in preview',
            'type': l.type.userAction,
            'biEventId': 202,
            'biAdapter': 'fdbk'
        },
        FEEDBACK_SUBMIT_COMMENTS_PREVIEW: {
            'desc': 'User click on submit panel in preview',
            'type': l.type.userAction,
            'biEventId': 203,
            'biAdapter': 'fdbk'
        },
        FEEDBACK_SEND_COMMENTS: {
            'params': {'i1': ' number of comments sent', 'i2':'1 if submitter name exists, 0 otherwise'},
            'desc': 'User click on send button in preview.',
            'type': l.type.userAction,
            'biEventId': 204,
            'biAdapter': 'fdbk'
        },
        FEEDBACK_COMMENT_EMOTION_SELECTED: {
            'params': {'i1': '1 if emotion is happy, 0 otherwise'},
            'desc': 'User selected emotion on comment.',
            'type': l.type.userAction,
            'biEventId': 205,
            'biAdapter': 'fdbk'
        },
        FEEDBACK_USER_CLICKED_FEEDBACK_QUICKTOUR_GOT_IT: {
            'desc': 'User clicked on got it button in the feedback quick tour screen',
            'type': l.type.userAction,
            'biEventId': 206,
            'biAdapter': 'fdbk'
        },
        FEEDBACK_USER_CLICKED_WIX_ADS: {
            'params': {'c1': 'the ad that was clicked'},
            'desc': 'User of user clicked on wix ads while creating feedback.',
            'type': l.type.userAction,
            'biEventId': 207,
            'biAdapter': 'fdbk'
        },
        HIDDEN_ELEMENT_MENU_OPENED: {
            'desc': 'Hidden components list was displayed',
            'type': l.type.userAction,
            'biEventId': 101,
            'biAdapter': 'hed-comp'
        },
        HIDDEN_ELEMENT_SELECTED: {
            'params': {'c1': 'componentId', 'c2':'componentScope (possible values: "CURRENT_PAGE", "MASTER_PAGE")','g1': 'viewDevice (possible values: "MOBILE", "DESKTOP")'},
            'desc': 'User clicked on an hidden component from the list',
            'type': l.type.userAction,
            'biEventId': 102,
            'biAdapter': 'hed-comp'
        },
        APP_MARKET_TOOLTIP_DISPLAYED: {
            'desc': 'App Market tooltip is displayed',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 510,
            'biAdapter': 'hed'
        },
        SET_EDITOR: {
            'desc': 'setEditor',
            'type': l.type.timing,
            'category': l.category.editor,
            'biEventId': 345,
            'biAdapter': 'mlt'
        },
        EDITOR_COMPONENTS_READY: {
            'desc': 'Editor components',
            'type': l.type.timing,
            'category': l.category.editor,
            'biEventId': 346,
            'biAdapter': 'mlt'
        },
        COMPONENT_READY: {
            'desc': 'Editor components',
            'type': l.type.timing,
            'category': l.category.editor,
            'biEventId': 347,
            'biAdapter': 'mlt'
        },

        OPEN_EDITOR_PANEL: {
            'desc': 'Open editor panel on first level',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 511,
            'biAdapter': 'hed'
        },
        OPEN_EDITOR_SUB_PANEL: {
            'desc': 'Open editor panel on second level or more',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 512,
            'biAdapter': 'hed'
        },
        OPEN_PAGES_NAVIGATOR: {
            'desc': 'Open pages navigation dropdown on editor top bar',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 513,
            'biAdapter': 'hed'
        },
        PAGE_NAVIGATION_COMPLETED_EDITOR: {
            'params': {'c1': 'page_id', 'c2':'viewer_name'},
            'desc': 'User navigated to a page in editor',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 140,
            'biAdapter': 'hed-misc'
        },

        DESKTOP_PREVIEW_DOM_LOADED: {
            'Owners': ['Ryskin'],
            'params': {'c1':'json string with the following properties: pages -number of pages in the editor, comps -number of components in the editor (counted up to 1000)'},
            'desc': 'Fired when the live-preview DOM is loaded, reports number of pages and components in site.',
            'type': l.type.timing,
            'category': l.category.editor,
            'biEventId': 144,
            'biAdapter': 'hed-misc'
        },

        COPY_COMMAND: {
            'desc': 'Copy',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 515,
            'biAdapter': 'hed'
        },
        PASTE_COMMAND: {
            'desc': 'Paste',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 516,
            'biAdapter': 'hed'
        },
        TOGGLE_GRIDLINES_FROM_TOPBAR: {
            'desc': 'Toggle grid lines from editor top bar',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 517,
            'biAdapter': 'hed'
        },
        ADD_PAGE_ITEM_PREVIEW: {
            'desc': 'User clicks on a page template in Add Page dialog',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 519,
            'biAdapter': 'hed'
        },
        CHANGE_COMP_STYLE_BUTTON: {
            'desc': 'User clicked on Change Style button in Property Panel',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 514,
            'biAdapter': 'hed'
        },
        CLICK_ON_WIX_LOGO: {
            'desc': 'User clicks on Wix Logo',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 518,
            'biAdapter': 'hed'
        },
        ADD_PAGE_VIA_PAGES_PANEL: {
            'desc': 'User clicks Add Page in Pages Panel',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 162,
            'biAdapter': 'hed-misc'
        },
        WEBMASTER_LOGIN_SUCCESS: {
            'desc': 'User successfully logged in',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 520,
            'biAdapter': 'hed'
        },
        ORGANIZE_IMAGES_CLICKED: {
            'params': {'c1': 'initiator of the event', 'c2':'galleryConfigId'},
            'desc': 'User clicked on Organize Images',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 521,
            'biAdapter': 'hed'
        },
        USER_CLICK_HIDE_PAGE: {
            'desc': 'User clicks on hide/unhide from menu checkbox in page settings panel',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 523,
            'biAdapter': 'hed'
        },

        QUICK_TOUR_MOBILE_TUTORIAL_AUTO_START: {
            'desc': 'Tour started automatically',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 106,
            'biAdapter': 'hed-mobile'
        },

        QUICK_TOUR_MOBILE_TUTORIAL_STARTED_FROM_HELP_CENTER: {
            'desc': 'Tour started from Editor Help Center',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 107,
            'biAdapter': 'hed-mobile'
        },

        QUICK_TOUR_MOBILE_TUTORIAL_NEXT_STEP_CLICKED: {
            'params': {'i1': 'current step number'},
            'desc': 'Next step button clicked.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 108,
            'biAdapter': 'hed-mobile'
        },

        QUICK_TOUR_MOBILE_TUTORIAL_SPECIFIC_STEP_CLICKED: {
            'params': {'i1': 'current step','i2': 'requested step'},
            'desc': 'Specific step circle clicked.',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 109,
            'biAdapter': 'hed-mobile'
        },

        QUICK_TOUR_MOBILE_TUTORIAL_SKIP_CLICKED: {
            'desc': 'Skip tutorial link pressed',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 110,
            'biAdapter': 'hed-mobile'
        },

        QUICK_TOUR_MOBILE_TUTORIAL_FINISH_CLICKED: {
            'desc': 'Tutorial finished (last OK button clicked)',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 111,
            'biAdapter': 'hed-mobile'
        },

        MOBILE_BACK_TO_TOP_BUTTON_OPEN_PANEL: {
            'desc': 'Panel - User clicked to open the panel',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 115,
            'biAdapter': 'hed-mobile'
        },

        MOBILE_BACK_TO_TOP_BUTTON_TOGGLE: {
            'desc': 'Panel - Back top top switch toggled',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 116,
            'biAdapter': 'hed-mobile'
        },

        MOBILE_BACK_TO_TOP_BUTTON_PREVIEW_CLICK: {
            'desc': 'Panel - Preview link clicked',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 117,
            'biAdapter': 'hed-mobile'
        },

        MOBILE_EXIT_MOBILE_MODE_BUTTON_ADD_COMPONENT: {
            'desc': 'Exit mobile button has been added to site - Not published yet',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 118,
            'biAdapter': 'hed-mobile'
        },

        LAYOUT_DIRTY_AFTER_ENFORCE_ANCHORS: {
            'desc': 'there are still dirty comps after enforce anchors, probably wrong y order.',
            'type': l.type.userAction,
            'category': l.category.viewer,
            'biEventId': 534,
            'biAdapter': 'hed'
        },

        USER_CLICK_MOVE_TO_FOOTER_BUTTON: {
            'desc': 'User clicked on "move component to footer" button',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 100,
            'biAdapter': 'hed-comp'
        },

        CHANGE_GALLERY: {
            'desc': 'User changed gallery type',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 123,
            'biAdapter': 'mg'
        },

        LANDING_PAGE_TOGGLED_IN_PAGE_SETTINGS: {
            'desc': "User toggled the landing page option for a page",
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 105,
            'biAdapter': 'hed-misc'
        },

        BGPP_ADD_TO_OTHER_PAGES_LINK: {
            'desc': "User clicks the link to add background to other pages",
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 120,
            'biAdapter': 'hed-misc'
        },

        BGPP_ADD_TO_ALL_PAGES: {
            'desc': "User checks the Add to All Pages checkbox",
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 121,
            'biAdapter': 'hed-misc'
        },

        BGPP_ADD_TO_OTHER_PAGES_CANCEL_DIALOG: {
            'params': {'c1': 'cancel-button'/'X-button'/'esc-key'},
            'desc': "User cancels the BGPP 'Add to Other Pages' dialog operation.",
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 122,
            'biAdapter': 'hed-misc'
        },

        BGPP_ADD_TO_OTHER_PAGES_OK_DIALOG: {
            'params': {'i1': 'total of selected pages', 'i2':'total of unselected pages'},
            'desc': "User clicks OK on the BGPP 'Add to Other Pages' dialog.",
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 123,
            'biAdapter': 'hed-misc'
        },

        BGPP_DATA_CLEANUP: {
            'desc': "Cleans up BGPP Data from site for users in editor that dont have BGPP experiment opened.",
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 323,
            'biAdapter': 'hed-misc'
        },

        /*Rich Text Toolbar events Start*/
        TXT_EDITOR_FONT_SELECTION_OPEN: {
            'desc': 'User opened font selection drop down',
            'type': l.type.userAction,
            'biEventId': 100,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_FONT_SELECTED: {
            'desc': 'User selected font from drop down',
            'type': l.type.userAction,
            'biEventId': 101,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_STYLES_SELECTION_OPEN: {
            'desc': 'User opened styles selection drop down',
            'type': l.type.userAction,
            'biEventId': 102,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_STYLE_SELECTED: {
            'desc': 'User selected new style',
            'type': l.type.userAction,
            'biEventId': 103,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_FONT_SIZE_OPEN: {
            'desc': 'User opened font size drop down',
            'type': l.type.userAction,
            'biEventId': 104,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_FONT_COLOR_OPEN: {
            'desc': 'User opened font color',
            'type': l.type.userAction,
            'biEventId': 105,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_BACKGROUND_FONT_COLOR: {
            'desc': 'User opened background color',
            'type': l.type.userAction,
            'biEventId': 106,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_BOLD: {
            'desc': 'User toggled bold',
            'type': l.type.userAction,
            'biEventId': 107,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_UNDERLINE: {
            'desc': 'User toggled underline',
            'type': l.type.userAction,
            'biEventId': 108,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_ITALIC: {
            'desc': 'User toggled italic',
            'type': l.type.userAction,
            'biEventId': 109,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_REMOVE_TEXT_FORMAT: {
            'desc': 'User removed text formatting',
            'type': l.type.userAction,
            'biEventId': 110,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_LINE_HEIGHT_OPEN: {
            'desc': 'User opened line height drop down',
            'type': l.type.userAction,
            'biEventId': 111,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_CHARACTER_SPACING: {
            'desc': 'User opened character spacing drop down',
            'type': l.type.userAction,
            'biEventId': 112,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_INCREASE_INDENT: {
            'desc': 'User pressed increase indent',
            'type': l.type.userAction,
            'biEventId': 113,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_DECREASE_INDENT: {
            'desc': 'User pressed decrease indent',
            'type': l.type.userAction,
            'biEventId': 114,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_TEXT_ALIGNMENT_OPEN: {
            'desc': 'User opened text alignment drop down',
            'type': l.type.userAction,
            'biEventId': 115,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_TEXT_ALIGNMENT_CHOSEN: {
            'params': {'c1': 'alignment direction'},
            'desc': 'User aligned the text',
            'type': l.type.userAction,
            'biEventId': 124,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_BULLETS: {
            'desc': 'User pressed bulltes list',
            'type': l.type.userAction,
            'biEventId': 116,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_NUMBERRING: {
            'desc': 'User pressed numbers list',
            'type': l.type.userAction,
            'biEventId': 117,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_LEFT_TO_RIGHT: {
            'desc': 'User set text direction left to right',
            'type': l.type.userAction,
            'biEventId': 118,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_RIGHT_TO_LEFT: {
            'desc': 'User set text direction right to left',
            'type': l.type.userAction,
            'biEventId': 119,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_LINK: {
            'desc': 'User started edit link',
            'type': l.type.userAction,
            'biEventId': 120,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_REMOVE_LINK: {
            'desc': 'User removed link',
            'type': l.type.userAction,
            'biEventId': 121,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_CLOSE_PANEL: {
            'params': {'c1': 'close source "x" or clicked outside the text'},
            'desc': 'Text editor close',
            'type': l.type.userAction,
            'biEventId': 122,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_OPEN_PANEL: {
            'params': {'c1': 'open source fpp or double click'},
            'desc': 'Text editor open ',
            'type': l.type.userAction,
            'biEventId': 123,
            'biAdapter': 'hed-ck',
            'sampleRatio': 10
        },
        TXT_EDITOR_REMOVE_EMPTY_BOX: {
            'desc': 'Text editor Removed Empty Box',
            'type': l.type.userAction,
            'biEventId': 125,
            'biAdapter': 'hed-ck',
            'sampleRatio': 1
        },
        /*Rich Text Toolbar events End*/

		/*Video Panel and SearchVideo events*/
		VIDEO_SEARCH_BUTTON: {
			'desc': 'user clicks the (search videos) button',
			'biEventId': 103,
			'biAdapter': 'hed-comp'
		},

		VIDEO_VIDEOURL_UPDATED: {
			'desc': 'video url field is updated',
			'biEventId': 104,
			'biAdapter': 'hed-comp'
		},

		VIDEO_SEARCHING: {
			'desc': 'user clicks the (search) button on popup',
			'biEventId': 105,
			'biAdapter': 'hed-comp'
		},

		VIDEO_UPDATE_BUTTON: {
			'desc': 'user clicks the (update) button on settings panel',
			'biEventId': 106,
			'biAdapter': 'hed-comp'
		},

		/*Video Panel and SearchVideo events End*/

		/*Organize Images events*/

		ORGIMAGES_CLICK_CLOSE: {
			desc: 'organize images -> user clicks x',
			biEventId: 201,
			biAdapter: 'mg'
		},

		ORGIMAGES_CLICK_CANCEL: {
			desc: 'organize images -> user clicks cancel',
			biEventId: 202,
			biAdapter: 'mg'
		},

		ORGIMAGES_CLICK_CONFIRMATION: {
            params: {'data-bi-event-param': 'clicked yes/no'},
			desc: 'organize images -> user clicks on confirmation message',
			biEventId: 203,
			biAdapter: 'mg'
		},

		ORGIMAGES_CLICK_REPLACE: {
			desc: 'organize images -> user clicks replace image',
			biEventId: 204,
			biAdapter: 'mg'
		},

		ORGIMAGES_CLICK_ADD_IMAGES: {
			desc: 'organize images -> user clicks add images',
			biEventId: 205,
			biAdapter: 'mg'
		},

		ORGIMAGES_START_REORDERING: {
			desc: 'organize images -> user reorders images (only first event)',
			biEventId: 206,
			biAdapter: 'mg'
		},

		ORGIMAGES_CLICK_DELETE: {
            params: {'biEventParamm': 'is this image the default = 0/1'},
			desc: 'organize images -> user clicks delete on image',
			biEventId: 207,
			biAdapter: 'mg'
		},

		ORGIMAGES_DIALOG_LOADED: {
            params: {'c1': 'indicates new or old organize Images'},
			desc: 'organize images -> successful loading of the dialog.',
			biEventId: 208,
			biAdapter: 'mg'
		},

		ORGIMAGES_EDIT_TITLE: {
			desc: 'organize images -> user edits title field (first event)',
			biEventId: 210,
			biAdapter: 'mg'
		},

		ORGIMAGES_EDIT_DESCRIPTION: {
			desc: 'organize images -> user edits description field (only first event)',
			biEventId: 211,
			biAdapter: 'mg'
		},

		ORGIMAGES_ADD_LINK: {
			desc: 'organize images -> user add a link (only first event)',
			biEventId: 212,
			biAdapter: 'mg'
        },

        ORGIMAGES_USER_SETS_OPEN: {
            desc: 'organize images -> user opens Settings panel',
            biEventId: 129,
            biAdapter: 'mg'
        },

        ORGIMAGES_USER_SETS_ORDER_CHANGED: {
            params: {'c1': 'indicates where to put new just added images'},
            desc: 'organize images -> Images order parameter is changed',
            biEventId: 130,
            biAdapter: 'mg'
        },

        ORGIMAGES_USER_SETS_TITLES_CHANGED: {
            params: {'c1': 'indicates whether to import or not images titles from the Media Gallery'},
            desc: 'organize images -> Image Titles parameter is changed',
            biEventId: 131,
            biAdapter: 'mg'
        },

        ORGIMAGES_USER_SETS_CONFIRM: {
            desc: 'organize images -> user clicks confirmation button',
            biEventId: 132,
            biAdapter: 'mg'
        },

        ORGIMAGES_USER_SETS_CLOSE: {
            desc: 'organize images -> user clicks X button',
            biEventId: 133,
            biAdapter: 'mg'
        },

        /*END Organize Images events*/

        FORM_SUBMIT: {
            'desc': 'Form submit started',
            'biEventId': 100,
            'biAdapter': 'ugc-viewer'
        },
        FORM_SUBMIT_SUCCESS: {
            'desc': 'Form was succefuly submitted',
            'biEventId': 101,
            'biAdapter': 'ugc-viewer'
		},
        SAVE_SUCCESS_DONT_SHOW_AGAIN_CHECKED: {
            'desc': 'Save success dialog: dont show again checkbox clicked',
            'biAdapter' : 'hed-misc',
            'biEventId' : 150
        },
        PROMOTE_DIAOLOG_DONT_SHOW_AGAIN_CHECKED: {
            'desc': 'Promote your site dialog: dont show again checkbox clicked',
            'biAdapter' : 'hed-misc',
            'biEventId' : 151
        },
        CLICK_SITE_LINK_PUBLISH_SUCCESS: {
            'desc': 'Publish success dialog: site link clicked',
            'biAdapter' : 'hed-misc',
            'biEventId' : 152
        },
        PUBLISH_NOW_SAVE_SUCCESS: {
            'desc': 'Save success dialog: publish button clicked',
            'biAdapter' : 'hed-misc',
            'biEventId' : 153
        },
        SAVE_NOW_REGULAR: {
            'desc': 'First save dialog: save button clicked',
            'biAdapter' : 'hed-misc',
            'biEventId' : 154
        },
        SAVE_NOW_BEFORE_EDITING: {
            'desc': 'Save before editing dialog: save button clicked [e.g. trying to edit blog page]',
            'biAdapter' : 'hed-misc',
            'biEventId' : 155
        },
        UPGRADE_NOW_PUBLISH_SUCCESS: {
            'desc': 'Publish success dialog: upgrade button clicked',
            'biAdapter' : 'hed-misc',
            'biEventId' : 156
        },
        UPGRADE_NOW_PUBLISH_SUCCESS_WITH_CAMPAIGN: {
            'desc': 'Publish success dialog: campaign bunner was clicked',
            'biAdapter' : 'hed-misc',
            'biEventId' : 305
        },
        MAYBE_LATER_PROMOTE_DIALOG: {
            'desc': 'Promote dialog: maybe later button clicked',
            'biAdapter' : 'hed-misc',
            'biEventId' : 157
        },
        DIALOG_CLOSED_OK: {
            'desc': 'Dialog was closed by clicking on OK button',
            'biAdapter' : 'hed-misc',
            'biEventId' : 158
        },
        BLOG_MANAGER_OPEN: {
            'desc': 'open_blog_manager_click',
            'biAdapter' : 'hed',
            'biEventId' : 254
        },
        DIALOG_CLOSED_X: {
            'desc': 'Dialog was closed by clicking on X button',
            'biAdapter' : 'hed-misc',
            'biEventId' : 159
        },
        BACKGROUND_PANEL_SCROLL: {
            'desc': 'to which point the user scrolled the thumbnails list in Background Design Panel',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 125,
            'biAdapter': 'hed'
        },
        DUPLICATING_COMPONENT: {
            'desc': 'Duplicating Component',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 118,
            'biAdapter': 'hed-misc'
        },
        SHOW_NEW_EDITOR_MIGRATION_BANNER: {
            'desc': 'Show new editor migration banner',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 307,
            'biAdapter': 'hed-misc'
        },
        TRY_NEW_EDITOR_CLICKED: {
            'desc': 'User clicked on new editor migration banner',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 308,
            'biAdapter': 'hed-misc'
        },
        CLOSE_NEW_EDITOR_MIGRATION_BANNER: {
            'desc': 'Close new editor migration banner',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 309,
            'biAdapter': 'hed-misc'
        },
        music_campaign_popup_opened: {
            'desc': 'Show music campaign popup',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 310,
            'biAdapter': 'hed-misc'
        },
        music_campaign_popup_closed: {
            'desc': 'Close music campaign popup',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 313,
            'biAdapter': 'hed-misc'
        },
        music_campaign_popup_submit_clicked: {
            'desc': 'Sumit link was clicked',
            'type': l.type.userAction,
            'category': l.category.editor,
            'biEventId': 314,
            'biAdapter': 'hed-misc'
        }

		/*Organize Images events End*/
    };

    /*
     Important!
     error code should be in the next format
     core   1XXXX (a prefix of 1)
     editor 2XXXX
     server 3XXXX
     site   4XXXX

     comps          X10XX
     managers       X20XX
     utils          X30XX
     timing         X40XX
     skins          X50XX
     dependencies   X60XX
     */

    window.wixErrors = {
        /* site */
        USER_MANAGER_NOT_FOUND: {
            'errorCode': 46001,
            'desc': 'UserManager is missing',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.defaultVal,
            'severity': l.severity.error
        },
        /* server */
        SERVER_NAME_VALIDATION_FAILED: {
            'errorCode': 33001,
            'desc': 'site name validation failed',
            'type': l.type.error,
            'category': l.category.server,
            'issue': l.issue.defaultVal,
            'severity': l.severity.error
        },
        SERVER_NAME_VALIDATION_DEAD: {
            'errorCode': 33002,
            'desc': 'site name validation failed to many times',
            'type': l.type.error,
            'category': l.category.server,
            'issue': l.issue.defaultVal,
            'severity': l.severity.fatal
        },

        /* timing */
        EDITOR_DOM_DELAY: {
            'errorCode': 24001,
            'desc': 'Editor DOM not ready in time',
            'type': l.type.timing,
            'category': l.category.editor,
            'issue': l.issue.timing,
            'severity': l.severity.warning
        },
        SITE_DOM_DELAY: {
            'Owners': ['alissa'],
            'errorCode': 14001,
            'desc': 'Site DOM not ready in time(more than 25 seconds)',
            'type': l.type.timing,
            'category': l.category.viewer,
            'issue': l.issue.timing,
            'severity': l.severity.warning
        },
        MOBILE_PREVIEW_DOM_DELAY: {
            'errorCode': 14003,
            'desc': 'Preview DOM not ready in time',
            'type': l.type.timing,
            'category': l.category.viewer,
            'issue': l.issue.timing,
            'severity': l.severity.warning
        },
        PREVIEW_MANAGER_PREVIEW_TOO_LONG: {
            'errorCode': 14005,
            'desc': "Site preview took too long",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.defaultVal,
            'severity': l.severity.error,
            'callLimit': 1
        },
        RESOURCE_NOT_LOADED: {
            'errorCode': 14006,
            'params': {'p1': 'Resource Name'},
            'desc': 'Resource not loaded in time',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.defaultVal,
            'severity': l.severity.fatal,
            'callLimit': 5,
            "sampleRatio": 10
        },
        LOADING_STEPS_DELAY: {
            'errorCode': 14008,
            'desc': 'LOADING_STEPS not ready in time (more than 25 seconds)',
            'type': l.type.timing,
            'category': l.category.editor,
            'issue': l.issue.timing,
            'severity': l.severity.warning
        },
        PREVIEW_NOT_FOUND: {
            'errorCode': 14007,
            'desc': 'Preview iframe missing',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        EDITOR_READY_DELAY: {
            'errorCode': 24002,
            'desc': 'Editor has supposedly finnished loading but was not ready for another 8 seconds(at least)',
            'type': l.type.timing,
            'category': l.category.editor,
            'issue': l.issue.timing,
            'severity': l.severity.warning
        },
        SITE_READY_DELAY: {
            'errorCode': 14002,
            'desc': 'Site not ready in time',
            'type': l.type.timing,
            'category': l.category.viewer,
            'issue': l.issue.timing,
            'severity': l.severity.warning,
            "sampleRatio": 10
        },
        PREVIEW_READY_DELAY: {
            'errorCode': 14004,
            'desc': 'Preview not ready in time when loading site',
            'type': l.type.timing,
            'category': l.category.viewer,
            'issue': l.issue.timing,
            'severity': l.severity.warning,
            "sampleRatio": 10
        },
        /* general */
        UNKNOWN_ERROR: {
            'errorCode': 10000,
            'desc': 'Unknown error',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.components,
            'severity': l.severity.fatal
        },

        NO_SKIN: {
            'errorCode': 2,
            'desc': 'No skin Found',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.components,
            'severity': l.severity.fatal
        },
        SKIN_PARAM_REF_NOT_FOUND: {
            'errorCode': 150001,
            'desc': 'No param ref found for param',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.skins,
            'severity': l.severity.warning
        },
        SKIN_PARAM_MUTATOR_FUNC_NOT_FOUND: {
            'errorCode': 150002,
            'desc': 'Mutator function was not found on value',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.skins,
            'severity': l.severity.error
        },
        SKIN_PART_MISSING: {
            'errorCode': 150003,
            'params': {'c1': 'Component Name','c2': 'Skin Name:Part Name'},
            'desc': 'Skin did not supply required skinPart',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.skins,
            'severity': l.severity.error
        },
        SKIN_CLASS_RULE_ERROR: {
            'errorCode': 150004,
            'desc': "Skin rule write to browser failed",
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.skins,
            'severity': l.severity.error
        },
        COMPONENT_ERROR: {
            'errorCode': 110001,
            'desc': "Component uncaught error",
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        /* When we should override method*/
        MISSING_METHOD: {
            'errorCode': 3,
            'desc': 'Method not defined',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.components,
            'severity': l.severity.fatal
        },
        /*MANAGERS*/
        MANAGERS_INVALID_NAME: {
            'errorCode': 1201,
            'desc': 'Invalid manager name',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        MANAGERS_INVALID_CLASS: {
            'errorCode': 12002,
            'desc': 'Invalid manager class: check script loading order',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        MANAGERS_INVALID: {
            'errorCode': 12012,
            'desc': 'invalid manager',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        /*pagemanager*/
        PM_SITE_LOAD_FAILED: {
            'errorCode': 12110,
            'desc': 'site did not load due to an error in the page manager (dsc should contain the specific error message)',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        PM_PAGE_FAILED_BEFORE_WIXIFY: {
            'errorCode': 12111,
            'desc': 'the page manager failed to load the page due to an exception (dsc contains stack trace)',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        PM_RENDER_PAGE_FAILED: {
            'errorCode': 12113,
            'desc': 'the page manager failed to wixify/render the page (dsc contains stack trace)',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        PM_RENDER_FILED_COMPS: {
            'errorCode': 12114,
            'desc': "some components didn't render correctly",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },
        PM_FOUND_FAILED_COMP_WITH_ANCHORS: {
            'errorCode': 12115,
            'desc': "found anchors on a filed component",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },
        PM_LOAD_PAGE_FIXED: {
            'errorCode': 12112,
            'desc': 'the site previously failed to load due to a missing resource, and this issue has been fixed',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },
        PAGE_NAVIGATION_FAILED: {
            'Owners': ['Gross'],
            'params': {'p1': 'e.name', 'p2':'e.message','p3': 'stack if available'},
            'errorCode': 12116,
            'desc': 'there was an exception while navigating pages.',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },

        /*classmanager*/
        CLASS_INVALID_TYPE: {
            'errorCode': 12021,
            'desc': 'Invalid class data for',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        CLASS_INVALID_NAME: {
            'errorCode': 12025,
            'desc': 'Invalid class name (must start with a capital letter, followed by alphanumeric): ',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        CLASS_NAME_ALREADY_EXIST: {
            'errorCode': 12026,
            'desc': 'Invalid class name - a class with the same name already exist: ',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        CLASS_DOUBLE_TRAIT_NAME: {
            'errorCode': 12027,
            'desc': 'Invalid trait name - a trait with the same name already exist: ',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        CLASS_INVALID_PENDING_OBJECT: {
            'errorCode': 12028,
            'desc': 'Invalid object found on pending list for class',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },


        /*component manager*/
        CM_NAME_ALREADY_EXIST: {
            'errorCode': 12031,
            'desc': 'Invalid component: component already exist',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },
        CM_NO_EXTEND: {
            'errorCode': 12032,
            'desc': 'Invalid component extend: no component extend found',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        CM_LOGIC_TYPE: {
            'errorCode': 12033,
            'desc': 'logic type was not supplied',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        CM_SKIN_TYPE: {
            'errorCode': 12034,
            'desc': 'skin type was not supplied',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        CM_NO_SKINPART: {
            'errorCode': 12035,
            'desc': "couldn't find skinPart",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        CM_NO_PART: {
            'errorCode': 12036,
            'desc': 'missing part id or type',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        CM_NO_NEW_SKIN: {
            'errorCode': 12037,
            'desc': "we currently don't support applying new skins",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        CM_NO_DATA: {
            'errorCode': 12038,
            'desc': 'data is unavailable for skinPart',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        EXPERIMENT_INVALID_MODIFY: {
            'errorCode': 12101,
            'desc': 'Invalid use of modify in experiment class',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        CM_UNKNOWN_STATE_GROUP: {
            'errorCode': 11003,
            'desc': 'Unknown component state group',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },
        CM_MALFORMED_STATES: {
            'errorCode': 11004,
            'desc': 'Malformed state data in component definition',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },
        //    CM_DUPLICATE_STATE_NAME:{
        //        'errorCode': 11005,
        //        'desc': 'Duplicate state name in component data',
        //        'type':l.type.error,
        //        'category': l.category.core,
        //        'issue':l.issue.managers,
        //        'severity':l.severity.warning
        //    },
        CM_UNKNOWN_STATE_NAME: {
            'errorCode': 11006,
            'desc': 'Unknown state name',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },

        CM_DUPLICATE_STATE_NAME: {
            'errorCode': 11013,
            'desc': 'duplicate state name',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        IMG_SIZE_ZERO: {
            'errorCode': 11007,
            'desc': 'image size is zero',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },

        IMG_VALID_SIZE_AFTER_ZERO: {
            'errorCode': 11008,
            'desc': 'image size is changed from zero to visible size',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.components,
            'severity': l.severity.recoverable,
            'sampleRatio': 100
        },

        IMG_INVALID_SETTINGS: {
            'errorCode': 11009,
            'desc': 'set invalid image settings',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        // component properties
        COMPONENT_PROPERTIES_PROP_NOT_FOUND: {
            'errorCode': 11010,
            'desc': 'component property not found',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },
        COMPONENT_PROPERTIES_BAD_PROP_DEF: {
            'errorCode': 11011,
            'desc': 'bad property definition in component property schema',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },
        COMPONENT_PROPERTIES_PROP_NOT_VALID: {
            'errorCode': 11012,
            'desc': 'Invalid property values',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },

        /*Save Errors*/
        SAVE_FAIL_EDITOR: {
            'errorCode': 10103,
            'params': {'p1':'errorDescription', 'p2': 'errorCode', 'p3': 'responseText'},
            'desc': 'Failed to save site',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        SAVE_ERROR_FROM_SERVER_10104: {
            'errorCode': 10104,
            'desc': 'User failed to save due to error 10104',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        SAVE_ERROR_FROM_SERVER_10104_FIXED: {
            'errorCode': 10105,
            'desc': 'Site was automatically fixed after a failed save',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },
        SAVE_ERROR_FROM_SERVER_10104_NONFATAL_FIXED: {
            'errorCode': 10106,
            'desc': 'Site was automatically fixed after a failed save',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },
        UNFIXABLE_10104_DUPLICATE_SIBLINGS: {
            'errorCode': 10107,
            'desc': 'User failed to save due to error 10104, and this could not be fixed',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        UNFIXABLE_10104_INVALID_PARENTS: {
            'errorCode': 10108,
            'desc': 'User failed to save due to error 10104, and this could not be fixed',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        SAVE_ERROR_10104_MISSING_PAGES_CONTAINER: {
            'errorCode': 10109,
            'desc': 'User failed to save due to error 10104, and this could not be fixed',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        INVALID_DATAQUERY_BOTH_STRUCTURES: {
            'errorCode': 10110,
            'desc': 'Validation error. A component exists in both structures, but has a reference to data which is missing or of the wrong type.',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        INVALID_DATAQUERY_ONLY_MOBILE: {
            'errorCode': 10111,
            'desc': 'Validation error. A component exists in both structures, but only the MOBILE version has an invalid reference to data.',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        INVALID_DATAQUERY_ONLY_DESKTOP: {
            'errorCode': 10112,
            'desc': 'Validation error. A component exists in both structures, but only the DESKTOP version has an invalid reference to data.',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        COMP_IN_MOBILE_BUT_NOT_DESKTOP: {
            'errorCode': 10113,
            'desc': 'Validation error. A component exists in MOBILE only, and also has an invalid reference to data',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        COMP_IN_DESKTOP_BUT_NOT_MOBILE: {
            'errorCode': 10114,
            'desc': 'Validation error. A component exists in DESKTOP only, and also has an invalid reference to data',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        MERGE_FIXED_ERROR_10104: {
            'errorCode': 10115,
            'desc': 'running merge after an error 10104 due to dataReferenceMismatches has fixed the problem',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },
        CORRUPT_SITE_PAGEGROUP_HAS_NONPAGE_CHILDREN_DURING_THIS_SESSION: {
            'errorCode': 10117,
            'desc': 'The page group has a component (child) which is not a page',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },
        CORRUPT_SITE_PAGEGROUP_WAS_SAVED_WITH_NONPAGE_CHILDREN: {
            'errorCode': 10118,
            'desc': 'The page group has a component (child) which is not a page',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },
        CORRUPT_SITE_NONPAGE_CHILD_ADDED_TO_PAGEGROUP: {
            'errorCode': 10119,
            'desc': 'The page group has a component (child) which is not a page',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },
		FIXED_NONPAGE_CHILDREN_MOVED_BACK_TO_PAGE: {
			'errorCode': 10120,
			'desc': 'When pagegroup childlist changed, non-page components ware added. This error indicates that the components were moved back to the currently viewed page',
			'type': l.type.error,
			'category': l.category.editor,
			'issue': l.issue.managers,
			'severity': l.severity.recoverable
		},
        ERROR_WHILE_DELETING_PAGES: {
            'errorCode': 10121,
            'desc': 'There was an error while deleting a page',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },
        INVALID_COMPONENT_ATTEMPT_TO_BE_FIXEDPOSITION: {
            'errorCode': 10122,
            'desc': 'Somehow a user tried to set a component to be fixed position, which is not header or footer',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },
        DATAQUERY_TO_DATA_BUT_NOT_DIRTY: {
            'errorCode': 10124,
            'desc': 'A site was saved with a reference to some data, but the data itself was not marked dirty to be saved',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },
        INVALID_DATAQUERY_MISSING_DATA_FROM_REFLIST: {
            'errorCode': 10125,
            'desc': 'A reflist (such as an imagelist) has a reference to a dataItem which does not exist',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },
        /*link type manager*/
        LT_LINK_UNKNOWN: {
            'errorCode': 12041,
            'desc': 'LinkTypesManager unknown link subtype',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        LT_INVALID_LINK_TYPE: {
            'errorCode': 12042,
            'desc': 'LinkTypesManager.getNewLink - invalid linkType:',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        /*skin manager*/
        USER_SEES_BLANK_SVG_SHAPE_V2: {
            'errorCode': 12050,
            'desc': 'AutoGeneratedShapesSkins experiment was closed, so the user sees a blank shape',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },
        SKIN_ALREADY_EXIST: {
            'errorCode': 12051,
            'desc': 'Invalid skin: skin name already exist',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },
        SHAPE_NOT_LOADED_IN_EDITOR: {
            'errorCode': 12052,
            'desc': 'AutoGeneratedShapesSkins (svgScaler): shape not retrieved, user probably sees a 404 in editor',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },
        SKIN_PARAM_NOT_PROVIDED: {
            'errorCode': 12053,
            'desc': 'Skin param error: param not provided for skin with tags',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        SKIN_PROBLEM_WITH_RULE: {
            'errorCode': 12054,
            'desc': 'problem with creating rule',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },
        SKIN_ALREADY_IN_USE: {
            'errorCode': 12055,
            'desc': 'Skin already in use',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        ERROR_RETRIEVING_SHAPE: {
            'errorCode': 12056,
            'desc': 'AutoGeneratedShapesSkins: error retrieving shape - creating dummy shape',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },
        /*view manager*/
        VM_INVALID_SITE_NODE: {
            'errorCode': 12061,
            'desc': 'Invalid site node',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        VM_INVALID_SITE_DATA: {
            'errorCode': 12062,
            'desc': 'Invalid site node',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        /*trait*/
        TRAIT_INVALID: {
            'errorCode': 12071,
            'desc': 'Invalid trait data',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        TRAIT_DOUBLE_NAME: {
            'errorCode': 12073,
            'desc': 'Invalid trait name - a trait with the same name already exist: ',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        TRAIT_DOUBLE_CLASS_NAME: {
            'errorCode': 12074,
            'desc': 'Invalid trait name - a class with the same name already exist: ',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        /* Utils */
        /*styles*/
        UTILS_RULE_ALREADY_EXIST: {
            'errorCode': 12081,
            'desc': 'Error creating a rule that already exist',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        UTILS_ERR_CREATE_STYLE: {
            'errorCode': 12082,
            'desc': 'Utils.createStyleSheet(styles.js) error creating stylesheet!',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        UTILS_STYLE_NOT_FOUND: {
            'errorCode': 12083,
            'desc': 'stylesheet not found on style node in setup',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        CONFIG_MANAGER_NO_PARAM: {
            'errorCode': 12090,
            'desc': 'required param not supplied',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        /*editor*/
        /*uploadProgressPreview*/
        UPLOAD_FAIL: {
            'errorCode': 21011,
            'desc': 'upload error',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.fatal
        },
        /* editor manager*/
        EM_ERROR_CLONE_SITE: {
            'errorCode': 22021,
            'desc': 'Error cloning site error',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        NO_DEFAULT_SKIN_FOUND: {
            'errorCode': 25001,
            'desc': 'Default skin not found for component',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.skins,
            'severity': l.severity.fatal
        },
        STYLE_EXTRA_PARAM_DEFINITION_MISSING: {
            'errorCode': 25002,
            'desc': 'No extra param definition found for style property',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.skins,
            'severity': l.severity.error
        },
        STYLE_PROP_SRC_UNKNOWN: {
            'errorCode': 25003,
            'desc': 'style property source unknown',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.skins,
            'severity': l.severity.error
        },
        DIRTIFY_DOCUMENT_FAIL: {
            'errorCode': 25004,
            'desc': 'mark document dirty failure',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },
        UNDO_RETURNED_ERROR_WHILE_TRYING_TO_APPLY_CHANGE: {
            'params': {'c1': 'command+type', 'c2':'JSON.stringify(error)'},
            'desc': 'Undo returned error while trying yo apply change',
            'errorCode': 25005,
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },
        /* preview manager*/
        PREVIEW_NOT_READY: {
            'errorCode': 22031,
            'desc': 'Preview error: Preview not ready',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },
        PREVIEW_INVALID_ID: {
            'errorCode': 22032,
            'desc': 'Preview error: invalid div id',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        PREVIEW_COMP_NOT_READY: {
            'errorCode': 22033,
            'desc': 'Preview component not ready',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        PREVIEW_ATTEMPT_LOAD_3_TIMES: {
            'errorCode': 22034,
            'desc': 'Preview was not loaded after 3 attempts, W is undefined',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        /* USER MEDIA MANAGER*/
        MEDIA_ERR_GETTING_LIST: {
            'errorCode': 22043,
            'desc': 'Error getting media list',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        /*UTILS*/
        NO_ACCESS_TO_LOCAL_STORAGE: {
            'params': {'p1': 'string indicating the environment it is fired from (topframe or iframe)'},
            'errorCode': 23001,
            'desc': 'Accessing window.localStorage throws an error. window.sessionStorage is used instead.',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable,
            'sampleRatio': 10
        },
        //When cookies are blocked, local/session storage are inaccessible.
        NO_ACCESS_TO_LOCAL_AND_SESSION_STORAGE: {
            'params': {'p1': 'string indicating the environment it is fired from (topframe or iframe)'},
            'errorCode': 23002,
            'desc': 'Accessing both localStorage and sessionStorage throws an error. LocalStorageUtils API will be accessing a mock object and will not actually work.',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },
        /* Wclass*/
        WCLASS_CLASS_EMPTY_STRING: {
            'errorCode': 23090,
            'desc': 'className must be a non empty string',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        WCLASS_CLASS_RESERVED: {
            'errorCode': 23091,
            'desc': 'is reserved for WClass',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        WCLASS_INVALID_BIND: {
            'errorCode': 23092,
            'desc': 'is not a function',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },
        WCLASS_CLASS_MUST_USE_NEW_OP: {
            'errorCode': 23093,
            'desc': 'Class must be used with the "new" operator',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        WCLASS_CLASS_DATA_INVALID: {
            'errorCode': 23094,
            'desc': 'Invalid class data',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        INVALID_TRAIT_USAGE: {
            'errorCode': 23095,
            'desc': 'Invalid trait usage',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        CLASS_ALREADY_EXIST: {
            'errorCode': 23096,
            'desc': 'Class already exist',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },

        /* SERVER FACADE*/
        /* default error from server*/
        SERVER_RETURNED_ERROR: {
            'params': {'p1': 'full URL that we called on the server', 'p2':'the part of the URL up to the ?'},
            'errorCode': 30000, /*USE SERVER*/
            'desc': 'Server returned an error ',
            'type': l.type.error,
            'category': l.category.server,
            'issue': l.issue.defaultVal,
            'severity': l.severity.fatal
        },
        SERVER_CONNECTION: {
            'errorCode': 30011,
            'desc': 'Server connection error',
            'type': l.type.error,
            'category': l.category.server,
            'issue': l.issue.defaultVal,
            'severity': l.severity.fatal
        },
        SERVER_INVALID_CALLBACK: {
            'errorCode': 30001,
            'desc': 'Invalid callbacks: both onComplete and onError must be defined',
            'type': l.type.error,
            'category': l.category.server,
            'issue': l.issue.defaultVal,
            'severity': l.severity.fatal
        },
        SERVER_INVALID_SITE_ID_STRING: {
            'errorCode': 30002,
            'desc': 'Invalid site id: must be a non-empty string',
            'type': l.type.error,
            'category': l.category.server,
            'issue': l.issue.defaultVal,
            'severity': l.severity.fatal
        },
        SERVER_INVALID_SITE_ID_GUID: {
            'errorCode': 30003,
            'desc': 'Invalid site id: must be a valid GUID',
            'type': l.type.error,
            'category': l.category.server,
            'issue': l.issue.defaultVal,
            'severity': l.severity.fatal
        },
        SERVER_INVALID_SITE_NAME_STRING: {
            'errorCode': 30004,
            'desc': 'Invalid site name: must be a non-empty string',
            'type': l.type.error,
            'category': l.category.server,
            'issue': l.issue.defaultVal,
            'severity': l.severity.fatal
        },
        SERVER_INVALID_SITE_NAME_VALID: {
            'errorCode': 30005,
            'desc': 'Invalid site name: use only small letters, digits, _ and -',
            'type': l.type.error,
            'category': l.category.server,
            'issue': l.issue.defaultVal,
            'severity': l.severity.fatal
        },
        SERVER_INVALID_SERVICE_URL: {
            'errorCode': 30006,
            'desc': 'invalid serviceBaseUrl',
            'type': l.type.error,
            'category': l.category.server,
            'issue': l.issue.defaultVal,
            'severity': l.severity.fatal
        },
        SERVER_INVALID_BASE_URL: {
            'errorCode': 30007,
            'desc': 'Invalid services base url',
            'type': l.type.error,
            'category': l.category.server,
            'issue': l.issue.defaultVal,
            'severity': l.severity.fatal
        },
        FEEDBACK_SERVER_SUBMIT_COMMENTS_ERROR: {
            'Owners': ['GuyR'],
            'errorCode': 30010,
            'desc': 'User of user tried to send feedback and got request error.',
            'type': l.type.error,
            'category': l.category.server,
            'issue': l.issue.defaultVal,
            'severity': l.severity.error
        },

        /* User Preferences */
        USER_PREF_ENTITY_TOO_LARGE: {
            'errorCode': 31001,
            'desc': 'http 413 - tried to post a blob larger than 4kb',
            'type': l.type.error,
            'category': l.category.server,
            'issue': l.issue.defaultVal,
            'severity': l.severity.warning
        },
        USER_PREF_BAD_REQUEST: {
            'errorCode': 31002,
            'desc': 'http 500 - either an internal server error, or a bad request made by the client',
            'type': l.type.error,
            'category': l.category.server,
            'issue': l.issue.defaultVal,
            'severity': l.severity.warning
        },
        USER_PREF_UNKNOWN_ERROR: {
            'errorCode': 31003,
            'desc': 'we received a response from the server which we did not expect',
            'type': l.type.error,
            'category': l.category.server,
            'issue': l.issue.defaultVal,
            'severity': l.severity.warning
        },

        BULK_INVALID_TARGET: {
            'errorCode': 13001,
            'desc': 'Invalid targets list: must be an array or Elements',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },
        BULK_TIMEOUT: {
            'errorCode': 13002,
            'desc': 'Bulk operation has timed out after',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },
        BULK_NO_METHOD: {
            'errorCode': 13003,
            'desc': 'No such method on target',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        SCHEMA_MISSING_KEY: {
            'errorCode': 12001,
            'desc': 'value request for key which is not in schema: [key, data, schema]',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        SCHEMA_MISSING: {
            'errorCode': 12099,
            'desc': 'data was inserted with type that does not exist: [schema]',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        SCHEMA_UNIMPLEMENTED_RESET: {
            'errorCode': 12003,
            'desc': 're-set of data is not implemented yet',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        EDITOR_NO_SKIN: {
            'errorCode': 21001,
            'desc': 'no skin provided for item',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        EDITOR_MANAGER_MISSING_SITE_HEADER: {
            'errorCode': 22001,
            'desc': "Can't find global var 'siteHeader' on window",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        EDITOR_MANAGER_INVALID_FLOW_EVENT: {
            'errorCode': 22002,
            'desc': "Invalid flow event",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        EDITOR_MANAGER_NO_TEMPLATE_CHANGE_PAGE: {
            'errorCode': 22003,
            'desc': "No site template selected and trying to change page",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        EDITOR_MANAGER_CLONING_SITE: {
            'errorCode': 22004,
            'desc': "Error cloning site",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        EDITOR_MANAGER_SAVE_SITE: {
            'errorCode': 22005,
            'desc': "Trying to save a site with no id or template or site is not loaded",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        RESOURCE_MANAGER_BUNDLE_NOT_FOUND: {
            'errorCode': 22006,
            'desc': "Bundle not found",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        FOOTER_DELETED: {
            'errorCode': 22011,
            'desc': "footer is deleted",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        GENERAL_FOOTER_ERROR: {
            'errorCode': 22012,
            'desc': "unknown footer check error",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        FOOTER_HIGHER_THAN_HEADER: {
            'errorCode': 22013,
            'desc': "footer is higher than header",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        SITE_STRUCTURE_NO_SITE_PAGES: {
            'errorCode': 11001,
            'desc': "No SITE_PAGES node found in site",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        IMAGE_LOAD_ERROR: {
            'ignore': true,
            'errorCode': 11002,
            'desc': "Image failed to load",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        THEME_MANAGER_UNKNOWN_PROPERTY: {
            'errorCode': 12004,
            'desc': "Unknown property",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        THEME_MANAGER_INVALID_PROPERTY: {
            'errorCode': 12005,
            'desc': "Invalid property name",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        SKIN_MANAGER_NO_DATA_FOR_SKIN: {
            'errorCode': 12006,
            'desc': "no skin data found for skin",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        SKIN_MANAGER_MISSING_ARGUMENTS: {
            'errorCode': 12007,
            'desc': "missing arguments for skin",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        SKIN_MANAGER_RE_REGISTER: {
            'errorCode': 12008,
            'desc': "can not re-register skin for component",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        SKIN_MANAGER_METHOD_CALLED_AGAIN: {
            'errorCode': 12009,
            'desc': "method cannot be called more than once",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        SKIN_MANAGER_NO_INLINE_CONTENT_SKINPART_FOUND: {
            'errorCode': 12010,
            'desc': "component has inline content, but is missing the inlineContent skinPart",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        VIEW_MANAGER_INVALID_PAGE: {
            'errorCode': 12011,
            'desc': "invalid pageId and/or URL",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        WIXIFY_INVALID_DATA_TYPE: {
            'errorCode': 13004,
            'desc': "data type provided didn't match component acceptable data types",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.defaultVal,
            'severity': l.severity.error
        },


        WIXIFY_MISSING_DATA_TYPE: {
            'errorCode': 13012,
            'desc': "The provided data object does not contain a data type",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.defaultVal,
            'severity': l.severity.warning
        },

        WIXIFY_NO_COMP: {
            'errorCode': 13005,
            'desc': "no comp attribute found",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.defaultVal,
            'severity': l.severity.error
        },

        WIXIFY_NO_SKIN: {
            'errorCode': 13006,
            'desc': "no skin attribute found",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.defaultVal,
            'severity': l.severity.error
        },

        WIXIFY_ALREADY_WIXIFIED: {
            'errorCode': 13007,
            'desc': "node has already been wixified",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.defaultVal,
            'severity': l.severity.error
        },
        WIXIFY_TIMEOUT: {
            'ignore': true,
            'errorCode': 13008,
            'desc': "node was not wixified on time",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.defaultVal,
            'severity': l.severity.error
        },

        WIXIFY_FINISHED_AFTER_TIMEOUT: {
            'ignore': true,
            'errorCode': 13020,
            'desc': "node was wixified after timeout",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.defaultVal,
            'severity': l.severity.warning
        },

        SITE_NAME_NO_SELECTED_CATEGORY: {
            'errorCode': 21002,
            'desc': "no category selected",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        EDITOR_INDEX_OUT_OF_RANGE: {
            'errorCode': 21003,
            'desc': "The index provided was out of range",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.recoverable
        },

        COMMAND_DUPLICATE: {
            errorCode: 13009,
            'desc': "command is already defined",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        BAD_COMMAND: {
            errorCode: 13010,
            'desc': "command is neither string nor a Command object",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        MISSING_COMMAND: {
            errorCode: 13011,
            'desc': "A command with this name was not found",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        COMMAND_EXECUTE_EXCEPTION: {
            errorCode: 13013,
            'desc': "Exception while processing command",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error,
            'sampleRatio': 100
        },
        SAVE_COMMAND_EXECUTE_EXCEPTION: {
            errorCode: 13014,
            'desc': "Exception while processing save command",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        INVALID_EDITOR_META_DATA: {
            errorCode: 21006,
            'desc': "The EDITOR_META_DATA object of this component is missing or defective",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        DM_MALFORMED_QUERY: {
            errorCode: 12013,
            'desc': "Malformed data query",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        CM_NO_DICTIONARY_DATA: {
            'errorCode': 12039,
            'desc': 'dictionary data is unavailable for skinPart',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        INVALID_METADATA_FIELD: {
            'errorCode': 12015,
            'desc': 'invalid metadata field name',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },

        DATA_MISSING_SNAPSHOT: {
            'errorCode': 12016,
            'desc': 'Missing snapshot for data item',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },
        GET_ALPHA_OF_NOT_COLOR_PROPERTY: {
            'errorCode': 12017,
            'desc': 'Attempt to access opacity of a property that is not of type color',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },

        SET_ALPHA_OF_NOT_COLOR_PROPERTY: {
            'errorCode': 12018,
            'desc': 'Attempt to set opacity of a property that is not of type color',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },

        SET_BOX_SHADOW_TOGGLE_OF_NOT_BOX_SHADOW_PROPERTY: {
            'errorCode': 12019,
            'desc': 'Attempt to set box shadow toggle on of a property that is not of type box shadow',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },

        DRAGGABLE_COMPONENT_MISSING_HANDLE_ERROR: {
            'errorCode': 11020,
            'desc': "Draggable component don't define a drag handle skin part",
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        MEDIA_GALLERY_MISSING_CONFIG: {
            'errorCode': 21004,
            'desc': "Media Dialog opened without config",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        MEDIA_GALLERY_FAILED_TO_OPEN_WITHIN_FIFTEEN_SEC: {
            'errorCode': 21009,
            'desc': "Media Dialog failed to open within 15 seconds",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        MEDIA_GALLERY_FAIL_LOAD_PROTOCOL: {
            'errorCode': 21010,
            'desc': 'MediaGallery failed to load protocol',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        MEDIA_GALLERY_INVALID_PAYLOAD: {
            'errorCode': 21012,
            'desc': 'MediaGallery returned with an invalid payload',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        MEDIA_GALLERY_FAILED_ONITEMS_CALLBACK: {
            'errorCode': 21013,
            'desc': "MediaGallery failed to execute onItems callback",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        STYLE_ALREADY_EXISTS: {
            'errorCode': 21005,
            'desc': "Attempt to create a style that already exists",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        // Note this is different from 22009:
        MENU_CORRUPTION_UNKNOWN_PAGE: {
            'errorCode': 22007,
            'desc': 'MAIN_MENU has unknown page (doesnt exist), and the editor would not load',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.modal,
            'severity': l.severity.recoverable
        },
        MENU_CORRUPTION_MISSING_PAGE: {
            'errorCode': 22008,
            'desc': 'MAIN_MENU is missing a page',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.modal,
            'severity': l.severity.recoverable
        },
        // Note this is different from 22007:
        MENU_CORRUPTION_NULL_PAGE: {
            'errorCode': 22009,
            'desc': 'MAIN_MENU has a pointer to a page with a value of null in the docData, and the editor wont load.',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.modal,
            'severity': l.severity.fatal
        },
        MENU_CORRUPTION_BLANK_ID: {
            'errorCode': 22010,
            'desc': 'MAIN_MENU has blank refIds, and the editor wont load',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.modal,
            'severity': l.severity.fatal
        },
        APPS_PROVISION_FAILED: {
            'errorCode': 220080,
            'desc': 'App provision failed - app store service returned error',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        APPS_OPEN_TIMEOUT: {
            'errorCode': 220090,
            'desc': 'App timeout - application failed to call the init() method',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        APPS_UNABLE_TO_COMPLETE_PROVISION_POST_SAVE: {
            'errorCode': 220091,
            'desc': 'Unable to complete the provisioning of apps after metasite save',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },

        APPS_UNABLE_TO_LOAD_APP_DEFINITIONS: {
            'errorCode': 220092,
            'desc': 'Unable to load apps definitions',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },

        EXPERIMENT_UNKNOWN: {
            'errorCode': 220093,
            'desc': 'Experiment id is missing from the ordered list of experiments',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },
        EXPERIMENT_IN_CONFLICT: {
            'errorCode': 220094,
            'desc': 'Experiment id is in conflict with another open experiment',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        EXPERIMENT_MISSING_DEPENDENCY: {
            'errorCode': 220095,
            'desc': 'Experiment id requires another experiment to operate, but that depency was not opened',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal,
            'sampleRatio': 10
        },
        EXPERIMENT_INVALID_DEFINITION: {
            'errorCode': 220103,
            'desc': 'Experiment has an invalid definition',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        EXPERIMENT_CYCLIC_DEPENDENCY: {
            'errorCode': 220104,
            'desc': 'Cyclic dependency in experiment definition',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        EXPERIMENT_ID_NOT_IN_LOWER_CASE_IN_LIST: {
            'errorCode': 220105,
            'desc': 'Experiment in model should have an all-lowercase id',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        EXPERIMENT_ID_NOT_IN_LOWER_CASE_IN_DESCRIPTORS: {
            'errorCode': 220106,
            'desc': 'Experiment in descriptors should have an all-lowercase id',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        EXPERIMENT_DEPLOYMENT_TIMEOUT: {
            'Owners': ['ShaharZ'],
            'errorCode': 220099,
            'desc': 'Timeout while waiting for all marked experiments to deploy',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal,
            'timeoutThreshold': 20000,
            "sampleRatio": 10
        },
        HTML_SCRIPTS_LOADER_UNABLE_TO_LOAD_INDEX: {
            'errorCode': 220096,
            'desc': 'unable to load index.json',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.defaultVal,
            'severity': l.severity.fatal
        },
        HTML_SCRIPTS_LOADER_INVALID_INDEX: {
            'errorCode': 220097,
            'desc': 'Invalid index.json format',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.defaultVal,
            'severity': l.severity.fatal
        },
        WALK_ME_FAILED_TO_LOAD: {
            'errorCode': 220098,
            'desc': 'Walk Me failed to load',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },
        LINK_DATA_ITEM_DOESNT_EXIST: {
            'errorCode': 220100,
            'desc': 'Link data item does not exsit',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },

        COMPONENT_ALREADY_REGISTERED_IN_LIFECYCLE: {
            'errorCode': 220101,
            'desc': 'failed to register component, component already registered to licycle.',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },

        COMPONENT_NOT_REGISTERED_IN_LIFECYCLE: {
            'errorCode': 220102,
            'desc': 'cannot update component state - component not registered.',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },

        FIRST_RELOADED_AFTER_CRASH: {
            'errorCode': 121000,
            'desc': 'editor loaded after crash',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error,
            'sampleRatio': 10
        },

        SITE_RESTORED_AFTER_CRASH: {
            'errorCode': 121001,
            'desc': 'user restore the locally saved site after crash',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        SITE_CRASHED_IN_PREVIOUS_SESSION: {
            'errorCode': 121003,
            'desc': 'site crashed in previous session',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        PAGE_FETCHING_ERROR: {
            'errorCode': 12014,
            'desc': 'general fatal error in page loading mechanism',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.defaultVal,
            'severity': l.severity.fatal
        },

        DUPLICATE_METASITE_NAME: {
            'errorCode': 121051,
            'desc': 'attempt to save a site with an existing metaise name',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.defaultVal,
            'severity': l.severity.warning
        },

        SITE_RESTORATION_AFTER_CRASH_FAILED: {
            'errorCode': 121002,
            'desc': 'site restoration from user local storage failed',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        ALL_PAGE_RETRIEVAL_ATTEMPTS_FAILED: {
            'errorCode': 11101,
            'desc': 'page could not be retrieved from the server',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        SINGLE_PAGE_RETRIEVAL_ATTEMPT_FAILED: {
            'Owners': ['UriT'],
            'params': {'p1': 'domain', 'p2':'pageId','p3': 'fallback num','p4':'cycle num'},
            'errorCode': 11102,
            'desc': 'This is fired on every failed attempt to get the page JSON from one of the fallbacks',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },

        FAILED_TO_RETRIEVE_SITE_REVISION: {
            'errorCode': 11103,
            'desc': 'failed to retrieve site revision, server returned an error',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        ALL_PAGE_RETRIEVAL_ATTEMPTS_FAILED_FOR_LAZY_PAGE_LOAD: {
            'errorCode': 11104,
            'desc': 'page could not be retrieved (lazily) from the server',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        INVALID_INPUT_BIND: {
            'errorCode': 26001,
            'desc': 'Invalid input field bind',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        STYLES_DO_NOT_EXIST: {
            'errorCode': 26002,
            'desc': 'Styles were not retrieved from editor data',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        COMPONENT_STYLES_DO_NOT_EXIST: {
            'errorCode': 26003,
            'desc': 'Component styles were not retrieved from editor data',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        AUTOPANEL_SKIN_DOES_NOT_EXIST: {
            'errorCode': 26004,
            'desc': 'Skin defined in generator does not exist',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        AUTOPANEL_SKIN_STYLES_DOES_NOT_EXIST: {
            'errorCode': 26005,
            'desc': 'Skin collection defined in generator does not exist',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        CKEDITOR__FAILED_DESTROY: {
            'errorCode': 26006,
            'desc': 'ck-editor destroy failed, entered catch block',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },
        LANGUAGE_PACK_FAILED_TO_LOAD: {
            'Owners': ['BarakI'],
            'params': {'p1': 'bundle', 'p2':'the url of the lang resource','p3': 'two-letter lang code'},
            'errorCode': 26007,
            'desc': 'the language from the html-client-lang project failed to load',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        AVIARY_MISSING_ID_IN_SKIN: {
            'errorCode': 21030,
            'desc': 'Missing an id on this._skinParts.content, it is required for Aviary to work',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        AVIARY_DIALOG_WRONG_DATA_TYPE: {
            'errorCode': 21031,
            'desc': 'Data is missing or Data Type is not an Image Data',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        AVIARY_NOT_LOADED: {
            'errorCode': 21032,
            'desc': 'Aviary.js was not loaded after 5000ms',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        AVIARY_FORCE_CLOSED: {
            'errorCode': 21033,
            'desc': 'Aviary dialog was not closed on first try, forced it to close on second try',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },
        AVIARY_UPLOAD_GET_TICKET_FAILED: {
            'errorCode': 21034,
            'params': {'c1': 'error message'},
            'desc': 'Failed on getting ticket for upload.',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        AVIARY_UPLOAD_TO_STATIC_FAILED: {
            'errorCode': 21035,
            'params': {'c1': 'error message'},
            'desc': 'Uploading image to statics failed.',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        AVIARY_UPLOAD_UPDATE_MEDIA_FAILED: {
            'errorCode': 21036,
            'params': {'c1': 'error message'},
            'desc': 'Updating private media with uploaded file failed.',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        AVIARY_RETURNED_AN_ERROR: {
            'errorCode': 21037,
            'params': {'c1': 'error message', 'i1':'error code'},
            'desc': 'Aviary editor failed on external script error.',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        AVIARY_REACHED_INNER_SAVE_FUNCTION: {
            'errorCode': 21038,
            'desc': 'Aviary somehow called its inner save function, this does not supposed to happen.',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },

        DATA_ITEM_INVALID_TYPE: {
            'errorCode': 21039,
            'params': {'p1': 'improper type and stack trace'},
            'desc': 'Attempt to assign dataItem with incaceptable type.',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        FAILED_COMPONENT_SERIALIZATION: {
            'Owners': ['DW','NoamSI'],
            'params': {'c1': 'id=id+component+skin, errors=list of failed validations, caller=where it failed'},
            'errorCode': 21040,
            'desc': 'Failed validation of component during serialization.',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        DUPLICATED_COMPONENT_ID: {
            'Owners': ['DW'],
            'params': {'c1': 'id=id,comp=[componentsType1, componentType2,...]'},
            'errorCode': 21041,
            'desc': 'Duplicated component id.',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        INVALID_STATICS_PARAM: {
            'errorCode': 21042,
            'desc': 'class statics cannot receive a function as a parameter',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        INVALID_FIELDS_PARAM: {
            'errorCode': 21043,
            'desc': 'class fields cannot receive a function as a parameter',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        INVALID_METHODS_PARAM: {
            'errorCode': 21044,
            'desc': 'class methods cannot receive a function as a parameter',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },
        TEXT_MIGRATION_EMPTY_BLOCK_ELEMENT: {
            'errorCode': 21045,
            'desc': 'text before migration contains blocks with no child nodes',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },
        TEXT_MIGRATION_DEFAULT_VALUES_NOT_PROVIDED: {
            'errorCode': 21047,
            'desc': "text before migration contains blocks with unstyled text, and no default class or tag were provided",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        FONT_LOAD_TIME_GREATER_THAN_30_SECONDS: {
            'errorCode': 21048,
            'desc': "Selected font didnt load for 30 seconds. Font is probably missing",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        MISSING_FONT_IN_USE: {
            'errorCode': 21072,
            'desc': "font is used in site but doesnt exist in fonts list",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        TEXT_MIGRATION_MISSED_STYLED_SPANS: {
            'errorCode': 21049,
            'desc': 'after migration there is a span with style class, (has been changed to inline style)',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },
        RICH_TEXT_UKNOWN_FAILURE: {
            'errorCode': 21050,
            'desc': 'An unknown failure in rich text editor',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },
        MIGRATING_OLD_TEXT: {
            'errorCode': 21071,
            'desc': 'User started editing old text compnent that needed to be migrated',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },
        WINDOW_ON_ERROR: {
            'errorCode': 21051,
            'params': {'c1': 'error description', 'c2':'url','i1': 'line number'},
            'desc': 'A fatal error happened in the JS and stopped execution.',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal,
            'sampleRatio': 100 //just to be on the safe side, for now
        },
        CONTACT_FORM_EMAIL_DECRYPT_FAILURE: {
            'errorCode': 21052,
            'desc': 'Failed to decrypt contact form email',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },
        TEXT_RESTORE_SELECTION_FAIL: {
            'errorCode': 21053,
            'desc': 'failed to restore text selection in rich text editor',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },
        RICH_TEXT_RESET_CONTROLLER_FAIL: {
            'errorCode': 21054,
            'desc': 'Reset rich text controller failed',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },
        RICH_TEXT_LOADING_TIMEOUT: {
            'errorCode': 21055,
            'params': {'c1': 'the problematic text', 'p2':'the url of the lang resource','p3': 'two-letter lang code'},
            'desc': 'Rich Text failed to start edit text after 2 seconds',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal,
            'sampleRatio': 10
        },

        MOBILE_STRUCTURE_NOT_SAVED_DUE_TO_CORRUPTION: {
            'errorCode': 21056,
            'desc': 'mobile structure was not saved with site due to a corruption in site structure - missing header, footer or pages container',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        PAGE_EXISTS_IN_MOBILE_BUT_NOT_IN_DESKTOP: {
            'errorCode': 21102,
            'desc': "page that exists in mobile structure doesn't exist in desktop structure",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        DELETED_PAGES_NOT_DELETED_BY_USER: {
            'params': { 'p1': 'missing pages that were about to be deleted', 'p2': 'number of pages' },
            'errorCode': 21103,
            'desc': "some pages were about to be deleted from current structure without the user deleting them",
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        DELETED_PAGES_DOM_CONTAINS_PAGES_STRUCTURE_DOES_NOT: {
            'params': { 'p1': 'page ids that exist in DOM but not in serialized structure' },
            'errorCode': 21104,
            'desc': 'pages were deleted (probably) because DOM structure is different from serialized structure.',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        MISSING_PAGE_BECAME_CUSTOM_MENU_HEADER: {
            'params': { 'p1': 'page id of the missing page' },
            'errorCode': 21105,
            'desc': 'missing page became a custom menu header (instead of a link to a page).',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        BLOCKED_DELETION_OF_MISSING_PAGES: {
            'params': { 'p1': 'missing pages that were about to be deleted' },
            'errorCode': 21106,
            'desc': 'missing pages were not sent to the server in structure.deletedPageIds and therefore not deleted',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },

        DELETED_CORRUPTED_CUSTOM_SITE_MENU: {
            'errorCode': 21107,
            'desc': 'datafixer deleted corrupted custom site menu, user lost csm data',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },

        SCRIPT_IS_MISSING: {
            'params': { 'p1': 'array of missing scripts or functions' },
            'errorCode': 21108,
            'desc': 'missing script or function',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.recoverable
        },

        FALSE_FAIL_CALLBACK_ON_SAVE_SUCCESS: {
            'params': { 'p1': 'status code', 'p2': 'response'},
            'errorCode': 21109,
            'desc': 'Request.Json initiated onFailure while response was valid',
            type: l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },

        QUALAROO_OLD_EDITOR_SURVEY_FAILED: {
            'errorCode': 21110,
            'desc': 'The external Qualaroo survey code failed, stack is sent in error dsc',
            type: l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        NO_COMPONENT_WITH_GIVEN_ID: {
            'errorCode': 21057,
            'desc': 'trying to retreive a component by id, however there is no such component',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal,
            'sampleRatio': 10
        },

        CORRUPTED_ELEMENT_WITH_ID_AND_NOT_SUCH_COMPOENENT: {
            'errorCode': 21058,
            'desc': 'trying to get a component by id, however there is no such component and there is some element with the component is',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.warning,
            'sampleRatio': 10
        },

        CORRUPTED_ELEMENT_WITH_COMPONENT_ID: {
            'errorCode': 21059,
            'desc': 'trying to get a component by id, and there is at least one more element with the same id, this element is corrupted',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal,
            'sampleRatio': 10

        },

        DID_NOT_SWITCH_TO_MOBILE_DUE_TO_CORRUPTION: {
            'errorCode': 21060,
            'desc': 'did not switch to mobile editor due to a corruption in site structure - missing header, footer or pages container',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        DID_NOT_SWITCH_TO_MOBILE_DUE_TO_UNKNOWN_MERGE_ALGO_ISSUE: {
            'errorCode': 21061,
            'desc': 'did not switch to mobile editor due to an exception thrown from the merge algorithm',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        DID_NOT_SWITCH_TO_MOBILE_DUE_TO_UNKNOWN_CONVERSION_ALGO_ISSUE: {
            'errorCode': 21062,
            'desc': 'did not switch to mobile editor due to an exception thrown from the conversion algorithm',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        UNKNOWN_MERGE_ALGO_CRASH_WHILE_SAVING: {
            'errorCode': 21063,
            'desc': 'merge algorithm crashed while saving',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        UNKNOWN_CONVERSION_ALGO_CRASH_WHILE_SAVING: {
            'errorCode': 21064,
            'desc': 'conversion algorithm crashed while saving',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        MOBILE_ALGO_EFFECTIVE_TEXT_CALCULATOR_FAILED: {
            'errorCode': 21065,
            'desc': 'effective text calculator failed',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        MOBILE_ALGO_EFFECTIVE_TEXT_CALCULATOR_RETURNED_NULL: {
            'errorCode': 21066,
            'desc': 'effective text calculator returned null',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        UNHANDLED_LINK_TYPE: {
            'errorCode': 21067,
            'desc': 'Failed to convert link to new type',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        LINK_RENDERING_FAILED: {
            'errorCode': 21068,
            'desc': 'Failed to render link',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.components,
            'severity': l.severity.error
        },
        UNKNOWN_MERGE_ALGO_CRASH_WHILE_SWITCHING_TO_MOBILE: {
            'errorCode': 21069,
            'desc': 'did not switch to mobile editor due to an unknown exception during the merge algorithm',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        SITE_SEGMENT_HAS_TYPE_COMPONENT: {
            'errorCode': 21070,
            'desc': 'A site segment component was serialized with component type component, and it should be container',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        SCRIPTLOADER_FAILED_TO_LOAD_SCRIPT_RETRY: {
            'errorCode': 21100,
            'desc': 'failed to load a JS file in the scriptloader. this is fired on every try. in the dsc field, i write which attempt this is. there are 3. the dsc field will also say which file failed to load',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.warning
        },
        SCRIPTLOADER_FAILED_TO_LOAD_SCRIPT_GAVE_UP: {
            'errorCode': 21101,
            'desc': 'ultimately failed to load a JS file in the scriptloader. there were 3 attempts, and they all failed. dsc field will say which file failed to load',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.fatal
        },

        INVALID_IMAGE_DIMENSIONS: {
            'errorCode': 110011,
            'desc': 'an image request with a zero or negative size',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.components,
            'severity': l.severity.error,
            'sampleRatio': 10
        },

        SITE_FONTS_LIST_COMPUTATION_FAILED: {
            'errorCode': 101010,
            'desc': 'a general failure in site used fonts list computation',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        THEME_MANAGER_MISSING_PROPERTY: {
            'errorCode': 101012,
            'desc': 'value request for an unknown theme property: [key, data, schema]',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        NO_MOBILE_IN_EDITOR: {
            'errorCode': 101013,
            'desc': 'invalid access to mobile from editor',
            'type': l.type.error,
            'category': l.category.core,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        SM_LOGOUT_FAILED: {
            'errorCode': 101020,
            'desc': 'failed logging out from site members',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.defaultVal,
            'severity': l.severity.error
        },

        HTML_CAPTURE_FAILURE: {
            'errorCode': 101021,
            'desc': 'The capturing of static html failed because of one or more components were never ready for dom display',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        ANIMATIONS_REGISTER_CORRUPTED_DATA: {
            'errorCode': 101022,
            'desc': 'JSON.parse failed. Component data is corrupted',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        ANIMATIONS_REGISTER_INVALID_DATA: {
            'errorCode': 101023,
            'desc': 'Invalid data structure',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        ANIMATIONS_FUNCTION_IS_NOT_IMPLEMENTED: {
            'errorCode': 101024,
            'desc': 'Function is not implemented',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        STATIC_HTML_REPLACEMENT_DELAY: {
            'owners':['Weber'],
            'errorCode': 101025,
            'desc': 'The static html replacement into the real site was timed out ' +
                'because one or more components were never ready for dom display',
            'type': l.type.timing,
            'category': l.category.viewer,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },

        STATIC_HTML_REPLACEMENT_FAILURE: {
            'errorCode': 101026,
            'desc': 'The static html replacement into the real site has failed',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.managers,
            'severity': l.severity.error
        },

        CONTACT_FORM_SUBMIT_FAILURE: {
            'errorCode': 101027,
            'desc': 'Contact form: Unspecified error occurred, possibly a connection problem, fallback activated',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },

        CONTACT_FORM_SUBMIT_FINAL_FALLBACK: {
            'errorCode': 101028,
            'desc': 'Contact form: Error occurred in Fallback Request',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.components,
            'severity': l.severity.error
        },

        SUBSCRIBE_FORM_SUBMIT_FAILURE: {
            'errorCode': 101029,
            'desc': 'Subscribe form: Unspecified error occurred, possibly a connection problem, fallback activated',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.components,
            'severity': l.severity.warning
        },

        SUBSCRIBE_FORM_SUBMIT_FINAL_FALLBACK: {
            'errorCode': 101030,
            'desc': 'Subscribe Form: Error occurred in Fallback Request',
            'type': l.type.error,
            'category': l.category.viewer,
            'issue': l.issue.components,
            'severity': l.severity.error
        },


        /* Angular Errors */
        ANGULAR_EXCEPTION: {
            'errorCode': 50001,
            'desc': 'Angular caught an exception',
            'type': l.type.error,
            'category': l.category.editor,
            'issue': l.issue.components,
            'severity': l.severity.error
        }

        // IMPORTANT!!!
        //
        // These are error codes that are reserved for TPA and are defined in TPALogMessages.js

        //TPA_RESERVED_ERROR_28000: { 'errorCode': 28000 },
        //TPA_RESERVED_ERROR_28001: { 'errorCode': 28001 },
        //TPA_RESERVED_ERROR_28002: { 'errorCode': 28002 },
        //TPA_RESERVED_ERROR_28003: { 'errorCode': 28003 },
        //TPA_RESERVED_ERROR_28004: { 'errorCode': 28004 },
        //TPA_RESERVED_ERROR_28005: { 'errorCode': 28005 },
        //TPA_RESERVED_ERROR_28006: { 'errorCode': 28006 },
        //TPA_RESERVED_ERROR_28007: { 'errorCode': 28007 },
        //TPA_RESERVED_ERROR_28008: { 'errorCode': 28008 },
        //TPA_RESERVED_ERROR_28009: { 'errorCode': 28009 },
        //TPA_RESERVED_ERROR_28010: { 'errorCode': 28010 },
        //TPA_RESERVED_ERROR_28011: { 'errorCode': 28011 },
        //TPA_RESERVED_ERROR_28012: { 'errorCode': 28012 },
        //TPA_RESERVED_ERROR_28013: { 'errorCode': 28013 },
        //TPA_RESERVED_ERROR_28014: { 'errorCode': 28014 },
        //TPA_RESERVED_ERROR_28015: { 'errorCode': 28015 },
        //TPA_RESERVED_ERROR_28016: { 'errorCode': 28016 },
        //TPA_RESERVED_ERROR_28017: { 'errorCode': 28017 },
        //TPA_RESERVED_ERROR_28018: { 'errorCode': 28018 },
        //TPA_RESERVED_ERROR_28019: { 'errorCode': 28019 },
        //TPA_RESERVED_ERROR_28020: { 'errorCode': 28020 },
        //TPA_RESERVED_ERROR_28021: { 'errorCode': 28021 },
        //TPA_RESERVED_ERROR_28022: { 'errorCode': 28022 },
        //TPA_RESERVED_ERROR_28023: { 'errorCode': 28023 },
        //TPA_RESERVED_ERROR_28024: { 'errorCode': 28024 },
        //TPA_RESERVED_ERROR_28025: { 'errorCode': 28025 },
        //TPA_RESERVED_ERROR_28026: { 'errorCode': 28026 },
        //TPA_RESERVED_ERROR_28027: { 'errorCode': 28027 },
        //TPA_RESERVED_ERROR_28028: { 'errorCode': 28028 },
        //TPA_RESERVED_ERROR_28029: { 'errorCode': 28029 },
        //TPA_RESERVED_ERROR_28030: { 'errorCode': 28030 },
        //TPA_RESERVED_ERROR_28031: { 'errorCode': 28031 },
        //TPA_RESERVED_ERROR_28032: { 'errorCode': 28032 },
        //TPA_RESERVED_ERROR_28033: { 'errorCode': 28033 },
        //TPA_RESERVED_ERROR_28034: { 'errorCode': 28034 },
        //TPA_RESERVED_ERROR_28035: { 'errorCode': 28035 },
        //TPA_RESERVED_ERROR_28036: { 'errorCode': 28036 },
        //TPA_RESERVED_ERROR_28037: { 'errorCode': 28037 },
        //TPA_RESERVED_ERROR_28038: { 'errorCode': 28038 },
        //TPA_RESERVED_ERROR_28039: { 'errorCode': 28039 },
        //TPA_RESERVED_ERROR_28040: { 'errorCode': 28040 },
        //TPA_RESERVED_ERROR_28041: { 'errorCode': 28041 },
        //TPA_RESERVED_ERROR_28042: { 'errorCode': 28042 },
        //TPA_RESERVED_ERROR_28043: { 'errorCode': 28043 },
        //TPA_RESERVED_ERROR_28044: { 'errorCode': 28044 },
        //TPA_RESERVED_ERROR_28045: { 'errorCode': 28045 },
        //TPA_RESERVED_ERROR_28046: { 'errorCode': 28046 },
        //TPA_RESERVED_ERROR_28047: { 'errorCode': 28047 },
        //TPA_RESERVED_ERROR_28048: { 'errorCode': 28048 },
        //TPA_RESERVED_ERROR_28049: { 'errorCode': 28049 },
        //TPA_RESERVED_ERROR_28999: { 'errorCode': 28999 }

        /*  TEMPORARY EROR ID, TO BE CHANGED WHEN VALERY RETURNS
         *   Shaik/Baraki
         *   LOG.reportError(wixErrors.SCHEMA_UNIMPLEMENTED_RESET, 'crash', 'time shtamp');
         *   LOG.reportError(wixErrors.SCHEMA_UNIMPLEMENTED_RESET, 'recovery', 'recover');
         *   LOG.reportError(wixErrors.SCHEMA_UNIMPLEMENTED_RESET, 'recovery', 'discard');
         * */
    };


}(window));
