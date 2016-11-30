define.dataSchema('YouTubeSubscribeButtonProperties', {
    layout: {
        'type': 'string',
        'enum': ['default','full'],
        'default': 'full',
        'description': 'the layout of the youtube subscribe button'
    },
    theme: {
        'type': 'string',
        'enum': ['light','dark'],
        'default': 'light',
        'description': 'the theme of the youtube subscribe button'
    }
});

