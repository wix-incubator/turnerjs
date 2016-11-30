define.experiment.dataItem('COMPONENT_SECTIONS.AppsOpenAppMarket', function (experimentStrategy) {
        return {items:[
            // text
            {
                'type': 'Button',
                'iconSrc': 'buttons/richtext.png',
                'toggleMode': false,
                'label': 'TEXT',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter : 'text'

            },
            // Image
            {
                'type': 'Button',
                'iconSrc': 'buttons/add_media_01.png',
                'toggleMode': false,
                'label': 'IMAGE',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter : 'image'

            },
            // gallery
            {
                'type': 'Button',
                'iconSrc': 'buttons/gallery_group.png',
                'toggleMode': false,
                'label': 'GALLERY_COMP',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter : 'gallery'
            },
            // media
            {
                'type': 'Button',
                'iconSrc': 'buttons/media_group.png',
                'toggleMode': false,
                'label': 'MEDIA',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter : 'media'

            },
            // shapes and boxes (areas)
            {
                'type': 'Button',
                'iconSrc': 'buttons/shapes_group.png',
                'toggleMode': false,
                'label': 'AREAS',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter : 'areas'
            },
            // buttons and menu
            {
                'type': 'Button',
                'iconSrc': 'buttons/buttons_menus_group.png',
                'toggleMode': false,
                'label': 'BUTTONS_AND_MENUS',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter : 'buttons'
            },
            // e-commerce
            {
                'type': 'Button',
                'iconSrc': 'buttons/add_ecom.png',
                'toggleMode': false,
                'label': 'ECOM_PANELS_SECTION',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter : 'ecom'
            },
            // social
            {
                'type': 'Button',
                'iconSrc': 'buttons/add_socialbar_icon.png',
                'toggleMode': false,
                'label': 'SOCIAL',
                'command': 'WEditorCommands.ShowComponentCategory',
                commandParameter : 'social'

            },

            // add-ons
            {
                'type': 'Button',
                'iconSrc': 'buttons/appmarket_grey.png',
                'toggleMode': false,
                'label': 'WIDGETS',
                'command': 'WEditorCommands.Market',
                commandParameter: 'widgets'
            }
        ]
};});