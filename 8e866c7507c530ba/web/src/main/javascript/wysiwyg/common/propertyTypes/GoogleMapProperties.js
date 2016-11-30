define.dataSchema('GoogleMapProperties', {
    showZoom: {
        'type': 'boolean',
        'default': true,
        'description': 'show zoom control'
    },
    showPosition: {
        'type': 'boolean',
        'default': true,
        'description': 'show position control'
    },
    showStreetView: {
       'type': 'boolean',
        'default': true,
        'description': 'show Street View control'
    },
    showMapType: {
        'type': 'boolean',
        'default': true,
        'description': 'show map type control'
    },
    mapDragging: {
        'type': 'boolean',
        'default': true,
        'description': 'show map type control'
    },
    mapType: {
        'type': 'string',
        'enum': ['ROADMAP', 'TERRAIN', 'SATELLITE', 'HYBRID'],
        'default': 'ROADMAP',
        'description': 'show zoom control'
    },
    language: {
        'type': 'string',
        'enum': ['userLang', 'da', 'de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'no', 'pl', 'pt', 'ru', 'sv', 'tr'],
        'default': 'en',
        'description': 'Possible languages taken from https://developers.google.com/maps/faq?hl=en#languagesupport'
    }
});
