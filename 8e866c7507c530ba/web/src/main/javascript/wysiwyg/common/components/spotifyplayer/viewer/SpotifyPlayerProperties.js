define.dataSchema('SpotifyPlayerProperties', {
    size: {
        'type': 'string',
        'enum': ['compact', 'large'],
        'default': 'compact',
        'description': 'Size of the player'
    },
    color: {
        'type': 'string',
        'enum': [
            { label: 'dark', value: 'black' },
            { label: 'light', value: 'white' }
        ],
        'default': 'black',
        'description': 'Theme of the player'
    },
    style: {
        'type': 'string',
        'enum': ['list', 'coverart'],
        'default': 'list',
        'description': 'Style of the player'
    }
});

