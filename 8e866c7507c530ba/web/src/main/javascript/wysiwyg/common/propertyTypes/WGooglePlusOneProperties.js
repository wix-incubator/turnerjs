define.dataSchema('WGooglePlusOneProperties', {
    size: {
        'type': 'string',
        'enum': ['small', 'medium', 'standard','tall'],
        'default': 'standard',
        'description': 'The button size to render'
    },

    annotation: {
        'type': 'string',
        'enum': ['none', 'bubble','inline'],
        'default': 'inline',
        'description': 'The annotation to display next to the button.'
    },

    width: {
            'type': 'string',
            'default': '',
            'description': 'If annotation is set to *inline*, the width in pixels to use for the button and its inline annotation. If omitted, a button and its inline annotation use 450px.'
    }
});

