define.experiment.newDataItem('QUICK_ACTIONS_EXTRA_SEARCH_WORDS.QuickActions', function (experimentStrategy) {
    return {
        type: 'PropertyList',
        items: {
            'text': ['word', 'write', 'label'],
            'listBuilder': ['portfolio', 'video', 'news', 'faq', 'events', 'menu', 'index'],
            'image': ['photo', 'picture', 'icon', 'photograph', 'portrait'],
            'media': ['multimedia'],
            'areas': ['draw', 'rule', 'divider'],
            'buttons': ['link', 'bar', 'navigation'],
            'blog': ['post'],
            'ecom': ['shop', 'ecommerce', 'sell'],
            'appbuilder': ['portfolio', 'video reel', 'news update', 'faq', 'events', 'menu', 'index']
        }
    };
});

define.experiment.newDataItem('QUICK_ACTIONS_SHORTCUTS.QuickActions', function (experimentStrategy) {
    return {
        type: 'PropertyList',
        items: [
//            {
//                title: 'QUICK_ACTIONS_MANAGE_IMAGES',
//                icon: 'toptoolbar/quickactions/shortcutsGray.png',
//                command: 'QuickActionsCommand.OpenMediaFrame',
//                commandParameter: {},
//                extraSearchWords: ['photo']
//            },
            {
                title: 'QUICK_ACTIONS_PAGES_PANEL',
                icon: 'toptoolbar/quickactions/pages.png',
                command: 'WEditorCommands.Pages',
                extraSearchWords: ['']
            },
            {
                title: 'QUICK_ACTIONS_PAGE_TRANSITION',
                icon: 'toptoolbar/quickactions/pages.png',
                command: 'WEditorCommands.Pages',
                extraSearchWords: ['']
            },
//            {
//                title: 'QUICK_ACTIONS_PAGE_SETTINGS',
//                icon: 'toptoolbar/quickactions/settings.png',
//                command: 'WEditorCommands.PageSettings',
//                commandParameter: {},
//                extraSearchWords: ['protect', 'seo']
//            },
            {
                title: 'QUICK_ACTIONS_ADD_PAGE',
                icon: 'toptoolbar/quickactions/pages.png',
                command: 'WEditorCommands.AddPageDialog',
                commandParameter: {},
                extraSearchWords: ['']
            },
            {
                title: 'QUICK_ACTIONS_DELETE_PAGE',
                icon: 'toptoolbar/quickactions/pages.png',
                command: 'QuickActionsCommand.DeleteCurrentPage',
                commandParameter: {},
                extraSearchWords: ['']
            },
            {
                title: 'QUICK_ACTIONS_SETTINGS_PANEL',
                icon: 'toptoolbar/quickactions/settings.png',
                command: 'WEditorCommands.Settings',
                extraSearchWords: ['']
            },
            {
                title: 'QUICK_ACTIONS_SITE_ADDRESS',
                icon: 'buttons/site_name.png',
                command: 'QuickActionsCommand.ShowSiteName',
                commandParameter: {},
                extraSearchWords: ['settings', 'url']
            },
            {
                title: 'QUICK_ACTIONS_MANAGE_SEO',
                icon: 'buttons/seo.png',
                command: 'QuickActionsCommand.ShowSEO',
                commandParameter: {},
                extraSearchWords: ['settings', 'search engine', 'google']
            },
            {
                title: 'QUICK_ACTIONS_SOCIAL_SETTINGS',
                icon: 'buttons/social_settings.png',
                command: 'QuickActionsCommand.ShowSocial',
                commandParameter: {},
                extraSearchWords: ['settings']
            },
            {
                title: 'QUICK_ACTIONS_SITE_STATISTICS',
                icon: 'buttons/statistics.png',
                command: 'QuickActionsCommand.ShowStatistics',
                commandParameter: {},
                extraSearchWords: ['settings']
            },
            {
                title: 'QUICK_ACTIONS_FAVICON',
                icon: 'buttons/favicon_thumbnail.png',
                command: 'QuickActionsCommand.ShowFaviconAndThumbnail',
                commandParameter: {},
                extraSearchWords: ['settings', 'tab', 'icon']
            },
            {
                title: 'QUICK_ACTIONS_DESIGN_PANEL',
                icon: 'toptoolbar/quickactions/design.png',
                command: 'WEditorCommands.Design',
                commandParameter: {},
                extraSearchWords: ['']
            },
            {
                title: 'QUICK_ACTIONS_CHANGE_BACKGROUND',
                icon: 'buttons/design_background.png',
                command: 'WEditorCommands.ShowBackgroundDesignPanel',
                commandParameter: {src: 'quick_actions'},
                extraSearchWords: ['design']
            },
            {
                title: 'QUICK_ACTIONS_CHANGE_COLORS',
                icon: 'buttons/design_colors.png',
                command: 'WEditorCommands.ShowColorsPanel',
                commandParameter: {},
                extraSearchWords: ['design', 'palettes', 'skins', 'themes']
            },
            {
                title: 'QUICK_ACTIONS_CHANGE_FONTS',
                icon: 'buttons/design_fonts.png',
                command: 'WEditorCommands.ShowFontsPanel',
                commandParameter: {},
                extraSearchWords: ['design']
            },
            // permanent 'Search App Market' action
            {
                title: 'QUICK_ACTIONS_SEARCH_TPA',
                icon: 'buttons/appmarket_grey.png',
                command: 'WEditorCommands.Market',
                commandParameter: { searchTag: '' },
                extraSearchWords: [''],
                isPermanent: true,
                updateWithQuery: true,
                queryParameterName: 'searchTag',
                category: 'APP_MARKET'
            },
            // permanent 'Search Help Center' action
            {
                title: 'QUICK_ACTIONS_SEARCH_HELP_CENTER',
                icon: 'toptoolbar/quickactions/helpCenter.png',
                command: 'QuickActionsCommand.SearchHelpDialog',
                commandParameter: { searchTag: '' },
                extraSearchWords: [''],
                isPermanent: true,
                updateWithQuery: true,
                queryParameterName: 'searchTag',
                category: 'HELP'
            },
            {
                title: 'QUICK_ACTIONS_UPGRADE',
                icon: 'toptoolbar/quickactions/shortcutsGray.png',
                command: 'WEditorCommands.UpgradeToPremium',
                commandParameter: {'referralAdditionalInfo':"Quick Find"},
                extraSearchWords: ['']
            }
        ]
    };
});

define.experiment.newDataItem('QUICK_ACTIONS_CATEGORIES.QuickActions', function (experimentStrategy) {
    return {
        type: 'PropertyList',
        items: [
            {
                id: 'ADD',
                name: 'SIDE_BTN_ADD',
                icon: 'toptoolbar/quickactions/add.png',
                color: '#8452de'
            },
            {
                id: 'APP_MARKET',
                name: 'SIDE_BTN_MARKET',
                icon: 'buttons/appmarket_grey.png',
                color: '#b50b4a'
            },
            {
                id: 'SHORTCUTS',
                name: 'SHORTCUTS',
                icon: 'toptoolbar/quickactions/shortcuts.png',
                color: '#67bd56'
            },
            {
                id: 'HELP',
                name: 'IFRAME_HELP_TITLE',
                icon: 'toptoolbar/quickactions/helpCenter.png',
                color: '#2098ea'
            }
        ]
    };
});

define.experiment.newDataItem('QUICK_ACTIONS_RATING.QuickActions', function (experimentStrategy) {
    return {
        type: 'PropertyList',
        items: {
            'addFlickrBadge': 0.3,
            'ecomGallery': 0.3
        }
    }
});
