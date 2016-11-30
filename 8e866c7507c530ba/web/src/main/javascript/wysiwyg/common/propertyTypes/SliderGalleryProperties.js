define.dataSchema('SliderGalleryProperties', {
    'extends' : "GalleryExpandProperties",
    'imageMode': {
        "type": "string",
        "default": "clipImage",
        "enum": ["clipImage", "flexibleWidth"]
    },
    
    'margin': {
        "type": "number",
        "default": 15,
        "description":"Margin around each item" ,
        'minimum': 0,
        'maximum': 250
    },

    'maxSpeed': {
        'type': "number",
        'default': "5",
        'minimum': 1.0,
        'maximum': 30.0,
        'description': "Speed"
    },

    'aspectRatio': {
        'type': "number",
        'minimum': 0.1,
        'maximum': 3.0,
        'default': 1.0,
        'description': ''
    },

    'aspectRatioPreset' : {
        'type' : "string",
        'enum' : [ "16:9","4:3", "1:1", "3:4", "9:16" ],
        'default' : "4:3"
    },

    'loop': {
        'type': "boolean",
        'default': true,
        'description': ''
    },

    'showCounter': {
        'type': "boolean",
        'default': true,
        'description': ''
    }

});