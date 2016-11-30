// Register Data
define.dataItem.multi({
    'EDITOR_STRUCTURE': {
        type: 'Document',
        'name': 'Wix Web Editor'
    },

    'THEME_DATA': {
        type: 'Theme',
        'properties': {
            'CONTACT_DIRECTORY': {'type': 'themeUrl', 'value': 'editorIcons/links'},
            'NETWORKS_DIRECTORY': {'type': 'themeUrl', 'value': 'editorIcons/links'},
            'EXTERNAL_LINKS_DIRECTORY': {'type': 'themeUrl', 'value': 'editorIcons/links'},
            'PAGES_DIRECTORY': {'type': 'themeUrl', 'value': 'editorIcons/links'},
            'THEME_DIRECTORY': {'type': 'themeUrl', 'value': 'editor_mobile'},
            'WEB_THEME_DIRECTORY': {'type': 'webThemeUrl', 'value': 'editor_web'}
        }
    },

    TOP_TABS: {
        type: 'PropertyList',
        items: [
            {name: 'Pages',     label: 'SIDE_BTN_PAGES',    labelType: 'langKey', id: 'tbPages',    command: 'WEditorCommands.Pages',       commandParameter: 'pagesPanel'},
            {name: 'Design',    label: 'SIDE_BTN_DESIGN',   labelType: 'langKey', id: 'tbDesign',   command: 'WEditorCommands.Design',      commandParameter: 'designPanel'},
            {name: 'Add',       label: 'SIDE_BTN_ADD',      labelType: 'langKey', id: 'tbAdd',      command: 'WEditorCommands.ShowComponentCategories', commandParameter: 'addPanel'},
            {name: 'Market',    label: 'SIDE_BTN_MARKET',   labelType: 'langKey', id: 'tbMarket',   command: 'WEditorCommands.Market',      commandParameter: 'marketPanel', component: 'wysiwyg.editor.components.AppMarketTab'},
            {name: 'Settings',  label: 'SIDE_BTN_SETTINGS', labelType: 'langKey', id: 'tbSettings', command: 'WEditorCommands.Settings',    commandParameter: 'settingsPanel'}
        ]
    },

//    TOP_TABS: {
//        type: 'PropertyList',
//        items: [
//            {name: 'Pages', label: 'SIDE_BTN_PAGES', labelType: 'langKey', id: 'tbPages', commandParameter: 'pagesPanel', command: 'WEditorCommands.Pages'},
//            {name: 'Design', label: 'SIDE_BTN_DESIGN', labelType: 'langKey', id: 'tbDesign', command: 'WEditorCommands.Design'},
//            {name: 'Add', label: 'SIDE_BTN_ADD', labelType: 'langKey', id: 'tbAdd', command: 'WEditorCommands.ShowComponentCategories' },
//            {name: 'Settings', label: 'SIDE_BTN_SETTINGS', labelType: 'langKey', id: 'tbSettings', command: 'WEditorCommands.Settings'},
//            {name: 'Market', label: 'SIDE_BTN_MARKET', labelType: 'langKey', id: 'tbMarket', command: 'WEditorCommands.Market'}
//        ]
//    },

    TOP_BUTTONS: {
        type: 'PropertyList',
        items: [
            //{ label : 'Preview', ui : '', command : 'WEditorCommands.Preview'},
            { label: 'Preview', ui: '', command: 'WEditorCommands.WSetEditMode', commandParameter: {'editMode': "PREVIEW", 'src': 'previewBtn'}},
            { label: 'Save', ui: '', command: 'WEditorCommands.Save', commandParameter: {'promptResultDialog': true, 'src': 'saveBtn'}},
            { label: 'Publish', ui: '', command: 'WEditorCommands.OpenPublishDialog'},
            { label: 'Upgrade', ui: '', command: 'WEditorCommands.UpgradeToPremium', commandParameter: {'referralAdditionalInfo': "TOP_PANEL"}}
        ]
    },

    PAGE_CONTEXT_MENU: {
        type: 'PropertyList',
        items: [
            {name: 'Duplicate', label: 'Duplicate page', command: 'WEditorCommands.DuplicatePage'},
            {name: 'Delete', label: 'Delete page', command: 'WEditorCommands.DeletePage'},
            {name: 'Settings', label: 'Page settings', command: 'EditorCommands.PageSettings'}
        ]
    },

    // For list of values, see wysiwyg.viewer.utils.TransitionUtils

    PAGE_TRANSITIONS: {
        type: 'PropertyList',
        items: [
            { label: 'None', langKey: 'PAGE_TRANS_NONE', value: 'none', selected: true},
            { label: 'Swipe Horizontal', langKey: 'PAGE_TRANS_SWIPE_HORIZONTAL', value: 'swipeHorizontalFullScreen'},
            { label: 'Swipe Vertical', langKey: 'PAGE_TRANS_SWIPE_VERTIVAL', value: 'swipeVerticalFullScreen'},
            { label: 'Cross Fade', langKey: 'PAGE_TRANS_CROSS_FADE', value: 'crossfade' },
            { label: 'Out-In', langKey: 'PAGE_TRANS_OUT_IN', value: 'outIn' }
        ]
    },

    EDIT_BAR: {
        type: 'PropertyList',
        items: [
            {name: 'duplicate', id: 'tbIconDuplicate', command: 'EditCommands.Duplicate' },
            {name: 'copy', id: 'tbIconCopy', command: 'EditCommands.Copy' },
            {name: 'cut', id: 'tbIconCut', command: 'EditCommands.Cut' },
            {name: 'paste', id: 'tbIconPaste', command: 'EditCommands.Paste' },
            {name: 'ordering', id: 'tbIconOrdering', command: 'EditCommands.Ordering' },
            {name: 'undo', id: 'tbIconUndo', command: 'EditCommands.Undo' },
            {name: 'redo', id: 'tbIconRedo', command: 'EditCommands.Redo' }
        ]
    },

    ADD_COMPONENT_TABS: {
        type: 'PropertyList',
        items: {
            // Text
            'title': {type: 'Button', category: 'text', 'iconSrc': 'buttons/add_text_01.png', 'label': 'ADD_TITLE', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'richTitle', styleId: 'txtNew'}, 'order': 10},
            'paragraph': {type: 'Button', category: 'text', 'iconSrc': 'buttons/add_text_03.png', 'label': 'ADD_PARAGRAPH', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'richText', styleId: 'txtNew'}, 'order': 20},

            // Image
            'image': {type: 'Button', category: 'image', 'iconSrc': 'buttons/add_media_01.png', 'label': 'ADD_IMAGE', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'WPhoto', styleId: 'wp1'}, 'order': 30},
            'imageNoFrame': {type: 'Button', category: 'image', 'iconSrc': 'buttons/add_media_02.png', 'label': 'ADD_IMAGE_WITHOUT_FRAME', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'WPhoto', styleId: 'wp2'}, 'order': 40},
            'imageFrame': {type: 'Button', category: 'image', 'iconSrc': 'buttons/add_media_03.png', 'label': 'ADD_IMAGE_WITH_FRAME', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'WPhoto', styleId: 'wp3'}, 'order': 50},
            'clipArt': {type: 'Button', category: 'image', 'iconSrc': 'buttons/add_box_shape_05.png', 'label': 'ADD_CLIP_ART', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'ClipArt', styleId: ''}, 'order': 60},

            // Gallery
            'grid': {type: 'Button', category: 'gallery', 'iconSrc': 'buttons/add_gallery_01.png', 'label': 'ADD_GRID_GALLERY', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addMatrixGallery', styleId: ''}, 'order': 70},
            'slideShow': {type: 'Button', category: 'gallery', 'iconSrc': 'buttons/add_gallery_02.png', 'label': 'ADD_SLIDESHOW_GALLERY', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addSlideShowGallery', styleId: ''}, 'order': 80},
            'slider': {type: 'Button', category: 'gallery', 'iconSrc': 'buttons/add_gallery_03.png', 'label': 'ADD_SLIDER_GALLERY', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addSliderGallery', styleId: ''}, 'order': 90},
//Experiment PaginatedGrid.New was promoted to feature on Mon Jul 30 14:08:11 IDT 2012
            'animatedGrid': {type: 'Button', category: 'gallery', 'iconSrc': 'buttons/add_gallery_04.png', 'label': 'ADD_ANIMATED_GRID_GALLERY', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addPaginatedGridGallery', styleId: ''}, 'order': 100},


            //Media
            'video': {type: 'Button', category: 'media', 'iconSrc': 'buttons/add_media_04.png', 'label': 'ADD_VIDEO', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addVideo', styleId: 'v1'}, 'order': 110},
            'soundCloud': {type: 'Button', category: 'media', 'iconSrc': 'buttons/add_media_05.png', 'label': 'ADD_SOUNDCLOUD_AUDIO', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addSoundCloud', styleId: ''}, 'order': 120},
            'documentMedia': {type: 'Button', category: 'media', 'iconSrc': 'buttons/add_media_06.png', 'label': 'ADD_DOCUMENT', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addDocumentMedia', styleId: ''}, 'order': 121},
            'itunesButtonMedia': {type: 'Button', category: 'media', 'iconSrc': 'buttons/itunesbutton.png', 'label': 'ADD_ITUNES_BUTTON', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addItunesButton', styleId: ''}, 'order': 420},

            // Shapes & Boxes
            'box': {type: 'Button', category: 'areas', 'iconSrc': 'buttons/add_box_shape_01.png', 'label': 'ADD_BOX', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'area', styleId: ''}, 'order': 130},

            'strip': {
                'type': 'Button',
                'category': 'areas',
                'iconSrc': 'buttons/add_box_shape_02.png',
                'label': 'BG_STRIP_TITLE',
                'command': 'WEditorCommands.AddComponent',
                'order': 140,
                'commandParameter': { 'compType': 'addBgImageStrip', 'styleId': 'bgis1'}
            },

            'verticalLine': {type: 'Button', category: 'areas', 'iconSrc': 'buttons/add_box_shape_03.png', 'label': 'ADD_VERTICAL_LINE', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'verticalLine', styleId: ''}, 'order': 150},
            'horizontalLine': {type: 'Button', category: 'areas', 'iconSrc': 'buttons/add_box_shape_04.png', 'label': 'ADD_HORIZONTAL_LINE', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'fiveGridLine', styleId: ''}, 'order': 160},
            'clipArtArea': {type: 'Button', category: 'areas', 'iconSrc': 'buttons/add_box_shape_05.png', 'label': 'ADD_CLIP_ART', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'ClipArt', styleId: ''}, 'order': 170},
            'svgShape': {type: 'Button', category: 'areas', iconSrc: 'buttons/svg-shape.png', label: 'ADD_SVG_SHAPE', command: 'WEditorCommands.AddComponent', commandParameter: { compType: 'addSvgShape', styleId: 'assh'}, order: 180 },

            // Buttons & Menus
            'defButton': {type: 'Button', category: 'buttons', 'iconSrc': 'buttons/add_btns_02.png', 'label': 'ADD_DEFAULT_BUTTON', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addButton', styleId: 'b1'}, 'order': 180},
            'largeButton': {type: 'Button', category: 'buttons', 'iconSrc': 'buttons/add_btns_03.png', 'label': 'ADD_LARGE_BUTTON', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addButton', styleId: 'b3'}, 'order': 190},
            'emphasisButton': {type: 'Button', category: 'buttons', 'iconSrc': 'buttons/add_btns_04.png', 'label': 'ADD_EMPHASIS_BUTTON', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addButton', styleId: 'b4'}, 'order': 200},
            'textButton': {type: 'Button', category: 'buttons', 'iconSrc': 'buttons/add_btns_01.png', 'label': 'ADD_TEXT_BUTTON', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addButton', styleId: 'b2'}, 'order': 210},
//            {type:'Button', category : 'buttons',   'iconSrc':'buttons/add_btns_06.png', 'label':'ADD_TEXT_MENU', command:'WEditorCommands.AddComponent', commandParameter:{compType: 'horizontalMenu', styleId:'rt1'}},
//            {type:'Button', category : 'buttons',   'iconSrc':'buttons/add_btns_05.png', 'label':'ADD_BUTTONS_MENU', command:'WEditorCommands.AddComponent', commandParameter:{compType: 'horizontalMenu', styleId:'rt2'}},
            'payPal': {type: 'Button', category: 'buttons', 'iconSrc': 'buttons/add_widgets_06.png', 'label': 'ADD_PAYPAL', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addPayPalButton', styleId: ''}, 'order': 220},
            // AdminLogin.New experiment {type:'Button', category : 'buttons',   'iconSrc':'buttons/add_btns_08.png', 'label':'ADD_ADMIN_LOGIN', command:'WEditorCommands.AddComponent', commandParameter:{compType: 'addAdminLoginButton', styleId:''}},
//            {type:'Button', category : 'buttons',    'iconSrc':'buttons/icon_placeholder.png', 'label':'ADD_ICON_BAR', command:'WEditorCommands.AddComponent', commandParameter:{compType: 'addLinkBar', styleId:''}},
            'textMenu': {type: 'Button', category: 'buttons', 'iconSrc': 'buttons/add_btns_06.png', 'label': 'ADD_TEXT_MENU', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'dropDownMenu', styleId: 'ddm1'}, 'order': 230},
            'buttonsMenu': {type: 'Button', category: 'buttons', 'iconSrc': 'buttons/add_btns_05.png', 'label': 'ADD_BUTTONS_MENU', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'dropDownMenu', styleId: 'ddm2'}, 'order': 240},
            'itunesButtonButtons': {type: 'Button', category: 'buttons', 'iconSrc': 'buttons/itunesbutton.png', 'label': 'ADD_ITUNES_BUTTON', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addItunesButton', styleId: ''}, 'order': 250},

            //Online Store
            'ecomGallery': {type: 'Button', category: 'ecom', 'iconSrc': "buttons/add_product.png", 'label': 'ECOM_PRODUCTS_LIST_COMP', command: 'WEditorCommands.AddAppComponent', commandParameter: {type: 'wixappsPart', widgetId: '30b4a102-7649-47d9-a60b-bfd89dcca135'}, 'order': 500},
            'ecomCart': {type: 'Button', category: 'ecom', 'iconSrc': "buttons/add_shoppingcart.png", 'label': 'ECOM_CART_COMP', command: 'WEditorCommands.AddAppComponent', commandParameter: {type: 'wixappsPart', widgetId: '5fca0e8b-a33c-4c18-b8eb-da50d7f31e4a'}, 'order': 510},
            'ecomViewCart': {type: 'Button', category: 'ecom', 'iconSrc': "buttons/add_viewcart.png", 'label': 'ECOM_VIEW_CART_COMP', command: 'WEditorCommands.AddAppComponent', commandParameter: {type: 'wixappsPart', widgetId: 'c029b3fd-e8e4-44f1-b1f0-1f83e437d45c'}, 'order': 520},
            'ecomAddToCart': {type: 'Button', category: 'ecom', 'iconSrc': "buttons/add_add2cart.png", 'label': 'ECOM_ADD_TO_CART_COMP', command: 'WEditorCommands.AddAppComponent', commandParameter: {type: 'wixappsPart', widgetId: 'c614fb79-dbec-4ac7-b9b0-419669fadecc'}, 'order': 530},

            // Social
            'fbLike': {type: 'Button', category: 'social', 'iconSrc': 'buttons/add_social_01.png', 'label': 'ADD_FACEBOOK_LIKE', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addFacebookLike', styleId: ''}, 'order': 250},
            'fbComments': {type: 'Button', category: 'social', 'iconSrc': 'buttons/add_social_02.png', 'label': 'ADD_FACEBOOK_COMMENTS', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addFacebookComment', styleId: ''}, 'order': 260},
            'twitterFollow': {type: 'Button', category: 'social', 'iconSrc': 'buttons/add_twitter_icon.png', 'label': 'ADD_TWITTER_FOLLOW', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addTwitterFollow', styleId: ''}, 'order': 270},
            'twitterTweet': {type: 'Button', category: 'social', 'iconSrc': 'buttons/add_twitter_icon.png', 'label': 'ADD_TWITTER_TWEET', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addTwitterTweet', styleId: ''}, 'order': 280},
            'gglPlus': {type: 'Button', category: 'social', 'iconSrc': 'buttons/add_social_06.png', 'label': 'ADD_GOOGLE_PLUS_ONE', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addGooglePlusOne', styleId: ''}, 'order': 300},
            'socialBar': {type: 'Button', category: 'social', 'iconSrc': 'buttons/add_socialbar_icon.png', 'label': 'ADD_SOCIAL_BAR', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addSocialBar', styleId: ''}, 'order': 310},
            'VKShare': {type: 'Button', category: 'social', 'iconSrc': 'buttons/add_social_09.png', 'label': 'FPP_VKShareButton', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addVKShare', styleId: ''}, 'order': 311},
            'pinterestFollow': { type: 'Button', category: 'social', 'iconSrc': 'buttons/pinterest-follow.png', 'label': 'ADD_PINTEREST_FOLLOW', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addPinterestFollow', styleId: '' }, 'order': 313},
            'facebookShare': {type: 'Button', category: 'social', 'iconSrc': 'buttons/add_social_02.png', 'label': 'ADD_FACEBOOK_SHARE', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addFacebookShare', styleId: 'fs1'}, 'order': 314},

            // Widgets
            'contactForm': {type: 'Button', category: 'widgets', 'iconSrc': 'buttons/add_social_07.png', 'label': 'ADD_CONTACT_FORM', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addContactForm', styleId: ''}, 'order': 320},
            'gglMaps': {type: 'Button', category: 'widgets', 'iconSrc': 'buttons/google_maps_icon.png', 'label': 'ADD_GOOGLE_MAP', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addGoogleMap', styleId: ''}, 'order': 330},
            'htmlComp': {type: 'Button', category: 'widgets', 'iconSrc': 'buttons/add_widgets_02.png', 'label': 'ADD_HTML', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addHtmlComponent', styleId: ''}, 'order': 340},
            'flashComp': {type: 'Button', category: 'widgets', 'iconSrc': 'buttons/add_widgets_05.png', 'label': 'ADD_FLASH', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addFlashComponent', styleId: ''}, 'order': 350},
            'payPalWidget': {type: 'Button', category: 'widgets', 'iconSrc': 'buttons/add_widgets_06.png', 'label': 'ADD_PAYPAL', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addPayPalButton', styleId: ''}, 'order': 360},
            'flickerGallery': {type: 'Button', category: 'widgets', 'iconSrc': 'buttons/add_widgets_03.png', 'label': 'ADD_FLICKR_GALLERY', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addFlickrBadge', styleId: ''}, 'order': 370},
            'eBay': {type: 'Button', category: 'widgets', 'iconSrc': 'buttons/add_widgets_04.png', 'label': 'ADD_EBAY_ITEMS_BY_SELLER', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addEbayItemsBySeller', styleId: ''}, 'order': 380},
            'adminLogin': {type: 'Button', category: 'widgets', 'iconSrc': 'buttons/add_btns_08.png', 'label': 'ADD_ADMIN_LOGIN', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addAdminLoginButton', styleId: ''}, 'order': 390},

            //Experiment Login.New was promoted to feature on Thu Oct 18 10:24:45 IST 2012

            'memberLogin': {type: 'Button', category: 'widgets', 'iconSrc': 'buttons/add_btns_09.png', 'label': 'ADD_LOGIN', command: 'WEditorCommands.AddSMDependantComponent', commandParameter: {compType: 'addLoginButton', styleId: ''}, 'order': 400},

            //Experiment Blog.New was promoted to feature on Sun Oct 27 2013 18:25:38 IST 2013
            // Blog
            "blogFeaturedGallery": {type: "Button", category: "blog", "iconSrc": "buttons/add_blog_featured_gallery.png", "label": "BLOG_FEATURED_GALLERY_PART", command: "WEditorCommands.AddAppComponent", commandParameter: {type: "wixappsPart", widgetId: "1b8c501f-ccc2-47e7-952a-47e264752614"}, "order": 510},
            "blogFeaturedList": {type: "Button", category: "blog", "iconSrc": "buttons/add_blog_featured_list.png", "label": "BLOG_FEATURED_LIST_PART", command: "WEditorCommands.AddAppComponent", commandParameter: {type: "wixappsPart", widgetId: "f72fe377-8abc-40f2-8656-89cfe00f3a22"}, "order": 520},
            "blogTagCloud": {type: "Button", category: "blog", "iconSrc": "buttons/add_blog_tag_cloud.png", "label": "BLOG_TAG_CLOUD_PART", command: "WEditorCommands.AddAppComponent", commandParameter: {type: "wixappsPart", widgetId: "e000b4bf-9ff1-4e66-a0d3-d4b365ba3af5"}, "order": 530},
            "blogTicker": {type: "Button", category: "blog", "iconSrc": "buttons/add_blog_ticker.png", "label": "BLOG_TICKER_PART", command: "WEditorCommands.AddAppComponent", commandParameter: {type: "wixappsPart", widgetId: "33a9f5e0-b083-4ccc-b55d-3ca5d241a6eb"}, "order": 540},


            'audioPlayer': {type: 'Button', category: 'media', 'iconSrc': 'buttons/add_media_audioplayer.png', 'label': 'AUDIO_PLAYER', command: 'WEditorCommands.AddComponent', commandParameter: {compType: 'addAudioPlayer', styleId: ''}, 'order': 410}
        }
    },

    SETTINGS_PANEL: {
        type: 'PropertyList',
        items: [
            {'type': 'Button',
                'iconSrc': 'buttons/site_name.png',
                'toggleMode': false,
                'label': 'SITE_NAME',
                'command': 'WEditorCommands.ShowSiteName'
            },
            {'type': 'Button',
                'iconSrc': 'buttons/seo.png',
                'toggleMode': false,
                'label': 'SEO',
                'command': 'WEditorCommands.ShowSEO'
            },
            {'type': 'Button',
                'iconSrc': 'buttons/social_settings.png',
                'toggleMode': false,
                'label': 'SOCIAL_SETTINGS',
                'command': 'WEditorCommands.ShowSocial'
            },
            {'type': 'Button',
                'iconSrc': 'buttons/statistics.png',
                'toggleMode': false,
                'label': 'STATISTICS',
                'command': 'WEditorCommands.ShowStatistics'
            },
            {'type': 'Button',
                'iconSrc': 'buttons/favicon_thumbnail.png',
                'toggleMode': false,
                'label': 'FAVICON',
                'command': 'WEditorCommands.ShowFaviconAndThumbnail'
            }
        ]
    },
//Experiment SocialPanel.New was promoted to feature on Mon Jul 23 14:28:11 IDT 2012
    SETTINGS_PANEL_FB_MODE: {
        type: 'PropertyList',
        items: [
            {'type': 'Button',
                'iconSrc': 'buttons/site_name.png',
                'toggleMode': false,
                'label': 'SITE_NAME',
                'command': 'WEditorCommands.ShowSiteName'
            },
            {'type': 'Button',
                'iconSrc': 'buttons/statistics.png',
                'toggleMode': false,
                'label': 'STATISTICS',
                'command': 'WEditorCommands.ShowStatistics'
            },
            {'type': 'Button',
                'iconSrc': 'buttons/add_socialbar_icon.png',
                'toggleMode': false,
                'label': 'SOCIAL',
                'command': 'WEditorCommands.ShowSocial'
            }
        ]
    },


    DESIGN_SUB_PANELS: {
        type: 'PropertyList',
        items: [
//             {'type': 'Button',
//              'iconSrc': 'editor/toolbar/design_switch_theme.png',
//              'toggleMode': false,
//              'label': 'Switch Theme',
//              'command': 'WEditorCommands.ShowThemeSwitchPanel'
//             },
            {
                'type': 'Button',
                'iconSrc': 'buttons/design_background.png',
                'toggleMode': false,
                'label': 'BACKGROUND',
                'command': 'WEditorCommands.ShowBackgroundDesignPanel',
                commandParameter: {src: 'design'}
            },
            {
                'type': 'Button',
                'iconSrc': 'buttons/design_colors.png',
                'toggleMode': false,
                'label': 'COLORS',
                'command': 'WEditorCommands.ShowColorsPanel',
                commandParameter: {src: ''}
            },
            {
                'type': 'Button',
                'iconSrc': 'buttons/design_fonts.png',
                'toggleMode': false,
                'label': 'FONTS',
                'command': 'WEditorCommands.ShowFontsPanel',
                commandParameter: {src: ''}
            }
        ]
    },

    FONT_STYLE_NAMES: {
        type: 'map',
        items: {
            'font_0': {name: 'FONT_0_NAME', label: 'FONT_0_LABEL'},
            'font_1': {name: 'FONT_1_NAME', label: 'FONT_1_LABEL'},
            'font_2': {name: 'FONT_2_NAME', label: 'FONT_2_LABEL'},
            'font_3': {name: 'FONT_3_NAME', label: 'FONT_3_LABEL'},
            'font_4': {name: 'FONT_4_NAME', label: 'FONT_4_LABEL'},
            'font_5': {name: 'FONT_5_NAME', label: 'FONT_5_LABEL'},
            'font_6': {name: 'FONT_6_NAME', label: 'FONT_6_LABEL'},
            'font_7': {name: 'FONT_7_NAME', label: 'FONT_7_LABEL'},
            'font_8': {name: 'FONT_8_NAME', label: 'FONT_8_LABEL'},
            'font_9': {name: 'FONT_9_NAME', label: 'FONT_9_LABEL'},
            'font_10': {name: 'FONT_10_NAME', label: 'FONT_10_LABEL'}
        }
    },

    COLOR_DESIGN: {
        type: 'PropertyList',

        items: [
            {
                "uri": "7ea753_219f22dda9e5ccd0affed9e3b110fb98.png_128",
                "description": "",
                "label": "Amnesia Sunshine"
            },
            {
                "uri": "7ea753_dcd277354dd809e9df79ed44153121fb.png_128",
                "description": "",
                "label": "Crazy Mamba"
            },
            {
                "uri": "7ea753_00e0d3d755a1cf6f3a9a916cd23b09d1.png_128",
                "description": "",
                "label": "Lipstic Mambo"
            },
            {
                "uri": "7ea753_0eb871567a9aaa9656136855868d492d.png_128",
                "description": "",
                "label": "KoKos Tree"
            },
            {
                "uri": "7ea753_6083bcdb7c36e92825320a8b59a607f5.png_128",
                "description": "",
                "label": "Shori's Birthday"
            },
            {
                "uri": "7ea753_e5c98bb1b8b15a040b0b6d7f130d8026.png_128",
                "description": "",
                "label": "Memories of Meddo"
            },

            {
                "uri": "7ea753_b13e95e00326ed9988a4f53c8e56b3af.png_128",
                "description": "",
                "label": "Purple Haze"
            }
        ]
    },

    STYLES: {
        type: 'StyleList',
        styleItems: {
            'wysiwyg.viewer.components.svgshape.SvgShape': ['assh'],
            'wysiwyg.viewer.components.HorizontalMenu': ['rt1', 'rt2', 'rt3'],
            'wysiwyg.viewer.components.menus.DropDownMenu': ['ddm1', 'ddm2', 'ddm3'],
            'wysiwyg.viewer.components.WPhoto': ['wp1', 'wp2', 'wp3', 'wp4'],
            'core.components.Page': ['p1', 'p2', 'p3'],
            'wixapps.integration.components.AppPage': ['p1', 'p2', 'p3'],
            'wysiwyg.viewer.components.Video': ['v1'],
            'wixapps.integration.components.Video': ['v1'],
            'wysiwyg.viewer.components.TwitterFeed': ['twf1'],
            'wysiwyg.viewer.components.WTwitterTweet': ['twt1'],
            'wysiwyg.viewer.components.WTwitterFollow': ['tf1'],
            'wysiwyg.viewer.components.GoogleMap': ['gm1'],
            'wysiwyg.viewer.components.EbayItemsBySeller': ['eib1'],
            'wysiwyg.viewer.components.HtmlComponent': ['htco1'],
            'wysiwyg.viewer.components.ContactForm': ['cf1', 'cf2'],
            'wysiwyg.viewer.components.WFacebookComment': ['fbc1'],
            'wysiwyg.viewer.components.WFacebookLike': ['fbl1'],
            'wysiwyg.viewer.components.WGooglePlusOne': ['gp1'],
            'wysiwyg.viewer.components.PinterestPin': ['pp1'],
            'wysiwyg.viewer.components.ClipArt': ['ca1'],
            'wysiwyg.viewer.components.FlashComponent': ['swf1'],
            'wysiwyg.viewer.components.AdminLogin': ['adm0'],
            'wysiwyg.viewer.components.AdminLoginButton': ['admb0'],
            'core.components.Container': ['c1', 'c2', 'c3', 'c4'],
            'core.components.ContainerOBC': ['c1', 'c2', 'c3', 'c4'],
            'wysiwyg.viewer.components.SiteButton': ['b1', 'b2', 'b3', 'b4'],
            'wysiwyg.viewer.components.FiveGridLine': ['hl1', 'hl2', 'hl3', 'hl4'],
            'wysiwyg.viewer.components.VerticalLine': ['vl1', 'vl2', 'vl3', 'vl4'],
            'wysiwyg.viewer.components.ScreenWidthContainer': ['sc1', 'sc2', 'sc3', 'sc4'],
            'wysiwyg.viewer.components.FooterContainer': ['fc1', 'fc2', 'fc3'],
            'wysiwyg.viewer.components.HeaderContainer': ['hc1', 'hc2', 'hc3'],
            'wysiwyg.viewer.components.PagesContainer': ['pc1', 'pc2'],
            'wysiwyg.viewer.components.FlickrBadgeWidget': ['fk1'],
            'wysiwyg.viewer.components.SoundCloudWidget': ['scw1'],
            'wysiwyg.viewer.components.documentmedia.DocumentMedia': ['dm1'],
            'wysiwyg.viewer.components.PayPalButton': ['ppb0'],
            'tpa.viewer.components.TPAComponent': ['tpacomp0'],
            'tpa.viewer.components.TPAGluedWidget': ['tpagw0'],
            'tpa.viewer.components.TPAWidget': ['tpaw0'],
            'tpa.viewer.components.TPASection': ['tpas0'],

            'wysiwyg.viewer.components.LinkBar': ['lb1'],
            'wysiwyg.viewer.components.MatrixGallery': ['mg1', 'mg2', 'mg3'],
            'wysiwyg.viewer.components.SlideShowGallery': ['ssg1', 'ssg2', 'ssg3'],
            'wysiwyg.viewer.components.SliderGallery': ['sg1', 'sg2', 'sg3'],
            'wysiwyg.viewer.components.WRichText': ['txt1'],
            'wysiwyg.viewer.components.VerticalRepeater': ['vr1', 'vr2', 'vr3', 'vr4'],
            'wixapps.integration.components.HorizontalRepeater': ['hr1'],
            'wysiwyg.viewer.components.wixhomepage.HomePageLogin': ['wix_login1'],
            'wysiwyg.viewer.components.wixhomepage.LanguagesDropDown': ['wix_lang1'],
            'wysiwyg.viewer.components.wixhomepage.WixOfTheDay': ['wix_of_the_day1'],
            'wysiwyg.viewer.components.wixhomepage.WixHomepageMenu': ['wix_homepage_menu1', 'wix_homepage_menu2'],
            //Experiment PaginatedGrid.New was promoted to feature on Mon Jul 30 14:08:11 IDT 2012
            'wysiwyg.viewer.components.PaginatedGridGallery': ['pagg1', 'pagg2', 'pagg3'],
            'wysiwyg.viewer.components.mobile.TinyMenu': ['tm1', 'tm2'],

            //Experiment Login.New was promoted to feature on Thu Oct 18 10:24:45 IST 2012
            'wysiwyg.viewer.components.LoginButton': ['lgn0'],
            'wysiwyg.viewer.components.SelectableSliderGallery': ['sg1', 'sg2', 'sg3'],
            'wixapps.integration.components.SelectableSliderGallery': ['sg1', 'sg2', 'sg3'],
            'productGallery': ['pgg_cg0'],
            'contentGallery': ['pgg_cg1'],
            'minipostGallery': ['pgg_cg2'],
            'hoverGallery': ['pgg_cg3'],
            'wysiwyg.viewer.components.TableComponent': ['tblc1'],
            'wysiwyg.viewer.components.inputs.NumberInput': ['numi1'],
            'ecomAddProduct': ['ecom_ap1'],
            'ecomApplyCoupon': ['ecom_apl1'],
            'ecomRemoveFromCart': ['ecom_rfc1'],
            'ecomViewCart': ['ecom_vc1', 'ecom_vc2', 'ecom_vc3'],
            'ecomCheckout': ['ecom_co1', 'ecom_co2', 'ecom_co3'],
            'ecomAddToCart': ['ecom_atc1', 'ecom_atc2', 'ecom_atc3'],
            'ecomCouponBox': ['ecom_cbx1'],
            'ecomCartHeader': ['ecom_ch1'],
            'ecomEmptyCartBG': ['ecom_ecbg1'],
            'ecomTextInput': ['ecom_ti1'],
            'wixapps.integration.components.inputs.ErasableTextInput': ['ecom_eti1'],
            'ecomShippingComboBox': ['ecom_scb1'],
			'ecomFeedbackCheckout': ['ecom_fmc1'],
			'ecomFeedbackContinueShopping': ['ecom_fmcs1'],
			'ecomFeedbackContinueShopping2': ['ecom_fmcs2'],
            //'wixapps.integration.components.inputs.TextInput': ['wa_ti1', 'wa_ti2', 'wa_ti3'],
            'wixapps.integration.components.inputs.TextInput': ['wa_ti1'],
            'wysiwyg.viewer.components.inputs.TextAreaInput': ['wa_tai1', 'wa_tai2', 'wa_tai3'],
            'wysiwyg.viewer.components.inputs.RadioGroupInput': ['wa_rg1', 'wa_rg2', 'wa_rg3'],
            'wixapps.integration.components.inputs.CheckBoxGroupInput': ['wa_cbg1', 'wa_cbg2', 'wa_rg3'],
            'wysiwyg.viewer.components.inputs.ComboBoxInput': ['wa_cb1', 'wa_cb2', 'wa_cb3'],
            'wysiwyg.viewer.components.AudioPlayer': ['ap1', 'ap2'],
            'wysiwyg.viewer.components.ItunesButton': ['ib1'],
            'wysiwyg.viewer.components.PinterestFollow': ['pf1'],
            'wysiwyg.viewer.components.VKShareButton': ['vks1'],
            'wysiwyg.viewer.components.FacebookShare': ['fs1'],
            'wysiwyg.viewer.components.BgImageStrip': ['bgis1', 'bgis2', 'bgis3', 'bgis4'],
            'blogPostListBoxStyle': ['c1', 'c2', 'c3', 'c4']
        }
    },

    STYLE_DEFAULT_SKIN: {
        type: 'map',
        items: {
            ddm1: 'wysiwyg.viewer.skins.dropmenu.TextOnlyMenuNSkin',
            ddm2: 'wysiwyg.viewer.skins.dropmenu.SolidColorMenuNSkin',
            ddm3: 'wysiwyg.viewer.skins.dropmenu.ShinyMenuINSkin',
            pagg1: 'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridOverlay',
            pagg2: 'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridArrowsOutside',
            pagg3: 'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridRibbonArrows',
            'ap1': 'wysiwyg.viewer.skins.audioplayer.SimplePlayer',
            'ap2': 'wysiwyg.viewer.skins.audioplayer.ShinyPlayer',
            'bgis1': 'skins.viewer.bgimagestrip.BgImageStripSkin',
            'bgis2': 'skins.viewer.bgimagestrip.BevelScreenSkin',
            'bgis3': 'skins.viewer.bgimagestrip.IronScreenSkin',
            'bgis4': 'skins.viewer.bgimagestrip.DoubleBorderScreenSkin'
        }
    },

    'HELP_IDS': {
        type: 'map',
        'items': {
            'SiteAdressOpenHelpForGoogleDomainCampaign': '/node/21565',
            'COMPONENT_PANEL_SvgShape': '/node/18920',
            'COMPONENT_PANEL_WPhoto': '/node/6036',
            'COMPONENT_PANEL_PagesContainer': '/node/6073',
            'COMPONENT_PANEL_HorizontalMenu': '/node/6052',
            'COMPONENT_PANEL_DropDownMenu': '/node/7794',
            'COMPONENT_PANEL_SiteButton': '/node/6049',
            'COMPONENT_PANEL_WRichText': '/node/6035',
            'COMPONENT_PANEL_Container': '/node/6045',
            'COMPONENT_PANEL_GoogleMap': '/node/6062',
            'COMPONENT_PANEL_FiveGridLine': '/node/6047',
            'COMPONENT_PANEL_VerticalLine': '/node/6047',
            'COMPONENT_PANEL_ScreenWidthContainer': '/node/6046',
            'COMPONENT_PANEL_BgImageStrip': '/node/6046',
            'COMPONENT_PANEL_WFacebookLike': '/node/6053',
            'COMPONENT_PANEL_WFacebookComment': '/node/6054',
            'COMPONENT_PANEL_WGooglePlusOne': '/node/6058',
            'COMPONENT_PANEL_SoundCloudWidget': '/node/6039',
            'COMPONENT_PANEL_DocumentMedia': '/node/18021',
            'COMPONENT_PANEL_WTwitterTweet': '/node/6056',
            'COMPONENT_PANEL_TwitterFeed': '/node/6057',
            'COMPONENT_PANEL_WTwitterFollow': '/node/6055',
            'COMPONENT_PANEL_SlideShowGallery': '/node/6043',
            'COMPONENT_PANEL_MatrixGallery': '/node/6040',
            'COMPONENT_PANEL_PaginatedGridGallery': '/node/7623',
            'COMPONENT_PANEL_SliderGallery': '/node/6044',
            'COMPONENT_PANEL_LinkBar': '/node/6060',
            'COMPONENT_PANEL_SocialBar': '/node/6060',
            'COMPONENT_PANEL_HtmlComponent': '/node/6063',
            'COMPONENT_PANEL_HeaderContainer': '/node/6083',
            'COMPONENT_PANEL_FooterContainer': '/node/19804',
            'COMPONENT_PANEL_Video': '/node/6038',
            'COMPONENT_PANEL_FlashComponent': '/node/7223',
            'COMPONENT_PANEL_AdminLoginButton': '/node/7417',
            'COMPONENT_PANEL_ClipArt': '/node/6048',
            'COMPONENT_PANEL_PayPalButton': '/node/7221',
            'COMPONENT_PANEL_ContactForm': '/node/6059',
            'COMPONENT_PANEL_RichText': '/node/6035',
            'COMPONENT_PANEL_EbayItemsBySeller': '/node/6066',
            'COMPONENT_PANEL_FlickrBadgeWidget': '/node/6064',
            'COMPONENT_PANEL_MultiSelectProxy': '/node/6071',
            'COMPONENT_PANEL_TPAWidget': '/node/8825',
            'COMPONENT_PANEL_TPASection': '/node/8825',
            'COMPONENT_PANEL_LoginButton': '/node/9222', //Experiment Login.New was promoted to feature on Thu Oct 18 10:24:45 IST 2012
            "COMPONENT_PANEL_AppPart2": "/node/14832",
            'COMPONENT_PANEL_FixedPositionComponents': '/node/20595',
            'COMPONENT_PANEL_FixedTinyMenu': '/node/21866',
            'CHOOSE_STYLE_WPhoto': '/node/6037',
            'CHOOSE_STYLE_HorizontalMenu': '/node/6082',
            'CHOOSE_STYLE_DropDownMenu': '/node/7771',
            'CHOOSE_STYLE_SiteButton': '/node/6051',
            'CHOOSE_STYLE_WRichText': '/node/6035',
            'CHOOSE_STYLE_Container': '/node/9643',
            'CHOOSE_STYLE_GoogleMap': '/node/6062',
            'CHOOSE_STYLE_FiveGridLine': '/node/9643',
            'CHOOSE_STYLE_VerticalLine': '/node/9643',
            'CHOOSE_STYLE_ScreenWidthContainer': '/node/9643',
            'CHOOSE_STYLE_WFacebookLike': '/node/6053',
            'CHOOSE_STYLE_WFacebookComment': '/node/6054',
            'CHOOSE_STYLE_WGooglePlusOne': '/node/6058',
            'CHOOSE_STYLE_SoundCloudWidget': '/node/6039',
            'CHOOSE_STYLE_WTwitterTweet': '/node/6056',
            'CHOOSE_STYLE_TwitterFeed': '/node/6057',
            'CHOOSE_STYLE_WTwitterFollow': '/node/6055',
            'CHOOSE_STYLE_SlideShowGallery': '/node/6042',
            'CHOOSE_STYLE_MatrixGallery': '/node/6042',
            'CHOOSE_STYLE_SliderGallery': '/node/6042',
            'CHOOSE_STYLE_LinkBar': '/node/6060',
            'CHOOSE_STYLE_SocialBar': '/node/6060',
            'CHOOSE_STYLE_HtmlComponent': '/node/6063',
            'CHOOSE_STYLE_HeaderContainer': '/node/6083',
            'CHOOSE_STYLE_FooterContainer': '/node/6083',
            'CHOOSE_STYLE_Video': '/node/6038',
            'CHOOSE_STYLE_ClipArt': '/node/6048',
            'CHOOSE_STYLE_ContactForm': '/node/6059',
            'CHOOSE_STYLE_RichText': '/node/6035',
            'CHOOSE_STYLE_EbayItemsBySeller': '/node/6066',
            'CHOOSE_STYLE_FlickrBadgeWidget': '/node/6065',
            'CHOOSE_STYLE_MultiSelectProxy': '/node/6071',
            'CHOOSE_STYLE_Page': '/node/23770',
            'ADVANCED_STYLING_WPhoto': '/node/6037',
            'ADVANCED_STYLING_PagesContainer': '/node/6073',
            'ADVANCED_STYLING_HorizontalMenu': '/node/6082',
            'ADVANCED_STYLING_DropDownMenu': '/node/7771',
            'ADVANCED_STYLING_SiteButton': '/node/6051',
            'ADVANCED_STYLING_WRichText': '/node/6035',
            'ADVANCED_STYLING_Container': '/node/9643',
            'ADVANCED_STYLING_GoogleMap': '/node/6062',
            'ADVANCED_STYLING_FiveGridLine': '/node/9643',
            'ADVANCED_STYLING_VerticalLine': '/node/9643',
            'ADVANCED_STYLING_ScreenWidthContainer': '/node/9643',
            'ADVANCED_STYLING_WFacebookLike': '/node/6053',
            'ADVANCED_STYLING_WFacebookComment': '/node/6054',
            'ADVANCED_STYLING_WGooglePlusOne': '/node/6058',
            'ADVANCED_STYLING_SoundCloudWidget': '/node/6039',
            'ADVANCED_STYLING_WTwitterTweet': '/node/6056',
            'ADVANCED_STYLING_TwitterFeed': '/node/6057',
            'ADVANCED_STYLING_WTwitterFollow': '/node/6055',
            'ADVANCED_STYLING_SlideShowGallery': '/node/6042',
            'ADVANCED_STYLING_MatrixGallery': '/node/6042',
            'ADVANCED_STYLING_SliderGallery': '/node/6042',
            'ADVANCED_STYLING_LinkBar': '/node/6060',
            'ADVANCED_STYLING_SocialBar': '/node/6060',
            'ADVANCED_STYLING_HtmlComponent': '/node/6063',
            'ADVANCED_STYLING_HeaderContainer': '/node/6083',
            'ADVANCED_STYLING_FooterContainer': '/node/6083',
            'ADVANCED_STYLING_Video': '/node/6038',
            'ADVANCED_STYLING_ClipArt': '/node/6048',
            'ADVANCED_STYLING_ContactForm': '/node/6059',
            'ADVANCED_STYLING_RichText': '/node/6035',
            'ADVANCED_STYLING_EbayItemsBySeller': '/node/6066',
            'ADVANCED_STYLING_FlickrBadgeWidget': '/node/6065',
            'ADVANCED_STYLING_MultiSelectProxy': '/node/6071',
            'ADVANCED_STYLING_Page': '/node/6074',
            'ORGANIZE_photos': '/node/6041',
            'ORGANIZE_social_icons': '/node/6061',
            'ORGANIZE_SlideShowGallery': '/node/6041',
            'ORGANIZE_SliderGallery': '/node/6041',
            'ORGANIZE_MatrixGallery': '/node/6041',
            'TopBar': '/help-categories',
            'MasterPage': '/node/6075',
            'PreviewPage': '/node/6085',
            'SIDE_PANEL_PagesPanel': '/node/6073',
            'HELPLET_LEARN_MORE': '/node/8570',
            'SIDE_PANEL_DesignPanel': '/help_category/1486',
            'SIDE_PANEL_BackgroundDesignPanel': '/node/22026',
            'SIDE_PANEL_BackgroundEditorPanel': '/node/22026',
            'SIDE_PANEL_ColorsDesignPanel': '/node/6069',
            'SIDE_PANEL_DynamicPalettePanel': '/node/6069',
            'SIDE_PANEL_FontsPanel': '/node/6070',
            'SIDE_PANEL_CustomizeFontsPanel': '/node/6070',
            'SIDE_PANEL_MasterComponentPanel': '/help_category/1485',
            'SIDE_PANEL_AddComponentPanel_text': '/node/6035',
            'SIDE_PANEL_AddComponentPanel_media': '/termpage/1606',
            'SIDE_PANEL_AddComponentPanel_gallery': '/termpage/1607',
            'SIDE_PANEL_AddComponentPanel_areas': '/termpage/1608',
            'SIDE_PANEL_AddComponentPanel_buttons': '/termpage/1609',
            'SIDE_PANEL_AddComponentPanel_social': '/termpage/1610',
            'SIDE_PANEL_AddComponentPanel_widgets': '/termpage/1611',
            'SIDE_PANEL_SettingsPanel': '/help_category/1489',
            'SIDE_PANEL_MobileAddPanel': '/node/1486',
            'SIDE_PANEL_feedbackComments': '/node/21639',
            'SETTINGS_SUB_PANEL_SiteName': '/node/6076',
            'SETTINGS_SUB_PANEL_FaviconAndThumbnail': '/node/6077',
            'SETTINGS_SUB_PANEL_Social': '/termpage/2008',
            'SETTINGS_SUB_PANEL_SOCIAL_LEARN_MORE': '/node/7747',
            'SETTINGS_SUB_PANEL_SEO': '/node/6080',
            'SETTINGS_SUB_PANEL_Statistics': '/node/6081',
            'PAGE_SETTINGS_SUB_PANEL': '/node/6074',
            'IMAGE_GALLERY_backgrounds': '/node/22026',
            'IMAGE_GALLERY_favicon': '/node/6078',
            'IMAGE_GALLERY_clipart': '/node/6079',
            'IMAGE_GALLERY_photos': '/node/6036',
            'IMAGE_GALLERY_SlideShowGallery': '/node/6042',
            'IMAGE_GALLERY_MatrixGallery': '/node/6042',
            'IMAGE_GALLERY_SliderGallery': '/node/6042',
            'IMAGE_GALLERY_social_icons': '/node/6060',
            'LINK_DIALOG': '/node/6050',
            'PAGE_SECURITY_DIALOG': '/node/8829',//Experiment PageSecurity.New was promoted to feature on Thu Oct 18 11:19:37 IST 2012
            'FontPicker': '/node/6070',
            'ColorPicker': '/node/6068',
            'FirstTimeInEditor': '/node/6769',
            'FirstTimeInAppBuilder': '/node/15498',
            'FirstFontStyleChange': '/node/6070',
            'ELEMENT_OUT_OF_SITE_GRID': '/node/13538',
            'OUT_OF_VIEW_DIALOG_FixedPositionMenu': '/node/21866',
            'COMPONENT_PANEL_AudioPlayer': '/node/8645',
            'SiteAdressOpenHelp': '/node/17354',
            'APP_BUILDER_CHOOSE_TEMPLATE2': '/termpage/3152',
            'APP_BUILDER_ADD_FIELD': '/node/15409',
            'COMPONENT_PANEL_TinyMenu': '/node/18239',
            'LANGUAGE_SUPPORT_DIALOG': '/node/18283',
            'SETTINGS_SUB_PANEL_MOBILE_OPTIMIZED_VIEW': '/node/19194',
            'SETTINGS_SUB_PANEL_MOBILE_VIEW': '/node/19195',
            'SETTINGS_SUB_PANEL_CONTACT_INFORMATION': '/node/19196',
            'SETTINGS_SUB_PANEL_SOCIAL_MEDIA_PROFILE': '/node/19197',
            'SETTINGS_SUB_PANEL_MOBILE_RESET_LAYOUT': '/node/19198',
            'SIDE_PANEL_MobileDesignPanel': '/node/1486',
            'CHOOSE_STYLE_TinyMenu': '/node/18239',
            'ADVANCED_STYLING_TinyMenu': '/node/18239',
            'SIDE_PANEL_MobileSettingsPanel': '/node/1489',
            'SIDE_PANEL_MobileHiddenElementsPanel': '/node/19199',
            'SETTINGS_SUB_PANEL_PRELOADER': '/node/19981',
            'COMPONENT_PANEL_ItunesButton': ['/node/18589'],
            'COMPONENT_PANEL_PinterestFollow': ['/node/18020'],
            'COMPONENT_PANEL_VKShareButton': ['/node/18017'],
            'COMPONENT_PANEL_FacebookShare': '/node/18018',
            'COMPONENT_PANEL_HeaderVerificationTags_learn_more': '/node/20501',
            'COMPONENT_PANEL_HeaderVerificationTags_on_errors_learn_more': '/node/21002',
            'APP_MARKET_Help_Icon': '/termpage/4834',
            'ANIMATION_DIALOG': '/node/21217',
            'MOBILE_PAGE_SETTINGS_SUB_PANEL': '/node/21865',
            'BACK_TO_TOP_LearnMore': '/node/21901',
            'SiteAdressOpenHelpForRegruDomainCampaign': '/node/22538'

        }
    },

    COMPONENT_TOOLTIPS_MAP: {
        'wysiwyg.editor.components.panels.ClipArtMenuPanel': {
            'link': 'Social_Widgets_Only_On_Public'
        }
    },

    COMPONENT_SECTIONS: {
        type: 'PropertyList',
        items: [
            // text
            {
                'type': 'Button',
                'iconSrc': 'buttons/richtext.png',
                'toggleMode': false,
                'label': 'TEXT',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter: 'text'

            },
            // Image
            {
                'type': 'Button',
                'iconSrc': 'buttons/add_media_01.png',
                'toggleMode': false,
                'label': 'IMAGE',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter: 'image'

            },
            // gallery
            {
                'type': 'Button',
                'iconSrc': 'buttons/gallery_group.png',
                'toggleMode': false,
                'label': 'GALLERY_COMP',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter: 'gallery'
            },
            // media
            {
                'type': 'Button',
                'iconSrc': 'buttons/media_group.png',
                'toggleMode': false,
                'label': 'MEDIA',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter: 'media'

            },
            // shapes and boxes (areas)
            {
                'type': 'Button',
                'iconSrc': 'buttons/shapes_group.png',
                'toggleMode': false,
                'label': 'AREAS',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter: 'areas'
            },
            // buttons and menu
            {
                'type': 'Button',
                'iconSrc': 'buttons/buttons_menus_group.png',
                'toggleMode': false,
                'label': 'BUTTONS_AND_MENUS',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter: 'buttons'
            },
            // blog
            {
                "type": "Button",
                "iconSrc": "buttons/add_blog.png",
                "toggleMode": false,
                "label": "BLOG_PANEL_SECTIONS",
                "command": "WEditorCommands.AddWixApp",
                "commandParameter": {showCategory: "blog", widgetId: "31c0cede-09db-4ec7-b760-d375d62101e6", labels: {active: "ADD_COMP_TITLE_blog", notActive: "BLOG_PANEL_SECTIONS"}, appPackageName: "blog"}
            },
            // e-commerce
            {
                'type': 'Button',
                'iconSrc': 'buttons/add_ecom.png',
                'toggleMode': false,
                'label': 'ECOM_PANELS_SECTION',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter: 'ecom'
            },
            // social
            {
                'type': 'Button',
                'iconSrc': 'buttons/add_socialbar_icon.png',
                'toggleMode': false,
                'label': 'SOCIAL',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter: 'social'

            },
            // add-ons
            {
                'type': 'Button',
                'iconSrc': 'buttons/add_apps_icon.png',
                'toggleMode': false,
                'label': 'WIDGETS',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter: 'widgets'
            },
            // app builder
            {
                'type': 'Button',
                'iconSrc': 'buttons/appbuilder_list.png',
                'toggleMode': false,
                'label': 'WIX_APPS_BUILDER_LIST',
                'command': 'WAppsEditor2Commands.CreateAppFromTemplate',
                commandParameter: { type: "list" }
            }
        ]
    },

    CURRENCY_DATA: [
        {value: "USD", symbol: "$", label: "U.S. Dollars"},
        {value: "EUR", symbol: "€", label: "Euros"},
//      Currently Not supported By PayPal  {value: "ARS", symbol: "$", label:  "Argentine peso"},
        {value: "AUD", symbol: "$", label: "Australian Dollars"},
        {value: "BRL", symbol: "R$", label: "Brazilian Real"},
        {value: "CAD", symbol: "$", label: "Canadian Dollars"},
//      Currently Not supported By PayPal        {value: "CLP", symbol: "$", label:  "Chilean peso"},
        {value: "CZK", symbol: "Kc", label: "Czech Koruna"},
        {value: "DKK", symbol: "kr", label: "Danish Krone"},
        {value: "HKD", symbol: "$", label: "Hong Kong Dollar"},
        {value: "HUF", symbol: "Ft", label: "Hungarian Forint"},
        {value: "ILS", symbol: "₪", label: "Israeli New Sheqel"},
        {value: "JPY", symbol: "¥", label: "Japanese Yen"},
        {value: "MXN", symbol: "$", label: "Mexican Peso"},
        {value: "NOK", symbol: "kr", label: "Norwegian Krone"},
        {value: "MYR", symbol: "RM", label: "Malaysian Ringgit"},
        {value: "NZD", symbol: "$", label: "New Zealand Dollar"},
        {value: "PHP", symbol: "₱", label: "Philippine Peso"},
        {value: "PLN", symbol: "zł", label: "Polish Zloty"},
        {value: "GBP", symbol: "£", label: "Pounds Sterling"},
        {value: "SGD", symbol: "$", label: "Singapore Dollar"},
        {value: "SEK", symbol: "kr", label: "Swedish Krona"},
        {value: "CHF", symbol: "CHF", label: "Swiss Franc"},
        {value: "TWD", symbol: "$", label: "Taiwan New Dollar"},
        {value: "THB", symbol: "THB", label: "Thai Baht"},
        {value: "TRY", symbol: "TL", label: "Turkish Lira"},
        {value: "RUB", symbol: "руб", label: "Russian Ruble"}
    ],

    LINK_BUTTONS_TYPE: {
        type: 'PropertyList',
        items: [
            {   buttonLabel: 'LINK_DLG_WEB_ADDRESS', spriteOffset: {x: 0, y: 0}, linkType: 'WEBSITE',
                onCreateCB: function (webBtn) {
                    webBtn.setFocus();
                }
            },
            {buttonLabel: 'LINK_DLG_PAGE', spriteOffset: {x: 0, y: -18}, linkType: 'PAGE'},
            {buttonLabel: 'LINK_DLG_EMAIL', spriteOffset: {x: 0, y: -36}, linkType: 'EMAIL'},
            {buttonLabel: 'LINK_DLG_DOCUMENT', spriteOffset: {x: 0, y: -54}, linkType: 'DOCUMENT'},
            {buttonLabel: 'Anchor_DIALOG_PAGE_TOP', spriteOffset: {x: 0, y: -98}, linkType: 'ANCHOR_TOP'},
            {buttonLabel: 'Anchor_DIALOG_PAGE_BOTTOM', spriteOffset: {x: 0, y: -122}, linkType: 'ANCHOR_BOTTOM'},
            {buttonLabel: 'LINK_DLG_ANCHOR', spriteOffset: {x: 0, y: -75}, linkType: 'ANCHOR'}
        ],
        dataSchemaByType: {
            WEBSITE: "ExternalLink",
            PAGE: "PageLink",
            EMAIL: "EmailLink",
            DOCUMENT: "DocumentLink",
            LOGIN: "LoginToWixLink",
            ANCHOR: "AnchorLink",
            ANCHOR_BOTTOM: "AnchorLink_bottom",
            ANCHOR_TOP: "AnchorLink_top"
        }
    },

    TOP_TABS_MOBILE: {
        type: 'PropertyList',
        items: [
            {name: 'Pages',             label: 'SIDE_BTN_PAGES',            labelType: 'langKey', id: 'tbPages',                command: 'WEditorCommands.Pages',                commandParameter: 'pagesPanel'},
            {name: 'Mobile Design',     label: 'SIDE_BTN_MOBILE_DESIGN',    labelType: 'langKey', id: 'tbMobileDesign',         command: 'WEditorCommands.MobileDesign',         commandParameter: 'mobileDesignPanel'},
            {name: 'Mobile Add',        label: 'SIDE_BTN_ADD',              labelType: 'langKey', id: 'tbMobileAdd',            command: 'WEditorCommands.MobileAdd',            commandParameter: 'mobileAddPanel'},
            {name: 'Mobile Market',     label: 'SIDE_BTN_MARKET',           labelType: 'langKey', id: 'tbMobileMarket',         command: 'WEditorCommands.MobileMarket',         commandParameter:'mobileMarketPanel'},
            {name: 'Mobile Settings',   label: 'SIDE_BTN_MOBILE_SETTINGS',  labelType: 'langKey', id: 'tbMobileSettings',       command: 'WEditorCommands.MobileSettings',       commandParameter: 'mobileSettingsPanel'}
        ]
    },

    MOBILE_SETTINGS_PANEL: {
        type: 'PropertyList',
        items: [
            {'type'         : 'Button',
                'iconSrc'   : 'buttons/mobile_view.png',
                'toggleMode': false,
                'label'     : 'MOBILE_VIEW_SELECTOR',
                'command'   : 'WEditorCommands.ShowMobileViewSelector'
            },
            {'type'         : 'Button',
                'iconSrc'   : 'buttons/mobile_preloader_panel_icon.png',
                'toggleMode': false,
                'label'     : 'MOBILE_PRELOADER_TITLE',
                'command'   : 'WEditorCommands.ShowMobilePreloaderPanel'
            }
        ]
    },

    MOBILE_ADD_PANELS: {
        type : 'PropertyList',
        items: [
            {
                'type'         : 'Button',
                'iconSrc'   : 'buttons/quick_actions_icon.png',
                'toggleMode': false,
                'label'     : 'MOBILE_ACTION_BAR_TITLE',
                'command'   : 'WEditorCommands.ShowMobileQuickActionsView'
            },
            {
                'type'      : 'Button',
                'iconSrc'   : 'buttons/back-to-top.png',
                'toggleMode': false,
                'label'     : 'BACK_TO_TOP_BUTTON',
                'command'   : 'WEditorCommands.ShowMobileBackToTopButtonPanel'
            },
            {
                'type'      : 'Button',
                'iconSrc'   : 'buttons/hidden_elements.png',
                'toggleMode': false,
                'label'     : 'HIDDEN_ITEMS_BUTTON',
                'commandParameter'  : 'mobileHiddenElementsPanel',
                'command'   : 'WEditorCommands.MobileHiddenElements'
            }
        ]
    },

    MOBILE_ADD_SUB_PANELS: {
        type : 'PropertyList',
        items: []
    },

    MOBILE_DESIGN_SUB_PANELS: {
        type: 'PropertyList',
        items: [
            {
                'type': 'Button',
                'iconSrc': 'buttons/mobile_menu_icon.png',
                'toggleMode': false,
                'label': 'MOBILE_MENU',
                'command': 'WEditorCommands.ShowMobileMenuPropertyPanel',
                commandParameter: {src: ''}
            },
            {
                'type': 'Button',
                'iconSrc': 'buttons/mobile_bg_icon.png',
                'toggleMode': false,
                'label': 'MOBILE_BACKGROUND',
                'command': 'WEditorCommands.ShowMobileBackgroundEditorPanel',
                commandParameter: {src: 'design_mobile'}
            }
        ]
    }


});