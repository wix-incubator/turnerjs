define.dataSchema('FacebookLikeBox', {
    facebookPageId: {
        'type': 'string',
        'default': 'wix',
        'description': 'Facebook page id'
    },
    showFaces: {
        'type': 'boolean',
        'default': 'true',
        'description': 'Show profile photos in the plugin'
    },
    colorScheme: {
        'type': 'string',
        'default': 'light',
        'enum':['light', 'dark'],
        'description': 'The color scheme of the plugin. Note that the background is always transparent to match your background color. This setting changes the foreground colors to work well on light or dark backgrounds.'
    },
    showStream: {
        'type': 'boolean',
        'default': 'true',
        'description': 'Show the profile stream for the public profile'
    },
    showBorder: {
        'type': 'boolean',
        'default': 'true',
        'description': 'Show a border around the plugin'
    },
    showHeader: {
        'type': 'boolean',
        'default': 'true',
        'description': 'Show the "Find us on Facebook" bar at top. Only shown when either stream or faces are present'
    }
});