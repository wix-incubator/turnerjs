define.dataSchema('SingleAudioPlayer', {
    'uri': {
        'type': 'string',
        'default': '',
        'description': 'MP3 uri'
    },
    'originalFileName': {
        'type': 'string',
        'default': '',
        'description': 'Original MP3 file name'
    },
    'artist': {
        'type': 'string',
        'default': 'Artist name',
        'description': 'Artist Name'
    },
    track: {
        'type': 'string',
        'default': 'Track name',
        'description': 'Track Name'
    }
});