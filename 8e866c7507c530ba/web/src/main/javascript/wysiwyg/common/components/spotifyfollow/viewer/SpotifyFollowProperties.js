define.dataSchema('SpotifyFollowProperties',
    {
        'size': {
            'type': 'string',
            'enum': ['small', 'large'],
            'default': 'large'
        },
        theme: {
            'type': 'string',
            'enum': ['light', 'dark'],
            'default': 'light'
        },
        showFollowersCount: {
            'type': 'boolean',
            'default': 'true'
        }
    }
);

