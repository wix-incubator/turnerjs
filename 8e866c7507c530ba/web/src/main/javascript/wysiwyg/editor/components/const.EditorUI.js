/**@class Constants.EditorUI */
define.Const('EditorUI', {
	SHOW_PANEL : "EditorUI.ShowPanel",
	SHOW_TOOLBAR : "EditorUI.ShowToolbar",
	SHOW_SUB_PANEL : "EditorUI.ShowSubPanel",
	CLOSE_PANEL : "EditorUI.ClosePanel",
	CLOSE_SUB_PANEL : "EditorUI.HideSubPanel",
	CLOSE_ALL_PANELS : "EditorUI.HideAllPanels",
    OPEN_PROPERTY_PANEL: "EditorUI.OpenPropertyPanel",
    RELOAD_PROPERTY_PANEL : "EditorUI.ReloadPropertyPanel",
    CLOSE_PROPERTY_PANEL : "EditorUI.ClosePropertyPanel",
    OPEN_FLOATING_PANEL: "EditorUI.OpenFloatingPanel",
    CLOSE_FLOATING_PANEL: "EditorUI.CloseFloatingPanel",
    HIGHLIGHT_PROPERTY_PANEL: "EditorUI.HighlightPropertyPanel",
    START_EDIT_RICH_TEXT:"EditorUI.StartEditRichText",
    RESIZE_HANDLES_CHANGED:"EditorUI.ResizeHandlesChanged",
	CLOSED_PANELS : 'closedPanels',
	DESIGN_PANEL : 'designPanel',
	ADD_PANEL : 'addPanel',
	PAGES_PANEL : 'pagesPanel',
	SETTINGS_PANEL : 'settingsPanel',
    MARKET_PANEL : 'marketPanel',
	ECOMMERCE_PANEL : 'ecommercePanel',
	ECOMMERCE_GALLERY_PANEL : 'ecommerceGalleryPanel',
    NO_MARKET_PANEL : 'noMarketPanel',
//    MOBILE_PAGES_PANEL : 'mobilePagesPanel',
    MOBILE_DESIGN_PANEL : 'mobileDesignPanel',
    MOBILE_SETTINGS_PANEL : 'mobileSettingsPanel',
    MOBILE_ADD_PANEL : 'mobileAddPanel',
    MOBILE_MARKET_PANEL : 'mobileMarketPanel',
	MOBILE_ECOMMERCE_PANEL : 'mobileEcommercePanel',
    MOBILE_HIDDEN_ELEMENTS_PANEL : 'mobileHiddenElementsPanel',
    EDIT_STATE_BAR_VISIBLE: 'editStateBarVisible',
    EDIT_STATE_BAR_HIDDEN: 'editStateBarHidden',
    EDIT_CONTROLS_VISIBLE: 'editControlsVisible',
    EDIT_CONTROLS_HIDDEN: 'editControlsHidden',
    PANEL_CLOSING : 'pclose!',

    MediaQuery : {
        TIMEOUT: 40,
        Height: {
            DEFAULT: 0,
            MINIMAL: 600
        },
        Width: {
            DEFAULT: 0,
            MINIMAL: 960
        }
    },

    Max: {
        SIDE_PANEL_HEIGHT: 661
    },

    //TODO: Legacy, remove PREVIEW_SIZES
    PREVIEW_SIZES: {
        DESKTOP:{
            //Stub
        },
        MOBILE:{
            width: 320,
            height: 480
        }
    },

    PREVIEW_SIZE_POSITION: {
        DEFAULT:{
            top: 35,
            left: 0,
            bottom:0,
            right:0
        },
        MOBILE_EDITOR:{
            top: 35,
            left: 0,
            bottom:0,
            right:0
        },
        MOBILE_PREVIEW:{
            top: 35,
            left: 'center',
            width: 320,
            height: 480
        }
    }
});