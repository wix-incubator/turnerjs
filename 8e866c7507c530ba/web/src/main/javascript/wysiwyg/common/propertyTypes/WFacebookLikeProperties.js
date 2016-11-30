define.dataSchema('WFacebookLikeProperties', {
    layout: {
        'type': 'string',
        'enum': ['standard', 'button_count', 'box_count'],
        'default': 'standard',
        'description': 'the layout of the button'
    },

    send: {
        'type': 'boolean',
        'default': false,
        'description': 'enable/disable the send button'
    },

    //works only in standard mode
    show_faces: {
        'type': 'boolean',
        'default': false,
        'description': 'show the faces of your friends that liked this item'
    },

    // when width not defined, it is automatically set according the the layout
    width: {
        'type': 'string',
        'default': '225',
        'description': 'the width of the Like button'
    },
    action: {
        'type': 'string',
        'enum': ['like', 'recommend'],
        'default': 'like',
        'description': ' the verb to display on the button. Options: *like*, *recommend*'
    },
    font: {
        'type': 'string',
        'enum': ['helvetica', 'arial', 'lucida grande','segoe ui','tahoma','trebuchet ms','verdana'],
        'default': 'helvetica',
        'description':  'the font to display in the button'
    },
    colorScheme : {
        'type': 'string',
        'enum': ['light', 'dark'],
        'default': 'light',
        'description':  'the color scheme for the like button'
    },
    language: {
        'type': 'string',
        'enum': ['userLang', 'en', 'es', 'pt', 'fr', 'ru', 'pl', 'ja', 'kr', 'sv', 'nl', 'de', 'no', 'it', 'tr'],
        'default': 'en'
    }
});

