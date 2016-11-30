define.dataSchema('LinkBarProperties', {
    gallery:        { 'type': 'string', 'default': 'clipart', 'description': 'gallery type (photos, icons, backgrounds, etc..)' },
    iconSize:       { 'type': 'number', 'default': 30, 'description': 'Icon Size', 'minimum':16, 'maximum': 128 },
    spacing:        { "type": "number", "default": 5, "description" : "Spacing" , 'minimum': 1, 'maximum': 50 },
    bgScale:        { "type": "number", "default": 1, "description" : "Background scale" , 'minimum': 0, 'maximum': 2 },
    orientation:    { 'type': 'string', 'enum': ['HORIZ', 'VERT'], 'default': 'HORIZ', 'description': 'Orientation' }
});