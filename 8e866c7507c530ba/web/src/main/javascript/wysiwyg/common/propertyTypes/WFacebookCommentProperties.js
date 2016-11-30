define.dataSchema('WFacebookCommentProperties', {
    numPosts: {
        'type': 'number',
        'default': 2,
        'minimum': 0,
        'maximum': 10,
        'description': 'the number of posts display by default'
    },

    width: {
        'type': 'number',
        'default': '555',
        'description': 'the width of the plugin, in pixels'
    },

    colorScheme : {
        'type': 'string',
        'enum': ['light', 'dark'],
        'default': 'light',
        'description':  'the color scheme of the plugin'
    },

    canBeShownOnAllPagesBug: {
        'type': 'boolean',
        'default': false,
        'description': 'The component was added after the bug who-145 fix, and will be shown on all pages'
    }
});

