define.dataSchema('SingleAudioPlayerProperties', {
    'volume': {
        'type': 'number',
        'default': 50,
        'description': 'Volume'
    },
    'autoplay': {
        'type': 'Boolean',
        'default': false,
        'description': 'Autoplay MP3'
    },
    'loop': {
        'type': 'Boolean',
        'default': false,
        'description': 'Loop MP3'
    },
    'showArtist': {
        'type': 'Boolean',
        'default': true,
        'description': 'Display Artist'
    },
    'showTrack': {
        'type': 'Boolean',
        'default': true,
        'description': 'Display Track'
    }
});

