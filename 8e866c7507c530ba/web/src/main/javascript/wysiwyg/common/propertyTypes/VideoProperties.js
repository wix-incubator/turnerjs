define.dataSchema('VideoProperties', {
    autoplay: {
        'type': 'boolean',
        'default': false,
        'description': 'video autoplay on load'
    },
    loop: {
        'type': 'boolean',
        'default': false,
        'description': 'play video in a loop'
    },
    showinfo: {
        'type': 'boolean',
        'default': false,
        'description': 'show video title and author'
    },
    lightTheme: {
        'type': 'boolean',
        'default': false,
        'description': 'show video with light theme'
    },

    showControls: {
        'type': 'string',
        'enum': ['always_show', 'always_hide', 'temp_show'],
        'default': 'always_show',
        'description': 'show / hide controls'
    }

});