define.dataSchema('PaginatedGridGalleryProperties', {
    'extends' : "GalleryExpandProperties",

    /* imageMode ignored, kept for compatibility with MatrixGallery */
    imageMode: {
        "type": "string",
        "default": "clipImage",
        'enum': ["clipImage"]
    },

    numCols:   {
        "type": "number",
        "default": 3,
        "description":"Number of columns",
        'minimum': 1,
        'maximum': 10
    },

    maxRows:   {
        "type": "number",
        "default": 3,
        "description":"Maximum number of rows" ,
        'minimum': 1,
        'maximum': 10
    },
    margin:    {
        "type": "number",
        "default": 0,
        "description":"Margin around each item" ,
        'minimum': 0,
        'maximum': 250
    },

    transition:{
        "type": "string",
        "default": "seq_crossFade_All",
        "enum" : [
            "none",
            "seq_crossFade_All",
            "seq_shrink_All",
            "swipe_horiz_All",
            "swipe_vert_All",
            "seq_random"
        ]
    },

    'transDuration': {
        'type': "number",
        'minimum': 0.0,
        'maximum': 5.0,
        'default': 1.0,
        'description': "Duration of the transition in sec"
    },

    'autoplayInterval': {
        'type': "number",
        'default': 3.0,
        'minimum': 0.0,
        'maximum': 30.0,
        'description': "Autplay interval"
    },

    'autoplay': {
        'type': "boolean",
        'default': false,
        'description': ''
    },

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