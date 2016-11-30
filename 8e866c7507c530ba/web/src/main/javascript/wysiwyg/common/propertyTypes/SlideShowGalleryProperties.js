define.dataSchema('SlideShowGalleryProperties', {
    'extends' : "GalleryExpandProperties",
    'imageMode': {
        "type": "string",
        "default": "clipImage",
        "enum": ["clipImage", "flexibleHeight", "flexibleWidthFixed"]
    },

    'transition': {
        'type': "string",
        'enum': ['none', 'swipeVertical', 'swipeHorizontal', 'crossfade', 'outIn' ],
        'default': 'swipeHorizontal',
        'description': 'Transition between items of the gallery'
    },

    'autoplayInterval': {
        'type': "number",
        'default': "5",
        'minimum': 0.0,
        'maximum': 30.0,
        'description': "Autplay interval"
    },

    'autoplay': {
        'type': "boolean",
        'default': false,
        'description': ''
    },

    'transDuration': {
        'type': "number",
        'minimum': 0.0,
        'maximum': 5.0,
        'default': 1.0,
        'description': "Duration of the transition in sec"
    },

    'bidirectional': {
        'type': "boolean",
        'default': true,
        'description': "Decides whether the transition direction reflects Prev/Next"
    },

    'reverse': {
        'type': "boolean",
        'default': false,
        'description': "If bidirectional, inverts the direction of transitions"
    },

    /**
     * Skin parts visibility
     */

    'showAutoplay' : {
        'type': "boolean",
        'default': true,
        'description': ''
    },

    'showNavigation' : {
        'type': "boolean",
        'default': true,
        'description': ''
    },

    'showCounter' : {
        'type': "boolean",
        'default': true,
        'description': ''
    }
});